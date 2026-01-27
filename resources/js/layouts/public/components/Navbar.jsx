import logoSmallSrc from '@/../images/header/logo-site-header-small.svg';
import logoSrc from '@/../images/header/logo-site-header.svg';
import { useEffect, useState } from 'react';
import { HiOutlineShoppingCart } from 'react-icons/hi2';
import styles from './Navbar.module.css';

const navItems = [
    { label: 'Merchandising', href: '#' },
    { label: 'Co-packing', href: '#' },
    { label: 'Empresa', href: '#' },
    { label: 'RSE', href: '#' },
    { label: 'Contacto', href: '#' },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 992) {
                setMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navbarClass = `${styles.navbar} ${scrolled ? styles.scrolled : ''} ${mobileOpen ? styles.mobileOpen : ''}`;

    return (
        <nav className={navbarClass}>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className={styles.navbarInner}>
                            {/* Logo */}
                            <a href="/" className={styles.logo}>
                                <img src={scrolled || mobileOpen ? logoSmallSrc : logoSrc} alt="Central Norte" />
                            </a>

                            {/* Nav links (desktop) */}
                            <ul className={styles.navList}>
                                {navItems.map(({ label, href }) => (
                                    <li key={label}>
                                        <a href={href} className={styles.navLink}>
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            {/* Right actions (desktop) */}
                            <div className={`${styles.actions} ${styles.desktopActions}`}>
                                <a href="#" className={styles.cartLink}>
                                    <HiOutlineShoppingCart className={styles.cartIcon} />
                                    <span>(0)</span>
                                </a>
                                <a href="#" className={styles.ctaButton}>
                                    Cotizá ahora
                                </a>
                            </div>

                            {/* Hamburger (mobile) */}
                            <button
                                className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label="Menú"
                                aria-expanded={mobileOpen}
                            >
                                <span />
                                <span />
                                <span />
                            </button>
                        </div>

                        {/* Mobile menu */}
                        <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
                            {navItems.map(({ label, href }) => (
                                <a key={label} href={href} className={styles.navLink} onClick={() => setMobileOpen(false)}>
                                    {label}
                                </a>
                            ))}
                            <div className={styles.mobileActions}>
                                <a href="#" className={styles.cartLink} onClick={() => setMobileOpen(false)}>
                                    <HiOutlineShoppingCart className={styles.cartIcon} />
                                    <span>(0)</span>
                                </a>
                                <a href="#" className={styles.ctaButton} onClick={() => setMobileOpen(false)}>
                                    Cotizá ahora
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
