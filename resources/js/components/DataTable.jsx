import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsLeft, ChevronsRight, Search, X } from 'lucide-react';
import { useState } from 'react';

export default function DataTable({
    data,
    columns,
    pagination = null,
    filters = {},
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'No se encontraron resultados.',
    className = '',
    onRowClick = null,
}) {
    const [sorting, setSorting] = useState({ key: null, direction: 'asc' });
    const [filtering, setFiltering] = useState(filters.search || '');

    // Determinar si hay paginación
    const hasPagination = pagination && pagination.links;

    // Obtener información de ordenamiento actual (desde URL o filtros)
    const getCurrentSort = () => {
        if (hasPagination && filters) {
            return {
                key: filters.sort || null,
                direction: filters.direction || 'asc',
            };
        }
        return sorting;
    };

    const currentSort = getCurrentSort();

    // Si hay paginación, usar los datos tal como vienen
    // Si no hay paginación, aplicar filtrado y ordenamiento local
    const processedData = hasPagination
        ? data
        : (() => {
              // Función para filtrar (solo si no hay paginación)
              const filteredData = data.filter((item) =>
                  Object.values(item).some((value) => value?.toString().toLowerCase().includes(filtering.toLowerCase())),
              );

              // Función para ordenar los datos filtrados (solo si no hay paginación)
              return [...filteredData].sort((a, b) => {
                  if (!sorting.key) return 0;

                  const aValue = a[sorting.key];
                  const bValue = b[sorting.key];

                  if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
                  if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
                  return 0;
              });
          })();

    // Función para manejar ordenamiento
    const handleSort = (key) => {
        if (hasPagination) {
            // Si hay paginación, redirigir con parámetros de ordenamiento
            const currentSort = getCurrentSort();

            let direction = 'asc';
            if (currentSort.key === key && currentSort.direction === 'asc') {
                direction = 'desc';
            }

            router.get(
                window.location.pathname,
                {
                    sort: key,
                    direction: direction,
                    search: filtering || undefined,
                    page: 1, // Resetear a la primera página al ordenar
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        } else {
            // Ordenamiento local
            let direction = 'asc';
            if (sorting.key === key && sorting.direction === 'asc') {
                direction = 'desc';
            }
            setSorting({ key, direction });
        }
    };

    // Función para manejar filtrado
    const handleFilter = (value) => {
        setFiltering(value);

        if (hasPagination) {
            // Si hay paginación, redirigir con parámetros de búsqueda
            const timeoutId = setTimeout(() => {
                router.get(
                    window.location.pathname,
                    {
                        search: value || undefined,
                        page: 1, // Resetear a la primera página al buscar
                    },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }, 300); // Debounce de 300ms

            return () => clearTimeout(timeoutId);
        }
    };

    // Función para limpiar el filtro
    const clearFilter = () => {
        setFiltering('');

        if (hasPagination) {
            router.get(
                window.location.pathname,
                {
                    sort: filters.sort || undefined,
                    direction: filters.direction || undefined,
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    // Función para cambiar de página
    const handlePageChange = (url) => {
        if (url) {
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Barra de búsqueda */}
            <div className="relative w-full sm:max-w-sm">
                <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder={searchPlaceholder}
                    value={filtering}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="w-full pr-8 pl-8"
                />
                {filtering && (
                    <Button variant="ghost" size="sm" className="absolute top-0 right-0 h-full px-2 py-0 hover:bg-transparent" onClick={clearFilter}>
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </Button>
                )}
            </div>

            {/* Contenedor responsivo para la tabla */}
            <div className="w-full overflow-x-auto">
                <div className="min-w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={`text-center font-medium whitespace-nowrap ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                                    >
                                        {column.sortable ? (
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort(column.key)}
                                                className="h-auto p-0 font-medium hover:bg-transparent"
                                            >
                                                {column.label}
                                                {currentSort.key === column.key && (
                                                    <span className="ml-1">
                                                        {currentSort.direction === 'asc' ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </span>
                                                )}
                                            </Button>
                                        ) : (
                                            column.label
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.length > 0 ? (
                                processedData.map((row, index) => (
                                    <TableRow
                                        key={row.id || index}
                                        className="cursor-pointer transition-colors duration-200 hover:bg-gray-50 hover:text-blue-600"
                                        onClick={(e) => {
                                            // Verificar si el clic fue en un elemento interactivo
                                            if (e.target.closest('button, [role="menuitem"], a')) {
                                                return; // No hacer nada si se clickeó un botón o enlace
                                            }
                                            onRowClick?.(row, index);
                                        }}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={`${
                                                    column.hideOnMobile ? 'hidden sm:table-cell' : ''
                                                } ${column.truncate ? 'max-w-[200px] truncate' : ''}`}
                                            >
                                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Paginación responsiva */}
            {hasPagination && (
                <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
                    <div className="text-muted-foreground text-center text-xs sm:text-left">
                        {pagination.from && pagination.to && pagination.total
                            ? `Mostrando ${pagination.from} a ${pagination.to} de ${pagination.total} resultados`
                            : '0 de 0 resultados'}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(pagination.first_page_url)}
                            disabled={pagination.current_page === 1}
                        >
                            <span className="sr-only">Ir a la primera página</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(pagination.prev_page_url)}
                            disabled={!pagination.prev_page_url}
                        >
                            <span className="sr-only">Ir a la página anterior</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-muted-foreground px-2 text-xs">
                            <span className="hidden sm:inline">Página </span>
                            {pagination.current_page} de {pagination.last_page}
                        </div>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(pagination.next_page_url)}
                            disabled={!pagination.next_page_url}
                        >
                            <span className="sr-only">Ir a la página siguiente</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(pagination.last_page_url)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            <span className="sr-only">Ir a la última página</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
