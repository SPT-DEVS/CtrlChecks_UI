/**
 * GitHub OAuth Callback Handler
 * 
 * Handles GitHub OAuth callback from Supabase Auth.
 * Extracts tokens from session and saves them securely via backend API.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

export default function GitHubAuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Avoid double-execution in React Strict Mode
    if (processedRef.current) return;

    let authSubscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout;

    const processSession = async (session: Session | null) => {
      if (!session) return false;

      // Prevent multiple processings for the same session if possible
      if (processedRef.current) return true;
      processedRef.current = true;

      try {
        setStatus('GitHub tokens found. Saving...');

        // Extract tokens from Supabase session
        const { provider_token, provider_refresh_token, expires_at } = session as Session & {
          provider_token?: string | null;
          provider_refresh_token?: string | null;
          expires_at?: number;
        };

        if (!provider_token) {
          console.warn('No provider_token in session. Is this a GitHub OAuth session?');
          throw new Error('GitHub access token not found in session.');
        }

        console.log('Got GitHub tokens. Saving to database via backend API...');

        // Get current session token for API authentication
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession?.access_token) {
          throw new Error('No active session found');
        }

        // Call backend API to save token (with encryption)
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/social-tokens`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'github',
            access_token: provider_token,
            refresh_token: provider_refresh_token || null,
            expires_at: expires_at ? new Date(expires_at * 1000).toISOString() : null,
            scope: 'repo,user,read:org', // GitHub scopes
            provider_user_id: null, // Can be fetched from GitHub API if needed
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to save GitHub token: ${response.statusText}`);
        }

        toast({
          title: 'Success',
          description: 'GitHub connected successfully!',
        });

        // Check if we should return to a specific page
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo');
        
        if (returnTo) {
          navigate(returnTo);
        } else {
          navigate('/workflows');
        }
        return true;

      } catch (err) {
        console.error('Error in GitHub callback processing:', err);
        setError(err instanceof Error ? err.message : 'Failed to save GitHub connection');
        toast({
          title: 'Connection Failed',
          description: err instanceof Error ? err.message : 'Failed to save connection',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/workflows'), 3000);
        return true;
      }
    };

    const setupAuthListener = async () => {
      // 1. Check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const success = await processSession(session);
        if (success) return;
      }

      // 2. Setup listener for the eventual sign in (PKCE flow)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log(`Auth Callback Event: ${event}`);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await processSession(session);
          }
        }
      );
      authSubscription = subscription;

      // 3. Set a timeout just in case it hangs forever
      timeoutId = setTimeout(() => {
        if (!processedRef.current) {
          setError('Authentication timed out. Please try again.');
          processedRef.current = true;
        }
      }, 10000); // 10 seconds timeout
    };

    setupAuthListener();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-destructive font-semibold">Connection Failed</div>
        <p className="text-muted-foreground">{error}</p>
        <div className="bg-muted p-4 rounded text-xs font-mono text-left max-w-lg overflow-auto">
          <p>Debug Info:</p>
          <p>URL: {window.location.href}</p>
          <p>Status: {status}</p>
        </div>
        <Button onClick={() => navigate('/workflows')} variant="outline">
          Return to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{status}</p>
      <p className="text-xs text-muted-foreground max-w-md text-center">
        Waiting for GitHub to complete the handshake...
      </p>
    </div>
  );
}
