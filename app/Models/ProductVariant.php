<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
  use HasFactory;

  const TYPE_APPAREL = 'apparel';
  const TYPE_STANDARD = 'standard';

  protected $fillable = [
    'product_id',
    'external_id',
    'sku',
    'size',
    'color',
    'element_1',
    'element_2',
    'element_3',
    'stock',
    'primary_color',
    'secondary_color',
    'variant_type',
  ];

  protected $casts = [
    'stock' => 'integer',
  ];

  /**
   * Relación con Product
   */
  public function product(): BelongsTo
  {
    return $this->belongsTo(Product::class);
  }

  /**
   * Scope para filtrar variantes tipo Apparel
   */
  public function scopeApparel($query)
  {
    return $query->where('variant_type', self::TYPE_APPAREL);
  }

  /**
   * Scope para filtrar variantes tipo Standard
   */
  public function scopeStandard($query)
  {
    return $query->where('variant_type', self::TYPE_STANDARD);
  }

  /**
   * Scope para filtrar variantes con stock disponible
   */
  public function scopeInStock($query)
  {
    return $query->where('stock', '>', 0);
  }

  /**
   * Scope para filtrar variantes sin stock
   */
  public function scopeOutOfStock($query)
  {
    return $query->where('stock', '<=', 0);
  }

  /**
   * Obtener descripción completa de la variante
   */
  public function getFullDescriptionAttribute(): string
  {
    if ($this->variant_type === self::TYPE_APPAREL) {
      $parts = array_filter([
        $this->size,
        $this->color,
      ]);
      return implode(' - ', $parts);
    }

    // Para standard, unir los 3 elementos
    $parts = array_filter([
      $this->element_1,
      $this->element_2,
      $this->element_3,
    ]);
    return implode(' / ', $parts);
  }

  /**
   * Verificar si la variante está en stock
   */
  public function isInStock(): bool
  {
    return $this->stock > 0;
  }
}
