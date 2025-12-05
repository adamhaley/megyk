# GoTrue Configuration Reference for Self-Hosted Supabase

Quick reference for configuring email templates in your self-hosted Supabase GoTrue instance.

## Required Environment Variables

Add these to your GoTrue configuration (docker-compose.yml, .env, or GoTrue config file):

```bash
# Site URL - default/fallback
GOTRUE_SITE_URL=https://megyk.com

# Allow both apps to use auth
GOTRUE_URI_ALLOW_LIST=https://megyk.com/*,https://dashboard.megyk.com/*,http://localhost:3000/*

# Email template paths (adjust paths based on your mount point)
GOTRUE_MAILER_TEMPLATES_RECOVERY=/templates/recovery.html
GOTRUE_MAILER_TEMPLATES_CONFIRMATION=/templates/confirmation.html
GOTRUE_MAILER_TEMPLATES_INVITE=/templates/invite.html
GOTRUE_MAILER_TEMPLATES_MAGIC_LINK=/templates/magic_link.html

# SMTP Configuration
GOTRUE_SMTP_HOST=smtp.sendgrid.net
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=apikey
GOTRUE_SMTP_PASS=your-sendgrid-api-key
GOTRUE_SMTP_ADMIN_EMAIL=noreply@megyk.com
GOTRUE_SMTP_SENDER_NAME=Megyk

# Email settings
GOTRUE_MAILER_AUTOCONFIRM=false
GOTRUE_EXTERNAL_EMAIL_ENABLED=true
```

## Docker Compose Example

```yaml
version: '3.8'
services:
  auth:
    image: supabase/gotrue:latest
    ports:
      - "9999:9999"
    environment:
      GOTRUE_SITE_URL: https://megyk.com
      GOTRUE_URI_ALLOW_LIST: "https://megyk.com/*,https://dashboard.megyk.com/*"
      
      # Database
      GOTRUE_DB_DRIVER: postgres
      DATABASE_URL: postgres://postgres:postgres@db:5432/postgres
      
      # JWT
      GOTRUE_JWT_SECRET: your-jwt-secret
      GOTRUE_JWT_EXP: 3600
      
      # Email templates
      GOTRUE_MAILER_TEMPLATES_RECOVERY: /templates/recovery.html
      GOTRUE_MAILER_TEMPLATES_CONFIRMATION: /templates/confirmation.html
      GOTRUE_MAILER_TEMPLATES_INVITE: /templates/invite.html
      GOTRUE_MAILER_TEMPLATES_MAGIC_LINK: /templates/magic_link.html
      
      # SMTP
      GOTRUE_SMTP_HOST: ${SMTP_HOST}
      GOTRUE_SMTP_PORT: ${SMTP_PORT}
      GOTRUE_SMTP_USER: ${SMTP_USER}
      GOTRUE_SMTP_PASS: ${SMTP_PASS}
      GOTRUE_SMTP_ADMIN_EMAIL: noreply@megyk.com
      
    volumes:
      - ./supabase/templates:/templates:ro
    depends_on:
      - db
```

## Testing the Configuration

### 1. Check GoTrue is loading templates

```bash
# View GoTrue logs
docker-compose logs -f auth | grep -i template

# Should see something like:
# "Loading template from /templates/recovery.html"
```

### 2. Test password reset from dashboard

```bash
# From dashboard.megyk.com, trigger password reset
# Check the email - link should be:
# https://dashboard.megyk.com/reset-password?token=...

# From megyk.com, trigger password reset  
# Link should be:
# https://megyk.com/reset-password?token=...
```

### 3. Check template rendering

```bash
# Send test email via GoTrue API
curl -X POST http://localhost:9999/recover \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{
    "email": "test@example.com",
    "redirect_to": "https://dashboard.megyk.com/reset-password"
  }'
```

## Common Issues

### Templates not loading

**Symptom**: Emails use default text-only format

**Solution**:
1. Check volume mount: `docker-compose exec auth ls -la /templates`
2. Verify file permissions: Templates must be readable by GoTrue
3. Check GoTrue logs for template loading errors

### URLs still hardcoded to wrong domain

**Symptom**: Emails always link to megyk.com even from dashboard

**Solution**:
1. Verify templates use `{{ .ConfirmationURL }}` not hardcoded URLs
2. Check `GOTRUE_URI_ALLOW_LIST` includes dashboard domain
3. Ensure app passes `redirectTo` parameter correctly

### SMTP errors

**Symptom**: Emails not sending

**Solution**:
1. Verify SMTP credentials
2. Check SMTP host allows connections from your server
3. Review GoTrue logs: `docker-compose logs auth | grep -i smtp`

## Available Template Variables

Use these in your HTML templates:

- `{{ .ConfirmationURL }}` - Full confirmation/reset URL (RECOMMENDED)
- `{{ .Token }}` - Raw authentication token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Configured site URL
- `{{ .Email }}` - User's email address
- `{{ .Data }}` - Custom user metadata
- `{{ .RedirectTo }}` - The redirect URL passed by the app

## Production Checklist

- [ ] Email templates mounted and readable
- [ ] `GOTRUE_URI_ALLOW_LIST` includes all app domains
- [ ] SMTP credentials configured and tested
- [ ] Templates use `{{ .ConfirmationURL }}` not hardcoded URLs
- [ ] Password reset tested from dashboard app
- [ ] Email confirmation tested (if enabled)
- [ ] Links in emails verified to use correct domain
- [ ] SSL/TLS enabled for production domains

## Further Reading

- [GoTrue Configuration Docs](https://github.com/supabase/gotrue#configuration)
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [GoTrue Email Templates](https://github.com/supabase/gotrue#email-templates)

