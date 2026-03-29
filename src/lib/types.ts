export type PropertyType = 'PLOT' | 'LAND' | 'HOUSE' | 'APARTMENT' | 'COMMERCIAL'
export type PropertyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SOLD' | 'REJECTED' | 'EXPIRED'
export type UserRole = 'SELLER' | 'BUYER' | 'BROKER' | 'ADMIN'

export interface Profile {
  id: string
  full_name: string
  mobile: string | null
  role: UserRole
  kyc_status: string
  profile_photo: string | null
  whatsapp_no: string | null
  is_active: boolean
  created_at: string
}

export interface Property {
  id: number
  seller_id: string
  broker_id: string | null
  title: string
  description: string | null
  property_type: PropertyType
  address_line1: string | null
  city: string | null
  district: string | null
  state: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  survey_number: string | null
  total_area_sqft: number | null
  facing: string | null
  road_width_feet: number | null
  expected_price: number
  price_per_sqft: number | null
  is_negotiable: boolean
  dtcp_approved: boolean
  cmda_approved: boolean
  has_road_access: boolean
  has_electricity: boolean
  status: PropertyStatus
  is_verified: boolean
  broker_verified: boolean
  is_featured: boolean
  view_count: number
  image_url: string | null
  created_at: string
  profiles?: Profile
}

export interface Review {
  id: number
  property_id: number
  reviewer_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export interface SellerKYC {
  id: string
  user_id: string
  full_name: string
  phone_number: string
  aadhaar_url: string
  pan_url: string
  land_documents_url: string[]
  location_lat: number
  location_lng: number
  land_size: string
  land_type: string
  owner_details: string
  selfie_url: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  created_at: string
  updated_at: string
}

export interface BuyerRequirement {
  id: string
  buyer_id: string | null
  name: string
  phone_number: string
  land_requirements: string
  budget: string
  preferred_location: string
  created_at: string
}

export function formatPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2)} Cr`
  if (price >= 100_000) return `₹${(price / 100_000).toFixed(2)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'PLOT', label: 'Plot', icon: '🏗️' },
  { value: 'LAND', label: 'Agricultural Land', icon: '🌾' },
  { value: 'HOUSE', label: 'House / Villa', icon: '🏠' },
  { value: 'APARTMENT', label: 'Apartment', icon: '🏢' },
  { value: 'COMMERCIAL', label: 'Commercial', icon: '🏪' },
]

export const CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy',
  'Tirunelveli', 'Vellore', 'Erode', 'Tiruppur', 'Dindigul',
  'Thanjavur', 'Kancheepuram', 'Chengalpattu', 'Villupuram',
]
