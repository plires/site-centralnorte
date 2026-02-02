import LayoutPublic from '@/layouts/public/public-layout';
import NewsletterSection from '@/pages/public/site/components/NewsletterSection';
import RseHeader from './components/RseHeader';

const Rse = () => {
    return (
        <>
            <RseHeader />
            <NewsletterSection />
        </>
    );
};

Rse.layout = (page) => <LayoutPublic children={page} />;

export default Rse;
