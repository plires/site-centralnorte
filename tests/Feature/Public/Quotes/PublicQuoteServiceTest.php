<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Client;
use App\Models\Product;
use App\Models\SellerAssignment;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    Mail::fake();

    // Producto base reutilizable en todos los tests
    $this->product = Product::factory()->create(['last_price' => 1000]);

    // Payload mínimo válido
    $this->validItems = [
        [
            'productId'   => $this->product->id,
            'variantId'   => null,
            'quantity'    => 2,
            'productName' => $this->product->name,
        ],
    ];

    $this->baseCustomer = [
        'name'    => 'Juan Pérez',
        'email'   => 'juan@example.com',
        'company' => 'ACME Corp',
        'phone'   => '123456789',
        'address' => 'Calle Falsa 123',
    ];
});

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Crea un vendedor con accepts_budget_assignments = true (habilitado para round-robin).
 */
function createActiveSeller(): User
{
    return createVendor(); // accepts_budget_assignments default = true (DB default)
}

/**
 * POST al endpoint de solicitud de presupuesto.
 */
function postQuote($test, array $customer, array $items = [], ?string $comments = null)
{
    $payload = array_merge($customer, [
        'items'    => $items,
        'comments' => $comments,
    ]);

    return $test->post(route('public.quote.store'), $payload);
}

// ─── Validaciones del formulario ─────────────────────────────────────────────

it('retorna error si faltan campos obligatorios (name y email)', function () {
    $this->post(route('public.quote.store'), [
        'name'  => '',
        'email' => '',
        'items' => $this->validItems,
    ])
        ->assertRedirect()
        ->assertSessionHasErrors(['name', 'email']);
});

it('retorna error si no hay items en el carrito', function () {
    createActiveSeller();

    $this->post(route('public.quote.store'), array_merge($this->baseCustomer, [
        'items' => [],
    ]))
        ->assertRedirect()
        ->assertSessionHasErrors(['items']);
});

it('retorna error si un item referencia un producto inexistente', function () {
    createActiveSeller();

    $this->post(route('public.quote.store'), array_merge($this->baseCustomer, [
        'items' => [
            ['productId' => 99999, 'variantId' => null, 'quantity' => 1, 'productName' => 'Fake'],
        ],
    ]))
        ->assertRedirect()
        ->assertSessionHasErrors(['items.0.productId']);
});

// ─── findOrCreateClient: creación de cliente nuevo ───────────────────────────

it('crea un nuevo cliente si el email no existe', function () {
    createActiveSeller();

    expect(Client::where('email', 'juan@example.com')->count())->toBe(0);

    postQuote($this, $this->baseCustomer, $this->validItems);

    expect(Client::where('email', 'juan@example.com')->count())->toBe(1);
    expect(Client::where('email', 'juan@example.com')->first()->name)->toBe('Juan Pérez');
});

it('no crea duplicados si el email ya existe, solo actualiza campos con valor', function () {
    createActiveSeller();

    $existing = Client::factory()->create([
        'email'   => 'juan@example.com',
        'name'    => 'Juan Viejo',
        'company' => 'Old Company',
        'phone'   => '000000000',
    ]);

    postQuote($this, $this->baseCustomer, $this->validItems);

    // No se crea un segundo cliente
    expect(Client::where('email', 'juan@example.com')->count())->toBe(1);

    $client = Client::where('email', 'juan@example.com')->first();

    // Los campos con valor nuevo se actualizan
    expect($client->name)->toBe('Juan Pérez');
    expect($client->company)->toBe('ACME Corp');
    expect($client->phone)->toBe('123456789');
});

it('no sobreescribe campos existentes cuando llegan nulos o vacíos', function () {
    createActiveSeller();

    $existing = Client::factory()->create([
        'email'   => 'juan@example.com',
        'company' => 'Original Company',
        'phone'   => '999999999',
    ]);

    // Enviamos company y phone vacíos/nulos
    $customerWithoutOptionals = [
        'name'    => 'Juan Pérez',
        'email'   => 'juan@example.com',
        'company' => null,
        'phone'   => '',
        'address' => null,
    ];

    postQuote($this, $customerWithoutOptionals, $this->validItems);

    $client = $existing->fresh();

    // Los campos no enviados NO se sobreescriben
    expect($client->company)->toBe('Original Company');
    expect($client->phone)->toBe('999999999');
});

it('restaura un cliente soft-deleted y lo actualiza', function () {
    createActiveSeller();

    $deleted = Client::factory()->create([
        'email'   => 'juan@example.com',
        'name'    => 'Juan Eliminado',
    ]);
    $deleted->delete();

    // Verificar que está soft-deleted
    expect(Client::where('email', 'juan@example.com')->count())->toBe(0);
    expect(Client::withTrashed()->where('email', 'juan@example.com')->count())->toBe(1);

    postQuote($this, $this->baseCustomer, $this->validItems);

    // Ahora debe estar activo nuevamente
    $restored = Client::where('email', 'juan@example.com')->first();
    expect($restored)->not->toBeNull();
    expect($restored->deleted_at)->toBeNull();
    expect($restored->name)->toBe('Juan Pérez'); // nombre actualizado

    // No se creó un nuevo registro
    expect(Client::withTrashed()->where('email', 'juan@example.com')->count())->toBe(1);
});

// ─── Asignación de vendedor ───────────────────────────────────────────────────

it('usa round-robin y asigna vendedor cuando el cliente es nuevo', function () {
    $seller = createActiveSeller();

    postQuote($this, $this->baseCustomer, $this->validItems);

    $client = Client::where('email', 'juan@example.com')->first();
    $budget = Budget::where('client_id', $client->id)->first();

    expect($budget->user_id)->toBe($seller->id);
    expect($client->fresh()->user_id)->toBe($seller->id);
});

it('reutiliza el vendedor existente del cliente si está activo', function () {
    $originalSeller = createActiveSeller();
    $anotherSeller  = createActiveSeller();

    // Cliente ya tiene un vendedor asignado
    $client = Client::factory()->create([
        'email'   => 'juan@example.com',
        'user_id' => $originalSeller->id,
    ]);

    postQuote($this, $this->baseCustomer, $this->validItems);

    $budget = Budget::where('client_id', $client->id)->first();

    // El presupuesto se asigna al vendedor original, no al otro
    expect($budget->user_id)->toBe($originalSeller->id);

    // El user_id del cliente no cambia
    expect($client->fresh()->user_id)->toBe($originalSeller->id);
});

it('usa round-robin si el vendedor asignado al cliente está soft-deleted y actualiza user_id del cliente', function () {
    $deletedSeller  = createActiveSeller();
    $activeSeller   = createActiveSeller();

    // Cliente tiene asignado un vendedor que luego se eliminó
    $client = Client::factory()->create([
        'email'   => 'juan@example.com',
        'user_id' => $deletedSeller->id,
    ]);
    $deletedSeller->delete();

    postQuote($this, $this->baseCustomer, $this->validItems);

    $budget = Budget::where('client_id', $client->id)->first();

    // El presupuesto se asigna al vendedor activo
    expect($budget->user_id)->toBe($activeSeller->id);

    // El cliente también queda actualizado con el nuevo vendedor
    expect($client->fresh()->user_id)->toBe($activeSeller->id);
});

it('retorna error si no hay vendedores activos disponibles', function () {
    // Sin ningún vendedor en la base de datos
    postQuote($this, $this->baseCustomer, $this->validItems)
        ->assertRedirect()
        ->assertSessionHas('error');

    // No se creó ningún presupuesto
    expect(Budget::count())->toBe(0);
});

// ─── Creación del presupuesto ─────────────────────────────────────────────────

it('crea el presupuesto con estado unsent', function () {
    createActiveSeller();

    postQuote($this, $this->baseCustomer, $this->validItems);

    $client = Client::where('email', 'juan@example.com')->first();
    $budget = Budget::where('client_id', $client->id)->first();

    expect($budget)->not->toBeNull();
    expect($budget->status)->toBe(BudgetStatus::UNSENT);
});

it('crea los items del presupuesto correctamente', function () {
    createActiveSeller();

    $items = [
        [
            'productId'   => $this->product->id,
            'variantId'   => null,
            'quantity'    => 3,
            'productName' => 'Producto Test',
        ],
    ];

    postQuote($this, $this->baseCustomer, $items);

    $client = Client::where('email', 'juan@example.com')->first();
    $budget = Budget::where('client_id', $client->id)->first();

    expect($budget->items)->toHaveCount(1);
    expect($budget->items->first()->quantity)->toBe(3);
    expect($budget->items->first()->product_id)->toBe($this->product->id);
});

it('crea el presupuesto con los comentarios del cliente', function () {
    createActiveSeller();

    postQuote($this, $this->baseCustomer, $this->validItems, 'Necesito para el viernes.');

    $client = Client::where('email', 'juan@example.com')->first();
    $budget = Budget::where('client_id', $client->id)->first();

    expect($budget->footer_comments)->toBe('Necesito para el viernes.');
});

it('redirige a la página de éxito tras crear el presupuesto', function () {
    createActiveSeller();

    postQuote($this, $this->baseCustomer, $this->validItems)
        ->assertRedirect(route('public.quote.success'));
});

it('encola email de notificación al vendedor', function () {
    createActiveSeller();

    postQuote($this, $this->baseCustomer, $this->validItems);

    // NewQuoteRequestMail implementa ShouldQueue, por eso se encola en lugar de enviarse directamente
    Mail::assertQueued(\App\Mail\NewQuoteRequestMail::class);
});

it('no crea el presupuesto si la transacción falla (rollback)', function () {
    // Sin vendedor → el servicio lanza excepción dentro de la transacción
    expect(Budget::count())->toBe(0);

    postQuote($this, $this->baseCustomer, $this->validItems);

    expect(Budget::count())->toBe(0);
    expect(Client::count())->toBe(0); // rollback completo
});
