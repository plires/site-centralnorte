<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Actualizar enum de status en budgets
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('unsent', 'draft', 'sent', 'in_review', 'approved', 'rejected', 'expired') DEFAULT 'unsent'");
        
        // Actualizar enum de status en picking_budgets
        DB::statement("ALTER TABLE picking_budgets MODIFY COLUMN status ENUM('unsent', 'draft', 'sent', 'in_review', 'approved', 'rejected', 'expired') DEFAULT 'unsent'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir budgets (eliminar in_review)
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('unsent', 'draft', 'sent', 'approved', 'rejected', 'expired') DEFAULT 'unsent'");
        
        // Revertir picking_budgets (eliminar in_review)
        DB::statement("ALTER TABLE picking_budgets MODIFY COLUMN status ENUM('unsent', 'draft', 'sent', 'approved', 'rejected', 'expired') DEFAULT 'unsent'");
    }
};