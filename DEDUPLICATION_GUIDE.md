# Deduplication Guide for german_companies

## Overview

This guide helps you remove duplicate records from the `german_companies` table based on matching **Email + Company + Website** combinations.

## Strategy Options

### Option 1: Keep Oldest Record (Recommended)
**File:** `deduplicate_companies.sql`

- **Keeps:** The record with the **lowest ID** (oldest record)
- **Marks:** All other matching records as duplicates
- **Best for:** When you want to preserve the original data entry

### Option 2: Keep Most Complete Record
**File:** `deduplicate_companies_alternative.sql`

- **Keeps:** The record with the **most filled fields** (phone, address, city, etc.)
- **Marks:** All other matching records as duplicates
- **Best for:** When you want the most comprehensive data record

## Step-by-Step Process

### 1. Preview What Will Be Deduplicated

Run **STEP 1** from either file to see:
- Which records will be kept
- Which records will be marked as duplicates
- How many duplicates per group

### 2. Count Affected Records

Run **STEP 2** to see:
- Total number of duplicate groups
- Total records that will be marked as duplicates

### 3. Mark Duplicates

Run **STEP 3** to mark duplicates:
- Sets `is_duplicate = true` on duplicate records
- Keeps the chosen record unchanged
- **Safe to run** - doesn't delete anything

### 4. Verify Results

Run **STEP 4** to confirm:
- How many records were marked
- That the process worked correctly

### 5. Optional: Delete Duplicates

Run **STEP 5** (commented out) to permanently delete:
- ⚠️ **WARNING:** This permanently deletes records!
- Only run after backing up your database
- Only run after verifying steps 1-4

## Expected Results

Based on the analysis:
- **~7,010 duplicate groups** (unique Email + Company + Website combinations)
- **~22,370 total records** in duplicate groups
- **~15,360 records** will be marked as duplicates (keeping ~7,010)

## Safety Notes

1. ✅ **Always backup** your database before running deletion queries
2. ✅ **Test on a small subset** first if possible
3. ✅ **Mark duplicates first** (STEP 3) before deleting
4. ✅ **Verify results** (STEP 4) before proceeding to deletion
5. ✅ The `is_duplicate` field can be used to filter duplicates in your application

## Reverting Changes

If you need to undo the marking:
```sql
UPDATE german_companies
SET is_duplicate = false
WHERE is_duplicate = true;
```

## Filtering Duplicates in Application

After marking duplicates, you can filter them in your queries:
```sql
SELECT * FROM german_companies 
WHERE is_duplicate = false;
```

