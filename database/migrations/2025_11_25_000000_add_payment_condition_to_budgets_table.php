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
    Schema::table('budgets', function (Blueprint $table) {
      // Agregar campo para la condición de pago seleccionada
      $table->foreignId('picking_payment_condition_id')
        ->nullable()
        ->after('client_id')
        ->constrained('picking_payment_conditions')
        ->nullOnDelete();

      // Snapshot de la condición al momento del presupuesto
      $table->string('payment_condition_description')->nullable()->after('picking_payment_condition_id');
      $table->decimal('payment_condition_percentage', 5, 2)->nullable()->after('payment_condition_description');

      // Nuevo campo para el monto del ajuste
      $table->decimal('payment_condition_amount', 12, 2)->default(0)->after('subtotal');

      // Índice para optimizar consultas
      $table->index('picking_payment_condition_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('budgets', function (Blueprint $table) {
      $table->dropForeign(['picking_payment_condition_id']);
      $table->dropIndex(['picking_payment_condition_id']);
      $table->dropColumn([
        'picking_payment_condition_id',
        'payment_condition_description',
        'payment_condition_percentage',
        'payment_condition_amount',
      ]);
    });
  }
};
