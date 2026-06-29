"use client";

import { useState, useEffect, useMemo } from "react";
import { getScheduledPosts } from "@/services/agentService";
import type { ScheduledPost } from "@/types/index";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  PenSquare,
  Sparkles,
  Send,
  Calendar,
  Clock,
  Globe,
  MessageSquare,
  Share2,
  Edit,
  Trash2,
  Eye,
  Plus,
  FileText,
  Package,
  Copy,
  Check,
  Languages,
} from "lucide-react";

// ============================================================
// Constants
// ============================================================

const CARD =
  "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

type PostTab = "all" | "scheduled" | "draft" | "published";

const TABS: { key: PostTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
];

const COLLECTIONS = [
  "Summer Breeze",
  "Linen Luxe",
  "Evening Bloom",
  "Urban Edge",
  "Boho Spirit",
  "Classic Core",
  "Coastal Charm",
  "Minimal Muse",
  "Bold Statement",
  "Eco Essence",
];

const PLATFORMS = [
  "Facebook Feed",
  "Instagram Feed",
  "Facebook Story",
  "Instagram Story",
];

const POST_TYPES = [
  "New Collection Launch",
  "Sale Announcement",
  "Behind the Scenes",
  "Styling Tips",
  "Customer Spotlight",
  "Seasonal Promotion",
];

const LANGUAGES = ["Estonian", "English"] as const;
type Language = (typeof LANGUAGES)[number];

const PLATFORM_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; color: string }
> = {
  Instagram: {
    icon: Globe,
    bg: "var(--brand-softer)",
    color: "var(--brand)",
  },
  Facebook: {
    icon: MessageSquare,
    bg: "rgba(139,92,246,0.12)",
    color: "var(--purple)",
  },
  TikTok: {
    icon: Share2,
    bg: "rgba(56,189,248,0.12)",
    color: "var(--sky)",
  },
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  scheduled: {
    bg: "var(--warning-soft)",
    text: "var(--warning)",
    border: "var(--border-warning-subtle)",
    label: "Scheduled",
  },
  draft: {
    bg: "var(--neutral-primary-medium)",
    text: "var(--body-subtle)",
    border: "var(--border-default)",
    label: "Draft",
  },
  published: {
    bg: "var(--success-soft)",
    text: "var(--success)",
    border: "var(--border-success-subtle)",
    label: "Published",
  },
};

const GRADIENT_BRAND: React.CSSProperties = {
  background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)",
};

const GRADIENT_BRAND_DIM: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(200,57,156,0.25) 0%, rgba(124,58,237,0.25) 100%)",
};

// ============================================================
// Helpers
// ============================================================

interface GeneratedCopy {
  headline: string;
  primaryText: string;
  hashtags: string;
  cta: string;
}

/** Best-effort parse of the AI response into structured fields. */
function parseGeneratedCopy(raw: string): GeneratedCopy {
  // Clean markdown and bold formatting
  let text = raw
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .trim();

  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let headline = "";
  let primaryText = "";
  let hashtags = "";
  let cta = "";

  // Try to find structured sections
  for (const line of lines) {
    const l = line;

    // Headline patterns
    if (/^(1[.)]\s*|headline:?\s*|pealkiri:?\s*)/i.test(l)) {
      headline = l.replace(/^(1[.)]\s*|headline:?\s*|pealkiri:?\s*)/i, "").trim();
      continue;
    }
    // Primary text patterns
    if (/^(2[.)]\s*|primary\s*text:?\s*|põhitekst:?\s*|body:?\s*|copy:?\s*)/i.test(l)) {
      primaryText = l.replace(/^(2[.)]\s*|primary\s*text:?\s*|põhitekst:?\s*|body:?\s*|copy:?\s*)/i, "").trim();
      continue;
    }
    // Hashtag patterns
    if (/^(3[.)]\s*|hashtags:?\s*|sildid:?\s*|tags:?\s*)/i.test(l)) {
      hashtags = l.replace(/^(3[.)]\s*|hashtags:?\s*|sildid:?\s*|tags:?\s*)/i, "").trim();
      continue;
    }
    // CTA patterns
    if (/^(4[.)]\s*|call.to.action:?\s*|cta:?\s*|üleskutse:?\s*)/i.test(l)) {
      cta = l.replace(/^(4[.)]\s*|call.to.action:?\s*|cta:?\s*|üleskutse:?\s*)/i, "").trim();
      continue;
    }

    // Auto-detect: lines starting with # are hashtag lines
    if (/^#/.test(l) && l.split(/\s+/).every((w) => w.startsWith("#"))) {
      hashtags = hashtags ? `${hashtags} ${l}` : l;
      continue;
    }

    // Auto-detect: short line (under 60 chars) without hashtags → likely headline
    if (!headline && l.length <= 60 && !/#/.test(l)) {
      headline = l;
      continue;
    }

    // Auto-detect: line with "shop", "visit", "discover", "explore", "osta", "avasta", "tutvu", "külasta" → CTA
    if (/\b(shop|visit|discover|explore|buy|get|osta|avasta|tutvu|külasta|vaata|telli)\b/i.test(l) && l.length <= 100) {
      cta = l;
      continue;
    }

    // Everything else → primary text
    primaryText = primaryText ? `${primaryText}\n${l}` : l;
  }

  // Clean hashtags: ensure they have # prefix
  if (hashtags && !hashtags.startsWith("#")) {
    hashtags = hashtags
      .split(/[\s,]+/)
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .join(" ");
  }

  // Fallback: if parsing produced nothing useful, use first short line as headline, rest as primary
  if (!headline && !primaryText && !hashtags && !cta) {
    const cleanLines = text.split("\n").filter((l) => l.trim());
    if (cleanLines.length === 1) {
      primaryText = cleanLines[0].trim();
    } else if (cleanLines.length >= 2) {
      headline = cleanLines[0].trim().slice(0, 60);
      primaryText = cleanLines.slice(1).join("\n").trim();
    }
  }

  return { headline, primaryText, hashtags, cta };
}

/** Simple heuristic: detect Estonian by presence of Estonian-specific characters. */
function detectLanguage(text: string): "Estonian" | "English" {
  const estonianChars = /[äöüõÄÖÜÕ]/;
  const estonianWords = /\b(ja|on|ei|see|mis|see|oma|ning|kui|aga|kes|seda|selle|kõik|ole|eks|eesti|moel|ilu|rõivas|kvaliteet|elegantne|luksuslik|müük|uudiskiri|kampaania|kollektsioon|pood|osta|tooteid|klient|stiil|moes|rõivad)\b/i;
  if (estonianChars.test(text) || estonianWords.test(text)) return "Estonian";
  return "English";
}

// ============================================================
// Select / Input Styles
// ============================================================

const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: "var(--neutral-secondary-medium)",
  border: "1px solid var(--border-default-medium)",
  color: "var(--heading)",
};

const SELECT_CLASSES =
  "w-full px-3 py-2 text-[14px] rounded-[2px] focus:outline-none appearance-none cursor-pointer";

// ============================================================
// Component
// ============================================================

export default function ContentPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostTab>("all");

  // --- Generator state ---
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [postType, setPostType] = useState(POST_TYPES[0]);
  const [language, setLanguage] = useState<Language>("Estonian");
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedCopy | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Translation state ---
  const [translatingPosts, setTranslatingPosts] = useState<Set<string>>(new Set());
  const [postTranslations, setPostTranslations] = useState<Record<string, string>>({});
  const [expandedTranslations, setExpandedTranslations] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getScheduledPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") return posts;
    return posts.filter((p) => p.status === activeFilter);
  }, [posts, activeFilter]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      draft: posts.filter((p) => p.status === "draft").length,
      published: posts.filter((p) => p.status === "published").length,
    }),
    [posts]
  );

  // ============================================================
  // Generate Copy via DeepSeek
  // ============================================================

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedResult(null);
    try {
      const systemPrompt = `You are a professional social media copywriter for TallinnDoll, a premium Estonian fashion brand. Brand voice: elegant, understated, Nordic minimalism. Rules: 1) Write in Estonian using formal 'Teie' form. 2) Never use words like 'odav', 'allahindlus', 'soodukas'. 3) Use premium fashion vocabulary: elegants, ajatu, kvaliteet, naturaalne, luksuslik. 4) Keep Facebook posts under 150 characters, Instagram under 125 characters. 5) Include relevant hashtags in Estonian. 6) For Stories, provide a 3-5 word overlay text plus a longer caption suggestion.`;

      const userPrompt = `Create social media copy for:
- Product/Collection: ${collection}
- Platform: ${platform}
- Post Type: ${postType}
- Language: ${language}

${language === "Estonian" ? "Write ALL copy in Estonian." : "Write in English."}

Provide: 1) Headline (max 40 chars), 2) Primary text, 3) 3-5 relevant Estonian hashtags, 4) Call-to-action`;

      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "API error");

      const parsed = parseGeneratedCopy(json.result);
      setGeneratedResult(parsed);
    } catch (err) {
      setGeneratedResult({
        headline: "",
        primaryText: err instanceof Error ? err.message : "Generation failed. Please try again.",
        hashtags: "",
        cta: "",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedResult) return;
    const text = [
      generatedResult.headline,
      generatedResult.primaryText,
      generatedResult.hashtags,
      generatedResult.cta,
    ]
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreatePost = () => {
    if (!generatedResult) return;
    const newPost: ScheduledPost = {
      id: `ai-${Date.now()}`,
      title: generatedResult.headline || `${collection} — ${postType}`,
      content: [
        generatedResult.primaryText,
        generatedResult.hashtags,
        generatedResult.cta,
      ]
        .filter(Boolean)
        .join("\n\n"),
      platform: platform.includes("Instagram") ? "Instagram" : "Facebook",
      scheduledDate: new Date().toISOString(),
      status: "draft",
      productRef: collection,
    };
    setPosts((prev) => [newPost, ...prev]);
    setGeneratedResult(null);
    // Switch to "All" or "Drafts" tab so user can see the new post
    setActiveFilter("draft");
    // Scroll to top after render
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  // ============================================================
  // Translate Post
  // ============================================================

  const handleTranslate = async (postId: string, postTitle: string, postContent: string) => {
    setTranslatingPosts((prev) => new Set(prev).add(postId));
    try {
      const systemPrompt =
        "You are a professional translator for TallinnDoll, a premium Estonian fashion brand. Translate the following social media post from English to Estonian. Use formal 'Teie' form. Never use words like 'odav', 'allahindlus', 'soodukas'. Use premium fashion vocabulary: elegants, ajatu, kvaliteet, naturaalne, luksuslik. Preserve hashtags but translate them to Estonian where appropriate.";
      const userPrompt = `Translate this post to Estonian:\n\nTitle: ${postTitle}\n\nContent: ${postContent}`;

      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Translation failed");

      setPostTranslations((prev) => ({ ...prev, [postId]: json.result }));
      setExpandedTranslations((prev) => new Set(prev).add(postId));
    } catch {
      // silently ignore translation errors
    } finally {
      setTranslatingPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleReplaceWithTranslation = (postId: string) => {
    const translation = postTranslations[postId];
    if (!translation) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, content: translation, title: translation.split("\n")[0]?.slice(0, 60) || p.title } : p
      )
    );
    // Clean up translation state for this post
    setPostTranslations((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setExpandedTranslations((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  };

  // ============================================================
  // Error State
  // ============================================================

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={cn(CARD, "text-center py-16")}>
          <p className="text-[14px] font-semibold text-[var(--danger)] mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={GRADIENT_BRAND}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Page Title */}
      <h1 className="text-[28px] font-semibold text-[var(--heading)]">
        Content &amp; Posts
      </h1>

      {/* AI Copy Generator */}
      <div className="p-5 bg-[var(--brand-softer)] border border-[var(--border-brand-subtle)] rounded-[2px]">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--heading)]">
              AI Content Generator
            </h2>
            <p className="text-[14px] text-[var(--body)] mt-0.5">
              Generate Estonian social media copy powered by AI
            </p>
          </div>
        </div>

        {/* Input Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {/* Collection */}
          <div className="relative">
            <label className="block text-[12px] font-medium text-[var(--body-subtle)] mb-1">
              Product / Collection
            </label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className={SELECT_CLASSES}
              style={INPUT_STYLE}
            >
              {COLLECTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div className="relative">
            <label className="block text-[12px] font-medium text-[var(--body-subtle)] mb-1">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={SELECT_CLASSES}
              style={INPUT_STYLE}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Post Type */}
          <div className="relative">
            <label className="block text-[12px] font-medium text-[var(--body-subtle)] mb-1">
              Post Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className={SELECT_CLASSES}
              style={INPUT_STYLE}
            >
              {POST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--body-subtle)] mb-1">
              Language
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "px-3 py-2 text-[14px] font-medium rounded-[2px] transition-colors",
                    language === lang
                      ? "text-white"
                      : "text-[var(--body-subtle)] hover:text-[var(--heading)]"
                  )}
                  style={
                    language === lang
                      ? GRADIENT_BRAND
                      : {
                          backgroundColor: "var(--neutral-secondary-medium)",
                          border: "1px solid var(--border-default-medium)",
                        }
                  }
                >
                  {lang === "Estonian" ? "🇪🇪" : "🇬🇧"} {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white rounded-[2px] transition-opacity disabled:opacity-60"
              style={GRADIENT_BRAND}
            >
              <Sparkles className="h-4 w-4" />
              {generating ? "Generating..." : "Generate Copy"}
            </button>
          </div>
        </div>

        {/* Generated Output */}
        {generatedResult && (
          <div className={cn(CARD, "p-4 mt-2")}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border-default)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="text-[12px] font-semibold text-[var(--fg-brand-strong)] uppercase tracking-wider">
                AI Generated {language === "Estonian" ? "(Estonian)" : "(English)"}
              </span>
            </div>

            {/* Headline */}
            {generatedResult.headline && (
              <div className="mb-3">
                <span className="block text-[10px] font-bold text-[var(--body-subtle)] uppercase tracking-widest mb-1">Headline</span>
                <h3 className="text-[18px] font-semibold text-[var(--heading)] leading-snug">
                  {generatedResult.headline}
                </h3>
              </div>
            )}

            {/* Primary Text */}
            {generatedResult.primaryText && (
              <div className="mb-3">
                <span className="block text-[10px] font-bold text-[var(--body-subtle)] uppercase tracking-widest mb-1">Body Copy</span>
                <p className="text-[14px] text-[var(--body)] leading-relaxed whitespace-pre-line">
                  {generatedResult.primaryText}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {generatedResult.hashtags && (
              <div className="mb-3">
                <span className="block text-[10px] font-bold text-[var(--body-subtle)] uppercase tracking-widest mb-1">Hashtags</span>
                <p className="text-[13px] text-[var(--brand)] font-medium leading-relaxed">
                  {generatedResult.hashtags}
                </p>
              </div>
            )}

            {/* CTA */}
            {generatedResult.cta && (
              <div className="mb-3">
                <span className="block text-[10px] font-bold text-[var(--body-subtle)] uppercase tracking-widest mb-1">Call to Action</span>
                <div className="inline-block px-3 py-1.5 rounded-[2px] text-[13px] font-semibold text-white" style={GRADIENT_BRAND_DIM}>
                  {generatedResult.cta}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-default)]">
              <button
                onClick={handleCopyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[var(--body)] rounded-[2px] border border-[var(--border-default)] hover:text-[var(--heading)] hover:bg-[var(--neutral-secondary-medium)] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={handleCreatePost}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-[2px] transition-opacity hover:opacity-90"
                style={GRADIENT_BRAND}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Post
              </button>
              <span className="text-[11px] text-[var(--body-subtle)] ml-1">
                Post will be saved as Draft
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-0 border-b border-[var(--border-default)]">
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-3 text-[14px] font-medium transition-colors relative",
                isActive
                  ? "text-[var(--brand)]"
                  : "text-[var(--body-subtle)] hover:text-[var(--heading)]"
              )}
            >
              {tab.label}
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: isActive
                    ? "var(--brand-softer)"
                    : "var(--neutral-primary-medium)",
                  color: isActive ? "var(--brand)" : "var(--body-subtle)",
                }}
              >
                {counts[tab.key]}
              </span>
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

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(CARD, "h-36 animate-pulse")}
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        /* Empty State */
        <div className={cn(CARD, "text-center py-16")}>
          <Package className="h-12 w-12 mx-auto mb-4 text-[var(--body-subtle)] opacity-30" />
          <p className="text-[16px] font-semibold text-[var(--heading)]">
            No posts yet
          </p>
          <p className="text-[14px] text-[var(--body)] mt-1 mb-4">
            Generate your first post with AI
          </p>
          <button
            onClick={() =>
              setCollection("Summer Breeze")
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={GRADIENT_BRAND}
          >
            <Sparkles className="h-4 w-4" />
            Generate your first post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const platformCfg =
              PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.Instagram;
            const PlatIcon = platformCfg.icon;
            const statusCfg =
              STATUS_STYLES[post.status] || STATUS_STYLES.draft;
            const dateDisplay = format(
              new Date(post.scheduledDate),
              "MMMM dd, yyyy 'at' HH:mm"
            );
            const postLanguage = detectLanguage(post.title + " " + post.content);
            const isEnglish = postLanguage === "English";
            const isTranslating = translatingPosts.has(post.id);
            const translation = postTranslations[post.id];
            const isTranslationExpanded = expandedTranslations.has(post.id);

            return (
              <div key={post.id} className={cn(CARD, "p-4")}>
                {/* Top: Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-semibold border"
                    style={{
                      backgroundColor: platformCfg.bg,
                      color: platformCfg.color,
                      borderColor: platformCfg.color,
                    }}
                  >
                    <PlatIcon className="h-2.5 w-2.5" />
                    {post.platform}
                  </span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-semibold border"
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.text,
                      borderColor: statusCfg.border,
                    }}
                  >
                    {statusCfg.label}
                  </span>
                  {/* Language Flag */}
                  <span className="text-[14px] leading-none" title={postLanguage}>
                    {postLanguage === "Estonian" ? "🇪🇪" : "🇬🇧"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-semibold text-[var(--heading)] mb-1.5">
                  {post.title}
                </h3>

                {/* Content Preview */}
                <p className="text-[14px] text-[var(--body)] line-clamp-2 mb-3">
                  {post.content}
                </p>

                {/* Translation (expanded) */}
                {isTranslationExpanded && translation && (
                  <div
                    className="mb-3 p-3 rounded-[2px] border text-[14px] text-[var(--body)] italic"
                    style={{
                      backgroundColor: "var(--brand-softer)",
                      borderColor: "var(--border-brand-subtle)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-[var(--brand)] uppercase tracking-wider">
                      <Languages className="h-3 w-3" />
                      Translation (Estonian)
                    </div>
                    <p className="whitespace-pre-wrap">{translation}</p>
                    <button
                      onClick={() => handleReplaceWithTranslation(post.id)}
                      className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 text-[11px] font-semibold text-white rounded-[2px]"
                      style={GRADIENT_BRAND}
                    >
                      <Check className="h-3 w-3" />
                      Replace with Translation
                    </button>
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--body-subtle)]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{dateDisplay}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Translate button for English posts */}
                    {isEnglish && (
                      <button
                        onClick={() =>
                          handleTranslate(post.id, post.title, post.content)
                        }
                        disabled={isTranslating || isTranslationExpanded}
                        title="Tõlgi eesti keelde"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px] font-medium text-[var(--brand)] hover:underline transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <Languages className="h-3 w-3" />
                        {isTranslating ? "Translating..." : "Tõlgi eesti keelde"}
                      </button>
                    )}
                    <button
                      title="Edit"
                      className="p-1.5 rounded-[2px] text-[var(--body-subtle)] hover:text-[var(--heading)] transition-colors"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete"
                      className="p-1.5 rounded-[2px] text-[var(--body-subtle)] hover:text-[var(--danger)] transition-colors"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
