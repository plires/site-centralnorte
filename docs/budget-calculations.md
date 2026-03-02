# Cálculo de Totales — Presupuestos

Documentación de referencia sobre cómo se calculan los totales en los dos tipos de presupuesto del sistema: **Merch** (`Budget`) y **Picking** (`PickingBudget`).

---

## Dónde ocurren los cálculos

Los cálculos se realizan en **dos lugares** que deben mantenerse sincronizados:

| Capa | Cuándo | Responsable |
|---|---|---|
| **Servidor (PHP)** | Al guardar en DB (create / update / duplicate) | `Budget::calculateTotals()` / `PickingBudget::calculateTotals()` |
| **Cliente (React)** | En tiempo real, mientras el usuario edita el formulario o visualiza el show | `useBudgetLogic.js` / `usePickingBudgetLogic.jsx` |

Los cambios de estado (`updateStatus`) **no recalculan totales**.

---

## Convención de porcentajes

El sistema usa **dos convenciones distintas** según el campo:

| Campo | Convención | Ejemplo |
|---|---|---|
| `payment_condition_percentage` | Número crudo (`/100` en el cálculo) | `10` → 10%, `-10` → descuento 10% |
| `component_increment_percentage` | Decimal (`×` directamente) | `0.10` → 10%, `0.40` → 40% |

---

## 1. Presupuesto Merch (`Budget`)

### Fórmula

```
line_total (por item) = quantity × unit_price

SUBTOTAL = SUM(line_total) de todos los items donde variant_group IS NULL
         + SUM(line_total) de items donde variant_group IS NOT NULL AND is_selected = true

PAYMENT_CONDITION_AMOUNT = SUBTOTAL × (payment_condition_percentage / 100)

SUBTOTAL_WITH_PAYMENT = SUBTOTAL + PAYMENT_CONDITION_AMOUNT

IVA_AMOUNT = (apply_iva) ? SUBTOTAL_WITH_PAYMENT × iva_rate : 0

TOTAL = SUBTOTAL_WITH_PAYMENT + IVA_AMOUNT
```

### Campos persistidos en `budgets`

| Campo | Descripción |
|---|---|
| `subtotal` | Suma de line_totals (antes de condición de pago e IVA) |
| `payment_condition_amount` | Ajuste por condición de pago (puede ser negativo) |
| `total` | Total final con condición de pago + IVA |

### Cálculo automático en el servidor

**`Budget::calculateTotals()`** (`app/Models/Budget.php`) es invocado automáticamente por el observer del modelo `BudgetItem`:

```php
// BudgetItem boot:
static::saving(function ($item) {
    $item->line_total = $item->quantity * $item->unit_price;  // auto-calculado
});

static::saved(function ($item) {
    $item->budget->calculateTotals();  // dispara recálculo del presupuesto
});

static::deleted(function ($item) {
    $item->budget->calculateTotals();
});
```

Esto significa que **crear, modificar o eliminar un `BudgetItem` recalcula el total del presupuesto automáticamente**. El controlador también llama a `calculateTotals()` explícitamente en `store()` y `update()` como respaldo.

`Budget::calculateTotals()` llama a `$this->save()` al final, por lo que persiste los valores automáticamente.

### Variantes

Los productos pueden tener variantes agrupadas por `variant_group` (mismo valor de string = mismo grupo). De cada grupo solo se suma la variante marcada como `is_selected = true`. En la vista `Show`, el cliente puede cambiar la variante seleccionada en tiempo real (sin persistir), lo que actualiza el total visualizado.

### Condición de pago

La condición de pago se guarda como snapshot en el presupuesto (no referencia viva) en tres campos:
- `picking_payment_condition_id` — ID de referencia (puede quedar huérfano)
- `payment_condition_description` — Descripción en el momento de guardar
- `payment_condition_percentage` — Porcentaje en el momento de guardar (número crudo: 10 = 10%)

Un porcentaje negativo genera un descuento; uno positivo, un recargo.

### IVA

- Tasa configurable: `config('business.tax.iva_rate')` → `env('IVA_RATE', 21) / 100` → 0.21 por defecto
- Se puede deshabilitar: `config('business.tax.apply_iva')` → `env('APPLY_IVA', true)`
- Se aplica **después** del ajuste de condición de pago, sobre `SUBTOTAL_WITH_PAYMENT`

### Ejemplo

| Concepto | Valor |
|---|---|
| Item A: 2 × $1.000 | $2.000 |
| Item B (variante seleccionada): 1 × $3.000 | $3.000 |
| **Subtotal** | **$5.000** |
| Condición de pago: −10% | −$500 |
| Subtotal con condición | $4.500 |
| IVA 21% | $945 |
| **Total** | **$5.445** |

---

## 2. Presupuesto Picking (`PickingBudget`)

### Fórmula

```
# Por fila:
service.subtotal = service.unit_cost × service.quantity
box.subtotal     = box.box_unit_cost × box.quantity   ← auto-calculado por boot de PickingBudgetBox

# Acumulados:
SERVICES_SUBTOTAL        = SUM(service.subtotal)
COMPONENT_INCREMENT_AMT  = SERVICES_SUBTOTAL × component_increment_percentage
SUBTOTAL_WITH_INCREMENT  = SERVICES_SUBTOTAL + COMPONENT_INCREMENT_AMT
BOX_TOTAL                = SUM(box.subtotal)

BASE_SUBTOTAL            = SUBTOTAL_WITH_INCREMENT + BOX_TOTAL

PAYMENT_CONDITION_AMOUNT = BASE_SUBTOTAL × (payment_condition_percentage / 100)
SUBTOTAL_WITH_PAYMENT    = BASE_SUBTOTAL + PAYMENT_CONDITION_AMOUNT

IVA_AMOUNT = (apply_iva) ? SUBTOTAL_WITH_PAYMENT × iva_rate : 0
TOTAL      = SUBTOTAL_WITH_PAYMENT + IVA_AMOUNT

UNIT_PRICE_PER_KIT = TOTAL / total_kits
```

### Campos persistidos en `picking_budgets`

| Campo | Descripción |
|---|---|
| `services_subtotal` | Suma de subtotales de servicios |
| `component_increment_amount` | Monto del incremento por componentes |
| `subtotal_with_increment` | services_subtotal + component_increment_amount |
| `box_total` | Suma de subtotales de cajas |
| `payment_condition_amount` | Ajuste por condición de pago |
| `total` | Total final con IVA |
| `unit_price_per_kit` | total / total_kits |

También se guardan snapshots de la configuración al momento de crear/editar:
- `scale_quantity_from` / `scale_quantity_to` / `production_time` — de `PickingCostScale`
- `component_increment_description` / `component_increment_percentage` — de `PickingComponentIncrement`
- `payment_condition_description` / `payment_condition_percentage` — de `PickingPaymentCondition`

### Cálculo en el servidor

**`PickingBudget::calculateTotals()`** (`app/Models/PickingBudget.php`) **NO llama a `save()` automáticamente**. El controlador es responsable de llamarla y luego persistir:

```php
// En el controlador (store / update / duplicate):
$budget->calculateTotals();
$budget->save();
```

`PickingBudgetBox` tiene un boot que auto-calcula su `subtotal`:
```php
static::saving(function (PickingBudgetBox $box) {
    $box->subtotal = $box->box_unit_cost * $box->quantity;
});
```

`PickingBudgetService` **no tiene un boot** de auto-cálculo; el controlador calcula el subtotal explícitamente al crear cada servicio:
```php
'subtotal' => $serviceData['unit_cost'] * $serviceData['quantity'],
```

### Modelos de configuración

#### `PickingCostScale`
Define los precios unitarios de cada servicio en función del rango de kits:
- `quantity_from` / `quantity_to` — rango de kits al que aplica
- Columnas de precio por servicio: `cost_with_assembly`, `cost_without_assembly`, `palletizing_with_pallet`, `palletizing_without_pallet`, `cost_with_labeling`, `cost_without_labeling`, `additional_assembly`, `quality_control`, `dome_sticking_unit`, `shavings_50g_unit`, `shavings_100g_unit`, `shavings_200g_unit`, `bag_10x15_unit`, `bag_20x30_unit`, `bag_35x45_unit`, `bubble_wrap_5x10_unit`, `bubble_wrap_10x15_unit`, `bubble_wrap_20x30_unit`
- `production_time` — tiempo estimado de producción para ese rango

**Método**: `PickingCostScale::findForQuantity(int $quantity)` — devuelve la escala cuyo rango incluye `$quantity`.

#### `PickingComponentIncrement`
Define un porcentaje de incremento sobre los servicios según la cantidad de componentes por kit:
- `components_from` / `components_to` — rango de componentes
- `percentage` — decimal (0.10 = 10%); **se multiplica directamente, sin dividir por 100**
- El incremento **solo aplica al subtotal de servicios, no a las cajas**

**Método**: `PickingComponentIncrement::findForComponents(int $components)` — devuelve el incremento cuyo rango incluye `$components`.

#### `PickingPaymentCondition`
Tabla compartida entre Merch y Picking:
- `description` — nombre de la condición (ej: "Contado", "30 días")
- `percentage` — número crudo (ej: `-10` para descuento 10%, `5` para recargo 5%); **se divide por 100 en el cálculo**

### Condición de pago e IVA

Idéntico a Merch: snapshot guardado en el presupuesto, porcentaje negativo = descuento, positivo = recargo, IVA aplicado al final sobre el subtotal ya ajustado.

### Ejemplo

| Concepto | Valor |
|---|---|
| Servicio: armado 100 kits × $45 | $4.500 |
| Servicio: palletizado 1 × $200 | $200 |
| **Subtotal servicios** | **$4.700** |
| Incremento componentes (10%): $4.700 × 0.10 | $470 |
| Subtotal con incremento | $5.170 |
| Cajas: 2 × $150 | $300 |
| **Base subtotal** | **$5.470** |
| Condición de pago −5%: $5.470 × (−5/100) | −$273,50 |
| Subtotal con condición | $5.196,50 |
| IVA 21% | $1.091,265 |
| **Total** | **$6.287,765** |
| total_kits: 100 → precio unitario | **$62,88** |

---

## 3. Cálculo en el cliente (React)

El cliente replica exactamente la misma fórmula del servidor para mostrar totales en tiempo real sin hacer llamadas a la API.

### Merch — `useBudgetLogic.js`
`resources/js/pages/dashboard/budgets/hooks/useBudgetLogic.js`

Recalcula en `useEffect` cuando cambian: items, variante seleccionada, condición de pago, configuración de IVA.

### Picking — `usePickingBudgetLogic.jsx`
`resources/js/pages/dashboard/picking/hooks/usePickingBudgetLogic.jsx`

Recalcula en `useEffect` cuando cambian: `data.services`, `data.boxes`, `data.total_kits` (determina `currentScale`), `data.total_components_per_kit` (determina `currentIncrement`), `selectedPaymentCondition`, `businessConfig`.

Los servicios del array `data.services` son generados automáticamente en `PickingBudgetForm.jsx` en base a las selecciones del usuario y los precios de `currentScale`.

### Vista Show (Merch y Picking)
Ambas vistas `Show.jsx` también recalculan localmente en un `useEffect` usando los datos del presupuesto cargados desde el servidor. Esto permite que cambios de variante en Merch actualicen el total visualizado sin persistir.

---

## Archivos clave

| Tipo | Archivo |
|---|---|
| Modelo Merch | `app/Models/Budget.php` |
| Modelo Picking | `app/Models/PickingBudget.php` |
| Modelo item Merch | `app/Models/BudgetItem.php` |
| Modelo box Picking | `app/Models/PickingBudgetBox.php` |
| Modelo servicio Picking | `app/Models/PickingBudgetService.php` |
| Escala de costos | `app/Models/PickingCostScale.php` |
| Incremento de componentes | `app/Models/PickingComponentIncrement.php` |
| Condición de pago | `app/Models/PickingPaymentCondition.php` |
| Controlador Merch | `app/Http/Controllers/Dashboard/BudgetController.php` |
| Controlador Picking | `app/Http/Controllers/Dashboard/PickingBudgetController.php` |
| Hook cálculos Merch | `resources/js/pages/dashboard/budgets/hooks/useBudgetLogic.js` |
| Hook cálculos Picking | `resources/js/pages/dashboard/picking/hooks/usePickingBudgetLogic.jsx` |
| Configuración IVA | `config/business.php` |
| Tests cálculo Merch | `tests/Feature/Models/BudgetCalculationTest.php` |
| Tests cálculo Picking | `tests/Feature/Models/PickingBudgetCalculationTest.php` |
