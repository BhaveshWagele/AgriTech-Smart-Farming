import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  Bug,
  Sparkles,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  BookOpen,
  Send,
  HelpCircle,
  X,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const PestAlertsPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'scan' | 'reports' | 'knowledge'>('scan');
  const [reports, setReports] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Diagnostic Form
  const [scanForm, setScanForm] = useState({
    cropName: 'Tomato',
    symptoms: 'Concentric brown rings on lower leaves with yellow halo',
    severity: 'Moderate',
    location: user?.district ? `${user.village || 'Field'}, ${user.district}` : 'Nashik, Maharashtra',
    imageUrl: '/src/assets/images/disease_leaf_blight_1793370391634.jpg'
  });

  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [reportsRes, kbRes, cropsRes] = await Promise.all([
        fetch('/api/pest/reports', { headers }).then(r => r.json()),
        fetch('/api/pest/knowledge-base').then(r => r.json()),
        fetch('/api/crops', { headers }).then(r => r.json())
      ]);

      if (reportsRes.success && reportsRes.data) setReports(reportsRes.data);
      if (kbRes.success && kbRes.data) setKnowledgeBase(kbRes.data);
      if (cropsRes.success && cropsRes.data) {
        setCrops(cropsRes.data);
        if (cropsRes.data.length > 0) {
          setScanForm(prev => ({ ...prev, cropName: cropsRes.data[0].name }));
        }
      }
    } catch (err) {
      console.warn('Error fetching pest data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Run AI disease diagnosis
  const handleRunAiDiagnosis = async () => {
    if (!scanForm.cropName || !scanForm.symptoms) {
      setError('Please provide the crop name and observed symptoms.');
      return;
    }

    try {
      setDiagnosing(true);
      setError('');
      setSubmitSuccess('');

      const res = await fetch('/api/pest/diagnose-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName: scanForm.cropName,
          symptoms: scanForm.symptoms,
          imageBase64: scanForm.imageUrl
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setDiagnosisResult(data.data);
      } else {
        setError(data.message || 'Diagnostic scan failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during diagnosis.');
    } finally {
      setDiagnosing(false);
    }
  };

  // Submit formal report to agronomists
  const handleSubmitReport = async () => {
    try {
      setSubmittingReport(true);
      setError('');

      const res = await fetch('/api/pest/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName: scanForm.cropName,
          diseaseName: diagnosisResult ? diagnosisResult.identifiedDisease : 'Suspected Foliar Infection',
          severity: diagnosisResult ? diagnosisResult.severity : scanForm.severity,
          symptoms: scanForm.symptoms,
          location: scanForm.location,
          imageUrl: scanForm.imageUrl,
          runAiCheck: false
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess('Pest report formally registered and queued for agronomist verification!');
        fetchData();
      } else {
        setError(data.message || 'Submission failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          {t('nav_pest')} & Disease Diagnostics
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          AI-assisted foliar symptom analysis, disease surveillance, and scientific mitigation protocols.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-neutral-200/80 shadow-xs max-w-md">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'scan' ? 'bg-emerald-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Disease Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-emerald-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Report History ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'knowledge' ? 'bg-emerald-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </button>
      </div>

      {/* Tab 1: AI Disease Scanner */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Input Form */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-sm">Describe Symptoms & Photo</h3>
              <span className="text-[11px] font-semibold text-emerald-700">Gemini 2.5 AI</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Affected Crop</label>
                <input
                  type="text"
                  value={scanForm.cropName}
                  onChange={(e) => setScanForm({ ...scanForm, cropName: e.target.value })}
                  placeholder="e.g. Tomato, Wheat, Cotton, Rice"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Observed Symptoms *</label>
                <textarea
                  rows={3}
                  value={scanForm.symptoms}
                  onChange={(e) => setScanForm({ ...scanForm, symptoms: e.target.value })}
                  placeholder="Describe leaf spots, wilting, powdery mildew, caterpillar holes, chlorosis..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Severity Assessment</label>
                <select
                  value={scanForm.severity}
                  onChange={(e) => setScanForm({ ...scanForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Low">Low (&lt;10% canopy affected)</option>
                  <option value="Moderate">Moderate (10% - 30% affected)</option>
                  <option value="High">High (30% - 60% affected)</option>
                  <option value="Severe">Severe (&gt;60% affected / Defoliation)</option>
                </select>
              </div>

              {/* Sample Photo Preview */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Sample Foliage Image</label>
                <div className="relative rounded-xl overflow-hidden border border-neutral-200 aspect-video bg-neutral-100">
                  <img
                    src={scanForm.imageUrl}
                    alt="Foliage sample"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-neutral-900/80 text-white rounded text-[10px] font-mono">
                    Diagnostic Reference Sample
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunAiDiagnosis}
                  disabled={diagnosing}
                  className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{diagnosing ? 'Analyzing Symptoms via Gemini...' : 'Analyze with Agri-AI'}</span>
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis Output */}
          <div className="lg:col-span-7 space-y-4">
            {diagnosisResult ? (
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-5 animate-in fade-in">
                {/* Identified Disease Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                      AI Diagnostic Estimate
                    </span>
                    <h3 className="text-xl font-extrabold text-neutral-900 mt-0.5">
                      {diagnosisResult.identifiedDisease}
                    </h3>
                  </div>

                  <div className="text-right self-start sm:self-auto">
                    <span className="text-xs font-mono font-bold text-emerald-900 px-2.5 py-1 bg-emerald-100 rounded-lg">
                      Confidence: {diagnosisResult.confidence}%
                    </span>
                    <div className="text-[10px] text-neutral-500 mt-1">Severity: <strong>{diagnosisResult.severity}</strong></div>
                  </div>
                </div>

                {/* Treatment Guidance */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                    Suggested Treatment Protocols
                  </h4>
                  <div className="space-y-2">
                    {diagnosisResult.suggestedTreatments?.map((t: string, idx: number) => (
                      <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-800 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preventive Cultural Practices */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                    Preventive Measures & Field Hygiene
                  </h4>
                  <div className="space-y-2">
                    {diagnosisResult.preventiveMeasures?.map((p: string, idx: number) => (
                      <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-700 flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span className="leading-relaxed">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Disclaimer */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Advisory Disclaimer:</strong> {diagnosisResult.advisoryNote}
                  </p>
                </div>

                {/* Submit to agronomists button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSubmitReport}
                    disabled={submittingReport}
                    className="flex-1 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReport ? 'Submitting Report...' : 'Log Formal Report for Agronomist Review'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('consultation')}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Ask Agronomist
                  </button>
                </div>

                {submitSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-emerald-700 mx-auto" />
                <h3 className="font-bold text-neutral-900 text-base">Ready for Diagnostic Analysis</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click "Analyze with Agri-AI" to evaluate foliar symptoms, identify pathogen patterns, and generate targeted spray recipes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: User Report History */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-400">
              No disease reports logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(rep => (
                <div
                  key={rep._id}
                  className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{rep.cropName}: {rep.diseaseName}</h4>
                      <div className="text-xs text-neutral-500">{rep.location} · {new Date(rep.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      rep.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'Investigating'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {rep.symptoms}
                  </p>

                  {rep.expertNotes && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
                      <div className="font-bold text-emerald-900">Agronomist Review:</div>
                      <p>{rep.expertNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Knowledge Base */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {knowledgeBase.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900 text-base">{item.diseaseName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md border border-rose-200">
                    {item.severity}
                  </span>
                </div>

                <div className="text-xs text-emerald-800 font-medium">
                  Crops affected: {item.affectedCrops.join(', ')}
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  <strong>Symptoms:</strong> {item.symptoms}
                </p>

                <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-100">
                  <div>
                    <strong className="text-neutral-900">Chemical Management:</strong> {item.chemicalTreatment}
                  </div>
                  <div>
                    <strong className="text-emerald-900">Biological & Organic:</strong> {item.organicTreatment}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500">
                Prevention: {item.prevention}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
