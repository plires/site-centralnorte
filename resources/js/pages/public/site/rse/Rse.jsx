import LayoutPublic from '@/layouts/public/public-layout';
import NewsletterSection from '@/pages/public/site/components/NewsletterSection';
import RseAcciones from './components/RseAcciones';
import RseHeader from './components/RseHeader';
import RseIntro from './components/RseIntro';

const Rse = () => {
    return (
        <>
            <RseHeader />
            <RseIntro />
            <RseAcciones />
            <NewsletterSection />
        </>
    );
};

Rse.layout = (page) => <LayoutPublic children={page} />;

export default Rse;
