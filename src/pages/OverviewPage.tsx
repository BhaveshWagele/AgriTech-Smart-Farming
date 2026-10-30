import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { 
  Trees, 
  Sprout, 
  FlaskConical, 
  CloudSun, 
  Bug, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  AlertTriangle,
  Wind,
  Droplets,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface OverviewPageProps {
  onNavigate: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [soilReports, setSoilReports] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [pestReports, setPestReports] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [farmsRes, cropsRes, soilRes, weatherRes, pestRes] = await Promise.all([
        fetch('/api/farms', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/crops', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/soil', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/weather?location=Nashik&state=Maharashtra').then(r => r.json()).catch(() => ({ data: null })),
        fetch('/api/pest/reports', { headers }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      setFarms(farmsRes.data || []);
      setCrops(cropsRes.data || []);
      setSoilReports(soilRes.data || []);
      setWeather(weatherRes.data || null);
      setPestReports(pestRes.data || []);

      // Derive activities from farms
      let acts: any[] = [];
      if (farmsRes.data && farmsRes.data.length > 0) {
        farmsRes.data.forEach((f: any) => {
          if (f.activities) acts = [...acts, ...f.activities];
        });
      }
      setActivities(acts);
    } catch (err) {
      console.warn('Error loading dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const totalAcres = farms.reduce((sum, f) => sum + (Number(f.landArea) || 0), 0);
  const activeCropsCount = crops.filter(c => c.growthStage !== 'Harvested').length;
  const pendingPestCount = pestReports.filter(p => p.status !== 'Resolved').length;

  // Recharts data
  const cropStageData = [
    { name: 'Germination', value: crops.filter(c => c.growthStage === 'Germination').length || 1, color: '#A7F3D0' },
    { name: 'Vegetative', value: crops.filter(c => c.growthStage === 'Vegetative').length || 2, color: '#34D399' },
    { name: 'Flowering', value: crops.filter(c => c.growthStage === 'Flowering').length || 1, color: '#10B981' },
    { name: 'Maturity', value: crops.filter(c => c.growthStage === 'Maturity').length || 1, color: '#047857' }
  ];

  const yieldData = crops.map(c => ({
    name: c.name,
    yield: c.yieldEstimate || 30,
    area: c.cultivatedArea || 5
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Digital Farming Intelligence Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Your farming parcels in {user?.district || 'Nashik'}, {user?.state || 'Maharashtra'} are currently experiencing optimal vegetative growing conditions. Spray windows are favorable this morning.
          </p>

          <div className="pt-3 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('farms')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('action_add_farm')}</span>
            </button>
            <button
              onClick={() => onNavigate('crops')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>{t('action_add_crop')}</span>
            </button>
            <button
              onClick={() => onNavigate('soil')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{t('action_test_soil')}</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background imagery */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-cover bg-center hidden md:block"
          style={{ backgroundImage: `url('/src/assets/images/hero_smart_farm_1793370388941.jpg')` }}
        />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Farms */}
        <div 
          onClick={() => onNavigate('farms')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">{t('stat_total_farms')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
              {farms.length}
            </span>
            <span className="text-xs text-neutral-500">Parcels</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>{totalAcres.toFixed(1)} {t('acres')} total</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
          </div>
        </div>

        {/* Active Crops */}
        <div 
          onClick={() => onNavigate('crops')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">{t('stat_active_crops')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
              {activeCropsCount}
            </span>
            <span className="text-xs text-neutral-500">Cultivated</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            1 Harvest ready next week
          </div>
        </div>

        {/* Weather Snapshot */}
        <div 
          onClick={() => onNavigate('weather')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">{t('stat_current_temp')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
              {weather ? `${weather.temperature}°C` : '28°C'}
            </span>
            <span className="text-xs text-neutral-500 truncate">
              {weather ? weather.condition : 'Clear'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Wind className="w-3 h-3" />
            <span>Optimal spray window</span>
          </div>
        </div>

        {/* Pest & Disease Alerts */}
        <div 
          onClick={() => onNavigate('pest-alerts')}
          className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">{t('stat_active_alerts')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-700 group-hover:text-white transition-colors">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono tabular-nums">
              {pendingPestCount}
            </span>
            <span className="text-xs text-neutral-500">Active</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Tomato Early Blight under review
          </div>
        </div>
      </div>

      {/* Main Grid: Weather Advisory & Crop Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Crop Performance & Yield Estimation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Yield & Cultivation Chart Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t('sec_crop_health')}</h3>
                <p className="text-xs text-neutral-500">Estimated Yield vs. Cultivated Acres by Crop</p>
              </div>
              <button 
                onClick={() => onNavigate('crops')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>{t('view_details')}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} 
                  />
                  <Bar dataKey="yield" fill="#14532D" radius={[6, 6, 0, 0]} name="Est. Yield (Quintals)" />
                  <Bar dataKey="area" fill="#34D399" radius={[6, 6, 0, 0]} name="Area (Acres)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-neutral-900">{t('sec_activity_timeline')}</h3>
              </div>
              <button
                onClick={() => onNavigate('crops')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
              >
                + Log Care Action
              </button>
            </div>

            <div className="space-y-3">
              {[
                { 
                  title: 'Fertilizer Application - Sharbati Wheat', 
                  date: 'Oct 28', 
                  desc: 'Top dressing with neem-coated urea completed on Godavari plot.', 
                  done: true 
                },
                { 
                  title: 'Scheduled Irrigation - Sharbati Wheat', 
                  date: 'Oct 31, 06:00 AM', 
                  desc: 'Critical boot-leaf stage irrigation scheduled via drip system.', 
                  done: false 
                },
                { 
                  title: 'Neem Bio-Spray - Organic Tomatoes', 
                  date: 'Oct 25', 
                  desc: 'Foliar application against early blight spore proliferation.', 
                  done: true 
                }
              ].map((act, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60 flex items-start gap-3"
                >
                  <div className={`mt-0.5 p-1 rounded-lg ${act.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {act.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-900">{act.title}</h4>
                      <span className="text-[11px] font-mono text-neutral-400">{act.date}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Weather Advisory & Soil Score */}
        <div className="space-y-6">
          {/* Weather & Spray Window Advisory Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">{t('sec_weather_summary')}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                {weather?.sprayCondition || 'Optimal'} Spray
              </span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-900 font-semibold">{weather?.location || 'Nashik'}, Maharashtra</div>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono mt-0.5">
                    {weather?.temperature || 28}°C
                  </div>
                </div>
                <CloudSun className="w-10 h-10 text-emerald-700" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/50 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>RH: <strong className="text-neutral-900 font-mono">{weather?.humidity || 58}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Wind: <strong className="text-neutral-900 font-mono">{weather?.windSpeed || 8} km/h</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-900 leading-normal pt-1">
                {weather?.sprayAdvice || 'Ideal morning window for foliar sprays. Low wind velocity avoids drift loss.'}
              </p>
            </div>

            <button
              onClick={() => onNavigate('weather')}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
            >
              View Full 7-Day Forecast
            </button>
          </div>

          {/* Soil Health Snapshot Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">{t('sec_soil_health')}</h3>
              <span className="text-xs font-bold text-emerald-800 font-mono">
                88/100
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-medium">Godavari Green Acres</span>
                  <span className="text-[11px] font-semibold text-emerald-700">Black (Regur)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1 border-t border-neutral-200/60">
                  <div>
                    <div className="text-neutral-400">Nitrogen</div>
                    <div className="font-bold text-neutral-900 font-mono">280 kg/ha</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Phosphorus</div>
                    <div className="font-bold text-neutral-900 font-mono">44 kg/ha</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">pH Level</div>
                    <div className="font-bold text-emerald-800 font-mono">7.2 (Neutral)</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('soil')}
                className="w-full py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Run New Soil Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
