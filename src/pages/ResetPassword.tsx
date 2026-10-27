import styles from '@/styles/Auth.module.css';

import { useActionState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { field } from '@/utilities/form';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { showError, clearError } = useError();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [, submit, pending] = useActionState(async (_: void, form: FormData) => {
    clearError();
    try {
      await resetPassword(searchParams.get('token') ?? '', field(form, 'password'));
      await navigate('/', { replace: true });
    } catch (error) {
      showError(error);
    }
  }, undefined);

  return (
    <div className={styles.auth}>
      <h1>Choose a new password</h1>
      <p className={styles.subtitle}>You'll be signed out everywhere else.</p>
      <form className={styles.form} action={submit}>
        <label>
          New password
          <input type='password' name='password' autoComplete='new-password' minLength={8} maxLength={256} required />
        </label>
        <Button type='submit' pending={pending}>
          Reset password
        </Button>
      </form>
      <p className={styles.footer}>
        Link expired? <Link to='/forgot-password'>Request a new one</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
