import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Share2, Clock, User, Tag,
  Linkedin, Facebook, Copy, Check, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Writing } from '../types';
import { getPublishedContent, getCommentsByBlogId, saveComment, BlogComment } from '../lib/firebase/cms';
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
        const userBlog = published.find(w => w.contentType === 'blog' && (w.slug === id || w.id === id));

        if (userBlog) {
          setBlog({
            id: userBlog.id,
            slug: userBlog.slug,
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

  // Comments and Share state
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    const fetchComments = async () => {
      try {
        const list = await getCommentsByBlogId(id);
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setComments(list);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };
    fetchComments();
  }, [id]);

  // Click outside listener for Share menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Post Comment Handler
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await saveComment(id, commentName || 'Anonymous', commentText);
      setComments([...comments, newComment]);
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Share Handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || 'Artery Insight',
          text: blog?.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        console.error("Native share failed", err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Helper for dynamic reading time
  const calculateReadingTime = (htmlContent: string | undefined): number => {
    if (!htmlContent) return 1;
    const text = htmlContent.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(words / 200);
    return minutes > 0 ? minutes : 1;
  };

  const dynamicReadTime = calculateReadingTime(blog?.content);

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
    <div className="min-h-[100svh] bg-m3-surface text-m3-on-surface transition-colors duration-300">
      <Helmet>
        <title>{blog.title} | Artery Insights</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.imageUrl} />
        <meta name="keywords" content={blog.category + ", insight, strategy, AI"} />
      </Helmet>

      <main className="pt-36 pb-32">
        <article className="max-w-[1240px] mx-auto px-6">
          {/* Action Row: Back & Share (positioned after the global header) */}
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-m3-outline/10">
            <button
              onClick={() => navigate('/my-writings')}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-m3-on-surface/60 hover:text-m3-primary transition-all"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to writings</span>
            </button>

            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-m3-outline/20 text-xs font-bold uppercase tracking-widest hover:bg-m3-surface-container transition-all text-m3-on-surface"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 p-2 w-48 bg-white dark:bg-[#1d1b20] border border-m3-outline/20 rounded-2xl shadow-xl z-50 text-m3-on-surface flex flex-col gap-1"
                  >
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-m3-primary/10 hover:text-m3-primary transition-colors"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-m3-primary/10 hover:text-m3-primary transition-colors"
                    >
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                    <button
                      onClick={() => {
                        handleShareNative();
                        setShowShareMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-m3-primary/10 hover:text-m3-primary transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Link / Share'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

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
                <span className="text-[10px] font-bold uppercase tracking-widest">~{dynamicReadTime} MIN READ</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-5xl md:text-7xl lg:text-8xl font-display font-medium leading-[0.95] tracking-[-0.03em] ${blog.tags && blog.tags.length > 0 ? 'mb-8' : 'mb-12'
                }`}
            >
              {blog.title}
            </motion.h1>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-12">
                {blog.tags.map(tag => (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-m3-primary/10 dark:bg-m3-primary/20 text-m3-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-m3-primary/20 transition-all cursor-default hover:shadow-lg hover:shadow-m3-primary/15 hover:bg-m3-primary/15"
                  >
                    <Tag className="w-3.5 h-3.5 text-m3-primary/70" />
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}

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
                className="blog-content prose prose-xl max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight text-m3-on-surface dark:text-[#F3F0F5] prose-headings:text-m3-on-surface dark:prose-headings:text-white prose-p:text-m3-on-surface/90 dark:prose-p:text-[#F3F0F5] prose-p:leading-relaxed prose-blockquote:italic prose-blockquote:text-m3-primary prose-img:rounded-[32px]"
                dangerouslySetInnerHTML={{ __html: blog.content || `<p>${blog.excerpt}</p><p>This is a mock representation of the blog post content. In a real system, the full rich text content saved in the database would render here.</p>` }}
              />

              {/* Tags */}
              <div className="mt-16 pt-8 border-t border-m3-outline/10 flex flex-wrap gap-3">
                {blog.tags?.map(tag => (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-m3-primary/10 dark:bg-m3-primary/20 text-m3-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-m3-primary/20 transition-all cursor-default hover:shadow-lg hover:shadow-m3-primary/15 hover:bg-m3-primary/15"
                  >
                    <Tag className="w-3.5 h-3.5 text-m3-primary/70" />
                    {tag}
                  </motion.span>
                ))}
              </div>

              {/* Comments Section */}
              <div className="mt-20 pt-12 border-t border-m3-outline/10 space-y-10">
                <div>
                  <h3 className="text-3xl font-display font-medium text-m3-on-surface tracking-tight mb-2">
                    Discussion ({comments.length})
                  </h3>
                  <p className="text-xs text-m3-on-surface/50 font-sans uppercase tracking-widest">
                    Share your perspective on this insight
                  </p>
                </div>

                {/* Comment Form */}
                <form onSubmit={handlePostComment} className="space-y-4 bg-m3-surface-container/30 p-6 md:p-8 rounded-[32px] border border-m3-outline/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-2 pl-1">Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Anonymous"
                        value={commentName}
                        onChange={e => setCommentName(e.target.value)}
                        className="w-full bg-white dark:bg-[#1d1b20] border border-m3-outline/10 rounded-2xl px-4 py-3 text-sm font-medium text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-2 pl-1">Comment</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your thoughts..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="w-full bg-white dark:bg-[#1d1b20] border border-m3-outline/10 rounded-2xl px-4 py-3 text-sm font-medium text-m3-on-surface focus:ring-2 focus:ring-m3-primary focus:border-transparent outline-none transition-all resize-none font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <AnimatePresence>
                        {commentSuccess && (
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-semibold text-green-500 flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> Comment posted!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="flex items-center gap-2 px-6 py-3.5 bg-m3-primary text-m3-on-primary text-xs font-bold uppercase tracking-widest rounded-full hover:bg-m3-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmittingComment ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Comments Feed */}
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const initials = comment.authorName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'A';

                    const dateStr = new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4 p-5 bg-white dark:bg-[#1d1b20] rounded-[24px] border border-m3-outline/5 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center font-display font-bold text-xs shrink-0 select-none">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                            <h4 className="text-sm font-bold text-m3-on-surface">{comment.authorName}</h4>
                            <span className="text-[10px] text-m3-on-surface/40 font-mono font-medium">{dateStr}</span>
                          </div>
                          <p className="text-sm text-m3-on-surface/85 leading-relaxed break-words whitespace-pre-wrap font-sans">
                            {comment.commentText}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {comments.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-m3-outline/10 rounded-[32px]">
                      <p className="text-sm text-m3-on-surface/40 font-medium">No comments yet. Be the first to join the discussion!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Author Sidebar */}
            <aside className="lg:col-span-4 space-y-8 relative">
              {/* 1. Name Card (static, fixed) */}
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
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-m3-primary mb-2">Insight By</div>
                  <h3 className="text-2xl font-display font-medium text-m3-on-surface mb-3">{blog.author}</h3>
                  <p className="text-sm text-m3-on-surface/60 leading-relaxed font-sans">
                    {blog.authorBio || "Leading strategy and innovation advisor. Focused on the structural transformation of the digital economy."}
                  </p>
                </div>
              </div>

              {/* 2. Other Cards (static, fixed) */}
              {blog.linkedCardIds && blog.linkedCardIds.length > 0 && (
                <LinkedCardsSidebar cardIds={blog.linkedCardIds} />
              )}

              {/* 3. Reach Out Card (sticky, moves along with content) */}
              <div className="sticky top-36 bg-[#EAFF00] p-10 rounded-[48px] shadow-xl shadow-[#EAFF00]/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-m3-on-surface mb-4 text-center">Interested?</h4>
                <p className="text-sm font-medium text-m3-on-surface/80 text-center leading-relaxed">
                  Let's talk about how these insights can manifest in your business ecosystem.
                </p>
                <Link to="/reach-me" className="block w-full">
                  <button className="w-full mt-8 py-4 bg-m3-on-surface text-[#EAFF00] rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    Reach out
                  </button>
                </Link>
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
        .blog-content h1 {
          font-family: var(--font-display);
          font-size: 2.75rem;
          font-weight: 700;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
          line-height: 1.1;
        }
        .blog-content h2 {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          color: #1a1a1a;
          line-height: 1.15;
        }
        .blog-content h3 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .blog-content h4 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #1a1a1a;
          line-height: 1.25;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          line-height: 1.8;
        }
        .blog-content ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 1.5rem !important;
        }
        .blog-content ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 1.5rem !important;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
          line-height: 1.8;
          list-style: inherit !important;
        }
        .blog-content strong, .blog-content b {
          font-weight: 700 !important;
          color: #1a1a1a;
        }
        .blog-content em, .blog-content i {
          font-style: italic !important;
        }
        .blog-content u {
          text-decoration: underline !important;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 3rem;
          margin: 3rem 0;
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1);
        }
        .blog-content blockquote {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-style: italic;
          border-left: 4px solid var(--m3-primary);
          padding: 1.5rem 0 1.5rem 2rem;
          margin: 3rem 0;
          color: var(--m3-primary);
          line-height: 1.3;
          background-color: rgba(var(--m3-primary-rgb), 0.05);
          border-radius: 1rem;
        }
        .blog-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 2rem 0 !important;
        }
        .blog-content th, .blog-content td {
          border: 1px solid rgba(0,0,0,0.1) !important;
          padding: 0.75rem 1rem !important;
          text-align: left;
        }
        .blog-content th {
          background-color: rgba(0,0,0,0.02) !important;
          font-weight: 700 !important;
        }
        .blog-content pre {
          background-color: #1e1c24 !important;
          color: #f8f8f2 !important;
          padding: 1.5rem 2rem !important;
          border-radius: 1.25rem !important;
          overflow-x: auto !important;
          margin: 2rem 0 !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        .blog-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 0.9em !important;
          background-color: rgba(109, 85, 167, 0.08) !important;
          color: #6d55a7 !important;
          padding: 0.2rem 0.4rem !important;
          border-radius: 0.375rem !important;
        }
        .blog-content pre code {
          background-color: transparent !important;
          color: #f8f8f2 !important;
          padding: 0 !important;
          border-radius: 0 !important;
          font-size: 0.9em !important;
        }
      `}</style>
    </div>
  );
}
