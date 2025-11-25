import Header from '@renderer/components/header';
import UrlHistory from './components/url-history';

const Home = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 left-0 z-50 bg-background/60 backdrop-blur-md">
        <Header />
      </div>

      <div className="relative z-0">
        <UrlHistory />
      </div>
    </div>
  );
};

export default Home;
