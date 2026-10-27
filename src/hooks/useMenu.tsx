import { useId, useRef, useState } from 'react';

import Menu, { type Option } from '@/components/Menu';

export const useMenu = (options: Option[]) => {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const id = useId();

  return {
    trigger: {
      ref: anchor,
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      'aria-controls': open ? id : undefined,
      onClick: () => setOpen((current) => !current),
    },
    menu: <Menu id={id} anchor={anchor} open={open} onClose={() => setOpen(false)} options={options} />,
  };
};
