-- ============================================
-- DEDUPLICATION SCRIPT FOR german_companies
-- Based on: Email + Company + Website match
-- ============================================

-- ============================================
-- STEP 1: PREVIEW - See what will be deduplicated
-- ============================================
-- This shows you which records will be KEPT (keep_id) and which will be marked as duplicates
WITH duplicate_groups AS (
    SELECT 
        LOWER(TRIM(email)) as normalized_email,
        LOWER(TRIM(company)) as normalized_company,
        LOWER(
            TRIM(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(website, '^https?://', '', 'gi'),
                        '^www\.', '', 'gi'
                    ),
                    '/$', '', 'g'
                )
            )
        ) as normalized_website,
        ARRAY_AGG(id ORDER BY id) as company_ids,
        COUNT(*) as duplicate_count
    FROM german_companies
    WHERE email IS NOT NULL AND TRIM(email) != ''
      AND company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
    GROUP BY 
        LOWER(TRIM(email)), 
        LOWER(TRIM(company)),
        normalized_website
    HAVING COUNT(*) > 1
),
records_to_keep AS (
    SELECT 
        normalized_email,
        normalized_company,
        normalized_website,
        company_ids[1] as keep_id,  -- Keep the first (lowest ID = oldest)
        company_ids[2:] as duplicate_ids  -- All others are duplicates
    FROM duplicate_groups
)
SELECT 
    rtk.keep_id,
    rtk.duplicate_ids,
    k.company as keep_company,
    k.email as keep_email,
    k.website as keep_website,
    k.created_at as keep_created_at,
    array_length(rtk.duplicate_ids, 1) as num_duplicates
FROM records_to_keep rtk
JOIN german_companies k ON k.id = rtk.keep_id
ORDER BY array_length(rtk.duplicate_ids, 1) DESC
LIMIT 20;

-- ============================================
-- STEP 2: COUNT - See how many will be affected
-- ============================================
WITH duplicate_groups AS (
    SELECT 
        LOWER(TRIM(email)) as normalized_email,
        LOWER(TRIM(company)) as normalized_company,
        LOWER(
            TRIM(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(website, '^https?://', '', 'gi'),
                        '^www\.', '', 'gi'
                    ),
                    '/$', '', 'g'
                )
            )
        ) as normalized_website,
        ARRAY_AGG(id ORDER BY id) as company_ids,
        COUNT(*) as duplicate_count
    FROM german_companies
    WHERE email IS NOT NULL AND TRIM(email) != ''
      AND company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
    GROUP BY 
        LOWER(TRIM(email)), 
        LOWER(TRIM(company)),
        normalized_website
    HAVING COUNT(*) > 1
)
SELECT 
    COUNT(*) as duplicate_groups,
    SUM(duplicate_count) as total_records_in_groups,
    SUM(duplicate_count - 1) as records_to_mark_as_duplicate
FROM duplicate_groups;

-- ============================================
-- STEP 3: MARK DUPLICATES - Set is_duplicate = true
-- ============================================
-- This keeps the oldest record (lowest ID) and marks all others as duplicates
-- Run this AFTER reviewing the preview above!

WITH duplicate_groups AS (
    SELECT 
        LOWER(TRIM(email)) as normalized_email,
        LOWER(TRIM(company)) as normalized_company,
        LOWER(
            TRIM(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(website, '^https?://', '', 'gi'),
                        '^www\.', '', 'gi'
                    ),
                    '/$', '', 'g'
                )
            )
        ) as normalized_website,
        ARRAY_AGG(id ORDER BY id) as company_ids
    FROM german_companies
    WHERE email IS NOT NULL AND TRIM(email) != ''
      AND company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
    GROUP BY 
        LOWER(TRIM(email)), 
        LOWER(TRIM(company)),
        normalized_website
    HAVING COUNT(*) > 1
),
duplicate_ids AS (
    SELECT UNNEST(company_ids[2:]) as id_to_mark
    FROM duplicate_groups
)
UPDATE german_companies
SET is_duplicate = true
WHERE id IN (SELECT id_to_mark FROM duplicate_ids)
  AND is_duplicate = false;  -- Only update if not already marked

-- ============================================
-- STEP 4: VERIFY - Check the results
-- ============================================
-- See how many duplicates were marked
SELECT 
    COUNT(*) as total_duplicates_marked,
    COUNT(*) FILTER (WHERE is_duplicate = true) as currently_marked
FROM german_companies
WHERE id IN (
    WITH duplicate_groups AS (
        SELECT 
            LOWER(TRIM(email)) as normalized_email,
            LOWER(TRIM(company)) as normalized_company,
            LOWER(
                TRIM(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(website, '^https?://', '', 'gi'),
                            '^www\.', '', 'gi'
                        ),
                        '/$', '', 'g'
                    )
                )
            ) as normalized_website,
            ARRAY_AGG(id ORDER BY id) as company_ids
        FROM german_companies
        WHERE email IS NOT NULL AND TRIM(email) != ''
          AND company IS NOT NULL AND TRIM(company) != ''
          AND website IS NOT NULL AND TRIM(website) != ''
        GROUP BY 
            LOWER(TRIM(email)), 
            LOWER(TRIM(company)),
            normalized_website
        HAVING COUNT(*) > 1
    )
    SELECT UNNEST(company_ids[2:]) as id_to_mark
    FROM duplicate_groups
);

-- ============================================
-- STEP 5: OPTIONAL - Delete duplicates (USE WITH CAUTION!)
-- ============================================
-- ⚠️ WARNING: This will PERMANENTLY DELETE records!
-- Only run this after:
--   1. You've reviewed the preview (STEP 1)
--   2. You've marked duplicates (STEP 3)
--   3. You've verified the results (STEP 4)
--   4. You've backed up your database!

-- Uncomment the lines below to actually delete:

/*
WITH duplicate_groups AS (
    SELECT 
        LOWER(TRIM(email)) as normalized_email,
        LOWER(TRIM(company)) as normalized_company,
        LOWER(
            TRIM(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(website, '^https?://', '', 'gi'),
                        '^www\.', '', 'gi'
                    ),
                    '/$', '', 'g'
                )
            )
        ) as normalized_website,
        ARRAY_AGG(id ORDER BY id) as company_ids
    FROM german_companies
    WHERE email IS NOT NULL AND TRIM(email) != ''
      AND company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
    GROUP BY 
        LOWER(TRIM(email)), 
        LOWER(TRIM(company)),
        normalized_website
    HAVING COUNT(*) > 1
),
duplicate_ids AS (
    SELECT UNNEST(company_ids[2:]) as id_to_delete
    FROM duplicate_groups
)
DELETE FROM german_companies
WHERE id IN (SELECT id_to_delete FROM duplicate_ids);
*/

-- ============================================
-- STEP 6: REVERT - Unmark duplicates (if needed)
-- ============================================
-- If you need to undo the marking, run this:
/*
UPDATE german_companies
SET is_duplicate = false
WHERE is_duplicate = true;
*/

