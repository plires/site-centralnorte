import BudgetStatusBadge, { budgetStatusOptions } from '@/components/BudgetStatusBadge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const StatusBudget = ({ budget, handleStatusChange, isUpdatingStatus }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <Label className="text-sm font-medium">Estado del Presupuesto</Label>
                <p className="text-muted-foreground text-sm">Cambia el estado para controlar la visibilidad y acciones disponibles</p>
            </div>
            <div className="flex items-center gap-3">
                <Select value={budget.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
                    <SelectTrigger className="w-[180px]">
                        {isUpdatingStatus ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Actualizando...</span>
                            </div>
                        ) : (
                            <SelectValue>
                                <BudgetStatusBadge status={budget.status} size="sm" />
                            </SelectValue>
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        {budgetStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <BudgetStatusBadge status={option.value} size="sm" />
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
export default StatusBudget;
