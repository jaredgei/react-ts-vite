import styles from 'scss/Login.module.scss';

import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'context/Auth';
import { useError } from 'context/Error';

import Button from 'components/Button';

const Login = () => {
  const { login } = useAuth();
  const { setError } = useError();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <div className={styles.login}>
      <h1>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Email
          <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <Button text='Login' type='submit' />
      </form>
    </div>
  );
};

export default Login;
