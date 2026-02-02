import backgroundLogos from '@/../images/home/background.webp';
import LayoutPublic from '@/layouts/public/public-layout';
import LogoCarousel from '@/pages/public/site/components/LogoCarousel';
import NewsletterSection from '@/pages/public/site/components/NewsletterSection';
import BenefitsSection from './components/BenefitsSection';
import FullfilmentSection from './components/FullfilmentSection';
import HeroSlider from './components/HeroSlider';
import ImageCarousel from './components/ImageCarousel';
import KitsSection from './components/KitsSection';
import MoveTuMarcaSection from './components/MoveTuMarcaSection';
import PhraseSection from './components/PhraseSection';
import brandLogos from './data/brandLogos';

const Home = ({ slides }) => {
    return (
        <>
            <HeroSlider slides={slides} />
            <PhraseSection line1="Te ofrecemos" line2="soluciones" variant="secondary" />
            <ImageCarousel />
            <PhraseSection line1="Marcas que" line2="confían" variant="primary" backgroundImage={backgroundLogos} />
            <LogoCarousel background="var(--primary-color)" brandLogos={brandLogos} />
            <FullfilmentSection />
            <KitsSection />
            <MoveTuMarcaSection />
            <PhraseSection line1="Movilizá" line2="tu impacto" variant="white" hashtags="#Merch. #KitsDeOnboarding. #RegalosEmpresariales." />
            <BenefitsSection />
            <NewsletterSection />
        </>
    );
};

Home.layout = (page) => <LayoutPublic children={page} />;

export default Home;
