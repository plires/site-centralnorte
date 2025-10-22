<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | External Products API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para la API externa de productos (solo lectura).
    | Los productos se sincronizan desde esta API hacia la base de datos local.
    |
    */
    'external_products' => [
        'url' => env('EXTERNAL_PRODUCTS_API_URL'),
        'api_token' => env('EXTERNAL_PRODUCTS_API_TOKEN'),
        'timeout' => env('EXTERNAL_PRODUCTS_API_TIMEOUT', 30),
        'sync_interval' => env('EXTERNAL_PRODUCTS_SYNC_INTERVAL', 3600), // en segundos (1 hora por defecto)
    ],

];
