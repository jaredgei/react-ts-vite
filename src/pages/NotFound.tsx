import 'scss/NotFound.scss';

import Button from 'components/Button';
import { home } from 'utilities/icons';

const NotFound = () => (
  <div className='notFound'>
    <h1>404</h1>
    <div className='title'>Page not found</div>
    <div className='description'>{"The page you're looking for might have been removed, had it's name changed, or is temporarily unavailable."}</div>
    <Button icon={home} text='Go Home' url='/' />
  </div>
);

export default NotFound;
