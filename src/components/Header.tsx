import styles from '@/styles/Header.module.css';

import { Link } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

const Header = () => {
  const { user, logout } = useAuth();
  const { showError } = useError();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showError(error);
    }
  };

  return (
    <header className={styles.header}>
      <Link to='/'>Logo</Link>
      {user && (
        <button type='button' className='link' onClick={() => void handleLogout()}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
