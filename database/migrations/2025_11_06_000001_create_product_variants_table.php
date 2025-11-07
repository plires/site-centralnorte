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
    Schema::create('product_variants', function (Blueprint $table) {
      $table->id();
      $table->foreignId('product_id')->constrained()->cascadeOnDelete();
      $table->string('external_id')->nullable(); // ID o SKU de la variante en la API
      $table->string('sku')->index(); // SKU único de la variante (del campo 'sku' de la API)

      // Campos para variantes tipo APPAREL (size y color)
      $table->string('size')->nullable();
      $table->string('color')->nullable();

      // Campos para variantes STANDARD (element_description_1, 2, 3)
      $table->string('primary_color_text')->nullable(); // element_description_1
      $table->string('secondary_color_text')->nullable(); // element_description_2
      $table->string('material_text')->nullable(); // element_description_3

      // Stock siempre se guarda
      $table->integer('stock')->default(0);

      // Colores pimarios y secundarios siempre se guarda
      $table->string('primary_color')->nullable();
      $table->string('secondary_color')->nullable();

      // Tipo de variante para facilitar queries
      $table->enum('variant_type', ['apparel', 'standard'])->default('standard');

      $table->timestamps();

      // Índices para optimizar búsquedas
      $table->index(['product_id', 'variant_type']);
      $table->index('stock');

      // SKU debe ser único
      $table->unique('sku');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('product_variants');
  }
};
