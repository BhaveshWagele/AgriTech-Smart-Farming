/**
 * AgriTech Database Schema & Interfaces
 * Compatible with MongoDB / Mongoose and File-based Local Database Engine
 */

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'Farmer' | 'Admin' | 'Agricultural Expert';
  state: string;
  district: string;
  village: string;
  preferredLanguage: 'en' | 'hi' | 'mr';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFarm {
  _id: string;
  userId: string;
  name: string;
  location: string;
  state: string;
  district: string;
  village: string;
  landArea: number;
  areaUnit: 'acres' | 'hectares';
  soilType: 'Alluvial' | 'Black (Regur)' | 'Red & Yellow' | 'Laterite' | 'Sandy Loam' | 'Clay';
  irrigationMethod: 'Drip Irrigation' | 'Sprinkler System' | 'Canal Irrigation' | 'Borewell / Tube Well' | 'Rainfed';
  description?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export interface ICrop {
  _id: string;
  farmId: string;
  userId: string;
  name: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  cultivatedArea: number;
  areaUnit: 'acres' | 'hectares';
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Maturity' | 'Harvested';
  irrigationSchedule: string;
  fertilizerInfo: string;
  status: 'Healthy' | 'Needs Attention' | 'Harvest Ready';
  yieldEstimate: number; // in quintals/tons
  yieldUnit: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISoilReport {
  _id: string;
  farmId: string;
  userId: string;
  farmName: string;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  ph: number;
  moisture: number; // %
  temperature: number; // °C
  soilType: string;
  healthScore: number; // 0-100
  nutrientStatus: {
    nitrogenStatus: 'Low' | 'Optimal' | 'High';
    phosphorusStatus: 'Low' | 'Optimal' | 'High';
    potassiumStatus: 'Low' | 'Optimal' | 'High';
  };
  phStatus: 'Acidic' | 'Neutral' | 'Alkaline';
  moistureStatus: 'Deficient' | 'Adequate' | 'Excessive';
  recommendations: string[];
  suitableCrops: string[];
  notes?: string;
  createdAt: string;
}

export interface IWeatherRecord {
  _id: string;
  location: string;
  state: string;
  district: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  condition: string;
  icon: string;
  uvIndex: number;
  sprayCondition: 'Optimal' | 'Caution' | 'Unfavorable';
  irrigationAdvice: string;
  forecast: Array<{
    day: string;
    date: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    rainProb: number;
    humidity: number;
    icon: string;
  }>;
  alerts: string[];
  updatedAt: string;
}

export interface IPestReport {
  _id: string;
  userId: string;
  farmerName: string;
  farmId: string;
  farmName: string;
  cropName: string;
  diseaseName: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  symptoms: string;
  location: string;
  imageUrl?: string;
  status: 'Pending Review' | 'Investigating' | 'Resolved';
  expertNotes?: string;
  aiDiagnosis?: {
    identifiedDisease: string;
    confidence: number;
    suggestedTreatments: string[];
    preventiveMeasures: string[];
    advisoryNote: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  category: 'Seeds' | 'Fertilizers' | 'Farming Equipment' | 'Irrigation Equipment' | 'Organic Products' | 'Pesticides';
  brand: string;
  price: number;
  originalPrice: number;
  unit: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  imageUrl: string;
  inStock: boolean;
  createdAt: string;
}

export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit: string;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  farmerName: string;
  orderNumber: string;
  items: ICartItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    state: string;
    district: string;
    village: string;
    address: string;
    pincode: string;
  };
  paymentMethod: 'Cash on Delivery (Demo)' | 'Kisan Credit Card (Demo)' | 'UPI (Demo)';
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  trackingNumber: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface IExpert {
  _id: string;
  userId?: string;
  name: string;
  title: string;
  specialization: string;
  experienceYears: number;
  organization: string;
  rating: number;
  consultationCount: number;
  bio: string;
  avatarUrl: string;
  availableDays: string[];
  contactEmail: string;
  createdAt: string;
}

export interface IConsultation {
  _id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  expertId: string;
  expertName: string;
  subject: string;
  question: string;
  cropName: string;
  status: 'Pending' | 'Answered' | 'Closed';
  answer?: string;
  answeredAt?: string;
  priority: 'Normal' | 'Urgent';
  createdAt: string;
}

export interface ICommunityPost {
  _id: string;
  userId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: 'Crop Care' | 'Soil Management' | 'Irrigation' | 'Market & Prices' | 'General Farming';
  tags: string[];
  likes: string[]; // user IDs
  likesCount: number;
  commentsCount: number;
  imageUrl?: string;
  isModerated: boolean;
  createdAt: string;
}

export interface IComment {
  _id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'weather' | 'crop' | 'harvest' | 'pest' | 'consultation' | 'order' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface IFarmActivity {
  _id: string;
  farmId: string;
  farmName: string;
  cropId?: string;
  cropName?: string;
  userId: string;
  activityType: 'Irrigation' | 'Fertilization' | 'Pesticide Spray' | 'Weeding' | 'Harvesting' | 'Soil Testing';
  date: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}
