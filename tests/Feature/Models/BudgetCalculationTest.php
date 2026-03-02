<?php

use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Client;
use App\Models\User;

beforeEach(function () {
    // Fijar IVA a valor conocido para que los tests sean deterministas
    config(['business.tax.iva_rate' => 0.21, 'business.tax.apply_iva' => true]);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Crea un presupuesto merch sin condición de pago y sin items.
 */
function makeBudget(array $overrides = []): Budget
{
    return Budget::factory()->create(array_merge([
        'payment_condition_percentage' => null,
        'payment_condition_amount' => 0,
        'subtotal' => 0,
        'total' => 0,
    ], $overrides));
}

/**
 * Agrega un item regular al presupuesto y devuelve el budget refrescado desde DB.
 */
function addItem(Budget $budget, int $quantity, float $unitPrice, ?string $variantGroup = null, bool $isSelected = true): Budget
{
    BudgetItem::factory()->create([
        'budget_id' => $budget->id,
        'quantity' => $quantity,
        'unit_price' => $unitPrice,
        'variant_group' => $variantGroup,
        'is_variant' => $variantGroup !== null,
        'is_selected' => $isSelected,
    ]);

    // BudgetItem::saved dispara calculateTotals() → save() en el Budget
    // Necesitamos refrescar para ver los valores persistidos
    return $budget->fresh();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

it('calcula el subtotal de items regulares sin condición de pago', function () {
    $budget = makeBudget();

    addItem($budget, 2, 1000);
    $budget = addItem($budget, 3, 500);

    // subtotal = (2 × 1000) + (3 × 500) = 3500
    // total    = 3500 × 1.21 = 4235
    expect((float) $budget->subtotal)->toBe(3500.0);
    expect((float) $budget->total)->toBe(4235.0);
});

it('solo suma la variante seleccionada de cada grupo', function () {
    $budget = makeBudget();
    $group = 'grupo-colores';

    // Variante seleccionada: 1 × 2000
    addItem($budget, 1, 2000, $group, true);
    // Variante NO seleccionada: 1 × 3000 — no debe sumarse
    $budget = addItem($budget, 1, 3000, $group, false);

    // subtotal = 1 × 2000 = 2000
    // total    = 2000 × 1.21 = 2420
    expect((float) $budget->subtotal)->toBe(2000.0);
    expect((float) $budget->total)->toBe(2420.0);
});

it('no suma variantes no seleccionadas aunque pertenezcan a grupos distintos', function () {
    $budget = makeBudget();

    // Item regular
    addItem($budget, 2, 500);

    // Grupo 1: seleccionada $1000, no seleccionada $1500
    addItem($budget, 1, 1000, 'grupo-1', true);
    addItem($budget, 1, 1500, 'grupo-1', false);

    // Grupo 2: seleccionada $800, no seleccionada $2000
    addItem($budget, 1, 800, 'grupo-2', true);
    $budget = addItem($budget, 1, 2000, 'grupo-2', false);

    // subtotal = 2×500 + 1×1000 + 1×800 = 2800
    expect((float) $budget->subtotal)->toBe(2800.0);
});

it('aplica la condición de pago como descuento (porcentaje negativo)', function () {
    // payment_condition_percentage = -10 → descuento del 10%
    $budget = makeBudget(['payment_condition_percentage' => -10]);
    $budget = addItem($budget, 1, 1000);

    // subtotal = 1000
    // payment_condition_amount = 1000 × (−10/100) = −100
    // subtotal_with_payment = 1000 − 100 = 900
    // total = 900 × 1.21 = 1089
    expect((float) $budget->subtotal)->toBe(1000.0);
    expect((float) $budget->payment_condition_amount)->toBe(-100.0);
    expect((float) $budget->total)->toBe(1089.0);
});

it('aplica la condición de pago como recargo (porcentaje positivo)', function () {
    // payment_condition_percentage = 5 → recargo del 5%
    $budget = makeBudget(['payment_condition_percentage' => 5]);
    $budget = addItem($budget, 1, 2000);

    // subtotal = 2000
    // payment_condition_amount = 2000 × (5/100) = 100
    // subtotal_with_payment = 2100
    // total = 2100 × 1.21 = 2541
    expect((float) $budget->subtotal)->toBe(2000.0);
    expect((float) $budget->payment_condition_amount)->toBe(100.0);
    expect((float) $budget->total)->toBe(2541.0);
});

it('el iva se aplica despues de la condicion de pago', function () {
    $budget = makeBudget(['payment_condition_percentage' => -10]);
    $budget = addItem($budget, 1, 1000);

    // El IVA debe calcularse sobre subtotal_with_payment (900), no sobre subtotal (1000)
    $subtotalWithPayment = (float) $budget->subtotal + (float) $budget->payment_condition_amount;
    $expectedIva = $subtotalWithPayment * 0.21;
    $expectedTotal = $subtotalWithPayment + $expectedIva;

    expect((float) $budget->total)->toBe(round($expectedTotal, 2));
});

it('calcula correctamente sin condicion de pago', function () {
    $budget = makeBudget(['payment_condition_percentage' => null]);
    $budget = addItem($budget, 4, 250);

    // subtotal = 1000, payment_condition_amount = 0, total = 1000 × 1.21 = 1210
    expect((float) $budget->subtotal)->toBe(1000.0);
    expect((float) $budget->payment_condition_amount)->toBe(0.0);
    expect((float) $budget->total)->toBe(1210.0);
});

it('calcula correctamente sin iva cuando apply_iva es false', function () {
    config(['business.tax.apply_iva' => false]);

    $budget = makeBudget();
    $budget = addItem($budget, 2, 500);

    // subtotal = 1000, sin IVA: total = 1000
    expect((float) $budget->subtotal)->toBe(1000.0);
    expect((float) $budget->total)->toBe(1000.0);
});

it('calcula correctamente con items mixtos de regulares y variantes', function () {
    $budget = makeBudget();

    // Item regular
    addItem($budget, 2, 300);             // 600

    // Grupo con variante seleccionada y no seleccionada
    addItem($budget, 1, 500, 'grp-a', true);   // 500 (suma)
    addItem($budget, 1, 800, 'grp-a', false);  // 800 (NO suma)

    // Segundo item regular
    $budget = addItem($budget, 5, 100);   // 500

    // subtotal = 600 + 500 + 500 = 1600
    // total = 1600 × 1.21 = 1936
    expect((float) $budget->subtotal)->toBe(1600.0);
    expect((float) $budget->total)->toBe(1936.0);
});

it('line_total de cada item es quantity por unit_price', function () {
    $budget = makeBudget();

    $item = BudgetItem::factory()->create([
        'budget_id' => $budget->id,
        'quantity' => 7,
        'unit_price' => 350,
        'variant_group' => null,
        'is_selected' => true,
    ]);

    // El boot de BudgetItem calcula line_total automáticamente
    expect((float) $item->fresh()->line_total)->toBe(2450.0);
});

it('eliminar un item recalcula los totales', function () {
    $budget = makeBudget();

    $itemA = BudgetItem::factory()->create([
        'budget_id' => $budget->id,
        'quantity' => 1,
        'unit_price' => 1000,
        'variant_group' => null,
        'is_selected' => true,
    ]);

    BudgetItem::factory()->create([
        'budget_id' => $budget->id,
        'quantity' => 1,
        'unit_price' => 500,
        'variant_group' => null,
        'is_selected' => true,
    ]);

    $budget->refresh();
    expect((float) $budget->subtotal)->toBe(1500.0);

    // Eliminar el primer item
    $itemA->delete();

    $budget->refresh();
    // subtotal = 500, total = 500 × 1.21 = 605
    expect((float) $budget->subtotal)->toBe(500.0);
    expect((float) $budget->total)->toBe(605.0);
});
