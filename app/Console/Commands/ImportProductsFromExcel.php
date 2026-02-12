<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportProductsFromExcel extends Command
{
    protected $signature = 'products:import-excel
                            {--file= : Ruta al archivo Excel (default: products_upload.xlsx en la raíz del proyecto)}
                            {--images-dir= : Carpeta con las imágenes (default: images_productos en la raíz del proyecto)}
                            {--dry-run : Simular la importación sin guardar nada}
                            {--skip-images : Importar solo productos sin procesar imágenes}';

    protected $description = 'Importa productos masivamente desde un archivo Excel (.xlsx)';

    // Extensiones soportadas para buscar imágenes en disco
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    // Estadísticas
    private array $stats = [
        'products_created'  => 0,
        'products_updated'  => 0,
        'categories_created' => 0,
        'images_processed'  => 0,
        'images_skipped'    => 0,
        'errors'            => 0,
        'rows_skipped'      => 0,
    ];

    public function handle(): int
    {
        set_time_limit(0);
        ini_set('memory_limit', '512M');

        $dryRun     = $this->option('dry-run');
        $skipImages = $this->option('skip-images');

        // Resolver rutas
        $excelFile  = $this->option('file')       ?? base_path('products_upload.xlsx');
        $imagesDir  = $this->option('images-dir') ?? base_path('images_productos');

        $this->info('');
        $this->info('📦  Importación masiva de productos desde Excel');
        $this->info('================================================');
        $dryRun && $this->warn('⚠️   MODO DRY-RUN: no se guardará nada en la base de datos ni en disco.');
        $this->info("📄  Excel  : {$excelFile}");
        $this->info("🖼️   Imágenes: {$imagesDir}");
        $this->newLine();

        // Validar rutas
        if (!file_exists($excelFile)) {
            $this->error("❌  No se encontró el archivo Excel: {$excelFile}");
            return self::FAILURE;
        }

        if (!$skipImages && !is_dir($imagesDir)) {
            $this->error("❌  No se encontró la carpeta de imágenes: {$imagesDir}");
            return self::FAILURE;
        }

        // Leer el Excel
        $this->info('📖  Leyendo el archivo Excel...');
        try {
            $spreadsheet = IOFactory::load($excelFile);
            $sheet       = $spreadsheet->getActiveSheet();
            $rows        = $sheet->toArray(null, true, true, true); // [A=>val, B=>val, ...]
        } catch (\Exception $e) {
            $this->error("❌  Error al leer el Excel: {$e->getMessage()}");
            return self::FAILURE;
        }

        if (empty($rows)) {
            $this->error('❌  El archivo Excel está vacío.');
            return self::FAILURE;
        }

        // Mapear encabezados (fila 1) → columna letra
        $headerRow = array_shift($rows);
        $colMap    = $this->mapHeaders($headerRow);

        $required = ['sku', 'name'];
        foreach ($required as $col) {
            if (!isset($colMap[$col])) {
                $this->error("❌  No se encontró la columna requerida \"{$col}\" en el Excel.");
                return self::FAILURE;
            }
        }

        $this->info('✅  Encabezados detectados: ' . implode(', ', array_keys($colMap)));
        $this->info('🔢  Filas de datos a procesar: ' . count($rows));
        $this->newLine();

        // Barra de progreso
        $bar = $this->output->createProgressBar(count($rows));
        $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% — %message%');
        $bar->setMessage('Iniciando...');
        $bar->start();

        foreach ($rows as $rowIndex => $row) {
            $lineNumber = $rowIndex + 2; // +2 porque desplazamos la cabecera y los arrays son 1-based

            $sku  = $this->getCellValue($row, $colMap, 'sku');
            $name = $this->getCellValue($row, $colMap, 'name');

            // Saltar filas vacías
            if (empty($sku) && empty($name)) {
                $this->stats['rows_skipped']++;
                $bar->advance();
                continue;
            }

            if (empty($sku)) {
                $this->logError($lineNumber, 'La fila no tiene SKU, se omite.');
                $bar->advance();
                continue;
            }

            $bar->setMessage("SKU: {$sku}");

            try {
                $this->processRow($row, $colMap, $imagesDir, $dryRun, $skipImages, $lineNumber);
            } catch (\Exception $e) {
                $this->stats['errors']++;
                Log::error("[ImportProductsFromExcel] Fila {$lineNumber} (SKU: {$sku}): {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->setMessage('Completado');
        $bar->finish();
        $this->newLine(2);

        // Resumen final
        $this->info('✅  Importación finalizada.');
        $this->table(
            ['Métrica', 'Cantidad'],
            [
                ['Productos creados',    $this->stats['products_created']],
                ['Productos actualizados', $this->stats['products_updated']],
                ['Categorías creadas',   $this->stats['categories_created']],
                ['Imágenes procesadas',  $this->stats['images_processed']],
                ['Imágenes omitidas',    $this->stats['images_skipped']],
                ['Filas omitidas',       $this->stats['rows_skipped']],
                ['Errores',              $this->stats['errors']],
            ]
        );

        if ($dryRun) {
            $this->newLine();
            $this->warn('ℹ️   Modo dry-run: ningún cambio fue persistido.');
        }

        return $this->stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    // -------------------------------------------------------------------------
    // Procesamiento de cada fila
    // -------------------------------------------------------------------------

    private function processRow(array $row, array $colMap, string $imagesDir, bool $dryRun, bool $skipImages, int $lineNumber): void
    {
        $sku             = trim($this->getCellValue($row, $colMap, 'sku'));
        $name            = trim($this->getCellValue($row, $colMap, 'name'));
        $description     = $this->getCellValue($row, $colMap, 'description');
        $lastPrice       = $this->getCellValue($row, $colMap, 'last_price');
        $origin          = $this->getCellValue($row, $colMap, 'origin') ?: Product::ORIGIN_LOCAL;
        $categoriesRaw   = $this->getCellValue($row, $colMap, 'categories');
        $imagesRaw       = $this->getCellValue($row, $colMap, 'images');
        $isVisibleRaw    = $this->getCellValue($row, $colMap, 'is_visible_in_front');

        // Normalizar is_visible_in_front
        $isVisible = $this->parseBool($isVisibleRaw, true);

        // Normalizar last_price
        $price = null;
        if ($lastPrice !== null && $lastPrice !== '') {
            $price = (float) str_replace(',', '.', $lastPrice);
        }

        // ---- Categorías ----
        $categoryIds = [];
        if (!empty($categoriesRaw)) {
            $categoryIds = $this->resolveCategories($categoriesRaw, $dryRun);
        }

        if ($dryRun) {
            $this->stats['products_created']++;
            // En dry-run contamos imágenes sin procesar
            if (!$skipImages && !empty($imagesRaw)) {
                $imageNames = $this->parseImageNames($imagesRaw);
                $this->stats['images_processed'] += count($imageNames);
            }
            return;
        }

        // ---- Upsert del producto ----
        /** @var Product $product */
        $product = Product::withTrashed()->where('sku', $sku)->first();

        if ($product) {
            // Si estaba eliminado, lo restauramos
            if ($product->trashed()) {
                $product->restore();
            }

            $product->update([
                'name'                => $name,
                'description'         => $description,
                'last_price'          => $price,
                'origin'              => $origin,
                'is_visible_in_front' => $isVisible,
            ]);
            $this->stats['products_updated']++;
        } else {
            $product = Product::create([
                'sku'                 => $sku,
                'name'                => $name,
                'description'         => $description,
                'last_price'          => $price,
                'origin'              => $origin,
                'is_visible_in_front' => $isVisible,
            ]);
            $this->stats['products_created']++;
        }

        // ---- Asignar categorías ----
        if (!empty($categoryIds)) {
            // Preparar datos del pivot: la primera categoría será is_main = true
            $syncData = [];
            foreach ($categoryIds as $index => $catId) {
                $syncData[$catId] = [
                    'show'    => true,
                    'is_main' => ($index === 0),
                ];
            }
            // syncWithoutDetaching para no quitar categorías que ya pudiera tener de otro origen
            $product->categories()->syncWithoutDetaching($syncData);
        }

        // ---- Imágenes ----
        if (!$skipImages && !empty($imagesRaw)) {
            $this->processImages($product, $imagesRaw, $imagesDir, $lineNumber);
        }
    }

    // -------------------------------------------------------------------------
    // Categorías
    // -------------------------------------------------------------------------

    /**
     * Resuelve una lista de nombres de categorías separadas por coma.
     * Crea las que no existan. Devuelve array de IDs (en el mismo orden).
     */
    private function resolveCategories(string $categoriesRaw, bool $dryRun): array
    {
        $names = array_filter(array_map('trim', explode(',', $categoriesRaw)));
        $ids   = [];

        foreach ($names as $name) {
            if ($dryRun) {
                $ids[] = 0; // placeholder
                continue;
            }

            $category = Category::where('name', $name)->first();

            if (!$category) {
                $category = Category::create([
                    'name'   => $name,
                    'title'  => $name,
                    'show'   => true,
                    'origin' => Category::ORIGIN_LOCAL,
                ]);
                $this->stats['categories_created']++;
            }

            $ids[] = $category->id;
        }

        return $ids;
    }

    // -------------------------------------------------------------------------
    // Imágenes
    // -------------------------------------------------------------------------

    /**
     * Procesa la cadena de nombres de imágenes de una fila y las sube al storage.
     */
    private function processImages(Product $product, string $imagesRaw, string $imagesDir, int $lineNumber): void
    {
        $imageNames = $this->parseImageNames($imagesRaw);

        foreach ($imageNames as $index => $baseName) {
            $sourcePath = $this->findImageFile($imagesDir, $baseName);

            if (!$sourcePath) {
                $this->stats['images_skipped']++;
                Log::warning("[ImportProductsFromExcel] Fila {$lineNumber}: imagen \"{$baseName}\" no encontrada en {$imagesDir}");
                continue;
            }

            try {
                // Procesar igual que ProductImageController::store:
                $processedImage = Image::read($sourcePath)
                    ->cover(800, 800) // escala y recorta centrado
                    ->encodeByExtension('webp', 85);

                $filename = Str::uuid() . '.webp';
                $storagePath = "products/{$product->id}/{$filename}";

                Storage::disk('public')->put($storagePath, (string) $processedImage);

                $isFeatured = ($index === 0) && ($product->images()->count() === 0);

                ProductImage::create([
                    'product_id'  => $product->id,
                    'url'         => $storagePath,
                    'is_featured' => $isFeatured,
                    'variant'     => null,
                ]);

                $this->stats['images_processed']++;
            } catch (\Exception $e) {
                $this->stats['errors']++;
                Log::error("[ImportProductsFromExcel] Fila {$lineNumber}: error procesando imagen \"{$baseName}\": {$e->getMessage()}");
            }
        }
    }

    /**
     * Busca el archivo de imagen en el directorio, probando todas las extensiones soportadas.
     * Retorna la ruta absoluta o null si no la encuentra.
     */
    private function findImageFile(string $imagesDir, string $baseName): ?string
    {
        foreach (self::IMAGE_EXTENSIONS as $ext) {
            $path = rtrim($imagesDir, '/') . '/' . $baseName . '.' . $ext;
            if (file_exists($path)) {
                return $path;
            }
        }
        return null;
    }

    /**
     * Parsea la cadena de nombres de imágenes separadas por coma.
     * Ejemplo: "BP187-1, BP187-2, BP187-3" → ['BP187-1', 'BP187-2', 'BP187-3']
     */
    private function parseImageNames(string $imagesRaw): array
    {
        return array_values(
            array_filter(
                array_map('trim', explode(',', $imagesRaw))
            )
        );
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Construye el mapa columna→letra a partir de la fila de encabezados.
     * Claves en minúsculas para comparación case-insensitive.
     */
    private function mapHeaders(array $headerRow): array
    {
        $map = [];
        foreach ($headerRow as $col => $value) {
            if ($value !== null && $value !== '') {
                $map[strtolower(trim((string) $value))] = $col;
            }
        }
        return $map;
    }

    /**
     * Lee el valor de una celda usando el mapa de columnas.
     */
    private function getCellValue(array $row, array $colMap, string $fieldName): mixed
    {
        if (!isset($colMap[$fieldName])) {
            return null;
        }
        $col = $colMap[$fieldName];
        return $row[$col] ?? null;
    }

    /**
     * Convierte distintos valores de texto a boolean.
     */
    private function parseBool(mixed $value, bool $default = true): bool
    {
        if ($value === null || $value === '') {
            return $default;
        }
        $lower = strtolower(trim((string) $value));
        if (in_array($lower, ['1', 'true', 'yes', 'si', 'sí', 'verdadero'], true)) {
            return true;
        }
        if (in_array($lower, ['0', 'false', 'no', 'falso'], true)) {
            return false;
        }
        return $default;
    }

    private function logError(int $line, string $message): void
    {
        $this->stats['errors']++;
        Log::warning("[ImportProductsFromExcel] Fila {$line}: {$message}");
    }
}
