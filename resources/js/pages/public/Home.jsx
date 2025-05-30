import LayoutPublic from '@/layouts/public/public-layout';

const Home = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1 className="bebas display-4" data-aos="fade-up">
                        ¡Bienvenido a Central Norte!
                    </h1>
                    <p className="lead" data-aos="fade-up" data-aos-delay="200">
                        Esta es la página pública de prueba con Bootstrap y AOS.
                    </p>
                </div>
            </div>
        </div>
    );
};

Home.layout = (page) => <LayoutPublic children={page} />;

export default Home;
