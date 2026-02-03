import LayoutPublic from '@/layouts/public/public-layout';
import ContactoForm from './components/ContactoForm';

const Contacto = () => {
    return (
        <>
            <ContactoForm />
        </>
    );
};

Contacto.layout = (page) => <LayoutPublic children={page} />;

export default Contacto;
