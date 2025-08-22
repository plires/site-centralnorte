<?php

namespace App\Mail;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Budget $budget;
    public User $user;
    public string $publicUrl;
    public bool $isResend; // AGREGADO: para detectar si es reenvío

    /**
     * Create a new message instance.
     */
    public function __construct(Budget $budget, User $user, string $publicUrl, bool $isResend = false)
    {
        $this->budget = $budget;
        $this->user = $user;
        $this->publicUrl = $publicUrl;
        $this->isResend = $isResend; // AGREGADO
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Subject diferenciado para reenvío
        $subject = $this->isResend
            ? 'Reenvío de Presupuesto: ' . $this->budget->title
            : 'Nuevo Presupuesto: ' . $this->budget->title;

        return new Envelope(subject: $subject);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.budget-created',
            with: [
                'budget' => $this->budget,
                'client' => $this->budget->client,
                'vendedor' => $this->user,
                'publicUrl' => $this->publicUrl,
                'isResend' => $this->isResend, // pasar a la vista para saber si es reenvio de presupuesto o no
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
