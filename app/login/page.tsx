'use client';

import { useState, Suspense, useEffect } from 'react';
import { createAuthBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin',
  );

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const supabase = createAuthBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createAuthBrowserClient();

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // No email confirmation required — sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      setSuccess(`Signed in as ${email}. Redirecting to ${redirectTo}…`);
      setTimeout(() => { window.location.href = redirectTo; }, 800);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(`Signed in as ${email}. Redirecting to ${redirectTo}…`);
        setTimeout(() => { window.location.href = redirectTo; }, 800);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Masthead mini */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-black tracking-tighter font-serif">OzoneNews</div>
          </Link>
          <p className="text-xs tracking-widest text-gray-400 mt-1 font-mono uppercase">
            Independent · Verified · In-Depth
          </p>
        </div>

        {/* Card */}
        <div className="border-2 border-black bg-white p-8">
          <h1 className="text-xl font-black tracking-tight mb-1">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Save articles, track your reading, and personalise your feed.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              {success}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-black px-4 py-3 font-bold text-sm tracking-wide hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border-2 border-gray-200 focus:border-black outline-none px-3 py-2.5 text-sm transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-2 border-gray-200 focus:border-black outline-none px-3 py-2.5 text-sm transition-colors"
            />
            {mode === 'signup' && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border-2 border-gray-200 focus:border-black outline-none px-3 py-2.5 text-sm transition-colors"
              />
            )}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-black text-white px-4 py-3 font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {mode === 'signin' ? 'Sign in with Email' : 'Create Account'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-xs text-gray-500 mt-5">
            {mode === 'signin' ? (
              <>No account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); setConfirmPassword(''); }} className="font-bold underline hover:text-black">
                  Create one
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(''); setSuccess(''); setConfirmPassword(''); }} className="font-bold underline hover:text-black">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-[11px] text-gray-400 text-center mt-5 leading-relaxed">
            By signing in you agree to our{' '}
            <Link href="/terms-of-service" className="underline hover:text-black">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline hover:text-black">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-black underline">← Back to OzoneNews</Link>
        </p>
      </div>
    </main>
  );
}
