# Email Setup Guide for Dashboard.Megyk.com

> ⚠️ **Note**: This guide is for Supabase Cloud. If you're using **self-hosted Supabase**, see [SELF_HOSTED_EMAIL_SETUP.md](SELF_HOSTED_EMAIL_SETUP.md) instead.

## Problem
Your dashboard app at `dashboard.megyk.com` is sending password reset emails with links pointing to `megyk.com` instead of `dashboard.megyk.com`.

## Solution Implemented

✅ Created custom email templates in `supabase/templates/`:
- `recovery.html` - Password reset emails
- `confirmation.html` - Email confirmation emails

✅ Updated `supabase/config.toml` to use these templates locally

✅ All links now point to `https://dashboard.megyk.com`

## Next Steps - Production Configuration

You need to configure your **production Supabase project**. Choose one of these approaches:

### Approach 1: Upload Custom Templates (Recommended) ⭐

**Pros**: Complete control over email design and links
**Steps**:

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Email Templates**
4. Select **"Reset Password"** template
5. Replace the content with the HTML from `supabase/templates/recovery.html`
6. Set subject: "Reset Your Password - Megyk Dashboard"
7. Click **Save**
8. Repeat for **"Confirm Signup"** using `confirmation.html`

### Approach 2: Configure Site URL Only

**Pros**: Simpler, uses Supabase defaults
**Cons**: Less control over branding

**Steps**:

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL**: `https://dashboard.megyk.com`
5. Add to **Redirect URLs**:
   ```
   https://dashboard.megyk.com/**
   https://dashboard.megyk.com/reset-password
   https://dashboard.megyk.com/auth/confirm
   ```
6. Click **Save**

**Note**: With this approach, Supabase's default templates will use `{{ .SiteURL }}` which will now point to your dashboard.

### Approach 3: Separate Supabase Projects

If you want completely isolated environments:

**Pros**: Complete separation between main app and dashboard
**Cons**: Requires separate Supabase project (potentially extra cost)

**Steps**:

1. Create a new Supabase project for the dashboard
2. Update `.env.local` (and production env vars) with new project credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   ```
3. Migrate your database schema to the new project
4. Configure the new project with dashboard URLs

## Testing

### Local Testing
1. Start Supabase: `supabase start`
2. Visit Inbucket: `http://localhost:54324`
3. Trigger password reset from login page
4. Check email in Inbucket - should show dashboard.megyk.com links

### Production Testing
1. Deploy your changes
2. Go to your login page
3. Click "Forgot password?"
4. Enter your email
5. Check your inbox - links should point to `https://dashboard.megyk.com/reset-password`

## Current Code Implementation

Your login page already correctly uses dynamic URLs:

```typescript
// src/app/login/page.tsx:62-64
const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

This ensures the redirect URL matches the current domain (dashboard.megyk.com).

## Verification Checklist

- [ ] Email templates created in `supabase/templates/`
- [ ] Local config updated in `supabase/config.toml`
- [ ] Production Supabase configured (choose Approach 1 or 2 above)
- [ ] Tested password reset locally via Inbucket
- [ ] Tested password reset in production
- [ ] Verified email links point to dashboard.megyk.com
- [ ] Tested email confirmation (if enabled)

## Questions?

- **Do I need a separate Supabase project?** Not necessarily. Approach 1 or 2 should work fine.
- **What about the main megyk.com app?** If it uses a different Supabase project, no changes needed. If it shares the same project, you'll need separate projects.
- **How do I know which approach to use?** Use Approach 1 if you want custom branding. Use Approach 2 if you're okay with Supabase defaults.

