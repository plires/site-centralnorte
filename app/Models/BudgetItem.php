<?php
// app/Models/BudgetItem.php

namespace App\Models;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudgetItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'unit_price',
        'production_time_days',
        'logo_printing',
        'line_total',
        'sort_order',
        'variant_group',
        'is_variant',
        'is_selected',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'production_time_days' => 'integer',
        'line_total' => 'decimal:2',
        'sort_order' => 'integer',
        'is_variant' => 'boolean',
        'is_selected' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        // Calcular total automáticamente
        static::saving(function ($item) {
            $item->line_total = $item->quantity * $item->unit_price;
        });

        // Recalcular totales del presupuesto
        static::saved(function ($item) {
            $item->budget->calculateTotals();
        });

        static::deleted(function ($item) {
            $item->budget->calculateTotals();
        });
    }

    // Relaciones
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relación con la variante del producto seleccionada
     */
    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // Scopes
    public function scopeVariants($query)
    {
        return $query->where('is_variant', true);
    }

    public function scopeRegular($query)
    {
        return $query->where('is_variant', false);
    }

    public function scopeByVariantGroup($query, $group)
    {
        return $query->where('variant_group', $group);
    }

    public function scopeSelected($query)
    {
        return $query->where('is_selected', true);
    }

    // Métodos de negocio
    public function getVariantSiblings()
    {
        if (!$this->variant_group) {
            return collect();
        }

        return $this->budget->items()
            ->where('variant_group', $this->variant_group)
            ->where('id', '!=', $this->id)
            ->get();
    }

    /**
     * Marcar esta variante como seleccionada y desmarcar las demás del grupo
     */
    public function selectVariant()
    {
        if (!$this->is_variant || !$this->variant_group) {
            return;
        }

        // Desmarcar todas las variantes del grupo
        $this->budget->items()
            ->where('variant_group', $this->variant_group)
            ->update(['is_selected' => false]);

        // Marcar esta como seleccionada
        $this->update(['is_selected' => true]);
    }
}
