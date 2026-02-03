import LayoutPublic from '@/layouts/public/public-layout';
import NewsletterSection from '@/pages/public/site/components/NewsletterSection';
import CopackingHeader from './components/CopackingHeader';
import CopackingSoluciones from './components/CopackingSoluciones';

const Copacking = () => {
    return (
        <>
            <CopackingHeader />
            <CopackingSoluciones />
            <NewsletterSection />
        </>
    );
};

Copacking.layout = (page) => <LayoutPublic children={page} />;

export default Copacking;
