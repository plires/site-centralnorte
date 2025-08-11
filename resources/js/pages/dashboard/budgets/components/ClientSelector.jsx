import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Check, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ClientSelector({ value, onChange, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    // Buscar clientes cuando cambie el término de búsqueda
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (search.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                searchClients(search);
            }, 300);
        } else {
            setClients([]);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    // Obtener datos del cliente seleccionado al cargar
    useEffect(() => {
        if (value && !selectedClient) {
            fetchClientData(value);
        }
    }, [value]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchClients = async (searchTerm) => {
        setLoading(true);
        try {
            const response = await axios.get(route('api.clients.search'), {
                params: { search: searchTerm, limit: 10 },
            });

            if (response.data.success) {
                setClients(response.data.data);
            }
        } catch (error) {
            console.error('Error buscando clientes:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientData = async (clientId) => {
        try {
            const response = await axios.get(route('api.clients.show', clientId));
            if (response.data.success) {
                setSelectedClient(response.data.data);
                setSearch(`${response.data.data.name}${response.data.data.company ? ` (${response.data.data.company})` : ''}`);
            }
        } catch (error) {
            console.error('Error obteniendo datos del cliente:', error);
        }
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client.data);
        setSearch(client.label);
        setIsOpen(false);
        onChange(client.value);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        if (clients.length === 0 && search.length >= 2) {
            searchClients(search);
        }
    };

    const handleInputChange = (e) => {
        const newSearch = e.target.value;
        setSearch(newSearch);

        // Si se borra el contenido, limpiar selección
        if (!newSearch) {
            setSelectedClient(null);
            onChange('');
            setClients([]);
        }

        setIsOpen(true);
    };

    const handleCreateNew = () => {
        // Redireccionar a crear cliente o abrir modal
        window.open(route('dashboard.clients.create'), '_blank');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <Input
                    value={search}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Buscar cliente por nombre o empresa..."
                    className={`pl-10 ${error ? 'border-red-500' : ''} ${selectedClient ? 'border-green-300 bg-green-50' : ''}`}
                />
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                {selectedClient && <Check className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-green-600" />}
            </div>

            {/* Dropdown de resultados */}
            {isOpen && (
                <Card className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border bg-white shadow-lg">
                    {loading && (
                        <div className="p-3 text-center text-gray-500">
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            <span className="ml-2">Buscando...</span>
                        </div>
                    )}

                    {!loading && search.length < 2 && <div className="p-3 text-center text-gray-500">Escribe al menos 2 caracteres para buscar</div>}

                    {!loading && search.length >= 2 && clients.length === 0 && (
                        <div className="p-3">
                            <div className="mb-2 text-center text-gray-500">No se encontraron clientes</div>
                            <Button type="button" onClick={handleCreateNew} variant="outline" size="sm" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Crear nuevo cliente
                            </Button>
                        </div>
                    )}

                    {!loading && clients.length > 0 && (
                        <div>
                            {clients.map((client) => (
                                <div
                                    key={client.value}
                                    onClick={() => handleClientSelect(client)}
                                    className="cursor-pointer border-b p-3 last:border-b-0 hover:bg-gray-50"
                                >
                                    <div className="font-medium text-gray-900">{client.data.name}</div>
                                    {client.data.company && <div className="text-sm text-gray-500">{client.data.company}</div>}
                                    {client.data.email && <div className="text-xs text-gray-400">{client.data.email}</div>}
                                </div>
                            ))}

                            <div className="border-t bg-gray-50 p-2">
                                <Button type="button" onClick={handleCreateNew} variant="ghost" size="sm" className="w-full justify-start">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear nuevo cliente
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Información del cliente seleccionado */}
            {selectedClient && (
                <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-3">
                    <div className="text-sm">
                        <div className="font-medium text-green-800">{selectedClient.name}</div>
                        {selectedClient.company && <div className="text-green-600">{selectedClient.company}</div>}
                        {selectedClient.email && <div className="text-green-600">{selectedClient.email}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
