<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickingCostScale extends Model
{
    protected $fillable = [
        'quantity_from',
        'quantity_to',
        'cost_without_assembly',
        'cost_with_assembly',
        'palletizing_without_pallet',
        'palletizing_with_pallet',
        'cost_with_labeling',
        'cost_without_labeling',
        'additional_assembly',
        'quality_control',
        'dome_sticking_unit',
        'shavings_50g_unit',
        'shavings_100g_unit',
        'shavings_200g_unit',
        'bag_10x15_unit',
        'bag_20x30_unit',
        'bag_35x45_unit',
        'bubble_wrap_5x10_unit',
        'bubble_wrap_10x15_unit',
        'bubble_wrap_20x30_unit',
        'production_time',
        'is_active',
    ];

    protected $casts = [
        'quantity_from' => 'integer',
        'quantity_to' => 'integer',
        'cost_without_assembly' => 'decimal:2',
        'cost_with_assembly' => 'decimal:2',
        'palletizing_without_pallet' => 'decimal:2',
        'palletizing_with_pallet' => 'decimal:2',
        'cost_with_labeling' => 'decimal:2',
        'cost_without_labeling' => 'decimal:2',
        'additional_assembly' => 'decimal:2',
        'quality_control' => 'decimal:2',
        'dome_sticking_unit' => 'decimal:2',
        'shavings_50g_unit' => 'decimal:2',
        'shavings_100g_unit' => 'decimal:2',
        'shavings_200g_unit' => 'decimal:2',
        'bag_10x15_unit' => 'decimal:2',
        'bag_20x30_unit' => 'decimal:2',
        'bag_35x45_unit' => 'decimal:2',
        'bubble_wrap_5x10_unit' => 'decimal:2',
        'bubble_wrap_10x15_unit' => 'decimal:2',
        'bubble_wrap_20x30_unit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scope para obtener solo escalas activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Obtener la escala de costo que corresponde a una cantidad de kits
     */
    public static function findForQuantity(int $quantity): ?self
    {
        return self::active()
            ->where('quantity_from', '<=', $quantity)
            ->where(function ($query) use ($quantity) {
                $query->whereNull('quantity_to')
                    ->orWhere('quantity_to', '>=', $quantity);
            })
            ->first();
    }

    /**
     * Obtener el rango de cantidad formateado
     */
    public function getQuantityRangeAttribute(): string
    {
        if ($this->quantity_to === null) {
            return $this->quantity_from . ' o más';
        }
        
        return $this->quantity_from . ' - ' . $this->quantity_to;
    }
}
