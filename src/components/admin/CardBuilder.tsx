import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllCards, saveCard, getPublishedContent, getPublishedTestimonials, CardItem, ContentItem, deleteCard, uploadImage } from '../../lib/firebase/cms';
import {
  Plus, Trash2, Layout, Image as ImageIcon, Save, Check, X,
  Upload, Link, Sparkles, Quote, ArrowRight, Edit2, Eye,
  EyeOff, Layers, FileText, FolderGit2, Info, Moon, Sun, ArrowUpDown
} from 'lucide-react';

type ExtendedCardType = 'standard' | 'hero' | 'minimal' | 'media_showcase' | 'quote' | 'compact' | 'case_study' | 'dual_content' | 'custom';

export default function CardBuilder() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [publishedContent, setPublishedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder panel visibility and edit lifecycle states
  const [isCreating, setIsCreating] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  // Form Configuration States
  const [selectedContent, setSelectedContent] = useState('');
  const [section, setSection] = useState('sidebar-writings');
  const [cardType, setCardType] = useState<ExtendedCardType>('standard');
  const [titleOverride, setTitleOverride] = useState('');
  const [textOverride, setTextOverride] = useState('');
  const [imageOverride, setImageOverride] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);

  // Search/Filter for Content
  const [contentSearch, setContentSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedCards, fetchedContent, fetchedTestimonials] = await Promise.all([
        getAllCards(),
        getPublishedContent(),
        getPublishedTestimonials()
      ]);
      
      // Map testimonials to compatible ContentItem shape
      const mappedTestimonials: ContentItem[] = fetchedTestimonials.map(t => ({
        id: t.id,
        contentType: 'testimonial',
        status: 'published',
        title: `Testimonial: ${t.name} (${t.company})`,
        excerpt: t.testimonial,
        content: t.testimonial,
        headerImage: t.avatarUrl || null,
        authorName: t.name,
        badgeText: t.role || t.company,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      setCards(fetchedCards.sort((a, b) => a.sortOrder - b.sortOrder));
      setPublishedContent([...fetchedContent, ...mappedTestimonials]);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Sync editing card fields when editingCardId changes
  const handleEdit = (card: CardItem) => {
    setEditingCardId(card.id);
    setIsCreating(true);
    setSelectedContent(card.sourceId);
    setSection(card.section);

    // Map legacy cardType strings if necessary
    let initialType: ExtendedCardType = 'standard';
    if (card.cardType === 'hero') initialType = 'media_showcase';
    else if (card.cardType === 'minimal') initialType = 'compact';
    else initialType = card.cardType as ExtendedCardType;

    setCardType(initialType);
    setTitleOverride(card.titleOverride || '');
    setTextOverride(card.textOverride || '');
    setImageOverride(card.imageOverride || '');
    setImageFile(null);
    setSortOrder(card.sortOrder);

    // Scroll smoothly to top form workspace
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingCardId(null);
    setSelectedContent('');
    setSection('sidebar-writings');
    setCardType('standard');
    setTitleOverride('');
    setTextOverride('');
    setImageOverride('');
    setImageFile(null);
    setSortOrder(cards.length);
  };

  const handleCreateNewClick = () => {
    handleCancelEdit();
    setIsCreating(true);
    setSortOrder(cards.length);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create local object URL for instant, zero-upload live previews
      const localUrl = URL.createObjectURL(file);
      setImageOverride(localUrl);
    }
  };

  const handleSaveCard = async () => {
    if (!selectedContent) return;

    setSavingCardId(editingCardId || 'new');
    try {
      const sourceContent = publishedContent.find(c => c.id === selectedContent);
      if (!sourceContent) return;

      let finalImageUrl = imageOverride;
      // If a file was selected, upload it to storage now
      if (imageFile) {
        // Remove the local object URL reference
        finalImageUrl = await uploadImage(imageFile, 'card-overrides');
      }

      // Preserve legacy types when saving if standard compatibility is needed, 
      // but otherwise save the layout name directly.
      const savedCardType = cardType === 'media_showcase' ? 'hero' : (cardType === 'compact' ? 'minimal' : cardType);

      const payload: any = {
        sourceId: sourceContent.id,
        sourceType: sourceContent.contentType,
        cardType: savedCardType as any,
        section,
        sortOrder: Number(sortOrder) || 0,
        active: true,
      };

      if (titleOverride && titleOverride.trim()) {
        payload.titleOverride = titleOverride.trim();
      }
      if (textOverride && textOverride.trim()) {
        payload.textOverride = textOverride.trim();
      }
      if (finalImageUrl && finalImageUrl.trim()) {
        payload.imageOverride = finalImageUrl.trim();
      }

      await saveCard(payload, editingCardId || undefined);

      handleCancelEdit();
      await fetchData();
    } catch (err) {
      console.error('Failed to save card', err);
      alert('Failed to save card: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingCardId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      await deleteCard(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete card', err);
    }
  };

  // Derive preview items
  const selectedSource = publishedContent.find(c => c.id === selectedContent);
  const previewTitle = titleOverride.trim() || selectedSource?.title || "Draft Card Title";
  const previewText = textOverride.trim() || selectedSource?.excerpt || "Your card description or excerpt will appear here. Select a source content to use its fallback text.";
  const previewImage = imageOverride || selectedSource?.headerImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

  // Badges & Tag mapping
  const previewBadge = selectedSource?.badgeText || selectedSource?.category || (selectedSource?.contentType === 'case_study' ? 'Case Study' : 'Insight');
  const previewDate = selectedSource ? new Date(selectedSource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const previewAuthor = selectedSource?.authorName || "Principal";

  const isTitleOverridden = titleOverride.trim().length > 0;
  const isTextOverridden = textOverride.trim().length > 0;
  const isImageOverridden = imageOverride.trim().length > 0 && !imageOverride.startsWith('blob:');
  const isImageLocalBlob = imageOverride.startsWith('blob:');

  // Filtered source list
  const filteredContent = publishedContent.filter(c =>
    c.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
    c.contentType.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const cardTypes = [
    { id: 'standard', name: 'Standard Insight', icon: Layout, desc: 'Clean header image with floating badge, metadata, and description.' },
    { id: 'media_showcase', name: 'Media Showcase', icon: ImageIcon, desc: 'Full image overlay card with dark gradient and bold typography.' },
    { id: 'quote', name: 'Quote / Testimonial', icon: Quote, desc: 'High-end typographic layout focused on blockquotes and client author blocks.' },
    { id: 'compact', name: 'Compact Text', icon: FileText, desc: '轻量 border card with compact metadata for editorial dense lists.' },
    { id: 'case_study', name: 'Case Study Card', icon: FolderGit2, desc: 'High contrast design with custom service badges and metrics focus.' },
    { id: 'dual_content', name: 'Dual Content split', icon: Layers, desc: 'Horizontal layout split between media column and content.' },
    { id: 'custom', name: 'Custom Blueprint', icon: Sparkles, desc: 'Interactive developer preview showing indicators for customized overrides.' },
  ] as const;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-6 rounded-[28px] shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-m3-on-surface mb-1">Card Builder</h2>
          <p className="text-sm text-m3-on-surface/60">Generate and map UI cards from published blog posts and case studies with real-time visual previews.</p>
        </div>
        {!isCreating ? (
          <button
            onClick={handleCreateNewClick}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-m3-primary/90 transition-all shadow-lg shadow-m3-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Card
          </button>
        ) : (
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-m3-outline/30 text-m3-on-surface/80 hover:bg-m3-surface-container-high text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            <X className="w-4 h-4" /> Close Builder
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column: Configurator Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Form container */}
              <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-8 rounded-[32px] shadow-sm space-y-8">

                {/* Header */}
                <div className="border-b border-m3-outline/10 pb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-m3-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {editingCardId ? 'Edit Active Card' : 'Card Design Architect'}
                  </h3>
                  {editingCardId && (
                    <span className="text-[10px] font-mono bg-m3-primary/10 text-m3-primary px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                      Editing Mode
                    </span>
                  )}
                </div>

                {/* Section 1: Source Content Selector */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/80 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center text-[10px]">1</span>
                      Choose Source Content
                    </label>
                    {selectedSource && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-full border border-green-500/20">
                        {selectedSource.contentType.replace('_', ' ')} Linked
                      </span>
                    )}
                  </div>

                  {selectedSource ? (
                    <div className="bg-m3-surface-container-lowest border border-m3-outline/10 p-4 rounded-2xl flex gap-4 items-center justify-between animate-fadeIn">
                      <div className="flex gap-4 items-center min-w-0 flex-1">
                        {selectedSource.headerImage ? (
                          <img src={selectedSource.headerImage} alt="" className="w-16 h-12 object-cover rounded-lg bg-gray-100" />
                        ) : (
                          <div className="w-16 h-12 bg-m3-surface-container-low rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-m3-on-surface/20" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono text-m3-primary uppercase font-bold tracking-wider">Linked Content Node</div>
                          <h4 className="text-xs font-semibold text-m3-on-surface truncate">{selectedSource.title}</h4>
                          <p className="text-[10px] text-m3-on-surface/60 line-clamp-1">{selectedSource.excerpt || 'No description summary available.'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContent('');
                          setContentSearch('');
                        }}
                        className="px-3.5 py-2 rounded-full border border-m3-outline/25 text-m3-on-surface/70 hover:bg-m3-surface-container hover:text-m3-error text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Search published content by title..."
                        value={contentSearch}
                        onChange={(e) => setContentSearch(e.target.value)}
                        className="w-full bg-m3-surface-container-low border border-m3-outline/15 rounded-xl p-3 text-sm focus:border-m3-primary focus:ring-0 placeholder:text-m3-on-surface/30 text-m3-on-surface"
                      />

                      {contentSearch.trim() !== '' ? (
                        <div className="max-h-48 overflow-y-auto border border-m3-outline/10 rounded-2xl bg-m3-surface-container-lowest divide-y divide-m3-outline/5 animate-fadeIn">
                          {filteredContent.length > 0 ? (
                            filteredContent.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSelectedContent(c.id);
                                  setContentSearch('');
                                }}
                                className="w-full text-left p-3 hover:bg-m3-surface-container-high transition-colors flex items-center gap-3"
                              >
                                {c.headerImage ? (
                                  <img src={c.headerImage} alt="" className="w-10 h-8 object-cover rounded-md" />
                                ) : (
                                  <div className="w-10 h-8 bg-m3-surface-container-low rounded-md flex items-center justify-center">
                                    <ImageIcon className="w-3.5 h-3.5 text-m3-on-surface/20" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] font-bold text-m3-primary block uppercase tracking-wider">
                                    {c.contentType.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs font-semibold text-m3-on-surface line-clamp-1">{c.title}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-m3-on-surface/40">
                              No matching published content found.
                            </div>
                          )}
                        </div>
                      ) : (
                        <select
                          value={selectedContent}
                          onChange={(e) => setSelectedContent(e.target.value)}
                          className="w-full bg-m3-surface-container-low border border-m3-outline/25 rounded-xl p-3.5 text-sm text-m3-on-surface focus:ring-0 focus:border-m3-primary"
                        >
                          <option value="">Browse all published content...</option>
                          {publishedContent.map(c => (
                            <option key={c.id} value={c.id}>{c.title} ({c.contentType.replace('_', ' ')})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 2: Card Type Preset Selector */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/80 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center text-[10px]">2</span>
                    Card Type / Layout Selection
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cardTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = cardType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setCardType(type.id as any)}
                          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:bg-m3-surface-container-high ${isSelected
                              ? 'border-m3-primary bg-m3-primary/5 dark:bg-m3-primary/10 shadow-sm'
                              : 'border-m3-outline/15 bg-transparent'
                            }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-m3-primary text-white' : 'bg-m3-surface-container-high text-m3-on-surface/60'
                            }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-m3-on-surface flex items-center gap-1.5">
                              {type.name}
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-m3-primary" />}
                            </div>
                            <p className="text-[10px] text-m3-on-surface/50 leading-relaxed mt-1">{type.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Content Overrides */}
                <div className="space-y-5">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/80 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center text-[10px]">3</span>
                    Visual Content Overrides (Optional)
                  </label>

                  <div className="space-y-4">
                    {/* Title / Author Override */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-m3-on-surface/60 uppercase tracking-wider">
                          {cardType === 'quote' ? 'Author Name / Attribution' : 'Title Override'}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isTitleOverridden ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' : 'bg-gray-100 text-gray-400 dark:bg-[#25232a] dark:text-gray-600'
                          }`}>
                          {isTitleOverridden ? 'Overridden' : 'Using Fallback'}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={cardType === 'quote' ? "Leave empty to use source title as author" : "Leave empty to use source title"}
                        value={titleOverride}
                        onChange={(e) => setTitleOverride(e.target.value)}
                        className="w-full bg-m3-surface-container-low border border-m3-outline/20 rounded-xl p-3 text-sm focus:border-m3-primary focus:ring-0 text-m3-on-surface"
                      />
                    </div>

                    {/* Excerpt/Quote Override */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-m3-on-surface/60 uppercase tracking-wider">
                          {cardType === 'quote' ? 'Quote Text Override' : 'Excerpt Override'}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isTextOverridden ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' : 'bg-gray-100 text-gray-400 dark:bg-[#25232a] dark:text-gray-600'
                          }`}>
                          {isTextOverridden ? 'Overridden' : 'Using Fallback'}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder={cardType === 'quote' ? "Leave empty to use source description as quote" : "Leave empty to use source description or excerpt"}
                        value={textOverride}
                        onChange={(e) => setTextOverride(e.target.value)}
                        className="w-full bg-m3-surface-container-low border border-m3-outline/20 rounded-xl p-3 text-sm focus:border-m3-primary focus:ring-0 text-m3-on-surface leading-relaxed resize-none"
                      />
                    </div>

                    {/* Image Override (URL or Upload) - Hidden for Quote and Compact cards */}
                    {cardType !== 'quote' && cardType !== 'compact' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-m3-on-surface/60 uppercase tracking-wider">Image Override</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isImageOverridden ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' : (isImageLocalBlob ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' : 'bg-gray-100 text-gray-400 dark:bg-[#25232a] dark:text-gray-600')
                            }`}>
                            {isImageOverridden ? 'Remote URL' : (isImageLocalBlob ? 'Local File Selected' : 'Using Fallback')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* URL Paste */}
                          <div className="space-y-1">
                            <div className="text-[10px] text-m3-on-surface/40 uppercase font-bold flex items-center gap-1.5"><Link className="w-3 h-3" /> Image URL Address</div>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={isImageLocalBlob ? '' : imageOverride}
                              onChange={(e) => {
                                setImageOverride(e.target.value);
                                setImageFile(null);
                              }}
                              className="w-full bg-m3-surface-container-low border border-m3-outline/20 rounded-xl p-3 text-xs focus:border-m3-primary focus:ring-0 text-m3-on-surface"
                            />
                          </div>

                          {/* File Upload Trigger */}
                          <div className="space-y-1">
                            <div className="text-[10px] text-m3-on-surface/40 uppercase font-bold flex items-center gap-1.5"><Upload className="w-3 h-3" /> Upload File</div>
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 p-3 text-xs border border-dashed border-m3-outline/30 rounded-xl hover:bg-m3-surface-container-high transition-colors text-m3-on-surface font-semibold"
                            >
                              {imageFile ? (
                                <><Check className="w-4 h-4 text-green-500" /> {imageFile.name.substring(0, 15)}...</>
                              ) : (
                                <><Upload className="w-4 h-4" /> Select local image</>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Image Dimension Recommendations */}
                        <div className="text-[10px] text-m3-on-surface/50 flex items-center gap-1.5 mt-2 bg-m3-surface-container-lowest p-2 rounded-lg border border-m3-outline/10">
                          <Info className="w-3 h-3 text-m3-primary/70" />
                          <span>
                            {cardType === 'standard' && 'Recommended: 16:10 or 4:3 ratio (e.g. 800x500px).'}
                            {cardType === 'media_showcase' && 'Recommended: 16:9 ratio, high resolution (e.g. 1200x675px).'}
                            {cardType === 'case_study' && 'Recommended: 16:10 ratio, high contrast (e.g. 800x500px).'}
                            {cardType === 'dual_content' && 'Recommended: 1:1 square or 4:3 ratio (e.g. 600x600px).'}
                            {cardType === 'custom' && 'Recommended: 16:10 ratio.'}
                          </span>
                        </div>

                        {/* Reset image button */}
                        {(imageOverride || imageFile) && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageOverride('');
                              setImageFile(null);
                            }}
                            className="text-[10px] font-bold text-m3-error uppercase tracking-wider hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Clear Image Override
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Target Placement */}
                <div className="space-y-5">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/80 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center text-[10px]">4</span>
                    Sidebar Placement & Sorting
                  </label>
                  <p className="text-[11px] text-m3-on-surface/60 -mt-2 leading-relaxed">
                    Select which sidebar this card should be displayed on, and set its order. Lower numbers appear closer to the top.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-m3-on-surface/60 uppercase tracking-wider">Target Sidebar</span>
                      <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full bg-m3-surface-container-low border border-m3-outline/20 rounded-xl p-3 text-sm text-m3-on-surface focus:ring-0 focus:border-m3-primary"
                      >
                        <option value="sidebar-writings">Sidebar - My Writings (Blogs)</option>
                        <option value="sidebar-casestudies">Sidebar - Case Studies</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-m3-on-surface/60 uppercase tracking-wider">Sort Index / Order</span>
                      <input
                        type="number"
                        min="0"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                        className="w-full bg-m3-surface-container-low border border-m3-outline/20 rounded-xl p-3 text-sm focus:border-m3-primary focus:ring-0 text-m3-on-surface"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate / Action buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-m3-outline/10">
                  <button
                    onClick={handleCancelEdit}
                    type="button"
                    className="px-6 py-3.5 rounded-full border border-m3-outline/20 text-m3-on-surface/60 hover:bg-m3-surface-container text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCard}
                    disabled={!selectedContent || savingCardId !== null}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-m3-primary/90 transition-colors shadow-lg shadow-m3-primary/20 disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    {savingCardId !== null ? (
                      'Saving changes...'
                    ) : (
                      <><Save className="w-4 h-4" /> {editingCardId ? 'Update Card' : 'Generate Card'}</>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column: Sticky Live Preview Panel */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-6 rounded-[32px] shadow-sm space-y-6">

                {/* Header info */}
                <div className="flex justify-between items-center border-b border-m3-outline/10 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/80 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-m3-primary" /> Live Preview
                  </h3>

                  {/* Theme Switcher */}
                  <div className="flex items-center gap-1 bg-m3-surface-container-high p-1 rounded-full border border-m3-outline/10">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('light')}
                      className={`p-1.5 rounded-full transition-all ${previewTheme === 'light' ? 'bg-white text-yellow-500 shadow-sm' : 'text-m3-on-surface/40 hover:text-m3-on-surface/80'
                        }`}
                      title="Preview light mode"
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('dark')}
                      className={`p-1.5 rounded-full transition-all ${previewTheme === 'dark' ? 'bg-zinc-800 text-purple-400 shadow-sm' : 'text-m3-on-surface/40 hover:text-m3-on-surface/80'
                        }`}
                      title="Preview dark mode"
                    >
                      <Moon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Canvas (light/dark container) */}
                <div className={`p-6 rounded-[24px] transition-all duration-500 relative flex justify-center items-center min-h-[300px] border ${previewTheme === 'light'
                    ? 'bg-[#F8F7FA] border-gray-100'
                    : 'bg-[#121212] border-zinc-800'
                  }`}>
                  {/* Absolute watermark of placement */}
                  <div className="absolute top-3 right-3 text-[8px] font-mono uppercase bg-m3-primary/10 text-m3-primary px-2 py-0.5 rounded">
                    Slot: {section.replace('sidebar-', 'Sidebar: ').replace('-', ' ')}
                  </div>

                  <div className="w-full max-w-sm">
                    {/* Animated Layout Wrapper */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${cardType}-${previewTitle}-${previewText.substring(0, 20)}-${previewImage}`}
                        initial={{ opacity: 0, scale: 0.96, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -5 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <CardPreviewRenderer
                          cardType={cardType}
                          title={previewTitle}
                          excerpt={previewText}
                          imageUrl={previewImage}
                          badge={previewBadge}
                          date={previewDate}
                          author={previewAuthor}
                          theme={previewTheme}
                          isOverridden={{
                            title: isTitleOverridden,
                            text: isTextOverridden,
                            image: isImageOverrideApplied(imageOverride, selectedSource)
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Overrides / Blueprint Status Legend */}
                <div className="bg-m3-surface-container-lowest border border-m3-outline/10 p-4 rounded-2xl space-y-2.5">
                  <div className="text-[10px] font-bold text-m3-on-surface/60 uppercase tracking-widest">Preview Blueprint Status</div>

                  <div className="space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between items-center">
                      <span className="text-m3-on-surface/60">Selected Content Node:</span>
                      <span className="font-mono text-m3-on-surface/80 max-w-[150px] truncate">
                        {selectedSource ? selectedSource.title : 'None Selected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-m3-on-surface/60">Title Data Source:</span>
                      <span className={`font-semibold ${isTitleOverridden ? 'text-purple-600 dark:text-purple-400' : 'text-m3-on-surface/60'}`}>
                        {isTitleOverridden ? 'Override' : 'Fallback (Original)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-m3-on-surface/60">Excerpt Data Source:</span>
                      <span className={`font-semibold ${isTextOverridden ? 'text-purple-600 dark:text-purple-400' : 'text-m3-on-surface/60'}`}>
                        {isTextOverridden ? 'Override' : 'Fallback (Original)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-m3-on-surface/60">Image Data Source:</span>
                      <span className={`font-semibold ${isImageOverrideApplied(imageOverride, selectedSource) ? 'text-purple-600 dark:text-purple-400' : 'text-m3-on-surface/60'}`}>
                        {isImageOverrideApplied(imageOverride, selectedSource)
                          ? (isImageLocalBlob ? 'Local File Upload' : 'Override URL')
                          : 'Fallback (Original)'}
                      </span>
                    </div>
                  </div>

                  {!selectedContent && (
                    <div className="flex gap-2 items-start text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/20 mt-2">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Choose a published source content node from step 1 to inspect actual fallbacks.</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards List Section */}
      <div className="space-y-4">
        <div className="border-b border-m3-outline/10 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-medium text-m3-on-surface">Existing Cards ({cards.length})</h3>
            <p className="text-xs text-m3-on-surface/50">These cards are live and served contextually on the homepage and writings grids.</p>
          </div>
          {cards.length > 1 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-m3-on-surface/40 uppercase tracking-widest bg-m3-surface-container p-2 rounded-lg border border-m3-outline/10">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sorted by Index
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => {
            const source = publishedContent.find(c => c.id === card.sourceId);
            const activeImage = card.imageOverride || source?.headerImage || '';
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 rounded-[32px] overflow-hidden shadow-sm flex flex-col group relative"
              >
                {/* Control Actions Overlay (Edit & Delete) */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={() => handleEdit(card)}
                    className="p-2.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-m3-primary hover:bg-m3-primary hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
                    title="Edit card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-2.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-m3-error hover:bg-m3-error hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="aspect-[16/10] bg-m3-surface-container relative overflow-hidden">
                  {activeImage ? (
                    <img src={activeImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-m3-on-surface/20" />
                    </div>
                  )}

                  {/* Floating Tag Target Section */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-m3-primary/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-sm">
                      Slot: {card.section.replace('homepage-', 'home: ').replace('writings-', 'writings: ').replace('sidebar-', 'Sidebar: ')}
                    </span>
                  </div>
                </div>

                {/* Card description details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-3 border-b border-m3-outline/5 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-m3-primary/60" /> {card.cardType} preset
                    </span>
                    <span>Order: #{card.sortOrder}</span>
                  </div>

                  <h4 className="text-base font-display font-semibold text-m3-on-surface mb-2 line-clamp-2 leading-snug">
                    {card.titleOverride || source?.title || 'Unknown Content Title'}
                  </h4>

                  <p className="text-xs text-m3-on-surface/60 line-clamp-2 mt-auto leading-relaxed pt-2">
                    {card.textOverride || source?.excerpt || 'No excerpt summary defined.'}
                  </p>

                  {/* Indicators */}
                  <div className="flex gap-2.5 mt-4 pt-3 border-t border-m3-outline/5 text-[9px] text-m3-on-surface/30 uppercase font-mono">
                    {card.titleOverride && <span className="text-purple-600 dark:text-purple-400">Title Override</span>}
                    {card.textOverride && <span className="text-purple-600 dark:text-purple-400">Text Override</span>}
                    {card.imageOverride && <span className="text-purple-600 dark:text-purple-400">Image Override</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {!loading && cards.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-m3-outline/10 rounded-[32px] bg-white/50 dark:bg-transparent">
              <p className="text-m3-on-surface/40 font-medium text-sm">No cards mapped yet. Initialize the custom placement layout above.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Helper: Determine if image override differs from selected source image
function isImageOverrideApplied(imageOverride: string, selectedSource?: ContentItem) {
  if (!imageOverride) return false;
  if (selectedSource && selectedSource.headerImage === imageOverride) return false;
  return true;
}

// ----------------------------------------------------
// Card Preview Renderer Component
// ----------------------------------------------------
interface CardPreviewProps {
  cardType: ExtendedCardType;
  title: string;
  excerpt: string;
  imageUrl: string;
  badge: string;
  date: string;
  author: string;
  theme: 'light' | 'dark';
  isOverridden: {
    title: boolean;
    text: boolean;
    image: boolean;
  };
}

function CardPreviewRenderer({ cardType, title, excerpt, imageUrl, badge, date, author, theme, isOverridden }: CardPreviewProps) {
  const t = {
    cardBg: theme === 'light' ? 'bg-white border-gray-100 shadow-sm' : 'bg-[#1e1c24] border-zinc-800 shadow-xl',
    textPrimary: theme === 'light' ? 'text-[#1a1a1a]' : 'text-white',
    textSecondary: theme === 'light' ? 'text-[#1a1a1a]/70' : 'text-white/60',
    textMeta: theme === 'light' ? 'text-[#1a1a1a]/40' : 'text-white/40',
    quoteBg: theme === 'light' ? 'bg-[#6750a4]/5 border-[#6750a4]/10' : 'bg-[#6750a4]/10 border-[#6750a4]/20',
    compactBg: theme === 'light' ? 'bg-white/80 border-gray-100 shadow-sm' : 'bg-zinc-900/60 border-zinc-800 shadow-xl',
  };

  // 1. Standard Layout Preset (standard)
  if (cardType === 'standard') {
    return (
      <div className={`rounded-[32px] overflow-hidden border p-2 flex flex-col group transition-all duration-300 w-full ${t.cardBg}`}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-800">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />

          <div className="absolute top-4 left-4">
            <span className="bg-m3-primary/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] shadow-md border border-white/15">
              {badge}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] ${t.textMeta}">
            <span>{date}</span>
            <div className="w-1 h-1 rounded-full bg-m3-primary/30" />
            <span className="text-m3-primary">{badge}</span>
            {author && (
              <>
                <div className="w-1 h-1 rounded-full bg-m3-primary/30" />
                <span>{author}</span>
              </>
            )}
          </div>

          <h3 className={`text-lg font-display font-semibold leading-snug line-clamp-2 group-hover:text-m3-primary transition-colors ${t.textPrimary}`}>
            {title}
          </h3>

          <p className={`text-xs line-clamp-2 leading-relaxed ${t.textSecondary}`}>
            {excerpt}
          </p>
        </div>
      </div>
    );
  }

  // 2. Media Showcase Overlay (hero / media_showcase)
  if (cardType === 'hero' || cardType === 'media_showcase') {
    return (
      <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden group shadow-lg w-full bg-zinc-900">
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark linear gradient bottom shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
          <span className="bg-white/90 backdrop-blur-md text-[#6750a4] px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] shadow-md">
            {badge}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 text-white z-10">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">{date} • {author}</div>
          <h3 className="text-lg font-display font-semibold leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </div>
      </div>
    );
  }

  // 3. Quote / Testimonial layout (quote)
  if (cardType === 'quote') {
    return (
      <div className={`aspect-[16/10] rounded-[32px] border p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 w-full ${t.quoteBg}`}>
        {/* Vector quote icon backdrop */}
        <div className="absolute -top-1 -right-1 text-m3-primary/10 text-8xl font-serif select-none pointer-events-none leading-none">
          ”
        </div>

        <div className="absolute top-5 left-5">
          <span className="bg-m3-primary/10 text-m3-primary px-3 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-widest border border-m3-primary/10">
            QUOTE
          </span>
        </div>

        <div className="my-auto pt-6 text-center">
          <p className={`text-xs md:text-sm font-sans italic leading-relaxed line-clamp-4 px-3 ${t.textPrimary}`}>
            "{excerpt}"
          </p>
        </div>

        <div className="flex flex-col items-center pt-2">
          <span className={`text-xs font-bold ${t.textPrimary}`}>{title}</span>
          <span className={`text-[9px] uppercase tracking-widest font-mono mt-0.5 ${t.textMeta}`}>{badge}</span>
        </div>
      </div>
    );
  }

  // 4. Compact Text Only Card (minimal / compact)
  if (cardType === 'minimal' || cardType === 'compact') {
    return (
      <div className={`aspect-[16/10] rounded-[32px] border p-6 flex flex-col justify-between transition-all duration-300 w-full ${t.compactBg}`}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-m3-primary bg-m3-primary/10 px-3 py-1 rounded-full border border-m3-primary/5">
            {badge}
          </span>
          <span className={`text-[9px] font-mono ${t.textMeta}`}>{date}</span>
        </div>

        <div className="my-auto space-y-2">
          <h3 className={`text-base font-display font-semibold leading-snug line-clamp-2 ${t.textPrimary}`}>
            {title}
          </h3>
          <p className={`text-xs line-clamp-2 leading-relaxed ${t.textSecondary}`}>
            {excerpt}
          </p>
        </div>

        <div className="flex items-center text-[9px] font-bold uppercase tracking-wider text-m3-primary pt-1 cursor-pointer">
          Read Perspective <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    );
  }

  // 5. Case Study Card (case_study)
  if (cardType === 'case_study') {
    return (
      <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden group shadow-lg w-full bg-[#121212]">
        {/* Background Image */}
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Top bar header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <span className="bg-white text-black px-3 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-[0.15em] shadow-sm">
            {badge}
          </span>
          <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 px-3 py-1 rounded-full text-[8.5px] font-mono">
            CASE STUDY
          </span>
        </div>

        {/* Bottom bar summary */}
        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2 text-white z-10">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#EAFF00] block">RESULTS ARCHITECTED</span>
          <h3 className="text-base font-display font-semibold leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-[11px] text-white/70 line-clamp-2 leading-snug">
            {excerpt}
          </p>
          <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-[#EAFF00] pt-1">
            EXPLORE STUDY <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>
    );
  }

  // 6. Dual Content Split Card (dual_content)
  if (cardType === 'dual_content') {
    return (
      <div className={`aspect-[16/10] rounded-[32px] overflow-hidden border flex flex-row transition-all duration-300 w-full ${t.cardBg}`}>
        {/* Left column (Image) */}
        <div className="w-[45%] h-full bg-zinc-100 dark:bg-zinc-800 relative">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3">
            <span className="bg-m3-primary/95 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow">
              {badge}
            </span>
          </div>
        </div>

        {/* Right column (Content details) */}
        <div className="w-[55%] p-4 flex flex-col justify-center space-y-2">
          <span className={`text-[8.5px] font-mono ${t.textMeta}`}>{date}</span>
          <h3 className={`text-xs sm:text-sm font-display font-semibold leading-snug line-clamp-2 ${t.textPrimary}`}>
            {title}
          </h3>
          <p className={`text-[10px] line-clamp-2 leading-relaxed ${t.textSecondary}`}>
            {excerpt}
          </p>
          <span className="text-[8.5px] font-bold text-m3-primary uppercase tracking-wider flex items-center">
            Link <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
          </span>
        </div>
      </div>
    );
  }

  // 7. Custom Developer Card Blueprint (custom)
  return (
    <div className="relative aspect-[16/10] rounded-[32px] bg-gradient-to-br from-[#6750a4]/10 to-[#9a82e9]/5 border-2 border-dashed border-[#6750a4]/40 p-5 flex flex-col justify-between w-full">
      {/* Dev Overlay indicator markers */}
      <div className="absolute top-3 right-3 text-[9px] font-bold uppercase bg-[#6750a4] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
        <Sparkles className="w-3 h-3" /> Custom Layout
      </div>

      <div className="relative aspect-[16/11] overflow-hidden rounded-[20px] bg-zinc-200 dark:bg-zinc-800/80 max-h-[100px] border border-[#6750a4]/20 group">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        {isOverridden.image && (
          <div className="absolute inset-0 bg-[#6d55a7]/75 backdrop-blur-[2px] flex items-center justify-center text-white text-[9px] font-mono uppercase tracking-widest font-bold">
            Custom Image Override
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <div className={`p-1.5 rounded-lg border transition-all ${isOverridden.title ? 'border-purple-500 bg-purple-500/5' : 'border-transparent'
          }`}>
          <div className={`text-xs font-bold leading-tight line-clamp-2 ${t.textPrimary}`}>
            {title}
          </div>
          {isOverridden.title && (
            <div className="text-[7.5px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold mt-0.5">Title Overridden</div>
          )}
        </div>

        <div className={`p-1.5 rounded-lg border transition-all ${isOverridden.text ? 'border-purple-500 bg-purple-500/5' : 'border-transparent'
          }`}>
          <div className={`text-[10px] leading-relaxed line-clamp-2 ${t.textSecondary}`}>
            {excerpt}
          </div>
          {isOverridden.text && (
            <div className="text-[7.5px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold mt-0.5">Excerpt Overridden</div>
          )}
        </div>
      </div>
    </div>
  );
}
