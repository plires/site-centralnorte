<?php

namespace App\Mail;

use App\Models\PickingBudget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PickingBudgetRejectedVendorMail extends Mailable
{
  use Queueable, SerializesModels;

  public PickingBudget $budget;
  public string $dashboardUrl;
  public ?string $rejectionReason;

  /**
   * Create a new message instance.
   */
  public function __construct(PickingBudget $budget, string $dashboardUrl, ?string $rejectionReason = null)
  {
    $this->budget = $budget;
    $this->dashboardUrl = $dashboardUrl;
    $this->rejectionReason = $rejectionReason;
  }

  /**
   * Get the message envelope.
   */
  public function envelope(): Envelope
  {
    return new Envelope(
      subject: '❌ Presupuesto de Picking Rechazado - #' . $this->budget->budget_number,
    );
  }

  /**
   * Get the message content definition.
   */
  public function content(): Content
  {
    return new Content(
      view: 'emails.picking-budget-rejected-vendor',
      with: [
        'budget' => $this->budget,
        'vendedor' => $this->budget->vendor,
        'dashboardUrl' => $this->dashboardUrl,
        'rejectionReason' => $this->rejectionReason,
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
