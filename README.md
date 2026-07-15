# AI Career Navigator

An AI-powered career navigation platform that helps users analyze resumes, generate cover letters, prepare for interviews, and find job opportunities.

## Features

- **Resume Analysis**: Upload and analyze resumes to identify skills and match them with job requirements
- **Cover Letter Generation**: AI-powered cover letter generation tailored to specific roles and companies
- **Interview Preparation**: Generate role-specific interview questions and evaluate answers
- **Job Board**: Browse and save job opportunities
- **Career Roadmaps**: Get personalized learning paths based on your skills and goals
- **User Authentication**: Secure login, registration, and password reset functionality

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **AI**: Groq API (Llama 3.1)
- **File Processing**: pdf-parse, mammoth (for DOCX)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database
- Groq API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
GROQ_API_KEY=your_groq_api_key
```

**Optional (for email functionality):**
```env
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=your_resend_api_key
# Or use SendGrid, Mailgun, etc.
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-career-navigator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Resume
- `POST /api/resume` - Upload and parse resume

### AI Features
- `POST /api/interview/questions` - Generate interview questions
- `POST /api/interview/evaluate` - Evaluate interview answers
- `POST /api/generate/cover-letter` - Generate cover letter

### Jobs
- `GET /api/jobs` - Get jobs (with optional role filter)
- `POST /api/jobs` - Post a new job (requires authentication)

### Profile
- `GET /api/profile` - Get user profile (requires authentication)
- `POST /api/profile` - Update user profile (requires authentication)

### Health Check
- `GET /api/health` - Check system health and external services

## Security Features

- **Rate Limiting**: Implemented on all API endpoints to prevent abuse
- **Password Validation**: Strong password requirements (8+ chars, uppercase, lowercase, number, special character)
- **Email Validation**: Format validation on all email inputs
- **JWT Authentication**: Secure token-based authentication with refresh mechanism
- **File Validation**: Magic number validation for uploaded files
- **CORS Configuration**: Proper CORS headers for API routes
- **Request Logging**: Comprehensive logging for debugging and monitoring

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Environment variables
- Serverless functions (if using Vercel-like deployment)

## Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## License

This project is licensed under the MIT License.
