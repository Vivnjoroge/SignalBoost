import React from 'react';
import { motion } from 'motion/react';
import { MapPin, TrendingUp, ShieldCheck, Globe } from 'lucide-react';
import { Story } from '../types';

interface Props {
  stories: Story[];
  onStoryClick: (story: Story) => void;
}

export default function ImpactMap({ stories, onStoryClick }: Props) {
  // Group stories by location for a "map" effect
  const locations = stories.reduce((acc, story) => {
    if (!acc[story.location]) acc[story.location] = [];
    acc[story.location].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Impact Map</h2>
          <p className="text-brand-primary/60">Visualizing community signals across regions.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-brand-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">High Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-primary/20" />
            <span className="text-xs font-bold uppercase tracking-wider">Monitoring</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stylized "Map" Grid */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 sm:p-12 card-shadow border border-brand-primary/5 min-h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <Globe className="w-full h-full scale-150" />
          </div>
          
          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(locations).map(([location, locStories], i) => {
              const avgImpact = locStories.reduce((sum, s) => sum + s.impactScore, 0) / locStories.length;
              return (
                <motion.div
                  key={location}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onStoryClick(locStories[0])}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ 
                        backgroundColor: avgImpact > 70 ? 'rgba(255, 78, 0, 0.1)' : 'rgba(20, 20, 20, 0.05)',
                        border: `2px solid ${avgImpact > 70 ? '#FF4E00' : 'rgba(20, 20, 20, 0.1)'}`
                      }}
                    >
                      <MapPin className={avgImpact > 70 ? 'text-brand-accent' : 'text-brand-primary/40'} />
                    </div>
                    {avgImpact > 80 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full animate-ping" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-brand-accent transition-colors">{location}</h4>
                  <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest">
                    {locStories.length} Signal{locStories.length > 1 ? 's' : ''}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Regional Stats */}
        <div className="space-y-6">
          <div className="bg-brand-primary text-white rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">Global Pulse</h3>
            <div className="space-y-8">
              <div>
                <div className="text-4xl font-bold mb-1">{stories.length}</div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Signals</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">
                  {Math.round(stories.reduce((sum, s) => sum + s.impactScore, 0) / stories.length)}
                </div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Avg Impact Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-brand-primary/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary/40 mb-6">High Priority Regions</h3>
            <div className="space-y-4">
              {Object.entries(locations)
                .sort((a, b) => b[1].length - a[1].length)
                .slice(0, 4)
                .map(([loc, locStories]) => (
                  <div key={loc} className="flex items-center justify-between p-3 hover:bg-brand-bg rounded-xl transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-accent" />
                      <span className="text-sm font-bold">{loc}</span>
                    </div>
                    <span className="text-xs font-mono text-brand-primary/40">{locStories.length} signals</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
