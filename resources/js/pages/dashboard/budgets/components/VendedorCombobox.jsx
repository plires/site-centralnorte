import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Check, ChevronsUpDown, Loader2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Componente de búsqueda de vendedores con autocompletado
 * Carga los vendedores desde la API cuando se monta el componente
 */
export default function VendedorCombobox({ value, onChange, error, placeholder = 'Seleccionar vendedor...', disabled = false }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Cargar vendedores al montar el componente
    useEffect(() => {
        loadVendedores();
    }, []);

    const loadVendedores = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await axios.get('/api/vendedores/search');
            if (response.data.success) {
                setVendedores(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar vendedores:', error);
            setLoadError('No se pudieron cargar los vendedores');
        } finally {
            setLoading(false);
        }
    };

    // Obtener vendedor seleccionado
    const selectedVendedor = vendedores.find((v) => v.value.toString() === value?.toString());

    // Filtrar vendedores según búsqueda
    const filteredVendedores = searchTerm
        ? vendedores.filter((vendedor) => {
              const searchLower = searchTerm.toLowerCase();
              const nameMatch = vendedor.label?.toLowerCase().includes(searchLower);
              const emailMatch = vendedor.data?.email?.toLowerCase().includes(searchLower);
              return nameMatch || emailMatch;
          })
        : vendedores;

    const handleSelect = (vendedorId) => {
        onChange(vendedorId === value ? '' : vendedorId);
        setOpen(false);
        setSearchTerm('');
    };

    // Formatear display del vendedor
    const getVendedorDisplay = (vendedor) => {
        if (!vendedor) return placeholder;
        return vendedor.label;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', error && 'border-red-500')}
                    disabled={disabled || loading}
                >
                    <span className="flex items-center gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : <User className="h-4 w-4 text-gray-500" />}
                        <span className={cn('truncate', !selectedVendedor && 'text-muted-foreground')}>
                            {loading ? 'Cargando vendedores...' : getVendedorDisplay(selectedVendedor)}
                        </span>
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar por nombre o email..." value={searchTerm} onValueChange={setSearchTerm} />
                    {loadError ? (
                        <div className="py-6 text-center text-sm text-red-500">
                            {loadError}
                            <Button variant="link" size="sm" onClick={loadVendedores} className="ml-2">
                                Reintentar
                            </Button>
                        </div>
                    ) : (
                        <>
                            <CommandEmpty>No se encontraron vendedores.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                                {filteredVendedores.map((vendedor) => {
                                    const isSelected = value?.toString() === vendedor.value.toString();

                                    return (
                                        <CommandItem
                                            key={vendedor.value}
                                            onSelect={() => handleSelect(vendedor.value.toString())}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="truncate font-medium">{vendedor.label}</p>
                                                    <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
                                                        {vendedor.data?.email && <span className="truncate">✉️ {vendedor.data.email}</span>}
                                                    </div>
                                                </div>
                                                <Check className={cn('h-4 w-4 flex-shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
