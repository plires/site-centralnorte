import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente de búsqueda de clientes con autocompletado
 */
export default function ClientCombobox({ clients, value, onChange, error, placeholder = 'Seleccionar cliente...' }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Obtener cliente seleccionado
    // CORREGIDO: Ahora funciona con formato {value, label}
    const selectedClient = clients?.find((c) => c.value?.toString() === value?.toString());

    // Filtrar clientes según búsqueda
    const filteredClients = searchTerm
        ? clients?.filter((client) => {
              const searchLower = searchTerm.toLowerCase();
              const labelMatch = client.label?.toLowerCase().includes(searchLower);
              return labelMatch;
          })
        : clients;

    const handleSelect = (clientValue) => {
        onChange(clientValue === value ? '' : clientValue);
        setOpen(false);
        setSearchTerm('');
    };

    // Formatear display del cliente
    const getClientDisplay = (client) => {
        if (!client) return placeholder;
        return client.label || placeholder;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', error && 'border-red-500')}>
                    <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className={cn('truncate', !selectedClient && 'text-muted-foreground')}>{getClientDisplay(selectedClient)}</span>
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar cliente..." value={searchTerm} onValueChange={setSearchTerm} />
                    <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                        {filteredClients?.map((client) => {
                            const isSelected = value?.toString() === client.value?.toString();

                            return (
                                <CommandItem key={client.value} onSelect={() => handleSelect(client.value.toString())} className="cursor-pointer">
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate font-medium">{client.label}</p>
                                        </div>
                                        <Check className={cn('h-4 w-4 flex-shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                                    </div>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
