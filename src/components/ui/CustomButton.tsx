import React, { forwardRef } from 'react';

// Cho phép props của cả button và anchor element
type PolymorphicProps = React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;

interface CustomButtonProps extends PolymorphicProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  gradient?: boolean;
  as?: 'button' | 'a'; // Để xác định element render, mặc định là button
}

const CustomButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, CustomButtonProps>(
  ({ children, className = '', variant = 'primary', gradient = false, as = 'button', ...props }, ref) => {
    let baseStyle = 'cursor-pointer font-semibold py-2 px-6 rounded-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors transition-transform duration-200 ease-in-out inline-block text-center';

    if (gradient) {
      baseStyle += ' bg-gradient-to-r text-white hover:shadow-lg';
    }

    let variantStyle = '';
    switch (variant) {
      case 'primary':
        variantStyle = gradient
          ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus-visible:ring-blue-400'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400';
        break;
      case 'secondary':
        variantStyle = gradient
          ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus-visible:ring-orange-400'
          : 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400';
        break;
      case 'outline':
        variantStyle = 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus-visible:ring-blue-300';
        if (gradient) {
          variantStyle = 'bg-transparent border border-blue-500 text-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white focus-visible:ring-blue-400';
        }
        break;
      default:
        variantStyle = gradient
          ? 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus-visible:ring-gray-400'
          : 'bg-gray-500 text-white hover:bg-gray-600 focus-visible:ring-gray-400';
        break;
    }

    const combinedClassName = `${baseStyle} ${variantStyle} ${className}`;

    if (as === 'a') {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combinedClassName}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} // Type assertion
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} // Type assertion
      >
        {children}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton'; // Important for DevTools and HOCs
export default CustomButton;
