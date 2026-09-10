import styles from 'scss/Error.module.scss';

import { useError } from 'context/Error';

type Props = {
  error: Error | null;
};

const Error = ({ error }: Props) => {
  const { setError } = useError();

  return (
    <div className={`${styles.error} ${error ? styles.hasError : ''}`.trim()}>
      {error && (
        <>
          <div className={styles.errorMessage}>{error.message}</div>
          <button type='button' className={styles.closeError} aria-label='Close error' onClick={() => setError(null)}>
            &times;
          </button>
        </>
      )}
    </div>
  );
};

export default Error;
