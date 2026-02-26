import { usePage } from '@inertiajs/react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa6';
import styles from './TopHeader.module.css';

const socialNetworks = [
    { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { key: 'linkedin', icon: FaLinkedinIn, label: 'LinkedIn' },
];

const TopHeader = () => {
    const { socialLinks = {} } = usePage().props;

    return (
        <div className={styles.topHeader}>
            <div className="container">
                <div className="row">
                    <div className="col d-flex justify-content-end justify-content-sm-end justify-content-center">
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
    );
};

export default TopHeader;
