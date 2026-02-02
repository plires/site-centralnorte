import LayoutPublic from '@/layouts/public/public-layout';
import NosotrosHeader from './components/NosotrosHeader';
import NosotrosIntro from './components/NosotrosIntro';
import SolucionesGrid from './components/SolucionesGrid';
import SolucionesSection from './components/SolucionesSection';
import TeamCarousel from './components/TeamCarousel';

const Nosotros = () => {
    return (
        <>
            <NosotrosHeader />
            <NosotrosIntro />
            <TeamCarousel />
            <SolucionesSection />
            <SolucionesGrid />
        </>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
