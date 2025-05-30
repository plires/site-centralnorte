<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\NosotrosController;
use App\Http\Controllers\Dashboard\DashboardController;

Route::get('/', [HomeController::class, 'index'])
    ->name('public.home');
Route::get('/nosotros', [NosotrosController::class, 'index'])
    ->name('public.nosotros');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard.home');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
