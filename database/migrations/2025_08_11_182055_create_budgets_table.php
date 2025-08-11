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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // ej: "Presupuesto: Cotización cuadernos, bolígrafos y botellas"
            $table->string('token')->unique(); // Para el link público

            // Relaciones
            $table->foreignId('user_id')->constrained()->onDelete('restrict'); // Vendedor
            $table->foreignId('client_id')->constrained()->onDelete('restrict'); // Cliente

            // Fechas
            $table->date('issue_date'); // Fecha de emisión
            $table->date('expiry_date'); // Fecha de vencimiento

            // Estados y configuraciones
            $table->boolean('is_active')->default(true);
            $table->boolean('send_email_to_client')->default(false); // Checkbox envío automático
            $table->boolean('email_sent')->default(false); // Control si ya se envió
            $table->timestamp('email_sent_at')->nullable();

            // Comentarios del pie de página
            $table->text('footer_comments')->nullable();

            // Totales calculados (se actualizan automáticamente)
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id', 'is_active']);
            $table->index(['expiry_date', 'is_active']);
            $table->index('token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
