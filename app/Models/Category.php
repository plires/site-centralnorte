<?php

namespace App\Models;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'title',
        'description',
        'meta',
        'icon_url',
        'show',
        'origin',
    ];

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
