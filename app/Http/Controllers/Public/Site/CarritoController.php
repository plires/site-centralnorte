<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use App\Http\Controllers\Controller;

class CarritoController extends Controller
{
    public function index()
    {
        return Inertia::render('public/site/carrito/Carrito');
    }
}
