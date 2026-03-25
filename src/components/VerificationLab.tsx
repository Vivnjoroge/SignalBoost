import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertCircle, CheckCircle2, Info, Search } from 'lucide-react';
import { Story } from '../types';

interface Props {
  stories: Story[];
  onStoryClick: (story: Story) => void;
}

export default function VerificationLab({ stories, onStoryClick }: Props) {
  const stats = {
    high: stories.filter(s => s.verificationLevel === 'High').length,
    medium: stories.filter(s => s.verificationLevel === 'Medium').length,
    low: stories.filter(s => s.verificationLevel === 'Low').length,
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Verification Lab</h2>
          <p className="text-brand-primary/60">AI-driven credibility assessment and fact-checking.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'High Confidence', count: stats.high, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Needs Review', count: stats.medium, icon: Info, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Unverified', count: stats.low, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${item.bg} rounded-[2rem] p-8 border border-black/5`}
          >
            <item.icon className={`w-8 h-8 ${item.color} mb-6`} />
            <div className="text-4xl font-bold mb-1">{item.count}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-60">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Verification Queue */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Verification Queue</h3>
          {stories.map(story => (
            <motion.div
              layout
              key={story.id}
              onClick={() => onStoryClick(story)}
              className="bg-white rounded-3xl p-6 card-shadow border border-brand-primary/5 flex items-center justify-between group cursor-pointer hover:border-brand-accent/20 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  story.verificationLevel === 'High' ? 'bg-green-50 text-green-600' : 
                  story.verificationLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg group-hover:text-brand-accent transition-colors">{story.title}</h4>
                  <p className="text-xs text-brand-primary/40 font-medium">{story.location} • {story.category}</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-40">Confidence</div>
                <div className={`text-sm font-bold ${
                  story.verificationLevel === 'High' ? 'text-green-600' : 
                  story.verificationLevel === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {story.verificationLevel}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar: AI Logic */}
        <div className="space-y-6">
          <div className="bg-brand-primary text-white rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">AI Methodology</h3>
            <div className="space-y-6 text-sm leading-relaxed text-white/70">
              <p>Our AI analyzes stories across four dimensions to determine credibility:</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                  <span><strong className="text-white">Internal Consistency:</strong> Cross-referencing details within the narrative.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                  <span><strong className="text-white">Spatial Context:</strong> Verifying location data against known regional events.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                  <span><strong className="text-white">Linguistic Patterns:</strong> Identifying markers of authentic community reporting.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
