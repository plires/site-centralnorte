<?php

namespace App\Models;

use Carbon\Carbon;
use App\Enums\BudgetStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Budget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'token',
        'user_id',
        'client_id',
        'picking_payment_condition_id',
        'payment_condition_description',
        'payment_condition_percentage',
        'issue_date',
        'expiry_date',
        'status',
        'send_email_to_client',
        'email_sent',
        'email_sent_at',
        'footer_comments',
        'rejection_comments',
        'subtotal',
        'payment_condition_amount',
        'total',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'status' => BudgetStatus::class,
        'send_email_to_client' => 'boolean',
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'payment_condition_percentage' => 'decimal:2',
        'payment_condition_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // accessors para fechas formateadas que se incluirán en JSON
    protected $appends = [
        'issue_date_formatted',
        'expiry_date_formatted',
        'issue_date_short',
        'expiry_date_short',
        'email_sent_at_formatted',
        'status_label',
        'status_color',
        'status_badge_class',
    ];

    protected static function boot()
    {
        parent::boot();

        // Generar token automáticamente
        static::creating(function ($budget) {
            if (empty($budget->token)) {
                $budget->token = Str::random(32);
            }
            // Por defecto, estado 'unsent' al crear
            if (empty($budget->status)) {
                $budget->status = BudgetStatus::UNSENT;
            }
        });
    }

    // =========================================================================
    // ACCESSORS PARA FECHAS
    // =========================================================================

    public function getIssueDateFormattedAttribute()
    {
        return $this->issue_date ? $this->issue_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY') : null;
    }

    public function getExpiryDateFormattedAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY') : null;
    }

    public function getIssueDateShortAttribute()
    {
        return $this->issue_date ? $this->issue_date->format('d/m/Y') : null;
    }

    public function getExpiryDateShortAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('d/m/Y') : null;
    }

    public function getEmailSentAtFormattedAttribute()
    {
        return $this->email_sent_at ? $this->email_sent_at->locale('es')->isoFormat('D [de] MMMM [de] YYYY [a las] HH:mm') : null;
    }

    public function getIssueDateIsoAttribute()
    {
        return $this->issue_date ? $this->issue_date->format('Y-m-d') : null;
    }

    public function getExpiryDateIsoAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('Y-m-d') : null;
    }

    // =========================================================================
    // ACCESSORS PARA STATUS
    // =========================================================================

    public function getStatusLabelAttribute(): string
    {
        return $this->status?->label() ?? 'Sin estado';
    }

    public function getStatusColorAttribute(): string
    {
        return $this->status?->color() ?? 'gray';
    }

    public function getStatusBadgeClassAttribute(): string
    {
        return $this->status?->badgeClass() ?? 'bg-gray-100 text-gray-800';
    }

    // =========================================================================
    // RELACIONES
    // =========================================================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(BudgetItem::class)->orderBy('sort_order');
    }

    public function notifications()
    {
        return $this->hasMany(BudgetNotification::class);
    }

    public function paymentCondition()
    {
        return $this->belongsTo(PickingPaymentCondition::class, 'picking_payment_condition_id');
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    /**
     * Presupuestos con estado específico
     */
    public function scopeWithStatus($query, BudgetStatus $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Presupuestos visibles públicamente (solo enviados)
     */
    public function scopePubliclyVisible($query)
    {
        return $query->where('status', BudgetStatus::SENT);
    }

    /**
     * Presupuestos editables (sin enviar o borrador)
     */
    public function scopeEditable($query)
    {
        return $query->whereIn('status', [BudgetStatus::UNSENT, BudgetStatus::DRAFT]);
    }

    /**
     * Presupuestos que pueden vencer (no finales)
     */
    public function scopeCanExpire($query)
    {
        return $query->whereIn('status', [
            BudgetStatus::UNSENT,
            BudgetStatus::DRAFT,
            BudgetStatus::SENT,
        ]);
    }

    /**
     * Presupuestos vencidos por fecha
     */
    public function scopeExpiredByDate($query)
    {
        return $query->where('expiry_date', '<', now()->startOfDay())
            ->canExpire();
    }

    /**
     * Presupuestos próximos a vencer
     */
    public function scopeExpiringSoon($query, $days = 3)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>=', now())
            ->canExpire();
    }

    // =========================================================================
    // MÉTODOS DE NEGOCIO
    // =========================================================================

    /**
     * ¿El presupuesto está vencido por fecha?
     */
    public function isExpiredByDate(): bool
    {
        return $this->expiry_date < now()->startOfDay();
    }

    /**
     * ¿El presupuesto es visible públicamente?
     */
    public function isPubliclyVisible(): bool
    {
        return $this->status === BudgetStatus::SENT;
    }

    /**
     * ¿El presupuesto permite acciones del cliente?
     */
    public function allowsClientAction(): bool
    {
        return $this->status?->allowsClientAction() ?? false;
    }

    /**
     * ¿El presupuesto es editable?
     */
    public function isEditable(): bool
    {
        return $this->status?->isEditable() ?? false;
    }

    /**
     * ¿El presupuesto puede ser enviado?
     */
    public function canBeSent(): bool
    {
        return $this->status?->canBeSent() ?? false;
    }

    /**
     * Marcar como enviado
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => BudgetStatus::SENT,
            'email_sent' => true,
            'email_sent_at' => now(),
        ]);
    }

    /**
     * Marcar como aprobado
     */
    public function markAsApproved(): void
    {
        $this->update(['status' => BudgetStatus::APPROVED]);
    }

    /**
     * Marcar como rechazado
     */
    public function markAsRejected(): void
    {
        $this->update(['status' => BudgetStatus::REJECTED]);
    }

    /**
     * Marcar como vencido
     */
    public function markAsExpired(): void
    {
        if ($this->status?->canExpire()) {
            $this->update(['status' => BudgetStatus::EXPIRED]);
        }
    }

    /**
     * Obtener datos de estado (compatibilidad con código existente)
     */
    public function getStatusData(): array
    {
        $now = now()->startOfDay();
        $expiryDate = $this->expiry_date->startOfDay();

        $isExpiredByDate = $expiryDate < $now;
        $isExpiringToday = $expiryDate->isSameDay($now);

        // Calcular días correctamente
        if ($isExpiringToday) {
            $daysUntilExpiry = 0;
        } elseif ($isExpiredByDate) {
            $daysUntilExpiry = -$expiryDate->diffInDays($now);
        } else {
            $daysUntilExpiry = $now->diffInDays($expiryDate);
        }

        // El estado real viene del campo status
        $isExpired = $this->status === BudgetStatus::EXPIRED ||
            ($isExpiredByDate && $this->status?->canExpire());

        // Texto de estado basado en vencimiento
        if ($this->status === BudgetStatus::EXPIRED || $isExpiredByDate) {
            $expiryStatus = 'expired';
            $statusText = 'Vencido';
        } elseif ($isExpiringToday) {
            $expiryStatus = 'expiring_soon';
            $statusText = 'Vence Hoy';
        } elseif ($daysUntilExpiry <= 3 && $daysUntilExpiry > 0) {
            $expiryStatus = 'expiring_soon';
            $statusText = $daysUntilExpiry === 1 ?
                'Vence en 1 día' : "Vence en {$daysUntilExpiry} días";
        } else {
            $expiryStatus = 'valid';
            $statusText = 'Válido';
        }

        return [
            'status' => $this->status?->value ?? 'unsent',
            'status_label' => $this->status?->label() ?? 'Sin enviar',
            'status_color' => $this->status?->color() ?? 'slate',
            'expiry_status' => $expiryStatus,
            'expiry_status_text' => $statusText,
            'days_until_expiry' => $daysUntilExpiry,
            'is_expired' => $isExpired,
            'is_expiring_today' => $isExpiringToday,
            'is_publicly_visible' => $this->isPubliclyVisible(),
            'allows_client_action' => $this->allowsClientAction(),
            'is_editable' => $this->isEditable(),
            'can_be_sent' => $this->canBeSent(),
        ];
    }

    /**
     * Calcular totales del presupuesto
     */
    public function calculateTotals()
    {
        $subtotal = 0;

        // Obtener items regulares (sin variant_group) - siempre incluidos
        $regularItems = $this->items()->whereNull('variant_group')->get();
        $subtotal += $regularItems->sum('line_total');

        // Para variantes, solo sumar las que están marcadas como seleccionadas
        $selectedVariants = $this->items()
            ->whereNotNull('variant_group')
            ->where('is_selected', true)
            ->get();

        $subtotal += $selectedVariants->sum('line_total');

        // Calcular ajuste por condición de pago
        $paymentConditionAmount = 0;
        if ($this->payment_condition_percentage) {
            $paymentConditionAmount = $subtotal * ($this->payment_condition_percentage / 100);
        }

        // Aplicar IVA
        $ivaRate = config('business.tax.iva_rate', 0.21);
        $applyIva = config('business.tax.apply_iva', true);

        $subtotalWithPayment = $subtotal + $paymentConditionAmount;

        $total = $subtotalWithPayment;
        if ($applyIva) {
            $total = $subtotalWithPayment * (1 + $ivaRate);
        }

        $this->subtotal = $subtotal;
        $this->payment_condition_amount = $paymentConditionAmount;
        $this->total = $total;
        $this->save();
    }

    /**
     * Obtener items seleccionados (para cálculos y PDF)
     */
    public function getSelectedItems()
    {
        // Items regulares (sin variant_group)
        $items = $this->items()->whereNull('variant_group')->get();

        // Variantes seleccionadas
        $selectedVariants = $this->items()
            ->whereNotNull('variant_group')
            ->where('is_selected', true)
            ->get();

        $items = $items->concat($selectedVariants);

        return $items->sortBy('sort_order');
    }

    public function hasVariants()
    {
        return $this->items->whereNotNull('variant_group')->count() > 0;
    }

    public function getVariantGroups()
    {
        return $this->items
            ->whereNotNull('variant_group')
            ->pluck('variant_group')
            ->unique()
            ->values()
            ->toArray();
    }
}
