import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, TrendingUp, ShieldCheck, Share2, Calendar, Info, User as UserIcon, Bookmark } from 'lucide-react';
import { Story, User } from '../types';

interface Props {
  story: Story | null;
  user: User | null;
  onClose: () => void;
  onAmplify: () => void;
  onUpdateStatus?: (id: string, status: Story['status']) => void;
  onToggleBookmark?: (id: string) => void;
}

export default function StoryDetail({ story, user, onClose, onAmplify, onUpdateStatus, onToggleBookmark }: Props) {
  if (!story) return null;

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-50 border-green-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const isInstitution = user?.role === 'INSTITUTION';

  return (
    <AnimatePresence>
      {story && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-4xl bg-brand-bg rounded-[2.5rem] shadow-2xl overflow-hidden my-auto"
          >
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Left Column: Content */}
              <div className="flex-1 p-8 sm:p-12 overflow-y-auto bg-white">
                <div className="flex items-center justify-between mb-8 md:hidden">
                  <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    {story.category}
                  </span>
                  <span className={`px-4 py-1.5 border text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 ${getVerificationColor(story.verificationLevel)}`}>
                    <ShieldCheck className="w-4 h-4" />
                    {story.verificationLevel} Verification
                  </span>
                  <div className="px-4 py-1.5 bg-brand-bg rounded-full text-xs font-bold uppercase tracking-widest text-brand-primary/40">
                    Status: {story.status}
                  </div>
                </div>

                <h2 className="text-4xl sm:text-5xl font-bold text-brand-primary mb-6 leading-[1.1]">
                  {story.title}
                </h2>

                <div className="flex flex-wrap gap-6 text-brand-primary/50 text-sm font-medium mb-12">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {story.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(story.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    By {story.authorName}
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent mb-4">AI Summary</h3>
                    <p className="text-xl font-medium text-brand-primary/80 leading-relaxed italic border-l-4 border-brand-accent pl-6">
                      "{story.summary}"
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary/30 mb-4">Full Story</h3>
                    <div className="prose prose-lg text-brand-primary/80 max-w-none">
                      {story.description.split('\n').map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Right Column: Analysis & Actions */}
              <div className="w-full md:w-80 bg-brand-bg p-8 sm:p-10 border-l border-brand-primary/5 flex flex-col">
                <button 
                  onClick={onClose} 
                  className="hidden md:flex self-end p-2 hover:bg-white rounded-full mb-8 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="space-y-10 flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Impact Score</h3>
                      <TrendingUp className="w-4 h-4 text-brand-accent" />
                    </div>
                    <div className="text-6xl font-bold text-brand-accent font-display">
                      {story.impactScore}
                    </div>
                  </div>

                  {isInstitution && onUpdateStatus && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Manage Status</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {(['verified', 'in-progress', 'handled', 'rejected'] as Story['status'][]).map(status => (
                          <button
                            key={status}
                            onClick={() => onUpdateStatus(story.id, status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${story.status === status ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary/60 hover:bg-brand-primary hover:text-white'}`}
                          >
                            Mark as {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Breakdown</h3>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Urgency', value: story.impactBreakdown.urgency },
                        { label: 'Reach', value: story.impactBreakdown.reach },
                        { label: 'Relevance', value: story.impactBreakdown.relevance },
                      ].map(metric => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span>{metric.label}</span>
                            <span>{metric.value}%</span>
                          </div>
                          <div className="h-1.5 bg-white rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              className="h-full bg-brand-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-10 mt-10 border-t border-brand-primary/5 space-y-4">
                  {!isInstitution ? (
                    <button
                      onClick={onAmplify}
                      className="w-full py-4 bg-brand-accent text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-accent/20"
                    >
                      <Share2 className="w-5 h-5" />
                      Amplify Story
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={() => onToggleBookmark?.(story.id)}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${story.bookmarkedBy.includes(user?.id || '') ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary border border-brand-primary/10 hover:bg-brand-bg'}`}
                      >
                        <Bookmark className={`w-5 h-5 ${story.bookmarkedBy.includes(user?.id || '') ? 'fill-current' : ''}`} />
                        {story.bookmarkedBy.includes(user?.id || '') ? 'Bookmarked' : 'Bookmark for Review'}
                      </button>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-2">Institutional Access</p>
                        <div className="p-4 bg-white rounded-2xl border border-brand-primary/5 text-[10px] font-medium text-brand-primary/60 italic">
                          This report is being monitored by your agency.
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-center text-brand-primary/40 mt-4 font-medium flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" />
                    {story.amplifiedCount} people have boosted this signal
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
