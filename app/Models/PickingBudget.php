<?php

namespace App\Models;

use App\Enums\BudgetStatus;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PickingBudget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'budget_number',
        'title',
        'issue_date',
        'token',
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
        'box_total',
        'picking_payment_condition_id',
        'payment_condition_description',
        'payment_condition_percentage',
        'payment_condition_amount',
        'total',
        'unit_price_per_kit',
        'status',
        'email_sent',
        'email_sent_at',
        'valid_until',
        'rejection_comments',
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
        'issue_date' => 'date',
        'status' => BudgetStatus::class,
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
        'valid_until' => 'date',
        'payment_condition_percentage' => 'decimal:2',
        'payment_condition_amount' => 'decimal:2',
    ];

    protected $appends = [
        'status_label',
        'status_color',
        'status_badge_class',
        'valid_until_formatted',
        'valid_until_short',
        'issue_date_formatted',
        'issue_date_short',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($budget) {
            // Generar token automáticamente
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
    // ACCESSORS
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

    public function getValidUntilFormattedAttribute()
    {
        return $this->valid_until ? $this->valid_until->locale('es')->isoFormat('D [de] MMMM [de] YYYY') : null;
    }

    public function getValidUntilShortAttribute()
    {
        return $this->valid_until ? $this->valid_until->format('d/m/Y') : null;
    }

    public function getIssueDateFormattedAttribute(): ?string
    {
        $date = $this->issue_date ?? $this->created_at;

        return $date
            ? $date->locale('es')->isoFormat('D [de] MMMM [de] YYYY')
            : null;
    }

    public function getIssueDateShortAttribute(): ?string
    {
        $date = $this->issue_date ?? $this->created_at;

        return $date
            ? $date->format('d/m/Y')
            : null;
    }

    public function getEmailSentAtFormattedAttribute()
    {
        return $this->email_sent_at
            ? $this->email_sent_at->locale('es')->isoFormat('D [de] MMMM [de] YYYY [a las] HH:mm')
            : null;
    }

    // =========================================================================
    // RELACIONES
    // =========================================================================

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(PickingBudgetService::class);
    }

    public function boxes(): HasMany
    {
        return $this->hasMany(PickingBudgetBox::class);
    }

    public function paymentCondition(): BelongsTo
    {
        return $this->belongsTo(PickingPaymentCondition::class, 'picking_payment_condition_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(PickingBudgetNotification::class);
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    public function scopeForVendor($query, int $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    public function scopeForClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeWithStatus($query, BudgetStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopePubliclyVisible($query)
    {
        return $query->where('status', BudgetStatus::SENT);
    }

    public function scopeEditable($query)
    {
        return $query->whereIn('status', [BudgetStatus::UNSENT, BudgetStatus::DRAFT]);
    }

    public function scopeCanExpire($query)
    {
        return $query->whereIn('status', [
            BudgetStatus::UNSENT,
            BudgetStatus::DRAFT,
            BudgetStatus::SENT,
        ]);
    }

    public function scopeExpiredByDate($query)
    {
        return $query->where('valid_until', '<', now()->startOfDay())
            ->canExpire();
    }

    public function scopeExpiringSoon($query, $days = 3)
    {
        return $query->where('valid_until', '<=', now()->addDays($days))
            ->where('valid_until', '>=', now())
            ->canExpire();
    }

    // =========================================================================
    // MÉTODOS DE ESTADO
    // =========================================================================

    public function isExpiredByDate(): bool
    {
        return $this->valid_until < now()->startOfDay();
    }

    public function isPubliclyVisible(): bool
    {
        return $this->status?->isPubliclyVisible() ?? false;
    }

    public function allowsClientAction(): bool
    {
        return $this->status?->allowsClientAction() ?? false;
    }

    public function isEditable(): bool
    {
        return $this->status?->isEditable() ?? false;
    }

    public function canBeSent(): bool
    {
        return $this->status?->canBeSent() ?? false;
    }

    public function allowsInReviewAction(): bool
    {
        return $this->status?->allowsInReviewAction() ?? false;
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => BudgetStatus::SENT,
            'email_sent' => true,
            'email_sent_at' => now(),
        ]);
    }

    public function markAsInReview(): void
    {
        $this->update(['status' => BudgetStatus::IN_REVIEW]);
    }

    public function markAsApproved(): void
    {
        $this->update(['status' => BudgetStatus::APPROVED]);
    }

    public function markAsRejected(): void
    {
        $this->update(['status' => BudgetStatus::REJECTED]);
    }

    public function markAsExpired(): void
    {
        if ($this->status?->canExpire()) {
            $this->update(['status' => BudgetStatus::EXPIRED]);
        }
    }

    /**
     * Obtener datos de estado (similar a Budget)
     */
    public function getStatusData(): array
    {
        $now = now()->startOfDay();
        $validUntil = $this->valid_until->startOfDay();

        $isExpiredByDate = $validUntil < $now;
        $isExpiringToday = $validUntil->isSameDay($now);

        if ($isExpiringToday) {
            $daysUntilExpiry = 0;
        } elseif ($isExpiredByDate) {
            $daysUntilExpiry = -$validUntil->diffInDays($now);
        } else {
            $daysUntilExpiry = $now->diffInDays($validUntil);
        }

        $isExpired = $this->status === BudgetStatus::EXPIRED ||
            ($isExpiredByDate && $this->status?->canExpire());

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
            'allows_in_review_action' => $this->allowsInReviewAction(),
            'is_editable' => $this->isEditable(),
            'can_be_sent' => $this->canBeSent(),
        ];
    }

    // =========================================================================
    // MÉTODOS DE NEGOCIO
    // =========================================================================

    public function getSubtotalWithPaymentCondition()
    {
        return ($this->subtotal_with_increment + $this->box_total) + $this->payment_condition_amount;
    }

    public static function generateBudgetNumber(): string
    {
        $year = now()->year;

        // Usamos SELECT ... FOR UPDATE para serializar la generación bajo
        // concurrencia: ninguna otra transacción puede leer/escribir la misma
        // fila hasta que esta transacción haga commit.
        // Incluye soft-deleted (DB::table bypasea el global scope de SoftDeletes)
        // garantizando unicidad aunque el presupuesto haya sido eliminado.
        DB::table('picking_budgets')
            ->where('budget_number', 'like', "PK-{$year}-%")
            ->lockForUpdate()
            ->count(); // ejecuta el lock sin traer datos innecesarios

        $lastNumber = DB::table('picking_budgets')
            ->where('budget_number', 'like', "PK-{$year}-%")
            ->selectRaw('MAX(CAST(SUBSTRING_INDEX(budget_number, \'-\', -1) AS UNSIGNED)) as max_seq')
            ->value('max_seq');

        $nextSeq = ($lastNumber ?? 0) + 1;

        return sprintf('PK-%d-%d', $year, $nextSeq);
    }

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
