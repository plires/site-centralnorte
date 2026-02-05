<?php

namespace App\Models;

use App\Models\Category;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'proveedor',
        'category_id',
        'last_price',
        'origin',
        'is_visible_in_front',
    ];

    protected $casts = [
        'is_visible_in_front' => 'boolean',
    ];

    /* Configuracion para datos externos start */
    // CONSTANTES
    public const ORIGIN_ZECAT = 'Zecat';
    public const ORIGIN_LOCAL = 'local';

    // ARRAY DE CONFIGURACIÓN
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
            'label' => 'Producto Local',
            'color' => 'green',
            'className' => 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            'is_external' => false,
        ],
    ];

    // ACCESSOR AL APPENDS
    protected $appends = ['origin_config'];

    // ACCESSOR
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

    // HELPERS
    public function isExternal(): bool
    {
        return $this->origin === self::ORIGIN_ZECAT;
    }

    public function isLocal(): bool
    {
        return $this->origin === self::ORIGIN_LOCAL;
    }

    // MÉTODO ESTÁTICO
    public static function getOriginConfig(?string $origin = null): array
    {
        if ($origin === null) {
            return self::ORIGIN_CONFIG;
        }

        return self::ORIGIN_CONFIG[$origin] ?? [];
    }

    // SCOPES
    public function scopeFromZecat($query)
    {
        return $query->where('origin', self::ORIGIN_ZECAT);
    }

    public function scopeLocal($query)
    {
        return $query->where('origin', self::ORIGIN_LOCAL);
    }

    public function scopeVisibleInFront($query)
    {
        return $query->where('is_visible_in_front', true);
    }
    /* Configuracion para datos externos end */

    /* Variantes start */
    /**
     * Relación con ProductVariant
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Obtener solo variantes tipo Apparel
     */
    public function getApparelVariantsAttribute()
    {
        return $this->variants()->apparel()->get();
    }

    /**
     * Obtener solo variantes tipo Standard
     */
    public function getStandardVariantsAttribute()
    {
        return $this->variants()->standard()->get();
    }

    /**
     * Obtener stock total de todas las variantes
     */
    public function getTotalStockAttribute(): int
    {
        return $this->variants()->sum('stock');
    }

    /**
     * Verificar si el producto tiene stock disponible
     */
    public function hasStock(): bool
    {
        return $this->variants()->where('stock', '>', 0)->exists();
    }

    /**
     * Obtener variantes con stock disponible
     */
    public function getAvailableVariantsAttribute()
    {
        return $this->variants()->inStock()->get();
    }

    /**
     * Verificar si el producto es de tipo Apparel
     */
    public function isApparel(): bool
    {
        // Revisar si tiene al menos una categoría que contenga "Apparel"
        return $this->categories()
            ->where('name', 'like', '%Apparel%')
            ->exists();
    }
    /* Variantes end */

    /* Atributos start */
    /**
     * Relación con ProductAttribute
     */
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    /**
     * Obtener valores de un atributo específico
     * 
     * @param string $attributeName
     * @return array
     */
    public function getAttributeValues(string $attributeName): array
    {
        return $this->attributes()
            ->where('attribute_name', $attributeName)
            ->pluck('value')
            ->toArray();
    }

    /**
     * Obtener la marca del producto (primer valor de attribute_name = 'Marca')
     */
    public function getMarcaAttribute(): ?string
    {
        return $this->attributes()
            ->where('attribute_name', 'Marca')
            ->value('value');
    }

    /**
     * Obtener todas las técnicas de aplicación disponibles
     */
    public function getTecnicasAplicacionAttribute(): array
    {
        return $this->getAttributeValues('Técnica de aplicación');
    }

    /**
     * Obtener todos los materiales disponibles
     */
    public function getMaterialesAttribute(): array
    {
        return $this->getAttributeValues('Material');
    }
    /* Atributos end */

    /* Categorias start */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_product')
            ->withPivot('show', 'is_main')
            ->withTimestamps();
    }

    // Mantener un accessor para retrocompatibilidad temporal (opcional)
    public function getCategoryAttribute()
    {
        return $this->categories->first();
    }

    // Obtener la categoría principal
    public function getMainCategoryAttribute()
    {
        return $this->categories()->wherePivot('is_main', true)->first();
    }

    // Obtener solo categorías visibles
    public function getVisibleCategoriesAttribute()
    {
        return $this->categories()->wherePivot('show', true)->get();
    }
    /* Categorias end */

    /* Imagenes  start */
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function featuredImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_featured', true);
    }
    /* Imagenes  end */

    /* Budgets start */
    public function budgetItems()
    {
        return $this->hasMany(BudgetItem::class);
    }
    /* Budgets end */

    // Para el select con búsqueda
    public function scopeForSelect($query, $search = null)
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        return $query->with('categories')
            ->select('id', 'name', 'sku', 'last_price')
            ->orderBy('name');
    }
}
