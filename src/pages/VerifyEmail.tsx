import styles from '@/styles/StatusPage.module.css';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useAuth } from '@/context/Auth';

import Button from '@/components/Button';
import Spinner from '@/components/Spinner';

import { toDisplayMessage } from '@/utilities/errors';
import { home } from '@/utilities/icons';

const INVALID_LINK = 'This link is invalid or has expired';

type Result = { verified: boolean; message: string };

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const [result, setResult] = useState<Result | null>(token ? null : { verified: false, message: INVALID_LINK });
  // A token works once, so it is sent once, even when an effect runs twice.
  const sent = useRef<string>(undefined);

  useEffect(() => {
    if (!token || sent.current === token) return;
    sent.current = token;
    const verify = async () => {
      try {
        await verifyEmail(token);
        setResult({ verified: true, message: 'Thanks for confirming your email address.' });
      } catch (error) {
        setResult({ verified: false, message: toDisplayMessage(error) });
      }
    };
    void verify();
  }, [token, verifyEmail]);

  if (!result) return <Spinner label='Verifying your email' />;

  return (
    <div className={styles.statusPage}>
      <h1 className={styles.title}>{result.verified ? 'Email verified' : 'Verification failed'}</h1>
      <p className={styles.message}>{result.message}</p>
      <Button icon={home} to='/' className={styles.action}>
        {result.verified ? 'Continue' : 'Go Home'}
      </Button>
    </div>
  );
};

export default VerifyEmail;
