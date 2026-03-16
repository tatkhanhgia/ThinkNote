export interface MarkdownError {
  code: string;
  messageEn: string;
  messageVi: string;
  details?: string;
  suggestions?: {
    en: string[];
    vi: string[];
  };
}

export class MarkdownErrorHandler {
  private static readonly ERROR_CODES: Record<string, MarkdownError> = {
    EMPTY_CONTENT: {
      code: 'EMPTY_CONTENT',
      messageEn: 'File is empty or contains no content',
      messageVi: 'File trống hoặc không có nội dung',
      suggestions: {
        en: ['Please select a file with Markdown content', 'Check if the file was uploaded correctly'],
        vi: ['Vui lòng chọn file có nội dung Markdown', 'Kiểm tra xem file đã được upload đúng chưa']
      }
    },
    FILE_TOO_LARGE: {
      code: 'FILE_TOO_LARGE',
      messageEn: 'File is too large',
      messageVi: 'File quá lớn',
      suggestions: {
        en: ['Maximum file size is 5MB', 'Try splitting the content into smaller files'],
        vi: ['Kích thước file tối đa là 5MB', 'Thử chia nội dung thành các file nhỏ hơn']
      }
    },
    INVALID_FRONTMATTER: {
      code: 'INVALID_FRONTMATTER',
      messageEn: 'Invalid frontmatter format',
      messageVi: 'Định dạng frontmatter không hợp lệ',
      suggestions: {
        en: ['Check YAML syntax in frontmatter', 'Ensure frontmatter is enclosed in --- markers'],
        vi: ['Kiểm tra cú pháp YAML trong frontmatter', 'Đảm bảo frontmatter được bao quanh bởi dấu ---']
      }
    },
    UNBALANCED_CODE_BLOCKS: {
      code: 'UNBALANCED_CODE_BLOCKS',
      messageEn: 'Unbalanced code blocks detected',
      messageVi: 'Phát hiện code block không cân bằng',
      suggestions: {
        en: ['Check that all ``` code blocks are properly closed', 'Each opening ``` should have a matching closing ```'],
        vi: ['Kiểm tra tất cả code block ``` đã được đóng đúng cách', 'Mỗi ``` mở đầu phải có ``` đóng tương ứng']
      }
    },
    MALFORMED_LINKS: {
      code: 'MALFORMED_LINKS',
      messageEn: 'Malformed links detected',
      messageVi: 'Phát hiện link không đúng định dạng',
      suggestions: {
        en: ['Check link syntax: [text](url)', 'Ensure all links are properly formatted'],
        vi: ['Kiểm tra cú pháp link: [text](url)', 'Đảm bảo tất cả link được định dạng đúng']
      }
    },
    SECURITY_THREAT: {
      code: 'SECURITY_THREAT',
      messageEn: 'Security threats detected in content',
      messageVi: 'Phát hiện mối đe dọa bảo mật trong nội dung',
      suggestions: {
        en: ['Remove script tags and JavaScript code', 'Avoid using HTML event handlers'],
        vi: ['Loại bỏ thẻ script và mã JavaScript', 'Tránh sử dụng event handler HTML']
      }
    },
    PROCESSING_ERROR: {
      code: 'PROCESSING_ERROR',
      messageEn: 'Error processing Markdown content',
      messageVi: 'Lỗi xử lý nội dung Markdown',
      suggestions: {
        en: ['Check Markdown syntax', 'Try simplifying complex formatting'],
        vi: ['Kiểm tra cú pháp Markdown', 'Thử đơn giản hóa định dạng phức tạp']
      }
    },
    API_ERROR: {
      code: 'API_ERROR',
      messageEn: 'Server API error',
      messageVi: 'Lỗi API máy chủ',
      suggestions: {
        en: ['Try again in a moment', 'Check your internet connection', 'Contact support if the problem persists'],
        vi: ['Thử lại sau một lúc', 'Kiểm tra kết nối internet', 'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục']
      }
    },
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      messageEn: 'Network connection error',
      messageVi: 'Lỗi kết nối mạng',
      suggestions: {
        en: ['Check your internet connection', 'Try again later'],
        vi: ['Kiểm tra kết nối internet', 'Thử lại sau']
      }
    },
    SERVER_ERROR: {
      code: 'SERVER_ERROR',
      messageEn: 'Internal server error',
      messageVi: 'Lỗi máy chủ nội bộ',
      suggestions: {
        en: ['Try again later', 'Contact support if the problem persists'],
        vi: ['Thử lại sau', 'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục']
      }
    },
    FILE_READ_ERROR: {
      code: 'FILE_READ_ERROR',
      messageEn: 'Unable to read file',
      messageVi: 'Không thể đọc file',
      suggestions: {
        en: ['Check file permissions', 'Try uploading the file again'],
        vi: ['Kiểm tra quyền truy cập file', 'Thử upload lại file']
      }
    },
    INVALID_FILE_TYPE: {
      code: 'INVALID_FILE_TYPE',
      messageEn: 'Invalid file type',
      messageVi: 'Loại file không hợp lệ',
      suggestions: {
        en: ['Only .md and .markdown files are supported', 'Check file extension'],
        vi: ['Chỉ hỗ trợ file .md và .markdown', 'Kiểm tra phần mở rộng file']
      }
    }
  };

  static createError(code: string, details?: string): MarkdownError {
    const baseError = this.ERROR_CODES[code];
    if (!baseError) {
      return {
        code: 'UNKNOWN_ERROR',
        messageEn: 'An unknown error occurred',
        messageVi: 'Đã xảy ra lỗi không xác định',
        details,
        suggestions: {
          en: ['Try uploading the file again', 'Contact support if the problem persists'],
          vi: ['Thử upload lại file', 'Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục']
        }
      };
    }

    // Enhance error message with details for specific error types
    let enhancedError = { ...baseError };
    
    if (code === 'INVALID_FILE_TYPE' && details) {
      const parts = details.split(':');
      if (parts.length >= 2) {
        const fileName = parts[0];
        const extension = parts[1];
        enhancedError.messageEn = `Invalid file type: "${fileName}" (${extension === 'no-extension' ? 'no extension' : `extension: ${extension}`})`;
        enhancedError.messageVi = `Loại file không hợp lệ: "${fileName}" (${extension === 'no-extension' ? 'không có phần mở rộng' : `phần mở rộng: ${extension}`})`;
      }
    }

    return {
      ...enhancedError,
      details
    };
  }

  static formatError(error: MarkdownError, locale: string = 'en'): {
    message: string;
    suggestions: string[];
  } {
    const isVietnamese = locale === 'vi';
    const message = isVietnamese ? error.messageVi : error.messageEn;
    const suggestions = error.suggestions ? 
      (isVietnamese ? error.suggestions.vi : error.suggestions.en) : [];

    return {
      message: error.details ? `${message}: ${error.details}` : message,
      suggestions
    };
  }

  static parseValidationError(errorMessage: string): string {
    // Check if it's a structured error from FileUploadZone
    if (errorMessage.includes(':')) {
      const errorCode = errorMessage.split(':')[0];
      if (this.ERROR_CODES[errorCode]) {
        return errorCode;
      }
    }
    
    // Map common error patterns to error codes
    if (errorMessage.includes('empty') || errorMessage.includes('no content')) {
      return 'EMPTY_CONTENT';
    }
    if (errorMessage.includes('too large') || errorMessage.includes('size')) {
      return 'FILE_TOO_LARGE';
    }
    if (errorMessage.includes('invalid file type') || errorMessage.includes('file type')) {
      return 'INVALID_FILE_TYPE';
    }
    if (errorMessage.includes('frontmatter') || errorMessage.includes('YAML')) {
      return 'INVALID_FRONTMATTER';
    }
    if (errorMessage.includes('code block') || errorMessage.includes('```')) {
      return 'UNBALANCED_CODE_BLOCKS';
    }
    if (errorMessage.includes('link') || errorMessage.includes('malformed')) {
      return 'MALFORMED_LINKS';
    }
    if (errorMessage.includes('script') || errorMessage.includes('security')) {
      return 'SECURITY_THREAT';
    }
    if (errorMessage.includes('read') || errorMessage.includes('file')) {
      return 'FILE_READ_ERROR';
    }
    // API and network errors
    if (errorMessage.includes('HTTP') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return 'NETWORK_ERROR';
    }
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return 'SERVER_ERROR';
    }
    if (errorMessage.includes('400') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('404')) {
      return 'API_ERROR';
    }
    
    return 'PROCESSING_ERROR';
  }

  static parseErrorDetails(errorMessage: string): string {
    // Extract details from structured error messages
    if (errorMessage.includes(':')) {
      const parts = errorMessage.split(':');
      if (parts.length > 1) {
        return parts.slice(1).join(': ');
      }
    }
    return errorMessage;
  }
}