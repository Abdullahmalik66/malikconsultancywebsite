import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { 
  Plus, X, Image as ImageIcon, ChevronLeft, Check, Quote, Save, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveContent, generateSlug, uploadImage, ContentItem, ContentStatus } from '../../lib/firebase/cms';
import SlateEditor from './SlateEditor';

interface AdminContentEditorProps {
  initialContent?: ContentItem | null;
  onClose: () => void;
  onSaveComplete: () => void;
}

export default function AdminContentEditor({ initialContent, onClose, onSaveComplete }: AdminContentEditorProps) {
  const [title, setTitle] = useState(initialContent?.title || '');
  const [tags, setTags] = useState<string[]>(initialContent?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [content, setContent] = useState(initialContent?.content || '');

  const [authorName, setAuthorName] = useState(initialContent?.authorName || '');
  const [authorBio, setAuthorBio] = useState(initialContent?.authorBio || '');
  const [authorImage, setAuthorImage] = useState<string | null>(initialContent?.authorImage || null);
  const [authorFile, setAuthorFile] = useState<File | null>(null);

  const [headerImage, setHeaderImage] = useState<string | null>(initialContent?.headerImage || null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  
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
      reader.onload = (event) => setHeaderImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAuthorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthorFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setAuthorImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };



  const handleSave = async (status: ContentStatus) => {
    if (!title) return;
    setIsSaving(true);
    
    try {
      let finalHeaderImage = headerImage;
      let finalAuthorImage = authorImage;

      if (headerFile) {
        finalHeaderImage = await uploadImage(headerFile, 'headers');
      }
      if (authorFile) {
        finalAuthorImage = await uploadImage(authorFile, 'authors');
      }

      const editorContent = content;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      const plainText = tempDiv.innerText || '';
      const excerpt = plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;

      await saveContent({
        contentType: 'blog',
        status,
        title,
        slug: generateSlug(title),
        excerpt,
        content: editorContent,
        headerImage: finalHeaderImage,
        authorName: authorName || 'Admin',
        authorBio,
        authorImage: finalAuthorImage,
        tags,
        category: 'Blog',
        badgeText: tags[0] || "",
        submittedBy: 'admin'
      }, initialContent?.id);
      
      onSaveComplete();
    } catch (error) {
      console.error("Saving error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-m3-surface rounded-[48px] overflow-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between p-6 border-b border-m3-outline/10 bg-white dark:bg-[#1d1b20]">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-m3-on-surface/60 hover:text-m3-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Content
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleSave('draft')}
            disabled={!title || isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-m3-outline/20 text-xs font-bold uppercase tracking-widest hover:bg-m3-surface-container transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          
          <button 
            onClick={() => handleSave('published')}
            disabled={!title || isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-m3-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-m3-primary/90 transition-colors shadow-lg shadow-m3-primary/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> {initialContent?.status === 'published' ? 'Update Published' : 'Publish Now'}
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Side: Editor */}
        <div className="lg:col-span-8">
          {/* Header Image */}
          <div 
            onClick={() => headerPhotoRef.current?.click()}
            className={`relative w-full aspect-[16/7] rounded-[32px] overflow-hidden mb-10 cursor-pointer group border-2 border-dashed transition-all ${
              headerImage ? 'border-transparent' : 'border-m3-outline/20 hover:border-m3-primary/40 bg-m3-surface-container-high' 
            }`}
          >
            {headerImage ? (
              <>
                <img src={headerImage} alt="Header" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-6 py-3 rounded-full backdrop-blur-md">Change Cover Photo</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 rounded-full bg-m3-primary/5 mb-4 group-hover:bg-m3-primary/10 transition-colors">
                  <ImageIcon className="w-8 h-8 text-m3-on-surface/20 group-hover:text-m3-primary transition-colors" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-m3-on-surface/40">Add Cover Image</h3>
              </div>
            )}
          </div>
          <input type="file" ref={headerPhotoRef} onChange={handleHeaderUpload} className="hidden" accept="image/*" />

          {/* Title & Tags */}
          <TextareaAutosize
            placeholder="Insight Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl md:text-5xl font-display font-medium border-none focus:ring-0 placeholder:text-m3-on-surface/20 resize-none mb-6 leading-[1.1] tracking-tight bg-transparent text-m3-on-surface"
          />

          <div className="flex flex-wrap gap-2 mb-10 items-center">
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

          {/* Editor Body */}
          <div className="relative group editor-container">
            <SlateEditor 
              initialHtml={content}
              onChangeHtml={setContent}
            />
          </div>
        </div>

        {/* Right Side: Metadata */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="bg-m3-surface-container-low p-6 rounded-[32px] border border-m3-outline/10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-m3-on-surface/40 mb-6">Author & Meta</h4>
              
              <div className="flex flex-col items-center text-center mb-6">
                <div 
                  onClick={() => authorPhotoRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-m3-surface-container border-2 border-dashed border-m3-outline/20 mb-4 cursor-pointer overflow-hidden group relative flex items-center justify-center transition-all hover:border-m3-primary/40"
                >
                  {authorImage ? (
                    <img src={authorImage} alt="Author" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-m3-on-surface/20 group-hover:text-m3-primary" />
                  )}
                </div>
                <input type="file" ref={authorPhotoRef} onChange={handleAuthorPhotoUpload} className="hidden" accept="image/*" />

                <input 
                  type="text" 
                  placeholder="Author Name" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-lg font-display font-medium text-center border-none focus:ring-0 placeholder:text-m3-on-surface/20 bg-transparent mb-1 text-m3-on-surface"
                />
                <TextareaAutosize
                  placeholder="Bio..."
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  className="w-full text-center text-xs text-m3-on-surface/60 border-none focus:ring-0 placeholder:text-m3-on-surface/20 bg-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .editor-container .ck-editor__editable_inline { min-height: 400px; border-bottom-left-radius: 16px !important; border-bottom-right-radius: 16px !important; }
        .editor-container .ck-toolbar { border-top-left-radius: 16px !important; border-top-right-radius: 16px !important; background-color: #2d2b33 !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .editor-container .ck-button { color: #fff !important; }
        .editor-container .ck-button:hover { background-color: rgba(255,255,255,0.1) !important; }
        .editor-container .ck-button.ck-on { background-color: rgba(255,255,255,0.2) !important; }
        .editor-container .ck-dropdown__panel { background-color: #2d2b33 !important; }
        .editor-container .ck-list__item .ck-button { color: #fff !important; }
        .editor-container .ck-list__item .ck-button:hover { background-color: rgba(255,255,255,0.1) !important; }

      `}</style>
    </div>
  );
}
