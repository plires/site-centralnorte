import LayoutPublic from '@/layouts/public/public-layout';
import NewsletterSection from '@/pages/public/site/components/NewsletterSection';
import CopackingHeader from './components/CopackingHeader';

const Copacking = () => {
    return (
        <>
            <CopackingHeader />
            <NewsletterSection />
        </>
    );
};

Copacking.layout = (page) => <LayoutPublic children={page} />;

export default Copacking;
