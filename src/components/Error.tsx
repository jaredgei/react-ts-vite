import 'scss/Error.scss';
import { useContext } from 'react';

import { ErrorContext } from 'context/Error';

type Props = {
  error: Error | null;
};

const Error = ({ error }: Props) => {
  const { setError } = useContext(ErrorContext);

  return (
    <div className={'error' + (error ? ' hasError' : '')}>
      {error && <div className='errorMessage'>{error.message}</div>}
      {error && (
        <div className='closeError' onClick={() => setError(null)}>
          &times;
        </div>
      )}
    </div>
  );
};

export default Error;
