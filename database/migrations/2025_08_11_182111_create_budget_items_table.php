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
        Schema::create('budget_items', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('budget_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');

            // Datos base de la línea
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2); // Precio unitario para esta línea
            $table->integer('production_time_days')->nullable(); // Tiempo de producción en días
            $table->string('logo_printing')->nullable(); // Descripción de impresión de logo

            // Totales calculados
            $table->decimal('line_total', 12, 2); // quantity * unit_price

            // Orden de visualización
            $table->integer('sort_order')->default(0);

            // Grupo de variantes (para agrupar líneas que son variantes entre sí)
            $table->string('variant_group')->nullable(); // ej: "gorras_001", "camisetas_002"
            $table->boolean('is_variant')->default(false); // Indica si es una línea de variante

            // NUEVO CAMPO: Indica si esta variante está seleccionada
            // Para items regulares (is_variant = false), siempre será true
            // Para variantes (is_variant = true), solo una por grupo debe ser true
            $table->boolean('is_selected')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['budget_id', 'sort_order']);
            $table->index(['budget_id', 'variant_group']);
            $table->index(['budget_id', 'is_selected']); // Nuevo índice para consultas de items seleccionados
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_items');
    }
};
