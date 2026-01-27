import Footer from './components/Footer';
import Navbar from './components/Navbar';
import TopHeader from './components/TopHeader';

const LayoutPublic = ({ children }) => {
    return (
        <>
            <TopHeader />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
};

export default LayoutPublic;
