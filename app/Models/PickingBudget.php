<?php

namespace App\Models;

use App\Enums\PickingBudgetStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PickingBudget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'budget_number',
        'vendor_id',
        'client_name',
        'client_email',
        'client_phone',
        'total_kits',
        'total_components_per_kit',
        'scale_quantity_from',
        'scale_quantity_to',
        'production_time',
        'component_increment_description',
        'component_increment_percentage',
        'services_subtotal',
        'component_increment_amount',
        'subtotal_with_increment',
        'box_total', // es la suma de todas las cajas
        'total',
        'unit_price_per_kit',
        'status',
        'valid_until',
        'notes',
    ];

    protected $casts = [
        'vendor_id' => 'integer',
        'total_kits' => 'integer',
        'total_components_per_kit' => 'integer',
        'scale_quantity_from' => 'integer',
        'scale_quantity_to' => 'integer',
        'component_increment_percentage' => 'decimal:2',
        'services_subtotal' => 'decimal:2',
        'component_increment_amount' => 'decimal:2',
        'subtotal_with_increment' => 'decimal:2',
        'box_total' => 'decimal:2',
        'total' => 'decimal:2',
        'unit_price_per_kit' => 'decimal:2',
        'status' => PickingBudgetStatus::class,
        'valid_until' => 'date',
    ];

    /**
     * Relación con el vendedor
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    /**
     * Relación con los servicios del presupuesto
     */
    public function services(): HasMany
    {
        return $this->hasMany(PickingBudgetService::class);
    }

    /**
     * Relación con las cajas del presupuesto
     */
    public function boxes(): HasMany
    {
        return $this->hasMany(PickingBudgetBox::class);
    }

    /**
     * Scope para filtrar por vendedor
     */
    public function scopeForVendor($query, int $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeWithStatus($query, PickingBudgetStatus $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para presupuestos vencidos
     */
    public function scopeExpired($query)
    {
        return $query->where('valid_until', '<', now())
            ->whereNotIn('status', [PickingBudgetStatus::APPROVED, PickingBudgetStatus::REJECTED]);
    }

    /**
     * Verificar si el presupuesto está vencido
     */
    public function isExpired(): bool
    {
        return $this->valid_until < now()
            && !in_array($this->status, [PickingBudgetStatus::APPROVED, PickingBudgetStatus::REJECTED]);
    }

    /**
     * Generar el siguiente número de presupuesto
     */
    public static function generateBudgetNumber(): string
    {
        $year = now()->year;
        $lastBudget = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastBudget ? (int) substr($lastBudget->budget_number, -4) + 1 : 1;

        return sprintf('PK-%d-%04d', $year, $nextNumber);
    }

    /**
     * Calcular totales del presupuesto
     * soporte para múltiples cajas y unit_price_per_kit
     */
    public function calculateTotals(): void
    {
        // Subtotal de servicios
        $this->services_subtotal = $this->services()->sum('subtotal');

        // Incremento por componentes
        $this->component_increment_amount = $this->services_subtotal * $this->component_increment_percentage;

        // Subtotal con incremento
        $this->subtotal_with_increment = $this->services_subtotal + $this->component_increment_amount;

        // Total de cajas (suma de todas las cajas)
        $this->box_total = $this->boxes()->sum('subtotal');

        // Total general
        $this->total = $this->subtotal_with_increment + $this->box_total;

        // Precio unitario por kit
        $this->unit_price_per_kit = $this->total_kits > 0
            ? round($this->total / $this->total_kits, 2)
            : 0;
    }
}
