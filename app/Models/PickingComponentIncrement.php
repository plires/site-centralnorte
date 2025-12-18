<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PickingComponentIncrement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'components_from',
        'components_to',
        'description',
        'percentage',
        'is_active',
    ];

    protected $casts = [
        'components_from' => 'integer',
        'components_to' => 'integer',
        'percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scope para obtener solo incrementos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Obtener el incremento que corresponde a una cantidad de componentes
     */
    public static function findForComponents(int $components): ?self
    {
        return self::active()
            ->where('components_from', '<=', $components)
            ->where(function ($query) use ($components) {
                $query->whereNull('components_to')
                    ->orWhere('components_to', '>=', $components);
            })
            ->first();
    }

    /**
     * Obtener el rango de componentes formateado
     */
    public function getComponentsRangeAttribute(): string
    {
        if ($this->components_to === null) {
            return $this->components_from . ' o más';
        }

        return $this->components_from . ' - ' . $this->components_to;
    }

    /**
     * Obtener el porcentaje formateado
     */
    public function getPercentageFormattedAttribute(): string
    {
        return ($this->percentage * 100) . '%';
    }
}
