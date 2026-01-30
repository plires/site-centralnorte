<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NewsletterSubscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'source',
        'is_active',
        'synced_to_perfit',
        'synced_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'synced_to_perfit' => 'boolean',
        'synced_at' => 'datetime',
    ];

    /**
     * Scope para obtener solo suscriptores activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para obtener suscriptores pendientes de sincronizar con Perfit
     */
    public function scopePendingSync($query)
    {
        return $query->where('synced_to_perfit', false);
    }

    /**
     * Marcar como sincronizado con Perfit
     */
    public function markAsSynced(): void
    {
        $this->update([
            'synced_to_perfit' => true,
            'synced_at' => now(),
        ]);
    }
}
