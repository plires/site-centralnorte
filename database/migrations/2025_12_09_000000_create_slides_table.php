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
        Schema::create('slides', function (Blueprint $table) {
            $table->id();
            $table->string('title', 50); // Título hasta 50 caracteres
            $table->string('image_desktop'); // Ruta imagen desktop 1920x850
            $table->string('image_mobile'); // Ruta imagen mobile 580x630
            $table->string('link')->nullable(); // URL opcional para el slide
            $table->boolean('is_active')->default(true); // Si el slide está activo
            $table->integer('sort_order')->default(0); // Orden de aparición
            $table->timestamps();

            // Índices para optimizar consultas
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slides');
    }
};
