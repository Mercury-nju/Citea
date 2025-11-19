# 🚀 Deployment Guide - Citea

Guide for deploying Citea to production.

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git
- A hosting platform account (Vercel, Netlify, etc.)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N
   - Project name: citea
   - Directory: ./
   - Override settings: N

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

#### Environment Variables
No environment variables needed! The Tongyi API key is already configured in the code.

### Option 2: Netlify

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy**
   ```bash
   netlify deploy
   ```

4. **Production deployment**
   ```bash
   netlify deploy --prod
   ```

### Option 3: Traditional VPS (Ubuntu)

#### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd citea

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "citea" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Configure Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name citea.com www.citea.com;

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

```bash
# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d citea.com -d www.citea.com
```

### Option 4: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  citea:
    build: .
    ports:
      - "3000:3000"
    restart: always
    environment:
      - NODE_ENV=production
```

#### Deploy with Docker

```bash
# Build image
docker build -t citea .

# Run container
docker run -d -p 3000:3000 --name citea citea

# Or use docker-compose
docker-compose up -d
```

## ⚙️ Configuration

### Build Settings

| Platform | Build Command | Output Directory | Install Command |
|----------|---------------|------------------|-----------------|
| Vercel   | `npm run build` | `.next` | `npm install` |
| Netlify  | `npm run build` | `.next` | `npm install` |

### Environment Variables

The Tongyi API key is hardcoded in the API routes. For production, consider moving it to environment variables:

1. Create `.env.local`:
   ```
   TONGYI_API_KEY=sk-9bf19547ddbd4be1a87a7a43cf251097
   ```

2. Update API routes to use:
   ```typescript
   const TONGYI_API_KEY = process.env.TONGYI_API_KEY
   ```

## 🔧 Performance Optimization

### 1. Enable Caching

Add caching headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ]
  },
}
```

### 2. Enable Compression

Most platforms enable this automatically, but for VPS:

```bash
# In nginx configuration
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 3. CDN Integration

For static assets, consider using a CDN:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network (automatic)

## 📊 Monitoring

### Application Monitoring

```bash
# PM2 monitoring (for VPS)
pm2 monit

# View logs
pm2 logs citea

# Check status
pm2 status
```

### Analytics

Consider adding:
- Google Analytics
- Plausible Analytics (privacy-focused)
- Vercel Analytics

## 🔒 Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] API keys in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Error handling in place

### Security Headers

Add to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ]
}
```

## 🚀 Deployment Checklist

Before deploying:

- [ ] Run `npm run build` successfully
- [ ] Test all features locally
- [ ] Check for console errors
- [ ] Verify API integrations work
- [ ] Test on mobile devices
- [ ] Check performance (Lighthouse)
- [ ] Update README with live URL
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure monitoring
- [ ] Test in production

## 🔄 Continuous Deployment

### GitHub Actions (Vercel)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Scaling

### Horizontal Scaling

For high traffic:

1. **Load Balancer**: Use Nginx or cloud load balancers
2. **Multiple Instances**: Run multiple app instances
3. **Database**: Add database for caching results
4. **Redis**: Cache API responses

### Vertical Scaling

- Increase server resources
- Optimize API calls
- Implement request caching
- Use edge functions

## 🐛 Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

1. Check server logs
2. Verify API keys
3. Check external API status
4. Review error tracking (Sentry)

### Performance Issues

1. Enable caching
2. Optimize images
3. Implement lazy loading
4. Use CDN

## 📞 Support

For deployment issues:
- 📧 Email: support@citea.com
- 📖 Check README.md
- 🐛 Open GitHub issue

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all features in production
2. ✅ Share the URL with users
3. ✅ Monitor performance
4. ✅ Set up analytics
5. ✅ Configure backups
6. ✅ Document any custom configurations

---

**Your Citea instance is now live! 🎊**

Remember: Keep all features free as per the Citea mission!

