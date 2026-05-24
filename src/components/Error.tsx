import 'scss/Error.scss';
import { useContext } from 'react';

import { ErrorContext } from 'context/Error';

type Props = {
  error: Error | null;
};

const Error = ({ error }: Props) => {
  const { setError } = useContext(ErrorContext);

  return (
    <div className={`error ${error ? 'hasError' : ''}`.trim()}>
      {error && <div className='errorMessage'>{error.message}</div>}
      {error && (
        <button type='button' className='closeError' aria-label='Close error' onClick={() => setError(null)}>
          &times;
        </button>
      )}
    </div>
  );
};

export default Error;
