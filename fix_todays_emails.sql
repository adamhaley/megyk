-- Fix: Update first_contact_sent = true for today's 4 emails that are missing the flag
-- This will make them count in the Pitch Paul chart

UPDATE german_companies
SET 
    first_contact_sent = true,
    updated_at = NOW()
WHERE LOWER(TRIM(email)) IN (
    'info@dres-von-bosse.de',
    'praxis@zahnarzt-thyroff.de',
    'praxis@zahnarzt-grossrinderfeld.de',
    'praxis@zahn32.com',
    'info@die-zahnaerztinnen.com'
)
AND is_duplicate = false
AND first_contact_sent = false;

-- Verify the update
SELECT 
    email,
    company,
    first_contact_sent,
    updated_at,
    CASE 
        WHEN first_contact_sent = true THEN '✅ NOW COUNTED'
        ELSE '❌ STILL MISSING'
    END as status
FROM german_companies
WHERE LOWER(TRIM(email)) IN (
    'info@dres-von-bosse.de',
    'praxis@zahnarzt-thyroff.de',
    'praxis@zahnarzt-grossrinderfeld.de',
    'praxis@zahn32.com',
    'info@die-zahnaerztinnen.com'
)
AND is_duplicate = false
ORDER BY email;


