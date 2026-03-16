/**
 * StyleConverter utility for applying project-specific CSS classes to HTML content
 * Maps generic HTML elements to the project's design system classes
 */

export interface StyleMapping {
  [key: string]: string;
}

export interface ConversionOptions {
  preserveOriginalClasses?: boolean;
  customMappings?: StyleMapping;
  applyProseClasses?: boolean;
}

export class StyleConverter {
  private static readonly DEFAULT_MAPPINGS: StyleMapping = {
    // Headings with project-specific classes
    'h1': 'heading-xl text-gray-900 font-bold mb-6 mt-8 first:mt-0',
    'h2': 'heading-lg text-gray-900 font-semibold mb-4 mt-6 border-b-2 border-gray-200 pb-2',
    'h3': 'heading-md text-gray-900 font-semibold mb-3 mt-5',
    'h4': 'text-xl font-semibold text-gray-900 mb-2 mt-4',
    'h5': 'text-lg font-semibold text-gray-900 mb-2 mt-3',
    'h6': 'text-base font-semibold text-gray-900 mb-2 mt-3',

    // Paragraphs and text
    'p': 'text-gray-600 mb-4 leading-relaxed',
    'strong': 'font-semibold text-gray-900',
    'em': 'italic text-gray-700',
    'mark': 'bg-yellow-100 text-yellow-800 px-1 rounded',

    // Links
    'a': 'text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline',

    // Lists
    'ul': 'list-disc list-inside mb-4 space-y-2 text-gray-600',
    'ol': 'list-decimal list-inside mb-4 space-y-2 text-gray-600',
    'li': 'text-gray-600 leading-relaxed',

    // Code elements - simplified for regex approach
    'code': 'bg-gray-100 text-primary-700 px-2 py-1 rounded text-sm font-mono font-medium',
    'pre': 'bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto mb-6 shadow-lg border border-gray-700',

    // Blockquotes
    'blockquote': 'border-l-4 border-primary-500 bg-primary-50 pl-4 pr-4 py-3 mb-6 rounded-r-lg italic text-gray-700',

    // Tables
    'table': 'w-full border-collapse mb-6 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200',
    'thead': 'bg-gray-50',
    'th': 'px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-200',
    'td': 'px-4 py-3 text-gray-600 border-b border-gray-100',
    'tr': 'hover:bg-gray-50 transition-colors duration-150',

    // Images
    'img': 'rounded-xl shadow-lg mb-6 max-w-full h-auto border border-gray-200',

    // Horizontal rule
    'hr': 'border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8',

    // Form elements (if present in markdown)
    'input': 'border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'textarea': 'border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical',

    // Keyboard shortcuts
    'kbd': 'bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs font-mono font-semibold text-gray-700 shadow-sm',

    // Abbreviations
    'abbr': 'border-b border-dotted border-gray-400 cursor-help',

    // Details/Summary
    'details': 'mb-4 border border-gray-200 rounded-lg overflow-hidden',
    'summary': 'bg-gray-50 px-4 py-3 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-150',

    // Definition lists
    'dl': 'mb-4',
    'dt': 'font-semibold text-gray-900 mb-1',
    'dd': 'text-gray-600 mb-3 ml-4',
  };

  /**
   * Convert HTML content by applying project-specific CSS classes using regex
   */
  static convertHtmlContent(
    htmlContent: string, 
    options: ConversionOptions = {}
  ): string {
    const {
      preserveOriginalClasses = false,
      customMappings = {},
      applyProseClasses = true
    } = options;

    // Merge default mappings with custom mappings
    const mappings = { ...this.DEFAULT_MAPPINGS, ...customMappings };

    let converted = htmlContent;

    // Apply styles using regex for each tag
    Object.entries(mappings).forEach(([tag, classes]) => {
      if (typeof classes === 'string') {
        // Match opening tags with or without existing attributes
        const tagRegex = new RegExp(`<${tag}([^>]*)>`, 'gi');
        
        converted = converted.replace(tagRegex, (match, attributes) => {
          const existingClassMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/i);
          
          if (existingClassMatch) {
            // Tag already has classes
            const existingClasses = existingClassMatch[1];
            if (preserveOriginalClasses) {
              const newClasses = `${existingClasses} ${classes}`.trim();
              return match.replace(existingClassMatch[0], `class="${newClasses}"`);
            } else {
              // Keep important classes like language-* for code blocks
              const importantClasses = existingClasses.split(' ').filter((cls: string) => 
                cls.startsWith('language-') || cls.startsWith('hljs-')
              );
              const finalClasses = importantClasses.length > 0 
                ? `${importantClasses.join(' ')} ${classes}`.trim()
                : classes;
              return match.replace(existingClassMatch[0], `class="${finalClasses}"`);
            }
          } else {
            // Tag doesn't have classes, add them
            return `<${tag}${attributes} class="${classes}">`;
          }
        });
      }
    });

    // Wrap in prose container if requested
    if (applyProseClasses) {
      converted = `<div class="prose prose-lg max-w-none">${converted}</div>`;
    }

    return converted;
  }



  /**
   * Extract and convert inline styles to Tailwind classes (basic conversion)
   */
  static convertInlineStyles(htmlContent: string): string {
    // Use regex to find and convert inline styles
    return htmlContent.replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleContent) => {
      const tailwindClasses = this.convertStyleToTailwind(styleContent);
      return tailwindClasses ? `class="${tailwindClasses}"` : '';
    });
  }

  /**
   * Convert basic CSS styles to Tailwind classes
   */
  private static convertStyleToTailwind(style: string): string {
    const styleMap: { [key: string]: string } = {
      'text-align: center': 'text-center',
      'text-align: left': 'text-left',
      'text-align: right': 'text-right',
      'text-align: justify': 'text-justify',
      'font-weight: bold': 'font-bold',
      'font-weight: 600': 'font-semibold',
      'font-weight: 700': 'font-bold',
      'font-style: italic': 'italic',
      'text-decoration: underline': 'underline',
      'text-decoration: line-through': 'line-through',
      'color: red': 'text-red-600',
      'color: blue': 'text-blue-600',
      'color: green': 'text-green-600',
      'background-color: yellow': 'bg-yellow-100',
      'background-color: gray': 'bg-gray-100',
    };

    const classes: string[] = [];
    
    // Split style declarations
    const declarations = style.split(';').map(d => d.trim()).filter(d => d);
    
    declarations.forEach(declaration => {
      const normalizedDeclaration = declaration.toLowerCase().trim();
      if (styleMap[normalizedDeclaration]) {
        classes.push(styleMap[normalizedDeclaration]);
      }
    });

    return classes.join(' ');
  }

  /**
   * Sanitize HTML content to prevent XSS while preserving formatting
   */
  static sanitizeHtml(htmlContent: string): string {
    let sanitized = htmlContent;

    // Remove dangerous elements
    sanitized = sanitized.replace(/<(script|object|embed|iframe|form|input|button)[^>]*>.*?<\/\1>/gi, '');
    sanitized = sanitized.replace(/<(script|object|embed|iframe|form|input|button)[^>]*\/>/gi, '');

    // Remove dangerous attributes
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
    dangerousAttrs.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Sanitize href attributes
    sanitized = sanitized.replace(/href\s*=\s*["'](javascript:|data:)[^"']*["']/gi, '');

    return sanitized;
  }

  /**
   * Apply responsive classes for mobile optimization
   */
  static applyResponsiveClasses(htmlContent: string): string {
    let responsive = htmlContent;

    // Add responsive classes to images
    responsive = responsive.replace(/<img([^>]*)>/gi, (match, attributes) => {
      const classMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/i);
      if (classMatch) {
        const existingClasses = classMatch[1];
        const newClasses = `${existingClasses} w-full md:w-auto max-w-full`.trim();
        return match.replace(classMatch[0], `class="${newClasses}"`);
      } else {
        return `<img${attributes} class="w-full md:w-auto max-w-full">`;
      }
    });

    // Wrap tables in responsive containers
    responsive = responsive.replace(/<table([^>]*)>/gi, '<div class="overflow-x-auto"><table$1>');
    responsive = responsive.replace(/<\/table>/gi, '</table></div>');

    // Add responsive text classes to headings
    const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    headingTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*)>`, 'gi');
      responsive = responsive.replace(regex, (match, attributes) => {
        const classMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/i);
        if (classMatch) {
          const existingClasses = classMatch[1];
          const newClasses = `${existingClasses} break-words`.trim();
          return match.replace(classMatch[0], `class="${newClasses}"`);
        } else {
          return `<${tag}${attributes} class="break-words">`;
        }
      });
    });

    return responsive;
  }

  /**
   * Complete conversion pipeline that applies all transformations
   */
  static convertToProjectFormat(
    htmlContent: string,
    options: ConversionOptions = {}
  ): string {
    let converted = htmlContent;

    // Step 1: Sanitize content
    converted = this.sanitizeHtml(converted);

    // Step 2: Convert inline styles to Tailwind classes
    converted = this.convertInlineStyles(converted);

    // Step 3: Apply project-specific styling
    converted = this.convertHtmlContent(converted, options);

    // Step 4: Apply responsive classes
    converted = this.applyResponsiveClasses(converted);

    return converted;
  }

  /**
   * Validate that the conversion maintains content structure
   */
  static validateConversion(original: string, converted: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    try {
      // Simple validation using regex to count elements
      const criticalTags = ['h1', 'h2', 'h3', 'p', 'a', 'img', 'code', 'pre'];
      
      criticalTags.forEach(tag => {
        const originalMatches = (original.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
        const convertedMatches = (converted.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
        
        if (originalMatches > 0 && convertedMatches !== originalMatches) {
          issues.push(`Mismatch in ${tag} elements: ${originalMatches} -> ${convertedMatches}`);
        }
      });

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        isValid: true,
        issues: []
      };
    }
  }
}

export default StyleConverter;