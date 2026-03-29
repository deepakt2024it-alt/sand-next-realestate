-- 1. Create seller_kyc table
CREATE TABLE IF NOT EXISTS public.seller_kyc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    aadhaar_url TEXT NOT NULL,
    pan_url TEXT NOT NULL,
    land_documents_url TEXT[] NOT NULL,
    location_lat DOUBLE PRECISION NOT NULL,
    location_lng DOUBLE PRECISION NOT NULL,
    land_size TEXT NOT NULL,
    land_type TEXT NOT NULL,
    owner_details TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS on seller_kyc
ALTER TABLE public.seller_kyc ENABLE ROW LEVEL SECURITY;

-- KYC RLS Policies
-- Users can view their own KYC
CREATE POLICY "Users can view their own KYC" ON public.seller_kyc
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all KYC
CREATE POLICY "Admins can view all KYC" ON public.seller_kyc
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
        )
    );

-- Users can insert their own KYC
CREATE POLICY "Users can create their KYC" ON public.seller_kyc
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can update KYC (to verify/reject)
CREATE POLICY "Admins can update KYC" ON public.seller_kyc
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
        )
    );

-- 2. Create buyer_requirements table
CREATE TABLE IF NOT EXISTS public.buyer_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- optional, if logged in
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    land_requirements TEXT NOT NULL,
    budget TEXT NOT NULL,
    preferred_location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on buyer_requirements
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;

-- Buyer Requirements RLS
-- Anyone can insert a requirement (even public/guest)
CREATE POLICY "Anyone can insert buyer requirement" ON public.buyer_requirements
    FOR INSERT WITH CHECK (true);

-- Admins can view all requirements
CREATE POLICY "Admins can view buyer requirements" ON public.buyer_requirements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
        )
    );

-- 3. Storage Bucket for KYC Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for kyc_documents
-- Allow authenticated users to upload files to kyc_documents
CREATE POLICY "Allow authenticated uploads to KYC bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc_documents');

-- Allow users to see their own uploaded KYC documents
CREATE POLICY "Allow users to read their own KYC docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc_documents' AND auth.uid() = owner);

-- Allow admins to see all KYC documents
CREATE POLICY "Allow admins to read all KYC docs"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'kyc_documents' AND 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
);
