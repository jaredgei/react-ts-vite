import styles from 'scss/NotFound.module.scss';

import Button from 'components/Button';

import { home } from 'utilities/icons';

const NotFound = () => (
  <div className={styles.notFound}>
    <h1>404</h1>
    <div className={styles.title}>Page not found</div>
    <div className={styles.description}>
      {"The page you're looking for might have been removed, had its name changed, or is temporarily unavailable."}
    </div>
    <Button icon={home} text='Go Home' url='/' className={styles.action} />
  </div>
);

export default NotFound;
