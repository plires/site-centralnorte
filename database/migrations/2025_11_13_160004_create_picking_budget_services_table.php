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
        Schema::create('picking_budget_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('picking_budget_id')->constrained('picking_budgets')->onDelete('cascade');

            // Tipo de servicio
            $table->enum('service_type', [
                'assembly',              // Con/Sin armado
                'palletizing',           // Con/Sin pallet
                'labeling',              // Con/Sin rotulado
                'dome_sticking',         // Pegado de domes
                'additional_assembly',   // Ensamble adicional
                'quality_control',       // Control de calidad
                'shavings',              // Viruta (50g, 100g, 200g)
                'bag',                   // Bolsitas (10x15, 20x30, 35x45)
                'bubble_wrap'            // Pluribol (5x10, 10x15, 20x30)
            ]);

            $table->string('service_description'); // "Con armado", "Bolsita 10x15", etc.
            $table->decimal('unit_cost', 10, 2); // Costo unitario al momento del presupuesto
            $table->integer('quantity')->default(1); // Cantidad (para bolsitas, virutas, etc.)
            $table->decimal('subtotal', 10, 2); // unit_cost * quantity

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('picking_budget_id');
            $table->index('service_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_budget_services');
    }
};
