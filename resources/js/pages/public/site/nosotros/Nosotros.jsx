import LayoutPublic from '@/layouts/public/public-layout';
import NosotrosHeader from './components/NosotrosHeader';
import NosotrosIntro from './components/NosotrosIntro';

const Nosotros = () => {
    return (
        <>
            <NosotrosHeader />
            <NosotrosIntro />
        </>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
