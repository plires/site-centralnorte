<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class ClientController extends Controller
{
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'max:255|required|string',
            'email' => 'max:255|required|email|string',
            'company' => 'max:255|nullable|string',
            'phone' => 'max:255|nullable|string',
            'address' => 'max:255|nullable|string',
        ]);

        try {
            $client = Client::create($validated);

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


    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'max:255|required|string',
            'email' => 'max:255|required|email|string',
            'company' => 'max:255|nullable|string',
            'phone' => 'max:255|nullable|string',
            'address' => 'max:255|nullable|string',
        ]);

        try {
            $client->update($validated);
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
}
