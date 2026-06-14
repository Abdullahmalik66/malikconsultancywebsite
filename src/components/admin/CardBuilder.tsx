import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllCards, saveCard, getPublishedContent, CardItem, ContentItem, deleteCard } from '../../lib/firebase/cms';
import { Plus, Trash2, Layout, Image as ImageIcon, Save, Check, X } from 'lucide-react';

export default function CardBuilder() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [publishedContent, setPublishedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);

  // New Card Form State
  const [selectedContent, setSelectedContent] = useState('');
  const [section, setSection] = useState('homepage-latest');
  const [cardType, setCardType] = useState<'standard' | 'hero' | 'minimal'>('standard');
  const [titleOverride, setTitleOverride] = useState('');
  const [textOverride, setTextOverride] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedCards, fetchedContent] = await Promise.all([
        getAllCards(),
        getPublishedContent()
      ]);
      setCards(fetchedCards.sort((a, b) => a.sortOrder - b.sortOrder));
      setPublishedContent(fetchedContent);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCard = async () => {
    if (!selectedContent) return;
    
    setSavingCardId('new');
    try {
      const sourceContent = publishedContent.find(c => c.id === selectedContent);
      if (!sourceContent) return;

      await saveCard({
        sourceId: sourceContent.id,
        sourceType: sourceContent.contentType,
        cardType,
        section,
        sortOrder: cards.length,
        active: true,
        titleOverride: titleOverride || undefined,
        textOverride: textOverride || undefined,
      });

      setIsCreating(false);
      setSelectedContent('');
      setTitleOverride('');
      setTextOverride('');
      await fetchData();
    } catch (err) {
      console.error('Failed to create card', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-6 rounded-[24px] shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-m3-on-surface mb-1">Card Builder</h2>
          <p className="text-sm text-m3-on-surface/60">Generate and map UI cards from published content.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-m3-primary/90 transition-colors shadow-lg shadow-m3-primary/20"
        >
          {isCreating ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Card</>}
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-m3-surface-container-low border border-m3-outline/20 p-8 rounded-[32px] space-y-6 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/50 border-b border-m3-outline/10 pb-4">
                Configure New Card
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/60">Source Content</label>
                  <select
                    value={selectedContent}
                    onChange={(e) => setSelectedContent(e.target.value)}
                    className="w-full bg-white dark:bg-[#1d1b20] border border-m3-outline/20 rounded-xl p-3 text-sm text-m3-on-surface focus:ring-0 focus:border-m3-primary"
                  >
                    <option value="">Select published content...</option>
                    {publishedContent.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.contentType})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/60">Target Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-white dark:bg-[#1d1b20] border border-m3-outline/20 rounded-xl p-3 text-sm text-m3-on-surface focus:ring-0 focus:border-m3-primary"
                  >
                    <option value="homepage-latest">Homepage - Latest Insights</option>
                    <option value="writings-featured">Writings - Featured</option>
                    <option value="writings-grid">Writings - Main Grid</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/60">Card Type / Layout</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#1d1b20] border border-m3-outline/20 rounded-xl p-3 text-sm text-m3-on-surface focus:ring-0 focus:border-m3-primary"
                  >
                    <option value="standard">Standard (Image + Title + Excerpt)</option>
                    <option value="hero">Hero (Large Image + Overlay)</option>
                    <option value="minimal">Minimal (Text Only)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-m3-on-surface/60">Title Override (Optional)</label>
                  <input
                    type="text"
                    value={titleOverride}
                    onChange={(e) => setTitleOverride(e.target.value)}
                    placeholder="Leave empty to use source title"
                    className="w-full bg-white dark:bg-[#1d1b20] border border-m3-outline/20 rounded-xl p-3 text-sm text-m3-on-surface placeholder:text-m3-on-surface/30 focus:ring-0 focus:border-m3-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCreateCard}
                  disabled={!selectedContent || savingCardId === 'new'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-m3-primary/90 transition-colors shadow-lg shadow-m3-primary/20 disabled:opacity-50"
                >
                  {savingCardId === 'new' ? 'Creating...' : <><Save className="w-4 h-4" /> Generate Card</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => {
          const source = publishedContent.find(c => c.id === card.sourceId);
          return (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 rounded-[32px] overflow-hidden shadow-sm flex flex-col group relative"
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={() => handleDelete(card.id)}
                  className="p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md text-m3-error hover:bg-m3-error hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-[16/9] bg-m3-surface-container relative">
                {source?.headerImage ? (
                  <img src={source.headerImage} alt={source.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-m3-on-surface/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-m3-primary/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    {card.section}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-3">
                  <Layout className="w-3 h-3" /> {card.cardType} Layout
                </div>
                <h4 className="text-lg font-display font-medium text-m3-on-surface mb-2 line-clamp-2">
                  {card.titleOverride || source?.title || 'Unknown Source'}
                </h4>
                <p className="text-xs text-m3-on-surface/60 line-clamp-2 mt-auto">
                  {card.textOverride || source?.excerpt || 'No description available.'}
                </p>
              </div>
            </motion.div>
          );
        })}

        {!loading && cards.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-m3-outline/10 rounded-[32px]">
            <p className="text-m3-on-surface/40 font-medium">No cards built yet. Create one to power your frontend.</p>
          </div>
        )}
      </div>
    </div>
  );
}
