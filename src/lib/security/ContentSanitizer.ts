import DOMPurify from 'isomorphic-dompurify';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  allowedSchemes?: string[];
  stripScriptingAttributes?: boolean;
  removeComments?: boolean;
}

export interface SanitizationResult {
  sanitizedContent: string;
  removedElements: string[];
  warnings: string[];
}

export class ContentSanitizer {
  private static readonly DEFAULT_ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'sup', 'sub',
    'details', 'summary'
  ];

  private static readonly DEFAULT_ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'blockquote': ['cite'],
    'pre': ['class'],
    'code': ['class'],
    'div': ['class'],
    'span': ['class'],
    'h1': ['class', 'id'],
    'h2': ['class', 'id'],
    'h3': ['class', 'id'],
    'h4': ['class', 'id'],
    'h5': ['class', 'id'],
    'h6': ['class', 'id'],
    'table': ['class'],
    'th': ['class'],
    'td': ['class'],
    'tr': ['class'],
    'thead': ['class'],
    'tbody': ['class']
  };

  private static readonly DEFAULT_ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(
    content: string,
    options: SanitizationOptions = {}
  ): SanitizationResult {
    const {
      allowedTags = this.DEFAULT_ALLOWED_TAGS,
      allowedAttributes = this.DEFAULT_ALLOWED_ATTRIBUTES,
      allowedSchemes = this.DEFAULT_ALLOWED_SCHEMES,
      stripScriptingAttributes = true,
      removeComments = true
    } = options;

    const removedElements: string[] = [];
    const warnings: string[] = [];

    // Configure DOMPurify
    const config = {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: Object.values(allowedAttributes).flat(),
      ALLOWED_URI_REGEXP: new RegExp(`^(?:(?:${allowedSchemes.join('|')}):)`),
      KEEP_CONTENT: true,
      REMOVE_DATA_ATTRIBUTES: stripScriptingAttributes,
      REMOVE_UNKNOWN_PROTOCOLS: true,
      USE_PROFILES: { html: true }
    };

    // Add hooks to track removed elements
    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
      if (data.allowedTags && !data.allowedTags[data.tagName]) {
        removedElements.push(`<${data.tagName}>`);
      }
    });

    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      const tagName = node.tagName.toLowerCase();
      const allowedAttrs = allowedAttributes[tagName as keyof typeof allowedAttributes] || [];
      
      if (!allowedAttrs.includes(data.attrName)) {
        removedElements.push(`${tagName}[${data.attrName}]`);
      }

      // Check for potentially dangerous attribute values
      if (data.attrValue) {
        if (data.attrName === 'href' && data.attrValue.toLowerCase().startsWith('javascript:')) {
          warnings.push(`Removed javascript: URL in href attribute`);
          data.keepAttr = false;
        }
        
        if (data.attrName.startsWith('on')) {
          warnings.push(`Removed event handler: ${data.attrName}`);
          data.keepAttr = false;
        }
      }
    });

    try {
      // Sanitize the content
      const sanitizedContent = DOMPurify.sanitize(content, config);

      // Remove comments if requested
      const finalContent = removeComments 
        ? sanitizedContent.replace(/<!--[\s\S]*?-->/g, '')
        : sanitizedContent;

      // Clean up hooks
      DOMPurify.removeAllHooks();

      return {
        sanitizedContent: finalContent,
        removedElements: [...new Set(removedElements)], // Remove duplicates
        warnings
      };
    } catch (error) {
      DOMPurify.removeAllHooks();
      throw new Error(`Sanitization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sanitize Markdown content before processing
   */
  static sanitizeMarkdown(content: string): SanitizationResult {
    const removedElements: string[] = [];
    const warnings: string[] = [];
    let sanitizedContent = content;

    // Remove potentially dangerous HTML tags that might be embedded in Markdown
    const dangerousTags = /<(script|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\/\1>/gi;
    const matches = content.match(dangerousTags);
    if (matches) {
      matches.forEach(match => {
        const tagName = match.match(/<(\w+)/)?.[1];
        if (tagName) {
          removedElements.push(`<${tagName}>`);
          warnings.push(`Removed potentially dangerous HTML tag: ${tagName}`);
        }
      });
      sanitizedContent = sanitizedContent.replace(dangerousTags, '');
    }

    // Remove javascript: URLs in Markdown links
    const jsUrls = /\[([^\]]*)\]\(javascript:[^)]*\)/gi;
    if (jsUrls.test(sanitizedContent)) {
      warnings.push('Removed javascript: URLs from Markdown links');
      sanitizedContent = sanitizedContent.replace(jsUrls, '[$1](#)');
    }

    // Remove data: URLs that might contain scripts (except safe image formats)
    const dataUrls = /\[([^\]]*)\]\(data:(?!image\/(png|jpg|jpeg|gif|svg\+xml))[^)]*\)/gi;
    if (dataUrls.test(sanitizedContent)) {
      warnings.push('Removed potentially unsafe data: URLs');
      sanitizedContent = sanitizedContent.replace(dataUrls, '[$1](#)');
    }

    // Check for HTML comments that might contain scripts
    const htmlComments = /<!--[\s\S]*?-->/g;
    const commentMatches = content.match(htmlComments);
    if (commentMatches) {
      commentMatches.forEach(comment => {
        if (comment.toLowerCase().includes('script') || comment.toLowerCase().includes('javascript')) {
          warnings.push('Removed HTML comment containing script references');
          removedElements.push('<!-- script comment -->');
        }
      });
      sanitizedContent = sanitizedContent.replace(htmlComments, '');
    }

    return {
      sanitizedContent,
      removedElements: [...new Set(removedElements)],
      warnings
    };
  }

  /**
   * Validate and sanitize file paths to prevent path traversal
   */
  static sanitizeFilePath(filePath: string): string {
    if (!filePath) {
      throw new Error('File path cannot be empty');
    }

    // Remove any path traversal attempts
    let sanitized = filePath.replace(/\.\./g, '');
    
    // Remove leading slashes and backslashes
    sanitized = sanitized.replace(/^[\/\\]+/, '');
    
    // Replace backslashes with forward slashes
    sanitized = sanitized.replace(/\\/g, '/');
    
    // Remove multiple consecutive slashes
    sanitized = sanitized.replace(/\/+/g, '/');
    
    // Remove any null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Ensure the path doesn't start with special characters
    sanitized = sanitized.replace(/^[~$]/g, '');

    if (!sanitized || sanitized === '/') {
      throw new Error('Invalid file path after sanitization');
    }

    return sanitized;
  }

  /**
   * Check if content contains potentially malicious patterns
   */
  static detectSuspiciousContent(content: string): string[] {
    const suspiciousPatterns = [
      {
        pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        description: 'Script tags detected'
      },
      {
        pattern: /javascript:/gi,
        description: 'JavaScript URLs detected'
      },
      {
        pattern: /on\w+\s*=/gi,
        description: 'Event handlers detected'
      },
      {
        pattern: /<iframe[\s\S]*?>/gi,
        description: 'Iframe tags detected'
      },
      {
        pattern: /<object[\s\S]*?>/gi,
        description: 'Object tags detected'
      },
      {
        pattern: /<embed[\s\S]*?>/gi,
        description: 'Embed tags detected'
      },
      {
        pattern: /data:text\/html/gi,
        description: 'HTML data URLs detected'
      },
      {
        pattern: /vbscript:/gi,
        description: 'VBScript URLs detected'
      }
    ];

    const detectedThreats: string[] = [];

    suspiciousPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(content)) {
        detectedThreats.push(description);
      }
    });

    return detectedThreats;
  }
}