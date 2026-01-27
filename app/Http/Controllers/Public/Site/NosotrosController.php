<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NosotrosController extends Controller
{
    public function index()
    {
        return Inertia::render('public/site/nosotros/Nosotros');
    }
}
