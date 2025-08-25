<?php

return [
    'show_warnings' => false,
    'public_path' => null,
    'convert_entities' => true,

    'options' => [
        'font_dir' => storage_path('fonts'),
        'font_cache' => storage_path('fonts'),
        'temp_dir' => sys_get_temp_dir(),
        'chroot' => realpath(base_path()),

        'allowed_protocols' => [
            'data://' => ['rules' => []],
            'file://' => ['rules' => []],
            'http://' => ['rules' => []],
            'https://' => ['rules' => []],
        ],

        // CONFIGURACIÓN MEJORADA PARA IMÁGENES
        'enable_remote' => true,  // Habilitar carga de imágenes remotas
        'enable_php' => false,    // Mantener deshabilitado por seguridad
        'enable_javascript' => false, // Deshabilitado para PDFs
        'enable_html5_parser' => true,

        // Calidad y rendimiento de imágenes
        'dpi' => 150,  // Aumentado para mejor calidad
        'default_media_type' => 'screen',
        'default_paper_size' => 'a4',
        'default_paper_orientation' => 'portrait',
        'default_font' => 'sans-serif',

        // Backend de renderizado
        'pdf_backend' => 'CPDF',

        // Configuración de fuentes
        'enable_font_subsetting' => false,
        'font_height_ratio' => 1.1,

        // Configuración adicional para imágenes
        'isRemoteEnabled' => true,
        'isPhpEnabled' => false,
        'isHtml5ParserEnabled' => true,
        'isFontSubsettingEnabled' => false,
    ],
];
