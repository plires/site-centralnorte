<?php
// app/Models/Budget.php

namespace App\Models;

use Carbon\Carbon;
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
        'issue_date',
        'expiry_date',
        'is_active',
        'send_email_to_client',
        'email_sent',
        'email_sent_at',
        'footer_comments',
        'subtotal',
        'total',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
        'send_email_to_client' => 'boolean',
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Agregar accessors para fechas formateadas que se incluirán en JSON
    protected $appends = [
        'issue_date_formatted',
        'expiry_date_formatted',
        'issue_date_short',
        'expiry_date_short',
        'email_sent_at_formatted'
    ];

    protected static function boot()
    {
        parent::boot();

        // Generar token automáticamente
        static::creating(function ($budget) {
            if (empty($budget->token)) {
                $budget->token = Str::random(32);
            }
        });
    }

    // Accessors para fechas formateadas
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

    // Accessor para obtener fecha ISO para inputs HTML
    public function getIssueDateIsoAttribute()
    {
        return $this->issue_date ? $this->issue_date->format('Y-m-d') : null;
    }

    public function getExpiryDateIsoAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('Y-m-d') : null;
    }

    // Relaciones
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

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeExpiringSoon($query, $days = 3)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>=', now())
            ->where('is_active', true);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    // Método de negocio actualizado para usar is_selected
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

        $ivaRate = config('business.tax.iva_rate', 0.21);
        $applyIva = config('business.tax.apply_iva', true);

        $total = $subtotal;
        if ($applyIva) {
            $total = $subtotal * (1 + $ivaRate);
        }

        $this->update([
            'subtotal' => $subtotal,
            'total' => $total,
        ]);

        return $this;
    }

    /**
     * Obtener items que deben incluirse en el total
     * (items regulares + variantes seleccionadas)
     */
    public function getItemsForTotal()
    {
        $items = collect();

        // Agregar items regulares
        $regularItems = $this->items()->whereNull('variant_group')->get();
        $items = $items->concat($regularItems);

        // Agregar variantes seleccionadas
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

    // Método para obtener el estado del presupuesto (usado en el controlador)
    public function getStatusData()
    {
        $now = now()->startOfDay();
        $expiryDate = $this->expiry_date->startOfDay();

        $isExpired = $expiryDate < $now;
        $isExpiringToday = $expiryDate->isSameDay($now);

        // Calcular días correctamente
        if ($isExpiringToday) {
            $daysUntilExpiry = 0;
        } elseif ($isExpired) {
            // Para vencidos: calcular días transcurridos desde el vencimiento (positivo)
            $daysUntilExpiry = -$expiryDate->diffInDays($now);
        } else {
            // Para futuros: calcular días restantes hasta el vencimiento (positivo)
            $daysUntilExpiry = $now->diffInDays($expiryDate);
        }

        // Determinar el estado
        if ($isExpired) {
            $status = 'expired';
            $statusText = 'Vencido';
        } elseif ($isExpiringToday) {
            $status = 'expiring_soon';
            $statusText = 'Vence Hoy';
        } elseif ($daysUntilExpiry <= 3) {
            $status = 'expiring_soon';
            $statusText = $daysUntilExpiry === 1 ?
                'Vence en 1 día' : "Vence en {$daysUntilExpiry} días";
        } else {
            $status = 'valid';
            $statusText = 'Válido';
        }

        return [
            'status' => $status,
            'status_text' => $statusText,
            'days_until_expiry' => $daysUntilExpiry,
            'is_expired' => $isExpired,
            'is_expiring_today' => $isExpiringToday,
        ];
    }
}
