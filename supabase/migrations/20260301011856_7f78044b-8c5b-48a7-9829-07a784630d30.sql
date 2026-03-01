
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  user_email TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = user_id);
