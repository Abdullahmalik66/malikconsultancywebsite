import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layout, Image as ImageIcon, Quote, FileText, FolderGit2, Layers, Sparkles } from 'lucide-react';
import { getAllCards, getPublishedContent, getPublishedTestimonials, CardItem, ContentItem } from '../../lib/firebase/cms';

interface CardRendererProps {
  card: CardItem;
  source: ContentItem;
}

export function CardRenderer({ card, source }: CardRendererProps) {
  // Map legacy cardType strings if necessary
  const type = card.cardType === 'hero' ? 'media_showcase' : (card.cardType === 'minimal' ? 'compact' : card.cardType);

  // Derive visual values using overrides if specified, or content fallbacks
  const title = card.titleOverride?.trim() || source.title || "Untitled Insight";
  const excerpt = card.textOverride?.trim() || source.excerpt || source.content?.replace(/<[^>]*>/g, '').substring(0, 160) || "";
  const imageUrl = card.imageOverride || source.headerImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
  const badge = source.badgeText || source.category || (source.contentType === 'case_study' ? 'Case Study' : 'Insight');
  const date = new Date(source.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const author = source.authorName || "Principal";

  // Navigation target path
  const targetLink = source.contentType === 'case_study' 
    ? `/case-study/${source.slug || source.id}`
    : (source.contentType === 'testimonial' ? '/testimonials' : `/writings/${source.id}`);

  // 1. Standard layout (standard)
  if (type === 'standard') {
    return (
      <Link to={targetLink} className="block group transition-all duration-300">
        <div className="rounded-[32px] overflow-hidden border border-m3-outline/10 p-2 flex flex-col bg-white dark:bg-[#1e1c24] hover:shadow-xl transition-shadow duration-300">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-800">
            <img src={imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute top-4 left-4">
              <span className="bg-m3-primary/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] shadow-md border border-white/15">
                {badge}
              </span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/40 dark:text-white/40">
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
            <h3 className="text-lg font-display font-semibold leading-snug line-clamp-2 text-[#1a1a1a] dark:text-white group-hover:text-m3-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs line-clamp-2 leading-relaxed text-[#1a1a1a]/70 dark:text-white/60">
              {excerpt}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // 2. Media Showcase Overlay (media_showcase)
  if (type === 'media_showcase') {
    return (
      <Link to={targetLink} className="block group transition-all duration-300">
        <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden shadow-lg bg-zinc-900 hover:shadow-xl transition-shadow duration-300">
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white/90 backdrop-blur-md text-[#6750a4] px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] shadow-md">
              {badge}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 text-white z-10 text-left">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">{date} • {author}</div>
            <h3 className="text-lg font-display font-semibold leading-snug line-clamp-2">
              {title}
            </h3>
            <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // 3. Quote layout (quote)
  if (type === 'quote') {
    return (
      <Link to={targetLink} className="block group transition-all duration-300">
        <div className="aspect-[16/10] rounded-[32px] border border-m3-outline/10 p-6 flex flex-col justify-between relative overflow-hidden bg-[#6750a4]/5 dark:bg-[#6750a4]/10 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute -top-1 -right-1 text-m3-primary/10 text-8xl font-serif select-none pointer-events-none leading-none">
            ”
          </div>
          <div className="absolute top-5 left-5">
            <span className="bg-m3-primary/10 text-m3-primary px-3 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-widest border border-m3-primary/10">
              QUOTE
            </span>
          </div>
          <div className="my-auto pt-6 text-center">
            <p className="text-xs md:text-sm font-sans italic leading-relaxed line-clamp-4 px-3 text-[#1a1a1a] dark:text-white">
              "{excerpt}"
            </p>
          </div>
          <div className="flex flex-col items-center pt-2">
            <span className="text-xs font-bold text-[#1a1a1a] dark:text-white">{title}</span>
            <span className="text-[9px] uppercase tracking-widest font-mono mt-0.5 text-[#1a1a1a]/40 dark:text-white/40">{badge}</span>
          </div>
        </div>
      </Link>
    );
  }

  // 4. Compact Text Only (compact)
  if (type === 'compact') {
    return (
      <Link to={targetLink} className="block group transition-all duration-300">
        <div className="aspect-[16/10] rounded-[32px] border border-m3-outline/10 p-6 flex flex-col justify-between bg-white dark:bg-zinc-900/60 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-m3-primary bg-m3-primary/10 px-3 py-1 rounded-full border border-m3-primary/5">
              {badge}
            </span>
            <span className="text-[9px] font-mono text-[#1a1a1a]/40 dark:text-white/40">{date}</span>
          </div>
          <div className="my-auto space-y-2 text-left">
            <h3 className="text-base font-display font-semibold leading-snug line-clamp-2 text-[#1a1a1a] dark:text-white group-hover:text-m3-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs line-clamp-2 leading-relaxed text-[#1a1a1a]/70 dark:text-white/60">
              {excerpt}
            </p>
          </div>
          <div className="flex items-center text-[9px] font-bold uppercase tracking-wider text-m3-primary pt-1">
            Read Perspective <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  }

  // 5. Case Study layout (case_study)
  if (type === 'case_study') {
    return (
      <Link to={targetLink} className="block group transition-all duration-300">
        <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden shadow-lg bg-[#121212] hover:shadow-xl transition-shadow duration-300">
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <span className="bg-white text-black px-3 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-[0.15em] shadow-sm">
              {badge}
            </span>
            <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 px-3 py-1 rounded-full text-[8.5px] font-mono">
              CASE STUDY
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2 text-white z-10 text-left">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#EAFF00] block">RESULTS ARCHITECTED</span>
            <h3 className="text-base font-display font-semibold leading-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-[11px] text-white/70 line-clamp-2 leading-snug">
              {excerpt}
            </p>
            <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-[#EAFF00] pt-1">
              EXPLORE STUDY <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 6. Dual Content Split layout (dual_content)
  if (type === 'dual_content') {
    return (
      <Link to={targetLink} className="block group transition-all duration-300">
        <div className="aspect-[16/10] rounded-[32px] overflow-hidden border border-m3-outline/10 flex flex-row bg-white dark:bg-[#1e1c24] hover:shadow-xl transition-shadow duration-300">
          <div className="w-[45%] h-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
            <img src={imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute top-3 left-3">
              <span className="bg-m3-primary/95 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow">
                {badge}
              </span>
            </div>
          </div>
          <div className="w-[55%] p-4 flex flex-col justify-center space-y-2 text-left">
            <span className="text-[8.5px] font-mono text-[#1a1a1a]/40 dark:text-white/40">{date}</span>
            <h3 className="text-xs sm:text-sm font-display font-semibold leading-snug line-clamp-2 text-[#1a1a1a] dark:text-white group-hover:text-m3-primary transition-colors">
              {title}
            </h3>
            <p className="text-[10px] line-clamp-2 leading-relaxed text-[#1a1a1a]/70 dark:text-white/60">
              {excerpt}
            </p>
            <span className="text-[8.5px] font-bold text-m3-primary uppercase tracking-wider flex items-center">
              Link <ArrowRight className="w-2.5 h-2.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // 7. Custom developer card blueprint (custom)
  return (
    <Link to={targetLink} className="block group transition-all duration-300">
      <div className="relative aspect-[16/10] rounded-[32px] bg-gradient-to-br from-[#6750a4]/10 to-[#9a82e9]/5 border-2 border-dashed border-[#6750a4]/40 p-5 flex flex-col justify-between">
        <div className="absolute top-3 right-3 text-[9px] font-bold uppercase bg-[#6750a4] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" /> Custom Layout
        </div>
        <div className="relative aspect-[16/11] overflow-hidden rounded-[20px] bg-zinc-200 dark:bg-zinc-800/80 max-h-[100px] border border-[#6750a4]/20">
          <img src={imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
        </div>
        <div className="space-y-2 pt-2 text-left">
          <div className="text-xs font-bold leading-tight line-clamp-2 text-[#1a1a1a] dark:text-white group-hover:text-m3-primary transition-colors">
            {title}
          </div>
          <div className="text-[10px] leading-relaxed line-clamp-2 text-[#1a1a1a]/70 dark:text-white/60">
            {excerpt}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface LinkedCardsSidebarProps {
  cardIds: string[];
}

export function LinkedCardsSidebar({ cardIds }: LinkedCardsSidebarProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [publishedContent, setPublishedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardIds || cardIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
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

        const combinedContent = [...fetchedContent, ...mappedTestimonials];
        
        // Filter and order cards based on the passed cardIds
        const filtered = fetchedCards
          .filter(c => cardIds.includes(c.id) && c.active)
          .sort((a, b) => {
            const indexA = cardIds.indexOf(a.id);
            const indexB = cardIds.indexOf(b.id);
            return indexA - indexB;
          });

        setCards(filtered);
        setPublishedContent(combinedContent);
      } catch (err) {
        console.error("Failed to load cards for sidebar", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(cardIds)]);

  if (loading || cards.length === 0) return null;

  return (
    <div className="space-y-6 w-full">
      <div className="border-b border-m3-outline/10 pb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 dark:text-white/40">
          Related Content
        </h4>
      </div>
      <div className="space-y-6">
        {cards.map(card => {
          const source = publishedContent.find(c => c.id === card.sourceId);
          if (!source) return null;
          return <CardRenderer key={card.id} card={card} source={source} />;
        })}
      </div>
    </div>
  );
}
