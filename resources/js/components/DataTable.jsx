import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';

export default function DataTable({ data, columns }) {
    const [sorting, setSorting] = useState({ key: null, direction: 'asc' });
    const [filtering, setFiltering] = useState('');

    // Función para ordenar
    const handleSort = (key) => {
        let direction = 'asc';
        if (sorting.key === key && sorting.direction === 'asc') {
            direction = 'desc';
        }
        setSorting({ key, direction });
    };

    // Función para filtrar
    const filteredData = data.filter((item) =>
        Object.values(item).some((value) => value?.toString().toLowerCase().includes(filtering.toLowerCase())),
    );

    // Función para ordenar los datos filtrados
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sorting.key) return 0;

        const aValue = a[sorting.key];
        const bValue = b[sorting.key];

        if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex items-center space-x-2">
                <Input placeholder="Buscar..." value={filtering} onChange={(e) => setFiltering(e.target.value)} className="max-w-sm" />
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key} className="font-medium">
                                    {column.sortable ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort(column.key)}
                                            className="h-auto p-0 font-medium hover:bg-transparent"
                                        >
                                            {column.label}
                                            {sorting.key === column.key && <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>}
                                        </Button>
                                    ) : (
                                        column.label
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length > 0 ? (
                            sortedData.map((row, index) => (
                                <TableRow key={row.id || index}>
                                    {columns.map((column) => (
                                        <TableCell key={column.key}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
