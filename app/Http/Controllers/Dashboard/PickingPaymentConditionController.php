<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Picking\StoreUpdatePickingPaymentConditionRequest;
use App\Models\PickingPaymentCondition;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PickingPaymentConditionController extends Controller
{
    /**
     * Display a listing of payment conditions.
     */
    public function index()
    {
        $paymentConditions = PickingPaymentCondition::orderBy('description')->get();

        return Inertia::render('dashboard/picking/config/PaymentConditions', [
            'paymentConditions' => $paymentConditions
        ]);
    }

    /**
     * Store a newly created payment condition in storage.
     */
    public function store(StoreUpdatePickingPaymentConditionRequest $request)
    {
        try {
            PickingPaymentCondition::create($request->validated());

            return back()->with('success', 'Condición de pago creada correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al crear condición de pago: ' . $e->getMessage());
            return back()->with('error', 'Error al crear la condición de pago.');
        }
    }

    /**
     * Update the specified payment condition in storage.
     */
    public function update(StoreUpdatePickingPaymentConditionRequest $request, PickingPaymentCondition $pickingPaymentCondition)
    {
        try {
            $pickingPaymentCondition->update($request->validated());

            return back()->with('success', 'Condición de pago actualizada correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar condición de pago: ' . $e->getMessage());
            return back()->with('error', 'Error al actualizar la condición de pago.');
        }
    }

    /**
     * Remove the specified payment condition from storage.
     */
    public function destroy(PickingPaymentCondition $pickingPaymentCondition)
    {
        try {
            $pickingPaymentCondition->delete();

            return back()->with('success', 'Condición de pago eliminada correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar condición de pago: ' . $e->getMessage());
            return back()->with('error', 'Error al eliminar la condición de pago.');
        }
    }
}
