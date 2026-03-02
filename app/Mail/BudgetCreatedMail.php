<?php

namespace App\Mail;

use App\Models\Budget;
use App\Models\User;
use App\Services\BudgetPdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Budget $budget;
    public User $user;
    public string $publicUrl;
    public bool $isResend;

    /**
     * Create a new message instance.
     */
    public function __construct(Budget $budget, User $user, string $publicUrl, bool $isResend = false)
    {
        $this->budget   = $budget;
        $this->user     = $user;
        $this->publicUrl = $publicUrl;
        $this->isResend  = $isResend;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Subject diferenciado para reenvío
        $subject = $this->isResend
            ? 'Reenvío de Presupuesto: ' . $this->budget->budget_merch_number . ' - Central Norte'
            : 'Nuevo Presupuesto: ' . $this->budget->budget_merch_number . ' - Central Norte';

        $envelope = new Envelope(subject: $subject);

        if ($this->budget->user) {
            $envelope->replyTo(
                address: $this->budget->user->email,
                name: $this->budget->user->name,
            );
        }

        return $envelope;
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
                'vendedor' => $this->budget->user ? $this->budget->user : 'Central Norte',
                'user' => $this->user,
                'publicUrl' => $this->publicUrl,
                'isResend' => $this->isResend, // pasar a la vista para saber si es reenvio de presupuesto o no
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
        $pdfService = new BudgetPdfService();
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
