# Deployment Guide - WebOS Simulator

## 🚀 Deployment Options

The WebOS Simulator is a static web application that can be deployed to any static hosting service.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Platforms

### 1. Vercel (Recommended) ⚡

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel
```

**Via GitHub:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel auto-detects Vite config
6. Deploy!

**Configuration**: No additional config needed - Vercel automatically detects Vite projects.

### 2. Netlify 🎯

**Via Netlify CLI:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

**Via Netlify UI:**
1. Push code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

**netlify.toml** (optional):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages 📄

**Setup:**
```bash
npm install --save-dev gh-pages
```

**Add to package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://{username}.github.io/{repo-name}"
}
```

**Update vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/{repo-name}/', // Add this line
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Deploy:**
```bash
npm run deploy
```

**Enable GitHub Pages:**
1. Go to your repository on GitHub
2. Settings → Pages
3. Source: `gh-pages` branch
4. Save

### 4. Cloudflare Pages ☁️

**Via Cloudflare Dashboard:**
1. Push code to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Create a new project
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Deploy!

**Via Wrangler CLI:**
```bash
npm install -g wrangler
npm run build
wrangler pages publish dist
```

### 5. Firebase Hosting 🔥

**Setup:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

**firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

### 6. AWS S3 + CloudFront 🪣

**Build and Upload:**
```bash
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache (if using)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**S3 Bucket Configuration:**
- Enable static website hosting
- Set index document: `index.html`
- Set error document: `index.html`
- Configure bucket policy for public read access

### 7. Azure Static Web Apps 🔷

**azure-static-web-apps.yml:**
```yaml
name: Azure Static Web Apps

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          app_location: "/"
          output_location: "dist"
          app_build_command: "npm run build"
```

## Environment Variables

This project doesn't require environment variables by default. However, if you add backend features, create a `.env` file:

```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=WebOS Simulator
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Performance Optimization

### Before Deploying

1. **Optimize Images**
   - Consider using a CDN for wallpaper images
   - Or use local optimized images in `public/` folder

2. **Analyze Bundle Size**
   ```bash
   npm run build
   # Check dist/assets/ folder sizes
   ```

3. **Enable Gzip/Brotli**
   - Most platforms enable this automatically
   - Cloudflare, Vercel, Netlify all support this

### After Deploying

1. **Test Performance**
   - Use Lighthouse in Chrome DevTools
   - Aim for 90+ performance score

2. **Monitor Bundle Size**
   - Vite shows gzipped sizes after build
   - Keep main bundle under 500KB

## Custom Domain Setup

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
- Dashboard → Domain settings → Add custom domain
- Update DNS to point to Netlify

### GitHub Pages
- Repository Settings → Pages → Custom domain
- Add CNAME record in DNS

### Cloudflare Pages
- Project Settings → Custom domains
- Add domain (DNS managed automatically)

## SSL/HTTPS

All recommended platforms provide free SSL certificates automatically:
- ✅ Vercel: Automatic SSL
- ✅ Netlify: Automatic SSL
- ✅ Cloudflare Pages: Automatic SSL
- ✅ GitHub Pages: Automatic SSL (for custom domains)
- ✅ Firebase Hosting: Automatic SSL

## Monitoring & Analytics

### Add Google Analytics

**Install:**
```bash
npm install react-ga4
```

**Add to App.tsx:**
```typescript
import ReactGA from 'react-ga4';

useEffect(() => {
  ReactGA.initialize('G-XXXXXXXXXX');
  ReactGA.send('pageview');
}, []);
```

### Platform Analytics
- Vercel: Built-in analytics
- Netlify: Analytics addon
- Cloudflare Pages: Web Analytics (free)

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Routes Not Working
Add a redirect rule for SPA routing:
- Netlify: `_redirects` file in `public/`
  ```
  /*    /index.html   200
  ```
- Vercel: Automatically handled
- Others: Check platform-specific SPA configuration

### IndexedDB Not Working
- Ensure HTTPS is enabled (required for IndexedDB in production)
- Check browser console for errors
- Some browsers require user interaction before IndexedDB access

## CI/CD Example (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## Cost Comparison

| Platform | Free Tier | Pricing |
|----------|-----------|---------|
| Vercel | ✅ Generous (100GB bandwidth) | $20+/month for Pro |
| Netlify | ✅ 100GB bandwidth | $19+/month for Pro |
| GitHub Pages | ✅ Unlimited (public repos) | Free for public |
| Cloudflare Pages | ✅ Unlimited bandwidth | Free for static sites |
| Firebase Hosting | ✅ 10GB bandwidth | Pay-as-you-go |

## Recommendation

**Best for Quick Deploy**: Vercel or Netlify (zero config, auto-detection)  
**Best for Free Hosting**: Cloudflare Pages (unlimited bandwidth)  
**Best for GitHub Projects**: GitHub Pages (tight integration)  
**Best for AWS Users**: S3 + CloudFront (full control)

---

Choose the platform that best fits your needs and follow the respective deployment steps above. All platforms provide excellent performance and reliability for the WebOS Simulator! 🚀

