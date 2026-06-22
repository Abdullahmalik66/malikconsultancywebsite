import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Type, 
  ChevronLeft, 
  Check,
  Quote,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveContent, generateSlug, uploadImage } from '../lib/firebase/cms';
import SlateEditor from '../components/admin/SlateEditor';

export default function BlogEditorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [content, setContent] = useState('');
  // Author fields
  const [authorName, setAuthorName] = useState('Abdullah Malik');
  const [authorBio, setAuthorBio] = useState(
    'Driving AI Transformation ┊ Agentic AI Use Case Pioneer ┊ Leadership in Scalable Innovation'
  );
  const [authorImage, setAuthorImage] = useState<string | null>(
    '/images/472164386_10170748401095387_7067836675242530090_n.jpg'
  );
  const [authorFile, setAuthorFile] = useState<File | null>(null);

  // Header Image
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const handleStartAnotherDraft = () => {
    setTitle('');
    setTags([]);
    setCurrentTag('');
    setContent('');
    setHeaderImage(null);
    setHeaderFile(null);
    setEditorKey(prev => prev + 1);
    setIsSuccessModalOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorPhotoRef = useRef<HTMLInputElement>(null);
  const headerPhotoRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };



  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setHeaderImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthorFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAuthorImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const handlePublish = async () => {
    if (!title) return;
    
    setIsPublishing(true);
    
    try {
      let finalHeaderImage = null;
      let finalAuthorImage = null;

      if (headerFile) {
        finalHeaderImage = await uploadImage(headerFile, 'headers');
      } else if (headerImage) {
        finalHeaderImage = headerImage; // might be base64 or url
      }

      if (authorFile) {
        finalAuthorImage = await uploadImage(authorFile, 'authors');
      } else if (authorImage) {
        finalAuthorImage = authorImage;
      }

      const editorContent = content;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      const plainText = tempDiv.innerText || '';
      const excerpt = plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;

      await saveContent({
        contentType: 'blog',
        status: 'pending', // IMPORTANT: Front-end submission is pending review
        title,
        slug: generateSlug(title),
        excerpt: excerpt,
        content: editorContent,
        headerImage: finalHeaderImage || extractFirstImage(editorContent) || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
        authorName: authorName || 'Anonymous',
        authorBio,
        authorImage: finalAuthorImage,
        tags,
        category: 'Blog',
        badgeText: tags[0] || "NEW",
        submittedBy: 'frontend'
      });
      
      setIsPublishing(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Publishing error:", error);
      setIsPublishing(false);
    }
  };

  const extractFirstImage = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    return img ? img.src : null;
  };

  return (
    <div className="min-h-screen bg-m3-surface font-sans text-m3-on-surface transition-colors duration-300">
      {/* Editor Content Area */}
      <main className="pt-40 pb-32 max-w-[1240px] mx-auto px-6 relative z-10">
        
        {/* Navigation / Actions Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/my-writings')}
              className="group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-m3-on-surface/40 hover:text-m3-primary transition-all"
            >
              <div className="p-3 rounded-full border border-m3-outline/20 group-hover:border-m3-primary/30 group-hover:bg-m3-primary/5 transition-all">
                <ChevronLeft className="w-5 h-5 text-m3-on-surface" />
              </div>
              <span className="hidden sm:inline">Back to writings</span>
            </button>
            <div className="hidden md:block w-px h-8 bg-m3-outline/20" />
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-m3-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-m3-primary">Drafting Mode</span>
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={!title || isPublishing}
            className={`px-10 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl ${
              !title 
                ? 'bg-m3-surface-container-high text-m3-on-surface/20 cursor-not-allowed shadow-none border border-m3-outline/10' 
                : 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90 hover:scale-105 active:scale-95 shadow-m3-primary/20'
            }`}
          >
            {isPublishing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-m3-on-primary/30 border-t-m3-on-primary rounded-full"
                />
                Saving Draft...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Publish Now
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Side: Main Editor */}
          <div className="lg:col-span-8 bg-m3-surface-container rounded-[64px] p-6 md:p-12 shadow-sm border border-m3-outline/10 h-fit">
            
            {/* Header Image Upload Area */}
            <div 
              onClick={() => headerPhotoRef.current?.click()}
              className={`relative w-full aspect-[16/7] rounded-[48px] overflow-hidden mb-12 cursor-pointer group border-2 border-dashed transition-all ${
                headerImage 
                  ? 'border-transparent' 
                  : 'border-m3-outline/20 hover:border-m3-primary/40 bg-m3-surface-container-high' 
              }`}
            >
              {headerImage ? (
                <>
                  <img src={headerImage} alt="Header" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-m3-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-bold text-m3-surface uppercase tracking-widest bg-m3-on-surface/20 px-6 py-3 rounded-full backdrop-blur-md">Change Cover Photo</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 rounded-full bg-m3-primary/5 mb-4 group-hover:bg-m3-primary/10 transition-colors">
                    <ImageIcon className="w-8 h-8 text-m3-on-surface/20 group-hover:text-m3-primary transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-m3-on-surface/40">Add Header Insight Picture</h3>
                  <p className="text-[10px] text-m3-on-surface/20 mt-2">This will be the main highlight of your story.</p>
                </div>
              )}
            </div>
            <input type="file" ref={headerPhotoRef} onChange={handleHeaderUpload} className="hidden" accept="image/*" />

            <div className="px-6 md:px-8">
              <TextareaAutosize
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-5xl md:text-6xl lg:text-7xl font-display font-medium border-none focus:ring-0 placeholder:text-m3-on-surface/10 resize-none mb-6 leading-[0.95] tracking-tight bg-transparent text-m3-on-surface"
              />

            <div className="flex flex-wrap gap-2 mb-12 items-center">
              {tags.map(tag => (
                <span key={tag} className="bg-m3-primary/10 text-m3-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group border border-m3-primary/20">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-m3-primary/40 hover:text-m3-error transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ Add tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="border-none focus:ring-0 text-[10px] font-bold uppercase tracking-widest p-0 placeholder:text-m3-on-surface/20 w-32 bg-transparent ml-2 text-m3-on-surface"
              />
            </div>

             <div className="relative group editor-container">
               <SlateEditor 
                 key={editorKey}
                 initialHtml={content}
                 onChangeHtml={setContent}
               />
             </div>
          </div>
        </div>

        {/* Right Side: Author Info Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-40 space-y-8">
              <div className="bg-m3-surface-container p-8 rounded-[48px] shadow-sm border border-m3-outline/10 overflow-hidden">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-m3-on-surface/40 mb-8">Author Details</h4>
                
                <div className="flex flex-col items-center text-center">
                  <div 
                    onClick={() => authorPhotoRef.current?.click()}
                    className="w-32 h-32 rounded-full bg-m3-surface-container-high border-2 border-dashed border-m3-outline/20 mb-6 cursor-pointer overflow-hidden group relative flex items-center justify-center transition-all hover:border-m3-primary/40"
                  >
                    {authorImage ? (
                      <img src={authorImage} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-m3-on-surface/20 group-hover:text-m3-primary transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-m3-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[10px] font-bold text-m3-surface uppercase tracking-widest">Change Photo</span>
                    </div>
                  </div>
                  <input type="file" ref={authorPhotoRef} onChange={handleAuthorPhotoUpload} className="hidden" accept="image/*" />

                  <input 
                    type="text" 
                    placeholder="Author Name" 
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full text-2xl font-display font-medium text-center border-none focus:ring-0 placeholder:text-m3-on-surface/10 bg-transparent mb-2 text-m3-on-surface"
                  />
                  
                  <TextareaAutosize
                    placeholder="Short Bio / Description..."
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    className="w-full text-center text-sm text-m3-on-surface/60 leading-relaxed border-none focus:ring-0 placeholder:text-m3-on-surface/20 bg-transparent resize-none"
                  />
                </div>

                <div className="h-px bg-m3-outline/10 my-8" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40">
                     <span>Reading Time</span>
                     <span className="text-m3-on-surface">~4 min</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40">
                     <span>Visibility</span>
                     <span className="text-m3-on-surface">Public</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#EAFF00] p-8 rounded-[48px] shadow-xl shadow-[#EAFF00]/10">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-m3-on-surface mb-2 text-center">Writing Tips</h4>
                 <p className="text-sm font-medium text-m3-on-surface/80 text-center leading-relaxed italic">
                   "Great writing isn't just about what you say, but the clarity of the insight you provide."
                 </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .editor-container .ck-editor__editable_inline { min-height: 500px; border-bottom-left-radius: 16px !important; border-bottom-right-radius: 16px !important; }
          .editor-container .ck-toolbar { border-top-left-radius: 16px !important; border-top-right-radius: 16px !important; background-color: #2d2b33 !important; border: 1px solid rgba(255,255,255,0.1) !important; }
          .editor-container .ck-button { color: #fff !important; }
          .editor-container .ck-button:hover { background-color: rgba(255,255,255,0.1) !important; }
          .editor-container .ck-button.ck-on { background-color: rgba(255,255,255,0.2) !important; }
          .editor-container .ck-dropdown__panel { background-color: #2d2b33 !important; }
          .editor-container .ck-list__item .ck-button { color: #fff !important; }
          .editor-container .ck-list__item .ck-button:hover { background-color: rgba(255,255,255,0.1) !important; }

        `}</style>
      </main>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative bg-white dark:bg-[#1e1c24] max-w-md w-full rounded-[40px] p-8 md:p-10 shadow-2xl text-center border border-m3-outline/10 overflow-hidden"
            >
              {/* Circular success icon container */}
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#6d55a7]/10 flex items-center justify-center text-[#6d55a7]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-display font-medium text-m3-on-surface mb-3 tracking-tight">
                Submitted. Now under review.
              </h3>

              {/* Body text */}
              <p className="text-sm text-m3-on-surface/60 leading-relaxed mb-8">
                Your insight has been saved successfully and moved into the review queue. You will be able to publish it once it has been approved in the admin panel.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/my-writings')}
                  className="px-6 py-3.5 rounded-full bg-[#6d55a7] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#6d55a7]/90 active:scale-95 transition-all shadow-md flex-1 cursor-pointer"
                >
                  Go to writings
                </button>
                <button
                  onClick={handleStartAnotherDraft}
                  className="px-6 py-3.5 rounded-full border border-m3-outline/20 text-m3-on-surface hover:bg-m3-surface-container text-xs font-bold uppercase tracking-widest active:scale-95 transition-all flex-1 cursor-pointer"
                >
                  Start another draft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
