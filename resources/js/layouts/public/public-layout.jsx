import { QuoteCartProvider } from '@/contexts/QuoteCartContext';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import TopHeader from './components/TopHeader';

const LayoutPublic = ({ children }) => {
    return (
        <QuoteCartProvider>
            <TopHeader />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
        </QuoteCartProvider>
    );
};

export default LayoutPublic;
