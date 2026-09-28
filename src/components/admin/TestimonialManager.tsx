import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, Edit, Eye, Filter, Loader2, UploadCloud, Trash2, Plus, 
  MessageSquare, Search, Calendar, User, Building, Archive, Info, 
  AlertCircle, ChevronRight, Save, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import { 
  getAllTestimonials, getTestimonialSubmissions, saveTestimonial, 
  deleteTestimonial, deleteTestimonialSubmission, uploadImage,
  TestimonialItem, TestimonialStatus
} from '@/services/firebase/cms';
import { STATIC_TESTIMONIALS } from '@/data/testimonials';

export default function TestimonialManager() {
  const { currentUser } = useAuth();
  
  // Testimonials Lists
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [submissions, setSubmissions] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting
  const [statusFilter, setStatusFilter] = useState<TestimonialStatus | 'all'>('pending');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'public_submission' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'latest_reviewed'>('newest');
  
  // Editor and Create states
  const [selectedItem, setSelectedItem] = useState<TestimonialItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form States
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formText, setFormText] = useState('');
  const [formStatus, setFormStatus] = useState<TestimonialStatus>('draft');
  const [formSourceType, setFormSourceType] = useState<'public_submission' | 'admin'>('admin');
  const [formModerationNote, setFormModerationNote] = useState('');
  const [formConsentGiven, setFormConsentGiven] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  
  // Image Uploads
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // UI states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchAllData = async () => {
    setLoading(true);
    let moderatedData: TestimonialItem[] = [];
    let submissionsData: TestimonialItem[] = [];

    try {
      moderatedData = await getAllTestimonials();
    } catch (err) {
      console.error('Failed to fetch testimonials from Firebase:', err);
    }

    try {
      submissionsData = await getTestimonialSubmissions();
    } catch (err) {
      console.error('Failed to fetch submissions from Firebase:', err);
    }

    try {
      // Seed static hardcoded testimonials if database is empty
      if (moderatedData.length === 0) {
        console.log("Seeding hardcoded testimonials to Firebase RTDB...");
        const promises = STATIC_TESTIMONIALS.map(async (t) => {
          const item: TestimonialItem = {
            id: t.id,
            name: t.name,
            company: t.company,
            role: t.role || undefined,
            testimonial: t.testimonial,
            status: 'published',
            sourceType: 'admin',
            featured: t.featured || false,
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: t.createdAt || new Date().toISOString(),
            avatarUrl: t.imgSrc || null
          };
          return saveTestimonial(item, t.createdAt);
        });
        await Promise.all(promises);
        
        // Re-fetch seeded data
        moderatedData = await getAllTestimonials();
      }
    } catch (err) {
      console.error('Failed to seed testimonials:', err);
    }

    setTestimonials(moderatedData);
    setSubmissions(submissionsData);
    setLoading(false);
  };


  useEffect(() => {
    fetchAllData();
  }, []);

  // Combine lists for filtering
  const allCombinedItems = useMemo(() => {
    const mappedSubmissions = submissions.map(sub => ({
      ...sub,
      status: 'pending' as TestimonialStatus,
      sourceType: 'public_submission' as const
    }));
    
    return [...mappedSubmissions, ...testimonials];
  }, [testimonials, submissions]);

  // Filtered and sorted items list
  const filteredItems = useMemo(() => {
    let result = allCombinedItems.filter(item => {
      // Status Filter
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      
      // Source Filter
      const sourceMatch = sourceFilter === 'all' || item.sourceType === sourceFilter;
      
      // Search Query Match
      const searchMatch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.testimonial.toLowerCase().includes(searchQuery.toLowerCase());
        
      return statusMatch && sourceMatch && searchMatch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'latest_reviewed') {
        const timeA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
        const timeB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [allCombinedItems, statusFilter, sourceFilter, searchQuery, sortBy]);

  // Quick Action Workflow handlers
  const handleApprove = async (item: TestimonialItem) => {
    setActionLoading(item.id);
    try {
      const now = new Date().toISOString();
      const updatedItem: TestimonialItem = {
        ...item,
        status: 'approved',
        reviewedAt: now,
        reviewedBy: currentUser?.email || 'admin',
        updatedAt: now
      };
      
      // Save in testimonials path
      await saveTestimonial(updatedItem, item.createdAt);
      
      // If it was a submission, delete from submissions path
      if (item.sourceType === 'public_submission' && submissions.some(s => s.id === item.id)) {
        await deleteTestimonialSubmission(item.id);
      }
      
      await fetchAllData();
    } catch (err) {
      console.error('Failed to approve testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item: TestimonialItem) => {
    setActionLoading(item.id);
    try {
      const now = new Date().toISOString();
      const updatedItem: TestimonialItem = {
        ...item,
        status: 'rejected',
        reviewedAt: now,
        reviewedBy: currentUser?.email || 'admin',
        updatedAt: now
      };
      
      // Save in testimonials path
      await saveTestimonial(updatedItem, item.createdAt);
      
      // If it was a submission, delete from submissions path
      if (item.sourceType === 'public_submission' && submissions.some(s => s.id === item.id)) {
        await deleteTestimonialSubmission(item.id);
      }
      
      await fetchAllData();
    } catch (err) {
      console.error('Failed to reject testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (item: TestimonialItem) => {
    setActionLoading(item.id);
    try {
      const now = new Date().toISOString();
      const updatedItem: TestimonialItem = {
        ...item,
        status: 'published',
        publishedAt: now,
        reviewedAt: item.reviewedAt || now,
        reviewedBy: item.reviewedBy || currentUser?.email || 'admin',
        updatedAt: now
      };
      
      await saveTestimonial(updatedItem, item.createdAt);
      
      // Ensure it's not left in submissions
      if (item.sourceType === 'public_submission' && submissions.some(s => s.id === item.id)) {
        await deleteTestimonialSubmission(item.id);
      }
      
      await fetchAllData();
    } catch (err) {
      console.error('Failed to publish testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (item: TestimonialItem) => {
    setActionLoading(item.id);
    try {
      const now = new Date().toISOString();
      const updatedItem: TestimonialItem = {
        ...item,
        status: 'draft',
        updatedAt: now
      };
      
      await saveTestimonial(updatedItem, item.createdAt);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to unpublish testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (item: TestimonialItem) => {
    setActionLoading(item.id);
    try {
      const now = new Date().toISOString();
      const updatedItem: TestimonialItem = {
        ...item,
        status: 'archived',
        updatedAt: now
      };
      
      await saveTestimonial(updatedItem, item.createdAt);
      
      if (item.sourceType === 'public_submission' && submissions.some(s => s.id === item.id)) {
        await deleteTestimonialSubmission(item.id);
      }
      
      await fetchAllData();
    } catch (err) {
      console.error('Failed to archive testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteItem = async (item: TestimonialItem) => {
    if (!window.confirm("Are you sure you want to permanently delete this testimonial? This action cannot be undone.")) return;
    
    setActionLoading(item.id);
    try {
      if (item.status === 'pending') {
        await deleteTestimonialSubmission(item.id);
      } else {
        await deleteTestimonial(item.id);
      }
      await fetchAllData();
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Image Upload selectors
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setAvatarUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setLogoUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Open creation panel
  const handleOpenCreate = () => {
    setFormName('');
    setFormCompany('');
    setFormRole('');
    setFormText('');
    setFormStatus('draft');
    setFormSourceType('admin');
    setFormModerationNote('');
    setFormConsentGiven(true);
    setFormFeatured(false);
    setAvatarUrl(null);
    setAvatarFile(null);
    setLogoUrl(null);
    setLogoFile(null);
    setIsCreating(true);
    setIsEditing(false);
    setSelectedItem(null);
  };

  // Open detail/edit panel
  const handleOpenEdit = (item: TestimonialItem) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormCompany(item.company);
    setFormRole(item.role || '');
    setFormText(item.testimonial);
    setFormStatus(item.status);
    setFormSourceType(item.sourceType);
    setFormModerationNote(item.moderationNote || '');
    setFormConsentGiven(item.consentGiven !== false);
    setFormFeatured(item.featured || false);
    setAvatarUrl(item.avatarUrl || null);
    setAvatarFile(null);
    setLogoUrl(item.companyLogoUrl || null);
    setLogoFile(null);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Handle Save / Submit from editor/creator
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCompany.trim() || !formText.trim()) return;

    setIsSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;
      let finalLogoUrl = logoUrl;

      // Upload files if modified
      if (avatarFile) {
        finalAvatarUrl = await uploadImage(avatarFile, 'avatars');
      }
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, 'company_logos');
      }

      const id = selectedItem?.id || 't_' + Date.now().toString();
      const now = new Date().toISOString();

      let reviewedAt = selectedItem?.reviewedAt;
      let reviewedBy = selectedItem?.reviewedBy;
      let publishedAt = selectedItem?.publishedAt;

      // Update timestamps if status changes
      if (formStatus !== selectedItem?.status) {
        if (formStatus === 'approved' || formStatus === 'published' || formStatus === 'rejected') {
          reviewedAt = now;
          reviewedBy = currentUser?.email || 'admin';
        }
        if (formStatus === 'published') {
          publishedAt = now;
        }
      }

      const testimonialPayload: TestimonialItem = {
        id,
        name: formName.trim(),
        company: formCompany.trim(),
        role: formRole.trim() || undefined,
        testimonial: formText.trim(),
        status: formStatus,
        sourceType: formSourceType,
        companyLogoUrl: finalLogoUrl,
        avatarUrl: finalAvatarUrl,
        consentGiven: formConsentGiven,
        moderationNote: formModerationNote.trim() || undefined,
        featured: formFeatured,
        createdAt: selectedItem?.createdAt || now,
        updatedAt: now,
        reviewedAt,
        reviewedBy,
        publishedAt,
        submittedByEmail: selectedItem?.submittedByEmail || undefined
      };

      await saveTestimonial(testimonialPayload, selectedItem?.createdAt);

      // Clean up submission node if this was a pending submission being approved/saved by admin
      if (selectedItem?.status === 'pending' && selectedItem.sourceType === 'public_submission') {
        await deleteTestimonialSubmission(selectedItem.id);
      }

      await fetchAllData();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to save testimonial:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: TestimonialStatus) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'approved': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'draft': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'archived': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Testimonials List Column */}
      <div className={`space-y-6 ${isEditing || isCreating ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
        
        {/* Controls Bar */}
        <div className="bg-white dark:bg-[#1d1b20] p-6 rounded-[32px] border border-m3-outline/10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-display font-semibold text-m3-on-surface">Testimonial Repository</h2>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 hover:bg-m3-primary/90 shadow-md shadow-m3-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Testimonial
            </button>
          </div>

          {/* Sub-status Tab selection */}
          <div className="flex flex-wrap gap-2 border-b border-m3-outline/10 pb-4">
            {([
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending Review' },
              { id: 'draft', label: 'Drafts' },
              { id: 'published', label: 'Published' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'archived', label: 'Archived' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  statusFilter === tab.id
                    ? 'bg-m3-primary text-white shadow-sm'
                    : 'bg-transparent text-m3-on-surface/60 hover:bg-m3-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Source Filter & Sorting */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-m3-on-surface/40" />
              <input
                type="text"
                placeholder="Search name, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-m3-surface dark:bg-m3-surface/10 border border-m3-outline/10 focus:border-m3-primary rounded-full focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
              {/* Source Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-m3-on-surface/40 font-bold uppercase tracking-wider">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as any)}
                  className="bg-m3-surface dark:bg-m3-surface-container px-3 py-1.5 text-xs font-medium rounded-full border border-m3-outline/10 text-m3-on-surface focus:outline-none"
                >
                  <option value="all">All Sources</option>
                  <option value="public_submission">Public</option>
                  <option value="admin">Admin-Created</option>
                </select>
              </div>

              {/* Sorting Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-m3-on-surface/40 font-bold uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-m3-surface dark:bg-m3-surface-container px-3 py-1.5 text-xs font-medium rounded-full border border-m3-outline/10 text-m3-on-surface focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="latest_reviewed">Latest Reviewed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials List Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-m3-primary animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-12 rounded-[32px] text-center">
            <AlertCircle className="w-8 h-8 text-m3-on-surface/20 mx-auto mb-4" />
            <p className="text-m3-on-surface/40 font-semibold">No testimonials found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleOpenEdit(item)}
                  className={`bg-white dark:bg-[#1d1b20] border p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 cursor-pointer hover:shadow-md hover:border-m3-primary/20 transition-all ${
                    selectedItem?.id === item.id ? 'border-m3-primary/40 shadow-md ring-1 ring-m3-primary/10 bg-m3-primary/[0.01]' : 'border-m3-outline/10'
                  }`}
                >
                  {/* Left Side: Avatar and metadata */}
                  <div className="flex-1 flex items-start gap-4">
                    {item.avatarUrl ? (
                      <img 
                        src={item.avatarUrl} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-m3-outline/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-m3-surface-container flex items-center justify-center shrink-0 border border-m3-outline/10 text-m3-on-surface/40">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-m3-on-surface/40 bg-m3-surface-container px-2 py-0.5 rounded-full">
                          {item.sourceType === 'public_submission' ? 'Public Submission' : 'Admin Authored'}
                        </span>
                        {item.featured && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <blockquote className="text-sm italic font-medium text-m3-on-surface/80 leading-relaxed pr-6 line-clamp-3">
                        "{item.testimonial}"
                      </blockquote>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-m3-primary">{item.name}</span>
                        <span className="text-m3-on-surface/30">•</span>
                        <span className="text-m3-on-surface/60 font-medium">{item.role ? `${item.role}, ` : ''}{item.company}</span>
                        {item.companyLogoUrl && (
                          <img src={item.companyLogoUrl} alt="Logo" className="h-4 object-contain opacity-50 max-w-16 ml-1.5" />
                        )}
                      </div>
                      
                      <div className="text-[10px] text-m3-on-surface/40 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> Submitted: {new Date(item.createdAt).toLocaleDateString()}
                        {item.reviewedAt && ` • Reviewed: ${new Date(item.reviewedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div 
                    className="flex flex-wrap md:flex-col items-center justify-end gap-2 shrink-0 md:pl-4 md:border-l border-m3-outline/10"
                    onClick={(e) => e.stopPropagation()} // Stop clicking button from opening editor
                  >
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handlePublish(item)}
                          disabled={actionLoading === item.id}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-green-600/10 cursor-pointer"
                          title="Approve and Publish Testimonial"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Pub
                        </button>
                        <button
                          onClick={() => handleReject(item)}
                          disabled={actionLoading === item.id}
                          className="flex items-center justify-center p-2.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Reject Submission"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {item.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(item)}
                        disabled={actionLoading === item.id}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-m3-primary/10 cursor-pointer"
                        title="Publish Testimonial"
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}

                    {item.status === 'published' && (
                      <button
                        onClick={() => handleUnpublish(item)}
                        disabled={actionLoading === item.id}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-m3-outline/30 text-m3-on-surface/70 hover:bg-m3-surface-container transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
                        title="Move to Drafts"
                      >
                        <X className="w-3.5 h-3.5" /> Unpublish
                      </button>
                    )}

                    {(item.status === 'approved' || item.status === 'rejected') && (
                      <div className="flex gap-2">
                        {item.status === 'approved' && (
                          <button
                            onClick={() => handlePublish(item)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-m3-primary/90 transition-all cursor-pointer"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(item)}
                          disabled={actionLoading === item.id}
                          className="flex items-center justify-center p-2.5 rounded-full hover:bg-m3-surface-container text-m3-on-surface/40 hover:text-purple-600 transition-all cursor-pointer"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {item.status === 'archived' && (
                      <button
                        onClick={() => handleUnpublish(item)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 rounded-full border border-m3-outline/20 text-m3-on-surface/60 hover:bg-m3-surface-container text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Restore Draft
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2.5 rounded-full hover:bg-m3-surface-container text-m3-on-surface/50 hover:text-m3-primary transition-all cursor-pointer"
                        title="Open Details & Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        disabled={actionLoading === item.id}
                        className="p-2.5 rounded-full hover:bg-red-500/10 text-m3-on-surface/30 hover:text-red-500 transition-all cursor-pointer"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {actionLoading === item.id && (
                      <Loader2 className="w-4 h-4 text-m3-primary animate-spin mt-1" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Editor Panel Column (Sliding in / appearing side panel) */}
      <AnimatePresence>
        {(isEditing || isCreating) && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="lg:col-span-5 bg-white dark:bg-[#1d1b20] border border-m3-outline/10 rounded-[32px] p-6 md:p-8 shadow-lg space-y-6 sticky top-6 overflow-y-auto max-h-[85vh] custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-m3-outline/10 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-m3-primary flex items-center gap-2">
                <Info className="w-4 h-4" />
                {isCreating ? 'Author Testimonial' : 'Review & Moderate'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setSelectedItem(null);
                }}
                className="w-8 h-8 rounded-full bg-m3-surface-container flex items-center justify-center text-m3-on-surface/60 hover:text-m3-on-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Testimonial Form */}
            <form onSubmit={handleSaveForm} className="space-y-5">
              
              {/* Author name & title */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/50 mb-1.5">
                    Author Name <span className="text-m3-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Sarah Lin"
                    className="w-full px-4 py-2.5 rounded-xl bg-m3-surface dark:bg-m3-surface/10 border border-m3-outline/15 text-sm focus:border-m3-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/50 mb-1.5">
                      Company <span className="text-m3-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="Tech Nexus"
                      className="w-full px-4 py-2.5 rounded-xl bg-m3-surface dark:bg-m3-surface/10 border border-m3-outline/15 text-sm focus:border-m3-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/50 mb-1.5">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="Senior Project Owner"
                      className="w-full px-4 py-2.5 rounded-xl bg-m3-surface dark:bg-m3-surface/10 border border-m3-outline/15 text-sm focus:border-m3-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Text Area content */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/50 mb-1.5">
                  Testimonial Quote <span className="text-m3-primary">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Insert the review quote here..."
                  className="w-full px-4 py-3 rounded-xl bg-m3-surface dark:bg-m3-surface/10 border border-m3-outline/15 text-sm focus:border-m3-primary focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Avatar and Logo Uploads */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-m3-surface dark:bg-m3-surface/5 rounded-2xl border border-m3-outline/10">
                
                {/* Avatar Column */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-2.5">Avatar Image</span>
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-16 h-16 rounded-full bg-white dark:bg-[#1c1b22] border-2 border-dashed border-m3-outline/25 flex items-center justify-center cursor-pointer overflow-hidden group relative hover:border-m3-primary"
                  >
                    {avatarUrl ? (
                      <>
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-opacity">Replace</div>
                      </>
                    ) : (
                      <ImageIcon className="w-4 h-4 text-m3-on-surface/20 group-hover:text-m3-primary" />
                    )}
                  </div>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  {avatarUrl && (
                    <button 
                      type="button" 
                      onClick={() => { setAvatarUrl(null); setAvatarFile(null); }}
                      className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-1.5 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Company Logo Column */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-2.5">Company Logo</span>
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1c1b22] border-2 border-dashed border-m3-outline/25 flex items-center justify-center cursor-pointer overflow-hidden group relative hover:border-m3-primary"
                  >
                    {logoUrl ? (
                      <>
                        <img src={logoUrl} alt="Logo" className="w-[85%] h-[85%] object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-opacity">Replace</div>
                      </>
                    ) : (
                      <Building className="w-4 h-4 text-m3-on-surface/20 group-hover:text-m3-primary" />
                    )}
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                  {logoUrl && (
                    <button 
                      type="button" 
                      onClick={() => { setLogoUrl(null); setLogoFile(null); }}
                      className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-1.5 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status and Visibility Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/50 mb-1.5">
                    Moderation Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TestimonialStatus)}
                    className="w-full bg-m3-surface dark:bg-m3-surface-container px-3 py-2.5 rounded-xl border border-m3-outline/15 text-sm text-m3-on-surface focus:outline-none focus:ring-1 focus:ring-m3-primary"
                  >
                    <option value="draft">Draft (hidden, editable)</option>
                    <option value="pending">Pending Review (moderation inbox)</option>
                    <option value="approved">Approved (curated, not published yet)</option>
                    <option value="published">Published (live on website)</option>
                    <option value="rejected">Rejected (hidden from frontend)</option>
                    <option value="archived">Archived (historical, hidden)</option>
                  </select>
                </div>

                {/* Moderation Notes */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/50 mb-1.5">
                    Internal Moderation Notes
                  </label>
                  <input
                    type="text"
                    value={formModerationNote}
                    onChange={(e) => setFormModerationNote(e.target.value)}
                    placeholder="E.g., Approved after spelling checks. Or: waiting for client approval."
                    className="w-full px-4 py-2.5 rounded-xl bg-m3-surface dark:bg-m3-surface/10 border border-m3-outline/15 text-sm focus:border-m3-primary focus:outline-none"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-m3-on-surface/80">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded border-m3-outline/30 text-m3-primary focus:ring-m3-primary w-4 h-4"
                    />
                    Feature on Homepage Testimonial Slider
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-m3-on-surface/80">
                    <input
                      type="checkbox"
                      checked={formConsentGiven}
                      onChange={(e) => setFormConsentGiven(e.target.checked)}
                      className="rounded border-m3-outline/30 text-m3-primary focus:ring-m3-primary w-4 h-4"
                    />
                    Consent granted for public display
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-m3-outline/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setSelectedItem(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-m3-outline/20 text-xs font-bold uppercase tracking-wider text-m3-on-surface/70 hover:bg-m3-surface-container transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-m3-primary/95 transition-all shadow-md shadow-m3-primary/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Testimonial
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
