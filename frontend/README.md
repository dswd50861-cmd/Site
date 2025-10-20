# Business Operations Frontend

Modern React-based frontend for the Business Operations Management System, built with Vite, Tailwind CSS, and React Router.

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Recharts** - Charts and analytics
- **React Calendar** - Calendar component
- **React Toastify** - Toast notifications
- **Heroicons** - Icon library

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx              # Main app layout with sidebar
│   ├── PrivateRoute.jsx        # Protected route wrapper
│   ├── TaskModal.jsx           # Task create/edit modal
│   ├── CustomerModal.jsx       # Customer create/edit modal
│   ├── InvoiceModal.jsx        # Invoice create/edit modal
│   ├── PaymentModal.jsx        # Payment recording modal
│   ├── AppointmentModal.jsx    # Appointment create/edit modal
│   └── ProjectModal.jsx        # Project create/edit modal
│
├── context/
│   └── AuthContext.jsx         # Authentication state management
│
├── pages/
│   ├── Login.jsx               # Login page
│   ├── Register.jsx            # Registration page
│   ├── Dashboard.jsx           # Dashboard with stats
│   ├── Tasks.jsx               # Task management
│   ├── Customers.jsx           # Customer management
│   ├── Invoices.jsx            # Invoice management
│   ├── Appointments.jsx        # Appointment scheduling
│   ├── Projects.jsx            # Project management
│   ├── Calendar.jsx            # Calendar view
│   └── Profile.jsx             # User profile
│
├── App.jsx                     # Root component
├── main.jsx                    # Entry point
└── index.css                   # Global styles and Tailwind
```

## 🎨 Styling

### Tailwind Configuration

The project uses custom Tailwind configuration in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Custom blue color palette
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      }
    }
  }
}
```

### Custom CSS Classes

Defined in `src/index.css`:

```css
.btn              /* Base button */
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.btn-danger       /* Danger button */
.card             /* Card container */
.input            /* Input field */
.label            /* Form label */
.badge            /* Status badge */
```

## 🔐 Authentication

### Auth Context

The `AuthContext` provides:

```javascript
const { 
  user,           // Current user object
  login,          // Login function
  register,       // Registration function
  logout,         // Logout function
  loading,        // Loading state
  isAuthenticated // Boolean auth status
} = useAuth();
```

### Protected Routes

```jsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

## 🌐 API Integration

### Axios Configuration

Base URL is set via environment variable:

```javascript
// .env
VITE_API_URL=http://localhost:5000/api

// Usage
axios.get('/tasks')  // Calls http://localhost:5000/api/tasks
```

### Request Interceptor

JWT token is automatically included:

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## 📊 Features

### Dashboard

- Real-time statistics
- Payment analytics chart
- Task overview chart
- Upcoming deadlines
- Invoice summary

### Task Management

- Create/edit/delete tasks
- Filter by status and priority
- Assign to team members
- Set due dates and priorities
- Link to projects and customers

### Customer Management

- Store customer information
- Track total spent and outstanding balance
- Search functionality
- View customer statistics

### Invoice & Payment Tracking

- Create and manage invoices
- Record payments
- Track payment status
- Automatic status updates
- Filter by status

### Calendar View

- Visual task and appointment display
- Date selection
- Event indicators
- Detailed day view

## 🎨 UI Components

### Modals

All modals follow the same pattern:

```jsx
<Modal>
  <Header>
  <Form>
    <Fields>
    <Actions>
  </Form>
</Modal>
```

### Status Badges

```jsx
<span className="badge badge-pending">Pending</span>
<span className="badge badge-completed">Completed</span>
<span className="badge badge-overdue">Overdue</span>
```

### Priority Indicators

```jsx
<span className="badge badge-low">Low</span>
<span className="badge badge-high">High</span>
<span className="badge badge-urgent">Urgent</span>
```

## 📱 Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Features

- Hamburger menu
- Collapsible sidebar
- Touch-friendly buttons
- Scrollable tables
- Responsive grids

## 🔔 Notifications

Using React Toastify for user feedback:

```javascript
toast.success('Task created successfully');
toast.error('Failed to delete customer');
toast.info('Payment reminder sent');
```

## 🎯 Best Practices

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';

const Component = () => {
  // 1. State declarations
  const [data, setData] = useState([]);
  
  // 2. Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // 3. Handler functions
  const handleSubmit = () => {};
  
  // 4. Render
  return <div>...</div>;
};
```

### Error Handling

```javascript
try {
  await axios.post('/api/tasks', data);
  toast.success('Success');
} catch (error) {
  toast.error(error.response?.data?.error || 'Operation failed');
}
```

## 🚀 Performance

- Code splitting with React Router
- Lazy loading of routes
- Optimized re-renders
- Debounced search inputs
- Efficient state management

## 🏗️ Build

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Build output is in `dist/` directory.

## 🌍 Deployment

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_API_URL=https://your-api-url.com/api
```

### Vercel

```bash
vercel --prod
```

### Traditional Server

```bash
npm run build
# Copy dist/ folder to web server
# Configure Nginx/Apache to serve static files
```

## 🐛 Debugging

### Development Tools

- React Developer Tools
- Redux DevTools (if added)
- Network tab for API calls
- Console for errors

### Common Issues

**API calls fail:**
- Check VITE_API_URL in .env
- Verify backend is running
- Check CORS configuration

**Build fails:**
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all dependencies are installed

## 📝 Code Style

- Use functional components
- Prefer hooks over class components
- Follow React best practices
- Use Tailwind utilities over custom CSS
- Keep components small and focused

## 📄 License

MIT
