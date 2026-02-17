# MongoDB Setup Guide for AAES

## Overview
This guide covers MongoDB installation, configuration, and setup for the AAES project.

## Installation

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)
1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create Cluster**:
   - Choose Free tier (M0) for development
   - Select your preferred cloud provider and region
   - Click "Create Cluster"
3. **Create Database User**:
   - Navigate to Database Access
   - Add new database user with password authentication
   - Save username and password securely
4. **Whitelist IP Address**:
   - Navigate to Network Access
   - Add IP Address (use `0.0.0.0/0` for development, specific IPs for production)
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### Option 2: Local MongoDB (Development)
**Windows:**
```bash
# Download installer from https://www.mongodb.com/try/download/community
# Run installer and follow prompts
# MongoDB will be available at mongodb://localhost:27017
```

**Linux:**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## Configuration

### Backend Environment Variables
Create `.env` file in `/backend` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/aaes
# OR for Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/aaes?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_very_secure_random_secret_key_here_change_in_production

# AI Service (optional)
PYTHON_SERVICE_URL=http://localhost:8000
```

**IMPORTANT**: Replace `<username>` and `<password>` with your actual credentials for Atlas.

### Connection Code
The backend should already have connection logic in `server.js`:

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));
```

## Database Structure
The AAES project uses the following collections:
- `users` - All user accounts (Admin, HOD, Staff, Student)
- `departments` - Department information
- `subjects` - Subject/Course definitions
- `assignments` - Assignment metadata
- `submissions` - Student submissions and grades

## Initial Data Seeding

### Create Admin User
```javascript
// Run this script: backend/scripts/seedAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

async function seedAdmin() {
    const admin = await User.create({
        username: 'admin',
        email: 'admin@aaes.edu',
        password: 'admin123', // Change immediately after first login
        role: 'admin',
        department: 'Administration'
    });
    console.log('Admin created:', admin.email);
    process.exit(0);
}

seedAdmin();
```

Run: `node backend/scripts/seedAdmin.js`

### Sample Department Data
```javascript
// backend/scripts/seedDepartments.js
const Department = require('../models/Department');

const departments = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Electronics', code: 'EC' },
    { name: 'Mechanical', code: 'ME' },
    { name: 'Civil', code: 'CV' }
];

async function seedDepartments() {
    await Department.insertMany(departments);
    console.log('Departments seeded');
    process.exit(0);
}
```

## Backup and Restore

### Backup Database
```bash
# Local MongoDB
mongodump --db aaes --out ./backups/$(date +%Y%m%d)

# MongoDB Atlas
mongodump --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/aaes" --out ./backups/$(date +%Y%m%d)
```

### Restore Database
```bash
# Local MongoDB
mongorestore --db aaes ./backups/20240101/aaes

# MongoDB Atlas
mongorestore --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/aaes" ./backups/20240101/aaes
```

## Verification

### Check Connection
```bash
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✓ Connected')).catch(err => console.error('✗ Error:', err));"
```

### View Data
Use MongoDB Compass (GUI tool):
1. Download from https://www.mongodb.com/try/download/compass
2. Connect using your connection string
3. Browse collections and documents

## Troubleshooting

### Connection Refused
- Check if MongoDB service is running: `sudo systemctl status mongod`
- Verify connection string is correct
- Check firewall settings

### Authentication Failed
- Verify username and password
- Check database user permissions in Atlas
- Ensure IP is whitelisted

### Slow Queries
- Add indexes for frequently queried fields
- Monitor with MongoDB Atlas performance insights
- Use `explain()` to analyze query performance

## Production Best Practices

1. **Security**:
   - Use strong passwords
   - Enable SSL/TLS
   - Restrict IP access
   - Regular security audits

2. **Performance**:
   - Create indexes on commonly queried fields
   - Use connection pooling
   - Monitor query performance

3. **Backup**:
   - Automated daily backups
   - Test restore procedures regularly
   - Keep backups in multiple locations

4. **Monitoring**:
   - Set up alerts for connection failures
   - Monitor disk space
   - Track query performance

## Next Steps
1. Update `.env` with your MongoDB connection string
2. Run seed scripts to create initial data
3. Test connection using verification script
4. Start backend server: `npm run dev`
