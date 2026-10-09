import styles from '@/styles/Auth.module.css';

import { useActionState } from 'react';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { field } from '@/utilities/form';

const Register = () => {
  const { register } = useAuth();
  const { showError, clearError } = useError();

  const [values, submit, pending] = useActionState(
    async (_: { name: string; email: string }, form: FormData) => {
      const name = field(form, 'name');
      const email = field(form, 'email');
      clearError();
      try {
        await register(name, email, field(form, 'password'));
      } catch (error) {
        showError(error);
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
        <Button type='submit' disabled={pending}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default Register;
