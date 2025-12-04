-- ============================================
-- ADDITIONAL DEDUPLICATION: Company + Website
-- Handles duplicates where email is empty/null
-- ============================================

-- ============================================
-- STEP 1: PREVIEW - See what will be deduplicated
-- ============================================
-- This finds duplicates based on Company + Website (even if email is empty)
WITH duplicate_groups AS (
    SELECT 
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
    WHERE company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
      AND is_duplicate = false  -- Only check records not already marked
    GROUP BY 
        LOWER(TRIM(company)),
        normalized_website
    HAVING COUNT(*) > 1
),
records_to_keep AS (
    SELECT 
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
    WHERE company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
      AND is_duplicate = false
    GROUP BY 
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
    WHERE company IS NOT NULL AND TRIM(company) != ''
      AND website IS NOT NULL AND TRIM(website) != ''
      AND is_duplicate = false
    GROUP BY 
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
        WHERE company IS NOT NULL AND TRIM(company) != ''
          AND website IS NOT NULL AND TRIM(website) != ''
          AND is_duplicate = false
        GROUP BY 
            LOWER(TRIM(company)),
            normalized_website
        HAVING COUNT(*) > 1
    )
    SELECT UNNEST(company_ids[2:]) as id_to_mark
    FROM duplicate_groups
);

