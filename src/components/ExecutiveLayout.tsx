import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, Calendar, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import StaggerTestimonials from './StaggerTestimonials';
import LatestInsights from './LatestInsights';
import CaseWork from './CaseWork';
import NewsletterSection from './NewsletterSection';
import { getPublishedContent, ContentItem } from '../lib/firebase/cms';
import { getDeterministicFormatting } from '../lib/caseStudyHelpers';
import { LinkedCardsSidebar } from './cms/CardRenderer';

interface ExecutiveLayoutProps {
  title: string;
  category: string;
  date?: string;
  image?: string;
  tags?: string[];
  content: React.ReactNode;
  slug?: string;
  linkedCardIds?: string[];
}

export default function ExecutiveLayout({ title, category, date, image, tags, content, slug, linkedCardIds }: ExecutiveLayoutProps) {
  const [randomCase, setRandomCase] = useState<(ContentItem & { color: string; animationType: string; tag: string }) | null>(null);
  const [randomInsight, setRandomInsight] = useState<{ title: string, text: string, link: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const pickRandom = async () => {
      const published = await getPublishedContent();
      
      const cases = published.filter(item => item.contentType === 'case_study' && item.title !== title && item.slug !== slug);
      if (cases.length > 0) {
        const picked = cases[Math.floor(Math.random() * cases.length)];
        const fmt = getDeterministicFormatting(picked.id);
        setRandomCase({
          ...picked,
          color: fmt.color,
          animationType: fmt.animationType,
          tag: picked.badgeText || (picked.tags && picked.tags[0]) || 'Case Study'
        });
      }

      const blogs = published.filter(item => item.contentType === 'blog');
      if (blogs.length > 0) {
        const pickedBlog = blogs[Math.floor(Math.random() * blogs.length)];
        setRandomInsight({
          title: pickedBlog.title,
          text: pickedBlog.excerpt || "Read more about this insight.",
          link: `/writings/${pickedBlog.slug || pickedBlog.id}`
        });
      } else {
        // Fallback if no blogs yet
        const insights = [
          { title: "Can I say NO! To growth Hacking?", text: "What exactly is Growth hacking and how it is different from traditional digital marketing?", link: "/my-writings" },
          { title: "The Agentic Future", text: "How AI agents are redefining the way we build and scale customer journeys.", link: "/my-writings" },
        ];
        setRandomInsight(insights[Math.floor(Math.random() * insights.length)]);
      }
    };
    pickRandom();
  }, [title, slug]);

  return (
    <div className="min-h-screen bg-[#fdfaff] pt-32 pb-0">
      <div className="max-w-[1600px] mx-auto px-6 mb-32">
        {/* Hero Area */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 bg-[#fbe1ff] text-[#1a1a1a] rounded-full text-xs font-medium uppercase tracking-widest">
              {category}
            </span>
            {date && (
              <span className="text-sm font-bold text-[#1a1a1a]/40 italic font-serif">
                {date}
              </span>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[71px] font-display font-medium text-[#1a1a1a] leading-[1.05] tracking-[-0.04em] max-w-5xl">
            {title}
          </h1>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-[#EAFF00] text-[#1a1a1a] text-xs font-medium uppercase tracking-widest rounded-xl transition-all cursor-default hover:scale-105"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 lg:gap-32 items-start">
          {/* Main Content */}
          <div className="space-y-12">
            {image && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-[21/9] rounded-[40px] overflow-hidden bg-gray-100 shadow-2xl shadow-black/5"
              >
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}

            {/* Content Container with Precise Styling */}
            <div className="max-w-none 
              [&_p]:text-justify [&_p]:text-[24px] [&_p]:leading-[1.4] [&_p]:text-[#1a1a1a] [&_p]:mb-8 [&_p]:tracking-[0.01em]
              [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-[32px] [&_h1]:text-[#1a1a1a] [&_h1]:mt-16 [&_h1]:mb-6 [&_h1]:uppercase [&_h1]:tracking-wider
              [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-[26px] [&_h2]:text-[#1a1a1a] [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:uppercase [&_h2]:tracking-wider
              [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-[26px] [&_h3]:text-[#1a1a1a] [&_h3]:mt-12 [&_h3]:mb-5
              [&_h4]:font-display [&_h4]:font-bold [&_h4]:text-[22px] [&_h4]:text-[#1a1a1a] [&_h4]:mt-8 [&_h4]:mb-4
              [&_strong]:font-medium [&_strong]:text-[#1a1a1a]
              [&_u]:underline [&_em]:italic [&_i]:italic
              [&_blockquote]:relative [&_blockquote]:border-none [&_blockquote]:bg-[#f4f4f4] [&_blockquote]:px-14 [&_blockquote]:py-16 [&_blockquote]:my-16 [&_blockquote]:rounded-sm
              [&_blockquote_p]:font-bold [&_blockquote_p]:italic [&_blockquote_p]:text-[28px] [&_blockquote_p]:text-[#000] [&_blockquote_p]:mb-0 [&_blockquote_p]:text-left [&_blockquote_p]:tracking-normal [&_blockquote_p]:leading-tight
              [&_blockquote]:before:content-[''] [&_blockquote]:before:absolute [&_blockquote]:before:-top-8 [&_blockquote]:before:left-8 [&_blockquote]:before:w-16 [&_blockquote]:before:h-12
              [&_blockquote]:before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCA0MEwxMCAwSDIwTDEwIDQwSDBZMjAgNDBMMzAgMEg0MEwzMCA0MEgyMFoiIGZpbGw9IiNFQUZGMDAiLz48L3N2Zz4=')] 
              [&_blockquote]:before:bg-no-repeat [&_blockquote]:before:bg-contain
              [&_ul]:list-disc [&_ul]:pl-10 [&_ul]:space-y-6 [&_ul]:mb-12 [&_li]:text-[24px] [&_li]:text-[#1a1a1a] [&_li]:tracking-[0.01em]
              [&_ol]:list-decimal [&_ol]:pl-10 [&_ol]:space-y-6 [&_ol]:mb-12
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
              [&_td]:p-3 [&_td]:border [&_td]:border-[#1a1a1a]/10 [&_td]:text-[20px]
              [&_th]:p-3 [&_th]:border [&_th]:border-[#1a1a1a]/10 [&_th]:bg-black/5 [&_th]:font-bold [&_th]:text-[20px]
              [&_pre]:bg-[#1e1c24] [&_pre]:text-[#f8f8f2] [&_pre]:p-6 [&_pre]:rounded-[20px] [&_pre]:font-mono [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/5 [&_pre]:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#f8f8f2]
              [&_code]:font-mono [&_code]:bg-[rgba(109,85,167,0.08)] [&_code]:text-[#6d55a7] [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-[6px] [&_code]:text-[18px]
            ">
              {content}
            </div>
          </div>

          {/* Advocacy Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-32">
            {/* Who I Am Card */}
            <Link to="/about" className="block transform transition-transform hover:scale-[1.02]">
              <div className="bg-[#1a1133] rounded-[32px] p-8 text-white relative overflow-hidden group min-h-[320px] flex flex-col items-center justify-center text-center">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-8 ring-4 ring-[#EAFF00]/20 shadow-2xl">
                    <img 
                      src="/images/472164386_10170748401095387_7067836675242530090_n.jpg" 
                      alt="Abdullah Malik" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-10 py-5 bg-[#EAFF00] text-[#1a1a1a] rounded-full text-base font-black uppercase tracking-widest transition-transform group-hover:scale-105 shadow-xl shadow-[#EAFF00]/20">
                    WHO I AM?
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAFF00]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              </div>
            </Link>

            {/* Newsletter Subscription (Stay Updated) - Neon Yellow */}
            <div className="bg-[#EAFF00] rounded-[32px] p-8 shadow-xl shadow-black/5 border border-black/5">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="w-full px-5 py-4 bg-white/50 rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-black/10 placeholder:text-black/30"
                />
                <button className="w-full py-5 bg-[#1a1a1a] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-black/20">
                  Join Newsletter
                </button>
              </form>
            </div>

            {/* Linked Cards from DB */}
            {linkedCardIds && linkedCardIds.length > 0 ? (
              <LinkedCardsSidebar cardIds={linkedCardIds} />
            ) : (
              <>
                {/* Writing Card (Growth Hacking - Purple) */}
                {randomInsight && (
                  <Link to={randomInsight.link} className="block transform transition-transform hover:scale-[1.02]">
                    <div className="bg-[#6d55a7] rounded-[48px] p-12 text-white relative flex flex-col items-center text-center overflow-hidden min-h-[440px] justify-center">
                      <div className="mb-6">
                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
                          BLOG & RESOURCES
                        </span>
                      </div>
                      <h3 className="text-[28px] font-display font-bold leading-[1.1] mb-6 font-serif">
                        {randomInsight.title}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-10 max-w-[280px] font-medium">
                        {randomInsight.text}
                      </p>
                      <div className="px-12 py-5 bg-[#EAFF00] text-[#1a1a1a] rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#EAFF00]/20">
                        Read more
                      </div>
                      {/* Decorative dots */}
                      <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1 opacity-20">
                          {[...Array(16)].map((_, i) => <div key={i} className="w-1 h-1 bg-white rounded-full" />)}
                      </div>
                    </div>
                  </Link>
                )}

                {/* Case Study Card (Random) */}
                {randomCase && (
                  <Link to={`/case-study/${randomCase.slug || randomCase.id}`} className="block transform transition-transform hover:scale-[1.02]">
                    <div 
                      style={{ backgroundColor: randomCase.color }}
                      className="rounded-[56px] p-12 text-white relative min-h-[520px] flex flex-col justify-end overflow-hidden group"
                    >
                      <div className="absolute top-10 left-10">
                        <span className="px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                          {randomCase.tag}
                        </span>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-3xl font-display font-medium leading-[1.1] mb-10">
                          {randomCase.title}
                        </h3>
                        <div className="inline-flex items-center gap-3 px-10 py-5 bg-[#fbe1ff] text-[#1a1a1a] rounded-full font-bold text-sm shadow-xl shadow-black/20 group-hover:bg-[#EAFF00] transition-colors">
                          <span>Read more</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                      {/* Decorative element */}
                      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors" />
                    </div>
                  </Link>
                )}
              </>
            )}

            {/* Contact CTA Area Removed */}
          </aside>
        </div>
      </div>

      {/* bottom sections */}
      <div className="mt-32">
          <StaggerTestimonials />
          <LatestInsights />
          <CaseWork />
      </div>
    </div>
  );
}
