import styles from 'scss/Register.module.scss';

import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'context/Auth';
import { useError } from 'context/Error';

import Button from 'components/Button';

const Register = () => {
  const { register } = useAuth();
  const { setError } = useError();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <div className={styles.register}>
      <h1>Register</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Name
          <input type='text' value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input type='email' value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <Button text='Register' type='submit' />
      </form>
    </div>
  );
};

export default Register;
