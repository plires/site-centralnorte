<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CopackingController extends Controller
{
    public function index()
    {
        return Inertia::render('public/site/copacking/Copacking');
    }
}
