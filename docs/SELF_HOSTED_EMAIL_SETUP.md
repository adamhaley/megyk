# Self-Hosted Supabase - Multi-App Email Configuration

## Your Setup
- **Self-hosted Supabase** instance
- **Multiple apps** using the same instance:
  - Main app: `megyk.com`
  - Dashboard: `dashboard.megyk.com`
- Need separate email configurations per app

## Solution: Dynamic Email Templates

The templates now use `{{ .ConfirmationURL }}` which Supabase/GoTrue automatically generates based on the `redirectTo` parameter your app provides.

### How It Works

1. **Your app** calls `resetPasswordForEmail` with `redirectTo`:
   ```typescript
   // src/app/login/page.tsx
   supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${window.location.origin}/reset-password`
   })
   ```

2. **GoTrue** (Supabase Auth) receives the request with:
   - Email address
   - `redirectTo: https://dashboard.megyk.com/reset-password`

3. **GoTrue** generates `{{ .ConfirmationURL }}` which includes:
   - Your `redirectTo` URL
   - The auth token
   - All necessary query parameters

4. **Email template** uses `{{ .ConfirmationURL }}` dynamically, so:
   - Emails from dashboard → link to dashboard.megyk.com
   - Emails from main app → link to megyk.com

## Configuration Steps

### 1. Update GoTrue Configuration

Your self-hosted Supabase GoTrue config needs to allow both domains. Find your GoTrue configuration file (usually `docker-compose.yml` or `kong.yml` or a separate GoTrue config):

```yaml
# Example docker-compose.yml or GoTrue environment config
GOTRUE_SITE_URL: "https://megyk.com"  # Default/fallback
GOTRUE_URI_ALLOW_LIST: "https://megyk.com,https://dashboard.megyk.com,https://megyk.com/**,https://dashboard.megyk.com/**"
GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"

# Email template paths
GOTRUE_MAILER_TEMPLATES_RECOVERY: "/path/to/supabase/templates/recovery.html"
GOTRUE_MAILER_TEMPLATES_CONFIRMATION: "/path/to/supabase/templates/confirmation.html"
GOTRUE_MAILER_TEMPLATES_INVITE: "/path/to/supabase/templates/invite.html"
GOTRUE_MAILER_TEMPLATES_MAGIC_LINK: "/path/to/supabase/templates/magic_link.html"
```

### 2. Mount Template Directory

If using Docker, ensure the templates directory is mounted:

```yaml
# docker-compose.yml
services:
  auth:
    # ... other config
    volumes:
      - ./supabase/templates:/templates:ro
    environment:
      GOTRUE_MAILER_TEMPLATES_RECOVERY: /templates/recovery.html
      GOTRUE_MAILER_TEMPLATES_CONFIRMATION: /templates/confirmation.html
```

### 3. Configure Allowed Redirect URLs

Update your GoTrue config to allow both domains:

```yaml
GOTRUE_URI_ALLOW_LIST: >-
  https://megyk.com/*,
  https://dashboard.megyk.com/*,
  http://localhost:3000/*,
  http://127.0.0.1:3000/*
```

### 4. SMTP Configuration (if not already set)

```yaml
# SMTP settings for sending emails
GOTRUE_SMTP_HOST: "smtp.sendgrid.net"  # or your SMTP server
GOTRUE_SMTP_PORT: "587"
GOTRUE_SMTP_USER: "apikey"
GOTRUE_SMTP_PASS: "your-api-key"
GOTRUE_SMTP_ADMIN_EMAIL: "noreply@megyk.com"
GOTRUE_MAILER_AUTOCONFIRM: "false"
```

## Alternative: Per-Domain Email Templates

If you want **completely different email designs** for each app, you can:

### Option A: Use Request Headers

Modify your Supabase Auth to detect which app made the request and use different templates. This requires custom GoTrue modifications.

### Option B: Proxy Pattern

Create API routes in each app that customize the email:

```typescript
// dashboard.megyk.com/api/send-reset-email/route.ts
export async function POST(request: Request) {
  const { email } = await request.json()
  
  // Send custom email via your own SMTP
  await sendEmail({
    to: email,
    subject: 'Reset Password - Megyk Dashboard',
    template: 'dashboard-recovery',
    // ... custom template for dashboard
  })
}
```

Then use this instead of `supabase.auth.resetPasswordForEmail()`.

### Option C: Multiple GoTrue Instances

Run separate GoTrue instances for each app:

```yaml
# docker-compose.yml
services:
  auth-main:
    image: supabase/gotrue
    environment:
      GOTRUE_SITE_URL: "https://megyk.com"
      GOTRUE_MAILER_TEMPLATES_RECOVERY: /templates/main/recovery.html
    ports:
      - "9999:9999"
  
  auth-dashboard:
    image: supabase/gotrue
    environment:
      GOTRUE_SITE_URL: "https://dashboard.megyk.com"
      GOTRUE_MAILER_TEMPLATES_RECOVERY: /templates/dashboard/recovery.html
    ports:
      - "9998:9999"
```

Then use different `NEXT_PUBLIC_SUPABASE_URL` for each app.

## Recommended Approach: Use .ConfirmationURL (Current Implementation)

✅ **Simplest and most maintainable**
✅ **Works with single GoTrue instance**
✅ **Automatic per-app URLs**
✅ **No code changes needed**

The templates have been updated to use `{{ .ConfirmationURL }}` which automatically:
- Uses the `redirectTo` URL from your app
- Adds the correct token
- Works for all apps using the same Supabase instance

## Testing

### 1. Local Testing

```bash
# Start your self-hosted Supabase
docker-compose up -d

# Check GoTrue logs to verify template loading
docker-compose logs -f auth

# Test from dashboard app
curl -X POST http://localhost:9999/recover \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "redirect_to": "https://dashboard.megyk.com/reset-password"
  }'
```

### 2. Verify Email Content

Check your email (or email testing tool) to confirm:
- ✅ Link points to `https://dashboard.megyk.com/reset-password?token=...`
- ✅ Not hardcoded to a specific domain
- ✅ Includes proper token and parameters

## Troubleshooting

### Issue: Emails still point to wrong domain
**Solution**: Verify `GOTRUE_URI_ALLOW_LIST` includes both domains

### Issue: Template not loading
**Solution**: Check template path is correctly mounted and accessible to GoTrue container

### Issue: `{{ .ConfirmationURL }}` shows as plain text
**Solution**: Ensure GoTrue template rendering is enabled and templates are in correct format

## Configuration File Locations

Common locations for self-hosted Supabase config:
- `docker-compose.yml` - Environment variables
- `volumes/auth/config.json` - GoTrue config file
- `kong.yml` - API gateway config
- `.env` - Environment variables

## Need Different Branding Per App?

If you need completely different email designs (colors, logos, etc.) for each app, consider:

1. **Option 1**: Create a custom email service that both apps use
2. **Option 2**: Run multiple GoTrue instances (one per app)
3. **Option 3**: Use dynamic templates with conditional logic based on domain

Let me know which approach fits your needs best!

