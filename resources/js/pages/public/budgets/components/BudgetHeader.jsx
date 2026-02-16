// resources/js/pages/public/components/BudgetHeader.jsx

/**
 * Header del presupuesto con información básica
 * @param {Object} budget - Objeto del presupuesto
 * @returns {JSX.Element} - Componente Header
 */
export default function BudgetHeader({ budget }) {
    return (
        <div className="border-b bg-white">
            <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 uppercase">{budget.title}</h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                        <span>Cliente: {budget.client?.name || 'N/A'}</span>
                        <span>•</span>
                        <span>Vendedor: {budget.user?.name || 'Central Norte'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
