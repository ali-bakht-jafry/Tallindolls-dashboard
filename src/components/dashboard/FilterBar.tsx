"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

type DateRangePreset = "7d" | "30d" | "90d" | "12m";

const DATE_RANGE_OPTIONS: { label: string; value: DateRangePreset }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "12M", value: "12m" },
];

const CHANNEL_OPTIONS = [
  "All",
  "Instagram",
  "Facebook",
  "Google",
  "Email",
  "TikTok",
  "Direct",
];

const COUNTRY_OPTIONS = [
  "All",
  "US",
  "UK",
  "Germany",
  "France",
  "Italy",
  "Spain",
];

const CATEGORY_OPTIONS = [
  "All",
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Accessories",
];

const COLLECTION_OPTIONS = [
  "All",
  "Summer '26",
  "Spring '26",
  "Winter '25",
  "Autumn '25",
  "Capsule",
  "Evening",
  "Basics",
  "Premium",
  "Limited Edition",
  "Resort",
];

const CAMPAIGN_OPTIONS = [
  "All",
  "Summer Launch",
  "Spring Sale",
  "Holiday Push",
  "Flash Sale",
  "Retargeting",
  "Brand Awareness",
];

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange: DateRangePreset;
  channel: string;
  campaign: string;
  country: string;
  category: string;
  collection: string;
  sku: string;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d");
  const [channel, setChannel] = useState("All");
  const [campaign, setCampaign] = useState("All");
  const [country, setCountry] = useState("All");
  const [category, setCategory] = useState("All");
  const [collection, setCollection] = useState("All");
  const [sku, setSku] = useState("");

  function updateFilters(updates: Partial<FilterState>) {
    const newState: FilterState = {
      dateRange,
      channel,
      campaign,
      country,
      category,
      collection,
      sku,
      ...updates,
    };
    onFilterChange?.(newState);
  }

  function handleClearAll() {
    setDateRange("30d");
    setChannel("All");
    setCampaign("All");
    setCountry("All");
    setCategory("All");
    setCollection("All");
    setSku("");
    onFilterChange?.({
      dateRange: "30d",
      channel: "All",
      campaign: "All",
      country: "All",
      category: "All",
      collection: "All",
      sku: "",
    });
  }

  const isDirty =
    dateRange !== "30d" ||
    channel !== "All" ||
    campaign !== "All" ||
    country !== "All" ||
    category !== "All" ||
    collection !== "All" ||
    sku !== "";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]">
      {/* Date Range Presets */}
      <div className="flex rounded-[2px] overflow-hidden" role="group" aria-label="Date range">
        {DATE_RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setDateRange(opt.value);
              updateFilters({ dateRange: opt.value });
            }}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-all duration-150",
              "border-r border-[var(--border-default)] last:border-r-0",
              dateRange === opt.value
                ? "bg-[linear-gradient(135deg,var(--brand-strong)_0%,var(--purple)_100%)] text-[var(--white)] shadow-[var(--shadow-sm)] rounded-[2px]"
                : "bg-[var(--neutral-secondary-medium)] text-[var(--body)] hover:text-[var(--heading)] rounded-none first:rounded-l-[2px] last:rounded-r-[2px]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Channel Select */}
      <FilterSelect
        label="Channel"
        value={channel}
        options={CHANNEL_OPTIONS}
        onChange={(v) => {
          setChannel(v);
          updateFilters({ channel: v });
        }}
      />

      {/* Campaign Select */}
      <FilterSelect
        label="Campaign"
        value={campaign}
        options={CAMPAIGN_OPTIONS}
        onChange={(v) => {
          setCampaign(v);
          updateFilters({ campaign: v });
        }}
      />

      {/* Country Select */}
      <FilterSelect
        label="Country"
        value={country}
        options={COUNTRY_OPTIONS}
        onChange={(v) => {
          setCountry(v);
          updateFilters({ country: v });
        }}
      />

      {/* Category Select */}
      <FilterSelect
        label="Category"
        value={category}
        options={CATEGORY_OPTIONS}
        onChange={(v) => {
          setCategory(v);
          updateFilters({ category: v });
        }}
      />

      {/* Collection Select */}
      <FilterSelect
        label="Collection"
        value={collection}
        options={COLLECTION_OPTIONS}
        onChange={(v) => {
          setCollection(v);
          updateFilters({ collection: v });
        }}
      />

      {/* SKU Search Input */}
      <div className="relative flex-1 min-w-[180px] max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--body)] pointer-events-none" />
        <input
          type="text"
          value={sku}
          onChange={(e) => {
            setSku(e.target.value);
            updateFilters({ sku: e.target.value });
          }}
          placeholder="Search SKU..."
          className={cn(
            "w-full pl-9 pr-3 py-2.5 rounded-[2px]",
            "bg-[var(--neutral-secondary-medium)] border border-[var(--border-default-medium)]",
            "text-sm text-[var(--body)]",
            "placeholder:text-[var(--body-subtle)]",
            "focus:outline-none focus:border-[var(--border-brand)] focus:ring-1 focus:ring-[var(--brand)]",
            "transition-all duration-150"
          )}
        />
      </div>

      {/* Clear All — Ghost button variant */}
      {isDirty && (
        <button
          onClick={handleClearAll}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-[2px] bg-transparent text-sm font-medium text-[var(--heading)] hover:bg-[var(--neutral-secondary-medium)] transition-colors duration-150 shrink-0"
        >
          <X className="size-3" />
          Clear all
        </button>
      )}
    </div>
  );
}

/** Reusable styled <select> for the filter bar */
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn(
        "h-[38px] rounded-[2px] px-3 py-2",
        "bg-[var(--neutral-secondary-medium)] border border-[var(--border-default-medium)]",
        "text-sm text-[var(--body)]",
        "focus:outline-none focus:border-[var(--border-brand)] focus:ring-1 focus:ring-[var(--brand)]",
        "transition-all duration-150",
        "appearance-none cursor-pointer min-w-0"
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === "All" ? `${label}: All` : opt}
        </option>
      ))}
    </select>
  );
}
