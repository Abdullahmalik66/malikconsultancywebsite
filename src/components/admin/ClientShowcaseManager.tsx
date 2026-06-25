import React, { useState, useEffect } from "react";
import { 
  getAllClientLogos, 
  saveClientLogo, 
  deleteClientLogo, 
  uploadImage, 
  ClientLogoItem,
  getClientShowcaseSettings,
  saveClientShowcaseSettings
} from "../../lib/firebase/cms";
import { Plus, Trash2, Edit2, Upload, ArrowUp, ArrowDown, Check, X, ShieldAlert, Settings, FolderGit2, ChevronDown, ChevronUp } from "lucide-react";

export default function ClientShowcaseManager() {
  const [logos, setLogos] = useState<ClientLogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accordion Expand State
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  // Showcase Header Settings State
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [padding, setPadding] = useState("p-3");
  const [ringIndex, setRingIndex] = useState(1); // Default to Circle 2 (index 1)
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchLogos(),
        fetchSettings()
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load database details.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await getClientShowcaseSettings();
      setSettingsTitle(data.title);
      setSettingsDesc(data.description);
    } catch (err: any) {
      console.error("Failed to load settings:", err);
    }
  };

  const fetchLogos = async () => {
    try {
      const data = await getAllClientLogos();
      // Sort primarily by ringIndex, then by sortOrder
      const sorted = [...data].sort((a, b) => {
        if (a.ringIndex !== b.ringIndex) {
          return a.ringIndex - b.ringIndex;
        }
        return a.sortOrder - b.sortOrder;
      });
      setLogos(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to load showcase logos.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsTitle.trim()) {
      setError("Please enter a section heading.");
      return;
    }
    setIsSavingSettings(true);
    setError(null);
    try {
      await saveClientShowcaseSettings({
        title: settingsTitle.trim(),
        description: settingsDesc.trim()
      });
      alert("Showcase settings saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save showcase settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Reset text URL if file is selected
      setLogoUrl("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a client name.");
      return;
    }

    if (!selectedFile && !logoUrl.trim() && !editingId) {
      setError("Please select a file to upload or enter a logo URL.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalUrl = logoUrl;

      // Handle file upload
      if (selectedFile) {
        finalUrl = await uploadImage(selectedFile, "logos");
      }

      await saveClientLogo({
        name: name.trim(),
        logoUrl: finalUrl,
        padding,
        ringIndex,
        sortOrder: Number(sortOrder),
        active
      }, editingId || undefined);

      // Reset Form
      setName("");
      setLogoUrl("");
      setPadding("p-3");
      setRingIndex(1);
      setSortOrder(0);
      setActive(true);
      setSelectedFile(null);
      setEditingId(null);
      
      // Refresh Lists
      await fetchLogos();
    } catch (err: any) {
      setError(err.message || "Failed to save logo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (logo: ClientLogoItem) => {
    setEditingId(logo.id);
    setName(logo.name);
    setLogoUrl(logo.logoUrl);
    setPadding(logo.padding);
    setRingIndex(logo.ringIndex);
    setSortOrder(logo.sortOrder);
    setActive(logo.active);
    setSelectedFile(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this logo?")) return;
    setError(null);
    try {
      await deleteClientLogo(id);
      await fetchLogos();
    } catch (err: any) {
      setError(err.message || "Failed to delete logo.");
    }
  };

  const handleMoveOrder = async (logo: ClientLogoItem, direction: "up" | "down") => {
    // Find all logos in the same ring
    const ringLogos = logos.filter(l => l.ringIndex === logo.ringIndex);
    const index = ringLogos.findIndex(l => l.id === logo.id);
    
    if (direction === "up" && index > 0) {
      const prev = ringLogos[index - 1];
      const tempOrder = prev.sortOrder;
      
      setIsSaving(true);
      try {
        await saveClientLogo({ ...prev, sortOrder: logo.sortOrder }, prev.id);
        await saveClientLogo({ ...logo, sortOrder: tempOrder }, logo.id);
        await fetchLogos();
      } catch (err: any) {
        setError("Failed to change order.");
      } finally {
        setIsSaving(false);
      }
    } else if (direction === "down" && index < ringLogos.length - 1) {
      const next = ringLogos[index + 1];
      const tempOrder = next.sortOrder;

      setIsSaving(true);
      try {
        await saveClientLogo({ ...next, sortOrder: logo.sortOrder }, next.id);
        await saveClientLogo({ ...logo, sortOrder: tempOrder }, logo.id);
        await fetchLogos();
      } catch (err: any) {
        setError("Failed to change order.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setLogoUrl("");
    setPadding("p-3");
    setRingIndex(1);
    setSortOrder(0);
    setActive(true);
    setSelectedFile(null);
    setError(null);
  };

  // Helper to render Orbit Names
  const getRingName = (index: number) => {
    switch (index) {
      case 0: return "Circle 1 (Innermost - R180)";
      case 1: return "Circle 2 (R340)";
      case 2: return "Circle 3 (R500)";
      case 3: return "Circle 4 (Outermost - R660)";
      default: return `Circle ${index + 1}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Settings Accordion */}
      <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 rounded-[32px] overflow-hidden shadow-sm transition-all duration-300">
        <button
          type="button"
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="w-full px-8 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-m3-surface-container/20 dark:hover:bg-m3-surface-container/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-m3-primary/10 text-m3-primary rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-m3-on-surface text-base">
                Header Settings (Title & Description)
              </h3>
              <p className="text-xs text-m3-on-surface/50 mt-0.5">
                Edit the section title and description text displayed on the homepage.
              </p>
            </div>
          </div>
          <div className="text-m3-on-surface/50">
            {isSettingsExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {isSettingsExpanded && (
          <div className="px-8 pb-6 pt-2 border-t border-m3-outline/10 dark:border-m3-outline/20 bg-m3-surface/10 dark:bg-m3-surface/5">
            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
              {/* Heading Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                  Section Heading
                </label>
                <input 
                  type="text" 
                  value={settingsTitle} 
                  onChange={(e) => setSettingsTitle(e.target.value)} 
                  placeholder="e.g. Organisation I Worked With:" 
                  className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                  Section Description
                </label>
                <textarea 
                  value={settingsDesc} 
                  onChange={(e) => setSettingsDesc(e.target.value)} 
                  rows={3}
                  placeholder="Enter description text..." 
                  className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none resize-none"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSavingSettings ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-m3-error/10 text-m3-error rounded-2xl border border-m3-error/25 flex items-center gap-3 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Editor Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-6 rounded-[32px] shadow-sm space-y-6 h-fit">
          <div>
            <h2 className="text-lg font-display font-semibold text-m3-on-surface mb-1">
              {editingId ? "Edit Showcase Logo" : "Add Showcase Logo"}
            </h2>
            <p className="text-xs text-m3-on-surface/50">
              {editingId ? "Modify showcase logo properties." : "Upload a logo and specify its placement in the orbits."}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Client Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                Client / Company Name
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Mercedes-Benz" 
                className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
              />
            </div>

            {/* Orbit / Ring Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                Target Orbit Circle
              </label>
              <select 
                value={ringIndex} 
                onChange={(e) => setRingIndex(Number(e.target.value))} 
                className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
              >
                <option value={0}>Circle 1 (Innermost - R180)</option>
                <option value={1}>Circle 2 (R340)</option>
                <option value={2}>Circle 3 (R500)</option>
                <option value={3}>Circle 4 (Outermost - R660)</option>
              </select>
            </div>

            {/* Image Source Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75 block">
                Logo Asset
              </label>
              
              {/* File Upload Field */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-m3-outline/20 dark:border-m3-outline/10 rounded-2xl cursor-pointer hover:bg-m3-surface/30 dark:hover:bg-m3-surface/5 transition-all p-4">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-m3-primary mb-2" />
                    <p className="text-xs text-m3-on-surface/70 font-semibold">
                      {selectedFile ? selectedFile.name : "Click to upload image file"}
                    </p>
                    <p className="text-[10px] text-m3-on-surface/40 mt-1">PNG, JPG or SVG</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {/* URL fallback (if no file is uploaded or to show existing) */}
              {editingId && !selectedFile && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-m3-on-surface/45 break-all block">
                    Current path: {logoUrl}
                  </span>
                </div>
              )}
            </div>

            {/* Padding Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                Standard Padding
              </label>
              <select 
                value={padding} 
                onChange={(e) => setPadding(e.target.value)} 
                className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
              >
                <option value="p-1">p-1 (Minimal Margin)</option>
                <option value="p-2">p-2 (Slightly compact)</option>
                <option value="p-3">p-3 (Balanced / Standard)</option>
                <option value="p-4">p-4 (Spacious / Wide)</option>
              </select>
            </div>

            {/* Grid Sort Order */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                Sort Order (Index)
              </label>
              <input 
                type="number" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(Number(e.target.value))} 
                className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-b border-m3-outline/10 dark:border-m3-outline/20">
              <span className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                Show on Frontend
              </span>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${
                  active ? "bg-m3-primary flex justify-end" : "bg-m3-surface-container flex justify-start border border-m3-outline/10"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSaving ? "Saving..." : <><Plus className="w-4 h-4" /> {editingId ? "Save Logo" : "Add Logo"}</>}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-m3-surface-container text-m3-on-surface hover:bg-m3-surface-container-high text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-full transition-all border border-m3-outline/10 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Dynamic Showcase Viewer grouped by Orbits */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-12 rounded-[32px] flex flex-col items-center justify-center text-m3-on-surface/50 text-sm">
              <span className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mb-4" />
              <span>Loading showcase logos...</span>
            </div>
          ) : (
            [0, 1, 2, 3].map((ringIdx) => {
              const ringLogos = logos.filter(l => l.ringIndex === ringIdx);
              return (
                <div 
                  key={`ring-group-${ringIdx}`}
                  className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-6 rounded-[32px] shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-m3-outline/10 dark:border-m3-outline/20">
                    <div>
                      <h3 className="font-display font-semibold text-m3-on-surface text-base">
                        {getRingName(ringIdx)}
                      </h3>
                      <p className="text-xs text-m3-on-surface/40">
                        {ringLogos.length} logos in this circle.
                      </p>
                    </div>
                  </div>

                  {ringLogos.length === 0 ? (
                    <div className="py-8 text-center text-xs text-m3-on-surface/30">
                      No logos assigned to this circle. Add logos to see them here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {ringLogos.map((logo, idx) => (
                        <div 
                          key={logo.id} 
                          className={`relative border rounded-2xl p-3 flex flex-col items-center justify-between gap-3 text-center transition-all bg-[#FAF8FF] dark:bg-[#151318] group ${
                            logo.active ? "border-m3-outline/10 dark:border-m3-outline/20" : "border-dashed border-m3-outline/20 dark:border-m3-outline/10 opacity-50"
                          }`}
                        >
                          {/* Top Status & Edit Actions */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                            <button
                              onClick={() => handleEdit(logo)}
                              className="p-1.5 bg-white dark:bg-[#25232a] border border-m3-outline/10 rounded-full hover:bg-m3-primary/10 hover:text-m3-primary text-m3-on-surface/70 transition-colors cursor-pointer shadow-sm"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(logo.id)}
                              className="p-1.5 bg-white dark:bg-[#25232a] border border-m3-outline/10 rounded-full hover:bg-m3-error/10 hover:text-m3-error text-m3-on-surface/70 transition-colors cursor-pointer shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Image Box Container with Grid Background for transparency */}
                          <div 
                            className="w-full aspect-video bg-white dark:bg-[#1E1C24] border border-m3-outline/5 dark:border-m3-outline/10 rounded-xl flex items-center justify-center p-2 shadow-inner overflow-hidden select-none"
                            style={{
                              backgroundImage: "radial-gradient(var(--m3-outline-opacity, rgba(0,0,0,0.03)) 15%, transparent 15%)",
                              backgroundSize: "8px 8px"
                            }}
                          >
                            <img 
                              src={logo.logoUrl} 
                              alt={logo.name} 
                              className={`max-w-full max-h-full object-contain ${logo.padding}`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://placehold.co/150x150?text=No+Image";
                              }}
                            />
                          </div>

                          {/* Info Text */}
                          <div className="w-full">
                            <h4 className="text-xs font-bold text-m3-on-surface tracking-tight truncate px-1">
                              {logo.name}
                            </h4>
                            <span className="text-[9px] font-mono bg-m3-surface-container dark:bg-m3-surface-container/20 text-m3-on-surface/45 px-2 py-0.5 rounded-full border border-m3-outline/5 inline-block mt-1">
                              Order {logo.sortOrder} ({logo.padding})
                            </span>
                          </div>

                          {/* Sorting Buttons */}
                          <div className="flex items-center gap-1.5 border-t border-m3-outline/5 dark:border-m3-outline/10 pt-2 w-full justify-center">
                            <button
                              onClick={() => handleMoveOrder(logo, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-m3-surface-container hover:text-m3-primary text-m3-on-surface/40 transition-colors disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(logo, "down")}
                              disabled={idx === ringLogos.length - 1}
                              className="p-1 rounded hover:bg-m3-surface-container hover:text-m3-primary text-m3-on-surface/40 transition-colors disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
