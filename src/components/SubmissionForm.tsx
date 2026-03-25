import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MapPin, Tag, AlertCircle } from 'lucide-react';
import { Category, StorySubmission } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: StorySubmission) => Promise<void>;
}

const CATEGORIES: Category[] = ['Emergency', 'Infrastructure', 'Community Issue', 'Health', 'Education', 'Environment', 'Innovation', 'Other'];

export default function SubmissionForm({ isOpen, onClose, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StorySubmission>({
    title: '',
    description: '',
    location: '',
    category: 'Other',
    media: [],
  });

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
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-brand-primary">Submit a Story</h2>
                  <p className="text-brand-primary/60 mt-1">Amplify a voice that needs to be heard.</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-brand-bg rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
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
