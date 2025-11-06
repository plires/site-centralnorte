<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductAttribute extends Model
{
  use HasFactory;

  protected $fillable = [
    'product_id',
    'external_id',
    'attribute_name',
    'value',
  ];

  /**
   * Relación con Product
   */
  public function product(): BelongsTo
  {
    return $this->belongsTo(Product::class);
  }

  /**
   * Scope para filtrar por nombre de atributo
   * 
   * @param \Illuminate\Database\Eloquent\Builder $query
   * @param string $attributeName
   * @return \Illuminate\Database\Eloquent\Builder
   */
  public function scopeOfType($query, string $attributeName)
  {
    return $query->where('attribute_name', $attributeName);
  }

  /**
   * Scope para filtrar por valor
   * 
   * @param \Illuminate\Database\Eloquent\Builder $query
   * @param string $value
   * @return \Illuminate\Database\Eloquent\Builder
   */
  public function scopeWithValue($query, string $value)
  {
    return $query->where('value', $value);
  }
}
