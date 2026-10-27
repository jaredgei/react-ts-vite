import styles from '@/styles/VerifyEmailBanner.module.css';

import { useActionState } from 'react';

import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { post } from '@/utilities/api';

const VerifyEmailBanner = ({ email }: { email: string }) => {
  const { showError } = useError();
  const [sent, resend, pending] = useActionState(async (previous: boolean) => {
    try {
      await post('/api/users/resend-verification');
      return true;
    } catch (error) {
      showError(error);
      return previous;
    }
  }, false);

  return (
    <div className={styles.banner}>
      <p role='status' className={styles.message}>
        {sent ? 'We sent a new link to ' : 'Verify your email address. We sent a link to '}
        <strong>{email}</strong>.
      </p>
      <form action={resend}>
        <Button type='submit' variant='secondary' pending={pending}>
          Resend email
        </Button>
      </form>
    </div>
  );
};

export default VerifyEmailBanner;
