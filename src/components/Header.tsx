import styles from 'scss/Header.module.scss';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link to='/'>Logo</Link>
    </header>
  );
};

export default Header;
