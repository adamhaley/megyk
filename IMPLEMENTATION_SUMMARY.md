# Email Templates Implementation Summary

## ✅ What's Been Set Up

### 1. Email Templates Created (`supabase/templates/`)
- ✅ `recovery.html` - Password reset emails
- ✅ `confirmation.html` - Email confirmation for signups
- ✅ `invite.html` - User invitation emails
- ✅ `magic_link.html` - Passwordless login emails

**Key Feature**: All templates use `{{ .ConfirmationURL }}` which dynamically generates URLs based on the `redirectTo` parameter your app provides.

### 2. Local Configuration Updated
- ✅ `supabase/config.toml` - Configured to use custom templates for local development

### 3. Documentation Created
- ✅ `SELF_HOSTED_EMAIL_SETUP.md` - Complete guide for self-hosted Supabase
- ✅ `GOTRUE_CONFIG_REFERENCE.md` - GoTrue environment variable reference
- ✅ `EMAIL_SETUP_GUIDE.md` - For Supabase Cloud (if needed later)
- ✅ `supabase/templates/README.md` - Template documentation

## 🎯 How It Works

### Multi-App Email Flow

1. **User triggers password reset** on `dashboard.megyk.com`
   ```typescript
   supabase.auth.resetPasswordForEmail(email, {
     redirectTo: 'https://dashboard.megyk.com/reset-password'
   })
   ```

2. **GoTrue receives request** with:
   - Email address
   - `redirectTo: https://dashboard.megyk.com/reset-password`

3. **GoTrue generates `{{ .ConfirmationURL }}`**:
   - Base: `https://dashboard.megyk.com/reset-password`
   - Adds: `?token=xyz&type=recovery`
   - Result: `https://dashboard.megyk.com/reset-password?token=xyz&type=recovery`

4. **Email sent** with dynamic link pointing to dashboard

5. **Same flow for main app** - but links point to `megyk.com`

## 🚀 Next Steps - Production Deployment

### Step 1: Configure GoTrue

Add these environment variables to your self-hosted Supabase GoTrue configuration:

```bash
# Allow both domains
GOTRUE_URI_ALLOW_LIST=https://megyk.com/*,https://dashboard.megyk.com/*

# Email template paths
GOTRUE_MAILER_TEMPLATES_RECOVERY=/templates/recovery.html
GOTRUE_MAILER_TEMPLATES_CONFIRMATION=/templates/confirmation.html
GOTRUE_MAILER_TEMPLATES_INVITE=/templates/invite.html
GOTRUE_MAILER_TEMPLATES_MAGIC_LINK=/templates/magic_link.html

# SMTP (if not already configured)
GOTRUE_SMTP_HOST=your-smtp-host
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=your-smtp-user
GOTRUE_SMTP_PASS=your-smtp-password
GOTRUE_SMTP_ADMIN_EMAIL=noreply@megyk.com
```

### Step 2: Mount Templates Directory

Ensure the templates directory is accessible to GoTrue:

**If using Docker**:
```yaml
volumes:
  - ./supabase/templates:/templates:ro
```

### Step 3: Restart GoTrue

```bash
docker-compose restart auth
# or
systemctl restart gotrue
```

### Step 4: Test

1. Go to `https://dashboard.megyk.com/login`
2. Click "Forgot password?"
3. Enter your email
4. Check email - link should point to `https://dashboard.megyk.com/reset-password?token=...`

## 📁 File Structure

```
megyk/
├── supabase/
│   ├── config.toml (updated)
│   ├── templates/
│   │   ├── recovery.html ✨
│   │   ├── confirmation.html ✨
│   │   ├── invite.html ✨
│   │   ├── magic_link.html ✨
│   │   └── README.md
│   └── GOTRUE_CONFIG_REFERENCE.md ✨
├── SELF_HOSTED_EMAIL_SETUP.md ✨
├── EMAIL_SETUP_GUIDE.md (updated)
└── IMPLEMENTATION_SUMMARY.md (this file)
```

## 🔍 Verification Checklist

After deploying to production:

- [ ] GoTrue configuration updated with template paths
- [ ] `GOTRUE_URI_ALLOW_LIST` includes both domains
- [ ] Templates directory mounted and accessible
- [ ] GoTrue restarted
- [ ] Password reset tested from `dashboard.megyk.com`
- [ ] Email received with correct `dashboard.megyk.com` link
- [ ] Password reset tested from `megyk.com` (if applicable)
- [ ] Email received with correct `megyk.com` link
- [ ] Links are clickable and work correctly
- [ ] Token validation works on reset password page

## 💡 Key Advantages of This Solution

✅ **Single Supabase Instance** - No need for multiple GoTrue instances
✅ **Dynamic URLs** - Automatically uses the correct domain per app
✅ **No Code Changes** - Works with existing `resetPasswordForEmail()` calls
✅ **Scalable** - Easy to add more apps in the future
✅ **Maintainable** - Single set of templates with dynamic content

## 🛠️ Troubleshooting

**Issue**: Emails still show wrong domain
- Verify templates use `{{ .ConfirmationURL }}` not hardcoded URLs
- Check `GOTRUE_URI_ALLOW_LIST` includes both domains
- Restart GoTrue after config changes

**Issue**: No emails being sent
- Check SMTP configuration
- Review GoTrue logs: `docker-compose logs auth`
- Test SMTP credentials separately

**Issue**: Template not loading
- Verify template path is correct
- Check file permissions (must be readable by GoTrue user)
- Look for errors in GoTrue logs

## 📚 Additional Resources

- See `SELF_HOSTED_EMAIL_SETUP.md` for detailed setup instructions
- See `GOTRUE_CONFIG_REFERENCE.md` for all GoTrue environment variables
- See `supabase/templates/README.md` for template development guide

## 🎉 Ready to Deploy!

Your email templates are ready for production. Follow the steps above to configure your self-hosted GoTrue instance.

