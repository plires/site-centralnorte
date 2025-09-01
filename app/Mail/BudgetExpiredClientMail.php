<?php

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetExpiredClientMail extends Mailable
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
      subject: '❌ Su presupuesto ha vencido: ' . $this->budget->title,
    );
  }

  public function content(): Content
  {
    $publicUrl = route('public.budget.show', $this->budget->token);

    return new Content(
      view: 'emails.budget-expired-client',
      with: [
        'budget' => $this->budget,
        'publicUrl' => $publicUrl,
        'vendedor' => $this->budget->user,
      ]
    );
  }

  public function attachments(): array
  {
    return [];
  }
}
