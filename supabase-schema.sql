-- ============================================================
-- SAN D Real Estate Marketplace - Supabase Schema (PostgreSQL)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS PROFILE TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    mobile TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'BUYER' CHECK (role IN ('SELLER','BUYER','BROKER','ADMIN')),
    kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING','VERIFIED','REJECTED')),
    profile_photo TEXT,
    whatsapp_no TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    broker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT NOT NULL CHECK (property_type IN ('PLOT','LAND','HOUSE','APARTMENT','COMMERCIAL')),
    address_line1 TEXT,
    city TEXT,
    district TEXT,
    state TEXT DEFAULT 'Tamil Nadu',
    pincode TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    survey_number TEXT,
    plot_number TEXT,
    total_area_sqft DECIMAL(12,2),
    facing TEXT CHECK (facing IN ('NORTH','SOUTH','EAST','WEST','NE','NW','SE','SW')),
    road_width_feet DECIMAL(8,2),
    expected_price DECIMAL(15,2) NOT NULL,
    price_per_sqft DECIMAL(10,2),
    is_negotiable BOOLEAN DEFAULT TRUE,
    dtcp_approved BOOLEAN DEFAULT FALSE,
    cmda_approved BOOLEAN DEFAULT FALSE,
    has_road_access BOOLEAN DEFAULT TRUE,
    has_electricity BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT','PENDING_APPROVAL','ACTIVE','SOLD','REJECTED','EXPIRED')),
    is_verified BOOLEAN DEFAULT FALSE,
    broker_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS contact_requests (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT','READ','RESPONDED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(expected_price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users can update their own
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties: anyone can read active, sellers can manage their own
CREATE POLICY "Public properties readable" ON properties FOR SELECT USING (true);
CREATE POLICY "Sellers insert properties" ON properties FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers update own" ON properties FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers delete own" ON properties FOR DELETE USING (auth.uid() = seller_id);

-- Favorites: users manage their own
CREATE POLICY "Users read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Reviews: anyone can read, authenticated can write
CREATE POLICY "Public reviews readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Auth users write reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Contact Requests: parties can read their own
CREATE POLICY "Parties read contacts" ON contact_requests FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers send contacts" ON contact_requests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
