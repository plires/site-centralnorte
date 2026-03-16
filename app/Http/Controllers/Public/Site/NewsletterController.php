<?php

namespace App\Http\Controllers\Public\Site;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NewsletterController extends Controller
{
    /**
     * Suscribir un email al newsletter
     */
    public function subscribe(Request $request)
    {
        
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'source' => 'nullable|string|max:50',
        ]);

        try {
            // Verificar si ya existe
            $existing = NewsletterSubscriber::where('email', $validated['email'])->first();
            
            if ($existing) {
                // Si existe pero está inactivo, reactivar
                if (!$existing->is_active) {
                    $existing->update(['is_active' => true]);

                    // Sincronizar con Perfit
                    $this->syncToPerfit($existing);

                    return back()->with('success', '¡Te has suscripto nuevamente al newsletter!');
                }

                // Ya está suscripto y activo
                return back()->with('info', 'Este email ya está suscripto al newsletter.');
            }

            // Crear nueva suscripción
            $subscriber = NewsletterSubscriber::create([
                'email' => $validated['email'],
                'source' => $validated['source'] ?? 'home',
            ]);

            // Sincronizar con Perfit
            $this->syncToPerfit($subscriber);

            return back()->with('success', '¡Gracias por suscribirte a nuestro newsletter!');
        } catch (\Exception $e) {
            Log::error('Error al suscribir al newsletter', [
                'email' => $validated['email'],
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Ocurrió un error al procesar tu suscripción. Por favor, intentá nuevamente.');
        }
    }

    /**
     * Sincronizar suscriptor con Perfit (servicio externo de email marketing)
     *
     * @param NewsletterSubscriber $subscriber
     * @return bool
     */
    private function syncToPerfit(NewsletterSubscriber $subscriber): bool
    {
        try {
            $apiKey  = config('services.perfit.api_key');
            $account = config('services.perfit.account');
            $listId  = config('services.perfit.list_id');
            $baseUrl = config('services.perfit.base_url');

            $payload = [
                'email'        => $subscriber->email,
                'customFields' => [
                    ['id' => (int) config('services.perfit.custom_field_source_id'), 'value' => $subscriber->source],
                ],
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->post("{$baseUrl}/{$account}/lists/{$listId}/contacts", $payload);

            if ($response->successful()) {
                $subscriber->markAsSynced();
                return true;
            }
    
            Log::warning('Error al sincronizar con Perfit', [
                'email' => $subscriber->email,
                'response' => $response->body(),
            ]);
    
            return false;
        } catch (\Exception $e) {
            Log::error('Excepción al sincronizar con Perfit', [
                'email' => $subscriber->email,
                'error' => $e->getMessage(),
            ]);
    
            return false;
        }
    }
}
