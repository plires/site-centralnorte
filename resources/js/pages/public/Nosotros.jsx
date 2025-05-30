import LayoutPublic from '@/layouts/public/public-layout';

const Nosotros = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1 className="bebas display-4" data-aos="fade-up">
                        Nosotros
                    </h1>
                    <p className="lead" data-aos="fade-up" data-aos-delay="200">
                        Page de nosotros. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate alias iusto placeat ipsa, accusantium ab
                        natus id. Facilis, voluptatibus fugiat sed possimus ut, deserunt iste non nobis debitis suscipit amet.
                    </p>
                </div>
            </div>
        </div>
    );
};

Nosotros.layout = (page) => <LayoutPublic children={page} />;

export default Nosotros;
