<?php
/**
 * ============================================================================
 * RUTAS API PÚBLICAS PARA SLIDES
 * ============================================================================
 * 
 * Crear el archivo routes/api.php si no existe, o agregar estas rutas.
 * 
 * Si el archivo ya existe, agregar el import:
 * use App\Http\Controllers\Api\PublicSlideController;
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicSlideController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rutas API públicas para consumo externo (sin autenticación)
|
*/

// ============================================================================
// SLIDES DEL CARRUSEL - API PÚBLICA
// ============================================================================
Route::prefix('v1')->name('api.v1.')->group(function () {
    
    // GET /api/v1/slides - Obtener todos los slides activos
    Route::get('/slides', [PublicSlideController::class, 'index'])
        ->name('slides.index');
    
    // GET /api/v1/slides/{id} - Obtener un slide específico
    Route::get('/slides/{id}', [PublicSlideController::class, 'show'])
        ->name('slides.show');
});
