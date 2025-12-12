<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickingBudgetNotification extends Model
{
    protected $fillable = [
        'picking_budget_id',
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

    /**
     * Relación con el presupuesto de picking
     */
    public function pickingBudget(): BelongsTo
    {
        return $this->belongsTo(PickingBudget::class);
    }

    /**
     * Scope para notificaciones pendientes de envío
     */
    public function scopePending($query)
    {
        return $query->where('sent', false);
    }

    /**
     * Scope para notificaciones enviadas
     */
    public function scopeSent($query)
    {
        return $query->where('sent', true);
    }

    /**
     * Scope por tipo de notificación
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
