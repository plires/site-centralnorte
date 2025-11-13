<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickingBox extends Model
{
    protected $fillable = [
        'dimensions',
        'cost',
        'is_active',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scope para obtener solo cajas activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Obtener cajas ordenadas por costo
     */
    public function scopeOrderByCost($query, $direction = 'asc')
    {
        return $query->orderBy('cost', $direction);
    }
}
