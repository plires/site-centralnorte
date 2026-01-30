import backgroundLogos from '@/../images/home/background.webp';
import LayoutPublic from '@/layouts/public/public-layout';
import FullfilmentSection from './components/FullfilmentSection';
import HeroSlider from './components/HeroSlider';
import ImageCarousel from './components/ImageCarousel';
import KitsSection from './components/KitsSection';
import LogoCarousel from './components/LogoCarousel';
import MoveTuMarcaSection from './components/MoveTuMarcaSection';
import PhraseSection from './components/PhraseSection';

const Home = ({ slides }) => {
    return (
        <>
            <HeroSlider slides={slides} />
            <PhraseSection line1="Te ofrecemos" line2="soluciones" variant="secondary" />
            <ImageCarousel />
            <PhraseSection line1="Marcas que" line2="confían" variant="primary" backgroundImage={backgroundLogos} />
            <LogoCarousel />
            <FullfilmentSection />
            <KitsSection />
            <MoveTuMarcaSection />
        </>
    );
};

Home.layout = (page) => <LayoutPublic children={page} />;

export default Home;
