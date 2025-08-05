<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'url', 'is_featured'];
    protected $appends = ['full_url']; // nuevo nombre del accessor

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Nuevo accesor con otro nombre, para evitar conflicto con el nombre del campo url de la tabla
    public function getFullUrlAttribute()
    {
        $rawUrl = $this->attributes['url'];

        if (Str::startsWith($rawUrl, ['http://', 'https://'])) {
            return $rawUrl;
        }

        return asset('storage/' . $rawUrl);
    }
}
