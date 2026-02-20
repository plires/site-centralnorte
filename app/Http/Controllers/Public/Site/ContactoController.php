<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use App\Models\ContactMessage;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMessageReceivedMail;
use App\Http\Requests\Public\ContactMessageRequest;

class ContactoController extends Controller
{
    public function index()
    {
        return Inertia::render('public/site/contacto/Contacto');
    }

    public function send(ContactMessageRequest $request)
    {
        try {
            $contactMessage = ContactMessage::create($request->validated());

            // Enviar email de notificación al administrador
            $adminEmail = config('business.admin_email', config('mail.from.address'));
            Mail::to($adminEmail)->send(new ContactMessageReceivedMail($contactMessage));

            return back()->with('success', '¡Gracias por contactarnos! Te responderemos a la brevedad.');
        } catch (\Exception $e) {
            Log::error('Error al guardar mensaje de contacto', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Ocurrió un error al enviar tu mensaje. Por favor, intentá nuevamente.');
        }
    }
}
