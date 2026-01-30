import LayoutPublic from '@/layouts/public/public-layout';
import NosotrosHeader from './components/NosotrosHeader';

const Nosotros = () => {
    return (
        <>
            <NosotrosHeader />
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus quas, blanditiis magni id pariatur sit! Ab, itaque numquam quam
            incidunt consequuntur sit nesciunt odio beatae, rerum laboriosam sunt ea mollitia?
        </>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
