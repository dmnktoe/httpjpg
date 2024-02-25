import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HiArrowRight, HiPlus } from 'react-icons/hi';

import Button from '@/components/ui/buttons/Button';

describe('Button', () => {
  afterEach(cleanup); // Add this line

  it('should render correctly', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<Button isLoading>Test Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Test Button')).toHaveClass('text-transparent');
    expect(screen.getByText('Test Button')).toHaveClass('relative');
    expect(screen.getByText('Test Button')).toHaveClass('transition-none');
    expect(screen.getByText('Test Button')).toHaveClass(
      'hover:text-transparent'
    );
    expect(screen.getByText('Test Button')).toHaveClass('disabled:cursor-wait');
  });

  it('should render with different variants', () => {
    const variants = ['primary', 'outline', 'ghost', 'light', 'dark'];
    variants.forEach((variant) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      render(<Button variant={variant}>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
      cleanup();
    });
  });

  it('should render with different sizes', () => {
    const sizes = ['sm', 'base', 'lg'];
    sizes.forEach((size) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      render(<Button size={size}>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
      cleanup();
    });
  });

  it('should render with left and right icons', () => {
    render(
      <Button leftIcon={HiPlus} rightIcon={HiArrowRight}>
        Test Button
      </Button>
    );
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should render with isDarkBg prop', () => {
    render(<Button isDarkBg>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});
