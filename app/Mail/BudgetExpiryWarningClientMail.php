<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetExpiryWarningClientMail extends Mailable implements ShouldQueue
{
  use Queueable, SerializesModels;

  public Budget $budget;
  public string $publicUrl;

  public function __construct(Budget $budget, string $publicUrl)
  {
    $this->budget = $budget;
    $this->publicUrl = $publicUrl;
  }

  /**
   * Set the from address to the assigned seller (or fallback to global config).
   * Uses build() because Envelope::from does not override the mailer's global from.
   */
  public function build(): static
  {
    $seller = $this->budget->user;
    $this->from(
      $seller ? $seller->email : config('mail.from.address'),
      $seller ? $seller->name : config('mail.from.name'),
    );

    return $this;
  }

  public function envelope(): Envelope
  {
    $seller = $this->budget->user;
    $replyTo = $seller
      ? [new Address($seller->email, $seller->name)]
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
