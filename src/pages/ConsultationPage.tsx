import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  GraduationCap,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

export const ConsultationPage: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [experts, setExperts] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New consultation state
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    subject: '',
    cropName: 'Sharbati Wheat',
    question: '',
    priority: 'Normal'
  });
  const [submitting, setSubmitting] = useState(false);

  // Expert answer state (for users with 'Agricultural Expert' role)
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [savingAnswer, setSavingAnswer] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [expRes, consRes] = await Promise.all([
        fetch('/api/consultations/experts').then(r => r.json()),
        fetch('/api/consultations/consultations', { headers }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (expRes.success && expRes.data) setExperts(expRes.data);
      if (consRes.success && consRes.data) setConsultations(consRes.data);
    } catch (err) {
      console.warn('Consultation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleOpenAsk = (expert?: any) => {
    setSelectedExpert(expert || experts[0] || null);
    setQuestionForm({
      subject: '',
      cropName: 'Sharbati Wheat',
      question: '',
      priority: 'Normal'
    });
    setIsQuestionModalOpen(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.subject || !questionForm.question) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/consultations/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          expertId: selectedExpert?._id,
          ...questionForm
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsQuestionModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnswer = async (consultationId: string) => {
    if (!answerText.trim()) return;

    try {
      setSavingAnswer(true);
      const res = await fetch(`/api/consultations/consultations/${consultationId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answer: answerText })
      });
      const data = await res.json();

      if (data.success) {
        setAnsweringId(null);
        setAnswerText('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const isExpert = user?.role === 'Agricultural Expert' || user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_consultation')}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Connect directly with verified soil scientists, plant pathologists, and irrigation engineers.
          </p>
        </div>

        <button
          onClick={() => handleOpenAsk()}
          className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Agronomist</span>
        </button>
      </div>

      {/* Expert Panel Roster */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">Accredited Advisory Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {experts.map(exp => (
            <div
              key={exp._id}
              className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={exp.avatarUrl}
                    alt={exp.name}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-700/20"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{exp.name}</h4>
                    <p className="text-[11px] text-emerald-800 font-semibold">{exp.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5 font-bold font-mono">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{exp.rating}</span>
                      <span className="text-neutral-400 font-normal">({exp.consultationCount} answered)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                  {exp.bio}
                </p>

                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] space-y-1">
                  <div><strong>Specialty:</strong> {exp.specialization}</div>
                  <div><strong>Affiliation:</strong> {exp.organization}</div>
                  <div className="text-neutral-500">Available: {exp.availableDays?.join(', ')}</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenAsk(exp)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition-colors"
              >
                Request Advice from {exp.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Consultations Thread History */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-neutral-900">
              {isExpert ? 'Farmer Consultation Queue' : 'My Agronomic Inquiries'} ({consultations.length})
            </h3>
          </div>
          {isExpert && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
              Expert Mode Active
            </span>
          )}
        </div>

        {consultations.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No consultations yet. Submit your first crop inquiry above.
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map(c => (
              <div
                key={c._id}
                className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/70 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded-md mr-2">
                      {c.cropName}
                    </span>
                    <h4 className="font-bold text-neutral-900 text-sm inline">
                      {c.subject}
                    </h4>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      From: <strong>{c.farmerName}</strong> · Addressed to: <strong>{c.expertName}</strong> · {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md self-start sm:self-auto ${
                    c.status === 'Answered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200/60 text-xs text-neutral-700 leading-relaxed">
                  {c.question}
                </div>

                {/* Answer box if answered */}
                {c.answer && (
                  <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{c.expertName}'s Prescription</span>
                    </div>
                    <p className="text-emerald-900 leading-relaxed pl-5">
                      {c.answer}
                    </p>
                  </div>
                )}

                {/* Expert Answer Input (If unanswered and user is Expert/Admin) */}
                {isExpert && c.status === 'Pending' && (
                  <div className="pt-2 border-t border-neutral-200 space-y-2">
                    {answeringId === c._id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Provide scientific agronomic diagnosis, active ingredients dosage, and timing..."
                          className="w-full p-2.5 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setAnsweringId(null);
                              setAnswerText('');
                            }}
                            className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200/60 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendAnswer(c._id)}
                            disabled={savingAnswer}
                            className="px-4 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                          >
                            {savingAnswer ? 'Submitting...' : 'Send Prescription to Farmer'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnsweringId(c._id);
                          setAnswerText('');
                        }}
                        className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Answer Inquiry</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">
                Consult with {selectedExpert ? selectedExpert.name : 'Agricultural Specialist'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Inquiry Subject *</label>
                <input
                  type="text"
                  required
                  value={questionForm.subject}
                  onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                  placeholder="e.g. Zinc deficiency symptoms on wheat tillering"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    value={questionForm.cropName}
                    onChange={(e) => setQuestionForm({ ...questionForm, cropName: e.target.value })}
                    placeholder="e.g. Sharbati Wheat"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Urgency Priority</label>
                  <select
                    value={questionForm.priority}
                    onChange={(e) => setQuestionForm({ ...questionForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Normal">Normal (Response within 24h)</option>
                    <option value="Urgent">Urgent (Immediate Disease Risk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Detailed Question *</label>
                <textarea
                  rows={4}
                  required
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="Describe crop symptoms, age, soil condition, previous sprays applied..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
