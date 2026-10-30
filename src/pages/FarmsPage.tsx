import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { 
  Trees, 
  MapPin, 
  Droplets, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Sprout, 
  X, 
  CheckCircle2, 
  Search,
  ExternalLink
} from 'lucide-react';

export const FarmsPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    state: 'Maharashtra',
    district: 'Nashik',
    village: '',
    landArea: '',
    areaUnit: 'acres',
    soilType: 'Black (Regur)',
    irrigationMethod: 'Drip Irrigation',
    description: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/farms', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFarms(data.data);
      }
    } catch (err) {
      console.warn('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      location: '',
      state: user?.state || 'Maharashtra',
      district: user?.district || 'Nashik',
      village: user?.village || 'Ozar',
      landArea: '',
      areaUnit: 'acres',
      soilType: 'Black (Regur)',
      irrigationMethod: 'Drip Irrigation',
      description: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farm: any) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      state: farm.state,
      district: farm.district,
      village: farm.village || '',
      landArea: farm.landArea.toString(),
      areaUnit: farm.areaUnit,
      soilType: farm.soilType,
      irrigationMethod: farm.irrigationMethod,
      description: farm.description || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (farmId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove farm "${name}"?`)) return;

    try {
      const res = await fetch(`/api/farms/${farmId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchFarms();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.landArea) {
      setError('Please provide farm name and land area.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const url = editingFarm ? `/api/farms/${editingFarm._id}` : '/api/farms';
      const method = editingFarm ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchFarms();
      } else {
        setError(data.message || 'Operation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const filteredFarms = farms.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase()) ||
    f.soilType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_farms')}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your land parcels, GPS locations, soil profiles, and irrigation networks.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('action_add_farm')}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by farm name, district, or soil type..."
          className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-neutral-400 hover:text-neutral-700">
            Clear
          </button>
        )}
      </div>

      {/* Farm Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
          <Trees className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-base">No Farms Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {search ? 'No farms match your search criteria.' : 'You haven’t registered any agricultural land parcel yet.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Register Your First Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFarms.map(farm => (
            <div
              key={farm._id}
              className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-900 transition-colors">
                      {farm.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{farm.location || `${farm.village}, ${farm.district}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(farm)}
                      className="p-1.5 text-neutral-400 hover:text-emerald-800 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit farm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(farm._id, farm.name)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete farm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {farm.description && (
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {farm.description}
                  </p>
                )}

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100 text-xs">
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 font-medium">Cultivated Area</div>
                    <div className="font-extrabold text-neutral-900 font-mono mt-0.5">
                      {farm.landArea} {farm.areaUnit}
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 font-medium">Soil Class</div>
                    <div className="font-bold text-neutral-900 truncate mt-0.5">
                      {farm.soilType}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <Droplets className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Irrigation: <strong>{farm.irrigationMethod}</strong></span>
                </div>

                {/* Active crops list if any */}
                {farm.crops && farm.crops.length > 0 && (
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Sown Crops ({farm.crops.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {farm.crops.map((c: any) => (
                        <span 
                          key={c._id}
                          className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-900 rounded-md border border-emerald-100"
                        >
                          {c.name} ({c.growthStage})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('crops')}
                  className="font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Manage Crops</span>
                </button>
                <button
                  onClick={() => onNavigate('soil')}
                  className="font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Soil Tests
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingFarm ? 'Edit Farm Details' : 'Register New Farm'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Farm Parcel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Godavari Green Acres"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Land Area *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.landArea}
                    onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                    placeholder="e.g., 12.5"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30 bg-white"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Soil Type
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30 bg-white"
                  >
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black (Regur)">Black (Regur)</option>
                    <option value="Red & Yellow">Red & Yellow</option>
                    <option value="Laterite">Laterite</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clay">Clay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Irrigation Method
                  </label>
                  <select
                    value={formData.irrigationMethod}
                    onChange={(e) => setFormData({ ...formData, irrigationMethod: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30 bg-white"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler System">Sprinkler System</option>
                    <option value="Canal Irrigation">Canal Irrigation</option>
                    <option value="Borewell / Tube Well">Borewell / Tube Well</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Location / Highway Reference
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Plot 42, Ozar Shivar near Godavari canal"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description / Agronomic Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Special attributes like drainage characteristics, solar pumps, or crop history..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {saving ? 'Saving...' : editingFarm ? 'Save Changes' : 'Register Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
