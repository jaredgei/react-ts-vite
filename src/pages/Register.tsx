import styles from '@/styles/Auth.module.css';

import { useActionState, useState } from 'react';
import { Link } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';
import OAuthButtons from '@/components/OAuthButtons';
import Turnstile from '@/components/Turnstile';

import { field } from '@/utilities/form';

const Register = () => {
  const { register } = useAuth();
  const { showError, clearError } = useError();
  // A challenge token works once, so a failed attempt renders a fresh challenge.
  const [attempts, setAttempts] = useState(0);

  const [values, submit, pending] = useActionState(
    async (_: { name: string; email: string }, form: FormData) => {
      const name = field(form, 'name');
      const email = field(form, 'email');
      clearError();
      try {
        await register(name, email, field(form, 'password'), field(form, 'turnstileToken'));
      } catch (error) {
        showError(error);
        setAttempts((count) => count + 1);
      }
      return { name, email };
    },
    { name: '', email: '' },
  );

  return (
    <div className={styles.auth}>
      <h1>Register</h1>
      <form className={styles.form} action={submit}>
        <label>
          Name
          <input type='text' name='name' autoComplete='name' defaultValue={values.name} maxLength={255} required />
        </label>
        <label>
          Email
          <input type='email' name='email' autoComplete='email' defaultValue={values.email} maxLength={255} required />
        </label>
        <label>
          Password
          <input type='password' name='password' autoComplete='new-password' minLength={8} maxLength={256} required />
        </label>
        <Turnstile key={attempts} name='turnstileToken' />
        <Button type='submit' pending={pending}>
          Register
        </Button>
      </form>
      <p className={styles.divider}>or continue with</p>
      <OAuthButtons />
      <p className={styles.footer}>
        Already have an account? <Link to='/login'>Log in</Link>
      </p>
    </div>
  );
};

export default Register;
