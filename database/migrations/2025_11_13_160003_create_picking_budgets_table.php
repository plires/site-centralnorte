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
        Schema::create('picking_budgets', function (Blueprint $table) {
            $table->id();

            // Identificación
            $table->string('budget_number')->unique(); // PK-2025-0001
            $table->foreignId('vendor_id')->constrained('users')->onDelete('restrict');

            // Datos del cliente
            $table->string('client_name');
            $table->string('client_email')->nullable();
            $table->string('client_phone')->nullable();

            // CANTIDADES BASE
            $table->integer('total_kits'); // Cantidad de kits a armar
            $table->integer('total_components_per_kit'); // Componentes que tiene cada kit

            // CAJA SELECCIONADA (snapshot)
            $table->string('box_dimensions'); // "200 x 200 x 100"
            $table->decimal('box_cost', 10, 2);

            // ESCALA DE COSTOS APLICADA (snapshot para referencia)
            $table->integer('scale_quantity_from');
            $table->integer('scale_quantity_to')->nullable();
            $table->string('production_time'); // "24 hs", "3 dias", etc.

            // INCREMENTO POR COMPONENTES (snapshot)
            $table->string('component_increment_description'); // "7 A 10 componentes"
            $table->decimal('component_increment_percentage', 5, 2); // 0.20 = 20%

            // TOTALES
            $table->decimal('services_subtotal', 10, 2); // Suma de todos los servicios
            $table->decimal('component_increment_amount', 10, 2); // services_subtotal * percentage
            $table->decimal('subtotal_with_increment', 10, 2); // services_subtotal + increment_amount
            $table->decimal('box_total', 10, 2); // Costo de la caja
            $table->decimal('total', 10, 2); // subtotal_with_increment + box_total

            // METADATA
            $table->enum('status', ['draft', 'sent', 'approved', 'rejected', 'expired'])->default('draft');
            $table->date('valid_until');
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('budget_number');
            $table->index('vendor_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_budgets');
    }
};
