import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, CheckCircle2, Clock, Zap, Trash2, AlertCircle, Plus, Send, Sparkles, MapPin, Tag, X } from 'lucide-react';
import { Story, User, StorySubmission, Category } from '../types';
import { StoryCard } from './StoryCard';

const CATEGORIES: Category[] = ['Emergency', 'Infrastructure', 'Community Issue', 'Health', 'Education', 'Environment', 'Innovation', 'Other'];

interface Props {
  user: User;
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onDeleteStory: (id: string) => void;
  onSubmitStory: (submission: StorySubmission) => Promise<void>;
}

export default function ReporterDashboard({ user, stories, onStoryClick, onDeleteStory, onSubmitStory }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<StorySubmission>({
    title: '',
    description: '',
    location: '',
    category: 'Emergency',
    media: []
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

  const myStories = useMemo(() => {
    return stories.filter(s => s.authorId === user.id);
  }, [stories, user.id]);

  const stats = useMemo(() => {
    return {
      total: myStories.length,
      verified: myStories.filter(s => s.status === 'verified' || s.status === 'handled').length,
      totalBoosts: myStories.reduce((acc, s) => acc + s.amplifiedCount, 0),
      pending: myStories.filter(s => s.status === 'pending').length
    };
  }, [myStories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitStory(formData);
      setFormData({
        title: '',
        description: '',
        location: '',
        category: 'Emergency',
        media: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Welcome & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reporter Dashboard</h1>
          <p className="text-brand-primary/40 font-medium">Welcome back, {user.fullName}. Share what's happening on the ground.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white rounded-2xl border border-brand-primary/5 card-shadow">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-1">Impact Score</p>
            <p className="text-xl font-bold text-brand-accent">{stats.totalBoosts}</p>
          </div>
          <div className="px-6 py-3 bg-white rounded-2xl border border-brand-primary/5 card-shadow">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-1">Verified Reports</p>
            <p className="text-xl font-bold text-green-600">{stats.verified}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: Submission Form */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-brand-primary/5">
            <div className="h-48 w-full relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/reporting/800/400" 
                alt="Community Reporting" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            <div className="p-8 sm:p-12 pt-4">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Submit a New Signal</h2>
                  <p className="text-sm text-brand-primary/40">Provide clear details for faster verification.</p>
                </div>
              </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Story Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Broken water main on Main St"
                  className="w-full px-6 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/20" />
                    <input
                      required
                      type="text"
                      placeholder="City, Neighborhood"
                      className="w-full pl-12 pr-6 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/20" />
                    <select
                      className="w-full pl-12 pr-6 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium appearance-none"
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Description</label>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    AI Assisted
                  </div>
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe what's happening. Be as detailed as possible..."
                  className="w-full px-6 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Proof of Story</label>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-accent/10 rounded-full">
                    <AlertCircle className="w-3 h-3 text-brand-accent" />
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Required for Verification</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Proof</span>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/10 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

        {/* Right: My Reports */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Recent Reports</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-primary/40">
              <Clock className="w-4 h-4" />
              Latest First
            </div>
          </div>

          <div className="space-y-6">
            {myStories.length > 0 ? (
              myStories.slice(0, 5).map(story => (
                <div key={story.id} className="relative group">
                  <div 
                    onClick={() => onStoryClick(story)}
                    className="bg-white p-6 rounded-3xl border border-brand-primary/5 card-shadow hover:border-brand-accent/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        story.status === 'verified' ? 'bg-green-100 text-green-600' :
                        story.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {story.status}
                      </span>
                      <span className="text-[10px] font-bold text-brand-primary/20 uppercase tracking-widest">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-brand-accent transition-colors">{story.title}</h3>
                    <p className="text-sm text-brand-primary/40 line-clamp-2 mb-4">{story.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-brand-primary/5">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-primary/40">
                        <MapPin className="w-3 h-3" />
                        {story.location}
                      </div>
                      {story.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-brand-primary/10">
                <FileText className="w-8 h-8 text-brand-primary/10 mx-auto mb-4" />
                <p className="text-sm font-bold text-brand-primary/20">No reports yet</p>
              </div>
            )}
          </div>

          <div className="bg-brand-primary text-white rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-brand-accent" />
              Reporting Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-white/60">
              <li className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                Provide exact locations for faster response.
              </li>
              <li className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                Upload clear photos to increase verification score.
              </li>
              <li className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                AI will automatically summarize your report.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
