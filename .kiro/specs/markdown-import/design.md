# Design Document - Markdown Import Feature

## Overview

Tính năng import Markdown được thiết kế như một modal/dialog component tích hợp vào giao diện chính của ThinkNote knowledge base. Tính năng này sử dụng Next.js 14, React, TypeScript và Tailwind CSS để tạo ra một trải nghiệm người dùng mượt mà và hiện đại.

Hệ thống sẽ tận dụng các thư viện Markdown processing có sẵn (remark, remark-gfm, remark-html) để xử lý và chuyển đổi nội dung, đồng thời áp dụng design system hiện tại của project để đảm bảo tính nhất quán về giao diện.

## Architecture

### Component Structure
```
src/components/
├── ui/
│   ├── MarkdownImporter.tsx          # Main import component
│   ├── FileUploadZone.tsx            # Drag & drop file upload
│   ├── MarkdownPreview.tsx           # HTML preview component
│   └── ImportProgressModal.tsx       # Progress indicator
├── markdown/
│   ├── MarkdownProcessor.ts          # Markdown processing utilities
│   └── StyleConverter.ts             # Style conversion logic
```

### Integration Points
- **Main Layout**: Thêm nút "Import Markdown" vào header navigation
- **Home Page**: Thêm quick action button trong hero section
- **File System**: Tích hợp với thư mục `src/data` để lưu trữ files
- **Routing**: Tạo API route `/api/markdown/import` để xử lý upload

## Components and Interfaces

### 1. MarkdownImporter Component

**Props Interface:**
```typescript
interface MarkdownImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (filePath: string) => void;
}
```

**State Management:**
```typescript
interface ImportState {
  file: File | null;
  isProcessing: boolean;
  previewContent: string;
  convertedContent: string;
  error: string | null;
  step: 'upload' | 'preview' | 'processing' | 'complete';
}
```

### 2. FileUploadZone Component

**Features:**
- Drag & drop functionality
- File type validation (.md, .markdown)
- File size limit (5MB)
- Visual feedback cho drag states
- Support cho click-to-upload

### 3. MarkdownPreview Component

**Props Interface:**
```typescript
interface MarkdownPreviewProps {
  content: string;
  className?: string;
  showOriginal?: boolean;
}
```

**Rendering:**
- Sử dụng `remark` và `remark-html` để convert Markdown to HTML
- Áp dụng `.prose` classes từ globals.css
- Support cho syntax highlighting với `remark-gfm`

### 4. MarkdownProcessor Service

**Core Functions:**
```typescript
class MarkdownProcessor {
  static async parseMarkdown(content: string): Promise<string>
  static async convertToProjectFormat(html: string): Promise<string>
  static validateMarkdownContent(content: string): ValidationResult
  static extractMetadata(content: string): MarkdownMetadata
}
```

## Data Models

### File Upload Model
```typescript
interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  lastModified: number;
}
```

### Markdown Metadata
```typescript
interface MarkdownMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  author?: string;
  date?: string;
}
```

### Import Result
```typescript
interface ImportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
  metadata?: MarkdownMetadata;
}
```

## Error Handling

### Client-Side Validation
1. **File Type Check**: Chỉ chấp nhận .md và .markdown files
2. **File Size Limit**: Maximum 5MB per file
3. **Content Validation**: Kiểm tra valid Markdown syntax
4. **Duplicate Check**: Cảnh báo nếu file name đã tồn tại

### Server-Side Processing
1. **File System Errors**: Handle permission và disk space issues
2. **Processing Errors**: Graceful fallback khi Markdown parsing fails
3. **Network Errors**: Retry mechanism cho upload failures

### User Feedback
- Loading states với progress indicators
- Clear error messages với suggested actions
- Success notifications với file location
- Undo functionality trong 5 giây sau import

## Testing Strategy

### Unit Tests
- **MarkdownProcessor**: Test parsing và conversion logic
- **FileUploadZone**: Test file validation và drag/drop
- **MarkdownPreview**: Test HTML rendering accuracy
- **StyleConverter**: Test CSS class application

### Integration Tests
- **Full Import Flow**: End-to-end import process
- **File System Integration**: Test file saving và retrieval
- **API Endpoints**: Test upload và processing endpoints
- **Error Scenarios**: Test various failure modes

### User Acceptance Tests
- **Upload Different File Types**: Verify validation works
- **Large File Handling**: Test performance với large Markdown files
- **Preview Accuracy**: Verify HTML matches expected output
- **Style Consistency**: Confirm converted content matches project theme

## Implementation Details

### Styling Integration
Tính năng sẽ sử dụng existing design system:
- **Modal**: Glass morphism effect với backdrop blur
- **Buttons**: `.btn-primary` và `.btn-secondary` classes
- **Cards**: `.modern-card` với hover effects
- **Typography**: Existing `.heading-*` và `.prose` classes
- **Colors**: CSS variables từ `:root` trong globals.css

### Markdown Processing Pipeline
1. **File Upload**: Validate và read file content
2. **Initial Parse**: Convert Markdown to HTML using remark
3. **Style Conversion**: Apply project-specific CSS classes
4. **Preview Generation**: Render styled HTML for user review
5. **Final Processing**: Save converted content to file system
6. **Metadata Extraction**: Parse frontmatter và generate metadata

### Performance Considerations
- **Lazy Loading**: Import components chỉ khi cần thiết
- **Chunked Processing**: Process large files in chunks
- **Caching**: Cache processed content để avoid re-processing
- **Debounced Preview**: Delay preview updates khi user typing

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support cho modal
- **Screen Reader**: Proper ARIA labels và descriptions
- **Focus Management**: Trap focus trong modal
- **High Contrast**: Support cho high contrast mode

### Internationalization
Tận dụng existing `next-intl` setup:
- **Error Messages**: Localized error text
- **UI Labels**: Translated button và label text
- **Help Text**: Localized instructions và tooltips
- **File Names**: Support cho Unicode file names

## Security Considerations

### File Upload Security
- **File Type Validation**: Server-side validation bổ sung
- **Content Sanitization**: Strip potentially dangerous HTML
- **File Size Limits**: Prevent DoS attacks
- **Path Traversal Protection**: Validate file paths

### Content Processing
- **XSS Prevention**: Sanitize HTML output
- **Script Injection**: Remove script tags từ Markdown
- **Link Validation**: Validate external links
- **Image Processing**: Secure image handling

## Future Enhancements

### Phase 2 Features
- **Batch Import**: Multiple file upload support
- **Template Selection**: Pre-defined formatting templates
- **Auto-categorization**: AI-powered content categorization
- **Version Control**: Track changes và revisions

### Advanced Processing
- **Image Optimization**: Automatic image compression
- **Link Checking**: Validate external links
- **SEO Optimization**: Generate meta tags automatically
- **Export Options**: Convert back to different formats