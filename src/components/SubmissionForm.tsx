import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MapPin, Tag, AlertCircle, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { Category, StorySubmission } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: StorySubmission) => Promise<void>;
}

const CATEGORIES: Category[] = ['Emergency', 'Infrastructure', 'Community Issue', 'Health', 'Education', 'Environment', 'Innovation', 'Other'];

export default function SubmissionForm({ isOpen, onClose, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<StorySubmission>({
    title: '',
    description: '',
    location: '',
    category: 'Other',
    media: [],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          media: [...prev.media, base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ title: '', description: '', location: '', category: 'Other', media: [] });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="h-48 w-full relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/reporting/800/400" 
                alt="Community Reporting" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 pt-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-brand-primary">Submit a Story</h2>
                  <p className="text-brand-primary/60 mt-1">Amplify a voice that needs to be heard.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-primary/50">Story Title</label>
                  <input
                    required
                    type="text"
                    placeholder="What's happening in your community?"
                    className="w-full px-4 py-3 bg-brand-bg border-none rounded-xl focus:ring-2 focus:ring-brand-accent transition-all outline-none text-lg font-medium"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary/50">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                      <input
                        required
                        type="text"
                        placeholder="City, Region"
                        className="w-full pl-11 pr-4 py-3 bg-brand-bg border-none rounded-xl focus:ring-2 focus:ring-brand-accent transition-all outline-none"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary/50">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                      <select
                        className="w-full pl-11 pr-4 py-3 bg-brand-bg border-none rounded-xl focus:ring-2 focus:ring-brand-accent transition-all outline-none appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-primary/50">Detailed Description</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide as much detail as possible. AI will analyze this for impact and verification."
                    className="w-full px-4 py-3 bg-brand-bg border-none rounded-xl focus:ring-2 focus:ring-brand-accent transition-all outline-none resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-primary/50">Proof of Story</label>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-accent/10 rounded-full">
                      <AlertCircle className="w-3 h-3 text-brand-accent" />
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Required for Verification</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <AnimatePresence mode="popLayout">
                      {formData.media.map((src, index) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={index} 
                          className="relative aspect-square rounded-2xl overflow-hidden border border-brand-primary/5 group bg-brand-bg shadow-sm"
                        >
                          {src.startsWith('data:video') ? (
                            <video src={src} className="w-full h-full object-cover" />
                          ) : (
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="p-2 bg-white/20 backdrop-blur-md hover:bg-rose-500 rounded-full transition-all text-white transform scale-75 group-hover:scale-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    <motion.button
                      layout
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-brand-primary/10 flex flex-col items-center justify-center gap-2 text-brand-primary/30 hover:bg-brand-bg hover:border-brand-accent/30 hover:text-brand-accent transition-all group relative overflow-hidden"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add Media</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent transform translate-y-full group-hover:translate-y-0 transition-transform" />
                    </motion.button>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-4 bg-brand-accent text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        StorySasa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
