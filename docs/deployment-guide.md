# Deployment Guide

## Overview

ThinkNote can be deployed to multiple platforms. Vercel is the recommended choice for simplicity, but Docker and self-hosted options are also supported.

## Development Setup

### Prerequisites

- **Node.js:** 18.x or higher
- **npm:** 9.x or higher (comes with Node.js)
- **Git:** For version control
- **Code Editor:** VS Code, WebStorm, or similar

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/my-knowledge-base.git
cd my-knowledge-base
```

2. **Install dependencies**
```bash
npm install
```

3. **Verify TypeScript setup**
```bash
npx tsc --noEmit
```

4. **Run linting**
```bash
npm run lint
```

5. **Start development server**
```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Development Workflow

```bash
# Start dev server with hot reload
npm run dev

# Build for production locally
npm run build

# Test production build locally
npm run start

# Run linting
npm run lint

# Run linting and fix auto-fixable issues
npm run lint -- --fix
```

### Environment Variables (Local Development)

Create `.env.local` file in project root:

```bash
# Database (required for community publishing)
DATABASE_URL="postgresql://user:password@localhost:5432/thinknote"

# Authentication (required)
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Email Service (required for email verification)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@thinknote.com"

# Session Configuration (optional)
NEXTAUTH_URL="http://localhost:3000"

# Optional: Analytics, APIs, etc.
# NEXT_PUBLIC_API_URL=http://localhost:3000
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

**Important Notes:**
- `.env.local` should NOT be committed to git
- DATABASE_URL format: `postgresql://user:password@host:port/database`
- NEXTAUTH_SECRET: Generate with `openssl rand -base64 32`
- Gmail: Use app-specific password, not account password
- SMTP credentials must have write permission to send emails

### Database Setup (Local)

```bash
# Start PostgreSQL in Docker
npm run db:up

# Apply Prisma migrations
npm run db:push

# Verify database
npm run db:studio
# Opens http://localhost:5555 for visual inspection
```

## Build Process

### Building for Production

```bash
npm run build
```

This command:
1. Runs TypeScript type checking
2. Compiles Next.js application
3. Optimizes JavaScript bundles
4. Generates optimized CSS
5. Creates `.next` directory with production build

**Build Output:**
- `.next/` - Compiled application (do not modify manually)
- `public/` - Static assets (images, fonts, etc.)

**Build Time:** ~30-60 seconds (depending on content volume)

### Build Verification

```bash
# Test the production build locally
npm run start

# Visit http://localhost:3000 to verify
```

## Production Deployment

### Option 1: Vercel (Recommended)

Vercel is the company behind Next.js and provides seamless deployment.

#### Benefits
- ✅ Zero-configuration Next.js deployment
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN for fast delivery
- ✅ Automatic preview environments for pull requests
- ✅ Built-in analytics
- ✅ Environment variables management
- ✅ One-click rollbacks
- ✅ Free tier available for hobby projects

#### Setup Instructions

1. **Connect Repository**
   - Visit https://vercel.com
   - Sign up with GitHub account
   - Select repository to deploy
   - Authorize Vercel access to GitHub

2. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build` (default)
   - Output directory: `.next` (default)
   - Install command: `npm install` (default)

3. **Environment Variables**
   - Add any required environment variables in Vercel dashboard
   - Settings → Environment Variables
   - Variables are automatically injected during build

4. **Deploy**
   - Click "Deploy" button
   - Vercel starts build process
   - Once complete, access via `https://your-project.vercel.app`

5. **Configure Custom Domain (Optional)**
   - Settings → Domains
   - Add custom domain
   - Update DNS records as instructed
   - SSL certificate auto-generated

#### Automatic Deployments

After initial setup:
- Push to `main` branch → Production deployment
- Create pull request → Preview deployment
- Environment-specific deployments can be configured

#### Monitoring & Analytics

Vercel dashboard provides:
- Real-time logs
- Build analytics
- Performance metrics
- Error tracking
- Deployment history

#### Cost

| Usage | Cost |
|-------|------|
| Free tier | Up to 100 deployments/month, 50GB bandwidth |
| Pro tier | $20/month + overage charges |
| Enterprise | Custom pricing |

For a personal knowledge base, **free tier is usually sufficient**.

---

### Option 2: Docker Container Deployment

#### Build Docker Image

1. **Create Dockerfile** (if not exists):
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build Docker image**:
```bash
docker build -t my-knowledge-base:latest .
```

3. **Test locally**:
```bash
docker run -p 3000:3000 my-knowledge-base:latest
# Visit http://localhost:3000
```

#### Push to Docker Registry

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag my-knowledge-base:latest username/my-knowledge-base:latest

# Push image
docker push username/my-knowledge-base:latest
```

#### Deploy to Cloud Platforms

**AWS ECS:**
```bash
# Create ECR repository
aws ecr create-repository --repository-name my-knowledge-base

# Push to ECR
docker tag my-knowledge-base:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/my-knowledge-base:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/my-knowledge-base:latest

# Create ECS task definition and service
# (Use AWS Console or terraform)
```

**Google Cloud Run:**
```bash
# Deploy directly to Cloud Run
gcloud run deploy my-knowledge-base \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**DigitalOcean App Platform:**
1. Connect GitHub repository
2. Select Dockerfile
3. Configure environment
4. Deploy (auto-redeploys on push)

---

### Option 3: Self-Hosted Node.js

#### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- npm or yarn
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

#### Installation Steps

1. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install application**:
```bash
cd /opt
git clone https://github.com/yourusername/my-knowledge-base.git
cd my-knowledge-base
npm install
npm run build
```

3. **Create systemd service** (`/etc/systemd/system/thinknote.service`):
```ini
[Unit]
Description=ThinkNote Knowledge Base
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/my-knowledge-base
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

4. **Start service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable thinknote
sudo systemctl start thinknote
```

5. **Configure Nginx** (`/etc/nginx/sites-available/thinknote`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable Nginx site**:
```bash
sudo ln -s /etc/nginx/sites-available/thinknote /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Install SSL certificate** (Let's Encrypt):
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

#### Monitoring & Maintenance

```bash
# View logs
sudo journalctl -u thinknote -f

# Check service status
sudo systemctl status thinknote

# Update application
cd /opt/my-knowledge-base
git pull origin main
npm install
npm run build
sudo systemctl restart thinknote

# Monitor resources
htop
df -h
```

---

### Option 4: Static Export (Advanced)

For maximum simplicity with limitations:

1. **Update next.config.mjs**:
```javascript
const nextConfig = {
  output: 'export',
};
```

2. **Build static site**:
```bash
npm run build
```

Generates `out/` directory with static HTML files.

3. **Deploy to static host**:
   - GitHub Pages: `git push` to gh-pages branch
   - Netlify: Connect repository
   - AWS S3: Upload `out/` directory
   - Cloudflare Pages: Connect repository

#### Limitations of Static Export
- ❌ No server-side rendering (slower initial load)
- ❌ No API routes (search API won't work as dynamic)
- ❌ Client-side routing required
- ❌ No automatic locale detection

**Not recommended for production use of ThinkNote.**

---

## Docker Compose Setup

For local multi-service development:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./src/data:/app/src/data:ro
    restart: always

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
```

Run with:
```bash
docker-compose up -d
```

---

## Environment Variables

### Required Variables (Production)

```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Authentication
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=https://yourdomain.com

# Email Service (SMTP for verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Search service (future phase)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your-api-key

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Trusted Origins (for CORS if needed)
TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Using Environment Variables in Code

```typescript
// Accessible in server code
const dbUrl = process.env.DATABASE_URL;

// Accessible in client code (public only)
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

// Accessible in API routes
export async function GET(req: Request) {
  const secret = process.env.API_SECRET;
  // ...
}
```

---

## Deployment Checklist

Before deploying to production:

### Pre-Deployment
- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations completed (if applicable)
- [ ] SSL certificate obtained
- [ ] Domain configured

### Build & Testing
- [ ] Run `npm run build` successfully
- [ ] Test with `npm run start` locally
- [ ] Verify all routes working
- [ ] Check responsive design on mobile
- [ ] Test search functionality
- [ ] Verify language switching works

### Security
- [ ] No secrets in code or git
- [ ] Environment variables properly set
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies up-to-date (`npm audit`)
- [ ] XSS considerations reviewed

### Performance
- [ ] Page load time <2 seconds
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] Caching configured
- [ ] CDN enabled (if applicable)

### Monitoring
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring active
- [ ] Alerting configured

### Documentation
- [ ] Deployment steps documented
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide created
- [ ] Team trained on deployment process

---

## Troubleshooting

### Build Fails with "Cannot find module"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port 3000 Already in Use

```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### TypeScript Errors After Update

```bash
# Update TypeScript definitions
npm install --save-dev @types/node@latest
npm run build
```

### Markdown Not Rendering

- Check frontmatter format (must be valid YAML)
- Verify file is in correct locale directory
- Check markdown syntax for compatibility
- Review remark-gfm documentation

### Search Returns No Results

- Verify API route is accessible: `GET /[locale]/api/posts`
- Check browser console for fetch errors
- Verify posts are in correct directory structure
- Check locale parameter matches articles

### Performance Issues in Production

```bash
# Analyze bundle size
npm run build
npx next-bundle-analyzer

# Check CSS optimization
npm run build -- --analyze

# Monitor application
# Use Vercel dashboard or your monitoring tool
```

### 404 Errors on Routes

- Ensure locale prefix in URLs: `/en/topics/article-name`
- Check middleware configuration
- Verify route files exist in correct locations
- Check for typos in filenames

---

## Maintenance

### Regular Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Dependency updates | Monthly | `npm update` |
| Security audit | Monthly | `npm audit` |
| Log review | Weekly | Check platform logs |
| Backup | Weekly | Git commits (if self-hosted) |
| Performance review | Monthly | Check analytics |

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update major versions
npm install -g npm-check-updates
ncu -u
npm install

# Verify build
npm run build
```

### Scaling Considerations

As usage grows:

1. **First 1,000 MAU:** Current setup sufficient
2. **1,000-10,000 MAU:** Consider caching layer (Redis)
3. **10,000-100,000 MAU:** Add database, implement real search backend
4. **100,000+ MAU:** Microservices, database sharding, CDN optimization

---

## Cost Estimation

### Monthly Costs by Platform

| Platform | Basic Usage | Scaling |
|----------|------------|---------|
| **Vercel** | $0-50 | $50-500+ |
| **AWS ECS** | $20-100 | $100-1000+ |
| **DigitalOcean** | $5-40 | $40-500+ |
| **Self-Hosted** | $5-100 | $100-500+ |
| **GitHub Pages** | Free | Free (limited) |

### Cost Optimization Tips

1. Use free tier when available
2. Monitor bandwidth usage
3. Enable compression and caching
4. Use CDN for static assets
5. Right-size compute resources
6. Implement rate limiting if needed

---

## Disaster Recovery

### Backup Strategy

```bash
# GitHub (automatic)
git push origin main

# Manual backup (self-hosted)
tar -czf backup-$(date +%Y%m%d).tar.gz \
  src/data \
  public

# Database backup (when added)
pg_dump mydb > backup-$(date +%Y%m%d).sql
```

### Rollback Procedure

**Vercel:**
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

**Self-Hosted:**
```bash
cd /opt/my-knowledge-base
git revert <commit-hash>
npm install
npm run build
sudo systemctl restart thinknote
```

### Disaster Recovery Time

| Scenario | Recovery Time | Effort |
|----------|--------------|--------|
| Small bug | 15-30 min | Low |
| Major outage | 1-2 hours | Medium |
| Data loss | 1-4 hours | High |
| Complete rebuild | 4-8 hours | Very High |

---

## Further Help

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Docker Docs:** https://docs.docker.com/
- **Nginx Docs:** https://nginx.org/en/docs/
- **Project Issues:** GitHub Issues in repository

---

**Last Updated:** March 2026
