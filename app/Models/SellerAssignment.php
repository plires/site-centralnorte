<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_type',
        'last_assigned_user_id',
    ];

    /**
     * Relación con el último vendedor asignado
     */
    public function lastAssignedUser()
    {
        return $this->belongsTo(User::class, 'last_assigned_user_id');
    }

    /**
     * Obtener el siguiente vendedor disponible usando round-robin
     *
     * @param string $type Tipo de asignación ('merch_budget', 'picking_budget', etc.)
     * @return User|null
     */
    public static function getNextSeller(string $type = 'merch_budget'): ?User
    {
        // Obtener todos los vendedores activos (con rol vendedor)
        $sellers = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['vendedor']);
        })
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get();

        if ($sellers->isEmpty()) {
            return null;
        }

        // Si solo hay un vendedor, retornarlo
        if ($sellers->count() === 1) {
            self::updateAssignment($type, $sellers->first()->id);
            return $sellers->first();
        }

        // Obtener o crear el registro de asignación
        $assignment = self::firstOrCreate(
            ['assignment_type' => $type],
            ['last_assigned_user_id' => null]
        );

        // Si no hay último asignado, asignar al primero
        if (!$assignment->last_assigned_user_id) {
            $nextSeller = $sellers->first();
            self::updateAssignment($type, $nextSeller->id);
            return $nextSeller;
        }

        // Encontrar el índice del último vendedor asignado
        $lastIndex = $sellers->search(function ($seller) use ($assignment) {
            return $seller->id === $assignment->last_assigned_user_id;
        });

        // Si el último vendedor ya no existe, empezar desde el primero
        if ($lastIndex === false) {
            $nextSeller = $sellers->first();
        } else {
            // Obtener el siguiente vendedor (circular)
            $nextIndex = ($lastIndex + 1) % $sellers->count();
            $nextSeller = $sellers->get($nextIndex);
        }

        // Actualizar el registro
        self::updateAssignment($type, $nextSeller->id);

        return $nextSeller;
    }

    /**
     * Actualizar la última asignación
     */
    private static function updateAssignment(string $type, int $userId): void
    {
        self::updateOrCreate(
            ['assignment_type' => $type],
            ['last_assigned_user_id' => $userId]
        );
    }
}
