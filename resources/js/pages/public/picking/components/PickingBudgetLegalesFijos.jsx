// resources/js/pages/public/picking/components/PickingBudgetLegalesFijos.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

/**
 * Componente para mostrar legales fijos al pie del presupuesto
 * @returns {JSX.Element|null} - Componente Card de legales fijos al pie del presupuesto
 */
export default function PickingBudgetLegalesFijos() {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Más Información
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    <li>-&nbsp;La empresa no recibirá mercadería sin previo aviso.</li>
                    <li>-&nbsp;No recibirá ni recepcionará productos sin el remito debidamente detallado y adecuado para su correcto control.</li>
                    <li>-&nbsp;Una vez aceptado el servicio vía mail u orden de compra, Central Norte enviará una foto para la aprobación del armado. Esto deberá ser confirmado vía mail, sin posibilidad de cambios días posteriores a esta aprobación. Cualquier cambio que se solicite con posterioridad a esta aprobación, una vez finalizado el kit, será objeto de una nueva cotización.</li>
                    <li>-&nbsp;La empresa no se responsabiliza por rotura y/o pérdida de los kits o de algunos de sus componentes, una vez entregados para su entrega o distribución.</li>
                    <li>-&nbsp;No será responsable ni emitirá notas de crédito por mala manipulación de personas ajenas a la empresa y/o por servicios de distribución y logística de proveedores externos</li>
                </ul>
            </CardContent>
        </Card>
    );
}
