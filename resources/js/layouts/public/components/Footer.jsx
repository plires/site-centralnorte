import Logo from '@/../images/footer/logo-site-footer.svg';
import { usePage } from '@inertiajs/react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter } from 'react-icons/fa6';

import styles from './Footer.module.css';

const navItems = [
    { label: 'Merchandising', href: '#' },
    { label: 'Co-packing', href: '#' },
    { label: 'Empresa', href: '#' },
    { label: 'RSE', href: '#' },
    { label: 'Contacto', href: '#' },
];

const socialNetworks = [
    { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { key: 'twitter', icon: FaXTwitter, label: 'X' },
    { key: 'linkedin', icon: FaLinkedinIn, label: 'LinkedIn' },
];

const Footer = () => {
    const { socialLinks = {} } = usePage().props;

    return (
        <footer className={styles.footer}>
            <div className="container">
                {/* Fila superior: logo + navegacion */}
                <div className="row">
                    <div className="col">
                        <div className={styles.topRow}>
                            <a href="/" className={styles.logo}>
                                <img src={Logo} alt="Central Norte" />
                            </a>
                            <nav>
                                <ul className={styles.navList}>
                                    {navItems.map(({ label, href }) => (
                                        <li key={label}>
                                            <a href={href} className={styles.navLink}>
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Fila inferior: redes sociales */}
                <div className="row">
                    <div className="col">
                        <div className={styles.bottomRow}>
                            <ul className={styles.socialList}>
                                {socialNetworks.map(({ key, icon: Icon, label }) => {
                                    const url = socialLinks[key];
                                    if (!url) return null;

                                    return (
                                        <li key={key}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label={label}>
                                                <Icon />
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
