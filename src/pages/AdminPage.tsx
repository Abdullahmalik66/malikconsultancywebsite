import React, { useState } from "react";
import { useAuth } from "../lib/firebase/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, ShieldCheck, Database, FolderGit2, Cpu, Settings, FileText, Plus, Layout, Globe } from "lucide-react";
import ContentList from "../components/admin/ContentList";
import AdminContentEditor from "../components/admin/AdminContentEditor";
import CardBuilder from "../components/admin/CardBuilder";
import ClientShowcaseManager from "../components/admin/ClientShowcaseManager";
import SeoWorkspace from "../components/admin/SeoWorkspace";
import { ContentItem } from "../lib/firebase/cms";

type Tab = 'dashboard' | 'content' | 'editor' | 'cards' | 'showcase' | 'seo';

export default function AdminPage() {
  const { currentUser, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEditContent = (item: ContentItem) => {
    setEditingItem(item);
    setActiveTab('editor');
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setActiveTab('editor');
  };

  return (
    <div
      id="admin-dashboard-viewport"
      className="min-h-screen bg-gradient-to-tr from-[#fbfafc] via-[#f5f3fa] to-[#efedf5] dark:from-[#141218] dark:via-[#1c1b22] dark:to-[#25232a] text-m3-on-surface font-sans pt-[120px] pb-24 px-4 select-none"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top welcome card / Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-6 md:p-8 rounded-[32px] shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-m3-primary" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-m3-secondary-container text-m3-on-secondary-container flex items-center justify-center shrink-0 shadow-sm hidden md:flex">
                <ShieldCheck className="w-6 h-6 text-m3-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-semibold text-m3-on-surface tracking-tight mb-1">
                  System Administration
                </h1>
                <div className="flex items-center gap-2 text-xs font-mono bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface/60 px-3 py-1 rounded-full border border-m3-outline/10 w-fit">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {currentUser?.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-m3-error/20 text-m3-error hover:bg-m3-error/5 text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? 'Signing Out...' : <><LogOut className="w-4 h-4" /> Sign Out</>}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'dashboard' ? 'bg-m3-surface-container-high text-m3-on-surface shadow-sm border border-m3-outline/10' : 'text-m3-on-surface/50 hover:bg-m3-surface-container'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === 'content' || activeTab === 'editor' ? 'bg-m3-surface-container-high text-m3-on-surface shadow-sm border border-m3-outline/10' : 'text-m3-on-surface/50 hover:bg-m3-surface-container'
              }`}
            >
              <FileText className="w-4 h-4" /> Content Manager
            </button>
            
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === 'cards' ? 'bg-m3-surface-container-high text-m3-on-surface shadow-sm border border-m3-outline/10' : 'text-m3-on-surface/50 hover:bg-m3-surface-container'
              }`}
            >
              <Layout className="w-4 h-4" /> Card Builder
            </button>
            
            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === 'showcase' ? 'bg-m3-surface-container-high text-m3-on-surface shadow-sm border border-m3-outline/10' : 'text-m3-on-surface/50 hover:bg-m3-surface-container'
              }`}
            >
              <FolderGit2 className="w-4 h-4" /> Client Showcase
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === 'seo' ? 'bg-m3-surface-container-high text-m3-on-surface shadow-sm border border-m3-outline/10' : 'text-m3-on-surface/50 hover:bg-m3-surface-container'
              }`}
            >
              <Globe className="w-4 h-4" /> SEO Workspace
            </button>
          </div>
        </motion.div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-8 rounded-[32px] shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-display font-semibold text-m3-on-surface mb-2">
                    System Architecture Status
                  </h2>
                  <p className="text-sm text-m3-on-surface/60">
                    Firebase backend foundations are fully initialized. Content is now served from Realtime Database.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-m3-surface/40 dark:bg-m3-surface/5 border border-m3-outline/10 p-5 rounded-2xl flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-m3-primary/10 text-m3-primary rounded-xl">
                        <Database className="w-5 h-5" />
                      </div>
                      <span className="font-display font-medium text-sm text-m3-on-surface">Realtime Database</span>
                    </div>
                    <p className="text-xs text-m3-on-surface/50 leading-relaxed">
                      Content and moderation flows are active.
                    </p>
                  </div>

                  <div className="bg-m3-surface/40 dark:bg-m3-surface/5 border border-m3-outline/10 p-5 rounded-2xl flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-m3-primary/10 text-m3-primary rounded-xl">
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                      <span className="font-display font-medium text-sm text-m3-on-surface">Cloud Storage</span>
                    </div>
                    <p className="text-xs text-m3-on-surface/50 leading-relaxed">
                      Image uploads are securely handled.
                    </p>
                  </div>

                  <div className="bg-m3-surface/40 dark:bg-m3-surface/5 border border-m3-outline/10 p-5 rounded-2xl flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-m3-primary/10 text-m3-primary rounded-xl">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="font-display font-medium text-sm text-m3-on-surface">Card System</span>
                    </div>
                    <p className="text-xs text-m3-on-surface/50 leading-relaxed">
                      Card rendering engine is under construction.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ContentList onEdit={handleEditContent} onCreateNew={handleCreateNew} />
            </motion.div>
          )}

          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <AdminContentEditor 
                initialContent={editingItem} 
                onClose={() => setActiveTab('content')} 
                onSaveComplete={() => setActiveTab('content')} 
              />
            </motion.div>
          )}

          {activeTab === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <CardBuilder />
            </motion.div>
          )}
          
          {activeTab === 'showcase' && (
            <motion.div
              key="showcase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ClientShowcaseManager />
            </motion.div>
          )}

          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <SeoWorkspace />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
