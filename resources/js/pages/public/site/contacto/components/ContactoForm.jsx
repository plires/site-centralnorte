import moveTuMarcaImg from '@/../images/contacto/move-tu-marca.webp';
import ondaSuperiorImg from '@/../images/contacto/onda-superior.webp';
import ondaTurquesaImg from '@/../images/contacto/onda-turquesa.webp';
import { Button } from '@/pages/public/site/components';
import { useForm, usePage } from '@inertiajs/react';
import styles from './ContactoForm.module.css';

const ContactoForm = () => {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        last_name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.contacto.send'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className={styles.section}>
            {/* Top section with title */}
            <div className={styles.topSection}>
                <div className="container">
                    <h1 className={styles.title}>Contacto</h1>
                </div>
                <img src={ondaTurquesaImg} alt="" className={styles.waveDecoration} aria-hidden="true" />
            </div>

            {/* Bottom section with form */}
            <div className={styles.bottomSection}>
                <img src={ondaSuperiorImg} alt="" className={styles.waveTop} aria-hidden="true" />
                <img src={moveTuMarcaImg} alt="" className={styles.moveTuMarca} aria-hidden="true" />

                <div className="container">
                    <div className={styles.formWrapper}>
                        <h2 className={styles.formTitle}>¿Tenés dudas?</h2>
                        <p className={styles.formDescription}>
                            Es tan simple como hacer clic y te respondemos a la brevedad con todas nuestras soluciones.
                        </p>

                        {flash?.success && <div className={styles.successMessage}>{flash.success}</div>}
                        {flash?.error && <div className={styles.errorMessage}>{flash.error}</div>}

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.row}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Nombre *"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Apellido"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        disabled={processing}
                                    />
                                    {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Empresa"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        disabled={processing}
                                    />
                                    {errors.company && <span className={styles.errorText}>{errors.company}</span>}
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder="Email *"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                    />
                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        placeholder="Teléfono"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        disabled={processing}
                                    />
                                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                </div>
                            </div>

                            <div>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Mensaje *"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                            </div>

                            <div className={styles.submitWrapper}>
                                <Button type="submit" variant="outline-white" disabled={processing}>
                                    {processing ? 'Enviando...' : 'Enviar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactoForm;
