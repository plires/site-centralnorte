<?php

namespace App\Models;

use App\Models\Category;
use App\Models\ProductImage;
use App\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
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
    ];

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

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function featuredImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_featured', true);
    }

    public function budgetItems()
    {
        return $this->hasMany(BudgetItem::class);
    }

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
