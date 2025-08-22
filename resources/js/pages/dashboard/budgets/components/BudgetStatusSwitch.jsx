import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { Power, Settings } from 'lucide-react';
import { useState } from 'react';

export default function BudgetStatusSwitch({ budget, className = '' }) {
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const handleToggleStatus = (checked) => {
        setIsTogglingStatus(true);

        router.patch(
            route('dashboard.budgets.toggle-status', budget.id),
            {
                is_active: checked,
            },
            {
                preserveState: false, // Importante: recargar los datos del servidor
                preserveScroll: true,
                onSuccess: () => {
                    // El toast se maneja desde la vista padre con los flash messages
                },
                onError: (errors) => {
                    // El toast se maneja desde la vista padre con los flash messages
                },
                onFinish: () => {
                    setIsTogglingStatus(false);
                },
            },
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Estado del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="budget-status" className="text-sm font-medium">
                            Control de Activación
                        </Label>
                        <p className="text-muted-foreground text-sm">
                            {budget.is_active
                                ? 'El presupuesto está activo y disponible para edición'
                                : 'El presupuesto está inactivo. Actívalo para poder editarlo'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Power className={`h-4 w-4 ${budget.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${budget.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                                {budget.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <Switch id="budget-status" checked={budget.is_active} onCheckedChange={handleToggleStatus} disabled={isTogglingStatus} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
