import LayoutPublic from '@/layouts/public/public-layout';
import NosotrosHeader from './components/NosotrosHeader';
import NosotrosIntro from './components/NosotrosIntro';
import NovedadesCarousel from './components/NovedadesCarousel';
import SolucionesGrid from './components/SolucionesGrid';
import SolucionesSection from './components/SolucionesSection';
import TeamCarousel from './components/TeamCarousel';

const Nosotros = ({ novedades }) => {
    return (
        <>
            <NosotrosHeader />
            <NosotrosIntro />
            <TeamCarousel />
            <SolucionesSection />
            <SolucionesGrid />
            <NovedadesCarousel novedades={novedades} />
        </>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
