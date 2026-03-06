<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Budget;
use App\Models\Client;
use App\Models\PickingBudget;
use App\Models\Role;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'email_verified_at',
        'accepts_budget_assignments',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'deleted_at' => 'datetime',
            'accepts_budget_assignments' => 'boolean',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->role?->permissions->pluck('name')->contains($permission);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function pickingBudgets()
    {
        return $this->hasMany(PickingBudget::class, 'vendor_id');
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function scopeVendedores($query)
    {
        return $query->whereHas('role', function ($q) {
            $q->whereIn('name', ['vendedor', 'admin']);
        });
    }
}
