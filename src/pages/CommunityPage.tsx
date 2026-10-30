import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  Users,
  MessageCircle,
  ThumbsUp,
  Share2,
  Plus,
  Search,
  Send,
  Trash2,
  Tag,
  X
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Crop Care',
  'Soil Management',
  'Irrigation',
  'Market & Prices',
  'General Farming'
] as const;

export const CommunityPage: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  // New post modal
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'General Farming',
    tags: 'SmartFarming, Agronomy'
  });
  const [submitting, setSubmitting] = useState(false);

  // Active commenting post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/community/posts');
      const data = await res.json();
      if (data.success && data.data) {
        setPosts(data.data);
      }
    } catch (err) {
      console.warn('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPosts(prev => prev.map(p => p._id === postId ? {
          ...p,
          likes: data.data.likes,
          likesCount: data.data.likesCount
        } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !token) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      const data = await res.json();

      if (data.success && data.data) {
        setPosts(prev => prev.map(p => p._id === postId ? {
          ...p,
          comments: [...(p.comments || []), data.data],
          commentsCount: (p.commentsCount || 0) + 1
        } : p));
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this community post?')) return;
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) return;

    try {
      setSubmitting(true);
      const tagArray = postForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: postForm.title,
          content: postForm.content,
          category: postForm.category,
          tags: tagArray
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsNewPostOpen(false);
        setPostForm({
          title: '',
          content: '',
          category: 'General Farming',
          tags: 'SmartFarming'
        });
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_community')} Forum
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Share practical farming field insights, ask neighbor questions, and exchange agricultural wisdom.
          </p>
        </div>

        <button
          onClick={() => setIsNewPostOpen(true)}
          className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions, seed queries, pest experiences..."
            className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
          <Users className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-base">No Discussions Found</h3>
          <p className="text-xs text-neutral-500">
            Be the first farmer to share an observation or ask an agronomic question!
          </p>
          <button
            onClick={() => setIsNewPostOpen(true)}
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const isLiked = user && post.likes?.includes(user._id);
            const canDelete = user && (user._id === post.userId || user.role === 'Admin');

            return (
              <div
                key={post._id}
                className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 hover:border-emerald-600/40 transition-colors"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-950 font-bold text-xs flex items-center justify-center">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 text-xs">{post.authorName}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                          {post.authorRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {new Date(post.createdAt).toLocaleDateString()} · {post.category}
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons: Like and Comment Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${
                        isLiked ? 'text-emerald-800' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-emerald-800' : ''}`} />
                      <span className="font-mono tabular-nums">{post.likesCount || 0} Upvotes</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                      className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-mono tabular-nums">{post.commentsCount || 0} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comments Thread Section */}
                {activeCommentPostId === post._id && (
                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    {/* Comments list */}
                    <div className="space-y-2">
                      {post.comments?.map((c: any) => (
                        <div key={c._id} className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-neutral-900">{c.authorName} ({c.authorRole})</span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-neutral-700 leading-normal">{c.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* New comment input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post._id);
                        }}
                        placeholder="Write a reply or share your local experience..."
                        className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Post Modal */}
      {isNewPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">Share with Community</h3>
              <button
                onClick={() => setIsNewPostOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Observations after applying vermicompost on Sharbati wheat"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Category</label>
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Content / Observation *</label>
                <textarea
                  rows={4}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Share details of soil type, dosage applied, plant responses, and advice for other farmers..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={postForm.tags}
                  onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                  placeholder="Wheat, Vermicompost, OrganicFarming"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPostOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  {submitting ? 'Posting...' : 'Publish Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
