<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PickingBudgetBox extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'picking_budget_id',
        'picking_box_id',
        'box_dimensions',
        'box_unit_cost',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'picking_budget_id' => 'integer',
        'box_unit_cost' => 'decimal:2',
        'quantity' => 'integer',
        'subtotal' => 'decimal:2',
    ];

    /**
     * Relación con el presupuesto de picking
     */
    public function pickingBudget(): BelongsTo
    {
        return $this->belongsTo(PickingBudget::class);
    }

    public function pickingBox()
    {
        return $this->belongsTo(PickingBox::class, 'picking_box_id')->withTrashed();
    }

    /**
     * Calcular el subtotal automáticamente antes de guardar
     */
    protected static function booted(): void
    {
        static::saving(function (PickingBudgetBox $box) {
            $box->subtotal = $box->box_unit_cost * $box->quantity;
        });
    }
}
