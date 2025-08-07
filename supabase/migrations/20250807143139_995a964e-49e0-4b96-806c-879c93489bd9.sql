-- Enable RLS on all tables that don't have it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create RLS policies for coaching_sessions table
CREATE POLICY "Users can view their own coaching sessions" 
ON public.coaching_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coaching sessions" 
ON public.coaching_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching sessions" 
ON public.coaching_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching sessions" 
ON public.coaching_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages table
CREATE POLICY "Users can view messages from their sessions" 
ON public.chat_messages 
FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their sessions" 
ON public.chat_messages 
FOR UPDATE 
USING (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their sessions" 
ON public.chat_messages 
FOR DELETE 
USING (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for action_items table
CREATE POLICY "Users can view action items from their sessions" 
ON public.action_items 
FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create action items in their sessions" 
ON public.action_items 
FOR INSERT 
WITH CHECK (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update action items in their sessions" 
ON public.action_items 
FOR UPDATE 
USING (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete action items in their sessions" 
ON public.action_items 
FOR DELETE 
USING (
  session_id IN (
    SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for scheduled_sessions table
CREATE POLICY "Users can view their own scheduled sessions" 
ON public.scheduled_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled sessions" 
ON public.scheduled_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled sessions" 
ON public.scheduled_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled sessions" 
ON public.scheduled_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for session_notes table (note: this already has policies but ensuring they're comprehensive)
DROP POLICY IF EXISTS "Users can view their own session notes" ON public.session_notes;
DROP POLICY IF EXISTS "Users can create their own session notes" ON public.session_notes;
DROP POLICY IF EXISTS "Users can update their own session notes" ON public.session_notes;
DROP POLICY IF EXISTS "Users can delete their own session notes" ON public.session_notes;

CREATE POLICY "Users can view their own session notes" 
ON public.session_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own session notes" 
ON public.session_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session notes" 
ON public.session_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own session notes" 
ON public.session_notes 
FOR DELETE 
USING (auth.uid() = user_id);