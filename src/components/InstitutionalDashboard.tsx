import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Filter, 
  Search, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  MapPin,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { Story, User, Category } from '../types';
import { StoryCard } from './StoryCard';

interface Props {
  user: User;
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onUpdateStatus: (id: string, status: Story['status']) => void;
  onToggleBookmark: (id: string) => void;
}

export default function InstitutionalDashboard({ user, stories, onStoryClick, onUpdateStatus, onToggleBookmark }: Props) {
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && s.status !== 'rejected';
    });
  }, [stories, filterCategory, searchQuery]);

  const stats = useMemo(() => {
    const verified = stories.filter(s => s.status === 'verified').length;
    const pending = stories.filter(s => s.status === 'pending').length;
    const handled = stories.filter(s => s.status === 'handled').length;
    
    return {
      verified,
      pending,
      handled,
      totalImpact: stories.reduce((acc, s) => acc + s.amplifiedCount, 0)
    };
  }, [stories]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stories]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      {/* Header & Quick Stats */}
      <div className="flex flex-col xl:flex-row gap-8 items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Institutional Command</h1>
          <p className="text-brand-primary/40 font-medium">Monitoring real-time community signals for {user.fullName}.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
          {[
            { label: 'Verified', value: stats.verified, icon: ShieldCheck, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600' },
            { label: 'Handled', value: stats.handled, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Total Reach', value: stats.totalImpact, icon: TrendingUp, color: 'text-brand-accent' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-brand-primary/5 card-shadow">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left: Analytics & Insights */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 card-shadow border border-brand-primary/5">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-accent" />
              Category Distribution
            </h2>
            <div className="space-y-6">
              {categoryStats.map(([cat, count]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span>{cat}</span>
                    <span className="text-brand-primary/40">{count} reports</span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full" 
                      style={{ width: `${(count / stories.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-primary text-white rounded-[3rem] p-8 card-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-accent" />
              Urgent Attention
            </h2>
            <div className="space-y-4">
              {stories.filter(s => s.status === 'pending').slice(0, 3).map(s => (
                <div key={s.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => onStoryClick(s)}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">High Priority</span>
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-white/40 line-clamp-1">{s.location}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
              View All Pending
            </button>
          </div>
        </div>

        {/* Right: Feed & Filters */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/20" />
              <input 
                type="text"
                placeholder="Search reports by title, description, or location..."
                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-brand-primary/5 card-shadow outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20" />
                <select 
                  className="pl-10 pr-8 py-4 bg-white rounded-2xl border border-brand-primary/5 card-shadow outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-bold text-xs uppercase tracking-widest appearance-none"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value as Category | 'All')}
                >
                  <option value="All">All Categories</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Community Issue">Community Issue</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStories.length > 0 ? (
              filteredStories.map(story => (
                <div key={story.id} className="relative group">
                  <StoryCard
                    story={story}
                    user={user}
                    onClick={() => onStoryClick(story)}
                    onAmplify={() => {}} // Institutions don't amplify, they act
                    onToggleBookmark={onToggleBookmark}
                  />
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleBookmark(story.id); }}
                      className={`p-2 bg-white rounded-xl border border-brand-primary/5 transition-all shadow-sm ${
                        user.bookmarkedStories?.includes(story.id) ? 'text-brand-accent' : 'text-brand-primary/40 hover:text-brand-accent'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white text-brand-primary/40 rounded-xl border border-brand-primary/5 hover:text-brand-accent transition-all shadow-sm">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border border-dashed border-brand-primary/10">
                <Search className="w-12 h-12 text-brand-primary/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No reports found</h3>
                <p className="text-brand-primary/40">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
