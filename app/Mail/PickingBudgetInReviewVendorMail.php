<?php

namespace App\Mail;

use App\Models\PickingBudget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PickingBudgetInReviewVendorMail extends Mailable
{
    use Queueable, SerializesModels;

    public PickingBudget $budget;
    public string $dashboardUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(PickingBudget $budget, string $dashboardUrl)
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
            subject: '📋 Presupuesto de Picking en Evaluación - ' . $this->budget->budget_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.picking-budget-in-review-vendor',
            with: [
                'budget' => $this->budget,
                'vendedor' => $this->budget->vendor,
                'cliente' => $this->budget->client,
                'dashboardUrl' => $this->dashboardUrl,
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
