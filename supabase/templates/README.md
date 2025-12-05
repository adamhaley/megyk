# Supabase Email Templates

This directory contains custom email templates for self-hosted Supabase serving multiple Megyk applications.

## Templates

All templates use `{{ .ConfirmationURL }}` for dynamic URL generation:

- **`recovery.html`** - Password reset email
- **`confirmation.html`** - Email confirmation for new signups
- **`invite.html`** - User invitation email
- **`magic_link.html`** - Passwordless login email

## Multi-App Support

These templates use `{{ .ConfirmationURL }}` instead of hardcoded URLs, allowing a single Supabase instance to serve multiple apps:
- Main app: `megyk.com`
- Dashboard: `dashboard.megyk.com`

The URL in each email automatically matches the app that triggered it.

## Local Development

The templates are automatically used when running Supabase locally. The configuration is in `supabase/config.toml`:

```toml
[auth.email.template.recovery]
subject = "Reset Your Password - Megyk Dashboard"
content_path = "./supabase/templates/recovery.html"
```

## Production Setup

For your production Supabase project, you have **two options**:

### Option 1: Upload Templates via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **"Password Recovery"** template
4. Copy the content from `recovery.html` and paste it
5. Update the subject line: "Reset Your Password - Megyk Dashboard"
6. Save the template

Repeat for the **"Confirm Signup"** template using `confirmation.html`.

### Option 2: Configure Site URL in Supabase Dashboard

If you prefer to use Supabase's default templates but point to the dashboard domain:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to: `https://dashboard.megyk.com`
4. Add **Redirect URLs**:
   - `https://dashboard.megyk.com/**`
   - `https://dashboard.megyk.com/reset-password`
   - `https://dashboard.megyk.com/auth/confirm`

This way, the default email templates will use `{{ .SiteURL }}` which points to dashboard.megyk.com.

## Important Notes

### Separate Apps Configuration

Since you have two separate apps:
- **Main app**: `megyk.com`
- **Dashboard**: `dashboard.megyk.com`

You'll need to either:
1. Use **separate Supabase projects** for each app, OR
2. Customize the email templates to include the correct domain explicitly (as done in these templates)

### Template Variables

Available Supabase template variables:
- `{{ .Token }}` - The authentication token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - The configured site URL
- `{{ .Email }}` - User's email address
- `{{ .Type }}` - Action type (signup, recovery, etc.)

### Security

- Password reset links expire after **60 minutes** (configured in Supabase)
- Links are single-use only
- All links use HTTPS in production

## Testing

To test the email templates locally:

1. Start Supabase locally: `supabase start`
2. Navigate to the Inbucket email testing interface: `http://localhost:54324`
3. Trigger a password reset from the login page
4. Check the Inbucket inbox to see the formatted email

## Updating Templates

After modifying templates:
1. Restart Supabase locally: `supabase stop && supabase start`
2. Test the changes via Inbucket
3. Upload updated templates to production via Supabase dashboard

