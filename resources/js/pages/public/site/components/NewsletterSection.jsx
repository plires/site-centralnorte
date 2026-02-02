import { useForm, usePage } from '@inertiajs/react';
import styles from './NewsletterSection.module.css';

const NewsletterSection = () => {
    const { flash } = usePage().props;

    const { data, setData, post, processing, reset } = useForm({
        email: '',
        source: 'home',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.newsletter.subscribe'), {
            preserveScroll: true,
            onSuccess: () => reset('email'),
        });
    };

    return (
        <section className={styles.section}>
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <h2 className={styles.title}>
                            Recibí novedades <br />y <span>beneficios</span>
                        </h2>
                    </div>
                    <div className={`col-md-6 ${styles.contentForm}`}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="Tu email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                disabled={processing}
                            />
                            <button type="submit" className={styles.submitButton} disabled={processing}>
                                {processing ? 'Enviando...' : 'Enviar'}
                            </button>
                        </form>

                        {flash?.success && <p className={styles.success}>{flash.success}</p>}
                        {flash?.info && <p className={styles.info}>{flash.info}</p>}
                        {flash?.error && <p className={styles.error}>{flash.error}</p>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
