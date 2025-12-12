<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Actualiza picking_budgets para unificar sistema de estados:
     * - Agrega token para vista pública
     * - Actualiza enum de status para incluir 'unsent'
     * - Agrega campos de tracking de email
     */
    public function up(): void
    {
        // 1. Agregar token para acceso público
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->string('token', 64)->nullable()->unique()->after('budget_number');
        });

        // 2. Generar tokens para registros existentes
        $budgets = DB::table('picking_budgets')->whereNull('token')->get();
        foreach ($budgets as $budget) {
            DB::table('picking_budgets')
                ->where('id', $budget->id)
                ->update(['token' => Str::random(32)]);
        }

        // 3. Hacer token obligatorio
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->string('token', 64)->nullable(false)->change();
        });

        // 4. Modificar el enum de status para incluir 'unsent'
        // Primero cambiamos a string temporalmente
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->string('status_temp', 20)->nullable()->after('status');
        });

        // Copiar datos
        DB::statement("UPDATE picking_budgets SET status_temp = status");

        // Eliminar columna original
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        // Crear nueva columna con enum actualizado
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->enum('status', ['unsent', 'draft', 'sent', 'approved', 'rejected', 'expired'])
                ->default('unsent')
                ->after('unit_price_per_kit');
        });

        // Restaurar datos
        DB::statement("UPDATE picking_budgets SET status = status_temp");

        // Eliminar columna temporal
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('status_temp');
        });

        // 5. Agregar campos de tracking de email (similar a budgets)
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->boolean('email_sent')->default(false)->after('status');
            $table->timestamp('email_sent_at')->nullable()->after('email_sent');
        });

        // 6. Actualizar email_sent para los que ya están en 'sent'
        DB::statement("
            UPDATE picking_budgets 
            SET email_sent = 1, email_sent_at = updated_at
            WHERE status = 'sent'
        ");

        // 7. Crear índice para token
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->index('token');
            $table->index(['status', 'valid_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Eliminar índices
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropIndex(['token']);
            $table->dropIndex(['status', 'valid_until']);
        });

        // 2. Eliminar campos de email tracking
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn(['email_sent', 'email_sent_at']);
        });

        // 3. Revertir enum de status (quitar 'unsent')
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->string('status_temp', 20)->nullable()->after('status');
        });

        // Copiar datos (unsent -> draft)
        DB::statement("
            UPDATE picking_budgets 
            SET status_temp = CASE 
                WHEN status = 'unsent' THEN 'draft' 
                ELSE status 
            END
        ");

        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->enum('status', ['draft', 'sent', 'approved', 'rejected', 'expired'])
                ->default('draft')
                ->after('unit_price_per_kit');
        });

        DB::statement("UPDATE picking_budgets SET status = status_temp");

        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('status_temp');
        });

        // 4. Eliminar token
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('token');
        });
    }
};
