import styles from '@/styles/Auth.module.css';

import { useActionState } from 'react';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { field } from '@/utilities/form';

const Login = () => {
  const { login } = useAuth();
  const { showError, clearError } = useError();

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
        <Button type='submit' disabled={pending}>
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
