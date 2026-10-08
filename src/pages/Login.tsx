import styles from '@/styles/Login.module.css';

import { useActionState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { field } from '@/utilities/form';

const Login = () => {
  const { login } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [, submit, pending] = useActionState(async (_: null, form: FormData) => {
    try {
      await login(field(form, 'email'), field(form, 'password'));
      await navigate(from, { replace: true });
    } catch (error) {
      showError(error);
    }
    return null;
  }, null);

  return (
    <div className={styles.login}>
      <h1>Login</h1>
      <form className={styles.form} action={submit}>
        <label>
          Email
          <input type='email' name='email' required />
        </label>
        <label>
          Password
          <input type='password' name='password' required />
        </label>
        <Button text='Login' type='submit' disabled={pending} />
      </form>
    </div>
  );
};

export default Login;
