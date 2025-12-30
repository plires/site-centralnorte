<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Client;
use Illuminate\Http\Request;
use App\Traits\ExportsToExcel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;

class ClientController extends Controller
{
    use ExportsToExcel;

    public function index()
    {
        return Inertia::render('dashboard/clients/Index', [
            'clients' => Client::all()
        ]);
    }

    public function show(Client $client)
    {
        return Inertia::render('dashboard/clients/Show', [
            'client' => $client
        ]);
    }

    public function create()
    {
        return inertia('dashboard/clients/Create', [
            'client' => Client::all()
        ]);
    }

    public function store(StoreClientRequest $request)
    {
        try {
            $client = Client::create($request->validated());

            return redirect()->back()->with('success', "Cliente '{$client->name}' creado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear el cliente: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear el cliente. Inténtalo de nuevo.');
        }
    }

    public function edit(Client $client)
    {

        return inertia('dashboard/clients/Edit', [
            'client' => $client,
        ]);
    }


    public function update(UpdateClientRequest $request, Client $client)
    {
        try {
            $client->update($request->validated());
            return redirect()->back()->with('success', "Cliente '{$client->name}' actualizado correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar el cliente: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el cliente. Inténtalo de nuevo.');
        }
    }

    public function destroy(Client $client)
    {
        try {
            // Verificar si el cliente  tiene presupuestos asociados
            // TODO: agregar esta logica cuando existan las relaciones correspondientes
            // if ($client->presupuestos()->exists()) {
            //     return redirect()->back()->with(
            //         'error',
            //         "No se puede eliminar el cliente '{$client->name}' porque esta asociado a uno o mas presupuestos."
            //     );
            // }

            // Eliminar el cliente
            $client->delete();

            return redirect()->back()->with(
                'success',
                "Cliente '{$client->name}' eliminado correctamente."
            );
        } catch (\Exception $e) {
            Log::error('Error al eliminar el cliente: ' . $e->getMessage());
            return redirect()->back()->with(
                'error',
                'Ocurrió un error al eliminar el cliente. Inténtalo de nuevo.'
            );
        }
    }

    /**
     * Exportar listado de clientes a Excel
     * Solo accesible para usuarios con role 'admin'
     */
    public function export(Request $request)
    {
        try {

            // Verificar que el usuario sea admin
            $user = Auth::user();

            // Verificar que el usuario sea admin
            if ($user->role->name !== 'admin') {
                // Si es una petición AJAX, devolver JSON
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No tienes permisos para exportar datos.'
                    ], 403);
                }

                // Si es navegación directa, abort normal
                abort(403, 'No tienes permisos para exportar datos.');
            }

            // Obtener todos los clientes
            $clients = Client::all();

            // Verificar si hay datos para exportar
            if ($clients->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay clientes para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay clientes para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'name' => 'Nombre',
                'company' => 'Empresa',
                'email' => 'Email',
                'phone' => 'Teléfono',
                'address' => 'Dirección',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $clients->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'company' => $client->company,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'address' => $client->address,
                    'created_at' => $client->created_at ? $client->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $client->updated_at ? $client->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $client->deleted_at ? $client->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Clientes exportados', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'clientes',
                sheetTitle: 'Lista de Clientes'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar clientes', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Si es petición AJAX, devolver JSON
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.'
                ], 500);
            }

            // Si es navegación normal, redirect con error
            return redirect()->back()->with('error', 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.');
        }
    }
}
