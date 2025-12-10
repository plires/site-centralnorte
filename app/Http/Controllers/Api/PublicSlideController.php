<?php

namespace App\Http\Controllers\Api;

use App\Models\Slide;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PublicSlideController extends Controller
{
    /**
     * Obtener todos los slides activos ordenados.
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $slides = Slide::active()
            ->ordered()
            ->get([
                'id',
                'title',
                'image_desktop',
                'image_mobile',
                'link',
                'sort_order',
            ]);

        // Transformar para incluir URLs completas
        $slidesData = $slides->map(function ($slide) {
            return [
                'id' => $slide->id,
                'title' => $slide->title,
                'image_desktop' => $slide->image_desktop_url,
                'image_mobile' => $slide->image_mobile_url,
                'link' => $slide->link,
                'sort_order' => $slide->sort_order,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $slidesData,
            'meta' => [
                'total' => $slidesData->count(),
            ],
        ]);
    }

    /**
     * Obtener un slide específico por ID.
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $slide = Slide::active()->find($id);

        if (!$slide) {
            return response()->json([
                'success' => false,
                'message' => 'Slide no encontrado o no está activo.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $slide->id,
                'title' => $slide->title,
                'image_desktop' => $slide->image_desktop_url,
                'image_mobile' => $slide->image_mobile_url,
                'link' => $slide->link,
                'sort_order' => $slide->sort_order,
            ],
        ]);
    }
}
