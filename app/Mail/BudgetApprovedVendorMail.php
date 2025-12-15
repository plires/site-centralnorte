<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetApprovedVendorMail extends Mailable
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
      subject: '✅ ¡Presupuesto Aprobado! - ' . $this->budget->title,
    );
  }

  /**
   * Get the message content definition.
   */
  public function content(): Content
  {
    return new Content(
      view: 'emails.budget-approved-vendor',
      with: [
        'budget' => $this->budget,
        'vendedor' => $this->budget->user,
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
