import 'scss/Toggle.scss';

type Props = {
  value: boolean;
  onToggle: () => void;
};

const Toggle = ({ value, onToggle }: Props) => {
  return (
    <button type='button' role='switch' aria-checked={value} className={`toggle ${value ? 'on' : ''}`.trim()} onClick={onToggle}>
      <span className='switch' />
    </button>
  );
};

export default Toggle;
