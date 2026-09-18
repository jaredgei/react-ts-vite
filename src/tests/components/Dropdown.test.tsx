import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Dropdown from 'components/Dropdown';

describe('Dropdown', () => {
  it('shows its value or title', () => {
    render(<Dropdown title='Pick one' value='Chosen' />);
    expect(screen.getByText('Chosen')).toBeInTheDocument();
  });

  it('falls back to the title when there is no value', () => {
    render(<Dropdown title='Pick one' />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders its options as suggestions', () => {
    render(
      <Dropdown
        title='Pick'
        options={[
          { name: 'One', onSelect: () => {} },
          { name: 'Two', onSelect: () => {} },
        ]}
      />,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('calls an option onSelect when chosen', async () => {
    const onSelect = vi.fn();
    render(<Dropdown title='Pick' options={[{ name: 'One', onSelect }]} />);
    await userEvent.click(screen.getByText('One'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('toggles open state on trigger click', async () => {
    render(<Dropdown title='Pick' options={[{ name: 'Option A' }]} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape key and outside click', async () => {
    render(
      <div>
        <div data-testid='outside'>Outside</div>
        <Dropdown title='Pick' options={[{ name: 'Option A' }]} />
      </div>,
    );
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByTestId('outside'));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('drills into child options when selected', async () => {
    render(<Dropdown title='Pick' options={[{ name: 'More', children: [{ name: 'Child Item' }] }]} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('More'));
    expect(screen.getByText('Child Item')).toBeInTheDocument();
  });

  it('switches between multiple dropdowns on click and closes on escape', async () => {
    render(
      <div>
        <Dropdown title='First' options={[{ name: 'Item A' }]} />
        <Dropdown title='Second' options={[{ name: 'Item B' }]} />
      </div>,
    );
    const [firstTrigger, secondTrigger] = screen.getAllByRole('combobox');
    await userEvent.click(firstTrigger);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(secondTrigger);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
  });
});
