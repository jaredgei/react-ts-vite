import styles from '@/styles/StatusPage.module.css';

import { isRouteErrorResponse, useRouteError } from 'react-router';

import Button from '@/components/Button';

import { toDisplayMessage } from '@/utilities/errors';
import { home } from '@/utilities/icons';

const RouteError = () => {
  const error = useRouteError();

  return (
    <main className={styles.statusPage}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.message}>{isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : toDisplayMessage(error)}</p>
      <Button icon={home} to='/' className={styles.action}>
        Go Home
      </Button>
    </main>
  );
};

export default RouteError;
