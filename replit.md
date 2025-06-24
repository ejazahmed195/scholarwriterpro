# Scholar AI Paraphrased Pro

## Overview

Scholar AI Paraphrased Pro is an advanced paraphrasing tool designed for academic and professional writing. Built using modern web technologies, it provides AI-powered contextual rewriting with multiple modes and sophisticated visualization features. The application uses Google's Gemini API for intelligent text processing and offers real-time highlighting of changes.

## System Architecture

The application follows a full-stack architecture with a clear separation between client and server:

- **Frontend**: React-based SPA with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript support
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **AI Integration**: Google Gemini API for text paraphrasing
- **File Processing**: Multer for file uploads with support for PDF, DOCX, and TXT files
- **UI Framework**: Tailwind CSS with shadcn/ui component library

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **Tailwind CSS** with custom CSS variables for theming
- **shadcn/ui** component library for consistent UI elements

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations with PostgreSQL
- **Multer** for file upload handling
- **Session management** with connect-pg-simple for PostgreSQL sessions
- **Google Gemini API** integration for AI-powered paraphrasing

### Database Schema
The application uses three main tables:
- `users`: User authentication and management
- `paraphrasing_sessions`: Stores paraphrasing requests and results with expiration
- `uploaded_files`: Manages file uploads with metadata and extracted text

### Authentication & Sessions
- Session-based authentication using PostgreSQL for session storage
- Automatic session cleanup for expired sessions
- File cleanup mechanism for temporary uploads

## Data Flow

1. **User Input**: Text input or file upload through the React frontend
2. **Validation**: Zod schemas validate input data on both client and server
3. **Processing**: Server processes text using Gemini API with specified parameters
4. **Storage**: Results stored in PostgreSQL with automatic expiration
5. **Response**: Paraphrased text with highlights returned to client
6. **Visualization**: Client displays results with color-coded change indicators

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI service for text paraphrasing
- API key required via `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY` environment variables

### Database
- **PostgreSQL**: Primary database for data persistence
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- Connection via `DATABASE_URL` environment variable

### File Processing
- **Multer**: File upload middleware
- **File type validation**: PDF, DOCX, TXT files supported
- **Size limits**: 10MB maximum file size

### UI Components
- **Radix UI**: Headless UI primitives for accessible components
- **Lucide React**: Icon library
- **Class Variance Authority**: Utility for component variants

## Deployment Strategy

### Development
- Vite dev server for frontend development
- Node.js with tsx for TypeScript execution
- Hot module replacement for rapid development

### Production Build
- Vite builds frontend to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Static assets served from built frontend

### Platform Configuration
- **Replit**: Configured for Node.js 20, web hosting, and PostgreSQL
- **Auto-scaling**: Configured for production deployment
- **Port Configuration**: Internal port 5000, external port 80

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`: Google AI API key
- `NODE_ENV`: Environment mode (development/production)

## Recent Changes

✓ Enhanced UI with modern gradient backgrounds and backdrop blur effects
✓ Redesigned header with prominent ScholarWriter.com branding and feature badges
✓ Improved sidebar with detailed mode descriptions and visual icons
✓ Advanced file upload section with drag-and-drop functionality
✓ Color-coded highlight system with detailed explanations
✓ Results summary cards showing processing statistics
✓ Comprehensive footer with feature highlights and technology credits
✓ Style matching functionality for personalized paraphrasing
✓ Dark/light theme support with smooth transitions
✓ Mobile-responsive design for all screen sizes

## Changelog

```
Changelog:
- June 24, 2025. Major UI enhancement with ScholarWriter.com branding
- June 23, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```