<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Dashboard\RoleController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Public\NosotrosController;
use App\Http\Controllers\Dashboard\BudgetController;
use App\Http\Controllers\Dashboard\ClientController;
use App\Http\Controllers\Dashboard\ProductController;
use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Public\PublicBudgetController;
use App\Http\Controllers\Public\PublicPickingBudgetController;
use App\Http\Controllers\Dashboard\ProductImageController;
use App\Http\Controllers\Dashboard\SlideController;

// ===========================================================================
// RUTAS PÚBLICAS (sin autenticación)
// ===========================================================================

Route::get('/', [HomeController::class, 'index'])
    ->name('public.home');

Route::get('/nosotros', [NosotrosController::class, 'index'])
    ->name('public.nosotros');

// Vista pública del presupuesto de Merch
Route::prefix('presupuesto')->name('public.budget.')->group(function () {
    Route::get('/{token}', [PublicBudgetController::class, 'show'])
        ->name('show');
    Route::get('/{token}/pdf', [PublicBudgetController::class, 'downloadPdf'])
        ->name('pdf');
    // Acciones del cliente (aprobar/rechazar)
    Route::post('/{token}/aprobar', [PublicBudgetController::class, 'approve'])
        ->name('approve');
    Route::post('/{token}/rechazar', [PublicBudgetController::class, 'reject'])
        ->name('reject');
});

// Vista pública del presupuesto de Picking
Route::prefix('presupuesto-picking')->name('public.picking.budget.')->group(function () {
    Route::get('/{token}', [PublicPickingBudgetController::class, 'show'])
        ->name('show');
    Route::get('/{token}/pdf', [PublicPickingBudgetController::class, 'downloadPdf'])
        ->name('pdf');
    // Acciones del cliente (aprobar/rechazar)
    Route::post('/{token}/aprobar', [PublicPickingBudgetController::class, 'approve'])
        ->name('approve');
    Route::post('/{token}/rechazar', [PublicPickingBudgetController::class, 'reject'])
        ->name('reject');
});

// ===========================================================================
// DASHBOARD - Rutas autenticadas
// ===========================================================================

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard.home');
});

// Images Products
Route::middleware(['auth', 'verified', 'permission:gestionar_imagenes_de_productos'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::delete('/products/images/{product}/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');
    Route::patch('/products/images/{product}/{image}/set-featured', [ProductImageController::class, 'setFeatured'])->name('products.images.set-featured');
    Route::post('/products/images/{product}', [ProductImageController::class, 'store'])->name('products.images.store');
});

// Usuarios
Route::middleware(['auth', 'verified', 'permission:gestionar_usuarios'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

// Clientes
Route::middleware(['auth', 'verified', 'permission:gestionar_clientes'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('/clients/create', [ClientController::class, 'create'])->name('clients.create');
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
    Route::get('/clients/{client}', [ClientController::class, 'show'])->name('clients.show');
    Route::get('/clients/{client}/edit', [ClientController::class, 'edit'])->name('clients.edit');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
});

// Roles
Route::middleware(['auth', 'verified', 'permission:gestionar_roles'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
});

// Productos
Route::middleware(['auth', 'verified', 'permission:gestionar_productos'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Sincronización manual
    Route::post('/products/sync', [ProductController::class, 'sync'])->name('products.sync');
    Route::post('/products/sync/{sku}', [ProductController::class, 'syncOne'])->name('products.sync.one');
});

// Categorias
Route::middleware(['auth', 'verified', 'permission:gestionar_categorias'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
});

// Presupuestos de Merchandising
Route::middleware(['auth', 'verified', 'permission:gestionar_presupuestos_merch'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
    Route::get('/budgets/create', [BudgetController::class, 'create'])->name('budgets.create');
    Route::post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
    Route::get('/budgets/{budget}', [BudgetController::class, 'show'])->name('budgets.show');
    Route::get('/budgets/{budget}/edit', [BudgetController::class, 'edit'])->name('budgets.edit');
    Route::put('/budgets/{budget}', [BudgetController::class, 'update'])->name('budgets.update');
    Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');

    // Acciones especiales
    Route::get('/budgets/{budget}/duplicate', [BudgetController::class, 'duplicate'])->name('budgets.duplicate');
    Route::post('/budgets/{budget}/send-email', [BudgetController::class, 'sendEmail'])->name('budgets.send-email');
    Route::patch('/budgets/{budget}/status', [BudgetController::class, 'updateStatus'])->name('budgets.update-status');
});

// Slides (carrusel)
Route::middleware(['auth', 'verified', 'permission:gestionar_slides'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/slides', [SlideController::class, 'index'])->name('slides.index');
    Route::get('/slides/create', [SlideController::class, 'create'])->name('slides.create');
    Route::post('/slides', [SlideController::class, 'store'])->name('slides.store');
    Route::get('/slides/{slide}', [SlideController::class, 'show'])->name('slides.show');
    Route::get('/slides/{slide}/edit', [SlideController::class, 'edit'])->name('slides.edit');
    Route::put('/slides/{slide}', [SlideController::class, 'update'])->name('slides.update');
    Route::delete('/slides/{slide}', [SlideController::class, 'destroy'])->name('slides.destroy');
    Route::post('/slides/update-order', [SlideController::class, 'updateOrder'])
        ->name('slides.update-order');
});

// API para selects dinámicos (requiere autenticación)
Route::middleware(['auth', 'verified'])->prefix('api')->name('api.')->group(function () {
    Route::get('/products/search', [ApiController::class, 'searchProducts'])->name('products.search');
    Route::get('/clients/search', [ApiController::class, 'searchClients'])->name('clients.search');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/picking.php';
