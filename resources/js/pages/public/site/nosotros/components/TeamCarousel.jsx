import teamMembers from '../data/teamMembers';
import styles from './TeamCarousel.module.css';

const TeamCarousel = () => {
    // Duplicamos los miembros para crear el efecto de loop infinito
    const duplicatedMembers = [...teamMembers, ...teamMembers];

    return (
        <section className={styles.section}>
            <div className={styles.track}>
                {duplicatedMembers.map((member, index) => (
                    <div key={index} className={styles.slide}>
                        <div className={styles.imageWrapper}>
                            <img src={member.image} alt={member.name} className={styles.image} />
                        </div>
                        <h3 className={styles.name}>{member.name}</h3>
                        <p className={styles.role}>{member.role}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TeamCarousel;
