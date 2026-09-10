import styles from 'scss/ErrorBoundary.module.scss';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import Button from 'components/Button';

import { home } from 'utilities/icons';

const RouteError = () => {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className={styles.errorBoundary}>
      <div className={styles.title}>Something went wrong</div>
      <div className={styles.message}>{message}</div>
      <Button icon={home} text='Go Home' url='/' className={styles.action} />
    </div>
  );
};

export default RouteError;
