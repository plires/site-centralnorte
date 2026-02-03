import LayoutPublic from '@/layouts/public/public-layout';

const Contacto = () => {
    return (
        <>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse vero reiciendis veritatis assumenda incidunt nemo magni, ipsam adipisci
                fugit perspiciatis omnis quas possimus non ratione libero, quia laudantium. Rem, nisi?
            </p>
        </>
    );
};

Contacto.layout = (page) => <LayoutPublic children={page} />;

export default Contacto;
