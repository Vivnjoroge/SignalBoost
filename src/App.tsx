/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, TrendingUp, Radio, Globe, LayoutGrid, List, Map as MapIcon, ShieldCheck, LogOut, User as UserIcon, Bell, Loader2 } from 'lucide-react';
import { Story, StorySubmission, Category, User, UserRole } from './types';
import { processStory } from './services/aiService';
import SubmissionForm from './components/SubmissionForm';
import { StoryCard } from './components/StoryCard';
import StoryDetail from './components/StoryDetail';
import ImpactMap from './components/ImpactMap';
import VerificationLab from './components/VerificationLab';
import AuthPages from './components/AuthPages';
import InstitutionalDashboard from './components/InstitutionalDashboard';
import ReporterDashboard from './components/ReporterDashboard';
import Chatbot from './components/Chatbot';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, updateDoc, increment, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';

const CATEGORIES: Category[] = ['Emergency', 'Infrastructure', 'Community Issue', 'Health', 'Education', 'Environment', 'Innovation', 'Other'];

type View = 'Feed' | 'Impact Map' | 'Verification Lab' | 'Dashboard';

export default function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState<View>('Feed');
  const [loading, setLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: firebaseUser.uid,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role as UserRole
          });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Stories Listener
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Story[];
      setStories(storiesData);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView('Feed');
  };

  const handleSubmission = async (submission: StorySubmission) => {
    if (!currentUser) return;

    try {
      const aiResult = await processStory(submission);
      
      const newStoryData = {
        ...submission,
        ...aiResult,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        createdAt: new Date().toISOString(),
        status: 'pending',
        amplifiedCount: 0,
        bookmarkedBy: []
      };

      await addDoc(collection(db, 'stories'), newStoryData);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit story. Please try again.");
    }
  };

  const handleAmplify = async (id: string) => {
    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, {
        amplifiedCount: increment(1)
      });
    } catch (error) {
      console.error("Amplify error:", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: Story['status']) => {
    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, { status });
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    if (!currentUser) return;
    try {
      const storyRef = doc(db, 'stories', id);
      const story = stories.find(s => s.id === id);
      if (story?.bookmarkedBy.includes(currentUser.id)) {
        await updateDoc(storyRef, { bookmarkedBy: arrayRemove(currentUser.id) });
      } else {
        await updateDoc(storyRef, { bookmarkedBy: arrayUnion(currentUser.id) });
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stories', id));
      if (selectedStory?.id === id) setSelectedStory(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredStories = useMemo(() => {
    return stories
      .filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.impactScore - a.impactScore);
  }, [stories, searchQuery, selectedCategory]);

  const topImpactStories = useMemo(() => {
    return [...stories].sort((a, b) => b.impactScore - a.impactScore).slice(0, 3);
  }, [stories]);

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
          <p className="text-brand-primary/40 font-bold uppercase tracking-widest text-xs">StorySasa is Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPages onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-brand-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-brand-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('Feed')}>
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-accent/30">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">StorySasa</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40">Verified Citizen Journalism</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider text-brand-primary/60">
              <button 
                onClick={() => setCurrentView('Feed')}
                className={`transition-colors ${currentView === 'Feed' ? 'text-brand-accent' : 'hover:text-brand-primary'}`}
              >
                Feed
              </button>
              {currentUser.role === 'INSTITUTION' && (
                <>
                  <button 
                    onClick={() => setCurrentView('Impact Map')}
                    className={`transition-colors ${currentView === 'Impact Map' ? 'text-brand-accent' : 'hover:text-brand-primary'}`}
                  >
                    Impact Map
                  </button>
                  <button 
                    onClick={() => setCurrentView('Verification Lab')}
                    className={`transition-colors ${currentView === 'Verification Lab' ? 'text-brand-accent' : 'hover:text-brand-primary'}`}
                  >
                    Verification Lab
                  </button>
                </>
              )}
              <button 
                onClick={() => setCurrentView('Dashboard')}
                className={`transition-colors ${currentView === 'Dashboard' ? 'text-brand-accent' : 'hover:text-brand-primary'}`}
              >
                {currentUser.role === 'INSTITUTION' ? 'Institution Hub' : 'My Reports'}
              </button>
            </nav>
            
            <div className="flex items-center gap-4 pl-8 border-l border-brand-primary/10">
              <div className="text-right">
                <p className="text-xs font-bold">{currentUser.fullName}</p>
                <p className="text-[10px] text-brand-primary/40 uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-brand-primary/40 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {currentUser.role === 'REPORTER' && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="p-3 bg-brand-accent text-white rounded-xl shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
            <button onClick={handleLogout} className="p-2 text-brand-primary/40">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentView === 'Feed' && (
          <>
            {/* Hero Section */}
            <section className="mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="inline-block px-4 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-6">
                      Community First
                    </span>
                    <h2 className="text-5xl sm:text-7xl font-bold leading-[1.05] mb-8">
                      Amplify the <span className="text-brand-accent">Unheard</span> Stories.
                    </h2>
                    <p className="text-xl text-brand-primary/60 leading-relaxed mb-10 max-w-lg">
                      StorySasa uses AI to surface underreported community issues, prioritizing impact over trends.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {currentUser.role === 'REPORTER' && (
                        <button 
                          onClick={() => setIsFormOpen(true)}
                          className="px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:scale-105 transition-transform"
                        >
                          Start a Signal
                        </button>
                      )}
                      <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-brand-primary/5 font-bold">
                        <Globe className="w-5 h-5 text-brand-accent" />
                        <span>{stories.length} Active Signals</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="hidden lg:block">
                  <div className="bg-white rounded-[3rem] p-8 card-shadow border border-brand-primary/5">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Top Impact Stories</h3>
                      <TrendingUp className="w-4 h-4 text-brand-accent" />
                    </div>
                    <div className="space-y-6">
                      {topImpactStories.map((story, i) => (
                        <div key={story.id} className="flex gap-4 group cursor-pointer" onClick={() => setSelectedStory(story)}>
                          <div className="text-4xl font-display font-bold text-brand-primary/10 group-hover:text-brand-accent/20 transition-colors">
                            0{i + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg leading-tight mb-1 group-hover:text-brand-accent transition-colors">{story.title}</h4>
                            <div className="flex items-center gap-3 text-xs font-medium text-brand-primary/40">
                              <span>{story.category}</span>
                              <span>•</span>
                              <span className="text-brand-accent font-bold">{story.impactScore} Impact</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Search & Filters */}
            <section className="mb-12">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/30" />
                  <input
                    type="text"
                    placeholder="Search stories, locations, or topics..."
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-brand-primary/5 outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  <div className="flex bg-white p-1.5 rounded-2xl border border-brand-primary/5">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-primary/40 hover:bg-brand-bg'}`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-primary/40 hover:bg-brand-bg'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="h-8 w-px bg-brand-primary/10 hidden md:block" />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === 'All' ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary/60 border border-brand-primary/5 hover:bg-brand-bg'}`}
                    >
                      All
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary/60 border border-brand-primary/5 hover:bg-brand-bg'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Story Feed */}
            <section>
              {filteredStories.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                  <AnimatePresence mode="popLayout">
                    {filteredStories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        user={currentUser}
                        onClick={() => setSelectedStory(story)}
                        onAmplify={(e) => {
                          e.stopPropagation();
                          handleAmplify(story.id);
                        }}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-brand-primary/10">
                  <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-brand-primary/20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No signals found</h3>
                  <p className="text-brand-primary/40">Try adjusting your search or filters to find more stories.</p>
                </div>
              )}
            </section>
          </>
        )}

        {currentView === 'Impact Map' && (
          <ImpactMap stories={stories} onStoryClick={setSelectedStory} />
        )}

        {currentView === 'Verification Lab' && (
          <VerificationLab stories={stories} onStoryClick={setSelectedStory} />
        )}

        {currentView === 'Dashboard' && currentUser.role === 'INSTITUTION' && (
          <InstitutionalDashboard 
            user={currentUser} 
            stories={stories} 
            onStoryClick={setSelectedStory}
            onUpdateStatus={handleUpdateStatus}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentView === 'Dashboard' && currentUser.role === 'REPORTER' && (
          <ReporterDashboard 
            user={currentUser} 
            stories={stories} 
            onStoryClick={setSelectedStory}
            onDeleteStory={handleDeleteStory}
            onSubmitStory={handleSubmission}
          />
        )}
      </main>

      {/* Modals */}
      <SubmissionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmission}
      />

      <StoryDetail
        story={selectedStory}
        user={currentUser}
        onClose={() => setSelectedStory(null)}
        onAmplify={() => selectedStory && handleAmplify(selectedStory.id)}
        onUpdateStatus={handleUpdateStatus}
        onToggleBookmark={handleToggleBookmark}
      />

      <Chatbot user={currentUser} stories={stories} />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden glass border-t border-brand-primary/5 px-6 py-3 flex items-center justify-around z-40">
        <button 
          onClick={() => setCurrentView('Feed')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'Feed' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Feed</span>
        </button>
        {currentUser.role === 'INSTITUTION' && (
          <>
            <button 
              onClick={() => setCurrentView('Impact Map')}
              className={`flex flex-col items-center gap-1 transition-all ${currentView === 'Impact Map' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
            >
              <MapIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Map</span>
            </button>
            <button 
              onClick={() => setCurrentView('Verification Lab')}
              className={`flex flex-col items-center gap-1 transition-all ${currentView === 'Verification Lab' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Lab</span>
            </button>
          </>
        )}
        <button 
          onClick={() => setCurrentView('Dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'Dashboard' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Mobile Floating Action Button */}
      {currentUser.role === 'REPORTER' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-20 right-6 md:hidden w-14 h-14 bg-brand-accent text-white rounded-2xl shadow-2xl flex items-center justify-center z-40"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      )}
    </div>
  );
}
