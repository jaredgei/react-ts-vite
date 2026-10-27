import styles from '@/styles/Auth.module.css';

import { useActionState } from 'react';
import { Link } from 'react-router';

import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { post } from '@/utilities/api';
import { field } from '@/utilities/form';

const ForgotPassword = () => {
  const { showError, clearError } = useError();

  const [state, submit, pending] = useActionState(
    async (_: { email: string; sent: boolean }, form: FormData) => {
      const email = field(form, 'email');
      clearError();
      try {
        await post('/api/users/forgot-password', { email });
        return { email, sent: true };
      } catch (error) {
        showError(error);
        return { email, sent: false };
      }
    },
    { email: '', sent: false },
  );

  return (
    <div className={styles.auth}>
      <h1>Forgot your password?</h1>
      <p role='status' className={styles.subtitle}>
        {state.sent
          ? `If an account exists for ${state.email}, we sent it a link to reset your password.`
          : "Enter your email and we'll send you a link to reset it."}
      </p>
      <form className={styles.form} action={submit}>
        <label>
          Email
          <input type='email' name='email' autoComplete='email' defaultValue={state.email} maxLength={255} required />
        </label>
        <Button type='submit' pending={pending}>
          Send reset link
        </Button>
      </form>
      <p className={styles.footer}>
        Remembered it? <Link to='/login'>Log in</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
