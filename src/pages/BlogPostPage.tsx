import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Share2, Clock, User, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { Writing } from '../types';
import { getPublishedContent } from '../lib/firebase/cms';
import { LinkedCardsSidebar } from '../components/cms/CardRenderer';

// Add the content field to the type if it doesn't exist in our base interface
interface BlogDetail extends Writing {
  content?: string;
  authorBio?: string;
  authorImage?: string;
  linkedCardIds?: string[];
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const findBlog = async () => {
      setLoading(true);
      
      // Try the backend for user-published writings
      try {
        const published = await getPublishedContent();
        const userBlog = published.find(w => w.id === id);
        
        if (userBlog) {
          setBlog({
            id: userBlog.id,
            title: userBlog.title,
            excerpt: userBlog.excerpt || '',
            content: userBlog.content,
            date: new Date(userBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            imageUrl: userBlog.headerImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
            category: (userBlog.category as 'Blog' | 'News' | 'Strategy') || 'Blog',
            author: userBlog.authorName || 'Anonymous',
            authorBio: userBlog.authorBio,
            authorImage: userBlog.authorImage || undefined,
            tags: userBlog.tags,
            badgeText: userBlog.badgeText || '',
            linkedCardIds: userBlog.linkedCardIds
          });
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    findBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-m3-surface flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-m3-primary/30 border-t-m3-primary rounded-full"
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-m3-surface flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-display font-medium text-m3-on-surface mb-4">Post not found</h2>
        <p className="text-m3-on-surface/60 mb-8">The insight you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/my-writings')}
          className="px-8 py-4 bg-m3-primary text-m3-on-primary rounded-full font-bold uppercase tracking-widest text-xs"
        >
          Back to all writings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-m3-surface text-m3-on-surface transition-colors duration-300">
      <Helmet>
        <title>{blog.title} | Artery Insights</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.imageUrl} />
        <meta name="keywords" content={blog.category + ", insight, strategy, AI"} />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-m3-surface/80 backdrop-blur-xl border-b border-m3-outline/10 h-20 px-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/my-writings')}
          className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-m3-on-surface/60 hover:text-m3-primary transition-all"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-4">
          <button className="p-3 rounded-full hover:bg-m3-primary/5 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-32">
        <article className="max-w-[1240px] mx-auto px-6">
          {/* Header */}
          <header className="mb-16">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-wrap items-center gap-4 mb-8"
            >
              <span className="bg-m3-primary/10 text-m3-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border border-m3-primary/20">
                {blog.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-m3-on-surface/40">
                {blog.date}
              </span>
              <div className="w-px h-4 bg-m3-outline/20 mx-2" />
              <div className="flex items-center gap-2 text-m3-on-surface/60">
                 <Clock className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">~5 MIN READ</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-medium leading-[0.95] tracking-[-0.03em] mb-12"
            >
              {blog.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="aspect-[16/9] w-full rounded-[64px] overflow-hidden bg-m3-surface-container mb-16 shadow-2xl"
            >
              <img 
                src={blog.imageUrl} 
                className="w-full h-full object-cover" 
                alt="Banner" 
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div 
                className="blog-content prose prose-xl max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-p:text-m3-on-surface/80 prose-p:leading-relaxed prose-blockquote:italic prose-blockquote:text-m3-primary prose-img:rounded-[32px]"
                dangerouslySetInnerHTML={{ __html: blog.content || `<p>${blog.excerpt}</p><p>This is a mock representation of the blog post content. In a real system, the full rich text content saved in the database would render here.</p>` }}
              />

              {/* Tags */}
              <div className="mt-16 pt-8 border-t border-m3-outline/10 flex flex-wrap gap-3">
                {blog.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-4 py-2 bg-m3-surface-container rounded-full text-xs font-bold uppercase tracking-widest text-m3-on-surface/60 border border-m3-outline/10">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                {blog.linkedCardIds && blog.linkedCardIds.length > 0 && (
                  <LinkedCardsSidebar cardIds={blog.linkedCardIds} />
                )}

                <div className="bg-m3-surface-container p-10 rounded-[48px] border border-m3-outline/10">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-6 bg-m3-primary/10 border-2 border-m3-primary/20">
                      <img 
                        src={blog.authorImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"} 
                        alt={blog.author}
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-m3-primary mb-2">Insight By</div>
                    <h3 className="text-2xl font-display font-medium text-m3-on-surface mb-3">{blog.author}</h3>
                    <p className="text-sm text-m3-on-surface/60 leading-relaxed font-sans">
                      {blog.authorBio || "Leading strategy and innovation advisor. Focused on the structural transformation of the digital economy."}
                    </p>
                  </div>
                </div>

                <div className="bg-[#EAFF00] p-10 rounded-[48px] shadow-xl shadow-[#EAFF00]/10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-m3-on-surface mb-4 text-center">Interested?</h4>
                   <p className="text-sm font-medium text-m3-on-surface/80 text-center leading-relaxed">
                     Let's talk about how these insights can manifest in your business ecosystem.
                   </p>
                   <button className="w-full mt-8 py-4 bg-m3-on-surface text-[#EAFF00] rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">
                     Reach out
                   </button>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>

      <style>{`
        .blog-content {
          font-size: 1.25rem;
          line-height: 1.8;
          color: rgba(var(--m3-on-surface-rgb, 26, 26, 26), 0.9);
        }
        .blog-content h2 {
          font-size: 2.5rem;
          margin-top: 4rem;
          margin-bottom: 2rem;
          color: #1a1a1a;
          line-height: 1.1;
        }
        .blog-content p {
          margin-bottom: 2rem;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 3rem;
          margin: 4rem 0;
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1);
        }
        .blog-content blockquote {
          font-family: var(--font-display);
          font-size: 2rem;
          font-style: italic;
          border-left: 0;
          padding: 3rem 0;
          margin: 4rem 0;
          color: var(--m3-primary);
          line-height: 1.2;
          position: relative;
        }
        .blog-content blockquote::before {
          content: '"';
          position: absolute;
          top: -2rem;
          left: -1rem;
          font-size: 8rem;
          opacity: 0.1;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
