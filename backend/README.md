# Business Operations Backend API

RESTful API built with Node.js, Express, and PostgreSQL for the Business Operations Management System.

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- PostgreSQL v12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials

# Run database migrations
psql -U postgres -d business_ops_db -f migrations/schema.sql

# Seed demo data (optional)
psql -U postgres -d business_ops_db -f migrations/seed.sql

# Start development server
npm run dev

# Start production server
npm start
```

## 📋 Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=business_ops_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Schema

### Tables

- **users** - User accounts with role-based access
- **projects** - Project management
- **customers** - Customer information
- **tasks** - Task tracking and assignments
- **invoices** - Invoice management
- **payments** - Payment records
- **appointments** - Meeting scheduling
- **notifications** - In-app notifications
- **activity_logs** - Audit trail

## 🔐 Authentication

API uses JWT (JSON Web Tokens) for authentication.

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

### Protected Routes

Include JWT token in Authorization header:

```bash
Authorization: Bearer <token>
```

## 📚 API Documentation

### Tasks

```bash
# Get all tasks
GET /api/tasks?status=pending&priority=high

# Create task
POST /api/tasks
{
  "title": "Complete project proposal",
  "description": "Write and submit proposal",
  "priority": "high",
  "dueDate": "2024-12-31",
  "assignedTo": "user-uuid"
}

# Update task
PUT /api/tasks/:id
{
  "status": "completed"
}

# Delete task
DELETE /api/tasks/:id
```

### Invoices

```bash
# Get all invoices
GET /api/invoices?status=pending

# Create invoice
POST /api/invoices
{
  "customerId": "customer-uuid",
  "amount": 1000.00,
  "tax": 80.00,
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-31"
}

# Record payment
POST /api/invoices/:id/payments
{
  "amount": 1080.00,
  "paymentDate": "2024-01-15",
  "paymentMethod": "bank_transfer"
}
```

## 🤖 Automated Jobs

### Reminder Service

Located in `services/reminderService.js`, handles:

- Overdue task reminders (hourly)
- Upcoming task deadlines (every 6 hours)
- Overdue invoice notifications (daily at 9 AM)
- Appointment reminders (every 6 hours)

### Cron Schedules

```javascript
'0 * * * *'      // Every hour
'0 */6 * * *'    // Every 6 hours
'0 9 * * *'      // Daily at 9 AM
```

## 🔧 Scripts

```bash
npm start       # Start production server
npm run dev     # Start with nodemon (auto-reload)
npm run migrate # Run database migrations
```

## 🐛 Error Handling

API returns consistent error responses:

```json
{
  "error": "Error message here",
  "details": {} // Optional additional information
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📊 Database Optimization

- Indexes on frequently queried columns
- Foreign key constraints
- Automatic timestamp updates with triggers
- Connection pooling for performance

## 🔒 Security

- Password hashing with bcrypt (10 rounds)
- JWT token expiration
- SQL injection prevention (parameterized queries)
- CORS enabled for frontend URL
- Rate limiting (recommended for production)

## 📝 Logging

Server logs include:

- Request method and path
- Timestamp
- Error details
- Database queries (development mode)

## 🚀 Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name business-ops-api
pm2 save
pm2 startup
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production database
4. Enable SSL for database connections
5. Set up monitoring and logging
6. Configure firewall rules

## 📧 Email Configuration

For Gmail:

1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password in EMAIL_PASSWORD

For other providers:

- Update EMAIL_HOST and EMAIL_PORT
- Ensure SMTP credentials are correct

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📄 License

MIT
