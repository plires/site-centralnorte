<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'last_name',
        'company',
        'email',
        'phone',
        'message',
    ];
}
