import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllContent, updateContentStatus, deleteContent, ContentItem, ContentStatus } from '@/services/firebase/cms';
import { Check, X, Edit, Eye, Filter, Loader2, UploadCloud, Trash2, FileText, Briefcase, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import TestimonialManager from './TestimonialManager';

interface ContentListProps {
  onEdit: (item: ContentItem) => void;
  onCreateNew: () => void;
}

export default function ContentList({ onEdit, onCreateNew }: ContentListProps) {
  const { currentUser } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'case_study'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'articles' | 'testimonials'>('articles');


  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getAllContent();
      // Sort by latest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setContent(data);
    } catch (err) {
      console.error('Failed to fetch content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    setActionLoading(id);
    try {
      await updateContentStatus(id, status, currentUser?.uid);
      await fetchContent();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;
    
    setActionLoading(id);
    try {
      await deleteContent(id);
      await fetchContent();
    } catch (err) {
      console.error('Failed to delete content', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const typeMatch = typeFilter === 'all' || item.contentType === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [content, statusFilter, typeFilter]);

  const StatusBadge = ({ status }: { status: ContentStatus }) => {
    const colors = {
      published: 'bg-green-500/10 text-green-600 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      approved: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
      draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex border-b border-m3-outline/10 gap-2 mb-2">
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'articles'
              ? 'border-m3-primary text-m3-primary'
              : 'border-transparent text-m3-on-surface/50 hover:text-m3-on-surface'
          }`}
        >
          <FileText className="w-4.5 h-4.5" /> Articles (Blogs & Cases)
        </button>
        <button
          onClick={() => setActiveSubTab('testimonials')}
          className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'testimonials'
              ? 'border-m3-primary text-m3-primary'
              : 'border-transparent text-m3-on-surface/50 hover:text-m3-on-surface'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5" /> Testimonial Moderation
        </button>
      </div>

      {activeSubTab === 'articles' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-4 bg-white dark:bg-[#1d1b20] p-6 rounded-[32px] border border-m3-outline/10 shadow-sm">
            {/* Content Type Filter */}
            <div className="flex flex-wrap gap-2 items-center border-b border-m3-outline/10 pb-4">
              <FileText className="w-5 h-5 text-m3-on-surface/40 mx-2" />
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  typeFilter === 'all' ? 'bg-m3-primary/10 text-m3-primary border border-m3-primary/20' : 'bg-transparent text-m3-on-surface/60 hover:bg-m3-surface-container'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('blog')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  typeFilter === 'blog' ? 'bg-m3-primary/10 text-m3-primary border border-m3-primary/20' : 'bg-transparent text-m3-on-surface/60 hover:bg-m3-surface-container'
                }`}
              >
                Blogs
              </button>
              <button
                onClick={() => setTypeFilter('case_study')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  typeFilter === 'case_study' ? 'bg-m3-primary/10 text-m3-primary border border-m3-primary/20' : 'bg-transparent text-m3-on-surface/60 hover:bg-m3-surface-container'
                }`}
              >
                Case Studies
              </button>
              
              <div className="ml-auto">
                <button
                  onClick={onCreateNew}
                  className="px-6 py-2 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 hover:bg-m3-primary/90 shadow-md shadow-m3-primary/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create New
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="w-5 h-5 text-m3-on-surface/40 mx-2" />
              {(['all', 'pending', 'approved', 'published', 'draft', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-m3-primary text-white shadow-md'
                      : 'bg-transparent text-m3-on-surface/60 hover:bg-m3-surface-container'
                  }`}
                >
                  {s}
                </button>
              ))}
              <div className="ml-auto flex items-center px-4">
                <span className="text-xs font-bold text-m3-on-surface/40 uppercase tracking-widest">
                  Total: {filteredContent.length}
                </span>
              </div>
            </div>
          </div>

          {/* Content Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 text-m3-primary animate-spin" />
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-12 rounded-[32px] text-center">
              <p className="text-m3-on-surface/40 font-medium">No content found for this filter.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredContent.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                    {/* Info */}
                    <div className="flex-1 flex items-start gap-4">
                      {item.headerImage ? (
                        <img
                          src={item.headerImage}
                          alt={item.title}
                          className="w-24 h-24 rounded-[16px] object-cover shrink-0 border border-m3-outline/10"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-[16px] bg-m3-surface-container flex items-center justify-center shrink-0 border border-m3-outline/10">
                          <Eye className="w-6 h-6 text-m3-on-surface/20" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={item.status} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40">
                            {item.contentType}
                          </span>
                        </div>
                        <h3 className="text-lg font-display font-medium text-m3-on-surface line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-m3-on-surface/60 line-clamp-1">
                          By {item.authorName || 'Anonymous'} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 md:pl-6 md:border-l border-m3-outline/10" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-3 rounded-full hover:bg-m3-surface-container text-m3-on-surface/60 hover:text-m3-primary transition-colors cursor-pointer"
                        title="Edit Content"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, 'approved')}
                            disabled={actionLoading === item.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                            disabled={actionLoading === item.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {(item.status === 'approved' || item.status === 'draft') && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'published')}
                          disabled={actionLoading === item.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-m3-primary text-white hover:bg-m3-primary/90 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-m3-primary/20 cursor-pointer"
                          title="Publish"
                        >
                          <UploadCloud className="w-4 h-4" /> Publish
                        </button>
                      )}

                      {item.status === 'published' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'draft')}
                          disabled={actionLoading === item.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-m3-outline/20 text-m3-on-surface/60 hover:bg-m3-surface-container text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                          title="Unpublish"
                        >
                          <X className="w-4 h-4" /> Unpublish
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading === item.id}
                        className="p-3 rounded-full hover:bg-red-500/10 text-m3-on-surface/40 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Content"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      {actionLoading === item.id && (
                        <Loader2 className="w-5 h-5 text-m3-primary animate-spin ml-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        <TestimonialManager />
      )}
    </div>
  );

}
