# Angular Frontend for Boilerplate NodeJS

Simple Angular frontend application to interact with the Node.js backend API.

## Features

- ✅ User authentication (Login, Register)
- ✅ User management (List, View, Create, Update, Delete)
- ✅ Role management (Create, Read, Update, Delete)
- ✅ Project management (Create, Read, Update, Delete)
- ✅ User role assignment
- ✅ Pagination support
- ✅ JWT token authentication
- ✅ Route guards for protected routes
- ✅ Role-Based Access Control (RBAC) with UI visibility
- ✅ Error handling for invalid credentials

## Prerequisites

- Node.js 18+
- Angular CLI 17+
- Backend API running on `http://localhost:3001`

## Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL** (if different from default)
   
   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3001'  // Change if your backend runs on different port
   };
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/          # Route guards
│   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   └── services/        # Core services (Auth, User, Role, Project)
│   │   ├── features/
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── users/           # User management components
│   │   │   ├── roles/           # Role management components
│   │   │   └── projects/        # Project management components
│   │   ├── shared/
│   │   │   └── components/      # Shared components (Navbar)
│   │   ├── app.component.ts     # Root component
│   │   └── app.routes.ts        # Route configuration
│   ├── environments/            # Environment configuration
│   └── styles.css               # Global styles
└── package.json
```

## Usage

### Authentication

1. **Register a new user**
   - Navigate to `/register`
   - Fill in name, email, password
   - Optionally select roles
   - Click "Register"

2. **Login**
   - Navigate to `/login`
   - Enter email and password
   - Click "Login"
   - Token is stored in localStorage

### User Management

- **View all users**: Navigate to `/users` (Admin only)
- **Create user**: Click "Create New User" form on Users page (Admin only)
- **View user details**: Click "View" on any user
- **Update user**: Edit details in user detail page (Admin only)
- **Assign roles**: Select roles and click "Assign Selected Roles" (Admin only)
- **Delete user**: Click "Delete" button (Admin only)

### Role Management

- **View all roles**: Navigate to `/roles` (Admin only - link visible only to admins)
- **Create role**: Click "Create New Role" button (Admin only)
- **Edit role**: Click "Edit" on any role (Admin only)
- **Delete role**: Click "Delete" button (Admin only)

### Project Management

- **View all projects**: Navigate to `/projects` (Any authenticated user)
- **Create project**: Click "Create New Project" button (Admin or Manager only)
- **View project details**: Click "View" on any project (Any authenticated user)
- **Update project**: Edit details in project detail page (Admin or Manager only)
- **Delete project**: Click "Delete" button (Admin or Manager only)

## API Integration

All API calls are made through services in `src/app/core/services/`:

- `auth.service.ts` - Authentication endpoints
- `user.service.ts` - User management endpoints
- `role.service.ts` - Role management endpoints
- `project.service.ts` - Project management endpoints

## Authentication Flow

1. User logs in → Token and user info (including roles) stored in localStorage
2. HTTP interceptor adds token to all requests
3. Route guard checks authentication for protected routes
4. UI elements are shown/hidden based on user roles
5. User logs out → Token and user info removed from localStorage

## Role-Based UI Visibility

The frontend automatically shows/hides UI elements based on the logged-in user's roles:

### Navigation Bar
- **Users** link: Visible only to Admin
- **Roles** link: Visible only to Admin
- **Projects** link: Visible to all authenticated users

### User Management Page
- **Create User** form: Visible only to Admin
- **Delete** button: Visible only to Admin
- **Update/Role Assignment**: Available only to Admin in user detail page

### Project Management Page
- **Create Project** form: Visible to Admin and Manager
- **Delete** button: Visible to Admin and Manager
- **Update** button: Visible to Admin and Manager in project detail page

### Role Management Page
- Entire page accessible only to Admin (link hidden for non-admins)

## Error Handling

### Login Errors
- Invalid email or password: Displays error message "Invalid credentials" or the specific error from backend
- Network errors: Displays appropriate error message
- Form validation: Shows inline validation errors for email format and required fields

## Development

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your backend has CORS enabled for `http://localhost:4200`.

### API Connection Issues

- Verify backend is running on `http://localhost:3001`
- Check `environment.ts` has correct API URL
- Check browser console for error messages

### Authentication Issues

- Clear localStorage and try logging in again
- Verify token is being stored after login
- Check backend JWT configuration
