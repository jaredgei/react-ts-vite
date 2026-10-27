import styles from '@/styles/Auth.module.css';

import Button from '@/components/Button';

import { apple, facebook, google } from '@/utilities/icons';

const providers = [
  { name: 'Google', icon: google },
  { name: 'Facebook', icon: facebook },
  { name: 'Apple', icon: apple },
];

// Full-page links: the server redirects to the provider and back, signing in on return.
const OAuthButtons = () => (
  <div className={styles.providers}>
    {providers.map(({ name, icon }) => (
      <Button key={name} href={`/api/users/oauth/${name.toLowerCase()}`} variant='secondary' aria-label={`Continue with ${name}`}>
        {icon}
      </Button>
    ))}
  </div>
);

export default OAuthButtons;
