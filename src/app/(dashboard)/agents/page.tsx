"use client";

import { useState, useEffect, useMemo } from "react";
import { getAgentActions, getAgentMetrics } from "@/services/agentService";
import type { AgentAction, AgentMetrics } from "@/types/index";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Bot, Zap, PenSquare, Package, Sparkles,
  CheckCircle2, Loader2, XCircle, Clock, Play, Activity,
} from "lucide-react";

// ============================================================
// Design constants
// ============================================================

const CARD = "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

type AgentFilterType = "all" | "ad" | "optimizer" | "post" | "inventory";

type AgentType = "ad" | "optimizer" | "post" | "inventory";

// ============================================================
// Agent type configuration
// ============================================================

const AGENT_META: Record<AgentType, { icon: React.ElementType; label: string; bg: string; iconColor: string }> = {
  ad:        { icon: Bot,       label: "Ad Agent",        bg: "var(--brand-softer)", iconColor: "var(--brand)" },
  optimizer: { icon: Zap,       label: "Optimizer",       bg: "rgba(139,92,246,0.12)", iconColor: "#8B5CF6" },
  post:      { icon: PenSquare, label: "Post Agent",      bg: "rgba(236,72,153,0.12)", iconColor: "#EC4899" },
  inventory: { icon: Package,   label: "Inventory Agent", bg: "rgba(20,184,166,0.12)", iconColor: "#14B8A6" },
};

// ============================================================
// Status configuration
// ============================================================

const STATUS_META: Record<string, { icon: React.ElementType; color: string; dot: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "var(--success)", dot: "var(--success)", label: "Completed" },
  running:   { icon: Loader2,     color: "var(--warning)", dot: "var(--warning)", label: "Running" },
  pending:   { icon: Clock,       color: "var(--body-subtle)", dot: "var(--body-subtle)", label: "Pending" },
  failed:    { icon: XCircle,     color: "var(--danger)", dot: "var(--danger)", label: "Failed" },
};

// ============================================================
// Filter tabs definition
// ============================================================

const FILTER_TABS: { key: AgentFilterType; label: string; icon: React.ElementType }[] = [
  { key: "all",       label: "All",             icon: Activity },
  { key: "ad",        label: "Ad Agent",        icon: Bot },
  { key: "optimizer", label: "Optimizer",       icon: Zap },
  { key: "post",      label: "Post Agent",      icon: PenSquare },
  { key: "inventory", label: "Inventory Agent", icon: Package },
];

// ============================================================
// Skeleton components
// ============================================================

function MetricSkeleton() {
  return (
    <div className={`${CARD} p-4 animate-pulse space-y-3`}>
      <div className="h-3 w-2/3 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
      <div className="h-7 w-1/2 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
    </div>
  );
}

function FeedItemSkeleton() {
  return (
    <div className={`${CARD} p-4 animate-pulse flex gap-4`}>
      <div className="h-10 w-10 rounded-[2px] shrink-0 bg-[var(--neutral-primary-medium)]" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-3/4 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
        <div className="h-3 w-full rounded-[2px] bg-[var(--neutral-primary-medium)]" />
        <div className="h-3 w-1/3 rounded-[2px] bg-[var(--neutral-primary-medium)]" />
      </div>
    </div>
  );
}

// ============================================================
// Page
// ============================================================

export default function AgentsPage() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AgentFilterType>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [acts, mets] = await Promise.all([getAgentActions(), getAgentMetrics()]);
        setActions(acts);
        setMetrics(mets);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ---- Filtering ----

  const filteredActions = useMemo(() => {
    if (filter === "all") return actions;
    return actions.filter((a) => a.agentType === filter);
  }, [actions, filter]);

  // ---- Error state ----

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`${CARD} text-center py-16`}>
          <p className="text-[14px] text-[var(--danger)] font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={{ background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Render ----

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-[var(--heading)]">
            Agent Activity
          </h1>
          <p className="text-[14px] text-[var(--body)] mt-1">Your AI agents at work</p>
        </div>
        <button
          onClick={() => alert("Agent triggered")}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
          style={{ background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)" }}
        >
          <Play className="h-4 w-4" />
          Run Agent
        </button>
      </div>

      {/* Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <MetricSkeleton key={i} />)}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Actions",     value: metrics.totalActions,      icon: Activity,   color: "var(--brand)" },
            { label: "Ads Created",       value: metrics.adsCreated,        icon: Bot,        color: "#8B5CF6" },
            { label: "Posts Scheduled",   value: metrics.postsScheduled,    icon: PenSquare,  color: "#EC4899" },
            { label: "Budget Saved",      value: formatCurrency(metrics.budgetSaved), icon: Sparkles, color: "var(--success)", valueColor: "var(--success)" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${CARD} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--brand-softer)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                  <span className="text-[11px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <p
                  className="text-[24px] font-semibold text-[var(--heading)]"
                  style={(card as any).valueColor ? { color: (card as any).valueColor } : undefined}
                >
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Filter Tabs — underline variant */}
      <div className="flex flex-wrap border-b border-[var(--border-default)]">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-3 text-[14px] font-medium transition-colors relative",
                isActive ? "text-[var(--brand)]" : "text-[var(--body-subtle)] hover:text-[var(--body)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
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

      {/* Activity Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <FeedItemSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action) => {
            const agentMeta = AGENT_META[action.agentType];
            const AgentIcon = agentMeta.icon;
            const statusMeta = STATUS_META[action.status];
            const StatusIcon = statusMeta.icon;
            const timestamp = formatDistanceToNow(new Date(action.timestamp), { addSuffix: true });

            return (
              <div key={action.id} className={`${CARD} p-4`}>
                <div className="flex items-start gap-4">
                  {/* Left: Agent icon */}
                  <div
                    className="w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: agentMeta.bg }}
                  >
                    <AgentIcon className="h-4 w-4" style={{ color: agentMeta.iconColor }} />
                  </div>

                  {/* Center: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[14px] font-semibold text-[var(--heading)]">{action.title}</h3>
                    </div>
                    <p className="text-[13px] text-[var(--body)] mt-1">{action.description}</p>

                    {/* Metrics chips */}
                    {action.metrics && action.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {action.metrics.map((m) => (
                          <span
                            key={m.label}
                            className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] border border-[var(--border-default)]"
                            style={{ backgroundColor: "var(--neutral-primary-medium)", color: "var(--body-subtle)" }}
                          >
                            {m.label}:{" "}
                            <span className="font-semibold text-[var(--body)] ml-1">{m.value}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-[12px] text-[var(--body-subtle)] mt-2.5">{timestamp}</p>
                  </div>

                  {/* Right: Status */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start">
                    {action.status === "running" ? (
                      <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusMeta.dot }} />
                    ) : (
                      <StatusIcon className="h-3.5 w-3.5" style={{ color: statusMeta.color }} />
                    )}
                    <span className="text-[12px] font-medium" style={{ color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {filteredActions.length === 0 && (
            <div className={`${CARD} py-16 text-center`}>
              <Activity className="h-12 w-12 text-[var(--body-subtle)] opacity-30 mx-auto mb-4" />
              <p className="text-[var(--body)] font-medium">No agent actions found</p>
              <p className="text-[12px] text-[var(--body-subtle)] mt-1">
                Try changing the filter or running a new agent task
              </p>
            </div>
          )}
        </div>
      )}

      {/* Agent Intelligence */}
      {!loading && (
        <div
          className="p-5 rounded-[2px]"
          style={{
            backgroundColor: "var(--brand-softer)",
            border: "1px solid var(--border-brand-subtle)",
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--fg-brand-strong)] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--heading)]">
                Agent Intelligence
              </h2>
              <p className="text-[14px] text-[var(--body)] mt-1">
                Your AI agents have completed{" "}
                <span className="text-[var(--heading)] font-semibold">{metrics?.totalActions ?? 247} actions</span>{" "}
                this month across ad creation, campaign optimization, content generation, and inventory management.
                The Campaign Budget Optimizer saved{" "}
                <span className="text-[var(--success)] font-semibold">
                  {metrics ? formatCurrency(metrics.budgetSaved) : "€28,400"}
                </span>{" "}
                by reallocating spend from underperforming campaigns. Agents are running autonomously on a 6-hour cycle.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
