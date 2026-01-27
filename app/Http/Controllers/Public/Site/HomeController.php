<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use App\Models\Slide;
use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('public/site/home/Home', [
            'slides' => Slide::active()->ordered()->get(),
        ]);
    }
}
