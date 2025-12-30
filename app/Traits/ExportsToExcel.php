<?php

namespace App\Traits;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Str;

trait ExportsToExcel
{
    /**
     * Exportar datos a Excel con formato profesional
     * 
     * @param array $data Array de datos a exportar
     * @param array $headers Array de encabezados ['key' => 'Label']
     * @param string $filename Nombre del archivo (sin extensión)
     * @param string $sheetTitle Título de la hoja
     * @return StreamedResponse
     */
    protected function exportToExcel(
        array $data, 
        array $headers, 
        string $filename = 'export', 
        string $sheetTitle = 'Datos'
    ): StreamedResponse {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(Str::limit($sheetTitle, 31)); // Excel limita a 31 caracteres

        // Configurar encabezados
        $column = 'A';
        $headerRow = 1;
        
        foreach ($headers as $header) {
            $sheet->setCellValue($column . $headerRow, $header);
            $column++;
        }

        // Estilizar encabezados
        $lastColumn = chr(ord('A') + count($headers) - 1);
        $headerRange = 'A1:' . $lastColumn . '1';
        
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'], // Indigo
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Ajustar altura del encabezado
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Llenar datos
        $row = 2;
        foreach ($data as $item) {
            $column = 'A';
            foreach (array_keys($headers) as $key) {
                $value = $this->getNestedValue($item, $key);
                $sheet->setCellValue($column . $row, $value);
                $column++;
            }
            $row++;
        }

        // Estilizar filas de datos (zebra striping)
        $dataRange = 'A2:' . $lastColumn . ($row - 1);
        $sheet->getStyle($dataRange)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
        ]);

        // Aplicar zebra striping (filas alternas)
        for ($i = 2; $i < $row; $i++) {
            if ($i % 2 == 0) {
                $sheet->getStyle('A' . $i . ':' . $lastColumn . $i)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F3F4F6'], // Gray-100
                    ],
                ]);
            }
        }

        // Auto-ajustar ancho de columnas
        foreach (range('A', $lastColumn) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Agregar metadatos
        $spreadsheet->getProperties()
            ->setCreator(config('app.name'))
            ->setLastModifiedBy(auth()->user()->name ?? 'Sistema')
            ->setTitle($sheetTitle)
            ->setSubject('Exportación de datos')
            ->setDescription('Generado automáticamente desde ' . config('app.name'))
            ->setKeywords('export excel data')
            ->setCategory('Reportes');

        // Crear respuesta streaming
        return new StreamedResponse(
            function () use ($spreadsheet) {
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '_' . now()->format('Y-m-d_His') . '.xlsx"',
                'Cache-Control' => 'max-age=0',
            ]
        );
    }

    /**
     * Obtener valor anidado de un array u objeto usando notación de punto
     * 
     * @param mixed $item
     * @param string $key
     * @return mixed
     */
    protected function getNestedValue($item, string $key)
    {
        // Si es un objeto, convertir a array
        if (is_object($item)) {
            $item = $item->toArray();
        }

        // Si no tiene puntos, retornar directamente
        if (!str_contains($key, '.')) {
            return $item[$key] ?? '';
        }

        // Navegar por la estructura anidada
        $keys = explode('.', $key);
        $value = $item;

        foreach ($keys as $nestedKey) {
            if (is_array($value) && isset($value[$nestedKey])) {
                $value = $value[$nestedKey];
            } elseif (is_object($value) && isset($value->{$nestedKey})) {
                $value = $value->{$nestedKey};
            } else {
                return '';
            }
        }

        // Formatear valores especiales
        return $this->formatCellValue($value);
    }

    /**
     * Formatear valores para Excel
     * 
     * @param mixed $value
     * @return string
     */
    protected function formatCellValue($value): string
    {
        // Si es booleano
        if (is_bool($value)) {
            return $value ? 'Sí' : 'No';
        }

        // Si es null
        if (is_null($value)) {
            return '';
        }

        // Si es un array (convertir a string)
        if (is_array($value)) {
            return implode(', ', $value);
        }

        // Si es una fecha Carbon
        if ($value instanceof \Carbon\Carbon) {
            return $value->format('d/m/Y H:i:s');
        }

        // Retornar como string
        return (string) $value;
    }
}
