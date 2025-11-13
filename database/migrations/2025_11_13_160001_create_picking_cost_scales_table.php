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
        Schema::create('picking_cost_scales', function (Blueprint $table) {
            $table->id();

            // Rango de cantidad de kits
            $table->integer('quantity_from');
            $table->integer('quantity_to')->nullable(); // null = "o más"

            // Costos de servicios base
            $table->decimal('cost_without_assembly', 10, 2);
            $table->decimal('cost_with_assembly', 10, 2);
            $table->decimal('palletizing_without_pallet', 10, 2);
            $table->decimal('palletizing_with_pallet', 10, 2);
            $table->decimal('cost_with_labeling', 10, 2);
            $table->decimal('cost_without_labeling', 10, 2);
            $table->decimal('additional_assembly', 10, 2);
            $table->decimal('quality_control', 10, 2);

            // Costos unitarios de materiales (el vendedor indica la cantidad)
            $table->decimal('dome_sticking_unit', 10, 2);
            $table->decimal('shavings_50g_unit', 10, 2);
            $table->decimal('shavings_100g_unit', 10, 2);
            $table->decimal('shavings_200g_unit', 10, 2);
            $table->decimal('bag_10x15_unit', 10, 2);
            $table->decimal('bag_20x30_unit', 10, 2);
            $table->decimal('bag_35x45_unit', 10, 2);
            $table->decimal('bubble_wrap_5x10_unit', 10, 2);
            $table->decimal('bubble_wrap_10x15_unit', 10, 2);
            $table->decimal('bubble_wrap_20x30_unit', 10, 2);

            // Tiempo de producción
            $table->string('production_time'); // "24 hs", "3 dias", etc.

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices para búsqueda eficiente
            $table->index(['quantity_from', 'quantity_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_cost_scales');
    }
};
