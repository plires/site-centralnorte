// resources/js/components/budgets/BudgetActionButtons.jsx

import { Button } from '@/components/ui/button';
import { Copy, Download, Edit, ExternalLink, Mail, Send } from 'lucide-react';

/**
 * Botones de acción reutilizables para vistas Show de presupuestos (merch y picking).
 *
 * Props:
 * - isEditable: bool — si el presupuesto permite edición
 * - canSendEmail: bool — si el estado permite enviar email
 * - isPubliclyVisible: bool — si el presupuesto es visible públicamente
 * - hasWarnings: bool — si hay advertencias activas
 * - emailSent: bool — si el email ya fue enviado (opcional, para mostrar "Reenviar")
 * - onEdit: fn
 * - onDownload: fn
 * - onSendEmail: fn
 * - onDuplicate: fn
 * - onViewPublic: fn
 */
export default function BudgetActionButtons({
    isEditable,
    canSendEmail,
    isPubliclyVisible,
    hasWarnings,
    emailSent = false,
    onEdit,
    onDownload,
    onSendEmail,
    onDuplicate,
    onViewPublic,
}) {
    return (
        <div className="mb-6 flex flex-wrap gap-2">
            {(hasWarnings || isEditable) && (
                <Button
                    variant={hasWarnings ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={onEdit}
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
            )}

            <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
            </Button>

            {!hasWarnings && (
                <Button variant="outline" size="sm" onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                </Button>
            )}

            {canSendEmail && !hasWarnings && (
                <Button variant="outline" size="sm" onClick={onSendEmail}>
                    {emailSent ? (
                        <>
                            <Mail className="mr-2 h-4 w-4" />
                            Reenviar Email
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar por Email
                        </>
                    )}
                </Button>
            )}

            {isPubliclyVisible && (
                <Button variant="outline" size="sm" onClick={onViewPublic}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver Público
                </Button>
            )}
        </div>
    );
}
