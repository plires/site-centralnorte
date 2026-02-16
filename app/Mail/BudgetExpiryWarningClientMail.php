<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetExpiryWarningClientMail extends Mailable
{
  use Queueable, SerializesModels;

  public Budget $budget;
  public string $publicUrl;

  public function __construct(Budget $budget, string $publicUrl)
  {
    $this->budget = $budget;
    $this->publicUrl = $publicUrl;
  }

  public function envelope(): Envelope
  {
    $replyTo = $this->budget->user
      ? [new Address($this->budget->user->email, $this->budget->user->name)]
      : [];

    return new Envelope(
      subject: '⏰ Su presupuesto vence pronto: ' . $this->budget->title,
      replyTo: $replyTo,
    );
  }

  public function content(): Content
  {
    $warningDays = config('budget.warning_days', env('BUDGET_WARNING_DAYS', 3));

    return new Content(
      view: 'emails.budget-expiry-warning-client',
      with: [
        'budget' => $this->budget,
        'warningDays' => $warningDays,
        'publicUrl' => $this->publicUrl,
        'vendedor' => $this->budget->user,
      ]
    );
  }

  public function attachments(): array
  {
    return [];
  }
}
