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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // Nombre de la categoría (viene de "description" de la API)
            $table->string('name');

            // Título de la categoría (viene de "title" de la API)
            $table->string('title')->nullable();

            // Descripción corta (la dejamos para uso interno o futuro)
            $table->text('description')->nullable();

            // URL del ícono (viene de "icon_url" de la API)
            $table->string('icon_url')->nullable();

            // Si la categoría debe mostrarse (viene de "show" de la API)
            $table->boolean('show')->default(true);

            // Origen de la categoria
            $table->string('origin')->default('local');

            $table->index('show');
            $table->index('origin');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
