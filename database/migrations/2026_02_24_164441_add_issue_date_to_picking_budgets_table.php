<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->date('issue_date')->nullable()->after('title');
        });

        // Rellenar issue_date con la fecha de created_at para registros existentes
        DB::table('picking_budgets')->whereNull('issue_date')->update([
            'issue_date' => DB::raw('DATE(created_at)'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('picking_budgets', function (Blueprint $table) {
            $table->dropColumn('issue_date');
        });
    }
};
