<?php

namespace App\Mail;

use App\Models\PickingBudget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class PickingBudgetSent extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public PickingBudget $budget,
        public $pdf
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Presupuesto de Picking #{$this->budget->budget_number} - Central Norte",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.picking-budget-sent',
            with: [
                'vendedor' => $this->budget->vendor ? $this->budget->vendor : 'Central Norte',
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
        return [
            Attachment::fromData(fn() => $this->pdf->output(), "presupuesto-{$this->budget->budget_number}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
