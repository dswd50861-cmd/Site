# Quick Start Guide

Get your Business Operations Management System up and running in minutes!

## ⚡ 5-Minute Setup

### Step 1: Database Setup (1 minute)

```bash
# Create PostgreSQL database
createdb business_ops_db

# Run migrations and seed data
cd backend
psql -U postgres -d business_ops_db -f migrations/schema.sql
psql -U postgres -d business_ops_db -f migrations/seed.sql
```

### Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=business_ops_db
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EOF

# Start server
npm start
```

Backend running at: http://localhost:5000 ✅

### Step 3: Frontend Setup (2 minutes)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend running at: http://localhost:3000 ✅

## 🎉 You're Ready!

Open your browser and navigate to: **http://localhost:3000**

### Demo Login Credentials

```
Admin:
  Email: admin@company.com
  Password: password123

Manager:
  Email: manager@company.com
  Password: password123

Employee:
  Email: employee@company.com
  Password: password123

Accountant:
  Email: accountant@company.com
  Password: password123
```

## 🎯 What You Can Do Now

### As Admin (admin@company.com)
✅ Create and manage users
✅ View all projects and tasks
✅ Access financial reports
✅ Configure system settings

### As Manager (manager@company.com)
✅ Create projects
✅ Assign tasks to team
✅ Manage customers
✅ Create invoices

### As Employee (employee@company.com)
✅ View assigned tasks
✅ Update task status
✅ Schedule appointments
✅ View customer information

### As Accountant (accountant@company.com)
✅ Manage invoices
✅ Record payments
✅ Send payment reminders
✅ View financial analytics

## 📋 Try These Features

1. **Dashboard**
   - View real-time statistics
   - Check upcoming deadlines
   - Monitor payment flow

2. **Create a Task**
   - Click "New Task" button
   - Fill in details
   - Assign to team member
   - Set priority and due date

3. **Add a Customer**
   - Navigate to Customers
   - Click "New Customer"
   - Enter contact details
   - Save and track interactions

4. **Create an Invoice**
   - Go to Invoices
   - Click "New Invoice"
   - Select customer
   - Enter amount and due date
   - Invoice number auto-generated!

5. **Record a Payment**
   - Find an invoice
   - Click "Pay" button
   - Enter payment details
   - System auto-updates status

6. **Schedule Meeting**
   - Visit Appointments
   - Click "New Appointment"
   - Set time and attendees
   - Get automated reminders

7. **View Calendar**
   - Navigate to Calendar
   - See all tasks & appointments
   - Click dates for details

## 🔧 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### npm install Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 🚀 Next Steps

1. **Explore Features**
   - Try creating tasks, customers, and invoices
   - Test the calendar view
   - Check automated reminders

2. **Customize**
   - Update company logo
   - Modify color scheme in `tailwind.config.js`
   - Add custom fields to forms

3. **Production Deployment**
   - Set up production database
   - Configure environment variables
   - Deploy backend to cloud service
   - Deploy frontend to Netlify/Vercel

## 📚 Learn More

- [Full Documentation](README.md)
- [Backend API Guide](backend/README.md)
- [Frontend Guide](frontend/README.md)

## 💡 Tips

- **Regular Backups**: Set up automated database backups
- **Email Notifications**: Configure EMAIL_* variables for reminders
- **Security**: Change JWT_SECRET before production
- **Performance**: Enable database indexes for large datasets
- **Monitoring**: Use PM2 for process management in production

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review API endpoints in backend README
- Look at component examples in frontend README
- Open an issue for bugs or feature requests

---

**Happy Managing! 🎊**

Your business operations just got a whole lot easier!
