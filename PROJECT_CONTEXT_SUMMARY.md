# DDS Portal - Project Context Summary for New Chat

## Project Overview

**DDS Portal** is a document distribution system with role-based access control, built using modern web technologies.

### Architecture

- **Backend**: Laravel 11+ (http://localhost:3001)
- **Frontend**: Next.js 14 with NextAuth.js (http://localhost:3000)
- **Database**: MySQL (localhost:3306, database: `dds_be`)
- **WebSocket**: Socket.IO (Port 3002) - **CURRENTLY DISABLED**

## ✅ CURRENT STATUS: FULLY FUNCTIONAL SYSTEM

### Core System (100% Complete)

- ✅ **Authentication**: Complete login/logout with JWT tokens
- ✅ **User Management**: RBAC with roles and permissions
- ✅ **Document Management**: Upload, tracking, distribution
- ✅ **Invoice Management**: Complete CRUD operations
- ✅ **Dashboard**: Statistics and recent activities
- ✅ **UI/UX**: Modern responsive design with dark mode

### Working Test Credentials

- `oman@gmail.com / 123456` (super-admin)
- `dadsdevteam@example.com / dds2024` (super-admin)
- `logistic@gmail.com / 123456` (logistic role)
- `prana@gmail.com / 123456` (accounting role)

## 🔧 RECENT MAJOR FIXES

### Login Issue Resolution ✅

**Was**: Users stuck on login page after successful authentication
**Fixed**: Added missing `NEXTAUTH_SECRET` environment variable
**Result**: Complete authentication flow now works perfectly

### Environment Configuration ✅

```bash
# Frontend (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-for-development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002

# Backend (.env)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dds_be
DB_USERNAME=root
DB_PASSWORD=password
```

## ❌ KNOWN ISSUES

### Notification System

**Issue**: Frontend notification API calls returning 404/authentication errors
**Status**: Backend API exists and works, frontend integration needs fixing
**Impact**: Non-blocking - core system fully functional

**Last Attempted Fixes**:

- Fixed authentication headers in notification service
- Updated API response parsing
- Still experiencing issues

## 🚀 DEVELOPMENT GUIDELINES

### Laravel 11+ Standards (CRITICAL)

- ✅ Single AppServiceProvider only
- ✅ Middleware registered in `bootstrap/app.php`
- ✅ Auto-listening Event Listeners
- ✅ Use `php artisan make:*` commands
- ✅ No unnecessary code comments
- ✅ No commented-out code (use Git history)

### Code Quality Rules

- ✅ TypeScript strict mode
- ✅ Proper error handling
- ✅ Alphabetical pivot table naming
- ✅ Clean, modern code structure

## 🔄 CURRENT DEVELOPMENT STATE

### What's Working Perfectly

- Complete user authentication and session management
- All CRUD operations for entities (invoices, users, roles, etc.)
- File upload and document management
- Route protection and middleware
- Dashboard with real-time statistics
- Responsive UI with dark mode theming
- Role-based permission system

### What Needs Attention

- Notification system frontend integration
- Minor UI polish and optimizations
- Performance improvements
- Production deployment preparation

## 🏗️ PROJECT STRUCTURE

```
dds-no-chat/
├── backend/           # Laravel 11+ API
├── frontend/          # Next.js 14 + NextAuth
├── socket-server/     # Socket.IO (disabled)
└── *.md              # Documentation files
```

### Key Directories

- `backend/app/Http/Controllers/` - API endpoints
- `backend/app/Models/` - Eloquent models
- `frontend/src/app/` - Next.js pages and API routes
- `frontend/src/components/` - Reusable UI components
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/lib/` - Utilities and configurations

## 🎯 IMMEDIATE DEVELOPMENT FOCUS

### Priority 1: Bug Fixes

- Fix notification system frontend integration
- Resolve any remaining authentication edge cases
- Polish error handling and user feedback

### Priority 2: Optimization

- Performance improvements
- Code cleanup and optimization
- Enhanced error messages

### Priority 3: Enhancement

- Additional features based on requirements
- UI/UX improvements
- Advanced reporting

## 💡 DEVELOPMENT TIPS

### Starting Development

1. Ensure backend server running: `cd backend && php artisan serve --port=3001`
2. Ensure frontend running: `cd frontend && npm run dev`
3. Database should be accessible at localhost:3306
4. Test login with any of the provided credentials

### Common Commands

```bash
# Laravel
php artisan make:controller SomeController
php artisan make:model SomeModel -m
php artisan migrate
php artisan test

# Next.js
npm run dev
npm run build
npm run test
```

### Debugging Authentication

- Check browser Network tab for 401/403 errors
- Verify `NEXTAUTH_SECRET` is set in frontend/.env.local
- Check browser cookies for session data
- Use browser dev tools to inspect JWT tokens

## 📋 TECHNICAL NOTES

### Database Schema

- Users with roles and permissions (many-to-many)
- Invoices with attachments and tracking
- Distributions with status tracking
- Notifications table (backend ready)
- User preferences for theming

### API Structure

- RESTful endpoints following Laravel conventions
- JWT authentication with Bearer tokens
- Consistent JSON response format
- Comprehensive error handling

### Frontend Architecture

- NextAuth.js for authentication
- Axios with interceptors for API calls
- React Query for data fetching (where implemented)
- Tailwind CSS with shadcn/ui components
- Dark mode with system preference detection

---

**Last Updated**: January 2025  
**System Status**: Core functionality 100% operational, minor notification issue pending
**Ready For**: Active development, feature additions, production preparation
