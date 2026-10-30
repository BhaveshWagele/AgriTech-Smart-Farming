/**
 * AgriTech Comprehensive Realistic Seed Data
 * Includes demo Farmer, Admin, and Agricultural Expert accounts,
 * farms across agricultural regions, crops with growth stages,
 * soil reports with real NPK/pH metrics, marketplace products,
 * consultations, community threads, notifications, and farm activities.
 */

import bcrypt from 'bcryptjs';

export const getHashedPassword = (plain: string) => {
  return bcrypt.hashSync(plain, 10);
};

export const INITIAL_USERS = [
  {
    _id: 'usr_farmer_001',
    name: 'Ramesh Patel',
    email: 'farmer@agritech.com',
    phone: '+91 98765 43210',
    password: getHashedPassword('Farmer@123'),
    role: 'Farmer',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Ozar',
    preferredLanguage: 'en',
    avatarUrl: '/src/assets/images/avatar_farmer_1793370389630.jpg',
    createdAt: '2026-01-15T08:30:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'usr_admin_001',
    name: 'Devendra Sharma',
    email: 'admin@agritech.com',
    phone: '+91 91234 56789',
    password: getHashedPassword('Admin@123'),
    role: 'Admin',
    state: 'Delhi',
    district: 'New Delhi',
    village: 'IARI Pusa Campus',
    preferredLanguage: 'en',
    avatarUrl: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'usr_expert_001',
    name: 'Dr. Aris Thorne',
    email: 'expert@agritech.com',
    phone: '+91 94567 89012',
    password: getHashedPassword('Expert@123'),
    role: 'Agricultural Expert',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'PAU Agricultural Research Zone',
    preferredLanguage: 'en',
    avatarUrl: '/src/assets/images/avatar_expert_1793370389955.jpg',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  }
];

export const INITIAL_FARMS = [
  {
    _id: 'farm_001',
    userId: 'usr_farmer_001',
    name: 'Godavari Green Acres',
    location: 'Plot 42, Ozar Shivar, Nashik',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Ozar',
    landArea: 14.5,
    areaUnit: 'acres',
    soilType: 'Black (Regur)',
    irrigationMethod: 'Drip Irrigation',
    description: 'Specialized horticulture and grain parcel along the Godavari canal network equipped with automated drip lines.',
    coordinates: { lat: 20.0754, lng: 73.9168 },
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'farm_002',
    userId: 'usr_farmer_001',
    name: 'Surya Organic Terraces',
    location: 'Survey 118, Niphad Highway',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Niphad',
    landArea: 8.0,
    areaUnit: 'acres',
    soilType: 'Sandy Loam',
    irrigationMethod: 'Sprinkler System',
    description: 'Certified organic vegetable and pulse cultivation with automated moisture sensors.',
    coordinates: { lat: 20.0901, lng: 74.1122 },
    createdAt: '2026-03-12T11:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'farm_003',
    userId: 'usr_farmer_001',
    name: 'Krishna Basin Valley Farm',
    location: 'Sector 5, Karad Agro Cluster',
    state: 'Maharashtra',
    district: 'Satara',
    village: 'Karad',
    landArea: 22.0,
    areaUnit: 'acres',
    soilType: 'Alluvial',
    irrigationMethod: 'Canal Irrigation',
    description: 'High-yield sugarcane and wheat rotation estate with micro-climate monitoring.',
    coordinates: { lat: 17.2891, lng: 74.1834 },
    createdAt: '2026-04-18T14:30:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  }
];

export const INITIAL_CROPS = [
  {
    _id: 'crop_001',
    farmId: 'farm_001',
    userId: 'usr_farmer_001',
    name: 'Sharbati Wheat',
    variety: 'C-306 Golden Amber',
    plantingDate: '2026-09-15',
    expectedHarvestDate: '2026-12-28',
    cultivatedArea: 6.5,
    areaUnit: 'acres',
    growthStage: 'Flowering',
    irrigationSchedule: 'Every 5 days via subsurface drip',
    fertilizerInfo: 'NPK 120:60:40 with vermicompost top dressing',
    status: 'Healthy',
    yieldEstimate: 42,
    yieldUnit: 'quintals',
    notes: 'Crop foliage looks dense with excellent earhead formation. Nitrogen balance maintained.',
    createdAt: '2026-09-15T07:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'crop_002',
    farmId: 'farm_001',
    userId: 'usr_farmer_001',
    name: 'Pusa Basmati Rice',
    variety: 'Basmati 1121 Export Grade',
    plantingDate: '2026-07-10',
    expectedHarvestDate: '2026-11-05',
    cultivatedArea: 5.0,
    areaUnit: 'acres',
    growthStage: 'Maturity',
    irrigationSchedule: 'Alternate wetting & drying (AWD)',
    fertilizerInfo: 'Zinc sulfate 25kg/ha + Neem coated urea',
    status: 'Harvest Ready',
    yieldEstimate: 38,
    yieldUnit: 'quintals',
    notes: 'Grain moisture at 18%. Ready for combine harvester scheduling next week.',
    createdAt: '2026-07-10T06:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'crop_003',
    farmId: 'farm_002',
    userId: 'usr_farmer_001',
    name: 'Organic Tomatoes',
    variety: 'Abhinav Hybrid F1',
    plantingDate: '2026-08-20',
    expectedHarvestDate: '2026-11-20',
    cultivatedArea: 3.5,
    areaUnit: 'acres',
    growthStage: 'Vegetative',
    irrigationSchedule: 'Daily drip 45 mins at dawn',
    fertilizerInfo: 'Fermented Jeevamrut + Trichoderma viride',
    status: 'Needs Attention',
    yieldEstimate: 120,
    yieldUnit: 'crates',
    notes: 'Mild early blight spots detected on lower leaves. Neem oil emulsion applied.',
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  },
  {
    _id: 'crop_004',
    farmId: 'farm_003',
    userId: 'usr_farmer_001',
    name: 'Sugarcane',
    variety: 'Co-86032 (Nira)',
    plantingDate: '2026-01-20',
    expectedHarvestDate: '2027-01-15',
    cultivatedArea: 12.0,
    areaUnit: 'acres',
    growthStage: 'Vegetative',
    irrigationSchedule: 'Furrow irrigation every 10 days',
    fertilizerInfo: 'DAP 100kg + Potash 80kg per acre',
    status: 'Healthy',
    yieldEstimate: 600,
    yieldUnit: 'tons',
    notes: 'Grand growth phase progressing smoothly. Cane girth and internode lengths optimal.',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-10-30T07:00:00.000Z'
  }
];

export const INITIAL_SOIL_REPORTS = [
  {
    _id: 'soil_001',
    farmId: 'farm_001',
    userId: 'usr_farmer_001',
    farmName: 'Godavari Green Acres',
    nitrogen: 280, // kg/ha (Medium)
    phosphorus: 44, // kg/ha (High)
    potassium: 310, // kg/ha (High)
    ph: 7.2,
    moisture: 38,
    temperature: 24.5,
    soilType: 'Black (Regur)',
    healthScore: 88,
    nutrientStatus: {
      nitrogenStatus: 'Optimal',
      phosphorusStatus: 'High',
      potassiumStatus: 'Optimal'
    },
    phStatus: 'Neutral',
    moistureStatus: 'Adequate',
    recommendations: [
      'Maintain present organic carbon with green manuring (dhaincha or sunn hemp).',
      'Reduce single superphosphate addition by 15% due to high residual phosphorus bank.',
      'Schedule next irrigation in 3 days based on current soil water tension (32 kPa).'
    ],
    suitableCrops: ['Wheat', 'Cotton', 'Chickpea', 'Soybean', 'Sunflower'],
    notes: 'Soil structure is rich in montmorillonite clay with excellent water retention capacity.',
    createdAt: '2026-10-15T10:30:00.000Z'
  },
  {
    _id: 'soil_002',
    farmId: 'farm_002',
    userId: 'usr_farmer_001',
    farmName: 'Surya Organic Terraces',
    nitrogen: 195, // Low
    phosphorus: 18, // Low
    potassium: 220, // Medium
    ph: 6.4,
    moisture: 22,
    temperature: 26.0,
    soilType: 'Sandy Loam',
    healthScore: 68,
    nutrientStatus: {
      nitrogenStatus: 'Low',
      phosphorusStatus: 'Low',
      potassiumStatus: 'Optimal'
    },
    phStatus: 'Neutral',
    moistureStatus: 'Deficient',
    recommendations: [
      'Incorporate 5 tons/acre well-rotted farmyard manure (FYM) or vermicompost.',
      'Apply mycorrhizal biofertilizers (VAM) to unlock bound soil phosphorus.',
      'Increase drip cycle duration by 20 minutes to restore root-zone field capacity.'
    ],
    suitableCrops: ['Tomato', 'Bell Pepper', 'Groundnut', 'Carrot', 'Maize'],
    notes: 'Light texture allows rapid drainage. Requires organic matter buildup to retain moisture.',
    createdAt: '2026-10-22T14:15:00.000Z'
  }
];

export const INITIAL_PRODUCTS = [
  {
    _id: 'prod_001',
    name: 'Certified Sharbati Wheat Seeds (HD-2967)',
    category: 'Seeds',
    brand: 'National Seeds Corp',
    price: 1250,
    originalPrice: 1500,
    unit: '40 kg bag',
    stock: 85,
    rating: 4.8,
    reviewsCount: 142,
    description: 'High yielding, rust-resistant certified wheat seed variety with 12.5% grain protein and superior milling traits.',
    features: ['Germination rate > 92%', 'Tolerance to yellow rust', 'Optimum sowing October-November'],
    imageUrl: '/src/assets/images/crop_wheat_healthy_1793370391092.jpg',
    inStock: true,
    createdAt: '2026-05-01T00:00:00.000Z'
  },
  {
    _id: 'prod_002',
    name: 'Organic Neem Oil Bio-Pesticide (10000 PPM)',
    category: 'Pesticides',
    brand: 'AgriBio Care',
    price: 680,
    originalPrice: 850,
    unit: '1 Litre bottle',
    stock: 120,
    rating: 4.9,
    reviewsCount: 98,
    description: 'Cold-pressed pure azadirachtin formulation effective against sucking pests, aphids, thrips, and caterpillars.',
    features: ['100% Organic certified', 'Zero residue on harvest', 'Safe for honeybees & ladybugs'],
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: '2026-05-10T00:00:00.000Z'
  },
  {
    _id: 'prod_003',
    name: 'Automated 1-Acre Drip Irrigation Kit',
    category: 'Irrigation Equipment',
    brand: 'Jain Precision Flow',
    price: 18500,
    originalPrice: 22000,
    unit: 'Complete kit',
    stock: 24,
    rating: 4.7,
    reviewsCount: 56,
    description: 'Complete micro-irrigation set with pressure compensating drippers, screen filter, venturi injector, and UV-stabilized LDPE pipes.',
    features: ['Water savings up to 60%', 'Includes venturi fertigation unit', '5-year manufacturer warranty'],
    imageUrl: '/src/assets/images/hero_smart_farm_1793370388941.jpg',
    inStock: true,
    createdAt: '2026-06-01T00:00:00.000Z'
  },
  {
    _id: 'prod_004',
    name: 'Water Soluble NPK 19-19-19 Fertilizer',
    category: 'Fertilizers',
    brand: 'IFFCO AgroChem',
    price: 1450,
    originalPrice: 1750,
    unit: '25 kg bag',
    stock: 210,
    rating: 4.8,
    reviewsCount: 220,
    description: '100% water-soluble balanced crystalline fertilizer ideal for drip fertigation and foliar spray at vegetative stages.',
    features: ['Completely free from chloride and sodium', 'Quick plant absorption', 'Promotes balanced root & shoot growth'],
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: '2026-06-15T00:00:00.000Z'
  },
  {
    _id: 'prod_005',
    name: 'Rechargeable 16L Battery Knapsack Sprayer',
    category: 'Farming Equipment',
    brand: 'KisanForce Power',
    price: 2950,
    originalPrice: 3800,
    unit: '1 Unit with charger & 4 nozzles',
    stock: 45,
    rating: 4.6,
    reviewsCount: 78,
    description: '12V 8Ah lithium-ion battery sprayer with pressure regulator, stainless steel telescopic lance, and dual-speed pump.',
    features: ['Up to 6 hours continuous spray per charge', 'Backrest ergonomic sponge padding', 'Includes fan and cone nozzles'],
    imageUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: '2026-07-01T00:00:00.000Z'
  },
  {
    _id: 'prod_006',
    name: 'Premium Vermicompost (Earthworm Organic Manure)',
    category: 'Organic Products',
    brand: 'Dharti Ratna Organics',
    price: 499,
    originalPrice: 650,
    unit: '50 kg bag',
    stock: 160,
    rating: 4.9,
    reviewsCount: 165,
    description: 'A-grade enriched vermicompost cultured from cow dung using Eisenia fetida worms. Enriched with natural humic acid and beneficial microbes.',
    features: ['High water holding capacity', 'Improves soil biodiversity', 'Non-toxic and odor-free'],
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: '2026-07-20T00:00:00.000Z'
  }
];

export const INITIAL_EXPERTS = [
  {
    _id: 'exp_001',
    userId: 'usr_expert_001',
    name: 'Dr. Aris Thorne',
    title: 'Senior Agronomist & Plant Pathologist',
    specialization: 'Crop Disease Diagnostics & IPM (Integrated Pest Management)',
    experienceYears: 14,
    organization: 'Punjab Agricultural University / AgriTech Council',
    rating: 4.95,
    consultationCount: 384,
    bio: 'PhD in Plant Virology with 14+ years advising smallholder farmers on fungal rusts, blights, and biological pest controls.',
    avatarUrl: '/src/assets/images/avatar_expert_1793370389955.jpg',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    contactEmail: 'aris.thorne@agritech.com',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    _id: 'exp_002',
    name: 'Prof. Suresh Deshmukh',
    title: 'Chief Soil Health & Precision Nutrient Specialist',
    specialization: 'Soil Chemistry, Salinity Remediation & Micro-Nutrients',
    experienceYears: 19,
    organization: 'Mahatma Phule Krishi Vidyapeeth, Rahuri',
    rating: 4.88,
    consultationCount: 512,
    bio: 'Renowned soil scientist focused on regenerating black cotton soils, balancing NPK ratios, and maximizing drip fertigation yields.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Monday', 'Wednesday', 'Saturday'],
    contactEmail: 'suresh.deshmukh@mpkv-agri.org',
    createdAt: '2026-02-05T09:00:00.000Z'
  },
  {
    _id: 'exp_003',
    name: 'Er. Kavita Nair',
    title: 'Agricultural Water & Micro-Irrigation Engineer',
    specialization: 'Smart Drip Automation, Water Budgeting & Solar Pumps',
    experienceYears: 11,
    organization: 'National Water Technology Institute',
    rating: 4.92,
    consultationCount: 290,
    bio: 'Designs precision water delivery systems that cut consumption by 40% while preventing salt crystallization and root rot.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    contactEmail: 'kavita.nair@agriwater.org',
    createdAt: '2026-03-01T12:00:00.000Z'
  }
];

export const INITIAL_CONSULTATIONS = [
  {
    _id: 'cons_001',
    farmerId: 'usr_farmer_001',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98765 43210',
    expertId: 'exp_001',
    expertName: 'Dr. Aris Thorne',
    subject: 'Concentric brown rings on lower tomato leaves',
    question: 'I noticed circular spots with yellow halos appearing on the bottom leaves of my Abhinav hybrid tomatoes after the recent unseasonal rain. Should I prune them or spray systemic fungicide?',
    cropName: 'Organic Tomatoes',
    status: 'Answered',
    answer: 'This is Early Blight caused by Alternaria solani. Immediately prune off infected lower leaves and destroy them away from the field. Avoid overhead watering. Spray copper oxychloride at 2.5g/L or Mancozeb 75 WP at 2g/L. If adhering to strict organic protocols, apply Bacillus subtilis formulation with 0.5% neem oil.',
    answeredAt: '2026-10-24T15:20:00.000Z',
    priority: 'Urgent',
    createdAt: '2026-10-24T09:10:00.000Z'
  },
  {
    _id: 'cons_002',
    farmerId: 'usr_farmer_001',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98765 43210',
    expertId: 'exp_002',
    expertName: 'Prof. Suresh Deshmukh',
    subject: 'Micronutrient application timing for Sharbati Wheat',
    question: 'Our soil test showed zinc at 0.65 ppm (slightly below critical limit). What is the optimal stage to foliar spray zinc so grain filling is not hindered?',
    cropName: 'Sharbati Wheat',
    status: 'Answered',
    answer: 'Foliar application of 0.5% Zinc Sulphate (heptahydrate) neutralized with 0.25% slaked lime is most effective at the tillering stage and repeat at boot-leaf stage. This enhances both ear length and grain weight.',
    answeredAt: '2026-10-26T11:45:00.000Z',
    priority: 'Normal',
    createdAt: '2026-10-25T14:00:00.000Z'
  }
];

export const INITIAL_COMMUNITY_POSTS = [
  {
    _id: 'post_001',
    userId: 'usr_farmer_001',
    authorName: 'Ramesh Patel',
    authorRole: 'Farmer',
    title: 'Experience with solar drip timers: 35% electricity savings this rabi season',
    content: 'We retrofitted our Godavari plot with solar-powered solenoid valves and soil moisture tensiometers. Now irrigation cycles start automatically at 5:00 AM before the sun peaks, eliminating evaporative loss. Has anyone else paired this with solar insect traps?',
    category: 'Irrigation',
    tags: ['DripIrrigation', 'SolarPower', 'WaterConservation', 'SmartFarming'],
    likes: ['usr_admin_001', 'usr_expert_001'],
    likesCount: 24,
    commentsCount: 3,
    imageUrl: '/src/assets/images/hero_smart_farm_1793370388941.jpg',
    isModerated: false,
    createdAt: '2026-10-22T08:15:00.000Z'
  },
  {
    _id: 'post_002',
    userId: 'usr_expert_001',
    authorName: 'Dr. Aris Thorne',
    authorRole: 'Agricultural Expert',
    title: 'Advisory: Early detection protocol for Fall Armyworm in late-sown maize',
    content: 'Farmers in northern and western belts should scout maize whorls twice weekly. Look for window-pane feeding signs and pinhole punctures. Installing 4 pheromone traps per acre acts as an early warning threshold before larvae penetrate the stalk.',
    category: 'Crop Care',
    tags: ['PestAlert', 'MaizeFarming', 'IPM', 'Advisory'],
    likes: ['usr_farmer_001'],
    likesCount: 42,
    commentsCount: 5,
    imageUrl: '/src/assets/images/disease_leaf_blight_1793370391634.jpg',
    isModerated: false,
    createdAt: '2026-10-25T16:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif_001',
    userId: 'usr_farmer_001',
    title: 'High Humidity Weather Advisory',
    message: 'RH expected above 85% with morning dew over Nashik district. Risk of fungal sporulation on vegetables. Check spray conditions.',
    type: 'weather',
    read: false,
    link: '/weather',
    createdAt: '2026-10-30T05:00:00.000Z'
  },
  {
    _id: 'notif_002',
    userId: 'usr_farmer_001',
    title: 'Harvest Window Approaching',
    message: 'Pusa Basmati Rice on Farm #1 has reached 115 days. Expected grain maturity in 6 days.',
    type: 'harvest',
    read: false,
    link: '/crops',
    createdAt: '2026-10-29T10:30:00.000Z'
  },
  {
    _id: 'notif_003',
    userId: 'usr_farmer_001',
    title: 'Expert Replied to Consultation',
    message: 'Dr. Aris Thorne provided recommendations for your tomato blight inquiry.',
    type: 'consultation',
    read: true,
    link: '/consultation',
    createdAt: '2026-10-24T15:21:00.000Z'
  }
];

export const INITIAL_FARM_ACTIVITIES = [
  {
    _id: 'act_001',
    farmId: 'farm_001',
    farmName: 'Godavari Green Acres',
    cropId: 'crop_001',
    cropName: 'Sharbati Wheat',
    userId: 'usr_farmer_001',
    activityType: 'Fertilization',
    date: '2026-10-28',
    notes: 'Applied second top dressing of neem-coated urea at 45 kg/acre with drip line flush.',
    completed: true,
    createdAt: '2026-10-28T17:00:00.000Z'
  },
  {
    _id: 'act_002',
    farmId: 'farm_001',
    farmName: 'Godavari Green Acres',
    cropId: 'crop_001',
    cropName: 'Sharbati Wheat',
    userId: 'usr_farmer_001',
    activityType: 'Irrigation',
    date: '2026-10-31',
    notes: 'Critical flowering stage irrigation scheduled for morning 6:00 AM.',
    completed: false,
    createdAt: '2026-10-29T08:00:00.000Z'
  },
  {
    _id: 'act_003',
    farmId: 'farm_002',
    farmName: 'Surya Organic Terraces',
    cropId: 'crop_003',
    cropName: 'Organic Tomatoes',
    userId: 'usr_farmer_001',
    activityType: 'Pesticide Spray',
    date: '2026-10-25',
    notes: 'Neem seed kernel extract (NSKE 5%) sprayed targeting early blight spots.',
    completed: true,
    createdAt: '2026-10-25T11:00:00.000Z'
  }
];

export const INITIAL_PEST_REPORTS = [
  {
    _id: 'pest_001',
    userId: 'usr_farmer_001',
    farmerName: 'Ramesh Patel',
    farmId: 'farm_002',
    farmName: 'Surya Organic Terraces',
    cropName: 'Organic Tomatoes',
    diseaseName: 'Tomato Early Blight (Alternaria solani)',
    severity: 'Moderate',
    symptoms: 'Dark brown concentric target-like rings on older leaves, lower canopy yellowing.',
    location: 'Niphad, Nashik',
    imageUrl: '/src/assets/images/disease_leaf_blight_1793370391634.jpg',
    status: 'Investigating',
    expertNotes: 'Confirmed fungal pathogen. Immediate sanitation and copper bactericide/fungicide spray advised.',
    aiDiagnosis: {
      identifiedDisease: 'Early Blight (Alternaria solani)',
      confidence: 94.2,
      suggestedTreatments: [
        'Apply copper oxychloride 50 WP (2.5 g/L)',
        'Rotate with Mancozeb 75 WP at 7-10 day intervals',
        'Prune lower 12 inches of foliage to limit soil splashing'
      ],
      preventiveMeasures: [
        'Maintain drip irrigation without splashing leaves',
        'Mulch soil bed with organic straw',
        'Avoid solanaceous crop succession (potato/eggplant)'
      ],
      advisoryNote: 'AI diagnosis provides preliminary identification based on foliar lesion patterns. Confirm with your local Krishi Vigyan Kendra (KVK) or AgriTech expert.'
    },
    createdAt: '2026-10-24T08:45:00.000Z',
    updatedAt: '2026-10-24T15:20:00.000Z'
  }
];

export const INITIAL_ORDERS = [
  {
    _id: 'ord_001',
    userId: 'usr_farmer_001',
    farmerName: 'Ramesh Patel',
    orderNumber: 'AGR-2026-78901',
    items: [
      {
        productId: 'prod_001',
        name: 'Certified Sharbati Wheat Seeds (HD-2967)',
        price: 1250,
        quantity: 2,
        imageUrl: '/src/assets/images/crop_wheat_healthy_1793370391092.jpg',
        unit: '40 kg bag'
      },
      {
        productId: 'prod_002',
        name: 'Organic Neem Oil Bio-Pesticide (10000 PPM)',
        price: 680,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
        unit: '1 Litre bottle'
      }
    ],
    totalAmount: 3180,
    shippingAddress: {
      fullName: 'Ramesh Patel',
      phone: '+91 98765 43210',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Ozar',
      address: 'Plot 42, Near Godavari Canal Branch, Ozar Shivar',
      pincode: '422206'
    },
    paymentMethod: 'Cash on Delivery (Demo)',
    paymentStatus: 'Pending',
    orderStatus: 'Shipped',
    trackingNumber: 'TRK-IND-994821',
    createdAt: '2026-10-27T10:00:00.000Z',
    estimatedDelivery: '2026-11-01'
  }
];
