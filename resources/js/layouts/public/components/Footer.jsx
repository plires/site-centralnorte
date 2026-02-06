import Logo from '@/../images/footer/logo-site-footer.svg';
import { Link, usePage } from '@inertiajs/react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter } from 'react-icons/fa6';

import styles from './Footer.module.css';

const navItems = [
    { label: 'Merchandising', href: '/products' },
    { label: 'Co-packing', href: '/copacking' },
    { label: 'Empresa', href: '/nosotros' },
    { label: 'RSE', href: '/rse' },
    { label: 'Contacto', href: '/contacto' },
];

const socialNetworks = [
    { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { key: 'twitter', icon: FaXTwitter, label: 'X' },
    { key: 'linkedin', icon: FaLinkedinIn, label: 'LinkedIn' },
];

const NavLink = ({ href, className, children }) => {
    if (href.startsWith('http')) {
        return (
            <a href={href} className={className} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    }

    if (href.startsWith('#')) {
        return (
            <a href={href} className={className}>
                {children}
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
};

const Footer = () => {
    const { socialLinks = {} } = usePage().props;

    return (
        <footer className={styles.footer}>
            <div className="container">
                {/* Fila superior: logo + navegacion */}
                <div className="row">
                    <div className="col">
                        <div className={styles.topRow}>
                            <Link href="/" className={styles.logo}>
                                <img src={Logo} alt="Central Norte" />
                            </Link>
                            <nav>
                                <ul className={styles.navList}>
                                    {navItems.map(({ label, href }) => (
                                        <li key={label}>
                                            <NavLink href={href} className={styles.navLink}>
                                                {label}
                                            </NavLink>
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
