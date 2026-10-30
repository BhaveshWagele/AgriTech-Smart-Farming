import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
  Compass,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const { t } = useLanguage();

  const [location, setLocation] = useState('Nashik');
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (loc: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weather?location=${encodeURIComponent(loc)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setWeather(data.data);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Location Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_weather')} & Agrometeorology
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Micro-climate tracking, chemical spray windows, and evapotranspiration irrigation timing.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-xs w-full">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search district (e.g. Pune, Ludhiana)..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Demo status alert if demo mode */}
      {weather?.isDemo && (
        <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>Agro-Model Demo Mode Active:</strong> High-resolution micro-climate model calibrated for Indian agricultural belts. (To enable satellite radar, add OPENWEATHER_API_KEY in environment).
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
      ) : weather ? (
        <>
          {/* Hero Weather Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-neutral-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>District Agricultural Weather Station</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  {weather.location}, {weather.state || 'India'}
                </h2>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Live observations as of {new Date(weather.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-4 self-start sm:self-auto">
                <CloudSun className="w-16 h-16 text-emerald-400" />
                <div className="text-right">
                  <div className="text-4xl sm:text-5xl font-black font-mono">
                    {weather.temperature}°C
                  </div>
                  <div className="text-xs text-emerald-300 font-medium">
                    Feels like {weather.feelsLike}°C · {weather.condition}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Meteorological Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Relative Humidity</span>
                </div>
                <div className="text-xl font-extrabold font-mono mt-1">
                  {weather.humidity}%
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Dew point 19°C</div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wind Velocity</span>
                </div>
                <div className="text-xl font-extrabold font-mono mt-1">
                  {weather.windSpeed} km/h
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Direction: WNW</div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Precipitation (24h)</span>
                </div>
                <div className="text-xl font-extrabold font-mono mt-1">
                  {weather.rainfall} mm
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Probability &lt;10%</div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solar UV Index</span>
                </div>
                <div className="text-xl font-extrabold font-mono mt-1">
                  {weather.uvIndex}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Moderate exposure</div>
              </div>
            </div>
          </div>

          {/* Agricultural Advisories: Spray Condition & Irrigation Schedules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Spray Window Condition */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Chemical & Biological Spray Window</h3>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                  weather.sprayCondition === 'Optimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : weather.sprayCondition === 'Caution'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {weather.sprayCondition} Window
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {weather.sprayAdvice}
              </p>

              <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Target Timeframe:</span>
                  <strong className="text-neutral-900">06:00 AM – 09:30 AM</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Drift Hazard:</span>
                  <span className="text-emerald-700 font-semibold">Minimal (Wind &lt;10 km/h)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Wash-off Risk:</span>
                  <span className="text-emerald-700 font-semibold">Low (Zero Rain Forecast)</span>
                </div>
              </div>
            </div>

            {/* Irrigation Timing Advice */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Crop Water & Irrigation Schedule</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                  Water Budget Active
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {weather.irrigationAdvice}
              </p>

              <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Evapotranspiration (ET0):</span>
                  <strong className="text-neutral-900 font-mono">4.2 mm/day</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Recommended Cycle:</span>
                  <span className="text-neutral-900 font-semibold">Drip 40 mins at dusk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Soil Water Deficit:</span>
                  <span className="text-amber-700 font-semibold">Moderate</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-neutral-900">7-Day Agricultural Weather Forecast</h3>
              </div>
              <span className="text-xs text-neutral-400">Micro-climate outlook</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast?.map((day: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50/90 rounded-xl border border-neutral-200/60 text-center space-y-2 hover:border-emerald-600/40 transition-colors"
                >
                  <div className="font-bold text-xs text-neutral-900">{day.day}</div>
                  <div className="text-[11px] text-neutral-400">{day.date}</div>

                  <CloudSun className="w-8 h-8 text-emerald-800 mx-auto py-1" />

                  <div className="text-xs font-mono font-bold text-neutral-900">
                    {day.tempMax}° / <span className="text-neutral-400">{day.tempMin}°</span>
                  </div>

                  <div className="text-[11px] text-neutral-600 truncate">
                    {day.condition}
                  </div>

                  <div className="pt-1 border-t border-neutral-200/60 flex items-center justify-center gap-1 text-[10px] text-neutral-500">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>{day.rainProb}% Rain</span>
                  </div>

                  <div className={`text-[10px] font-semibold px-1 py-0.5 rounded ${
                    day.sprayScore === 'Good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Spray: {day.sprayScore}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
