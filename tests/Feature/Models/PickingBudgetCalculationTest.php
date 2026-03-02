<?php

use App\Models\PickingBudget;
use App\Models\PickingBudgetBox;
use App\Models\PickingBudgetService;
use App\Enums\PickingServiceType;

beforeEach(function () {
    // Fijar IVA a valor conocido para que los tests sean deterministas
    config(['business.tax.iva_rate' => 0.21, 'business.tax.apply_iva' => true]);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Crea un presupuesto picking con valores conocidos y sin items aún.
 */
function makePickingBudget(array $overrides = []): PickingBudget
{
    return PickingBudget::factory()->create(array_merge([
        'total_kits' => 100,
        'component_increment_percentage' => 0,
        'payment_condition_percentage' => null,
        'payment_condition_amount' => 0,
        'services_subtotal' => 0,
        'component_increment_amount' => 0,
        'subtotal_with_increment' => 0,
        'box_total' => 0,
        'total' => 0,
        'unit_price_per_kit' => 0,
    ], $overrides));
}

/**
 * Agrega un servicio al presupuesto (sin auto-recálculo del budget).
 */
function addService(PickingBudget $budget, float $unitCost, int $quantity): PickingBudgetService
{
    return PickingBudgetService::create([
        'picking_budget_id' => $budget->id,
        'service_type' => PickingServiceType::ASSEMBLY,
        'service_description' => 'Test service',
        'unit_cost' => $unitCost,
        'quantity' => $quantity,
        'subtotal' => $unitCost * $quantity,
    ]);
}

/**
 * Agrega una caja al presupuesto.
 * El boot de PickingBudgetBox calcula el subtotal automáticamente.
 */
function addBox(PickingBudget $budget, float $unitCost, int $quantity): PickingBudgetBox
{
    return PickingBudgetBox::create([
        'picking_budget_id' => $budget->id,
        'box_dimensions' => '20x30x10',
        'box_unit_cost' => $unitCost,
        'quantity' => $quantity,
        // subtotal se calcula en el boot del modelo
    ]);
}

/**
 * Ejecuta calculateTotals() y persiste, devuelve el budget refrescado.
 */
function recalculate(PickingBudget $budget): PickingBudget
{
    $budget->calculateTotals();
    $budget->save();
    return $budget->fresh();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

it('calcula el subtotal de servicios correctamente', function () {
    $budget = makePickingBudget();

    addService($budget, 50, 100);  // 5000
    addService($budget, 20, 50);   // 1000

    $budget = recalculate($budget);

    expect((float) $budget->services_subtotal)->toBe(6000.0);
});

it('aplica el incremento de componentes solo sobre el subtotal de servicios', function () {
    // component_increment_percentage = 0.10 (10%), se multiplica directamente
    $budget = makePickingBudget(['component_increment_percentage' => 0.10]);

    addService($budget, 100, 50);  // services_subtotal = 5000
    addBox($budget, 30, 10);       // box_total = 300 (no debe afectar el incremento)

    $budget = recalculate($budget);

    // component_increment_amount = 5000 × 0.10 = 500
    // subtotal_with_increment = 5000 + 500 = 5500
    expect((float) $budget->services_subtotal)->toBe(5000.0);
    expect((float) $budget->component_increment_amount)->toBe(500.0);
    expect((float) $budget->subtotal_with_increment)->toBe(5500.0);
    // Las cajas son aparte
    expect((float) $budget->box_total)->toBe(300.0);
});

it('calcula el box_total por separado sin afectar el incremento de componentes', function () {
    $budget = makePickingBudget(['component_increment_percentage' => 0.20]);

    addService($budget, 50, 100);  // services_subtotal = 5000
    addBox($budget, 25, 4);        // 100
    addBox($budget, 10, 10);       // 100

    $budget = recalculate($budget);

    // component_increment_amount = 5000 × 0.20 = 1000 (no incluye cajas)
    expect((float) $budget->component_increment_amount)->toBe(1000.0);
    expect((float) $budget->box_total)->toBe(200.0);
    // base_subtotal = 5000 + 1000 + 200 = 6200
});

it('aplica la condicion de pago sobre el base_subtotal (servicios+incremento+cajas)', function () {
    // payment_condition_percentage = -10 → descuento 10% (número crudo, se divide /100)
    $budget = makePickingBudget([
        'component_increment_percentage' => 0.00,
        'payment_condition_percentage' => -10,
    ]);

    addService($budget, 100, 50);  // 5000
    addBox($budget, 50, 2);        // 100

    $budget = recalculate($budget);

    // base_subtotal = 5000 + 0 + 100 = 5100
    // payment_condition_amount = 5100 × (−10/100) = −510
    expect((float) $budget->payment_condition_amount)->toBe(-510.0);
});

it('el iva se aplica despues de la condicion de pago', function () {
    $budget = makePickingBudget([
        'component_increment_percentage' => 0.00,
        'payment_condition_percentage' => -10,
    ]);

    addService($budget, 1000, 1);  // 1000

    $budget = recalculate($budget);

    // base_subtotal = 1000
    // payment_condition_amount = 1000 × (−10/100) = −100
    // subtotal_with_payment = 1000 − 100 = 900
    // total = 900 × 1.21 = 1089
    expect((float) $budget->total)->toBe(1089.0);
});

it('calcula el precio unitario por kit', function () {
    $budget = makePickingBudget([
        'total_kits' => 100,
        'component_increment_percentage' => 0.00,
    ]);

    addService($budget, 50, 100);  // 5000

    $budget = recalculate($budget);

    // total = 5000 × 1.21 = 6050
    // unit_price_per_kit = 6050 / 100 = 60.50
    expect((float) $budget->total)->toBe(6050.0);
    expect((float) $budget->unit_price_per_kit)->toBe(60.5);
});

it('unit_price_per_kit es cero cuando total_kits es cero', function () {
    $budget = makePickingBudget(['total_kits' => 0, 'component_increment_percentage' => 0.00]);

    addService($budget, 50, 10);

    $budget = recalculate($budget);

    expect((float) $budget->unit_price_per_kit)->toBe(0.0);
});

it('sin incremento de componentes el subtotal_with_increment es igual al services_subtotal', function () {
    $budget = makePickingBudget(['component_increment_percentage' => 0.00]);

    addService($budget, 80, 25);  // 2000

    $budget = recalculate($budget);

    expect((float) $budget->component_increment_amount)->toBe(0.0);
    expect((float) $budget->subtotal_with_increment)->toBe(2000.0);
});

it('sin condicion de pago el payment_condition_amount es cero', function () {
    $budget = makePickingBudget([
        'component_increment_percentage' => 0.00,
        'payment_condition_percentage' => null,
    ]);

    addService($budget, 100, 10);  // 1000

    $budget = recalculate($budget);

    // total = 1000 × 1.21 = 1210
    expect((float) $budget->payment_condition_amount)->toBe(0.0);
    expect((float) $budget->total)->toBe(1210.0);
});

it('calcula correctamente sin iva cuando apply_iva es false', function () {
    config(['business.tax.apply_iva' => false]);

    $budget = makePickingBudget(['component_increment_percentage' => 0.00]);

    addService($budget, 200, 5);  // 1000

    $budget = recalculate($budget);

    // Sin IVA: total = 1000
    expect((float) $budget->total)->toBe(1000.0);
});

it('el subtotal de cada caja se calcula automaticamente por el boot del modelo', function () {
    $budget = makePickingBudget();

    $box = addBox($budget, 45.50, 10);
    $box->refresh();

    // subtotal = 45.50 × 10 = 455
    expect((float) $box->subtotal)->toBe(455.0);
});

it('calcula el escenario completo con servicios, cajas, incremento y condicion de pago', function () {
    $budget = makePickingBudget([
        'total_kits' => 200,
        'component_increment_percentage' => 0.10,
        'payment_condition_percentage' => 5,
    ]);

    addService($budget, 50, 200);   // 10000 (armado)
    addService($budget, 200, 1);    // 200  (palletizado)
    addBox($budget, 30, 200);       // 6000

    $budget = recalculate($budget);

    // services_subtotal = 10200
    // component_increment_amount = 10200 × 0.10 = 1020
    // subtotal_with_increment = 11220
    // box_total = 6000
    // base_subtotal = 17220
    // payment_condition_amount = 17220 × (5/100) = 861
    // subtotal_with_payment = 18081
    // total = 18081 × 1.21 = 21878.01
    // unit_price_per_kit = 21878.01 / 200 = 109.39

    expect((float) $budget->services_subtotal)->toBe(10200.0);
    expect((float) $budget->component_increment_amount)->toBe(1020.0);
    expect((float) $budget->subtotal_with_increment)->toBe(11220.0);
    expect((float) $budget->box_total)->toBe(6000.0);
    expect((float) $budget->payment_condition_amount)->toBe(861.0);
    expect((float) $budget->total)->toBe(21878.01);
    expect((float) $budget->unit_price_per_kit)->toBe(109.39);
});
