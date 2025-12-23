<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Crear nueva tabla para cajas del presupuesto (relación 1 a muchos)
        Schema::create('picking_budget_boxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('picking_budget_id')->constrained('picking_budgets')->onDelete('cascade');

            $table->foreignId('picking_box_id')->nullable()->constrained('picking_boxes')->onDelete('set null');

            // Snapshot de la caja (se guarda aquí para histórico)
            $table->string('box_dimensions'); // "200 x 200 x 100"
            $table->decimal('box_unit_cost', 10, 2); // Costo unitario de esta caja
            $table->integer('quantity')->default(1); // Cantidad de cajas de este tipo
            $table->decimal('subtotal', 10, 2); // box_unit_cost * quantity

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('picking_budget_id');
        });

        // 2. Modificar tabla picking_budgets
        Schema::table('picking_budgets', function (Blueprint $table) {
            // Eliminar campos de caja única (se moverán a picking_budget_boxes)
            $table->dropColumn(['box_dimensions', 'box_cost']);

            // Agregar nuevo campo: precio unitario por kit
            $table->decimal('unit_price_per_kit', 10, 2)->after('total')->default(0);
            // unit_price_per_kit = total / total_kits
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurar campos originales
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('unit_price_per_kit');

            $table->string('box_dimensions')->after('total_components_per_kit');
            $table->decimal('box_cost', 10, 2)->after('box_dimensions');
        });

        // Eliminar tabla de cajas
        Schema::dropIfExists('picking_budget_boxes');
    }
};
