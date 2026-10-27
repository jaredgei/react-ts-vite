import styles from '@/styles/Auth.module.css';

import { useActionState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';
import OAuthButtons from '@/components/OAuthButtons';

import { field } from '@/utilities/form';

const oauthErrors = new Map([
  ['oauth_failed', "Couldn't sign you in with that provider. Please try again."],
  ['oauth_unavailable', "That sign-in option isn't available right now."],
  ['oauth_account_exists', 'An account with this email already exists. Log in with your email and password instead.'],
  ['oauth_email_required', 'We need your email address to sign you in. Allow email access and try again.'],
  ['oauth_disposable_email', 'Please sign up with a permanent email address.'],
]);

const Login = () => {
  const { login } = useAuth();
  const { showError, clearError } = useError();
  const [searchParams] = useSearchParams();
  const oauthError = oauthErrors.get(searchParams.get('error') ?? '');

  useEffect(() => {
    if (oauthError) showError(oauthError);
  }, [oauthError, showError]);

  const [values, submit, pending] = useActionState(
    async (_: { email: string }, form: FormData) => {
      const email = field(form, 'email');
      clearError();
      try {
        await login(email, field(form, 'password'));
      } catch (error) {
        showError(error);
      }
      return { email };
    },
    { email: '' },
  );

  return (
    <div className={styles.auth}>
      <h1>Login</h1>
      <form className={styles.form} action={submit}>
        <label>
          Email
          <input type='email' name='email' autoComplete='email' defaultValue={values.email} required />
        </label>
        <label>
          Password
          <input type='password' name='password' autoComplete='current-password' required />
        </label>
        <Link to='/forgot-password' className={styles.hint}>
          Forgot password?
        </Link>
        <Button type='submit' pending={pending}>
          Login
        </Button>
      </form>
      <p className={styles.divider}>or continue with</p>
      <OAuthButtons />
      <p className={styles.footer}>
        Don't have an account? <Link to='/register'>Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
