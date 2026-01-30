import LayoutPublic from '@/layouts/public/public-layout';
import NosotrosHeader from './components/NosotrosHeader';
import NosotrosIntro from './components/NosotrosIntro';
import TeamCarousel from './components/TeamCarousel';

const Nosotros = () => {
    return (
        <>
            <NosotrosHeader />
            <NosotrosIntro />
            <TeamCarousel />
        </>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
