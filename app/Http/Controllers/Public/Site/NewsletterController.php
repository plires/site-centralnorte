<?php

namespace App\Http\Controllers\Public\Site;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
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

                    // TODO: Sincronizar con Perfit
                    // $this->syncToPerfit($existing);

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

            // TODO: Sincronizar con Perfit
            // $this->syncToPerfit($subscriber);

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
     * TODO: Implementar cuando se tenga acceso a la API de Perfit
     *
     * @param NewsletterSubscriber $subscriber
     * @return bool
     */
    // private function syncToPerfit(NewsletterSubscriber $subscriber): bool
    // {
    //     try {
    //         // Configuración de Perfit desde .env
    //         // $apiKey = config('services.perfit.api_key');
    //         // $listId = config('services.perfit.list_id');
    //         // $baseUrl = config('services.perfit.base_url', 'https://api.perfit.com.ar');
    //
    //         // Ejemplo de payload para Perfit
    //         // $payload = [
    //         //     'email' => $subscriber->email,
    //         //     'list_id' => $listId,
    //         //     'source' => $subscriber->source,
    //         //     'subscribed_at' => $subscriber->created_at->toIso8601String(),
    //         // ];
    //
    //         // Realizar request HTTP a Perfit
    //         // $response = Http::withHeaders([
    //         //     'Authorization' => 'Bearer ' . $apiKey,
    //         //     'Content-Type' => 'application/json',
    //         // ])->post("{$baseUrl}/v1/contacts", $payload);
    //
    //         // if ($response->successful()) {
    //         //     $subscriber->markAsSynced();
    //         //     return true;
    //         // }
    //
    //         // Log::warning('Error al sincronizar con Perfit', [
    //         //     'email' => $subscriber->email,
    //         //     'response' => $response->body(),
    //         // ]);
    //
    //         return false;
    //     } catch (\Exception $e) {
    //         // Log::error('Excepción al sincronizar con Perfit', [
    //         //     'email' => $subscriber->email,
    //         //     'error' => $e->getMessage(),
    //         // ]);
    //
    //         return false;
    //     }
    // }
}
