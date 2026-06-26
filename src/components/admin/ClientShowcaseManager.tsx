import React, { useState, useEffect } from "react";
import { 
  getAllClientLogos, 
  saveClientLogo, 
  deleteClientLogo, 
  uploadImage, 
  ClientLogoItem,
  getClientShowcaseSettings,
  saveClientShowcaseSettings,
  // Showcase 2 imports
  getAllClientShowcase2Logos,
  saveClientShowcase2Logo,
  deleteClientShowcase2Logo,
  getClientShowcase2Settings,
  saveClientShowcase2Settings,
  ClientShowcase2LogoItem
} from "../../lib/firebase/cms";
import { Plus, Trash2, Edit2, Upload, ArrowUp, ArrowDown, ShieldAlert, Settings, ChevronDown, ChevronUp } from "lucide-react";

type SubTab = "showcase1" | "showcase2";

export default function ClientShowcaseManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("showcase1");

  // ==========================================
  // STATE FOR SHOWCASE 1 (ORBIT)
  // ==========================================
  const [logos1, setLogos1] = useState<ClientLogoItem[]>([]);
  const [isLoading1, setIsLoading1] = useState(true);
  const [isSaving1, setIsSaving1] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [isSettingsExpanded1, setIsSettingsExpanded1] = useState(false);
  const [settingsTitle1, setSettingsTitle1] = useState("");
  const [settingsDesc1, setSettingsDesc1] = useState("");
  const [isSavingSettings1, setIsSavingSettings1] = useState(false);

  // Showcase 1 Form State
  const [editingId1, setEditingId1] = useState<string | null>(null);
  const [name1, setName1] = useState("");
  const [logoUrl1, setLogoUrl1] = useState("");
  const [padding1, setPadding1] = useState("p-3");
  const [ringIndex1, setRingIndex1] = useState(1);
  const [sortOrder1, setSortOrder1] = useState(0);
  const [active1, setActive1] = useState(true);
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);

  // ==========================================
  // STATE FOR SHOWCASE 2 (GRID)
  // ==========================================
  const [logos2, setLogos2] = useState<ClientShowcase2LogoItem[]>([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [isSaving2, setIsSaving2] = useState(false);
  const [error2, setError2] = useState<string | null>(null);
  const [isSettingsExpanded2, setIsSettingsExpanded2] = useState(false);
  const [settingsTitle2, setSettingsTitle2] = useState("");
  const [isSavingSettings2, setIsSavingSettings2] = useState(false);

  // Showcase 2 Form State
  const [editingId2, setEditingId2] = useState<string | null>(null);
  const [name2, setName2] = useState("");
  const [logoUrl2, setLogoUrl2] = useState("");
  const [padding2, setPadding2] = useState("p-3");
  const [rowIndex2, setRowIndex2] = useState(0); // Row 1 (Index 0) by default
  const [sortOrder2, setSortOrder2] = useState(0);
  const [active2, setActive2] = useState(true);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);

  // ==========================================
  // LIFECYCLE
  // ==========================================
  useEffect(() => {
    fetchData1();
    fetchData2();
  }, []);

  // ==========================================
  // SHOWCASE 1 FUNCTIONS
  // ==========================================
  const fetchData1 = async () => {
    setIsLoading1(true);
    try {
      const [logosData, settingsData] = await Promise.all([
        getAllClientLogos(),
        getClientShowcaseSettings()
      ]);
      const sorted = [...logosData].sort((a, b) => {
        if (a.ringIndex !== b.ringIndex) return a.ringIndex - b.ringIndex;
        return a.sortOrder - b.sortOrder;
      });
      setLogos1(sorted);
      setSettingsTitle1(settingsData.title);
      setSettingsDesc1(settingsData.description);
    } catch (err: any) {
      setError1(err.message || "Failed to load Showcase 1 details.");
    } finally {
      setIsLoading1(false);
    }
  };

  const handleSaveSettings1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsTitle1.trim()) {
      setError1("Please enter a section heading.");
      return;
    }
    setIsSavingSettings1(true);
    setError1(null);
    try {
      await saveClientShowcaseSettings({
        title: settingsTitle1.trim(),
        description: settingsDesc1.trim()
      });
      alert("Showcase 1 settings saved successfully!");
    } catch (err: any) {
      setError1(err.message || "Failed to save Showcase 1 settings.");
    } finally {
      setIsSavingSettings1(false);
    }
  };

  const handleFileChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile1(e.target.files[0]);
      setLogoUrl1("");
    }
  };

  const handleSave1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name1.trim()) {
      setError1("Please enter a client name.");
      return;
    }
    if (!selectedFile1 && !logoUrl1.trim() && !editingId1) {
      setError1("Please select a file to upload or enter a logo URL.");
      return;
    }
    setIsSaving1(true);
    setError1(null);
    try {
      let finalUrl = logoUrl1;
      if (selectedFile1) {
        finalUrl = await uploadImage(selectedFile1, "logos");
      }
      await saveClientLogo({
        name: name1.trim(),
        logoUrl: finalUrl,
        padding: padding1,
        ringIndex: ringIndex1,
        sortOrder: Number(sortOrder1),
        active: active1
      }, editingId1 || undefined);

      setName1("");
      setLogoUrl1("");
      setPadding1("p-3");
      setRingIndex1(1);
      setSortOrder1(0);
      setActive1(true);
      setSelectedFile1(null);
      setEditingId1(null);
      await fetchData1();
    } catch (err: any) {
      setError1(err.message || "Failed to save logo.");
    } finally {
      setIsSaving1(false);
    }
  };

  const handleEdit1 = (logo: ClientLogoItem) => {
    setEditingId1(logo.id);
    setName1(logo.name);
    setLogoUrl1(logo.logoUrl);
    setPadding1(logo.padding);
    setRingIndex1(logo.ringIndex);
    setSortOrder1(logo.sortOrder);
    setActive1(logo.active);
    setSelectedFile1(null);
    setError1(null);
  };

  const handleDelete1 = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this logo from Showcase 1?")) return;
    setError1(null);
    try {
      await deleteClientLogo(id);
      await fetchData1();
    } catch (err: any) {
      setError1(err.message || "Failed to delete logo.");
    }
  };

  const handleMoveOrder1 = async (logo: ClientLogoItem, direction: "up" | "down") => {
    const ringLogos = logos1.filter(l => l.ringIndex === logo.ringIndex);
    const index = ringLogos.findIndex(l => l.id === logo.id);
    
    if (direction === "up" && index > 0) {
      const prev = ringLogos[index - 1];
      const tempOrder = prev.sortOrder;
      setIsSaving1(true);
      try {
        await saveClientLogo({ ...prev, sortOrder: logo.sortOrder }, prev.id);
        await saveClientLogo({ ...logo, sortOrder: tempOrder }, logo.id);
        await fetchData1();
      } catch (err: any) {
        setError1("Failed to change order.");
      } finally {
        setIsSaving1(false);
      }
    } else if (direction === "down" && index < ringLogos.length - 1) {
      const next = ringLogos[index + 1];
      const tempOrder = next.sortOrder;
      setIsSaving1(true);
      try {
        await saveClientLogo({ ...next, sortOrder: logo.sortOrder }, next.id);
        await saveClientLogo({ ...logo, sortOrder: tempOrder }, logo.id);
        await fetchData1();
      } catch (err: any) {
        setError1("Failed to change order.");
      } finally {
        setIsSaving1(false);
      }
    }
  };

  const cancelEdit1 = () => {
    setEditingId1(null);
    setName1("");
    setLogoUrl1("");
    setPadding1("p-3");
    setRingIndex1(1);
    setSortOrder1(0);
    setActive1(true);
    setSelectedFile1(null);
    setError1(null);
  };

  const getRingName = (index: number) => {
    switch (index) {
      case 0: return "Circle 1 (Innermost - R180)";
      case 1: return "Circle 2 (R330)";
      case 2: return "Circle 3 (R480)";
      case 3: return "Circle 4 (Outermost - R630)";
      default: return `Circle ${index + 1}`;
    }
  };

  // ==========================================
  // SHOWCASE 2 FUNCTIONS
  // ==========================================
  const fetchData2 = async () => {
    setIsLoading2(true);
    try {
      const [logosData, settingsData] = await Promise.all([
        getAllClientShowcase2Logos(),
        getClientShowcase2Settings()
      ]);
      const sorted = [...logosData].sort((a, b) => {
        if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
        return a.sortOrder - b.sortOrder;
      });
      setLogos2(sorted);
      setSettingsTitle2(settingsData.title);
    } catch (err: any) {
      setError2(err.message || "Failed to load Showcase 2 details.");
    } finally {
      setIsLoading2(false);
    }
  };

  const handleSaveSettings2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsTitle2.trim()) {
      setError2("Please enter a section heading.");
      return;
    }
    setIsSavingSettings2(true);
    setError2(null);
    try {
      await saveClientShowcase2Settings({
        title: settingsTitle2.trim()
      });
      alert("Showcase 2 settings saved successfully!");
    } catch (err: any) {
      setError2(err.message || "Failed to save Showcase 2 settings.");
    } finally {
      setIsSavingSettings2(false);
    }
  };

  const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile2(e.target.files[0]);
      setLogoUrl2("");
    }
  };

  const handleSave2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name2.trim()) {
      setError2("Please enter a client name.");
      return;
    }
    if (!selectedFile2 && !logoUrl2.trim() && !editingId2) {
      setError2("Please select a file to upload or enter a logo URL.");
      return;
    }
    setIsSaving2(true);
    setError2(null);
    try {
      let finalUrl = logoUrl2;
      if (selectedFile2) {
        finalUrl = await uploadImage(selectedFile2, "logos2");
      }
      await saveClientShowcase2Logo({
        name: name2.trim(),
        logoUrl: finalUrl,
        padding: padding2,
        rowIndex: rowIndex2,
        sortOrder: Number(sortOrder2),
        active: active2
      }, editingId2 || undefined);

      setName2("");
      setLogoUrl2("");
      setPadding2("p-3");
      setRowIndex2(0);
      setSortOrder2(0);
      setActive2(true);
      setSelectedFile2(null);
      setEditingId2(null);
      await fetchData2();
    } catch (err: any) {
      setError2(err.message || "Failed to save logo.");
    } finally {
      setIsSaving2(false);
    }
  };

  const handleEdit2 = (logo: ClientShowcase2LogoItem) => {
    setEditingId2(logo.id);
    setName2(logo.name);
    setLogoUrl2(logo.logoUrl);
    setPadding2(logo.padding);
    setRowIndex2(logo.rowIndex);
    setSortOrder2(logo.sortOrder);
    setActive2(logo.active);
    setSelectedFile2(null);
    setError2(null);
  };

  const handleDelete2 = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this logo from Showcase 2?")) return;
    setError2(null);
    try {
      await deleteClientShowcase2Logo(id);
      await fetchData2();
    } catch (err: any) {
      setError2(err.message || "Failed to delete logo.");
    }
  };

  const handleMoveOrder2 = async (logo: ClientShowcase2LogoItem, direction: "up" | "down") => {
    const rowLogos = logos2.filter(l => l.rowIndex === logo.rowIndex);
    const index = rowLogos.findIndex(l => l.id === logo.id);
    
    if (direction === "up" && index > 0) {
      const prev = rowLogos[index - 1];
      const tempOrder = prev.sortOrder;
      setIsSaving2(true);
      try {
        await saveClientShowcase2Logo({ ...prev, sortOrder: logo.sortOrder }, prev.id);
        await saveClientShowcase2Logo({ ...logo, sortOrder: tempOrder }, logo.id);
        await fetchData2();
      } catch (err: any) {
        setError2("Failed to change order.");
      } finally {
        setIsSaving2(false);
      }
    } else if (direction === "down" && index < rowLogos.length - 1) {
      const next = rowLogos[index + 1];
      const tempOrder = next.sortOrder;
      setIsSaving2(true);
      try {
        await saveClientShowcase2Logo({ ...next, sortOrder: logo.sortOrder }, next.id);
        await saveClientShowcase2Logo({ ...logo, sortOrder: tempOrder }, logo.id);
        await fetchData2();
      } catch (err: any) {
        setError2("Failed to change order.");
      } finally {
        setIsSaving2(false);
      }
    }
  };

  const cancelEdit2 = () => {
    setEditingId2(null);
    setName2("");
    setLogoUrl2("");
    setPadding2("p-3");
    setRowIndex2(0);
    setSortOrder2(0);
    setActive2(true);
    setSelectedFile2(null);
    setError2(null);
  };

  const getRowName = (index: number) => {
    return `Row ${index + 1}`;
  };

  // ==========================================
  // RENDERING
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex border-b border-m3-outline/10 dark:border-m3-outline/20 pb-1 gap-6">
        <button
          type="button"
          onClick={() => setActiveSubTab("showcase1")}
          className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
            activeSubTab === "showcase1" 
              ? "border-m3-primary text-m3-primary" 
              : "border-transparent text-m3-on-surface/50 hover:text-m3-on-surface/80"
          }`}
        >
          Client Showcase 1 (Orbit)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("showcase2")}
          className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
            activeSubTab === "showcase2" 
              ? "border-m3-primary text-m3-primary" 
              : "border-transparent text-m3-on-surface/50 hover:text-m3-on-surface/80"
          }`}
        >
          Client Showcase 2 (Grid)
        </button>
      </div>

      {activeSubTab === "showcase1" ? (
        // ==========================================
        // SHOWCASE 1 PANEL
        // ==========================================
        <div className="space-y-8 animate-fadeIn">
          {/* Header Settings Accordion */}
          <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 rounded-[32px] overflow-hidden shadow-sm transition-all duration-300">
            <button
              type="button"
              onClick={() => setIsSettingsExpanded1(!isSettingsExpanded1)}
              className="w-full px-8 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-m3-surface-container/20 dark:hover:bg-m3-surface-container/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-m3-primary/10 text-m3-primary rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-m3-on-surface text-base">
                    Showcase 1 Header Settings (Title & Description)
                  </h3>
                  <p className="text-xs text-m3-on-surface/50 mt-0.5">
                    Edit the section title and description text displayed on the homepage.
                  </p>
                </div>
              </div>
              <div className="text-m3-on-surface/50">
                {isSettingsExpanded1 ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>

            {isSettingsExpanded1 && (
              <div className="px-8 pb-6 pt-2 border-t border-m3-outline/10 dark:border-m3-outline/20 bg-m3-surface/10 dark:bg-m3-surface/5">
                <form onSubmit={handleSaveSettings1} className="space-y-5 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                      Section Heading
                    </label>
                    <input 
                      type="text" 
                      value={settingsTitle1} 
                      onChange={(e) => setSettingsTitle1(e.target.value)} 
                      placeholder="e.g. Organisation I Worked With:" 
                      className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                      Section Description
                    </label>
                    <textarea 
                      value={settingsDesc1} 
                      onChange={(e) => setSettingsDesc1(e.target.value)} 
                      rows={3}
                      placeholder="Enter description text..." 
                      className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSettings1}
                    className="bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSavingSettings1 ? "Saving..." : "Save Settings"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {error1 && (
            <div className="p-4 bg-m3-error/10 text-m3-error rounded-2xl border border-m3-error/25 flex items-center gap-3 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error1}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo Editor Form */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-6 rounded-[32px] shadow-sm space-y-6 h-fit">
              <div>
                <h2 className="text-lg font-display font-semibold text-m3-on-surface mb-1">
                  {editingId1 ? "Edit Orbit Logo" : "Add Orbit Logo"}
                </h2>
                <p className="text-xs text-m3-on-surface/50">
                  {editingId1 ? "Modify showcase logo properties." : "Upload a logo and specify its placement in the orbits."}
                </p>
              </div>

              <form onSubmit={handleSave1} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Client / Company Name
                  </label>
                  <input 
                    type="text" 
                    value={name1} 
                    onChange={(e) => setName1(e.target.value)} 
                    placeholder="e.g. Mercedes-Benz" 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Target Orbit Circle
                  </label>
                  <select 
                    value={ringIndex1} 
                    onChange={(e) => setRingIndex1(Number(e.target.value))} 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  >
                    <option value={0}>Circle 1 (Innermost - R180)</option>
                    <option value={1}>Circle 2 (R330)</option>
                    <option value={2}>Circle 3 (R480)</option>
                    <option value={3}>Circle 4 (Outermost - R630)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75 block">
                    Logo Asset
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-m3-outline/20 dark:border-m3-outline/10 rounded-2xl cursor-pointer hover:bg-m3-surface/30 dark:hover:bg-m3-surface/5 transition-all p-4">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-m3-primary mb-2" />
                        <p className="text-xs text-m3-on-surface/70 font-semibold">
                          {selectedFile1 ? selectedFile1.name : "Click to upload image file"}
                        </p>
                        <p className="text-[10px] text-m3-on-surface/40 mt-1">PNG, JPG or SVG</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange1} />
                    </label>
                  </div>
                  {editingId1 && !selectedFile1 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-m3-on-surface/45 break-all block">
                        Current path: {logoUrl1}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Standard Padding
                  </label>
                  <select 
                    value={padding1} 
                    onChange={(e) => setPadding1(e.target.value)} 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  >
                    <option value="p-1">p-1 (Minimal Margin)</option>
                    <option value="p-2">p-2 (Slightly compact)</option>
                    <option value="p-3">p-3 (Balanced / Standard)</option>
                    <option value="p-4">p-4 (Spacious / Wide)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Sort Order (Index)
                  </label>
                  <input 
                    type="number" 
                    value={sortOrder1} 
                    onChange={(e) => setSortOrder1(Number(e.target.value))} 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-m3-outline/10 dark:border-m3-outline/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Show on Frontend
                  </span>
                  <button
                    type="button"
                    onClick={() => setActive1(!active1)}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      active1 ? "bg-m3-primary flex justify-end" : "bg-m3-surface-container flex justify-start border border-m3-outline/10"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving1}
                    className="flex-1 bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSaving1 ? "Saving..." : <><Plus className="w-4 h-4" /> {editingId1 ? "Save Logo" : "Add Logo"}</>}
                  </button>

                  {editingId1 && (
                    <button
                      type="button"
                      onClick={cancelEdit1}
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
              {isLoading1 ? (
                <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-12 rounded-[32px] flex flex-col items-center justify-center text-m3-on-surface/50 text-sm">
                  <span className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mb-4" />
                  <span>Loading showcase logos...</span>
                </div>
              ) : (
                [0, 1, 2, 3].map((ringIdx) => {
                  const ringLogos = logos1.filter(l => l.ringIndex === ringIdx);
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
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                                <button
                                  onClick={() => handleEdit1(logo)}
                                  className="p-1.5 bg-white dark:bg-[#25232a] border border-m3-outline/10 rounded-full hover:bg-m3-primary/10 hover:text-m3-primary text-m3-on-surface/70 transition-colors cursor-pointer shadow-sm"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete1(logo.id)}
                                  className="p-1.5 bg-white dark:bg-[#25232a] border border-m3-outline/10 rounded-full hover:bg-m3-error/10 hover:text-m3-error text-m3-on-surface/70 transition-colors cursor-pointer shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

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

                              <div className="w-full">
                                <h4 className="text-xs font-bold text-m3-on-surface tracking-tight truncate px-1">
                                  {logo.name}
                                </h4>
                                <span className="text-[9px] font-mono bg-m3-surface-container dark:bg-m3-surface-container/20 text-m3-on-surface/45 px-2 py-0.5 rounded-full border border-m3-outline/5 inline-block mt-1">
                                  Order {logo.sortOrder} ({logo.padding})
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 border-t border-m3-outline/5 dark:border-m3-outline/10 pt-2 w-full justify-center">
                                <button
                                  onClick={() => handleMoveOrder1(logo, "up")}
                                  disabled={idx === 0}
                                  className="p-1 rounded hover:bg-m3-surface-container hover:text-m3-primary text-m3-on-surface/40 transition-colors disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder1(logo, "down")}
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
      ) : (
        // ==========================================
        // SHOWCASE 2 PANEL
        // ==========================================
        <div className="space-y-8 animate-fadeIn">
          {/* Header Settings Accordion */}
          <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 rounded-[32px] overflow-hidden shadow-sm transition-all duration-300">
            <button
              type="button"
              onClick={() => setIsSettingsExpanded2(!isSettingsExpanded2)}
              className="w-full px-8 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-m3-surface-container/20 dark:hover:bg-m3-surface-container/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-m3-primary/10 text-m3-primary rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-m3-on-surface text-base">
                    Showcase 2 Header Settings (Title)
                  </h3>
                  <p className="text-xs text-m3-on-surface/50 mt-0.5">
                    Edit the section heading text displayed in the grid showcase.
                  </p>
                </div>
              </div>
              <div className="text-m3-on-surface/50">
                {isSettingsExpanded2 ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>

            {isSettingsExpanded2 && (
              <div className="px-8 pb-6 pt-2 border-t border-m3-outline/10 dark:border-m3-outline/20 bg-m3-surface/10 dark:bg-m3-surface/5">
                <form onSubmit={handleSaveSettings2} className="space-y-5 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                      Grid Section Heading
                    </label>
                    <input 
                      type="text" 
                      value={settingsTitle2} 
                      onChange={(e) => setSettingsTitle2(e.target.value)} 
                      placeholder="e.g. Trusted by our customers & partners" 
                      className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSettings2}
                    className="bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSavingSettings2 ? "Saving..." : "Save Settings"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {error2 && (
            <div className="p-4 bg-m3-error/10 text-m3-error rounded-2xl border border-m3-error/25 flex items-center gap-3 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error2}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo Editor Form */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-6 rounded-[32px] shadow-sm space-y-6 h-fit">
              <div>
                <h2 className="text-lg font-display font-semibold text-m3-on-surface mb-1">
                  {editingId2 ? "Edit Grid Logo" : "Add Grid Logo"}
                </h2>
                <p className="text-xs text-m3-on-surface/50">
                  {editingId2 ? "Modify grid showcase logo details." : "Upload a logo and assign it to a row in the showcase."}
                </p>
              </div>

              <form onSubmit={handleSave2} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Client / Company Name
                  </label>
                  <input 
                    type="text" 
                    value={name2} 
                    onChange={(e) => setName2(e.target.value)} 
                    placeholder="e.g. Google" 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Target Grid Row
                  </label>
                  <select 
                    value={rowIndex2} 
                    onChange={(e) => setRowIndex2(Number(e.target.value))} 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  >
                    <option value={0}>Row 1 (Top)</option>
                    <option value={1}>Row 2 (Middle)</option>
                    <option value={2}>Row 3 (Lower)</option>
                    <option value={3}>Row 4 (Bottom)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75 block">
                    Logo Asset
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-m3-outline/20 dark:border-m3-outline/10 rounded-2xl cursor-pointer hover:bg-m3-surface/30 dark:hover:bg-m3-surface/5 transition-all p-4">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-m3-primary mb-2" />
                        <p className="text-xs text-m3-on-surface/70 font-semibold">
                          {selectedFile2 ? selectedFile2.name : "Click to upload image file"}
                        </p>
                        <p className="text-[10px] text-m3-on-surface/40 mt-1">PNG, JPG or SVG</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange2} />
                    </label>
                  </div>
                  {editingId2 && !selectedFile2 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-m3-on-surface/45 break-all block">
                        Current path: {logoUrl2}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Standard Padding
                  </label>
                  <select 
                    value={padding2} 
                    onChange={(e) => setPadding2(e.target.value)} 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  >
                    <option value="p-1">p-1 (Minimal Margin)</option>
                    <option value="p-2">p-2 (Slightly compact)</option>
                    <option value="p-3">p-3 (Balanced / Standard)</option>
                    <option value="p-4">p-4 (Spacious / Wide)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Sort Order (Index)
                  </label>
                  <input 
                    type="number" 
                    value={sortOrder2} 
                    onChange={(e) => setSortOrder2(Number(e.target.value))} 
                    className="w-full bg-m3-surface dark:bg-[#25232a] border border-m3-outline/25 dark:border-m3-outline/10 focus:border-m3-primary rounded-xl px-4 py-3 text-sm text-m3-on-surface transition-all outline-none"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-m3-outline/10 dark:border-m3-outline/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/75">
                    Show on Frontend
                  </span>
                  <button
                    type="button"
                    onClick={() => setActive2(!active2)}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      active2 ? "bg-m3-primary flex justify-end" : "bg-m3-surface-container flex justify-start border border-m3-outline/10"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving2}
                    className="flex-1 bg-m3-primary text-white hover:bg-m3-primary/95 text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSaving2 ? "Saving..." : <><Plus className="w-4 h-4" /> {editingId2 ? "Save Logo" : "Add Logo"}</>}
                  </button>

                  {editingId2 && (
                    <button
                      type="button"
                      onClick={cancelEdit2}
                      className="bg-m3-surface-container text-m3-on-surface hover:bg-m3-surface-container-high text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-full transition-all border border-m3-outline/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Dynamic Grid Showcase List */}
            <div className="lg:col-span-2 space-y-8">
              {isLoading2 ? (
                <div className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-12 rounded-[32px] flex flex-col items-center justify-center text-m3-on-surface/50 text-sm">
                  <span className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mb-4" />
                  <span>Loading showcase 2 logos...</span>
                </div>
              ) : (
                [0, 1, 2, 3].map((rowIdx) => {
                  const rowLogos = logos2.filter(l => l.rowIndex === rowIdx);
                  return (
                    <div 
                      key={`row-group-${rowIdx}`}
                      className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-6 rounded-[32px] shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-m3-outline/10 dark:border-m3-outline/20">
                        <div>
                          <h3 className="font-display font-semibold text-m3-on-surface text-base">
                            {getRowName(rowIdx)}
                          </h3>
                          <p className="text-xs text-m3-on-surface/40">
                            {rowLogos.length} logos in this row.
                          </p>
                        </div>
                      </div>

                      {rowLogos.length === 0 ? (
                        <div className="py-8 text-center text-xs text-m3-on-surface/30">
                          No logos assigned to this row. Add logos to see them here.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {rowLogos.map((logo, idx) => (
                            <div 
                              key={logo.id} 
                              className={`relative border rounded-2xl p-3 flex flex-col items-center justify-between gap-3 text-center transition-all bg-[#FAF8FF] dark:bg-[#151318] group ${
                                logo.active ? "border-m3-outline/10 dark:border-m3-outline/20" : "border-dashed border-m3-outline/20 dark:border-m3-outline/10 opacity-50"
                              }`}
                            >
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                                <button
                                  onClick={() => handleEdit2(logo)}
                                  className="p-1.5 bg-white dark:bg-[#25232a] border border-m3-outline/10 rounded-full hover:bg-m3-primary/10 hover:text-m3-primary text-m3-on-surface/70 transition-colors cursor-pointer shadow-sm"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete2(logo.id)}
                                  className="p-1.5 bg-white dark:bg-[#25232a] border border-m3-outline/10 rounded-full hover:bg-m3-error/10 hover:text-m3-error text-m3-on-surface/70 transition-colors cursor-pointer shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

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

                              <div className="w-full">
                                <h4 className="text-xs font-bold text-m3-on-surface tracking-tight truncate px-1">
                                  {logo.name}
                                </h4>
                                <span className="text-[9px] font-mono bg-m3-surface-container dark:bg-m3-surface-container/20 text-m3-on-surface/45 px-2 py-0.5 rounded-full border border-m3-outline/5 inline-block mt-1">
                                  Order {logo.sortOrder} ({logo.padding})
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 border-t border-m3-outline/5 dark:border-m3-outline/10 pt-2 w-full justify-center">
                                <button
                                  onClick={() => handleMoveOrder2(logo, "up")}
                                  disabled={idx === 0}
                                  className="p-1 rounded hover:bg-m3-surface-container hover:text-m3-primary text-m3-on-surface/40 transition-colors disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder2(logo, "down")}
                                  disabled={idx === rowLogos.length - 1}
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
      )}
    </div>
  );
}
