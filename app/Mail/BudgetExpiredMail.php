<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetExpiredMail extends Mailable
{
  use Queueable, SerializesModels;

  public Budget $budget;

  public function __construct(Budget $budget)
  {
    $this->budget = $budget;
  }

  public function envelope(): Envelope
  {
    return new Envelope(
      subject: '❌ Presupuesto vencido: ' . $this->budget->title,
    );
  }

  public function content(): Content
  {
    $dashboardUrl = route('dashboard.budgets.show', $this->budget->id);

    return new Content(
      view: 'emails.budget-expired',
      with: [
        'budget' => $this->budget,
        'dashboardUrl' => $dashboardUrl,
      ]
    );
  }

  public function attachments(): array
  {
    return [];
  }
}
