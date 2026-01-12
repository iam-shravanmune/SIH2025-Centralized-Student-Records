# SIH2025-Centralized-Student-Records
# GradFolio - Student Portfolio & Certificate Management System

A comprehensive full-stack application for managing student portfolios, certificates, and career development with AI-powered insights.

## Features

### Core Features
- **Automated Portfolio Generation** - Generate portfolios from certificates automatically
- **Certificate Analysis** - AI-powered analysis of certificates against job roles
- **Resume Builder** - Build resumes with AI suggestions
- **OCR Certificate Processing** - Extract text from certificate images/PDFs
- **Event Suggestions** - Discover workshops, internships, and events
- **Resume Suggestions** - Get recommendations for which certificates to include

### 📊 **PDF Downloads**
- All reports and data can be downloaded as professionally formatted PDFs
- Print-friendly layouts with proper styling
- No external dependencies required

### 🔧 **Technical Stack**
- **Frontend**: React 18 + TypeScript + TailwindCSS + Vite
- **Backend**: Express.js + Node.js
- **UI Components**: Radix UI + Lucide React icons
- **State Management**: React Context + Local Storage

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Google Account (for Firebase deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SIH
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## Deployment

### Firebase Deployment (Recommended)

This project is configured for easy deployment to Firebase Hosting and Firebase Functions.

1. **Follow the detailed deployment guide**: [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md)

2. **Quick deployment**:
   ```bash
   # Login to Firebase
   pnpm firebase:login
   
   # Build and deploy
   pnpm deploy
   ```

### Other Deployment Options

- **Netlify**: Use the `netlify/functions/` directory
- **Vercel**: Configure for Vercel deployment
- **Traditional hosting**: Build with `pnpm build` and serve the `dist/spa` directory

## Usage

### For Students

1. **Login** with student credentials
2. **Navigate to Portfolio** to generate your portfolio from certificates
3. **Use Certificate Analysis** to get career insights and job recommendations
4. **Build your Resume** with AI-powered suggestions
5. **Process Certificates** using OCR to extract data from images/PDFs
6. **Find Events** and workshops relevant to your career goals

### For Teachers

1. **Login** with teacher credentials
2. **Issue Certificates** to students
3. **Mark Attendance** and manage classes
4. **Validate Activities** submitted by students

### For Admins

1. **Login** with admin credentials
2. **Manage Users** and their roles
3. **View Analytics** and reports
4. **Generate Reports** for the institution

## API Endpoints

### Portfolio & Analysis
- `POST /api/portfolio/generate` - Generate portfolio from certificates
- `POST /api/portfolio/analyze` - Analyze certificates for job matches
- `GET /api/portfolio/job-roles` - Get available job roles

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## File Structure

```
client/                   # React frontend
├── pages/               # Page components
│   ├── student/         # Student-specific pages
│   ├── teacher/         # Teacher-specific pages
│   └── admin/           # Admin-specific pages
├── components/ui/       # Reusable UI components
├── lib/                 # Utility functions
└── contexts/            # React contexts

server/                  # Express backend
├── routes/              # API route handlers
└── index.ts            # Server entry point

shared/                  # Shared types and utilities
└── api.ts              # API type definitions
```

## Development

### Adding New Features

1. **Create new page components** in `client/pages/`
2. **Add API routes** in `server/routes/`
3. **Update navigation** in layout components
4. **Add types** in `shared/api.ts`

### PDF Generation

The application uses browser's print functionality for PDF generation:
- No external dependencies required
- Professional formatting with CSS
- Print-optimized layouts
- Works across all modern browsers

## Troubleshooting

### Common Issues

1. **Server not starting**
   - Check if port 8080 is available
   - Ensure all dependencies are installed

2. **API errors**
   - Verify server is running on port 8080
   - Check browser console for detailed error messages

3. **PDF not generating**
   - Ensure pop-ups are allowed in browser
   - Check if print dialog is blocked

### Getting Help

- Check browser console for error messages
- Verify all API endpoints are responding
- Ensure user is properly authenticated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

