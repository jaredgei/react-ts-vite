import styles from '@/styles/ErrorToast.module.css';

import { useEffect, useState } from 'react';

import { useError } from '@/context/Error';

import { usePresence } from '@/hooks/usePresence';

import Button from '@/components/Button';

import { close, error } from '@/utilities/icons';

const ErrorToast = () => {
  const { message, clearError } = useError();
  const { ref: toast, present } = usePresence<HTMLDivElement>(!!message);
  const [shown, setShown] = useState(message);

  if (message && message !== shown) setShown(message);

  useEffect(() => {
    toast.current?.togglePopover(!!message);
  }, [toast, message]);

  if (!present) return null;

  return (
    <div ref={toast} popover='manual' role='alert' className={styles.toast}>
      {error}
      <p className={styles.message}>{shown}</p>
      <Button variant='ghost' aria-label='Dismiss error' className={styles.dismiss} onClick={clearError}>
        {close}
      </Button>
    </div>
  );
};

export default ErrorToast;
