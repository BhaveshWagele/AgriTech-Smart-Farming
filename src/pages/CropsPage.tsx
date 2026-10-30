import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  Sprout,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Droplets,
  Zap,
  Activity,
  X,
  Search,
  Filter
} from 'lucide-react';

const GROWTH_STAGES = ['Germination', 'Vegetative', 'Flowering', 'Maturity', 'Harvested'] as const;

export const CropsPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [crops, setCrops] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<any | null>(null);
  const [cropForm, setCropForm] = useState({
    farmId: '',
    name: '',
    variety: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    cultivatedArea: '',
    areaUnit: 'acres',
    growthStage: 'Vegetative',
    irrigationSchedule: 'Every 5 days via drip',
    fertilizerInfo: 'NPK 120:60:40',
    status: 'Healthy',
    yieldEstimate: '',
    yieldUnit: 'quintals',
    notes: ''
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityCrop, setActivityCrop] = useState<any | null>(null);
  const [activityForm, setActivityForm] = useState({
    activityType: 'Irrigation',
    date: new Date().toISOString().split('T')[0],
    notes: 'Morning drip cycle run for 45 minutes.',
    completed: true
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [cropsRes, farmsRes] = await Promise.all([
        fetch('/api/crops', { headers }).then(r => r.json()),
        fetch('/api/farms', { headers }).then(r => r.json())
      ]);

      if (cropsRes.success && cropsRes.data) setCrops(cropsRes.data);
      if (farmsRes.success && farmsRes.data) setFarms(farmsRes.data);
    } catch (err) {
      console.warn('Error fetching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleOpenAddCrop = () => {
    setEditingCrop(null);
    setCropForm({
      farmId: farms[0]?._id || '',
      name: '',
      variety: '',
      plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: '',
      cultivatedArea: '',
      areaUnit: 'acres',
      growthStage: 'Vegetative',
      irrigationSchedule: 'Every 4-5 days',
      fertilizerInfo: 'NPK basal application',
      status: 'Healthy',
      yieldEstimate: '',
      yieldUnit: 'quintals',
      notes: ''
    });
    setError('');
    setIsCropModalOpen(true);
  };

  const handleOpenEditCrop = (crop: any) => {
    setEditingCrop(crop);
    setCropForm({
      farmId: crop.farmId,
      name: crop.name,
      variety: crop.variety || '',
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate || '',
      cultivatedArea: crop.cultivatedArea.toString(),
      areaUnit: crop.areaUnit || 'acres',
      growthStage: crop.growthStage,
      irrigationSchedule: crop.irrigationSchedule || '',
      fertilizerInfo: crop.fertilizerInfo || '',
      status: crop.status || 'Healthy',
      yieldEstimate: crop.yieldEstimate ? crop.yieldEstimate.toString() : '',
      yieldUnit: crop.yieldUnit || 'quintals',
      notes: crop.notes || ''
    });
    setError('');
    setIsCropModalOpen(true);
  };

  const handleDeleteCrop = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete crop record "${name}"?`)) return;

    try {
      const res = await fetch(`/api/crops/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Delete crop failed', err);
    }
  };

  const handleSubmitCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropForm.farmId || !cropForm.name || !cropForm.cultivatedArea) {
      setError('Farm, crop name, and cultivated area are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const url = editingCrop ? `/api/crops/${editingCrop._id}` : '/api/crops';
      const method = editingCrop ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cropForm)
      });
      const data = await res.json();

      if (data.success) {
        setIsCropModalOpen(false);
        fetchData();
      } else {
        setError(data.message || 'Operation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenActivity = (crop: any) => {
    setActivityCrop(crop);
    setActivityForm({
      activityType: 'Irrigation',
      date: new Date().toISOString().split('T')[0],
      notes: `Applied scheduled care to ${crop.name}.`,
      completed: true
    });
    setIsActivityModalOpen(true);
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityCrop) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/crops/${activityCrop._id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(activityForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsActivityModalOpen(false);
        alert(`Activity "${activityForm.activityType}" logged successfully!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredCrops = crops.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.variety?.toLowerCase().includes(search.toLowerCase()) ||
      c.farmName?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = filterStage === 'All' || c.growthStage === filterStage;
    return matchesSearch && matchesStage;
  });

  const getStagePercentage = (stage: string) => {
    switch (stage) {
      case 'Germination': return 20;
      case 'Vegetative': return 45;
      case 'Flowering': return 70;
      case 'Maturity': return 90;
      case 'Harvested': return 100;
      default: return 30;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_crops')}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor crop phenology, growth stages, harvest countdowns, and fertilizer schedules.
          </p>
        </div>

        <button
          onClick={handleOpenAddCrop}
          className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('action_add_crop')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops by name, variety, or farm..."
            className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        {/* Growth Stage Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {['All', ...GROWTH_STAGES].map(stage => (
            <button
              key={stage}
              onClick={() => setFilterStage(stage)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterStage === stage
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
          <Sprout className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-base">No Crop Records Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {search || filterStage !== 'All' ? 'No crops match the active filter.' : 'Log your first planted crop to begin tracking growth cycles.'}
          </p>
          <button
            onClick={handleOpenAddCrop}
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Log New Crop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCrops.map(crop => {
            const progress = getStagePercentage(crop.growthStage);

            return (
              <div
                key={crop._id}
                className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Name & Variety & Action buttons */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-900 transition-colors">
                          {crop.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          crop.status === 'Healthy'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : crop.status === 'Needs Attention'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {crop.status}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {crop.variety} · <strong>{crop.farmName}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenActivity(crop)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                        title="Log farm action"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Log Action</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditCrop(crop)}
                        className="p-1.5 text-neutral-400 hover:text-emerald-800 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit crop"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCrop(crop._id, crop.name)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete crop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Growth Stage Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-600">Growth Stage: <strong className="text-emerald-900">{crop.growthStage}</strong></span>
                      <span className="font-mono text-emerald-800">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>Germination</span>
                      <span>Vegetative</span>
                      <span>Flowering</span>
                      <span>Maturity</span>
                      <span>Harvested</span>
                    </div>
                  </div>

                  {/* Cultivation Specs */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                    <div>
                      <div className="text-[10px] text-neutral-400">Cultivated Area</div>
                      <div className="font-extrabold text-neutral-900 font-mono mt-0.5">
                        {crop.cultivatedArea} {crop.areaUnit}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">Sown Date</div>
                      <div className="font-semibold text-neutral-800 mt-0.5">
                        {crop.plantingDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">Est. Harvest</div>
                      <div className="font-bold text-emerald-900 mt-0.5">
                        {crop.expectedHarvestDate || 'In 45 Days'}
                      </div>
                    </div>
                  </div>

                  {/* Irrigation & Fertilizer Notes */}
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">Irrigation: <strong>{crop.irrigationSchedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">Nutrition: <strong>{crop.fertilizerInfo}</strong></span>
                    </div>
                  </div>

                  {crop.notes && (
                    <p className="text-[11px] text-neutral-500 italic bg-neutral-50/70 p-2 rounded-lg border border-neutral-100">
                      "{crop.notes}"
                    </p>
                  )}
                </div>

                {/* Card Bottom: Expected Yield */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Est. Yield: <strong className="text-neutral-900 font-mono">{crop.yieldEstimate || 40} {crop.yieldUnit}</strong></span>
                  </div>
                  <button
                    onClick={() => onNavigate('pest-alerts')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    Scan for Disease →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingCrop ? 'Edit Crop Details' : 'Log New Planted Crop'}
              </h3>
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCrop} className="py-4 space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Farm Parcel *
                </label>
                <select
                  required
                  value={cropForm.farmId}
                  onChange={(e) => setCropForm({ ...cropForm, farmId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30 bg-white"
                >
                  <option value="">Select a farm...</option>
                  {farms.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.landArea} {f.areaUnit}) - {f.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cropForm.name}
                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                    placeholder="e.g., Sharbati Wheat"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Variety / Cultivar
                  </label>
                  <input
                    type="text"
                    value={cropForm.variety}
                    onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                    placeholder="e.g., HD-2967 Amber"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Cultivated Area *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={cropForm.cultivatedArea}
                    onChange={(e) => setCropForm({ ...cropForm, cultivatedArea: e.target.value })}
                    placeholder="e.g., 6.5"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Growth Stage
                  </label>
                  <select
                    value={cropForm.growthStage}
                    onChange={(e) => setCropForm({ ...cropForm, growthStage: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  >
                    {GROWTH_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Planting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={cropForm.plantingDate}
                    onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    value={cropForm.expectedHarvestDate}
                    onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Irrigation Schedule
                  </label>
                  <input
                    type="text"
                    value={cropForm.irrigationSchedule}
                    onChange={(e) => setCropForm({ ...cropForm, irrigationSchedule: e.target.value })}
                    placeholder="e.g., Drip every 5 days"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Fertilizer Dosage
                  </label>
                  <input
                    type="text"
                    value={cropForm.fertilizerInfo}
                    onChange={(e) => setCropForm({ ...cropForm, fertilizerInfo: e.target.value })}
                    placeholder="e.g., NPK 120:60:40"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Estimated Yield
                  </label>
                  <input
                    type="number"
                    value={cropForm.yieldEstimate}
                    onChange={(e) => setCropForm({ ...cropForm, yieldEstimate: e.target.value })}
                    placeholder="e.g., 45"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Yield Unit
                  </label>
                  <input
                    type="text"
                    value={cropForm.yieldUnit}
                    onChange={(e) => setCropForm({ ...cropForm, yieldUnit: e.target.value })}
                    placeholder="quintals / tons"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Field Observations / Notes
                </label>
                <textarea
                  rows={2}
                  value={cropForm.notes}
                  onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })}
                  placeholder="Notes on tillering, leaf color, or seed treatment..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {saving ? 'Saving...' : editingCrop ? 'Save Changes' : 'Log Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {isActivityModalOpen && activityCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">
                Log Activity for {activityCrop.name}
              </h3>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityForm.activityType}
                  onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Irrigation">Irrigation</option>
                  <option value="Fertilization">Fertilization</option>
                  <option value="Pesticide Spray">Pesticide Spray</option>
                  <option value="Weeding">Weeding</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Soil Testing">Soil Testing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Execution Date
                </label>
                <input
                  type="date"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Field Details
                </label>
                <textarea
                  rows={3}
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  {saving ? 'Recording...' : 'Record Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
