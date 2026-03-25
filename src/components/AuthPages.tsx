import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Radio, ShieldCheck, Loader2 } from 'lucide-react';
import { UserRole } from '../types';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

interface Props {
  onSuccess: () => void;
}

export default function AuthPages({ onSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('REPORTER');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create default profile for new Google users
        await setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName || 'Anonymous User',
          email: user.email,
          role: 'REPORTER', // Default role for Google sign-in
          createdAt: new Date().toISOString()
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          fullName: formData.fullName,
          email: formData.email,
          role: role,
          createdAt: new Date().toISOString()
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(
          <span>
            Authentication method not enabled. Please enable <b>Email/Password</b> and <b>Google</b> in your{' '}
            <a 
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold"
            >
              Firebase Console
            </a>.
          </span>
        );
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-brand-primary/5">
        {/* Left Side: Visual/Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-brand-primary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">StorySasa</h1>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Verified <span className="text-brand-accent">Citizen</span> Journalism.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Join a community where real-time reports meet institutional action. Verified, credible, and impactful.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-brand-accent" />
            <div>
              <p className="text-sm font-bold">Trust & Verification</p>
              <p className="text-xs text-white/40">AI-driven credibility scoring for every report.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-brand-primary mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-brand-primary/40 font-medium">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join the network and start reporting today.'}
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 bg-white border border-brand-primary/10 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-bg transition-all group disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebase/anonymous-scan.png" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              <span>Sign in with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-primary/5"></div>
              </div>
              <span className="relative px-4 bg-white text-xs font-bold uppercase tracking-widest text-brand-primary/20">Or use email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/20" />
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/20" />
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary/20" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-brand-bg border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all font-medium"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('REPORTER')}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${role === 'REPORTER' ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-bg bg-white'}`}
                    >
                      <p className="font-bold text-sm">Citizen Reporter</p>
                      <p className="text-[10px] text-brand-primary/40">Submit real-time reports</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('INSTITUTION')}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${role === 'INSTITUTION' ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-bg bg-white'}`}
                    >
                      <p className="font-bold text-sm">Institutional User</p>
                      <p className="text-[10px] text-brand-primary/40">Access verified insights</p>
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-brand-primary/10 text-brand-accent focus:ring-brand-accent"
                    checked={formData.rememberMe}
                    onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-brand-primary/40 group-hover:text-brand-primary transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-brand-accent hover:underline">Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Login to Dashboard' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-brand-primary/40 hover:text-brand-primary transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-brand-accent font-bold">{isLogin ? 'Sign Up' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
