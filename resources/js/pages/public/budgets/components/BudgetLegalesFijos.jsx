// resources/js/pages/public/components/BudgetLegalesFijos.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';

/**
 * Componente para mostrar legales fijos al pie del presupuesto
 * @returns {JSX.Element|null} - Componente Card de legales fijos al pie del presupuesto
 */
export default function BudgetLegalesFijos() {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-blue-600" />
                    Más Información
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    <li>-&nbsp;Los plazos de entrega comienzan a regir luego de la aprobación del boceto digital.</li>
                    <li>-&nbsp;Sujeto a disponibilidad de stock disponible al momento de la confirmación.</li>
                    <li>-&nbsp;Incluye envío y entrega a domicilio según la dirección especificada dentro del ámbito de CABA y
                        GBA hasta 30 kms.
                    </li>
                    <li>-&nbsp;El cliente declara haber recibido y aprobado previamente las especificaciones, medidas, diseño y
                        características del producto.
                        Por tratarse de un producto personalizado, no se admiten cambios ni devoluciones una vez aceptada la cotización.
                        Los reclamos solo serán válidos en caso de fallas de calidad o defectos comprobables, quedando excluidos aquellos derivados de error de elección, cambios de criterio o condiciones previamente aceptadas.
                        La aprobación de la presente cotización implica la aceptación íntegra de esta cláusula.
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
}
