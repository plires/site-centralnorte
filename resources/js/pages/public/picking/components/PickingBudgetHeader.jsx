// resources/js/pages/public/picking/components/PickingBudgetHeader.jsx

/**
 * Header del presupuesto de picking con información básica
 * @param {Object} budget - Objeto del presupuesto de picking
 * @returns {JSX.Element} - Componente Header
 */
export default function PickingBudgetHeader({ budget }) {
    return (
        <div className="border-b bg-white">
            <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                        Presupuesto de Picking #{budget.budget_number}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                        <span>Cliente: {budget.client?.name || 'N/A'}</span>
                        <span>•</span>
                        <span>Vendedor: {budget.vendor?.name || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
