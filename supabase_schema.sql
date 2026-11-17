-- ============================================================================
-- Supabase Database Schema for Link International Travels & Tours
-- Packages Management System (Umrah & Hajj)
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to SQL Editor -> "New Query"
-- 3. Paste this entire file and click "Run"
-- ============================================================================

-- 1. Create the `packages` table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('umrah', 'hajj')),
    name VARCHAR(255) NOT NULL,
    airline VARCHAR(255) NOT NULL,
    days VARCHAR(50) NOT NULL,
    dates VARCHAR(100) NOT NULL,
    city VARCHAR(50) DEFAULT 'lhe',
    price NUMERIC(12, 2) NOT NULL,
    makkah_hotel TEXT,
    madinah_hotel TEXT,
    luggage VARCHAR(100) DEFAULT '23 kg + 7 kg Hand Carry',
    seats VARCHAR(100) DEFAULT '20 / 20 Seats Available',
    image_url TEXT,
    
    -- Specific fields for Hajj
    maktab VARCHAR(100) DEFAULT 'maktab-c',
    mina_schedule TEXT DEFAULT '15 - 20 May (Mina / Mashaer)',
    quad_price NUMERIC(12, 2),
    triple_price NUMERIC(12, 2),
    double_price NUMERIC(12, 2),
    hijri_dates VARCHAR(100) DEFAULT '25 ZILQADAH – 15 ZILHAJJ 1448',
    
    -- APPROVAL FIELD:
    -- When a user submits from website, is_approved = false (pending).
    -- When admin sets is_approved = true in Supabase, it appears instantly on website!
    is_approved BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_packages_type_approved 
ON public.packages (type, is_approved, created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Policy A: Anyone (public / website visitors) can SELECT packages where is_approved = true
DROP POLICY IF EXISTS "Public can view approved packages" ON public.packages;
CREATE POLICY "Public can view approved packages" 
ON public.packages 
FOR SELECT 
USING (is_approved = true);

-- Policy B: Anyone can submit / insert a new package with is_approved = false
DROP POLICY IF EXISTS "Public can submit package for review" ON public.packages;
CREATE POLICY "Public can submit package for review" 
ON public.packages 
FOR INSERT 
WITH CHECK (is_approved = false);

-- Policy C: Service Role and Authenticated Admins have full access (View all, Approve, Edit, Delete)
DROP POLICY IF EXISTS "Admins have full access" ON public.packages;
CREATE POLICY "Admins have full access" 
ON public.packages 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Enable Realtime Broadcasting
-- This allows client website to instantly display new cards as soon as you approve them!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'packages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
    END IF;
END $$;

-- ============================================================================
-- HELPER QUERIES FOR ADMIN (Run in Supabase SQL Editor as needed)
-- ============================================================================

-- Query 1: View all pending packages waiting for your approval
-- SELECT id, type, name, price, created_at, is_approved FROM public.packages WHERE is_approved = false ORDER BY created_at DESC;

-- Query 2: Approve a package by ID (Replace with the real UUID)
-- UPDATE public.packages SET is_approved = true WHERE id = 'YOUR_PACKAGE_ID_HERE';

-- Query 3: Approve all pending packages at once
-- UPDATE public.packages SET is_approved = true WHERE is_approved = false;

-- Query 4: Unapprove (hide from website)
-- UPDATE public.packages SET is_approved = false WHERE id = 'YOUR_PACKAGE_ID_HERE';

-- ============================================================================
-- SAMPLE TEST PACKAGES (Optional - Run these to test immediate approval)
-- ============================================================================
INSERT INTO public.packages (
    type, name, airline, days, dates, city, price, 
    makkah_hotel, madinah_hotel, luggage, seats, is_approved
) VALUES (
    'umrah',
    'Royal Platinum Umrah 2026',
    'Saudi Airlines (Saudia)',
    '15 Days',
    '10 Nov 2026 - 25 Nov 2026',
    'lhe',
    295000,
    'Clock Tower Fairmont (7 Nights • 50m from Haram)',
    'Dar Al Taqwa (8 Nights • 50m from Prophet Mosque)',
    '30 kg + 7 kg Hand Carry',
    '12 / 12 Seats Available',
    true -- Pre-approved for testing!
);

