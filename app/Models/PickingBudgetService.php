<?php

namespace App\Models;

use App\Enums\PickingServiceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PickingBudgetService extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'picking_budget_id',
        'service_type',
        'service_description',
        'unit_cost',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'picking_budget_id' => 'integer',
        'service_type' => PickingServiceType::class,
        'unit_cost' => 'decimal:2',
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

    /**
     * Scope para filtrar por tipo de servicio
     */
    public function scopeOfType($query, PickingServiceType $type)
    {
        return $query->where('service_type', $type);
    }

    /**
     * Calcular el subtotal automáticamente antes de guardar
     */
    protected static function booted(): void
    {
        static::saving(function (PickingBudgetService $service) {
            $service->subtotal = $service->unit_cost * $service->quantity;
        });
    }
}
