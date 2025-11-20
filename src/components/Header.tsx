import 'scss/Header.scss';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className='header'>
      <Link to='/' className='logo'>
        Logo
      </Link>
    </header>
  );
};

export default Header;
