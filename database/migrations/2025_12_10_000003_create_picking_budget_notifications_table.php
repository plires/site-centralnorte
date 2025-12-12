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
        Schema::create('picking_budget_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('picking_budget_id')->constrained('picking_budgets')->onDelete('cascade');
            $table->enum('type', ['expiry_warning', 'expired']); // Tipos de notificación
            $table->timestamp('scheduled_for'); // Cuándo debe enviarse
            $table->boolean('sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->json('notification_data')->nullable(); // Datos adicionales
            $table->timestamps();

            // Índices
            $table->index(['scheduled_for', 'sent']);
            $table->index(['picking_budget_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_budget_notifications');
    }
};
