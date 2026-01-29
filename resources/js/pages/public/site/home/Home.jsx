import LayoutPublic from '@/layouts/public/public-layout';
import backgroundLogos from '@/../images/home/background.webp';
import FullfilmentSection from './components/FullfilmentSection';
import HeroSlider from './components/HeroSlider';
import ImageCarousel from './components/ImageCarousel';
import LogoCarousel from './components/LogoCarousel';
import PhraseSection from './components/PhraseSection';

const Home = ({ slides }) => {
    return (
        <>
            <HeroSlider slides={slides} />
            <PhraseSection line1="Te ofrecemos" line2="soluciones" variant="secondary" />
            <ImageCarousel />
            <PhraseSection line1="Marcas que" line2="confían" variant="primary" backgroundImage={backgroundLogos} />
            <LogoCarousel />
            <FullfilmentSection />
            <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Atque necessitatibus rem commodi dolor corrupti, sapiente aut doloremque
                quam nemo cumque modi! Vitae modi deserunt facere, distinctio sunt debitis corporis. Rerum id quasi sunt ullam aperiam sit itaque
                ipsam facilis quod voluptas. Expedita earum odit maiores quas aliquam voluptate quam atque veniam culpa vel natus nulla dolorum
                sapiente fuga similique soluta, hic rem reprehenderit ipsam numquam eaque laboriosam esse quibusdam. Accusamus doloremque modi facere
                reprehenderit voluptates eveniet et tempora aperiam! Et minima voluptatum mollitia sit totam qui expedita? Laudantium labore suscipit
                quas soluta quis cum, rem qui fugiat eum rerum ab alias tempora nihil totam quod exercitationem repellat assumenda facere sapiente
                beatae libero animi molestiae explicabo. Sequi libero incidunt, amet aliquam quibusdam soluta eaque asperiores commodi aperiam at
                numquam dolor recusandae necessitatibus dolorem nostrum excepturi magnam fuga quod eum ipsa esse? Quod voluptates, modi ab provident
                necessitatibus repudiandae aliquam, pariatur atque sint, quibusdam deleniti doloribus mollitia dolores porro magni harum nesciunt
                repellat praesentium maxime dolore! Officiis, inventore error. Quisquam odio natus molestiae nihil ea harum esse ad. Ea, a laboriosam!
                Tempore explicabo quis eum rem praesentium non odit sequi, perferendis, assumenda commodi deleniti labore. Accusamus eaque ducimus
                veritatis consectetur asperiores ipsa quas quae ipsam ad nostrum dolores ab quo, optio aliquid excepturi vitae officiis accusantium
                tempora voluptates, mollitia delectus! Atque dicta ab cupiditate iste eaque vero magnam, animi molestiae fuga inventore qui dolorem
                similique quod voluptatum? Vitae fugit veritatis accusamus, modi laboriosam deserunt accusantium officia, quae itaque nesciunt dolorem
                ullam tempora earum perferendis quos! Similique consequatur maxime dolor autem doloremque nisi totam quibusdam laudantium, repellat
                natus nam quos vel voluptates ipsam in sequi error voluptas. Optio possimus atque quis, omnis saepe eaque vitae nobis adipisci soluta!
                Nostrum repellat quasi sit. Esse suscipit quis ut dolorum modi blanditiis, pariatur exercitationem sequi laudantium vitae in odit
                voluptates libero. Nobis voluptatum corporis impedit sint earum suscipit recusandae esse tempora necessitatibus quidem! Tempora aut,
                atque voluptates eaque laudantium dignissimos, hic earum aliquid ipsa quas numquam porro quae a et. Culpa unde quia ex. Amet, corporis
                itaque? Id quo eveniet dolores expedita placeat adipisci maiores a consequatur reprehenderit facilis consectetur quos provident,
                numquam quis voluptate voluptatum aspernatur dolore sequi aliquid, magni minus! Eligendi blanditiis atque error eos distinctio culpa
                ex aut dignissimos, aliquam eius quisquam autem eum dolorem recusandae nobis suscipit pariatur dolore facere perspiciatis veritatis
                consectetur odio quaerat. Praesentium temporibus nam qui, a consectetur ab perferendis dolorem laudantium, maxime mollitia repellendus
                perspiciatis nesciunt sint debitis ducimus magnam, esse quos sed explicabo ut! Voluptatem officiis nesciunt illo vero mollitia, cumque
                molestias magni quis excepturi labore, suscipit veritatis alias eveniet soluta quam? Ratione deserunt similique quas culpa facere
                nostrum. Itaque ipsum maxime nisi quam aperiam obcaecati repellat tempora ducimus ipsam tempore! Quidem illum doloremque deleniti,
                consequuntur corrupti facilis nisi, dolore qui minima, odit numquam tenetur nostrum repellat officia delectus. Eum voluptates quaerat
                voluptas praesentium provident cum iusto officia vel velit, esse non! Voluptatum exercitationem quod animi aliquam, totam ad ipsam
                nemo culpa, asperiores harum expedita eveniet necessitatibus dolore illum suscipit voluptatibus laboriosam est. Ullam nulla culpa ad
                dolores, fugiat, obcaecati iste sunt tempore deserunt blanditiis ut? Eos aspernatur repudiandae at eum blanditiis quas, repellat
                tempora earum accusamus amet reprehenderit iste fugit minus temporibus, quos quisquam. Tempore ratione aut iste quos temporibus maxime
                harum hic, optio animi aliquam eaque rerum nesciunt ea expedita perspiciatis beatae aliquid voluptatibus praesentium. At eveniet saepe
                voluptatibus. Nulla ipsum libero illum mollitia! Illum, eos? Ea, porro in recusandae ex provident vitae non, laborum accusamus soluta
                natus voluptas labore sequi error sit repellendus blanditiis architecto maiores suscipit? Autem numquam impedit, non odit esse
                voluptates.
            </p>
        </>
    );
};

Home.layout = (page) => <LayoutPublic children={page} />;

export default Home;
