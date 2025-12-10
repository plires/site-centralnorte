import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

// Componente reutilizable para acciones
const ActionsDropdown = ({ isExternal = false, row, actions, isDeleting = false }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {actions.view && (
                <DropdownMenuItem onClick={() => actions.view(row.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                </DropdownMenuItem>
            )}
            {actions.edit && !isExternal && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => actions.edit(row.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            )}

            {actions.delete && !isExternal && (
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation(); // Por seguridad adicional
                        actions.delete(row.id, row.name || row.title);
                    }}
                    className="text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
);

export default ActionsDropdown;
