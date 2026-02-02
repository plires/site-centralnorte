import LayoutPublic from '@/layouts/public/public-layout';
import LogoCarousel from '@/pages/public/site/components/LogoCarousel';
import NosotrosHeader from './components/NosotrosHeader';
import NosotrosIntro from './components/NosotrosIntro';
import NovedadesCarousel from './components/NovedadesCarousel';
import PartnersSection from './components/PartnersSection';
import SolucionesGrid from './components/SolucionesGrid';
import SolucionesSection from './components/SolucionesSection';
import TeamCarousel from './components/TeamCarousel';
import brandLogos from './data/brandLogos';

const Nosotros = ({ novedades }) => {
    return (
        <>
            <NosotrosHeader />
            <NosotrosIntro />
            <TeamCarousel />
            <SolucionesSection />
            <SolucionesGrid />
            <NovedadesCarousel novedades={novedades} />
            <PartnersSection />
            <LogoCarousel background="#e3e3e3" brandLogos={brandLogos} />
        </>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
