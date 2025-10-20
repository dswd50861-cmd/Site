# Business Operations Management System

A modern, full-stack web application designed to help businesses organize and optimize their daily operations. Built with React, Node.js, Express, and PostgreSQL.

![Business Operations Management](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Functionality

- **📊 Dashboard Overview** - Visual summary of projects, tasks, payments, and analytics
- **✅ Task Management** - Create, assign, and track tasks with priorities and deadlines
- **👥 Customer Management** - Store contact info, order history, and payment status
- **💰 Payment Tracking** - Invoice management with automated payment reminders
- **📅 Calendar View** - Integrated calendar displaying tasks and appointments
- **📈 Analytics** - Performance metrics, workload insights, and payment flow charts
- **🔔 Automated Reminders** - Smart notifications for deadlines, payments, and meetings
- **🔐 Role-Based Access** - Secure authentication with Admin, Manager, Employee, and Accountant roles

### Technical Features

- **Responsive Design** - Mobile and desktop friendly interface
- **Real-time Updates** - Instant synchronization across all views
- **RESTful API** - Well-structured backend with comprehensive endpoints
- **Database Optimization** - Efficient PostgreSQL schema with indexes and triggers
- **Automated Jobs** - Cron-based reminder system for notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Calendar** - Calendar component
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks
- **Nodemailer** - Email notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd business-operations-management
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb business_ops_db

# Or using psql
psql -U postgres
CREATE DATABASE business_ops_db;
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your preferred editor

# Run database migrations
psql -U postgres -d business_ops_db -f migrations/schema.sql

# (Optional) Seed with demo data
psql -U postgres -d business_ops_db -f migrations/seed.sql

# Start the backend server
npm start

# For development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=business_ops_db

# JWT
JWT_SECRET=your_very_secure_random_secret_key_here
JWT_EXPIRES_IN=7d

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 👤 Demo Accounts

After running the seed script, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | password123 |
| Manager | manager@company.com | password123 |
| Employee | employee@company.com | password123 |
| Accountant | accountant@company.com | password123 |

## 📁 Project Structure

```
business-operations-management/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── dashboardController.js
│   │   ├── tasksController.js
│   │   ├── customersController.js
│   │   ├── invoicesController.js
│   │   ├── appointmentsController.js
│   │   └── projectsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── errorHandler.js      # Error handling
│   ├── migrations/
│   │   ├── schema.sql           # Database schema
│   │   └── seed.sql             # Demo data
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── ...
│   ├── services/
│   │   └── reminderService.js   # Automated reminders
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Main layout
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── CustomerModal.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Get overview statistics
- `GET /api/dashboard/activity` - Recent activity
- `GET /api/dashboard/deadlines` - Upcoming deadlines
- `GET /api/dashboard/payment-analytics` - Payment flow data

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/stats` - Customer statistics

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/payments` - Record payment

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🤖 Automated Features

The system includes several automated background jobs:

1. **Overdue Task Reminders** - Runs every hour
2. **Upcoming Task Deadlines** - Runs every 6 hours
3. **Overdue Invoice Notifications** - Runs daily at 9 AM
4. **Appointment Reminders** - Runs every 6 hours

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- SQL injection prevention
- CORS configuration
- Input validation
- Secure HTTP headers

## 📱 User Roles & Permissions

### Admin
- Full access to all features
- User management
- System configuration

### Manager
- Create and manage projects
- Assign tasks
- View all reports
- Manage customers and invoices

### Employee
- View assigned tasks
- Update task status
- Create appointments
- View customers

### Accountant
- Manage invoices and payments
- View financial reports
- Manage customer data
- Send payment reminders

## 🚢 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name business-ops-backend
   ```
3. Set up a reverse proxy with Nginx
4. Enable SSL/TLS with Let's Encrypt

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Your own server with Nginx

### Database

- Use PostgreSQL hosted service (AWS RDS, DigitalOcean, etc.)
- Enable automated backups
- Set up connection pooling
- Configure SSL connections

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify database exists
psql -U postgres -l | grep business_ops_db

# Test connection
psql -U postgres -d business_ops_db -c "SELECT 1;"
```

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port in .env
PORT=5001
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💡 Future Enhancements

- [ ] Email and SMS notifications via Twilio
- [ ] Google Calendar integration
- [ ] Stripe payment processing
- [ ] Export reports to PDF/Excel
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Document management
- [ ] Time tracking
- [ ] Recurring tasks and invoices

## 📧 Support

For support, email support@example.com or open an issue in the repository.

---

**Built with ❤️ for efficient business operations**
