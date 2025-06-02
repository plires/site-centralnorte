import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';

import DataTable from '@/Components/DataTable';
import { Button } from '@/components/ui/button';

const breadcrumbs = [
    {
        title: 'Usuarios',
        href: '/dashboard/users',
    },
];

export default function Index({ auth, users }) {
    // Definir las columnas de la tabla
    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
        },
        {
            key: 'name',
            label: 'Nombre',
            sortable: true,
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Fecha de Registro',
            sortable: true,
            render: (value) => {
                return new Date(value).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            },
        },
        // Versión alternativa para la columna de acciones con Editar/Eliminar
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
                        <DropdownMenuItem onClick={() => handleEdit(row.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600">
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleEdit = (userId) => {
        // Aquí puedes redirigir a la página de edición
        console.log('Editar usuario:', userId);
        // Ejemplo: Inertia.visit(`/users/${userId}/edit`);
    };

    const handleDelete = (userId) => {
        // Aquí puedes manejar la eliminación
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            console.log('Eliminar usuario:', userId);
            // Ejemplo: Inertia.delete(`/users/${userId}`);
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
                {/* <pre>{JSON.stringify(auth, null, 2)}</pre> */}
                <div className="mx-auto">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Usuarios</h3>
                                <Button onClick={() => console.log('Crear nuevo usuario')}>Nuevo Usuario</Button>
                            </div>
                            <p>{auth.user.name}</p>

                            <DataTable data={users} columns={columns} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
