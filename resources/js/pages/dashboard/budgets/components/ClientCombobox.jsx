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
    const selectedClient = clients.find((c) => c.id.toString() === value?.toString());

    // Filtrar clientes según búsqueda
    const filteredClients = searchTerm
        ? clients.filter((client) => {
              const searchLower = searchTerm.toLowerCase();
              const nameMatch = client.name?.toLowerCase().includes(searchLower);
              const companyMatch = client.company?.toLowerCase().includes(searchLower);
              const emailMatch = client.email?.toLowerCase().includes(searchLower);
              return nameMatch || companyMatch || emailMatch;
          })
        : clients;

    const handleSelect = (clientId) => {
        onChange(clientId === value ? '' : clientId);
        setOpen(false);
        setSearchTerm('');
    };

    // Formatear display del cliente
    const getClientDisplay = (client) => {
        if (!client) return placeholder;
        return client.company ? `${client.name} (${client.company})` : client.name;
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
                    <CommandInput placeholder="Buscar por nombre, empresa o email..." value={searchTerm} onValueChange={setSearchTerm} />
                    <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                        {filteredClients.map((client) => {
                            const isSelected = value?.toString() === client.id.toString();

                            return (
                                <CommandItem key={client.id} onSelect={() => handleSelect(client.id.toString())} className="cursor-pointer">
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate font-medium">{client.name}</p>
                                            <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
                                                {client.company && <span className="truncate">🏢 {client.company}</span>}
                                                {client.email && <span className="truncate">✉️ {client.email}</span>}
                                            </div>
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
