import { render } from '@testing-library/react';

import { Container } from '@/components/layout/Container';

describe('Container', () => {
  it('renders with default props', () => {
    const { container } = render(<Container />);
    expect(container.firstChild).toHaveClass('mx-auto px-2 md:px-4');
  });

  it('renders with custom element type', () => {
    const { container } = render(<Container as='section' />);
    expect(container.firstChild).toHaveProperty('tagName', 'SECTION');
  });

  it('applies width styles correctly', () => {
    const { container } = render(<Container width='full' />);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('applies padding styles correctly', () => {
    const { container } = render(<Container pt='md' pb='md' />);
    expect(container.firstChild).toHaveClass('pt-4 pb-4');
  });

  it('applies margin styles correctly', () => {
    const { container } = render(<Container mt='md' mb='md' />);
    expect(container.firstChild).toHaveClass('mt-4 mb-4');
  });

  it('applies background color styles correctly', () => {
    const { container } = render(<Container bgColor='white' />);
    expect(container.firstChild).toHaveClass('bg-white text-black');
  });
});
