
-- 1. business_datasets
CREATE TABLE public.business_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  dataset_type TEXT NOT NULL DEFAULT 'sales',
  source TEXT NOT NULL DEFAULT 'manual',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  period_start DATE,
  period_end DATE,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.business_datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or admin view datasets" ON public.business_datasets
  FOR SELECT USING (auth.uid() = business_id OR is_admin());
CREATE POLICY "Admins insert datasets" ON public.business_datasets
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins update datasets" ON public.business_datasets
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete datasets" ON public.business_datasets
  FOR DELETE USING (is_admin());

CREATE TRIGGER trg_business_datasets_updated
  BEFORE UPDATE ON public.business_datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. business_insights
CREATE TABLE public.business_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Business Analysis Report',
  period_start DATE,
  period_end DATE,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  trends JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner sees sent or admin sees all insights" ON public.business_insights
  FOR SELECT USING ((auth.uid() = business_id AND status = 'sent') OR is_admin());
CREATE POLICY "Admins insert insights" ON public.business_insights
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins update insights" ON public.business_insights
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete insights" ON public.business_insights
  FOR DELETE USING (is_admin());

CREATE TRIGGER trg_business_insights_updated
  BEFORE UPDATE ON public.business_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. detected_issues
CREATE TABLE public.detected_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id UUID NOT NULL REFERENCES public.business_insights(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  category TEXT,
  root_cause TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.detected_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views via sent insight or admin" ON public.detected_issues
  FOR SELECT USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.business_insights bi
      WHERE bi.id = detected_issues.insight_id
        AND bi.business_id = auth.uid()
        AND bi.status = 'sent'
    )
  );
CREATE POLICY "Admins insert issues" ON public.detected_issues
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins update issues" ON public.detected_issues
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete issues" ON public.detected_issues
  FOR DELETE USING (is_admin());

-- 4. recommendations
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id UUID REFERENCES public.business_insights(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner sees sent or admin all recs" ON public.recommendations
  FOR SELECT USING ((auth.uid() = business_id AND status IN ('sent','acknowledged')) OR is_admin());
CREATE POLICY "Owner can acknowledge own recs" ON public.recommendations
  FOR UPDATE USING (auth.uid() = business_id) WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Admins insert recs" ON public.recommendations
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins update recs" ON public.recommendations
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete recs" ON public.recommendations
  FOR DELETE USING (is_admin());

CREATE TRIGGER trg_recommendations_updated
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. support_requests
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'analysis',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or admin view support" ON public.support_requests
  FOR SELECT USING (auth.uid() = business_id OR is_admin());
CREATE POLICY "Owner creates support" ON public.support_requests
  FOR INSERT WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Admins update support" ON public.support_requests
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete support" ON public.support_requests
  FOR DELETE USING (is_admin());

CREATE TRIGGER trg_support_requests_updated
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notification triggers
CREATE OR REPLACE FUNCTION public.notify_insight_sent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'sent' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (NEW.business_id, 'New Business Insight', COALESCE(NEW.title,'Your business analysis report is ready'), 'info', '/insights');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_insight_sent
  AFTER INSERT OR UPDATE ON public.business_insights
  FOR EACH ROW EXECUTE FUNCTION public.notify_insight_sent();

CREATE OR REPLACE FUNCTION public.notify_recommendation_sent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'sent' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (NEW.business_id, 'New Recommendation', NEW.title, 'success', '/insights');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_recommendation_sent
  AFTER INSERT OR UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.notify_recommendation_sent();

CREATE OR REPLACE FUNCTION public.notify_support_request_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE admin_user RECORD;
BEGIN
  FOR admin_user IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (admin_user.user_id, 'New Support Request', 'A business client requested ' || NEW.type || ' help', 'warning', '/admin');
  END LOOP;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_support_request_created
  AFTER INSERT ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_support_request_created();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.detected_issues;
