import styles from 'scss/Header.module.scss';

import { Link } from 'react-router-dom';

import { useAuth } from 'context/Auth';
import { useError } from 'context/Error';

const Header = () => {
  const { user, logout } = useAuth();
  const { setError } = useError();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <header className={styles.header}>
      <Link to='/'>Logo</Link>
      {user && (
        <button type='button' className='fakeLink' onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
