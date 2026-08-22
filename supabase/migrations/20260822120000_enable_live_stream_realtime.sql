-- Keep the homepage live indicator synchronized as soon as an admin starts or ends a stream.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
