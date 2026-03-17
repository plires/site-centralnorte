<?php

namespace App\Services;

use App\Enums\BudgetStatus;
use App\Mail\NewQuoteRequestClientMail;
use App\Mail\NewQuoteRequestMail;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Client;
use App\Models\Product;
use App\Models\SellerAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PublicQuoteService
{
    /**
     * Crear un presupuesto desde el sitio público
     *
     * @param array $customerData Datos del cliente
     * @param array $cartItems Items del carrito
     * @param string|null $comments Comentarios adicionales
     * @return Budget
     * @throws \Exception
     */
    public function createQuoteFromCart(array $customerData, array $cartItems, ?string $comments = null): Budget
    {
        return DB::transaction(function () use ($customerData, $cartItems, $comments) {
            // 1. Buscar o crear/restaurar cliente
            $client = $this->findOrCreateClient($customerData);

            // 2. Determinar vendedor
            //
            // Si el cliente ya tiene un vendedor asignado y ese vendedor está activo
            // (la relación user() aplica el scope de soft-delete automáticamente),
            // se respeta la asignación existente.
            //
            // En cualquier otro caso (cliente nuevo, sin vendedor asignado, o con
            // vendedor soft-deleted), se asigna mediante round-robin y se actualiza
            // el user_id del cliente también.
            $seller = $client->user_id ? $client->user : null;

            if (!$seller) {
                $seller = SellerAssignment::getNextSeller('merch_budget');

                if (!$seller) {
                    throw new \Exception('No hay vendedores disponibles para asignar el presupuesto.');
                }

                $client->update(['user_id' => $seller->id]);
                $sellerSource = 'round-robin';
            } else {
                $sellerSource = 'existing-assignment';
            }

            // 3. Crear el presupuesto
            $budget = Budget::create([
                'budget_merch_number' => Budget::generateBudgetMerchNumber(),
                'title'          => $this->generateBudgetTitle($client),
                'user_id'        => $seller->id,
                'client_id'      => $client->id,
                'issue_date'     => now(),
                'expiry_date'    => now()->addDays(config('business.budget.default_validity_days', 15)),
                'status'         => BudgetStatus::UNSENT,
                'footer_comments' => $comments,
            ]);

            // 4. Crear los items del presupuesto
            $this->createBudgetItems($budget, $cartItems);

            // 5. Calcular totales
            $budget->calculateTotals();

            // 6. Enviar notificación al vendedor y confirmación al cliente
            $this->notifySeller($budget, $seller);
            $this->notifyClient($budget);

            Log::info('Presupuesto creado desde sitio público', [
                'budget_id'     => $budget->id,
                'client_id'     => $client->id,
                'seller_id'     => $seller->id,
                'seller_source' => $sellerSource,
                'items_count'   => count($cartItems),
            ]);

            return $budget;
        });
    }

    /**
     * Buscar cliente por email (incluyendo soft-deleted) o crear uno nuevo.
     *
     * - Si existe y está activo: actualiza solo los campos que llegan con valor.
     * - Si existe pero está soft-deleted: lo restaura y actualiza solo los campos con valor.
     * - Si no existe: crea un nuevo registro.
     *
     * Esto evita duplicados de email y el error "Ya existe otro cliente con este correo".
     */
    private function findOrCreateClient(array $data): Client
    {
        // withTrashed() para detectar también clientes soft-deleted
        $client = Client::withTrashed()->where('email', $data['email'])->first();

        if ($client) {
            // Si estaba borrado, restaurarlo antes de actualizar
            if ($client->trashed()) {
                $client->restore();
            }

            // Actualizar solo los campos que lleguen con un valor no nulo/vacío
            $updates = array_filter([
                'name'    => $data['name'] ?? null,
                'company' => $data['company'] ?? null,
                'phone'   => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ], fn($value) => $value !== null && $value !== '');

            if (!empty($updates)) {
                $client->update($updates);
            }

            return $client->fresh();
        }

        // Crear nuevo cliente
        return Client::create([
            'name'    => $data['name'],
            'company' => $data['company'] ?? null,
            'email'   => $data['email'],
            'phone'   => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
        ]);
    }

    /**
     * Generar título para el presupuesto
     */
    private function generateBudgetTitle(Client $client): string
    {
        $date = now()->format('d/m/Y');
        $name = $client->company ?? $client->name;

        return "Cotización Web - {$name} - {$date}";
    }

    /**
     * Crear los items del presupuesto
     */
    private function createBudgetItems(Budget $budget, array $cartItems): void
    {
        // Ordenar items alfabéticamente por nombre de producto
        usort($cartItems, function ($a, $b) {
            return strcasecmp($a['productName'] ?? '', $b['productName'] ?? '');
        });

        $sortOrder = 0;

        foreach ($cartItems as $item) {
            // Obtener el precio del producto
            $product = Product::find($item['productId']);
            $unitPrice = $product?->last_price ?? 0;

            $budget->items()->create([
                'product_id' => $item['productId'],
                'product_variant_id' => $item['variantId'] ?? null,
                'quantity' => (int) $item['quantity'],
                'unit_price' => (float) $unitPrice,
                'production_time_days' => null,
                'logo_printing' => null,
                'line_total' => (int) $item['quantity'] * (float) $unitPrice,
                'sort_order' => $sortOrder++,
                'variant_group' => null,
                'is_variant' => false,
                'is_selected' => true,
            ]);
        }
    }

    /**
     * Enviar confirmación de recepción al cliente que originó la solicitud
     */
    private function notifyClient(Budget $budget): void
    {
        try {
            Mail::to($budget->client->email)->send(
                new NewQuoteRequestClientMail($budget)
            );

            Log::info('Confirmación de solicitud enviada al cliente', [
                'budget_id'    => $budget->id,
                'client_email' => $budget->client->email,
            ]);
        } catch (\Exception $e) {
            // No lanzar excepción si falla el envío de email
            // El presupuesto ya fue creado y el vendedor ya fue notificado
            Log::error('Error al enviar confirmación al cliente', [
                'budget_id' => $budget->id,
                'error'     => $e->getMessage(),
            ]);
        }
    }

    /**
     * Notificar al vendedor sobre el nuevo presupuesto
     */
    private function notifySeller(Budget $budget, $seller): void
    {
        try {
            $dashboardUrl = route('dashboard.budgets.show', $budget);

            Mail::to($seller->email)->send(
                new NewQuoteRequestMail($budget, $dashboardUrl)
            );

            Log::info('Notificación enviada al vendedor', [
                'budget_id' => $budget->id,
                'seller_email' => $seller->email,
            ]);
        } catch (\Exception $e) {
            // No lanzar excepción si falla el envío de email
            // El presupuesto ya fue creado
            Log::error('Error al enviar notificación al vendedor', [
                'budget_id' => $budget->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
