# ============================================================
# CPU Collaboration Hub — Complete Setup & Deployment Guide
# ============================================================

## ─────────────────────────────────────────
## PART 1: RUN LOCALLY (Windows / Mac / Linux)
## ─────────────────────────────────────────

### Prerequisites
- Node.js v18+ installed → https://nodejs.org
- MongoDB Atlas account → https://mongodb.com/atlas
- Git (optional)

### Step 1 — Clone / Extract project
```
Unzip cpu-collab-hub.zip to any folder.
```

### Step 2 — Setup Backend
```bash
cd cpu-collab-hub/backend
npm install

# Create .env file
copy .env.example .env        # Windows
cp  .env.example .env         # Mac/Linux

# Edit .env and fill in your values:
#   MONGO_URI=mongodb+srv://...
#   JWT_SECRET=any_random_string_here
#   PORT=5000

# Start backend
npm run dev
# OR: node server.js
```

### Step 3 — Setup Frontend
```bash
cd cpu-collab-hub/frontend
npm install

# Create .env file
copy .env.example .env
# Edit .env:
#   REACT_APP_API_URL=http://localhost:5000/api

npm start
```

### Step 4 — Open in Browser
```
Frontend → http://localhost:3000
Backend  → http://localhost:5000/api/health
```

### Step 5 — Create First Admin User
After registering normally, open MongoDB Atlas:
1. Go to your cluster → Browse Collections
2. Find the `users` collection
3. Find your user document
4. Change `role: "student"` to `role: "admin"`
5. Save — now you have admin access at /admin

---

## ─────────────────────────────────────────
## PART 2: AWS DEPLOYMENT (PRODUCTION)
## ─────────────────────────────────────────

### Architecture
- Backend  → EC2 (Node.js + PM2 + Nginx)
- Frontend → S3 + CloudFront
- Database → MongoDB Atlas (cloud)

---

### STEP 1 — MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Create DB user (username + password)
4. Add IP: 0.0.0.0/0 (allow all — for EC2)
5. Copy connection string:
   mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/cpu-collab-hub

---

### STEP 2 — Launch EC2 Instance
1. AWS Console → EC2 → Launch Instance
2. Choose: Ubuntu 22.04 LTS (free tier)
3. Instance type: t2.micro (free tier)
4. Create / select key pair (.pem file)
5. Security Group — open these ports:
   - 22   (SSH)
   - 80   (HTTP)
   - 443  (HTTPS)
   - 5000 (API — optional, Nginx will proxy)
6. Launch instance

---

### STEP 3 — SSH into EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

### STEP 4 — Install Node.js & PM2 on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # should show v18.x
npm -v

# Install PM2 (process manager)
sudo npm install -g pm2
```

---

### STEP 5 — Upload Backend to EC2
```bash
# From your LOCAL machine (not EC2):
scp -i your-key.pem -r ./backend ubuntu@<EC2-IP>:/home/ubuntu/cpu-collab-hub-backend

# OR use git:
# git clone https://github.com/yourusername/cpu-collab-hub.git
```

---

### STEP 6 — Configure Backend on EC2
```bash
# On EC2:
cd /home/ubuntu/cpu-collab-hub-backend
npm install

# Create .env
nano .env
```
Paste into .env:
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.xxxx.mongodb.net/cpu-collab-hub
JWT_SECRET=super_secret_production_key_change_this
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

---

### STEP 7 — Start Backend with PM2
```bash
pm2 start server.js --name "cpu-collab-api"
pm2 startup          # auto-start on reboot
pm2 save
pm2 status           # check it's running
pm2 logs cpu-collab-api  # view logs
```

---

### STEP 8 — Install & Configure Nginx
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/cpu-collab
```

Paste this Nginx config:
```nginx
server {
    listen 80;
    server_name your-ec2-ip-or-domain.com;

    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cpu-collab /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### STEP 9 — Deploy Frontend to S3

#### Build React app:
```bash
# On your LOCAL machine:
cd frontend
# Edit .env → REACT_APP_API_URL=http://your-ec2-ip/api
npm run build
```

#### Create S3 Bucket:
1. AWS Console → S3 → Create Bucket
2. Name: `cpu-collab-hub-frontend` (must be unique)
3. Region: your preferred region
4. Uncheck "Block all public access"
5. Enable "Static website hosting"
   - Index: index.html
   - Error: index.html (for React Router)
6. Add bucket policy (replace BUCKET-NAME):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::BUCKET-NAME/*"
  }]
}
```
7. Upload entire `build/` folder contents to S3

---

### STEP 10 — Setup CloudFront (CDN + HTTPS)
1. AWS Console → CloudFront → Create Distribution
2. Origin domain: select your S3 bucket
3. Viewer protocol policy: Redirect HTTP to HTTPS
4. Default root object: index.html
5. Create distribution
6. Copy the CloudFront domain (xxxx.cloudfront.net)
7. Update backend .env → CLIENT_URL=https://xxxx.cloudfront.net

---

### STEP 11 — Enable HTTPS on EC2 with Certbot (if you have a domain)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run   # test auto-renewal
```

---

### STEP 12 — Final Environment Variables Summary

**Backend (.env on EC2):**
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_strong_random_secret
NODE_ENV=production
CLIENT_URL=https://xxxx.cloudfront.net
```

**Frontend (.env for build):**
```
REACT_APP_API_URL=https://yourdomain.com/api
```

---

## ─────────────────────────────────────────
## PART 3: CREATE ZIP (Windows)
## ─────────────────────────────────────────

### Option A: Windows File Explorer
1. Select the `cpu-collab-hub` folder
2. Right-click → "Send to" → "Compressed (zipped) folder"

### Option B: PowerShell
```powershell
Compress-Archive -Path .\cpu-collab-hub -DestinationPath cpu-collab-hub.zip
```

### Option C: Using 7-Zip (recommended)
1. Install 7-Zip from https://7-zip.org
2. Right-click folder → 7-Zip → "Add to cpu-collab-hub.zip"

### Important: Exclude node_modules before zipping!
```powershell
# Delete node_modules first (saves space)
Remove-Item -Recurse -Force .\cpu-collab-hub\backend\node_modules
Remove-Item -Recurse -Force .\cpu-collab-hub\frontend\node_modules
# Then zip
Compress-Archive -Path .\cpu-collab-hub -DestinationPath cpu-collab-hub.zip
```

---

## ─────────────────────────────────────────
## API ENDPOINTS REFERENCE
## ─────────────────────────────────────────

### Auth
POST   /api/auth/register     — Register new user
POST   /api/auth/login        — Login
GET    /api/auth/me           — Get current user (auth)

### Users
GET    /api/users             — List users (filter: ?search=&skill=)
GET    /api/users/:id         — Get user profile
PUT    /api/users/profile     — Update own profile (auth)

### Skill Posts
GET    /api/skills            — List posts (filter: ?search=&tag=)
POST   /api/skills            — Create post (auth)
PUT    /api/skills/:id/like   — Toggle like (auth)
POST   /api/skills/:id/comment — Add comment (auth)
DELETE /api/skills/:id        — Delete post (auth, owner/admin)

### Projects
GET    /api/projects          — List projects (filter: ?skill=&status=)
POST   /api/projects          — Create project (auth)
GET    /api/projects/mine     — My projects (auth)
POST   /api/projects/:id/apply — Apply to project (auth)
DELETE /api/projects/:id      — Delete project (auth, owner/admin)

### Internships
GET    /api/internships       — List internships (filter: ?search=&location=)
POST   /api/internships       — Post internship (auth)
GET    /api/internships/:id   — Get internship detail
POST   /api/internships/:id/apply — Apply (auth)

### Messages
GET    /api/messages          — Get my chat list (auth)
POST   /api/messages          — Send message (auth)
GET    /api/messages/:userId  — Get conversation (auth)

### Admin (admin role required)
GET    /api/admin/stats       — Dashboard stats
GET    /api/admin/users       — All users
PUT    /api/admin/users/:id/toggle — Toggle user active
DELETE /api/admin/posts/:id   — Delete any post

---

## ─────────────────────────────────────────
## FOLDER STRUCTURE
## ─────────────────────────────────────────

cpu-collab-hub/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── skillController.js
│   │   ├── projectController.js
│   │   ├── internshipController.js
│   │   ├── messageController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── SkillPost.js
│   │   ├── Project.js
│   │   ├── Internship.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── internshipRoutes.js
│   │   ├── messageRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/             ← profile images stored here
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── Navbar.js
    │   │       ├── Spinner.js
    │   │       └── EmptyState.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── SkillsPage.js
    │   │   ├── ProjectsPage.js
    │   │   ├── InternshipsPage.js
    │   │   ├── ProfilePage.js
    │   │   ├── UserProfilePage.js
    │   │   ├── MessagesPage.js
    │   │   ├── FindPartnersPage.js
    │   │   └── AdminPage.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
