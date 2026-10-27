import styles from '@/styles/Header.module.css';

import { Link, useNavigate } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';
import MenuButton from '@/components/MenuButton';

const Header = () => {
  const { user, loading, logout } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();

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
      {!loading && (
        <nav className={styles.actions}>
          {user ? (
            <MenuButton
              label='Account'
              variant='secondary'
              options={[
                { name: 'Settings', onSelect: () => void navigate('/settings') },
                ...(user.role === 'admin' ? [{ name: 'Admin', onSelect: () => void navigate('/admin') }] : []),
                {},
                { name: 'Log out', onSelect: () => void handleLogout() },
              ]}>
              {user.name}
            </MenuButton>
          ) : (
            <>
              <Link to='/login'>Log in</Link>
              <Button to='/register'>Sign up</Button>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
