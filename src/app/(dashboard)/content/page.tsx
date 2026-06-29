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

// ============================================================
// Component
// ============================================================

export default function ContentPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostTab>("all");
  const [generatorPrompt, setGeneratorPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

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

  const handleGenerate = () => {
    const samples = [
      "New arrivals are here! Shop the latest Summer Breeze collection — lightweight linen dresses perfect for beach days and evening strolls. Tap the link in bio to explore. #TallinnDoll #SummerBreeze",
      "Behind the Design: Our Linen Wrap Dress is crafted from 100% GOTS-certified organic linen, hand-stitched in our Tallinn atelier. Every piece supports local artisans. #EthicalFashion #LinenLuxe",
      "Customer Love: \"The Classic Silk Blouse is the most versatile piece in my wardrobe!\" — Maria K. Rated 4.9/5 by 340+ customers. Shop now at tallinndoll.com #ClassicCore",
    ];
    setGeneratedContent(samples[Math.floor(Math.random() * samples.length)]);
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

      {/* AI Generator */}
      <div className="p-5 bg-[var(--brand-softer)] border border-[var(--border-brand-subtle)] rounded-[2px]">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--heading)]">
              AI Content Generator
            </h2>
            <p className="text-[14px] text-[var(--body)] mt-0.5">
              Generate social media posts from your bestselling products
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <textarea
            value={generatorPrompt}
            onChange={(e) => setGeneratorPrompt(e.target.value)}
            placeholder="Describe the post you want to create..."
            className="flex-1 min-h-[80px] px-4 py-3 text-[14px] rounded-[2px] focus:outline-none resize-y placeholder:text-[var(--body-subtle)]"
            style={{
              backgroundColor: "var(--neutral-secondary-medium)",
              border: "1px solid var(--border-default-medium)",
              color: "var(--heading)",
            }}
            rows={4}
          />
          <button
            onClick={handleGenerate}
            className="shrink-0 self-end inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={GRADIENT_BRAND}
          >
            <Sparkles className="h-4 w-4" />
            Generate Post
          </button>
        </div>

        {generatedContent && (
          <div className={cn(CARD, "mt-4 p-4")}>
            <p className="text-[14px] text-[var(--body)]">{generatedContent}</p>
            <div className="flex items-center gap-2 mt-3">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[var(--body-subtle)] rounded-[2px] border border-[var(--border-default)] hover:text-[var(--heading)] transition-colors"
                style={{ backgroundColor: "transparent" }}>
                <PenSquare className="h-3.5 w-3.5" />
                Edit
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[var(--body-subtle)] rounded-[2px] border border-[var(--border-default)] hover:text-[var(--heading)] transition-colors"
                style={{ backgroundColor: "transparent" }}>
                <Send className="h-3.5 w-3.5" />
                Use
              </button>
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
            onClick={() => setGeneratorPrompt("Promote the Summer Breeze collection")}
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
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-semibold text-[var(--heading)] mb-1.5">
                  {post.title}
                </h3>

                {/* Content Preview */}
                <p className="text-[14px] text-[var(--body)] line-clamp-2 mb-3">
                  {post.content}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--body-subtle)]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{dateDisplay}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
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
