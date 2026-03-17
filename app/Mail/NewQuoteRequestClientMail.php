<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewQuoteRequestClientMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Budget $budget;

    public function __construct(Budget $budget)
    {
        $this->budget = $budget;
    }

    /**
     * Override the from address to use the assigned seller's email (same pattern as BudgetCreatedMail).
     * Uses build() because Envelope::from does not override the mailer's global from.
     */
    public function build(): static
    {
        $seller = $this->budget->user;
        $this->from(
            $seller ? $seller->email : config('mail.from.address'),
            $seller ? $seller->name  : config('mail.from.name'),
        );

        if ($seller) {
            $this->replyTo($seller->email, $seller->name);
        }

        return $this;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recibimos tu solicitud de presupuesto — ' . env('COMPANY_NAME', 'Central Norte'),
        );
    }

    public function content(): Content
    {
        $this->budget->load(['client', 'user', 'items.product', 'items.productVariant']);

        return new Content(
            view: 'emails.new-quote-request-client',
            with: [
                'budget'  => $this->budget,
                'client'  => $this->budget->client,
                'vendedor' => $this->budget->user,
                'items'   => $this->budget->items,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
