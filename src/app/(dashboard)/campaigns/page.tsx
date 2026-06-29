"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getFacebookCampaigns, getFacebookMetrics } from "@/services/facebookService";
import type { FacebookCampaign, FacebookAdSummary } from "@/types/index";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import {
  Sparkles,
  DollarSign,
  Globe,
  Pencil,
  Eye,
  Trash2,
  Send,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  PieChart,
  Monitor,
  Smartphone,
  RefreshCw,
  Zap,
  Image,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";

// =============================================================================
// Design Constants
// =============================================================================

const CARD =
  "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

const BRAND_GRADIENT: React.CSSProperties = {
  background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)",
};

const BRAND_SOFT_STYLE: React.CSSProperties = {
  backgroundColor: "#2D0E22",
  border: "1px solid #5C1A46",
};

const BAR_COLORS = [
  "#D94FB0", "#8B5CF6", "#38BDF8", "#14B8A6",
  "#FB923C", "#22D3EE", "#D946EF", "#6366F1",
];

// =============================================================================
// Types
// =============================================================================

type CampaignsTab = "drafts" | "budget" | "library";

type DraftStatus = "Draft" | "Ready for Review" | "Approved" | "Rejected";

interface AdDraft {
  id: string;
  campaignName: string;
  platform: string;
  collection: string;
  headline: string;
  primaryText: string;
  language: "Estonian" | "English";
  dailyBudget: number;
  status: DraftStatus;
  createdAt: string;
}

interface CreativePlaceholder {
  id: string;
  name: string;
  collection: string;
  dimensions: string;
}

interface BudgetSimResult {
  projectedROAS: number;
  projectedRevenue: number;
  recommendation: string;
}

// =============================================================================
// Mock Data
// =============================================================================

const PLATFORMS = [
  "Facebook Feed",
  "Instagram Feed",
  "Facebook Catalog Ad",
  "Retargeting Ad",
];

const COLLECTIONS = [
  "Summer Breeze",
  "Linen Luxe",
  "Evening Bloom",
  "Boho Spirit",
  "Classic Core",
  "Eco Essence",
  "Urban Edge",
];

const MOCK_DRAFTS: AdDraft[] = [
  {
    id: "draft-001",
    campaignName: "Summer Linen Collection — FB Feed",
    platform: "Facebook Feed",
    collection: "Linen Luxe",
    headline: "Suvine linane elegants — ainult sel nädalal",
    primaryText:
      "Avasta meie uus suvine linakollektsioon. Kerged, hingavad ja ajatud disainid, mis on loodud Eesti suve jaoks. Tasuta tarne tellimustele üle 50 €.",
    language: "Estonian",
    dailyBudget: 50,
    status: "Draft",
    createdAt: "2026-06-25",
  },
  {
    id: "draft-002",
    campaignName: "Evening Bloom Retargeting",
    platform: "Retargeting Ad",
    collection: "Evening Bloom",
    headline: "Sinu lemmik kleidid ootavad sind",
    primaryText:
      "Sa vaatasid neid, aga ei ostnud. Nüüd on suurepärane aeg! Õhtukollektsiooni kleidid on nüüd 15% soodsamad. Pakkumine kehtib 48 tundi.",
    language: "Estonian",
    dailyBudget: 75,
    status: "Ready for Review",
    createdAt: "2026-06-24",
  },
  {
    id: "draft-003",
    campaignName: "Boho Spirit Catalog Ad",
    platform: "Facebook Catalog Ad",
    collection: "Boho Spirit",
    headline: "Boho vibes for your summer wardrobe",
    primaryText:
      "Explore our Boho Spirit collection. Flowy silhouettes, earthy tones, and effortless style. Shop the full catalog and find your perfect summer look.",
    language: "English",
    dailyBudget: 40,
    status: "Draft",
    createdAt: "2026-06-22",
  },
  {
    id: "draft-004",
    campaignName: "Classic Core Instagram",
    platform: "Instagram Feed",
    collection: "Classic Core",
    headline: "Ajatud klassika — iga päev, igaks juhuks",
    primaryText:
      "Classic Core kollektsioon on siin, et jääda. Minimalistlikud lõiked, kvaliteetsed kangad ja stiil, mis ei vanane. Vaata uut kollektsiooni kohe.",
    language: "Estonian",
    dailyBudget: 60,
    status: "Approved",
    createdAt: "2026-06-20",
  },
];

const MOCK_CREATIVES: CreativePlaceholder[] = [
  { id: "cr-001", name: "Summer Linen Hero", collection: "Linen Luxe", dimensions: "1080x1080" },
  { id: "cr-002", name: "Evening Bloom Carousel", collection: "Evening Bloom", dimensions: "1080x1080" },
  { id: "cr-003", name: "Boho Spirit Video", collection: "Boho Spirit", dimensions: "1080x1920" },
  { id: "cr-004", name: "Classic Core Flatlay", collection: "Classic Core", dimensions: "1080x1080" },
  { id: "cr-005", name: "Eco Essence Lifestyle", collection: "Eco Essence", dimensions: "1080x1350" },
  { id: "cr-006", name: "Urban Edge Street", collection: "Urban Edge", dimensions: "1080x1080" },
];

const TABS: { key: CampaignsTab; label: string }[] = [
  { key: "drafts", label: "Ad Drafts" },
  { key: "budget", label: "Budget Planner" },
  { key: "library", label: "Creative Library" },
];

// =============================================================================
// Helpers
// =============================================================================

function generateEstonianCopy(
  collection: string,
  platform: string,
  headline: string,
): { headline: string; primaryText: string } {
  const templates: Record<string, { headline: string; primaryText: string }> = {
    "Summer Breeze": {
      headline: "Suvine värskus — vaid TallinnDollis",
      primaryText:
        "☀️ Suvekollektsioon on kohal! Kerged kangad, õhulised lõiked ja värsked toonid — avasta Summer Breeze kollektsioon, mis on loodud Eesti suve jaoks. Iga detail sündis kirega käsitöö vastu.\n\n🎁 Tasuta tarne tellimustele üle 50 €.\n🕊️ Säästva moe valik.\n👇 Klõpsa ja avasta!",
    },
    "Linen Luxe": {
      headline: "Linane luksus — ajatu ja ehe",
      primaryText:
        "🌿 Lina on Eesti suve kõige autentsem kangas. Linen Luxe kollektsioon ühendab kaasaegse disaini traditsioonilise materjaliga. Hingavad kleidid ja särgid, mis muutuvad iga pesuga pehmemaks.\n\n🛍️ Vaata kogu kollektsiooni siit.\n💚 Säästev ja eetiline tootmine.\n👇 Avasta oma uus lemmik!",
    },
    "Evening Bloom": {
      headline: "Õitse igal õhtul — Evening Bloom",
      primaryText:
        "🌸 Õhtukollektsioon, mis paneb sind särama. Rikkalikud toonid, elegantsed lõiked ja detailid, mis räägivad loo. Evening Bloom on loodud hetkedeks, mil soovid tunda end erilisena.\n\n✨ Uus kollektsioon on nüüd saadaval.\n🎀 Iga kleit räägib oma lugu.\n👇 Avasta oma õhtu välimus!",
    },
    "Boho Spirit": {
      headline: "Boho hing — vaba ja ilus",
      primaryText:
        "🌾 Boho Spirit kutsub seiklema. Voolavad jooned, maalähedased toonid ja boheemlaslik vabadus. See kollektsioon on mõeldud naisele, kes armastab elu ja stiili ühendada.\n\n🌿 Looduslikud materjalid.\n💫 Sinu suve lemmikud.\n👇 Klõpsa ja leia oma stiil!",
    },
    "Classic Core": {
      headline: "Klassika, mis kestab igavesti",
      primaryText:
        "🖤 Classic Core on vastus küsimusele: mida kanda homme, järgmisel nädalal ja järgmisel aastal? Minimalistlik disain, täiuslikud lõiked ja materjalid, mis peavad vastu ajale.\n\n🔲 Kapselgarderoobi võtmeesemed.\n🤍 Neutraalsed toonid, lõputud kombinatsioonid.\n👇 Ehita oma unistuste garderoob!",
    },
    "Eco Essence": {
      headline: "Looduse rütmis — Eco Essence",
      primaryText:
        "🌱 Eco Essence on meie lubadus planeedile. Taaskasutatud kangad, orgaaniline puuvill ja läbipaistev tootmine. Kanna moodi, mis hoolib.\n\n♻️ 100% säästvad materjalid.\n🌍 Väiksem jalajälg, suurem stiil.\n👇 Liitu rohelise moe liikumisega!",
    },
    "Urban Edge": {
      headline: "Linna rütm — Urban Edge",
      primaryText:
        "🏙️ Urban Edge on loodud linnanaisele, kes teab, mida tahab. Teravad lõiked, julged detailid ja tänavastiili energia. See on mood, mis ei küsi luba.\n\n⚡ Energiline ja enesekindel.\n🖤 Monokroomsed paletid.\n👇 Leia oma äär!",
    },
  };

  const template = templates[collection];
  if (template) return template;

  // Fallback
  return {
    headline: headline || `Avasta ${collection} — ainult TallinnDollis`,
    primaryText:
      `✨ ${collection} kollektsioon on siin! Vaata uut kollektsiooni ja leia oma lemmikud. Tasuta tarne tellimustele üle 50 € — ainult sel nädalal.\n👇 Klõpsa ja avasta!`,
  };
}

// =============================================================================
// Sub-components: Status Badge
// =============================================================================

type StatusBadgeType = DraftStatus | import("@/types").CampaignStatus;

function StatusBadge({ status }: { status: StatusBadgeType }) {
  const config: Record<StatusBadgeType, { label: string; bg: string; text: string; border: string }> = {
    Draft: {
      label: "Draft",
      bg: "rgba(107,114,128,0.15)",
      text: "#9CA3AF",
      border: "rgba(107,114,128,0.3)",
    },
    "Ready for Review": {
      label: "Ready for Review",
      bg: "rgba(249,115,22,0.15)",
      text: "var(--warning)",
      border: "rgba(249,115,22,0.3)",
    },
    Approved: {
      label: "Approved",
      bg: "rgba(0,153,102,0.15)",
      text: "var(--success)",
      border: "rgba(0,153,102,0.3)",
    },
    Rejected: {
      label: "Rejected",
      bg: "rgba(199,0,54,0.15)",
      text: "var(--danger)",
      border: "rgba(199,0,54,0.3)",
    },
    active: {
      label: "Active",
      bg: "var(--brand-softer)",
      text: "var(--brand)",
      border: "var(--border-brand-subtle)",
    },
    paused: {
      label: "Paused",
      bg: "rgba(249,115,22,0.15)",
      text: "var(--warning)",
      border: "rgba(249,115,22,0.3)",
    },
    completed: {
      label: "Completed",
      bg: "rgba(107,114,128,0.15)",
      text: "#9CA3AF",
      border: "rgba(107,114,128,0.3)",
    },
  };
  const cfg = config[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-[12px] font-medium border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

// =============================================================================
// Sub-component: Skeleton
// =============================================================================

function DraftCardSkeleton() {
  return (
    <div className={cn(CARD, "p-4 animate-pulse")}>
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-48 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        <div className="h-5 w-20 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-3.5 w-28 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        <div className="h-3.5 w-24 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        <div className="h-3.5 w-20 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
      </div>
      <div className="h-16 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
    </div>
  );
}

function LibraryCardSkeleton() {
  return (
    <div className={cn(CARD, "p-3 animate-pulse flex flex-col items-center")}>
      <div className="w-full h-[150px] rounded-[2px] bg-[rgba(255,255,255,0.04)] mb-3" />
      <div className="h-3.5 w-24 rounded-[2px] bg-[rgba(255,255,255,0.04)] mb-1.5" />
      <div className="h-3 w-16 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className={cn(CARD, "p-4 animate-pulse")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        <div className="h-3 w-20 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
      </div>
      <div className="h-7 w-24 rounded-[2px] bg-[rgba(255,255,255,0.04)] mb-1.5" />
      <div className="h-3 w-16 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
    </div>
  );
}

// =============================================================================
// Sub-component: Stat Card
// =============================================================================

interface StatCardDef {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  accent?: string;
}

function StatCard({ title, value, subValue, icon: Icon, accent }: StatCardDef) {
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 shrink-0" style={{ color: accent ?? "var(--brand)" }} />
        <span className="text-[12px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className="text-[24px] font-semibold text-[var(--heading)]">{value}</p>
      {subValue && (
        <p className="text-[12px] text-[var(--body-subtle)] mt-1">{subValue}</p>
      )}
    </div>
  );
}

// =============================================================================
// Sub-component: Platform Icon
// =============================================================================

function PlatformIcon({ platform }: { platform: string }) {
  if (platform.includes("Facebook") && !platform.includes("Instagram")) {
    return <Monitor className="size-3.5 text-[var(--body-subtle)]" />;
  }
  if (platform.includes("Instagram")) {
    return <Smartphone className="size-3.5 text-[var(--body-subtle)]" />;
  }
  if (platform.includes("Retargeting")) {
    return <RefreshCw className="size-3.5 text-[var(--body-subtle)]" />;
  }
  if (platform.includes("Catalog")) {
    return <BarChart3 className="size-3.5 text-[var(--body-subtle)]" />;
  }
  return <Monitor className="size-3.5 text-[var(--body-subtle)]" />;
}

// =============================================================================
// Tab: Ad Drafts
// =============================================================================

function AdDraftsTab() {
  const [drafts, setDrafts] = useState<AdDraft[]>(MOCK_DRAFTS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editDraftId, setEditDraftId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    campaignName: "",
    platform: "",
    collection: "",
    headline: "",
    primaryText: "",
    language: "Estonian" as "Estonian" | "English",
    dailyBudget: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setForm({
      campaignName: "",
      platform: "",
      collection: "",
      headline: "",
      primaryText: "",
      language: "Estonian",
      dailyBudget: 0,
    });
    setFormErrors({});
    setEditDraftId(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!form.campaignName.trim()) errors.campaignName = "Campaign name is required";
    if (!form.platform) errors.platform = "Select a platform";
    if (!form.collection) errors.collection = "Select a collection";
    if (!form.headline.trim()) errors.headline = "Headline is required";
    if (form.headline.length > 40) errors.headline = "Max 40 characters";
    if (!form.primaryText.trim()) errors.primaryText = "Primary text is required";
    if (!form.dailyBudget || form.dailyBudget <= 0) errors.dailyBudget = "Budget must be greater than €0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleInputChange = useCallback(
    (field: keyof typeof form, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [formErrors],
  );

  const handleGenerateAICopy = useCallback(() => {
    if (!form.collection) {
      setNotification({ type: "error", message: "Select a collection first to generate AI copy" });
      return;
    }
    setGenerating(true);
    // Simulate a small delay for the "AI" generation feel
    setTimeout(() => {
      const copy = generateEstonianCopy(form.collection, form.platform, form.headline);
      setForm((prev) => ({
        ...prev,
        headline: copy.headline,
        primaryText: copy.primaryText,
        language: "Estonian",
      }));
      setGenerating(false);
      setNotification({ type: "success", message: "AI copy generated in Estonian!" });
      setTimeout(() => setNotification(null), 3000);
    }, 900);
  }, [form.collection, form.platform, form.headline]);

  const handleSaveDraft = useCallback(() => {
    if (!validateForm()) return;
    setSaving(true);
    setTimeout(() => {
      if (editDraftId) {
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === editDraftId
              ? { ...d, ...form, campaignName: `${form.campaignName} — ${form.platform}` }
              : d,
          ),
        );
        setNotification({ type: "success", message: "Draft updated successfully" });
      } else {
        const newDraft: AdDraft = {
          id: `draft-${Date.now()}`,
          campaignName: `${form.campaignName} — ${form.platform}`,
          platform: form.platform,
          collection: form.collection,
          headline: form.headline,
          primaryText: form.primaryText,
          language: form.language,
          dailyBudget: form.dailyBudget,
          status: "Draft",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setDrafts((prev) => [newDraft, ...prev]);
        setNotification({ type: "success", message: "Draft saved successfully!" });
      }
      setSaving(false);
      resetForm();
      setShowCreateForm(false);
      setTimeout(() => setNotification(null), 3000);
    }, 500);
  }, [form, validateForm, editDraftId, resetForm]);

  const handleEdit = useCallback((draft: AdDraft) => {
    setEditDraftId(draft.id);
    setForm({
      campaignName: draft.campaignName.replace(` — ${draft.platform}`, ""),
      platform: draft.platform,
      collection: draft.collection,
      headline: draft.headline,
      primaryText: draft.primaryText,
      language: draft.language,
      dailyBudget: draft.dailyBudget,
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    setNotification({ type: "success", message: "Draft deleted" });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSubmitForReview = useCallback((draftId: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, status: "Ready for Review" as DraftStatus } : d)),
    );
    setNotification({ type: "success", message: "Draft submitted for review" });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const isEmpty = drafts.length === 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-[2px] text-[14px] font-medium animate-fade-in",
            notification.type === "success"
              ? "bg-[rgba(0,153,102,0.15)] text-[var(--success)] border border-[rgba(0,153,102,0.3)]"
              : "bg-[rgba(199,0,54,0.15)] text-[var(--danger)] border border-[rgba(199,0,54,0.3)]",
          )}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 shrink-0" />
          )}
          {notification.message}
          <button
            className="ml-auto text-[var(--body-subtle)] hover:text-[var(--heading)]"
            onClick={() => setNotification(null)}
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Create New Ad Draft Card */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className={cn(CARD, "p-5 w-full text-left hover:border-[var(--border-brand-subtle)] transition-colors group")}
        >
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-[2px] flex items-center justify-center"
              style={BRAND_GRADIENT}
            >
              <Plus className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[var(--heading)] group-hover:text-[var(--brand)] transition-colors">
                Create New Ad Draft
              </h3>
              <p className="text-[13px] text-[var(--body-subtle)]">
                Compose ad copy, pick a collection, and save your draft
              </p>
            </div>
            <ChevronRight className="size-5 text-[var(--body-subtle)] ml-auto group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      ) : (
        <div className={cn(CARD, "p-5")}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-semibold text-[var(--heading)]">
              {editDraftId ? "Edit Ad Draft" : "Create New Ad Draft"}
            </h3>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(false);
              }}
              className="text-[var(--body-subtle)] hover:text-[var(--heading)] transition-colors"
              aria-label="Close form"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaign Name */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--body)]">Campaign Name</label>
              <input
                type="text"
                value={form.campaignName}
                onChange={(e) => handleInputChange("campaignName", e.target.value)}
                placeholder="e.g., Summer Linen Launch"
                maxLength={80}
                className={cn(
                  "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors",
                  "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                  "placeholder:text-[var(--body-subtle)] focus:border-[var(--brand)]",
                  formErrors.campaignName && "border-[var(--danger)]",
                )}
              />
              {formErrors.campaignName && (
                <p className="text-[12px] text-[var(--danger)]">{formErrors.campaignName}</p>
              )}
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--body)]">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => handleInputChange("platform", e.target.value)}
                className={cn(
                  "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors appearance-none",
                  "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                  "focus:border-[var(--brand)]",
                  formErrors.platform && "border-[var(--danger)]",
                )}
              >
                <option value="" className="bg-[#1a1a1a] text-[var(--body-subtle)]">
                  Select platform...
                </option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p} className="bg-[#1a1a1a] text-[var(--heading)]">
                    {p}
                  </option>
                ))}
              </select>
              {formErrors.platform && (
                <p className="text-[12px] text-[var(--danger)]">{formErrors.platform}</p>
              )}
            </div>

            {/* Collection */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--body)]">Product / Collection</label>
              <select
                value={form.collection}
                onChange={(e) => handleInputChange("collection", e.target.value)}
                className={cn(
                  "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors appearance-none",
                  "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                  "focus:border-[var(--brand)]",
                  formErrors.collection && "border-[var(--danger)]",
                )}
              >
                <option value="" className="bg-[#1a1a1a] text-[var(--body-subtle)]">
                  Select collection...
                </option>
                {COLLECTIONS.map((c) => (
                  <option key={c} value={c} className="bg-[#1a1a1a] text-[var(--heading)]">
                    {c}
                  </option>
                ))}
              </select>
              {formErrors.collection && (
                <p className="text-[12px] text-[var(--danger)]">{formErrors.collection}</p>
              )}
            </div>

            {/* Daily Budget */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--body)]">Daily Budget (EUR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[var(--body-subtle)]">
                  EUR
                </span>
                <input
                  type="number"
                  value={form.dailyBudget || ""}
                  onChange={(e) => handleInputChange("dailyBudget", parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  min={1}
                  className={cn(
                    "w-full pl-12 pr-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors",
                    "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                    "placeholder:text-[var(--body-subtle)] focus:border-[var(--brand)]",
                    formErrors.dailyBudget && "border-[var(--danger)]",
                  )}
                />
              </div>
              {formErrors.dailyBudget && (
                <p className="text-[12px] text-[var(--danger)]">{formErrors.dailyBudget}</p>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--body)]">
                Ad Headline{" "}
                <span className="text-[var(--body-subtle)] font-normal">
                  ({form.headline.length}/40)
                </span>
              </label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
                placeholder="Enter ad headline..."
                maxLength={40}
                className={cn(
                  "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors",
                  "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                  "placeholder:text-[var(--body-subtle)] focus:border-[var(--brand)]",
                  formErrors.headline && "border-[var(--danger)]",
                )}
              />
              {formErrors.headline && (
                <p className="text-[12px] text-[var(--danger)]">{formErrors.headline}</p>
              )}
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--body)]">Language</label>
              <div className="flex gap-4 pt-1">
                {(["Estonian", "English"] as const).map((lang) => (
                  <label
                    key={lang}
                    className="flex items-center gap-2 cursor-pointer text-[14px] text-[var(--body)]"
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang}
                      checked={form.language === lang}
                      onChange={() => handleInputChange("language", lang)}
                      className="accent-[#C8399C] size-3.5"
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Text */}
          <div className="mt-4 space-y-1.5">
            <label className="text-[13px] font-medium text-[var(--body)]">Ad Primary Text</label>
            <textarea
              value={form.primaryText}
              onChange={(e) => handleInputChange("primaryText", e.target.value)}
              placeholder="Write the main ad copy..."
              rows={3}
              className={cn(
                "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors resize-vertical",
                "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                "placeholder:text-[var(--body-subtle)] focus:border-[var(--brand)]",
                formErrors.primaryText && "border-[var(--danger)]",
              )}
            />
            {formErrors.primaryText && (
              <p className="text-[12px] text-[var(--danger)]">{formErrors.primaryText}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={handleGenerateAICopy}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px] transition-opacity disabled:opacity-60"
              style={BRAND_GRADIENT}
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generating ? "Generating..." : "Generate AI Copy"}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[var(--heading)] rounded-[2px] border border-[var(--border-default)] hover:bg-[var(--neutral-primary-medium)] transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Saving..." : editDraftId ? "Update Draft" : "Save Draft"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(false);
              }}
              className="px-4 py-2.5 text-[14px] text-[var(--body-subtle)] hover:text-[var(--heading)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drafts List */}
      {isEmpty ? (
        <div className={cn(CARD, "text-center py-20")}>
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 rounded-[2px] flex items-center justify-center bg-[rgba(255,255,255,0.04)]">
              <Send className="size-6 text-[var(--body-subtle)]" />
            </div>
            <p className="text-[14px] text-[var(--body)]">No ad drafts yet</p>
            <p className="text-[12px] text-[var(--body-subtle)]">
              Create your first ad draft to get started
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px] transition-opacity hover:opacity-90"
              style={BRAND_GRADIENT}
            >
              <Plus className="size-4" />
              Create Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSubmitForReview={handleSubmitForReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual Draft Card
// ---------------------------------------------------------------------------

interface DraftCardProps {
  draft: AdDraft;
  onEdit: (draft: AdDraft) => void;
  onDelete: (id: string) => void;
  onSubmitForReview: (id: string) => void;
}

function DraftCard({ draft, onEdit, onDelete, onSubmitForReview }: DraftCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={cn(CARD, "p-4")}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-[16px] font-semibold text-[var(--heading)]">{draft.campaignName}</h4>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={draft.status} />
          <span className="text-[12px] text-[var(--body-subtle)]">{draft.createdAt}</span>
        </div>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--body)]">
          <PlatformIcon platform={draft.platform} />
          {draft.platform}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--body)]">
          <Globe className="size-3.5 text-[var(--body-subtle)]" />
          {draft.language}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--body)]">
          <DollarSign className="size-3.5 text-[var(--body-subtle)]" />
          {formatCurrency(draft.dailyBudget)}/day
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--body)]">
          <Zap className="size-3.5 text-[var(--body-subtle)]" />
          {draft.collection}
        </span>
      </div>

      {/* Preview box */}
      <div className="bg-[rgba(0,0,0,0.2)] p-3 rounded-[2px] mb-3">
        <p className="text-[12px] text-[var(--body-subtle)] uppercase tracking-wider mb-1.5">
          Preview
        </p>
        <p className="text-[14px] font-semibold text-[var(--heading)] mb-1">{draft.headline}</p>
        <p className="text-[13px] text-[var(--body)] italic leading-relaxed whitespace-pre-line">
          {draft.primaryText}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onEdit(draft)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--body)] hover:text-[var(--heading)] rounded-[2px] hover:bg-[var(--neutral-primary-medium)] transition-colors"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--body)] hover:text-[var(--sky)] rounded-[2px] hover:bg-[rgba(56,189,248,0.1)] transition-colors"
        >
          <Eye className="size-3.5" />
          Preview
        </button>
        {confirmDelete ? (
          <>
            <button
              onClick={() => {
                onDelete(draft.id);
                setConfirmDelete(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--danger)] rounded-[2px] hover:bg-[rgba(199,0,54,0.1)] transition-colors"
            >
              <Trash2 className="size-3.5" />
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[13px] text-[var(--body-subtle)] hover:text-[var(--heading)] transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--body)] hover:text-[var(--danger)] rounded-[2px] hover:bg-[rgba(199,0,54,0.1)] transition-colors"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        )}
        {draft.status !== "Approved" && (
          <button
            onClick={() => onSubmitForReview(draft.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white rounded-[2px] transition-opacity hover:opacity-90 ml-auto"
            style={BRAND_GRADIENT}
          >
            <Send className="size-3.5" />
            Submit for Review
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Tab: Budget Planner
// =============================================================================

function BudgetPlannerTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const [metrics, setMetrics] = useState<FacebookAdSummary | null>(null);

  // Simulator state
  const [fromCampaignId, setFromCampaignId] = useState<string>("");
  const [toCampaignId, setToCampaignId] = useState<string>("");
  const [shiftAmount, setShiftAmount] = useState<number>(0);
  const [simResult, setSimResult] = useState<BudgetSimResult | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [campData, metricData] = await Promise.all([
        getFacebookCampaigns(),
        getFacebookMetrics(),
      ]);
      setCampaigns(campData);
      setMetrics(metricData);
      // Init first two campaigns for simulator
      if (campData.length >= 2) {
        setFromCampaignId(campData[0].id);
        setToCampaignId(campData[1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute efficiency data
  const efficiencyData = useMemo(() => {
    return [...campaigns]
      .map((c) => ({
        ...c,
        efficiency: c.roas / (c.spend / c.spend), // roas per normalized spend, essentially ROAS
        efficiencyScore: c.roas / Math.max(c.spend / 1000, 1),
      }))
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [campaigns]);

  const totalBudget = useMemo(() => campaigns.reduce((s, c) => s + c.spend, 0), [campaigns]);
  const activeCount = useMemo(() => campaigns.filter((c) => c.status === "active").length, [campaigns]);
  const avgROAS = useMemo(() => {
    if (campaigns.length === 0) return 0;
    return campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length;
  }, [campaigns]);
  const projectedRevenue = useMemo(() => {
    return campaigns.reduce((s, c) => s + c.spend * c.roas, 0);
  }, [campaigns]);

  // Simulator
  const handleCalculateSim = useCallback(() => {
    const fromCamp = campaigns.find((c) => c.id === fromCampaignId);
    const toCamp = campaigns.find((c) => c.id === toCampaignId);

    if (!fromCamp || !toCamp || shiftAmount <= 0) {
      setSimResult(null);
      return;
    }

    if (shiftAmount > fromCamp.spend) {
      setSimResult(null);
      return;
    }

    // New spends after shift
    const fromNewSpend = fromCamp.spend - shiftAmount;
    const toNewSpend = toCamp.spend + shiftAmount;

    // Projected revenue: ROAS stays the same per campaign but applied to new spend
    // Revenue from "from" campaign drops proportionally
    const fromNewRevenue = fromNewSpend * fromCamp.roas;
    const toNewRevenue = toNewSpend * toCamp.roas;

    // Current revenue
    const fromCurrentRevenue = fromCamp.spend * fromCamp.roas;
    const toCurrentRevenue = toCamp.spend * toCamp.roas;
    const currentCombined = fromCurrentRevenue + toCurrentRevenue;
    const newCombined = fromNewRevenue + toNewRevenue;

    const delta = newCombined - currentCombined;
    const projectedNewROAS = newCombined / (fromNewSpend + toNewSpend);

    let recommendation: string;
    if (delta > 500) {
      recommendation = `Strong recommendation: shifting €${formatCurrency(shiftAmount)} from "${fromCamp.name}" to "${toCamp.name}" could increase revenue by ${formatCurrency(delta)}. Go for it.`;
    } else if (delta > 0) {
      recommendation = `Moderate gain: you'd see +${formatCurrency(delta)} in projected revenue. Worth testing.`;
    } else if (delta === 0) {
      recommendation = "No material impact expected. Keep your current allocation.";
    } else {
      recommendation = `Not recommended: this shift would decrease projected revenue by ${formatCurrency(Math.abs(delta))}. Keep budget where it is.`;
    }

    setSimResult({
      projectedROAS: projectedNewROAS,
      projectedRevenue: newCombined,
      recommendation,
    });
  }, [campaigns, fromCampaignId, toCampaignId, shiftAmount]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className={cn(CARD, "p-5 h-40 animate-pulse")}>
          <div className="h-5 w-48 rounded-[2px] bg-[rgba(255,255,255,0.04)] mb-4" />
          <div className="h-24 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        </div>
        <div className={cn(CARD, "p-5 h-80 animate-pulse")}>
          <div className="h-5 w-32 rounded-[2px] bg-[rgba(255,255,255,0.04)] mb-4" />
          <div className="h-60 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(CARD, "text-center py-16 flex flex-col items-center gap-4")}>
        <AlertTriangle className="size-8 text-[var(--danger)]" />
        <p className="text-[var(--danger)] font-semibold text-[14px]">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
          style={BRAND_GRADIENT}
        >
          Retry
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className={cn(CARD, "text-center py-20")}>
        <div className="flex flex-col items-center gap-4">
          <BarChart3 className="size-10 text-[var(--body-subtle)]" />
          <p className="text-[14px] text-[var(--body)]">No campaign data available</p>
          <p className="text-[12px] text-[var(--body-subtle)]">
            Sync your Facebook Ads account to see budget data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Budget"
          value={formatCurrency(totalBudget)}
          subValue={`${campaigns.length} campaigns`}
          icon={DollarSign}
        />
        <StatCard
          title="Active Campaigns"
          value={`${activeCount}`}
          subValue={`of ${campaigns.length} total`}
          icon={Zap}
          accent="var(--sky)"
        />
        <StatCard
          title="Avg ROAS"
          value={`${avgROAS.toFixed(2)}x`}
          subValue={avgROAS > 4 ? "Above target" : "Below target"}
          icon={Target}
          accent={avgROAS > 4 ? "var(--success)" : "var(--warning)"}
        />
        <StatCard
          title="Projected Revenue"
          value={formatCurrency(projectedRevenue)}
          subValue="Based on current spend"
          icon={TrendingUp}
          accent="var(--purple)"
        />
      </div>

      {/* Budget Allocation */}
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[16px] font-semibold text-[var(--heading)] mb-4">
          Budget Allocation by Campaign
        </h3>
        <div className="space-y-3">
          {campaigns.map((camp, idx) => {
            const pct = totalBudget > 0 ? (camp.spend / totalBudget) * 100 : 0;
            const color = BAR_COLORS[idx % BAR_COLORS.length];
            return (
              <div key={camp.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium text-[var(--body)]">{camp.name}</span>
                  <span className="text-[13px] font-semibold text-[var(--heading)]">
                    {formatCurrency(camp.spend)} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 rounded-[1px] bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full rounded-[1px] transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 1)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROAS vs Spend Table */}
      <div className={cn(CARD, "overflow-x-auto")}>
        <div className="p-5 pb-0">
          <h3 className="text-[16px] font-semibold text-[var(--heading)] mb-1">
            ROAS vs Spend Efficiency
          </h3>
          <p className="text-[12px] text-[var(--body-subtle)]">
            Sorted by efficiency (ROAS per EUR 1,000 spend). Top 3 highlighted.
          </p>
        </div>
        <table className="w-full text-[14px] mt-4">
          <thead>
            <tr className="bg-[rgba(255,255,255,0.02)] border-b border-t border-[var(--border-default)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                Campaign
              </th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                Daily Spend
              </th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                ROAS
              </th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider">
                Efficiency
              </th>
            </tr>
          </thead>
          <tbody>
            {efficiencyData.map((camp, idx) => {
              const isTop3 = idx < 3;
              return (
                <tr
                  key={camp.id}
                  className={cn(
                    "border-b border-[var(--border-default)] transition-colors hover:bg-[rgba(255,255,255,0.02)]",
                  )}
                  style={
                    isTop3
                      ? { borderLeft: "3px solid var(--success)" }
                      : undefined
                  }
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={camp.status} />
                      <span className="text-[14px] font-medium text-[var(--heading)]">
                        {camp.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[14px] text-[var(--body)] font-mono">
                    {formatCurrency(camp.spend)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[14px] font-semibold text-[var(--heading)]">
                    {camp.roas.toFixed(2)}x
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={cn(
                        "text-[14px] font-mono",
                        isTop3 ? "text-[var(--success)] font-semibold" : "text-[var(--body)]",
                      )}
                    >
                      {camp.efficiencyScore.toFixed(3)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Budget Simulator */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex items-center gap-2 mb-1">
          <PieChart className="size-4 text-[var(--brand)]" />
          <h3 className="text-[16px] font-semibold text-[var(--heading)]">Budget Simulator</h3>
        </div>
        <p className="text-[12px] text-[var(--body-subtle)] mb-5">
          Test reallocation scenarios and see projected impact
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* From Campaign */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[var(--body)]">Shift budget FROM</label>
            <select
              value={fromCampaignId}
              onChange={(e) => setFromCampaignId(e.target.value)}
              className={cn(
                "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors appearance-none",
                "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                "focus:border-[var(--brand)]",
              )}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1a1a1a] text-[var(--heading)]">
                  {c.name} (ROAS: {c.roas.toFixed(1)}x, Spend: {formatCurrency(c.spend)})
                </option>
              ))}
            </select>
          </div>

          {/* To Campaign */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[var(--body)]">Shift budget TO</label>
            <select
              value={toCampaignId}
              onChange={(e) => setToCampaignId(e.target.value)}
              className={cn(
                "w-full px-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors appearance-none",
                "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                "focus:border-[var(--brand)]",
              )}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1a1a1a] text-[var(--heading)]">
                  {c.name} (ROAS: {c.roas.toFixed(1)}x, Spend: {formatCurrency(c.spend)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-5 space-y-1.5">
          <label className="text-[13px] font-medium text-[var(--body)]">
            Amount to Shift
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[var(--body-subtle)]">
                EUR
              </span>
              <input
                type="number"
                value={shiftAmount || ""}
                onChange={(e) => setShiftAmount(parseFloat(e.target.value) || 0)}
                placeholder="1000"
                min={0}
                className={cn(
                  "w-full pl-12 pr-3 py-2.5 text-[14px] text-[var(--heading)] rounded-[2px] border outline-none transition-colors",
                  "bg-[var(--neutral-secondary-medium)] border-[var(--border-default-medium)]",
                  "placeholder:text-[var(--body-subtle)] focus:border-[var(--brand)]",
                )}
              />
            </div>
            <button
              onClick={handleCalculateSim}
              disabled={!fromCampaignId || !toCampaignId || fromCampaignId === toCampaignId || shiftAmount <= 0}
              className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px] transition-opacity disabled:opacity-40"
              style={BRAND_GRADIENT}
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Result */}
        {simResult && (
          <div className="p-4 rounded-[2px] animate-fade-in" style={BRAND_SOFT_STYLE}>
            <h4 className="text-[14px] font-semibold text-[var(--heading)] mb-3">
              Simulation Results
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-[12px] text-[var(--body-subtle)] mb-0.5">
                  Projected New ROAS
                </p>
                <p className="text-[20px] font-semibold text-[var(--brand)]">
                  {simResult.projectedROAS.toFixed(2)}x
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[var(--body-subtle)] mb-0.5">
                  Projected Revenue
                </p>
                <p className="text-[20px] font-semibold text-[var(--fg-purple)]">
                  {formatCurrency(simResult.projectedRevenue)}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[var(--body-subtle)] mb-0.5">
                  Revenue Impact
                </p>
                <p
                  className={cn(
                    "text-[20px] font-semibold",
                    simResult.projectedRevenue - projectedRevenue >= 0
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]",
                  )}
                >
                  {simResult.projectedRevenue - projectedRevenue >= 0 ? "+" : ""}
                  {formatCurrency(simResult.projectedRevenue - projectedRevenue)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {simResult.projectedRevenue - projectedRevenue > 0 ? (
                <TrendingUp className="size-4 text-[var(--success)] shrink-0 mt-0.5" />
              ) : simResult.projectedRevenue - projectedRevenue < 0 ? (
                <TrendingDown className="size-4 text-[var(--danger)] shrink-0 mt-0.5" />
              ) : (
                <Clock className="size-4 text-[var(--body-subtle)] shrink-0 mt-0.5" />
              )}
              <p className="text-[14px] text-[var(--body)] leading-relaxed">
                {simResult.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Tab: Creative Library
// =============================================================================

function CreativeLibraryTab() {
  const [creatives] = useState<CreativePlaceholder[]>(MOCK_CREATIVES);

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-[var(--body)]">
          {creatives.length} creatives in your library
        </p>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[var(--heading)] rounded-[2px] border border-[var(--border-default)] hover:bg-[var(--neutral-primary-medium)] transition-colors">
          <Plus className="size-4" />
          Upload New Creative
        </button>
      </div>

      {creatives.length === 0 ? (
        <div className={cn(CARD, "text-center py-20")}>
          <div className="flex flex-col items-center gap-4">
            <Image className="size-10 text-[var(--body-subtle)]" />
            <p className="text-[14px] text-[var(--body)]">No creatives in your library</p>
            <p className="text-[12px] text-[var(--body-subtle)]">
              Upload images and videos to use in your ad campaigns
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[var(--heading)] rounded-[2px] border border-[var(--border-default)] hover:bg-[var(--neutral-primary-medium)] transition-colors">
              <Plus className="size-4" />
              Upload Creative
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
          {creatives.map((creative) => (
            <div
              key={creative.id}
              className={cn(
                CARD,
                "p-3 flex flex-col items-center text-center hover:border-[var(--border-brand-subtle)] transition-colors group cursor-pointer",
              )}
            >
              {/* Image placeholder */}
              <div className="w-full aspect-[4/3] rounded-[2px] bg-[rgba(0,0,0,0.3)] flex items-center justify-center mb-3 group-hover:bg-[rgba(0,0,0,0.2)] transition-colors">
                <Image className="size-10 text-[var(--body-subtle)] group-hover:text-[var(--brand)] transition-colors" />
              </div>

              {/* Info */}
              <p className="text-[14px] font-medium text-[var(--heading)] mb-1 group-hover:text-[var(--brand)] transition-colors">
                {creative.name}
              </p>
              <span
                className="inline-block text-[11px] px-2 py-0.5 rounded-[2px] font-medium"
                style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "var(--purple)" }}
              >
                {creative.collection}
              </span>
              <p className="text-[11px] text-[var(--body-subtle)] mt-2">{creative.dimensions}</p>
            </div>
          ))}

          {/* Upload placeholder card */}
          <div
            className={cn(
              CARD,
              "p-3 flex flex-col items-center justify-center text-center border-dashed hover:border-[var(--border-brand-subtle)] transition-colors cursor-pointer min-h-[240px]",
            )}
          >
            <div className="size-10 rounded-[2px] bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-3">
              <Plus className="size-5 text-[var(--body-subtle)]" />
            </div>
            <p className="text-[14px] font-medium text-[var(--body)] mb-1">Upload New</p>
            <p className="text-[12px] text-[var(--body-subtle)]">JPG, PNG, or MP4</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<CampaignsTab>("drafts");

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--heading)]">Campaigns & Ads</h1>
        <p className="text-[14px] text-[var(--body)] mt-1">
          Create, preview, and manage your ad campaigns
        </p>
      </div>

      {/* Tab Navigation — underline variant */}
      <div className="flex gap-0 border-b border-[var(--border-default)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-4 text-[14px] font-medium transition-colors relative",
                isActive
                  ? "text-[var(--brand)]"
                  : "text-[var(--body)] hover:text-[var(--heading)]",
              )}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: "var(--brand)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "drafts" && <AdDraftsTab />}
      {activeTab === "budget" && <BudgetPlannerTab />}
      {activeTab === "library" && <CreativeLibraryTab />}
    </div>
  );
}
