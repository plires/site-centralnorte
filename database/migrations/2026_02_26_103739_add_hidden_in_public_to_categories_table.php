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
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('hidden_in_public')->default(false)->after('show');
        });

        // Marcar "Logo 24hs" como oculta en el sitio público
        DB::table('categories')
            ->where('name', 'Logo 24hs')
            ->update(['hidden_in_public' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('hidden_in_public');
        });
    }
};
