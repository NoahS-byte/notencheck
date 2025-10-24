# Cloud Storage Setup Instructions

## 1. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for project to be ready (2-3 minutes)

### Get API Keys
1. Go to Project Settings → API
2. Copy your `Project URL` and `anon public` key
3. Create `.env` file in your project root:

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Setup Database Schema
1. In Supabase Dashboard, go to SQL Editor
2. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create all tables and policies

### Create Admin User
1. In SQL Editor, run this to create admin user:

```sql
-- First, generate admin password hash (replace with actual values)
-- You'll need to run this in your app console to get the hash:
-- import { encryptPassword, generateSalt } from './src/utils/encryption'
-- const salt = generateSalt()
-- const hash = await encryptPassword('admin', salt)

UPDATE users 
SET password_hash = 'your-generated-hash',
    salt = 'your-generated-salt'
WHERE email = 'admin@notencheck.app';
```

## 2. Ubuntu Server Deployment

### Install Node.js and npm
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Install Nginx (Web Server)
```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Deploy Application
```bash
# Clone your repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Create production .env file
nano .env
# Add your Supabase credentials

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "notenrechner" -- run preview
pm2 save
```

### Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/notenrechner

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain
    
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/notenrechner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Setup SSL with Let's Encrypt (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Setup Firewall
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 3. Deployment Commands

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart PM2 process
pm2 restart notenrechner
```

### Monitor Application
```bash
# View logs
pm2 logs notenrechner

# Monitor processes
pm2 monit

# Check status
pm2 status
```

## 4. Backup Strategy

### Database Backup (Supabase)
- Supabase automatically backs up your database
- You can also export data from the Supabase dashboard
- For additional safety, use the app's built-in backup feature

### Application Backup
```bash
# Create backup script
nano backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/backups/notenrechner_$DATE.tar.gz /path/to/your/app
find /home/backups -name "notenrechner_*.tar.gz" -mtime +7 -delete

# Make executable and add to cron
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 5. Environment Variables

Required environment variables in `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Security Considerations

1. **Database Security**: Supabase handles security with Row Level Security (RLS)
2. **API Keys**: Never commit `.env` files to git
3. **HTTPS**: Always use SSL in production
4. **Firewall**: Only open necessary ports
5. **Updates**: Keep system and dependencies updated

## 7. Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (needs 16+)
2. **Database connection**: Verify Supabase URL and keys
3. **Permission errors**: Check file permissions and user ownership
4. **Port conflicts**: Ensure port 4173 is available

### Useful Commands:
```bash
# Check application logs
pm2 logs notenrechner

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
```

Your application will now have true cloud storage where users can access their profiles from any device!