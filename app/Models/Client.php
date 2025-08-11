<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company',
        'email',
        'phone',
        'address',
    ];

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    // Método para obtener solo datos básicos (seguridad para vendedores)
    public function getBasicInfo()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'company' => $this->company,
            'email' => $this->email, // Solo para envío de presupuestos
        ];
    }
}
