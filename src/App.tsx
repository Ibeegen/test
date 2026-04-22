/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Copy, 
  Download, 
  Check, 
  Plus, 
  Minus, 
  Layout, 
  Hash, 
  Type as TypeIcon,
  Video,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';
import { animate, motion, AnimatePresence } from 'motion/react';
import { generateContent, GenerationResult, Scene } from './services/geminiService';

const CATEGORIES = [
  "Sức khỏe (Health)",
  "Làm đẹp (Beauty)",
  "Ẩm thực (Culinary)",
  "Mẹo vặt (Life Hacks)",
  "Giáo dục (Education)",
  "Giải trí (Entertainment)"
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [sceneCount, setSceneCount] = useState(3);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!description) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateContent(image, description, sceneCount, category);
      setResult(data);
    } catch (err) {
      alert("Đã có lỗi xảy ra khi tạo nội dung. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number | 'bulk') => {
    navigator.clipboard.writeText(text);
    if (index === 'bulk') return;
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadContent = () => {
    if (!result) return;
    const content = result.scenes.map(s => `${s.veoPrompt}\n${s.script}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_${category.split(' ')[0].toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F7] text-[#1a1a1a] font-sans selection:bg-orange-100 border-8 border-[#1a1a1a]">
      {/* Editorial Header */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-[#1a1a1a]">
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-serif italic font-bold tracking-tighter">VeoGen 3.0</h1>
          <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">3D Character AI Factory</span>
        </div>
        <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-semibold flex-shrink-0">
          <span className="cursor-pointer hover:opacity-50 transition-opacity">Dashboard</span>
          <span className="cursor-pointer hover:opacity-50 transition-opacity">Library</span>
          <span className="cursor-pointer hover:opacity-50 transition-opacity">Settings</span>
          <span className="px-3 py-1 bg-[#1a1a1a] text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors">Upgrade</span>
        </nav>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Section: Configuration */}
        <section className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-[#1a1a1a] p-10 flex flex-col gap-6 bg-[#F9F9F7] overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Configuration</h2>
            <p className="font-serif text-lg italic tracking-tight">Transform products into characters.</p>
          </div>

          <div className="space-y-6">
            {/* Image Upload */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#1a1a1a] h-40 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group"
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <X size={24} className="text-white bg-[#1a1a1a]/50 p-1 rounded-full" onClick={(e) => { e.stopPropagation(); setImage(null); }} />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-[#1a1a1a]" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Upload Product Image</span>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-[#1a1a1a]">Product Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-[#1a1a1a] bg-white p-4 text-sm h-32 focus:ring-1 ring-[#1a1a1a] outline-none transition-all placeholder:text-gray-300 resize-none font-sans"
                placeholder="e.g. Lonely Ly Son Garlic bulb, single clove..."
              />
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black tracking-widest">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-[#1a1a1a] bg-white p-3 text-xs uppercase font-bold outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.split(' ')[0]}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black tracking-widest">Scenes</label>
                <div className="flex border border-[#1a1a1a] bg-white overflow-hidden">
                  <button onClick={() => setSceneCount(Math.max(1, sceneCount - 1))} className="p-3 hover:bg-gray-100 transition-colors border-r border-[#1a1a1a]"><Minus size={14}/></button>
                  <span className="flex-1 flex items-center justify-center font-bold text-sm">{sceneCount}</span>
                  <button onClick={() => setSceneCount(Math.min(10, sceneCount + 1))} className="p-3 hover:bg-gray-100 transition-colors border-l border-[#1a1a1a]"><Plus size={14}/></button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !description}
              className={`
                w-full bg-[#1a1a1a] text-white py-5 font-serif italic text-2xl mt-4 hover:bg-[#333] transition-all
                active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed
                flex items-center justify-center gap-3
              `}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={24} />
                  <span className="text-xl">Processing...</span>
                </>
              ) : (
                "Generate Content"
              )}
            </button>
          </div>
        </section>

        {/* Right Section: Results */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-4"
              >
                <div className="w-32 h-32 border-2 border-dashed border-[#1a1a1a] opacity-10 flex items-center justify-center">
                  <Video size={48} className="text-[#1a1a1a]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif italic text-2xl">Awaiting creative brief.</h3>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Input parameters on the left to begin generation.</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 border border-[#1a1a1a] animate-spin flex items-center justify-center">
                    <div className="w-16 h-16 border border-[#1a1a1a] animate-spin-reverse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-serif italic text-3xl">Architecting Character...</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Synthesizing multimodal data points</p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Results Header */}
                <div className="p-10 pb-4 border-b border-[#1a1a1a]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#1a1a1a] text-white p-1 rounded-sm">
                          <Check size={14} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 leading-none">Generation Complete</span>
                      </div>
                      <h2 className="text-5xl font-serif italic tracking-tighter leading-none">{result.hook}</h2>
                      <div className="flex flex-wrap gap-4 font-mono text-[11px] text-[#FF4E00] uppercase font-bold tracking-tight">
                        {result.hashtags.map((tag, i) => (
                          <span key={i} className="hover:opacity-70 cursor-pointer">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={downloadContent}
                      className="border border-[#1a1a1a] px-8 py-3 text-[11px] uppercase font-black tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-all active:scale-95 flex-shrink-0"
                    >
                      Download All Bundle
                    </button>
                  </div>
                </div>

                {/* Scenes List */}
                <div className="flex-1 overflow-y-auto p-10 space-y-16 scrollbar-hide">
                  {result.scenes.map((scene, idx) => (
                    <div key={idx} className="scene-card relative group">
                      <div className="flex justify-between items-start mb-6 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="font-serif italic text-3xl font-bold">Scene 0{idx + 1}</span>
                          <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-300">VEO-3 CHARACTER ENGINE</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => copyToClipboard(`${scene.veoPrompt}\n${scene.script}`, idx)}
                            className="p-3 border border-[#1a1a1a] hover:bg-gray-100 transition-colors"
                          >
                            {copiedIndex === idx ? <Check size={16}/> : <Copy size={16} strokeWidth={1.5} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 bg-[#F9F9F7] p-8 border-l-8 border-[#1a1a1a]">
                        <div className="space-y-4">
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400">Veo 3 Visual Prompt</h4>
                          <p className="text-sm font-mono leading-relaxed text-[#1a1a1a] bg-white p-4 border border-gray-200">
                            {scene.veoPrompt}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400">Screenplay Script</h4>
                          <p className="text-xl italic font-serif text-[#333] leading-snug">
                            &ldquo;{scene.script}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-10 flex items-center justify-between opacity-30 text-[9px] uppercase tracking-widest font-black">
                    <span>End of Generation</span>
                    <span>© 2026 VeoGen Labs</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#1a1a1a] bg-[#1a1a1a] text-white px-10 py-3 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-medium">
        <div className="flex gap-8">
          <span>Processing Pipeline: VEO-3-CHAR-ENGINE</span>
          <span className="hidden md:inline">Latency: 1.2s - 4.2s / scene</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Status: Ready</span>
        </div>
      </footer>
    </div>
  );
}
