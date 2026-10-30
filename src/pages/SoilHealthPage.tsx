import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  FlaskConical,
  Sprout,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  RotateCcw,
  Layers,
  ChevronRight,
  TrendingUp,
  Droplets,
  Thermometer
} from 'lucide-react';

export const SoilHealthPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form input values
  const [form, setForm] = useState({
    farmId: '',
    nitrogen: 280, // kg/ha
    phosphorus: 38, // kg/ha
    potassium: 260, // kg/ha
    ph: 6.8,
    moisture: 32, // %
    temperature: 24.5, // °C
    soilType: 'Black (Regur)',
    notes: 'Seasonal pre-sowing soil profile audit.'
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSoilData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [reportsRes, farmsRes] = await Promise.all([
        fetch('/api/soil', { headers }).then(r => r.json()),
        fetch('/api/farms', { headers }).then(r => r.json())
      ]);

      if (reportsRes.success && reportsRes.data) setReports(reportsRes.data);
      if (farmsRes.success && farmsRes.data) {
        setFarms(farmsRes.data);
        if (farmsRes.data.length > 0 && !form.farmId) {
          setForm(prev => ({
            ...prev,
            farmId: farmsRes.data[0]._id,
            soilType: farmsRes.data[0].soilType || 'Black (Regur)'
          }));
        }
      }
    } catch (err) {
      console.warn('Error fetching soil reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoilData();
  }, [token]);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError('');
      setSuccessMessage('');

      const res = await fetch('/api/soil/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success && data.data) {
        setAnalysisResult(data.data);
      } else {
        setError(data.message || 'Analysis calculation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveReport = async () => {
    if (!form.farmId) {
      setError('Please select a farm before saving.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const res = await fetch('/api/soil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success && data.data) {
        setSuccessMessage('Soil test audit saved to your farm history successfully!');
        fetchSoilData();
      } else {
        setError(data.message || 'Failed to save report.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    runAnalysis();
  }, [form.farmId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          {t('nav_soil')} & Precision Agronomy
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Simulate soil nutrient balances, assess NPK availability, and receive actionable amendment guidance.
        </p>
      </div>

      {/* Indicative Guidance Banner */}
      <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> Recommendations provided by this module are based on standard ICAR (Indian Council of Agricultural Research) agronomic benchmarks and serve as <em>indicative guidance</em>. They do not replace formal laboratory certification.
        </p>
      </div>

      {/* Main Grid: Inputs on Left, Real-Time Diagnostic Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Soil Metrics Input Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-neutral-900 text-sm">Soil Sample Parameters</h3>
            </div>
            <button
              onClick={() => {
                setForm({
                  farmId: farms[0]?._id || '',
                  nitrogen: 280,
                  phosphorus: 38,
                  potassium: 260,
                  ph: 6.8,
                  moisture: 32,
                  temperature: 24.5,
                  soilType: 'Black (Regur)',
                  notes: 'Baseline sample'
                });
                runAnalysis();
              }}
              className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Select Farm */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Associated Farm Parcel *
              </label>
              <select
                value={form.farmId}
                onChange={(e) => {
                  const selFarm = farms.find(f => f._id === e.target.value);
                  setForm({
                    ...form,
                    farmId: e.target.value,
                    soilType: selFarm?.soilType || form.soilType
                  });
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              >
                {farms.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.soilType}) - {f.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Soil Classification
              </label>
              <select
                value={form.soilType}
                onChange={(e) => setForm({ ...form, soilType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
              >
                <option value="Alluvial">Alluvial</option>
                <option value="Black (Regur)">Black (Regur)</option>
                <option value="Red & Yellow">Red & Yellow</option>
                <option value="Laterite">Laterite</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay">Clay</option>
              </select>
            </div>

            {/* Nitrogen (N) */}
            <div>
              <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                <span>Nitrogen (N) Content</span>
                <span className="font-mono text-emerald-800 font-bold">{form.nitrogen} kg/ha</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="5"
                value={form.nitrogen}
                onChange={(e) => {
                  setForm({ ...form, nitrogen: Number(e.target.value) });
                }}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Low (&lt;200)</span>
                <span>Medium (200-380)</span>
                <span>High (&gt;380)</span>
              </div>
            </div>

            {/* Phosphorus (P) */}
            <div>
              <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                <span>Phosphorus (P) Content</span>
                <span className="font-mono text-emerald-800 font-bold">{form.phosphorus} kg/ha</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={form.phosphorus}
                onChange={(e) => {
                  setForm({ ...form, phosphorus: Number(e.target.value) });
                }}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Low (&lt;20)</span>
                <span>Optimal (20-55)</span>
                <span>High (&gt;55)</span>
              </div>
            </div>

            {/* Potassium (K) */}
            <div>
              <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                <span>Potassium (K) Content</span>
                <span className="font-mono text-emerald-800 font-bold">{form.potassium} kg/ha</span>
              </div>
              <input
                type="range"
                min="80"
                max="450"
                step="5"
                value={form.potassium}
                onChange={(e) => {
                  setForm({ ...form, potassium: Number(e.target.value) });
                }}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Low (&lt;140)</span>
                <span>Optimal (140-320)</span>
                <span>High (&gt;320)</span>
              </div>
            </div>

            {/* pH and Moisture in 2 columns */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Soil pH: <strong className="font-mono text-emerald-900">{form.ph}</strong>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4.5"
                  max="9.5"
                  value={form.ph}
                  onChange={(e) => setForm({ ...form, ph: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg font-mono text-xs"
                />
                <span className="text-[10px] text-neutral-400">Neutral: 6.0 - 7.5</span>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Moisture (%): <strong className="font-mono text-emerald-900">{form.moisture}%</strong>
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="70"
                  value={form.moisture}
                  onChange={(e) => setForm({ ...form, moisture: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg font-mono text-xs"
                />
                <span className="text-[10px] text-neutral-400">Adequate: 25 - 45%</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Soil Temperature (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>{analyzing ? 'Calculating...' : 'Recalculate Score'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReport}
                disabled={saving}
                className="flex-1 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Audit'}</span>
              </button>
            </div>

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic Intelligence & Agronomic Recommendations */}
        <div className="lg:col-span-7 space-y-5">
          {analysisResult ? (
            <>
              {/* Health Score Overview Card */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Calculated Soil Health Index</h3>
                    <p className="text-xs text-neutral-500">Multivariate index derived from N-P-K, pH buffering, and soil water tension</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-950 font-mono">
                        {analysisResult.healthScore}/100
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700">
                        {analysisResult.healthScore >= 80 ? 'Grade A · Robust' : analysisResult.healthScore >= 65 ? 'Grade B · Moderate' : 'Grade C · Degraded'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      analysisResult.healthScore >= 80 ? 'bg-emerald-600' : analysisResult.healthScore >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${analysisResult.healthScore}%` }}
                  />
                </div>

                {/* 4 KPI Nutrient Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                    <div className="text-[10px] text-neutral-400 font-medium">Nitrogen Status</div>
                    <div className="font-extrabold text-xs text-neutral-900 mt-0.5">
                      {analysisResult.nutrientStatus.nitrogenStatus}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                    <div className="text-[10px] text-neutral-400 font-medium">Phosphorus Status</div>
                    <div className="font-extrabold text-xs text-neutral-900 mt-0.5">
                      {analysisResult.nutrientStatus.phosphorusStatus}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                    <div className="text-[10px] text-neutral-400 font-medium">Potassium Status</div>
                    <div className="font-extrabold text-xs text-neutral-900 mt-0.5">
                      {analysisResult.nutrientStatus.potassiumStatus}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                    <div className="text-[10px] text-neutral-400 font-medium">Soil Acidity / pH</div>
                    <div className="font-extrabold text-xs text-neutral-900 mt-0.5">
                      {analysisResult.phStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-sm font-bold text-neutral-900">Agronomic Prescription & Soil Amendments</h3>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.recommendations.map((rec: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-950"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suitable Crops Suggestions */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-sm font-bold text-neutral-900">Suitable Crops for this Profile</h3>
                </div>

                <p className="text-xs text-neutral-500">
                  Crops exhibiting highest yield potential given current pH ({form.ph}) and texture ({form.soilType}):
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {analysisResult.suitableCrops.map((crop: string) => (
                    <span
                      key={crop}
                      className="px-3 py-1.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xl border border-neutral-200/80"
                    >
                      🌱 {crop}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-400">
              Loading agronomic simulation...
            </div>
          )}
        </div>
      </div>

      {/* Historical Soil Reports Table */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900">Saved Farm Soil Audits ({reports.length})</h3>

        {reports.length === 0 ? (
          <p className="text-xs text-neutral-500">No saved soil reports yet. Run an analysis above and click "Save Audit".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-semibold">
                  <th className="pb-3 font-medium">Farm Name</th>
                  <th className="pb-3 font-medium">Test Date</th>
                  <th className="pb-3 font-medium">Health Score</th>
                  <th className="pb-3 font-medium">N-P-K (kg/ha)</th>
                  <th className="pb-3 font-medium">pH Level</th>
                  <th className="pb-3 font-medium">Moisture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reports.map((r: any) => (
                  <tr key={r._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 font-bold text-neutral-900">{r.farmName}</td>
                    <td className="py-3 text-neutral-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 font-mono font-bold text-emerald-800">{r.healthScore}/100</td>
                    <td className="py-3 font-mono tabular-nums text-neutral-700">
                      {r.nitrogen} - {r.phosphorus} - {r.potassium}
                    </td>
                    <td className="py-3 font-mono">{r.ph} ({r.phStatus})</td>
                    <td className="py-3 font-mono">{r.moisture}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
