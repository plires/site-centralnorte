import LayoutPublic from '@/layouts/public/public-layout';
import NewsletterSection from '@/pages/public/site/components/NewsletterSection';
import RseHeader from './components/RseHeader';
import RseIntro from './components/RseIntro';

const Rse = () => {
    return (
        <>
            <RseHeader />
            <RseIntro />
            <NewsletterSection />
        </>
    );
};

Rse.layout = (page) => <LayoutPublic children={page} />;

export default Rse;
