# Isoko Data Insights & Business Support

Transform the existing Admin "Data Analysis" tab into a full insights platform with **two sides**: Admin (data source + analyst) and User (business client receiving insights, reports, and recommendations).

## 1. Database (new tables)

All with RLS. Users see only their own; admins see all.

- **business_datasets** — admin-uploaded raw data per client
  `id, business_id (→ profiles.user_id), dataset_type (sales|orders|delivery|custom), source (csv|api|manual), payload jsonb, period_start, period_end, uploaded_by, created_at`
- **business_insights** — analysis results
  `id, business_id, period_start, period_end, summary jsonb (sales, orders, issues_count), trends jsonb, status (draft|sent), created_by, created_at`
- **detected_issues** — problems flagged
  `id, insight_id, business_id, title, severity (low|medium|high), category, root_cause, created_at`
- **recommendations** — admin → client advice
  `id, insight_id, business_id, title, body, status (pending|sent|acknowledged), created_by, created_at`
- **support_requests** — client → admin requests
  `id, business_id, type (analysis|marketing|logistics|other), message, status (open|in_progress|resolved), admin_feedback, created_at`

Triggers: notify the business owner via existing `notifications` table when an insight or recommendation is `sent`, and notify admins on new `support_requests`.

## 2. Admin side — replace current `DataAnalysis.tsx` with a multi-section workspace

New folder `src/components/admin/insights/` with sub-tabs inside the existing Admin "Data Analysis" tab:

1. **Control Center** — KPI strip: businesses connected, reports generated, open issues, recommendations sent. Quick-action buttons: Upload Data, Run Analysis, Manage Clients.
2. **Upload / Manage Data** — pick a business (dropdown of profiles), upload CSV (parsed client-side with PapaParse) or manual entry form; lists recent uploads with delete.
3. **Analysis Engine** — pick business + period → runs aggregation across `orders`, `logistics_requests`, `packaging_requests`, and uploaded datasets → shows charts (reuse current Recharts visuals scoped to that business) → "Generate Insight" saves a `business_insights` row.
4. **Issue Detection & Root Cause** — for an insight, admin adds detected issues + root causes (form list). Heuristic auto-suggestions (e.g. low sales vs prior period, late deliveries from `logistics_requests`).
5. **Recommendations** — write advice items tied to an insight, "Send to Client" flips status + creates notification.
6. **Support Inbox** — list of `support_requests`, reply with admin feedback, mark resolved.

Keep existing global charts as a "Platform Overview" sub-tab (date range + export PDF/Excel/CSV stays).

## 3. User side — new page `src/pages/Insights.tsx` (route `/insights`, protected)

Bottom-style tab bar (top tabs on desktop) with 4 sections:

1. **Dashboard** — Welcome + today's summary (sales, orders, issues count badge in red), performance line chart (sales over time from their orders), Key Problems list (red icons) from latest insight, Recommendations checklist (green checks).
2. **Reports** — Daily / Weekly / Monthly report buttons that filter and export PDF (reuse existing jsPDF flow). List of past insights with download.
3. **Insights (Detailed Analysis)** — full latest report: data insights, root cause analysis, suggested actions, Download Report button.
4. **Support** — buttons: Request Analysis / Marketing Help / Logistics Help (creates `support_requests`), shows latest admin feedback, Contact Admin link.

Add nav link in `Header.tsx` ("Insights") visible to logged-in users.

## 4. Design tokens

Add semantic tokens in `index.css` / `tailwind.config.ts`:
- `--insight-alert` (red) for issues
- `--insight-success` (green) for good performance / recommendations
- `--insight-warn` (amber) for medium severity

Use them via Tailwind classes — no raw colors in components.

## 5. Files

**New**
- `src/pages/Insights.tsx`
- `src/components/insights/UserDashboard.tsx`
- `src/components/insights/UserReports.tsx`
- `src/components/insights/UserDetailedAnalysis.tsx`
- `src/components/insights/UserSupport.tsx`
- `src/components/admin/insights/ControlCenter.tsx`
- `src/components/admin/insights/UploadData.tsx`
- `src/components/admin/insights/AnalysisEngine.tsx`
- `src/components/admin/insights/IssueDetection.tsx`
- `src/components/admin/insights/RecommendationsPanel.tsx`
- `src/components/admin/insights/SupportInbox.tsx`

**Edited**
- `src/components/admin/DataAnalysis.tsx` — wrap existing charts as "Platform Overview" sub-tab + add new sub-tabs above
- `src/App.tsx` — add `/insights` route
- `src/components/Header.tsx` — add Insights nav link
- `src/index.css`, `tailwind.config.ts` — semantic insight color tokens

**Migrations**
- create the 5 tables above with RLS + notify triggers
- enable realtime for `business_insights`, `recommendations`, `support_requests`

## Scope check

This is a substantial build (~12 new files, 5 tables, triggers). Confirm before I proceed, or tell me to trim (e.g. start with just user dashboard + admin analysis engine and add upload/support later).
