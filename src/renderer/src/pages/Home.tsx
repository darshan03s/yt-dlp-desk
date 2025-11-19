import Header from '@renderer/components/header';
import UrlHistory from './components/UrlHistory';

const Home = () => {
  return (
    <div className="h-full overflow-y-scroll">
      <div className="sticky left-0 top-0">
        <Header />
      </div>

      <div className="url-history">
        <UrlHistory />
      </div>
    </div>
  );
};

export default Home;
