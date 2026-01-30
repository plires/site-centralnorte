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
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('source')->nullable(); // Página desde donde se suscribió (home, contacto, etc.)
            $table->boolean('is_active')->default(true);
            $table->boolean('synced_to_perfit')->default(false); // Flag para sincronización con Perfit
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};
