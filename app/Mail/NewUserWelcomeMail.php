<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewUserWelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public string $plainPassword;

    public function __construct(User $user, string $plainPassword)
    {
        $this->user          = $user;
        $this->plainPassword = $plainPassword;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenido/a a ' . env('COMPANY_NAME', 'Central Norte') . ' — Tus datos de acceso',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-user-welcome',
            with: [
                'user'          => $this->user,
                'plainPassword' => $this->plainPassword,
                'loginUrl'      => route('login'),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
