<?php

namespace App\Enums;

enum CategoryOrigin: string
{
  case ZECAT = 'Zecat';
  case LOCAL = 'local';

  /**
   * Obtener el label legible para humanos
   */
  public function label(): string
  {
    return match ($this) {
      self::ZECAT => 'API Externa (Zecat)',
      self::LOCAL => 'Categoría Local',
    };
  }

  /**
   * Obtener el color para badges en UI
   */
  public function color(): string
  {
    return match ($this) {
      self::ZECAT => 'blue',
      self::LOCAL => 'green',
    };
  }

  /**
   * Verificar si es de origen externo
   */
  public function isExternal(): bool
  {
    return $this === self::ZECAT;
  }

  /**
   * Obtener todos los valores como array para selects
   */
  public static function toArray(): array
  {
    return array_map(fn($case) => $case->value, self::cases());
  }

  /**
   * Obtener opciones para select con label
   */
  public static function options(): array
  {
    return array_map(
      fn($case) => ['value' => $case->value, 'label' => $case->label()],
      self::cases()
    );
  }
}
