<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Unifica el sistema de estados para presupuestos de merch (budgets)
     * - Agrega campo status (enum) si no existe
     * - Migra datos existentes de is_active y email_sent a status
     * - Elimina campo is_active
     */
    public function up(): void
    {
        // 1. Agregar el nuevo campo status SI NO EXISTE
        if (!Schema::hasColumn('budgets', 'status')) {
            Schema::table('budgets', function (Blueprint $table) {
                $table->enum('status', ['unsent', 'draft', 'sent', 'approved', 'rejected', 'expired'])
                    ->default('unsent')
                    ->after('expiry_date');

                $table->index('status');
            });
        }

        // 2. Migrar datos existentes (solo si is_active todavía existe)
        if (Schema::hasColumn('budgets', 'is_active')) {
            DB::statement("
                UPDATE budgets 
                SET status = CASE
                    WHEN is_active = 0 AND expiry_date < CURDATE() THEN 'expired'
                    WHEN is_active = 0 THEN 'rejected'
                    WHEN email_sent = 1 THEN 'sent'
                    ELSE 'unsent'
                END
                WHERE status = 'unsent'
            ");

            // 3. Eliminar la FOREIGN KEY de user_id primero
            // (porque MySQL usa el índice compuesto para la FK)
            DB::statement("ALTER TABLE `budgets` DROP FOREIGN KEY `budgets_user_id_foreign`");

            // 4. Ahora podemos eliminar los índices que contienen is_active
            $this->dropIndexIfExists('budgets', 'budgets_user_id_is_active_index');
            $this->dropIndexIfExists('budgets', 'budgets_expiry_date_is_active_index');

            // 5. Eliminar el campo is_active
            Schema::table('budgets', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });

            // 6. Crear nuevo índice para user_id (necesario para la FK)
            Schema::table('budgets', function (Blueprint $table) {
                $table->index('user_id', 'budgets_user_id_index');
            });

            // 7. Recrear la foreign key de user_id
            Schema::table('budgets', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('restrict');
            });

            // 8. Crear índices optimizados para consultas por estado
            $this->createIndexIfNotExists('budgets', 'budgets_user_id_status_index', ['user_id', 'status']);
            $this->createIndexIfNotExists('budgets', 'budgets_expiry_date_status_index', ['expiry_date', 'status']);
            $this->createIndexIfNotExists('budgets', 'budgets_status_expiry_date_index', ['status', 'expiry_date']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Eliminar FK de user_id
        try {
            DB::statement("ALTER TABLE `budgets` DROP FOREIGN KEY `budgets_user_id_foreign`");
        } catch (\Exception $e) {
            // Ignorar si no existe
        }

        // 2. Recrear campo is_active si no existe
        if (!Schema::hasColumn('budgets', 'is_active')) {
            Schema::table('budgets', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('expiry_date');
            });
        }

        // 3. Migrar datos de vuelta
        DB::statement("
            UPDATE budgets 
            SET is_active = CASE
                WHEN status IN ('expired', 'rejected') THEN 0
                ELSE 1
            END
        ");

        // 4. Eliminar índices nuevos
        $this->dropIndexIfExists('budgets', 'budgets_user_id_status_index');
        $this->dropIndexIfExists('budgets', 'budgets_expiry_date_status_index');
        $this->dropIndexIfExists('budgets', 'budgets_status_expiry_date_index');
        $this->dropIndexIfExists('budgets', 'budgets_user_id_index');

        // 5. Eliminar campo status
        if (Schema::hasColumn('budgets', 'status')) {
            $this->dropIndexIfExists('budgets', 'budgets_status_index');
            Schema::table('budgets', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }

        // 6. Recrear índices originales
        $this->createIndexIfNotExists('budgets', 'budgets_user_id_is_active_index', ['user_id', 'is_active']);
        $this->createIndexIfNotExists('budgets', 'budgets_expiry_date_is_active_index', ['expiry_date', 'is_active']);

        // 7. Recrear FK original
        Schema::table('budgets', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');
        });
    }

    /**
     * Helper: Eliminar índice si existe
     */
    private function dropIndexIfExists(string $table, string $indexName): void
    {
        $exists = DB::select("
            SELECT COUNT(*) as count 
            FROM information_schema.statistics 
            WHERE table_schema = DATABASE() 
            AND table_name = ? 
            AND index_name = ?
        ", [$table, $indexName]);

        if ($exists[0]->count > 0) {
            DB::statement("DROP INDEX `{$indexName}` ON `{$table}`");
        }
    }

    /**
     * Helper: Crear índice si no existe
     */
    private function createIndexIfNotExists(string $table, string $indexName, array $columns): void
    {
        $exists = DB::select("
            SELECT COUNT(*) as count 
            FROM information_schema.statistics 
            WHERE table_schema = DATABASE() 
            AND table_name = ? 
            AND index_name = ?
        ", [$table, $indexName]);

        if ($exists[0]->count == 0) {
            $columnList = implode('`, `', $columns);
            DB::statement("CREATE INDEX `{$indexName}` ON `{$table}` (`{$columnList}`)");
        }
    }
};
