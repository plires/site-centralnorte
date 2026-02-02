<?php

namespace App\Http\Controllers\Public\Site;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

use Illuminate\Http\Request;

class RseController extends Controller
{
    public function index()
    {
        return Inertia::render('public/site/rse/Rse');
    }
}
