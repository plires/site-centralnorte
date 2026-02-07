<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewQuoteRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public Budget $budget;
    public string $dashboardUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Budget $budget, string $dashboardUrl)
    {
        $this->budget = $budget;
        $this->dashboardUrl = $dashboardUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📩 Nueva solicitud de presupuesto - ' . $this->budget->client->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Cargar relaciones necesarias
        $this->budget->load(['client', 'user', 'items.product', 'items.productVariant']);

        return new Content(
            view: 'emails.new-quote-request',
            with: [
                'budget' => $this->budget,
                'vendedor' => $this->budget->user,
                'client' => $this->budget->client,
                'dashboardUrl' => $this->dashboardUrl,
                'items' => $this->budget->items,
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
