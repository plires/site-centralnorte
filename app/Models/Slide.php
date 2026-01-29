<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slide extends Model
{
    use HasFactory;

    /**
     * Número máximo de slides activos permitidos
     */
    public const MAX_ACTIVE_SLIDES = 5;

    /**
     * Dimensiones de las imágenes
     */
    public const DESKTOP_WIDTH = 1920;
    public const DESKTOP_HEIGHT = 850;
    public const MOBILE_WIDTH = 580;
    public const MOBILE_HEIGHT = 630;

    protected $fillable = [
        'title',
        'image_desktop',
        'image_mobile',
        'link',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Appends para la URL completa de las imágenes
     */
    protected $appends = ['image_desktop_url', 'image_mobile_url'];

    /**
     * Obtener la URL completa de la imagen desktop
     */
    public function getImageDesktopUrlAttribute(): ?string
    {
        if (empty($this->image_desktop)) {
            return null;
        }

        if (Str::startsWith($this->image_desktop, ['http://', 'https://'])) {
            return $this->image_desktop;
        }

        return asset('storage/' . $this->image_desktop);
    }

    /**
     * Obtener la URL completa de la imagen mobile
     */
    public function getImageMobileUrlAttribute(): ?string
    {
        if (empty($this->image_mobile)) {
            return null;
        }

        if (Str::startsWith($this->image_mobile, ['http://', 'https://'])) {
            return $this->image_mobile;
        }

        return asset('storage/' . $this->image_mobile);
    }

    /**
     * Scope para obtener solo slides activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para ordenar por sort_order
     */
    public function scopeOrdered($query, string $direction = 'asc')
    {
        return $query->orderBy('sort_order', $direction);
    }

    /**
     * Verificar si se pueden activar más slides
     */
    public static function canActivateMore(): bool
    {
        return self::active()->count() < self::MAX_ACTIVE_SLIDES;
    }

    /**
     * Obtener la cantidad de slides activos
     */
    public static function activeCount(): int
    {
        return self::active()->count();
    }

    /**
     * Obtener el próximo sort_order disponible
     */
    public static function getNextSortOrder(): int
    {
        return (self::max('sort_order') ?? 0) + 1;
    }
}
