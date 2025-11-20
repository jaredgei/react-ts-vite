import 'scss/Toggle.scss';

type Props = {
  value: boolean;
  onToggle: () => void;
};

const Toggle = ({ value, onToggle }: Props) => {
  return (
    <div className={'toggle' + (value ? ' on' : '')} onClick={onToggle}>
      <div className='switch' />
    </div>
  );
};

export default Toggle;
