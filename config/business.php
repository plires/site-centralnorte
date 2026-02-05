<?php

return [
  /*
    |--------------------------------------------------------------------------
    | Tax Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the tax settings for your business operations.
    | The IVA (VAT) rate is configurable through environment variables.
    |
    */
  'tax' => [
    'iva_rate' => (float) env('IVA_RATE', 21) / 100, // Default 21% converted to decimal
    'apply_iva' => env('APPLY_IVA', true),
  ],

  /*
    |--------------------------------------------------------------------------
    | Budget Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for budget management
    |
    */
  'budget' => [
    'default_validity_days' => (int) env('BUDGET_VALIDITY_DAYS', 30),
    'warning_days_before_expiry' => (int) env('BUDGET_WARNING_DAYS', 3),
  ],

  /*
    |--------------------------------------------------------------------------
    | Product Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for product management
    |
    */
  'product' => [
    'placeholder_image' => env('PRODUCT_PLACEHOLDER_IMAGE', '/images/product-placeholder.jpg'),
  ],

  /*
    |--------------------------------------------------------------------------
    | Social Links
    |--------------------------------------------------------------------------
    |
    | Social media URLs displayed in the public site header.
    |
    */
  'social_links' => [
    'facebook' => env('SOCIAL_FACEBOOK', ''),
    'instagram' => env('SOCIAL_INSTAGRAM', ''),
    'tiktok' => env('SOCIAL_TIKTOK', ''),
    'twitter' => env('SOCIAL_TWITTER', ''),
    'linkedin' => env('SOCIAL_LINKEDIN', ''),
  ],

  /*
    |--------------------------------------------------------------------------
    | Admin Email
    |--------------------------------------------------------------------------
    |
    | Email address where contact form notifications will be sent.
    |
    */
  'admin_email' => env('ADMIN_EMAIL', env('MAIL_FROM_ADDRESS', 'andrea@centralnortesrl.com')),

];
