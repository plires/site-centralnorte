<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetExpiryWarningMail extends Mailable
{
  use Queueable, SerializesModels;

  public Budget $budget;
  public string $dashboardUrl;

  public function __construct(Budget $budget, string $dashboardUrl)
  {
    $this->budget = $budget;
    $this->dashboardUrl = $dashboardUrl;
  }

  public function envelope(): Envelope
  {
    return new Envelope(
      subject: '⚠️ Presupuesto próximo a vencer: ' . $this->budget->title,
    );
  }

  public function content(): Content
  {
    return new Content(
      view: 'emails.budget-expiry-warning',
      with: [
        'budget' => $this->budget,
        'daysUntilExpiry' => $this->budget->getStatusData()['days_until_expiry'],
        'dashboardUrl' => $this->dashboardUrl,
      ]
    );
  }

  public function attachments(): array
  {
    return [];
  }
}
