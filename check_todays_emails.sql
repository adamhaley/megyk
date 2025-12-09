-- Query to check if today's 5 sent emails are duplicates or missing first_contact_sent flag
-- Run this in Supabase SQL Editor

SELECT 
    email,
    company,
    is_duplicate,
    first_contact_sent,
    email_status,
    created_at,
    updated_at,
    CASE 
        WHEN is_duplicate = true THEN '❌ DUPLICATE - Excluded from count'
        WHEN first_contact_sent = false THEN '⚠️ NOT COUNTED - first_contact_sent = false'
        WHEN first_contact_sent = true THEN '✅ COUNTED - first_contact_sent = true'
        ELSE '❓ UNKNOWN STATUS'
    END as status_explanation
FROM german_companies
WHERE LOWER(TRIM(email)) IN (
    'info@dres-von-bosse.de',
    'praxis@zahnarzt-thyroff.de',
    'praxis@zahnarzt-grossrinderfeld.de',
    'praxis@zahn32.com',
    'info@die-zahnaerztinnen.com'
)
ORDER BY is_duplicate, first_contact_sent, email;

-- Summary count
SELECT 
    COUNT(*) as total_records_found,
    COUNT(*) FILTER (WHERE is_duplicate = true) as marked_as_duplicate,
    COUNT(*) FILTER (WHERE is_duplicate = false) as not_duplicate,
    COUNT(*) FILTER (WHERE is_duplicate = false AND first_contact_sent = true) as counted_in_pitch_paul,
    COUNT(*) FILTER (WHERE is_duplicate = false AND first_contact_sent = false) as not_counted_missing_flag
FROM german_companies
WHERE LOWER(TRIM(email)) IN (
    'info@dres-von-bosse.de',
    'praxis@zahnarzt-thyroff.de',
    'praxis@zahnarzt-grossrinderfeld.de',
    'praxis@zahn32.com',
    'info@die-zahnaerztinnen.com'
);

-- To fix the missing flags, run: fix_todays_emails.sql

