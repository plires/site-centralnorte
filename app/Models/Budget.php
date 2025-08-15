<?php
// app/Models/Budget.php

namespace App\Models;

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

    // Métodos de negocio actualizados en el modelo Budget
    public function calculateTotals()
    {
        $subtotal = $this->items->sum('line_total');
        $ivaRate = config('business.tax.iva_rate');
        $applyIva = config('business.tax.apply_iva');

        $total = $subtotal;
        if ($applyIva) {
            $total = $subtotal * (1 + $ivaRate);
        }

        $this->update([
            'subtotal' => $subtotal,
            'total' => $total,
        ]);
    }

    public function getVariantGroups()
    {
        return BudgetItem::where('budget_id', $this->id)
            ->whereNotNull('variant_group')
            ->distinct()
            ->pluck('variant_group')
            ->toArray();
    }

    public function hasVariants()
    {
        return $this->items()->where('is_variant', true)->exists();
    }

    public function getIsExpiredAttribute()
    {
        return $this->expiry_date->startOfDay() < now()->startOfDay();
    }

    public function getIsExpiringTodayAttribute()
    {
        return $this->expiry_date->startOfDay()->isSameDay(now()->startOfDay());
    }

    public function getDaysUntilExpiryAttribute()
    {
        $now = now()->startOfDay();
        $expiryDate = $this->expiry_date->startOfDay();

        $diffInDays = $now->diffInDays($expiryDate, false); // false = signed difference

        if ($this->is_expiring_today) {
            return 0;
        } elseif ($this->is_expired) {
            return -abs($diffInDays);
        } else {
            return $diffInDays;
        }
    }
}
