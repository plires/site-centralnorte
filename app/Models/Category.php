<?php

namespace App\Models;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'title',
        'description',
        'icon_url',
        'show',
        'origin',
    ];

    public const ORIGIN_ZECAT = 'Zecat';
    public const ORIGIN_LOCAL = 'local';

    public const ORIGIN_CONFIG = [
        self::ORIGIN_ZECAT => [
            'value' => 'Zecat',
            'label' => 'API Externa (Zecat)',
            'color' => 'blue',
            'className' => 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
            'is_external' => true,
        ],
        self::ORIGIN_LOCAL => [
            'value' => 'local',
            'label' => 'Categoría Local',
            'color' => 'green',
            'className' => 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            'is_external' => false,
        ],
    ];

    // Accessor que envía TODO al frontend
    protected $appends = ['origin_config'];

    protected function originConfig(): Attribute
    {
        return Attribute::make(
            get: fn() => self::ORIGIN_CONFIG[$this->origin] ?? [
                'value' => $this->origin,
                'label' => $this->origin,
                'color' => 'gray',
                'className' => 'bg-gray-100 text-gray-800 border-gray-200',
                'is_external' => false,
            ],
        );
    }

    // Helpers en PHP
    public function isExternal(): bool
    {
        return $this->origin === self::ORIGIN_ZECAT;
    }

    public function isLocal(): bool
    {
        return $this->origin === self::ORIGIN_LOCAL;
    }

    // Método estático para obtener config (útil en otros lugares)
    public static function getOriginConfig(?string $origin = null): array
    {
        if ($origin === null) {
            return self::ORIGIN_CONFIG;
        }

        return self::ORIGIN_CONFIG[$origin] ?? [];
    }

    // Scopes
    public function scopeFromZecat($query)
    {
        return $query->where('origin', self::ORIGIN_ZECAT);
    }

    public function scopeLocal($query)
    {
        return $query->where('origin', self::ORIGIN_LOCAL);
    }

    // Cast para el campo boolean
    protected $casts = [
        'show' => 'boolean',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'category_product')
            ->withTimestamps();
    }

    // Scope para obtener solo categorías visibles
    public function scopeVisible($query)
    {
        return $query->where('show', true);
    }

    // Scope para obtener categorías ocultas
    public function scopeHidden($query)
    {
        return $query->where('show', false);
    }
}
