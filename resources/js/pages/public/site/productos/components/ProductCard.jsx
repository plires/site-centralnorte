import { Link } from '@inertiajs/react';
import { useState } from 'react';
import ColorCircle from './ColorCircle';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const { id, name, defaultImage, categories, colorVariants } = product;

    // Estado para la imagen actual y el índice del círculo activo
    const [currentImage, setCurrentImage] = useState(defaultImage);
    const [activeIndex, setActiveIndex] = useState(null);

    // Crear el título con la cantidad de categorías
    const categoriesText = categories.map((cat) => cat.name).join(' | ');

    // Handler para cambiar la imagen al hacer clic en un círculo de color
    const handleColorClick = (variant, index) => {
        console.log(variant);
        setCurrentImage(variant.image || defaultImage);
        setActiveIndex(index);
    };

    return (
        <Link href={`/products/${id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={currentImage} alt={name} className={styles.image} loading="lazy" />
            </div>

            <div className={styles.content}>
                {/* Círculos de colores */}
                {colorVariants && colorVariants.length > 0 && (
                    <div className={styles.colorsRow}>
                        {colorVariants.map((variant, index) => (
                            <ColorCircle
                                key={index}
                                primaryColor={variant.primaryColor}
                                secondaryColor={variant.secondaryColor}
                                title={variant.title}
                                stock={variant.stock}
                                isActive={activeIndex === index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleColorClick(variant, index);
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Nombre del producto */}
                <h3 className={styles.productName}>{name}</h3>

                {/* Categorías */}
                <p className={styles.categories} title={categoriesText}>
                    {categoriesText}
                </p>
            </div>
        </Link>
    );
};

export default ProductCard;
