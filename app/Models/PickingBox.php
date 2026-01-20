<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PickingBox extends Model
{
    use HasFactory, SoftDeletes;

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

    /**
     * Relación con presupuestos de picking que usan esta caja
     */
    public function budgetBoxes()
    {
        return $this->hasMany(PickingBudgetBox::class, 'picking_box_id');
    }
}
