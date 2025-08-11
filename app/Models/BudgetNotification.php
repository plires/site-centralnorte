<?php
// app/Models/BudgetNotification.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudgetNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'type',
        'scheduled_for',
        'sent',
        'sent_at',
        'notification_data',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent' => 'boolean',
        'sent_at' => 'datetime',
        'notification_data' => 'array',
    ];

    // Relaciones
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('sent', false);
    }

    public function scopeDue($query)
    {
        return $query->where('scheduled_for', '<=', now())
            ->where('sent', false);
    }
}
