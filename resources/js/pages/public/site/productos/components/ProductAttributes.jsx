import styles from './ProductAttributes.module.css';

const ProductAttributes = ({ attributes }) => {
    const attributeEntries = Object.entries(attributes);

    if (attributeEntries.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <tbody>
                    {attributeEntries.map(([name, values]) => (
                        <tr key={name} className={styles.row}>
                            <th className={styles.attributeName}>{name}</th>
                            <td className={styles.attributeValue}>{values.join(', ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductAttributes;
