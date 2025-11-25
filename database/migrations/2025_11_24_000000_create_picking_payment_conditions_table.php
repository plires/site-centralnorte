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
        Schema::create('picking_payment_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('description'); // "Contado", "30 días", "60 días", etc.
            $table->decimal('percentage', 5, 2); // Puede ser positivo o negativo (-10.00 a 10.00, por ejemplo)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_payment_conditions');
    }
};
