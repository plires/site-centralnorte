import logoSmallSrc from '@/../images/header/logo-site-header-small.svg';
import logoSrc from '@/../images/header/logo-site-header.svg';
import { Button } from '@/pages/public/site/components';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { HiOutlineShoppingCart } from 'react-icons/hi2';
import styles from './Navbar.module.css';

const navItems = [
    { label: 'Merchandising', href: '/' },
    { label: 'Co-packing', href: '/' },
    { label: 'Empresa', href: '/nosotros' },
    { label: 'RSE', href: '/rse' },
    { label: 'Contacto', href: '/' },
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
                            <Link onClick={() => setMobileOpen(false)} href="/" className={styles.logo}>
                                <img src={scrolled || mobileOpen ? logoSmallSrc : logoSrc} alt="Central Norte" />
                            </Link>

                            {/* Nav links (desktop) */}
                            <ul className={styles.navList}>
                                {navItems.map(({ label, href }) => (
                                    <li key={label}>
                                        {href.startsWith('http') ? (
                                            <a href={href} className={styles.navLink} target="_blank" rel="noopener noreferrer">
                                                {label}
                                            </a>
                                        ) : href.startsWith('#') ? (
                                            <a href={href} className={styles.navLink}>
                                                {label}
                                            </a>
                                        ) : (
                                            <Link href={href} className={styles.navLink}>
                                                {label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* Right actions (desktop) */}
                            <div className={`${styles.actions} ${styles.desktopActions}`}>
                                <a href="#" className={styles.cartLink}>
                                    <HiOutlineShoppingCart className={styles.cartIcon} />
                                    <span>(0)</span>
                                </a>
                                <Button href="#" variant="white" size="sm">
                                    Cotizá ahora
                                </Button>
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
                            {navItems.map(({ label, href }) =>
                                href.startsWith('http') ? (
                                    <a
                                        key={label}
                                        href={href}
                                        className={styles.navLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {label}
                                    </a>
                                ) : href.startsWith('#') ? (
                                    <a key={label} href={href} className={styles.navLink} onClick={() => setMobileOpen(false)}>
                                        {label}
                                    </a>
                                ) : (
                                    <Link key={label} href={href} className={styles.navLink} onClick={() => setMobileOpen(false)}>
                                        {label}
                                    </Link>
                                ),
                            )}
                            <div className={styles.mobileActions}>
                                <a href="#" className={styles.cartLink} onClick={() => setMobileOpen(false)}>
                                    <HiOutlineShoppingCart className={styles.cartIcon} />
                                    <span>(0)</span>
                                </a>
                                <Button href="#" variant="white" size="sm" onClick={() => setMobileOpen(false)}>
                                    Cotizá ahora
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
