import { CheckCircle, Clock, FileEdit, FileText, Send, XCircle } from 'lucide-react';

const ContextualInformationOfTheState = ({ budget }) => {
    return (
        <>
            {/* Información contextual según el estado */}
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
                {budget.status === 'unsent' && (
                    <p className="text-gray-600">
                        <FileEdit className="mr-1 inline h-4 w-4" />
                        El presupuesto aún no ha sido enviado al cliente. Puedes editarlo libremente.
                    </p>
                )}
                {budget.status === 'draft' && (
                    <p className="text-gray-600">
                        <FileText className="mr-1 inline h-4 w-4" />
                        Este es un borrador (copia de otro presupuesto). Puedes editarlo antes de enviarlo.
                    </p>
                )}
                {budget.status === 'sent' && (
                    <p className="text-blue-600">
                        <Send className="mr-1 inline h-4 w-4" />
                        El presupuesto está visible para el cliente. Puede aprobarlo o colocarlo en evaluación.
                    </p>
                )}
                {budget.status === 'approved' && (
                    <p className="text-green-600">
                        <CheckCircle className="mr-1 inline h-4 w-4" />
                        ¡El cliente aprobó este presupuesto! Coordina los siguientes pasos.
                    </p>
                )}
                {budget.status === 'rejected' && (
                    <div className="space-y-2">
                        <p className="text-red-600">
                            <XCircle className="mr-1 inline h-4 w-4" />
                            El vendedor rechazó este presupuesto. Puedes duplicarlo y hacer una nueva propuesta.
                        </p>
                        {budget.rejection_comments && (
                            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-4">
                                <p className="mb-1 text-sm font-medium text-red-800">Motivo del rechazo:</p>
                                <p className="text-sm whitespace-pre-wrap text-red-700">{budget.rejection_comments}</p>
                            </div>
                        )}
                    </div>
                )}
                {budget.status === 'expired' && (
                    <p className="text-orange-600">
                        <Clock className="mr-1 inline h-4 w-4" />
                        Este presupuesto venció. Puedes duplicarlo para crear uno nuevo con fechas actualizadas.
                    </p>
                )}
            </div>
        </>
    );
};
export default ContextualInformationOfTheState;
