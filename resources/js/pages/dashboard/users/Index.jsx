import DataTable from '@/Components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    {
        title: 'Usuarios',
        href: '/dashboard/users',
    },
];

export default function Index({ auth, users, filters = {} }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    // Definir las columnas de la tabla
    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            sortable: true,
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            hideOnMobile: true, // Se oculta en móviles
            truncate: true, // Texto truncado si es muy largo
        },
        {
            key: 'role',
            label: 'Rol',
            sortable: false,
            hideOnMobile: true,
            render: (value, row) => {
                const roleName = row.role?.name;

                if (!roleName) {
                    return <span className="text-gray-400 italic">Sin rol</span>;
                } else if (roleName === 'admin') {
                    return (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            {roleName}
                        </span>
                    );
                } else {
                    return (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {roleName}
                        </span>
                    );
                }
            },
        },
        {
            key: 'actions',
            label: '',
            render: (value, row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(row.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(row.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(row.id, row.name)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleView = (userId) => {
        // Aquí puedes redirigir a la página de Show
        console.log('Mostrar usuario:', userId);
    };

    const handleEdit = (userId) => {
        // Aquí puedes redirigir a la página de edición
        console.log('Editar usuario:', userId);
        // Ejemplo: Inertia.visit(`/users/${userId}/edit`);
    };

    const handleDelete = async (userId, userName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar usuario',
            description: 'Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.',
            itemName: userName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(route('dashboard.users.destroy', userId), {
                onSuccess: (page) => {
                    const flashSuccess = page.props.flash?.success;
                    const flashError = page.props.flash?.error;

                    if (flashSuccess) {
                        toast.success(flashSuccess);
                    } else if (flashError) {
                        toast.error(flashError);
                    }
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            user={auth.user}
            header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Usuarios</h2>}
        >
            <Head title="Usuarios" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Usuarios</h3>
                                <Link
                                    href={route('dashboard.users.create')}
                                    className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-200 hover:border-blue-300 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Usuario
                                </Link>
                            </div>

                            <DataTable data={users.data || users} columns={columns} pagination={users.links ? users : null} filters={filters} />
                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
