import modal from '@/styles/Modal.module.css';
import styles from '@/styles/UserSettings.module.css';

import { useActionState, useState } from 'react';

import { useAuth, type User } from '@/context/Auth';
import { useError } from '@/context/Error';

import Button from '@/components/Button';
import Modal from '@/components/Modal';

import { ApiError, del, patch, post } from '@/utilities/api';
import { field } from '@/utilities/form';

const Profile = ({ user }: { user: User }) => {
  const { setUser } = useAuth();
  const { showError } = useError();
  const [saved, setSaved] = useState(false);

  const [, save, pending] = useActionState(async (_: void, form: FormData) => {
    try {
      setUser((await patch('/api/users/me', { name: field(form, 'name') })).user);
      setSaved(true);
    } catch (error) {
      showError(error);
    }
  }, undefined);

  return (
    <section className={styles.section}>
      <h2>Profile</h2>
      <form action={save} className={styles.form}>
        <label>
          Name
          <input type='text' name='name' defaultValue={user.name} maxLength={255} required autoComplete='name' onInput={() => setSaved(false)} />
        </label>
        <label>
          Email
          <input type='email' value={user.email} readOnly />
        </label>
        <div className={styles.actions}>
          {saved && <span role='status'>Saved</span>}
          <Button type='submit' pending={pending}>
            Save
          </Button>
        </div>
      </form>
    </section>
  );
};

const Password = ({ user }: { user: User }) => {
  const { showError } = useError();
  const [sent, sendLink, pending] = useActionState(async (sent: boolean) => {
    try {
      await post('/api/users/forgot-password', { email: user.email });
      return true;
    } catch (error) {
      showError(error);
      return sent;
    }
  }, false);

  return (
    <section className={styles.section}>
      <h2>Password</h2>
      <p className={styles.description}>Set a new password through a link sent to your email. Using it signs you out on every device.</p>
      <form action={sendLink} className={styles.actions}>
        {sent && <span role='status'>Sent to {user.email}.</span>}
        <Button type='submit' variant='secondary' pending={pending}>
          {sent ? 'Send again' : 'Email me a reset link'}
        </Button>
      </form>
    </section>
  );
};

const DeleteAccount = ({ user }: { user: User }) => {
  const { setUser, logout } = useAuth();
  const { showError } = useError();
  const [confirming, setConfirming] = useState(false);

  // The server only deletes from a recent sign-in, so a stale session signs out to sign in again.
  const deleteAccount = async () => {
    try {
      await del('/api/users/me');
    } catch (failure) {
      if (!(failure instanceof ApiError && failure.status === 403)) throw failure;
      showError(failure);
      await logout();
    }
  };

  return (
    <section className={styles.section}>
      <h2>Delete account</h2>
      <p className={styles.description}>Permanently delete your account and everything in it. This cannot be undone.</p>
      <div className={styles.actions}>
        <Button variant='danger' onClick={() => setConfirming(true)}>
          Delete account
        </Button>
      </div>
      {confirming && (
        <Modal
          title='Delete your account?'
          confirm={{ label: 'Delete forever', variant: 'danger', action: deleteAccount }}
          onClose={() => setConfirming(false)}
          onDone={() => setUser(null)}>
          <p className={modal.message}>Type your email to confirm.</p>
          <label className={styles.field}>
            Email
            <input
              name='email'
              type='email'
              placeholder={user.email}
              autoComplete='off'
              required
              onInput={({ currentTarget }) =>
                currentTarget.setCustomValidity(
                  currentTarget.value.trim().toLowerCase() === user.email.toLowerCase() ? '' : 'Type your email exactly to confirm',
                )
              }
            />
          </label>
        </Modal>
      )}
    </section>
  );
};

const UserSettings = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className={styles.userSettings}>
      <h1>User Settings</h1>
      <Profile user={user} />
      <Password user={user} />
      <DeleteAccount user={user} />
    </div>
  );
};

export default UserSettings;
