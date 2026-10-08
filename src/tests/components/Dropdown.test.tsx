import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Dropdown from '@/components/Dropdown';

const trigger = () => screen.getByRole('button');

describe('Dropdown', () => {
  it('shows its value or title', () => {
    render(<Dropdown title='Pick one' value='Chosen' />);
    expect(screen.getByText('Chosen')).toBeInTheDocument();
  });

  it('falls back to the title when there is no value', () => {
    render(<Dropdown title='Pick one' />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders its options as a menu', async () => {
    render(
      <Dropdown
        title='Pick'
        options={[
          { name: 'One', onSelect: () => {} },
          { name: 'Two', onSelect: () => {} },
        ]}
      />,
    );
    await userEvent.click(trigger());
    expect(screen.getByRole('menuitem', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Two' })).toBeInTheDocument();
  });

  it('calls an option onSelect when chosen', async () => {
    const onSelect = vi.fn();
    render(<Dropdown title='Pick' options={[{ name: 'One', onSelect }]} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('menuitem', { name: 'One' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('toggles its expanded state on trigger click', async () => {
    render(<Dropdown title='Pick' options={[{ name: 'Option A' }]} />);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('drills into child options when selected', async () => {
    render(<Dropdown title='Pick' options={[{ name: 'More', children: [{ name: 'Child Item' }] }]} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('menuitem', { name: 'More' }));
    expect(screen.getByRole('menuitem', { name: 'Child Item' })).toBeInTheDocument();
  });
});
