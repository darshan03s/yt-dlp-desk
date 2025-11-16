import Header from '@renderer/components/header';

const Home = () => {
  return (
    <div className="h-full overflow-y-scroll">
      <div className="sticky left-0 top-0">
        <Header />
      </div>
    </div>
  );
};

export default Home;
