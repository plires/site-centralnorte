<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickingPaymentCondition extends Model
{
    protected $fillable = [
        'description',
        'percentage',
        'is_active',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scope para obtener solo condiciones de pago activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Obtener condiciones de pago ordenadas por descripción
     */
    public function scopeOrderByDescription($query, $direction = 'asc')
    {
        return $query->orderBy('description', $direction);
    }
}
