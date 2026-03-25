import React from 'react';
import { motion } from 'motion/react';
import { MapPin, TrendingUp, ShieldCheck, Share2, Bookmark } from 'lucide-react';
import { Story, User } from '../types';

interface Props {
  story: Story;
  user?: User | null;
  onClick: () => void;
  onAmplify: (e: React.MouseEvent) => void;
  onToggleBookmark?: (id: string) => void;
}

export const StoryCard: React.FC<Props> = ({ story, user, onClick, onAmplify, onToggleBookmark }) => {
  const isBookmarked = user && story.bookmarkedBy.includes(user.id);
  const isInstitution = user?.role === 'INSTITUTION';
  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-50 border-green-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'rejected': return 'bg-rose-500';
      case 'handled': return 'bg-blue-500';
      case 'in-progress': return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-white rounded-3xl p-6 cursor-pointer border border-transparent hover:border-brand-accent/20 transition-all card-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            {story.category}
          </span>
          <span className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 ${getVerificationColor(story.verificationLevel)}`}>
            <ShieldCheck className="w-3 h-3" />
            {story.verificationLevel}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(story.status)}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40">{story.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isInstitution && onToggleBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(story.id); }}
              className={`p-2 rounded-xl border transition-all ${isBookmarked ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-primary/40 border-brand-primary/5 hover:bg-brand-bg'}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
          <div className="flex items-center gap-1.5 text-brand-accent font-display font-bold">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xl">{story.impactScore}</span>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-accent transition-colors leading-tight">
        {story.title}
      </h3>

      <p className="text-brand-primary/70 line-clamp-2 mb-6 text-sm leading-relaxed">
        {story.summary}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-bg">
        <div className="flex items-center gap-4 text-brand-primary/50 text-xs font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {story.location}
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            {story.amplifiedCount} Boosts
          </div>
        </div>
        
        <div className="flex gap-1">
          {story.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] text-brand-primary/40 font-mono">
              #{tag.toLowerCase().replace(/\s+/g, '')}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
