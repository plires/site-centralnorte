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

    /**
     * Create a new message instance.
     */
    public function __construct(Budget $budget, User $user, string $publicUrl)
    {
        $this->budget = $budget;
        $this->user = $user;
        $this->publicUrl = $publicUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nuevo Presupuesto: ' . $this->budget->title,
        );
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
