// resources/js/pages/dashboard/budgets/components/BudgetHeaderWithStatus.jsx

import getExpiryBadge from '@/components/getExpiryBadge';

import BudgetStatusBadge from '@/components/BudgetStatusBadge';

export default function BudgetHeaderWithStatus({ budget }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{budget.title}</h1>
                <p className="mt-1 text-sm text-gray-500">Presupuesto #{budget.id}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {/* Badge del estado principal (unsent, draft, sent, approved, rejected, expired) */}
                <BudgetStatusBadge status={budget.status} showIcon={true} size="default" />

                {/* Badge de vigencia (solo si está enviado y tiene días hasta vencimiento) */}
                {budget.status === 'sent' && getExpiryBadge(budget)}
            </div>
        </div>
    );
}
