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
    let baseStyle = 'font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-300 ease-in-out inline-block text-center';

    if (gradient) {
      baseStyle += ' bg-gradient-to-r text-white hover:shadow-lg';
    }

    let variantStyle = '';
    switch (variant) {
      case 'primary':
        variantStyle = gradient 
          ? 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:ring-purple-400' 
          : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-400';
        break;
      case 'secondary':
        variantStyle = gradient
          ? 'from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 focus:ring-pink-400'
          : 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400';
        break;
      case 'outline':
        variantStyle = 'bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white focus:ring-purple-300';
        if (gradient) {
          variantStyle = 'bg-transparent border border-purple-500 text-purple-500 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white focus:ring-purple-400';
        }
        break;
      default:
        variantStyle = gradient
          ? 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:ring-gray-400'
          : 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400';
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
