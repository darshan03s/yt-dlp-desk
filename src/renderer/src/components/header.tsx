import UserUrlInput from './user-url-input';

const Header = () => {
  return (
    <header className="p-3">
      <UserUrlInput showRefetch={false} />
    </header>
  );
};

export default Header;
