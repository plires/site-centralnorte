<?php

namespace App\Models;

use App\Models\Client;
use App\Enums\PickingBudgetStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickingBudget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'budget_number',
        'vendor_id',
        'client_id',
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
        'picking_payment_condition_id',
        'payment_condition_description',
        'payment_condition_percentage',
        'payment_condition_amount',
        'total',
        'unit_price_per_kit',
        'status',
        'valid_until',
        'notes',
    ];

    protected $casts = [
        'vendor_id' => 'integer',
        'client_id' => 'integer',
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
        'payment_condition_percentage' => 'decimal:2',
        'payment_condition_amount' => 'decimal:2',
    ];

    /**
     * Relación con el vendedor
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    /**
     * Relación con el cliente
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
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
     * Relación con la condición de pago
     */
    public function paymentCondition(): BelongsTo
    {
        return $this->belongsTo(PickingPaymentCondition::class, 'picking_payment_condition_id');
    }

    /**
     * Scope para filtrar por vendedor
     */
    public function scopeForVendor($query, int $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    /**
     * Scope para filtrar por cliente
     */
    public function scopeForClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
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
     * Obtener subtotal con el ajuste de condición de pago aplicado
     */
    public function getSubtotalWithPaymentCondition()
    {
        return ($this->subtotal_with_increment + $this->box_total) + $this->payment_condition_amount;
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

        // Total de cajas
        $this->box_total = $this->boxes()->sum('subtotal');

        // Subtotal antes de payment condition e IVA
        $subtotal = $this->subtotal_with_increment + $this->box_total;

        // Calcular ajuste por condición de pago
        $paymentConditionAmount = 0;
        if ($this->payment_condition_percentage) {
            $paymentConditionAmount = $subtotal * ($this->payment_condition_percentage / 100);
        }
        $this->payment_condition_amount = $paymentConditionAmount;

        // Subtotal con ajuste de condición de pago
        $subtotalWithPayment = $subtotal + $paymentConditionAmount;

        // Aplicar IVA
        $ivaRate = config('business.tax.iva_rate', 0.21);
        $applyIva = config('business.tax.apply_iva', true);

        // Total final
        $total = $subtotalWithPayment;
        if ($applyIva) {
            $total = $subtotalWithPayment * (1 + $ivaRate);
        }
        $this->total = $total;

        // Precio unitario por kit
        $this->unit_price_per_kit = $this->total_kits > 0
            ? round($this->total / $this->total_kits, 2)
            : 0;
    }
}
