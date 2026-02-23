// resources/js/pages/public/components/BudgetUnavailableActionsBlock.jsx

import { AlertTriangle, Mail, Phone } from 'lucide-react';

/**
 * Bloque de contacto que reemplaza las acciones del cliente cuando hay entidades críticas no disponibles.
 * Se muestra en lugar del botón de aprobación, evaluación y descarga de PDF.
 *
 * @param {Object} vendor - Vendedor del presupuesto (puede ser null si fue eliminado)
 * @param {Object} businessConfig - Configuración del negocio (company_email, company_phone)
 * @param {Array} reasons - Lista de razones por las que se bloquean las acciones
 * @returns {JSX.Element}
 */
export default function BudgetUnavailableActionsBlock({ vendor, businessConfig, reasons = [] }) {
    const contactEmail = vendor?.email || businessConfig?.company_email;
    const contactName = vendor?.name || null;
    const contactPhone = businessConfig?.company_phone;

    return (
        <div className="mt-8 mb-8 rounded-xl border border-red-200 bg-red-50 p-6">
            {/* Título */}
            <div className="mb-4 flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-500" />
                <div>
                    <h3 className="text-base font-semibold text-red-800">Presupuesto con información incompleta</h3>
                    <p className="mt-1 text-sm text-red-700">
                        Este presupuesto no puede ser aprobado ni descargado en este momento porque contiene información que ya no está disponible en el sistema. Por favor,
                        contactate con nosotros para resolverlo.
                    </p>
                </div>
            </div>

            {/* Razones */}
            {reasons.length > 0 && (
                <ul className="mb-5 ml-9 list-disc space-y-1 text-sm text-red-700">
                    {reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                    ))}
                </ul>
            )}

            {/* Bloque de contacto */}
            <div className="ml-9 rounded-lg border border-red-200 bg-white p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                    {contactName ? `Contactá a ${contactName}:` : 'Contactate con nosotros:'}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    {contactEmail && (
                        <a
                            href={`mailto:${contactEmail}`}
                            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                            <Mail className="h-4 w-4" />
                            {contactEmail}
                        </a>
                    )}
                    {contactPhone && (
                        <a
                            href={`tel:${contactPhone.replace(/\s/g, '')}`}
                            className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                        >
                            <Phone className="h-4 w-4" />
                            {contactPhone}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
