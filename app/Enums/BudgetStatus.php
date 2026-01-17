<?php

namespace App\Enums;

/**
 * Estados unificados para presupuestos (Budget y PickingBudget)
 * 
 * Flujo típico:
 * - Crear nuevo: unsent
 * - Clonar/duplicar: draft
 * - Enviar por email: sent
 * - Cliente pone en evaluación: in_review
 * - Cliente aprueba: approved
 * - Vendedor rechaza: rejected
 * - Vence sin acción: expired
 */
enum BudgetStatus: string
{
    case UNSENT = 'unsent';           // Sin enviar (recién creado)
    case DRAFT = 'draft';             // Borrador (clonado/duplicado)
    case SENT = 'sent';               // Enviado al cliente
    case IN_REVIEW = 'in_review';     // En evaluación por el cliente
    case APPROVED = 'approved';       // Aprobado por cliente o vendedor
    case REJECTED = 'rejected';       // Rechazado por vendedor
    case EXPIRED = 'expired';         // Vencido automáticamente

    /**
     * Etiqueta en español para mostrar en UI
     */
    public function label(): string
    {
        return match ($this) {
            self::UNSENT => 'Sin enviar',
            self::DRAFT => 'Borrador',
            self::SENT => 'Enviado',
            self::IN_REVIEW => 'En Evaluación',
            self::APPROVED => 'Aprobado',
            self::REJECTED => 'Rechazado',
            self::EXPIRED => 'Vencido',
        };
    }

    /**
     * Color para badges en UI
     */
    public function color(): string
    {
        return match ($this) {
            self::UNSENT => 'slate',
            self::DRAFT => 'gray',
            self::SENT => 'blue',
            self::IN_REVIEW => 'yellow',
            self::APPROVED => 'green',
            self::REJECTED => 'red',
            self::EXPIRED => 'orange',
        };
    }

    /**
     * Clase CSS para badges (Tailwind)
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::UNSENT => 'bg-slate-100 text-slate-800',
            self::DRAFT => 'bg-gray-100 text-gray-800',
            self::SENT => 'bg-blue-100 text-blue-800',
            self::IN_REVIEW => 'bg-yellow-100 text-yellow-800',
            self::APPROVED => 'bg-green-100 text-green-800',
            self::REJECTED => 'bg-red-100 text-red-800',
            self::EXPIRED => 'bg-orange-100 text-orange-800',
        };
    }

    /**
     * Icono sugerido (Lucide)
     */
    public function icon(): string
    {
        return match ($this) {
            self::UNSENT => 'file-edit',
            self::DRAFT => 'file-text',
            self::SENT => 'send',
            self::IN_REVIEW => 'clock',
            self::APPROVED => 'check-circle',
            self::REJECTED => 'x-circle',
            self::EXPIRED => 'alert-circle',
        };
    }

    /**
     * ¿El presupuesto es visible públicamente?
     * Visible en todos los estados excepto: UNSENT, DRAFT y EXPIRED
     */
    public function isPubliclyVisible(): bool
    {
        return !in_array($this, [self::UNSENT, self::DRAFT, self::EXPIRED]);
    }

    /**
     * El cliente puede tomar acción (aprobar/poner en evaluación)
     */
    public function allowsClientAction(): bool
    {
        return in_array($this, [self::SENT, self::IN_REVIEW]);
    }

    public function allowsInReviewAction(): bool
    {
        return $this === self::SENT;
    }

    /**
     * ¿El presupuesto puede ser editado?
     * Solo sin enviar o borrador
     */
    public function isEditable(): bool
    {
        return in_array($this, [self::UNSENT, self::DRAFT]);
    }

    /**
     * ¿El presupuesto puede ser enviado?
     * Solo sin enviar, borrador o rechazado (reenvío)
     */
    public function canBeSent(): bool
    {
        return in_array($this, [self::UNSENT, self::DRAFT, self::REJECTED]);
    }

    /**
     * ¿Es un estado final? (no debería cambiar automáticamente)
     */
    public function isFinal(): bool
    {
        return in_array($this, [self::APPROVED, self::REJECTED]);
    }

    /**
     * ¿Puede vencer automáticamente?
     * Solo sin enviar, borrador, enviado o en evaluación
     */
    public function canExpire(): bool
    {
        return in_array($this, [self::UNSENT, self::DRAFT, self::SENT, self::IN_REVIEW]);
    }

    /**
     * Obtener todos los estados como array para selects
     */
    public static function toSelectArray(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }

    /**
     * Obtener estados que el vendedor puede asignar manualmente
     */
    public static function vendorAssignableStatuses(): array
    {
        return [
            self::UNSENT,
            self::DRAFT,
            self::SENT,
            self::IN_REVIEW,
            self::APPROVED,
            self::REJECTED,
        ];
    }
}
