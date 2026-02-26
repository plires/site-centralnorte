import LayoutPublic from '@/layouts/public/public-layout';
import ContactoForm from './components/ContactoForm';
import UbicacionSection from './components/UbicacionSection';

const Contacto = () => {
    return (
        <>
            <ContactoForm />
            {/* El mapa se activa con el src del iframe de Google Maps.
                Ejemplo: mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!..." */}
            <UbicacionSection mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.621947661123!2d-58.53578722378895!3d-34.53780497297798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccd9e9e046829%3A0x3b869455f4907098!2sNORTE%20CENTRAL%20SRL!5e0!3m2!1ses!2sar!4v1772137924897!5m2!1ses!2sar" />
        </>
    );
};

Contacto.layout = (page) => <LayoutPublic children={page} />;

export default Contacto;
