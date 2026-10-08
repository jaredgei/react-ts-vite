import styles from '@/styles/Register.module.css';

import { useActionState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';

import { field } from '@/utilities/form';

const Register = () => {
  const { register } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();

  const [, submit, pending] = useActionState(async (_: null, form: FormData) => {
    try {
      await register(field(form, 'name'), field(form, 'email'), field(form, 'password'));
      await navigate('/', { replace: true });
    } catch (error) {
      showError(error);
    }
    return null;
  }, null);

  return (
    <div className={styles.register}>
      <h1>Register</h1>
      <form className={styles.form} action={submit}>
        <label>
          Name
          <input type='text' name='name' required />
        </label>
        <label>
          Email
          <input type='email' name='email' required />
        </label>
        <label>
          Password
          <input type='password' name='password' required />
        </label>
        <Button text='Register' type='submit' disabled={pending} />
      </form>
    </div>
  );
};

export default Register;
