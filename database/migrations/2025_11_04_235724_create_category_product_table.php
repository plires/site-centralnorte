<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // AGREGAR: Campo para indicar si la categoría está visible (show de la API)
            $table->boolean('show')->default(true);

            // AGREGAR: Campo para indicar si es la categoría principal (main de fgp de la API)
            $table->boolean('is_main')->default(false);

            $table->timestamps();

            // Evitar duplicados
            $table->unique(['category_id', 'product_id']);

            // agregar índice para consultas más rápidas
            $table->index(['product_id', 'is_main']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};
