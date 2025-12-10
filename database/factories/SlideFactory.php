<?php

namespace Database\Factories;

use App\Models\Slide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Slide>
 */
class SlideFactory extends Factory
{
    protected $model = Slide::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generar URLs de placeholder con dimensiones específicas
        $desktopBgColor = ltrim($this->faker->hexColor(), '#');
        $mobileBgColor = ltrim($this->faker->hexColor(), '#');
        $text = urlencode($this->faker->words(2, true));

        return [
            'title' => $this->faker->sentence(4),
            'image_desktop' => "https://placehold.co/1920x1080/{$desktopBgColor}/FFFFFF?text={$text}",
            'image_mobile' => "https://placehold.co/580x630/{$mobileBgColor}/FFFFFF?text={$text}",
            'link' => $this->faker->optional(0.7)->url(),
            'is_active' => $this->faker->boolean(80), // 80% activos
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }

    /**
     * Estado: Slide activo
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Estado: Slide inactivo
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Estado: Con link
     */
    public function withLink(): static
    {
        return $this->state(fn (array $attributes) => [
            'link' => $this->faker->url(),
        ]);
    }

    /**
     * Estado: Sin link
     */
    public function withoutLink(): static
    {
        return $this->state(fn (array $attributes) => [
            'link' => null,
        ]);
    }
}
