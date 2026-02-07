<?php

namespace App\Http\Controllers\Public\Site;

use App\Http\Controllers\Controller;
use App\Services\PublicQuoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SolicitarPresupuestoController extends Controller
{
    protected PublicQuoteService $quoteService;

    public function __construct(PublicQuoteService $quoteService)
    {
        $this->quoteService = $quoteService;
    }

    /**
     * Mostrar el formulario de solicitud de presupuesto
     */
    public function index()
    {
        return Inertia::render('public/site/solicitar-presupuesto/SolicitarPresupuesto');
    }

    /**
     * Procesar la solicitud de presupuesto
     */
    public function store(Request $request)
    {
        // Validar datos del cliente
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'comments' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.variantId' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1|max:10000',
            'items.*.productName' => 'required|string',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Ingresá un email válido.',
            'items.required' => 'Debés agregar al menos un producto al carrito.',
            'items.min' => 'Debés agregar al menos un producto al carrito.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $customerData = [
                'name' => $request->name,
                'email' => $request->email,
                'company' => $request->company,
                'phone' => $request->phone,
                'address' => $request->address,
            ];

            $budget = $this->quoteService->createQuoteFromCart(
                $customerData,
                $request->items,
                $request->comments
            );

            Log::info('Presupuesto creado exitosamente', [
                'budget_id' => $budget->id,
                'budget_number' => $budget->budget_merch_number,
            ]);

            // Redirigir a página de confirmación
            return redirect()->route('public.quote.success')->with('budget_number', $budget->budget_merch_number);
        } catch (\Exception $e) {
            Log::error('Error al crear presupuesto desde sitio público', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Ocurrió un error al procesar tu solicitud. Por favor, intentá nuevamente.');
        }
    }

    /**
     * Mostrar página de confirmación
     */
    public function success(Request $request)
    {
        $budgetNumber = session('budget_number');

        if (!$budgetNumber) {
            return redirect()->route('public.cart');
        }

        return Inertia::render('public/site/solicitar-presupuesto/PresupuestoEnviado', [
            'budgetNumber' => $budgetNumber,
        ]);
    }
}
