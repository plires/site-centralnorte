<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Dashboard\RoleController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\SlideController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Public\Site\RseController;
use App\Http\Controllers\Dashboard\BudgetController;
use App\Http\Controllers\Dashboard\ClientController;
use App\Http\Controllers\Public\Site\HomeController;
use App\Http\Controllers\Dashboard\ProductController;
use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Public\PublicBudgetController;
use App\Http\Controllers\Public\Site\ContactoController;
use App\Http\Controllers\Public\Site\NosotrosController;
use App\Http\Controllers\Public\Site\CopackingController;
use App\Http\Controllers\Public\Site\ProductosController;
use App\Http\Controllers\Public\Site\CarritoController;
use App\Http\Controllers\Public\Site\SolicitarPresupuestoController;
use App\Http\Controllers\Dashboard\ProductImageController;
use App\Http\Controllers\Public\Site\NewsletterController;
use App\Http\Controllers\Public\PublicPickingBudgetController;

// ===========================================================================
// RUTAS PÚBLICAS (sin autenticación)
// ===========================================================================

Route::get('/', [HomeController::class, 'index'])
    ->name('public.home');

Route::get('/nosotros', [NosotrosController::class, 'index'])
    ->name('public.nosotros');

Route::get('/rse', [RseController::class, 'index'])
    ->name('public.rse');

Route::get('/copacking', [CopackingController::class, 'index'])
    ->name('public.copacking');

Route::get('/contacto', [ContactoController::class, 'index'])
    ->name('public.contacto');

Route::post('/contacto', [ContactoController::class, 'send'])
    ->name('public.contacto.send');

Route::get('/products', [ProductosController::class, 'index'])
    ->name('public.products');

Route::get('/products/search', [ProductosController::class, 'search'])
    ->name('public.products.search');

Route::get('/products/{product}', [ProductosController::class, 'show'])
    ->name('public.products.show');

// Carrito de presupuesto
Route::get('/carrito', [CarritoController::class, 'index'])
    ->name('public.cart');

// Solicitar presupuesto (checkout)
Route::get('/solicitar-presupuesto', [SolicitarPresupuestoController::class, 'index'])
    ->name('public.quote.request');
Route::post('/solicitar-presupuesto', [SolicitarPresupuestoController::class, 'store'])
    ->name('public.quote.store');
Route::get('/presupuesto-enviado', [SolicitarPresupuestoController::class, 'success'])
    ->name('public.quote.success');

// Newsletter
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])
    ->name('public.newsletter.subscribe');

// Vista pública del presupuesto de Merch
Route::prefix('presupuesto')->name('public.budget.')->group(function () {
    Route::get('/{token}', [PublicBudgetController::class, 'show'])
        ->name('show');
    Route::get('/{token}/pdf', [PublicBudgetController::class, 'downloadPdf'])
        ->name('pdf');
    // Acciones del cliente (aprobar/evaluar)
    Route::post('/{token}/aprobar', [PublicBudgetController::class, 'approve'])
        ->name('approve');
    Route::post('/{token}/en-evaluacion', [PublicBudgetController::class, 'inReview'])
        ->name('in_review');
});

// Vista pública del presupuesto de Picking
Route::prefix('presupuesto-picking')->name('public.picking.budget.')->group(function () {
    Route::get('/{token}', [PublicPickingBudgetController::class, 'show'])
        ->name('show');
    Route::get('/{token}/pdf', [PublicPickingBudgetController::class, 'downloadPdf'])
        ->name('pdf');
    // Acciones del cliente (aprobar/evaluar)
    Route::post('/{token}/aprobar', [PublicPickingBudgetController::class, 'approve'])
        ->name('approve');
    Route::post('/{token}/en-evaluacion', [PublicPickingBudgetController::class, 'inReview'])
        ->name('in_review');
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
    Route::patch('/products/images/{product}/{image}/update-variant', [ProductImageController::class, 'updateVariant'])->name('products.images.update-variant');
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

    Route::get('/clients/export', [ClientController::class, 'export'])
        ->name('clients.export')
        ->middleware('admin');

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

    Route::get('/products/export', [ProductController::class, 'export'])
        ->name('products.export')
        ->middleware('admin');

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

    Route::get('/categories/export', [CategoryController::class, 'export'])
        ->name('categories.export')
        ->middleware('admin');

    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::get('/categories/{category}/catalog-pdf', [CategoryController::class, 'downloadCatalogPdf'])->name('categories.catalog-pdf');
});

// Presupuestos de Merchandising
Route::middleware(['auth', 'verified', 'permission:gestionar_presupuestos_merch'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');

    Route::get('/budgets/export', [BudgetController::class, 'export'])
        ->name('budgets.export')
        ->middleware('admin');

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
    Route::get('/budgets/{budget}/pdf', [BudgetController::class, 'downloadPdf'])->name('budgets.pdf');
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
    Route::get('/products/{id}', [ApiController::class, 'getProduct'])->name('products.show');
    Route::get('/clients/search', [ApiController::class, 'searchClients'])->name('clients.search');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/picking.php';
