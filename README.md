# AgriTech – Smart Farming Management System
> **Empowering Farmers Through Digital Technology**

AgriTech is a comprehensive, production-grade agricultural SaaS and farm management system. It bridges the gap between traditional agricultural practices and modern digital intelligence, providing farmers with real-time farm parcel monitoring, crop growth tracking, scientifically grounded soil analysis, agrometeorological forecasting, AI-powered crop pest diagnostics, an integrated input marketplace, and direct access to accredited agronomists.

---

## 1. Key Features

### 🌾 Farm & Land Parcel Management (CRUD)
- Register, edit, locate, and track multi-plot agricultural parcels.
- Track precise acreage, GPS references, soil classification (Alluvial, Black Regur, Red/Yellow, Laterite, Sandy Loam, Clay), and irrigation infrastructure.
- Visual breakdown of active crops cultivated on each parcel.

### 🚜 Crop Management & Phenology Tracking
- Comprehensive lifecycle tracking across 5 growth stages (*Germination*, *Vegetative*, *Flowering*, *Maturity*, *Harvested*).
- Planting date schedules, estimated harvest countdowns, and projected yield tracking.
- Interactive activity logging for scheduled drip cycles, fertilization top-dressing, and bio-pesticide applications.

### 🧪 Soil Health Analysis & Agronomic Recommendations
- Interactive multivariate soil calculator: Nitrogen ($N$), Phosphorus ($P$), Potassium ($K$), Soil $pH$, Moisture percentage, and Ambient Temperature.
- ICAR-calibrated rule engine generating Soil Health Index (0–100), nutrient adequacy grades, and soil acidity/alkalinity classifications.
- Generates actionable agronomic prescriptions (gypsum/lime soil amendments, green manuring, vermicompost) and identifies suitable high-yield crop matches.
- Saves complete historical soil test audits to the database.

### ⛅ Agrometeorological Weather & Spray Windows
- District-level weather tracking: Temperature, Relative Humidity, Wind Velocity, UV Index, and 7-day agricultural forecasts.
- Intelligent **Spray Window Index** (*Optimal*, *Caution*, *Unfavorable*) calculating chemical drift hazard and rainfall wash-off risk.
- Evapotranspiration-based irrigation advice to prevent over-watering and root hypoxia.

### 🔬 AI Crop Disease Diagnostics & Pest Surveillance
- **Gemini 2.5 Flash** powered symptom and foliar diagnostic engine (`@google/genai`).
- Evaluates foliar lesions, estimates confidence percentages, recommends active chemical and bio-fungicide treatments, and cultural prevention measures.
- Responsible agronomist disclaimers and option to formally log reports for certified extension officer review.
- Built-in pest & disease knowledge base for major Indian cash crops (Wheat Yellow Rust, Tomato Early Blight, Cotton Pink Bollworm, Rice Blast, Sugarcane Red Rot).

### 🛒 Agricultural Input Marketplace & Demo Checkout
- Direct store for certified hybrid seeds, water-soluble fertilizers, automated 1-acre drip kits, battery sprayers, and organic neem oil.
- Category filters, keyword search, product specifications, customer ratings, and stock tracking.
- Interactive shopping cart slide-over with quantity adjustments.
- Complete demo checkout flow capturing farm delivery addresses, simulated payment options (*Cash on Delivery*, *Kisan Credit Card*, *UPI*), instant tracking number generation, and order history tracking.

### 🎓 Expert Consultation Hub
- Verified expert profiles (Senior Agronomists, Soil Chemists, Water Engineers).
- Direct farmer Q&A inquiry dispatch with urgency flags (*Normal*, *Urgent*).
- Dedicated Agronomist portal enabling experts to submit scientific prescriptions and advice directly to farmers.

### 👥 Farmer Community Forum
- Knowledge exchange platform where farmers share field experiences, solar pump observations, and local market prices.
- Upvoting / liking mechanisms, real-time discussion commenting, category filtering, and administrative moderation.

### 🔔 Centralized Notification Center
- Real-time alerts for impending humidity spikes, upcoming crop harvest windows, agronomist consultation replies, and marketplace dispatch updates.
- Mark as read, mark all read, and alert dismissal.

### 🌐 Multilingual Accessibility
- Full interface localization in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
- Instant navbar toggle without page reload.

### 🛡️ Administrative Console
- Platform-wide telemetry: Total registered farmers, cumulative cultivated acreage, active crop count, marketplace gross merchandise volume (GMV), and pending pest investigations.
- Role management (upgrade/downgrade between *Farmer*, *Agricultural Expert*, and *Admin*).
- Order fulfillment state management (*Confirmed* $\rightarrow$ *Processing* $\rightarrow$ *Shipped* $\rightarrow$ *Delivered*).
- Review and verify farmer pest disease submissions.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT Authentication (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS.
- **Database Engine**: Dual-Engine Architecture:
  - **Production**: MongoDB Atlas with Mongoose ODM (`MONGODB_URI`).
  - **Local/Resilient**: Zero-dependency, persistent atomic JSON Document Store (`server/data/*.json`) replicating MongoDB collection semantics, ObjectIds, queries, filters, and timestamps.
- **AI Integration**: Google Gen AI SDK (`@google/genai`) utilizing `gemini-2.5-flash`.
- **Weather Services**: OpenWeatherMap API with automatic Agrometeorological fallback engine.

---

## 3. Demo Login Credentials

You can switch between any of these accounts in 1 click using the **Role Switcher** in the top navigation bar, or manually sign in:

| Role | Email Address | Password | Region & Profile |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agritech.com` | `Farmer@123` | Ramesh Patel (Nashik, Maharashtra) · 3 Farms · 4 Crops |
| **Agricultural Expert** | `expert@agritech.com` | `Expert@123` | Dr. Aris Thorne · Senior Agronomist & Pathologist |
| **Admin** | `admin@agritech.com` | `Admin@123` | Devendra Sharma · Platform System Administrator |

---

## 4. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Server Port (defaults to 3000)
PORT=3000

# Authentication Secret
JWT_SECRET="agritech_smart_farming_jwt_secret_key_2026"

# Google Gemini API Key for Plant Pathology Diagnostics
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# OpenWeatherMap API Key (Optional: falls back to built-in agricultural model)
OPENWEATHER_API_KEY="YOUR_OPENWEATHER_API_KEY"

# MongoDB Atlas Connection String (Optional: falls back to persistent JSON storage)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/agritech?retryWrites=true&w=majority"
```

---

## 5. Running the Application

### Development Mode (Full-Stack with Vite HMR Middleware)
```bash
npm run dev
```
The server will boot on `http://localhost:3000` serving both Express REST API routes (`/api/*`) and the React client through Vite middleware.

### Production Build & Launch
```bash
npm run build
npm start
```

### Run Automated Backend Verification Tests
```bash
npx tsx server/tests/api_verification.ts
```

---

## 6. API Route Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new user account with state, district, village, language.
- `POST /api/auth/login` - Authenticate and return signed JWT.
- `GET /api/auth/me` - Fetch profile for authenticated token.
- `PUT /api/auth/profile` - Update user profile information.

### Farms (`/api/farms`)
- `GET /api/farms` - List user parcels (or all for Admin).
- `POST /api/farms` - Register a new parcel.
- `GET /api/farms/:id` - Fetch single farm with associated crops and soil tests.
- `PUT /api/farms/:id` - Update farm boundary or irrigation information.
- `DELETE /api/farms/:id` - Delete parcel.

### Crops (`/api/crops`)
- `GET /api/crops` - List crops with filters for `farmId`, `status`, and `growthStage`.
- `POST /api/crops` - Log newly sown crop with planting & harvest dates.
- `PUT /api/crops/:id` - Update growth stage, variety, yield estimate.
- `DELETE /api/crops/:id` - Remove crop record.
- `POST /api/crops/:id/activities` - Log irrigation, fertilizer, or spray operations.

### Soil Health (`/api/soil`)
- `GET /api/soil` - List saved soil reports.
- `POST /api/soil/analyze` - Calculate soil health score, NPK status, and recommendations.
- `POST /api/soil` - Save soil test report to database.
- `DELETE /api/soil/:id` - Delete soil audit.

### Weather (`/api/weather`)
- `GET /api/weather?location=:city&state=:state` - Fetch live observations, spray index, and 7-day outlook.

### Pest Diagnostics (`/api/pest`)
- `GET /api/pest/knowledge-base` - Retrieve reference library of common pathogens.
- `POST /api/pest/diagnose-ai` - Analyze crop symptoms via Gemini 2.5 Flash.
- `GET /api/pest/reports` - List reported pest cases.
- `POST /api/pest/reports` - Submit formal disease report for agronomist review.
- `PUT /api/pest/reports/:id` - Update investigation status and add expert notes.

### Marketplace (`/api/marketplace`)
- `GET /api/marketplace/products` - List products with category and search filters.
- `GET /api/marketplace/cart` - Retrieve shopping cart items.
- `POST /api/marketplace/cart/add` - Add item to cart.
- `POST /api/marketplace/cart/update` - Adjust item quantity.
- `POST /api/marketplace/cart/remove` - Remove item from cart.
- `GET /api/marketplace/orders` - Retrieve order history.
- `POST /api/marketplace/orders` - Place demo order and generate tracking number.
- `PUT /api/marketplace/orders/:id/status` - Update shipping status (Admin).

### Consultations (`/api/consultations`)
- `GET /api/consultations/experts` - List accredited expert panel.
- `GET /api/consultations/consultations` - Retrieve farmer consultations.
- `POST /api/consultations/consultations` - Ask expert a crop question.
- `PUT /api/consultations/consultations/:id/respond` - Submit expert answer (Expert).

### Community (`/api/community`)
- `GET /api/community/posts` - List forum posts with comments.
- `POST /api/community/posts` - Create discussion topic.
- `POST /api/community/posts/:id/like` - Toggle upvote.
- `POST /api/community/posts/:id/comments` - Reply to discussion.
- `DELETE /api/community/posts/:id` - Remove post (Author or Admin).

### Admin (`/api/admin`)
- `GET /api/admin/stats` - Platform overview KPIs.
- `GET /api/admin/users` - View all platform users.
- `PUT /api/admin/users/:id/role` - Update user authorization level.
- `DELETE /api/admin/users/:id` - Remove account.
