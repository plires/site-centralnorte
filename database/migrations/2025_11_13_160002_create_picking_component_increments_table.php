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
        Schema::create('picking_component_increments', function (Blueprint $table) {
            $table->id();

            // Rango de cantidad de componentes por kit
            $table->integer('components_from');
            $table->integer('components_to')->nullable(); // null = "o más"

            $table->string('description'); // "1 A 3 componentes"
            $table->decimal('percentage', 5, 2); // 0.00, 0.10, 0.20, etc. (representa 0%, 10%, 20%)

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices para búsqueda eficiente
            $table->index(['components_from', 'components_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_component_increments');
    }
};
