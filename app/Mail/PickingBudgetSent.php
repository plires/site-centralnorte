<?php

namespace App\Mail;

use App\Models\PickingBudget;
use App\Services\PickingBudgetPdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PickingBudgetSent extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public PickingBudget $budget,
        public string $publicUrl,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $replyTo = $this->budget->vendor
            ? [new Address($this->budget->vendor->email, $this->budget->vendor->name)]
            : [];

        return new Envelope(
            subject: "Presupuesto de Picking #{$this->budget->budget_number} - Central Norte",
            replyTo: $replyTo,
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
                'publicUrl' => $this->publicUrl,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     * El PDF se genera aquí (en tiempo de ejecución del job) para evitar
     * problemas de serialización del objeto DomPDF en la cola.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $pdfService = new PickingBudgetPdfService();
        $pdf        = $pdfService->generate($this->budget);
        $filename   = $pdfService->filename($this->budget);

        return [
            Attachment::fromData(
                fn () => $pdf->output(),
                $filename
            )->withMime('application/pdf'),
        ];
    }
}
