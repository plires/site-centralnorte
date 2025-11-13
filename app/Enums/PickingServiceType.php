<?php

namespace App\Enums;

enum PickingServiceType: string
{
    case ASSEMBLY = 'assembly';
    case PALLETIZING = 'palletizing';
    case LABELING = 'labeling';
    case DOME_STICKING = 'dome_sticking';
    case ADDITIONAL_ASSEMBLY = 'additional_assembly';
    case QUALITY_CONTROL = 'quality_control';
    case SHAVINGS = 'shavings';
    case BAG = 'bag';
    case BUBBLE_WRAP = 'bubble_wrap';

    public function label(): string
    {
        return match($this) {
            self::ASSEMBLY => 'Armado',
            self::PALLETIZING => 'Palletizado',
            self::LABELING => 'Rotulado',
            self::DOME_STICKING => 'Pegado de Domes',
            self::ADDITIONAL_ASSEMBLY => 'Ensamble Adicional',
            self::QUALITY_CONTROL => 'Control de Calidad',
            self::SHAVINGS => 'Viruta',
            self::BAG => 'Bolsita',
            self::BUBBLE_WRAP => 'Pluribol',
        };
    }
}
