import styles from '@/styles/MenuButton.module.css';

import type { ComponentProps, ReactNode } from 'react';

import { useMenu } from '@/hooks/useMenu';

import Button from '@/components/Button';
import type { Option } from '@/components/Menu';

import { moreVert } from '@/utilities/icons';

type Props = Pick<ComponentProps<typeof Button>, 'variant' | 'icon'> & { label: string; options: Option[]; children?: ReactNode };

const MenuButton = ({ label, options, variant = 'ghost', icon, children }: Props) => {
  const { trigger, menu } = useMenu(options);

  return (
    <>
      <Button variant={variant} icon={icon} aria-label={label} className={children ? undefined : styles.more} {...trigger}>
        {children ?? moreVert}
      </Button>
      {menu}
    </>
  );
};

export default MenuButton;
