import styles from '@/styles/StatusPage.module.css';

import Button from '@/components/Button';

import { home } from '@/utilities/icons';

const NotFound = () => (
  <div className={styles.statusPage}>
    <h1 className={styles.code}>404</h1>
    <p className={styles.title}>Page not found</p>
    <p className={styles.message}>{"The page you're looking for might have been removed, had its name changed, or is temporarily unavailable."}</p>
    <Button icon={home} to='/' className={styles.action}>
      Go Home
    </Button>
  </div>
);

export default NotFound;
