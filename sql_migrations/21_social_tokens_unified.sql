-- Unified Social Media OAuth Tokens Table
-- Production-ready with encryption support and proper RLS

-- Create unified social_tokens table
CREATE TABLE IF NOT EXISTS public.social_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'facebook', 'twitter', 'linkedin', 'google')),
  access_token TEXT NOT NULL, -- Encrypted before storage
  refresh_token TEXT, -- Encrypted before storage (if available)
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  provider_user_id TEXT, -- Store provider's user ID for reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider) -- One token per user per provider
);

-- Enable RLS
ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own social tokens" ON public.social_tokens;
DROP POLICY IF EXISTS "Users can insert own social tokens" ON public.social_tokens;
DROP POLICY IF EXISTS "Users can update own social tokens" ON public.social_tokens;
DROP POLICY IF EXISTS "Users can delete own social tokens" ON public.social_tokens;

-- Policies: Users can only access their own tokens
CREATE POLICY "Users can view own social tokens" ON public.social_tokens
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social tokens" ON public.social_tokens
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social tokens" ON public.social_tokens
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social tokens" ON public.social_tokens
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_social_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS update_social_tokens_updated_at ON public.social_tokens;

-- Create trigger
CREATE TRIGGER update_social_tokens_updated_at
  BEFORE UPDATE ON public.social_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_social_tokens_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_tokens_user_id ON public.social_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_social_tokens_provider ON public.social_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_social_tokens_user_provider ON public.social_tokens(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_social_tokens_expires_at ON public.social_tokens(expires_at);

-- Add comment for documentation
COMMENT ON TABLE public.social_tokens IS 'Unified table for storing encrypted OAuth tokens for all social media providers (GitHub, Facebook, Twitter, LinkedIn, Google)';
COMMENT ON COLUMN public.social_tokens.access_token IS 'Encrypted access token - must be decrypted before use';
COMMENT ON COLUMN public.social_tokens.refresh_token IS 'Encrypted refresh token - must be decrypted before use';
COMMENT ON COLUMN public.social_tokens.provider IS 'Provider name: github, facebook, twitter, linkedin, or google';
