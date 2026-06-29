"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getInventory, getProductClassification } from "@/services/inventoryService";
import type { InventoryItem, ProductClassification, ProductStatus } from "@/types/index";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CARD =
  "bg-[var(--neutral-primary-soft)] border border-[var(--border-default)] rounded-[2px] shadow-[var(--shadow-xs)]";

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  in_stock: {
    label: "In Stock",
    bg: "rgba(16,185,129,0.15)",
    text: "var(--success)",
    border: "rgba(16,185,129,0.3)",
  },
  low_stock: {
    label: "Low Stock",
    bg: "rgba(249,115,22,0.15)",
    text: "var(--warning)",
    border: "rgba(249,115,22,0.3)",
  },
  out_of_stock: {
    label: "Out of Stock",
    bg: "rgba(239,68,68,0.15)",
    text: "var(--danger)",
    border: "rgba(239,68,68,0.3)",
  },
  critical: {
    label: "Critical",
    bg: "rgba(239,68,68,0.15)",
    text: "var(--danger)",
    border: "rgba(239,68,68,0.3)",
  },
};

const TABLE_COLUMNS: {
  field: keyof InventoryItem;
  label: string;
  align: "left" | "right";
}[] = [
  { field: "sku", label: "SKU", align: "left" },
  { field: "productName", label: "Product Name", align: "left" },
  { field: "collection", label: "Collection", align: "left" },
  { field: "currentStock", label: "Stock", align: "right" },
  { field: "dailySalesVelocity", label: "Velocity", align: "right" },
  { field: "daysRemaining", label: "Days Left", align: "left" },
  { field: "status", label: "Status", align: "left" },
  { field: "unitPrice", label: "Unit Price", align: "right" },
];

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }, (_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 rounded-[2px] bg-[rgba(255,255,255,0.04)] animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Days Left indicator
// ---------------------------------------------------------------------------

function DaysLeftCell({ days }: { days: number }) {
  const color =
    days < 7 ? "var(--danger)" : days < 14 ? "var(--warning)" : "var(--success)";
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block size-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span
        className="text-[14px] font-medium"
        style={{ color }}
      >
        {days}d
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter input style
// ---------------------------------------------------------------------------

const FILTER_INPUT =
  "bg-[var(--neutral-secondary-medium)] border border-[var(--border-default-medium)] rounded-[2px] text-[14px] px-2 py-2 text-[var(--body)] placeholder:text-[var(--body-subtle)] outline-none focus:border-[var(--brand)] transition-colors";

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [classification, setClassification] =
    useState<ProductClassification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<keyof InventoryItem>("sku");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // ------------------------------------------------------------------
  // Data loading
  // ------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, cls] = await Promise.all([
        getInventory(),
        getProductClassification(),
      ]);
      setInventory(inv);
      setClassification(cls);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load inventory data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------
  // Derived data
  // ------------------------------------------------------------------

  const collections = useMemo(() => {
    const set = new Set(inventory.map((i) => i.collection));
    return ["All", ...Array.from(set).sort()];
  }, [inventory]);

  const statuses = ["All", "in_stock", "low_stock", "out_of_stock", "critical"];

  const filtered = useMemo(() => {
    let items = inventory;
    if (collectionFilter !== "All") {
      items = items.filter((i) => i.collection === collectionFilter);
    }
    if (statusFilter !== "All") {
      items = items.filter((i) => i.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.sku.toLowerCase().includes(q) ||
          i.productName.toLowerCase().includes(q)
      );
    }
    return items;
  }, [inventory, collectionFilter, statusFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedItems = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const summary = useMemo(() => {
    const totalProducts = inventory.length;
    const totalStockValue = inventory.reduce(
      (s, i) => s + i.currentStock * i.unitPrice,
      0
    );
    const lowStock = inventory.filter((i) => i.status === "low_stock").length;
    const outOfStock = inventory.filter(
      (i) => i.status === "out_of_stock" || i.status === "critical"
    ).length;
    return { totalProducts, totalStockValue, lowStock, outOfStock };
  }, [inventory]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleSort = useCallback(
    (field: keyof InventoryItem) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
      setPage(1);
    },
    [sortField]
  );

  const handleFilterChange = useCallback(
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    },
    []
  );

  // ------------------------------------------------------------------
  // Pagination page numbers
  // ------------------------------------------------------------------

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) return [1, 2, 3, 4, 5, 6, 7];
    if (page >= totalPages - 3)
      return Array.from({ length: 7 }, (_, i) => totalPages - 6 + i);
    return Array.from({ length: 7 }, (_, i) => page - 3 + i);
  }, [totalPages, page]);

  // ------------------------------------------------------------------
  // Error state
  // ------------------------------------------------------------------

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          className={cn(
            CARD,
            "text-center py-16 flex flex-col items-center gap-4"
          )}
        >
          <p className="text-[var(--danger)] font-semibold text-[14px]">
            {error}
          </p>
          <button
            onClick={loadData}
            className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[2px]"
            style={{
              background: "linear-gradient(135deg, #C8399C 0%, #7C3AED 100%)",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="max-w-[1200px] mx-auto px-6 space-y-8">
      {/* Page Title */}
      <h1 className="text-[28px] font-semibold text-[var(--heading)]">
        Inventory Intelligence
      </h1>

      {/* ========================================================== */}
      {/* STAT CARDS                                                  */}
      {/* ========================================================== */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(CARD, "p-4 animate-pulse")}>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-4 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
                <div className="h-3 w-20 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
              </div>
              <div className="h-7 w-24 rounded-[2px] bg-[rgba(255,255,255,0.04)]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products */}
          <div className={cn(CARD, "p-4")}>
            <div className="flex items-center gap-2 mb-3">
              <Package className="size-4 text-[var(--brand)] shrink-0" />
              <span className="text-[12px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                Total Products
              </span>
            </div>
            <p className="text-[24px] font-semibold text-[var(--heading)]">
              {summary.totalProducts}
            </p>
            <p className="text-[12px] text-[var(--body-subtle)] mt-1">
              Across {collections.length - 1} collections
            </p>
          </div>

          {/* Total Stock Value */}
          <div className={cn(CARD, "p-4")}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="size-4 text-[var(--success)] shrink-0" />
              <span className="text-[12px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                Stock Value
              </span>
            </div>
            <p className="text-[24px] font-semibold text-[var(--heading)]">
              {formatCurrency(summary.totalStockValue)}
            </p>
          </div>

          {/* Low Stock */}
          <div className={cn(CARD, "p-4")}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4 text-[var(--warning)] shrink-0" />
              <span className="text-[12px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                Low Stock
              </span>
            </div>
            <p
              className="text-[24px] font-semibold"
              style={{ color: "var(--warning)" }}
            >
              {summary.lowStock}
            </p>
          </div>

          {/* Out of Stock */}
          <div className={cn(CARD, "p-4")}>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="size-4 text-[var(--danger)] shrink-0" />
              <span className="text-[12px] text-[var(--body-subtle)] font-medium uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
            <p
              className="text-[24px] font-semibold"
              style={{ color: "var(--danger)" }}
            >
              {summary.outOfStock}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* FILTER BAR                                                  */}
      {/* ========================================================== */}
      <div className={cn(CARD, "p-3 flex flex-wrap gap-3 items-center")}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--body-subtle)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by SKU or name..."
            className={cn(FILTER_INPUT, "w-full pl-8 pr-3")}
          />
        </div>

        {/* Collection filter */}
        <select
          value={collectionFilter}
          onChange={handleFilterChange(setCollectionFilter)}
          className={cn(FILTER_INPUT, "min-w-[160px]")}
        >
          {collections.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Collections" : c}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          className={cn(FILTER_INPUT, "min-w-[140px]")}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "All"
                ? "All Statuses"
                : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* ========================================================== */}
      {/* INVENTORY TABLE                                             */}
      {/* ========================================================== */}
      <div className={cn(CARD, "overflow-x-auto")}>
        {loading ? (
          <table className="w-full">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    className={cn(
                      "px-6 py-3",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    <div className="h-3 w-16 rounded-[2px] bg-[rgba(255,255,255,0.04)] animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableRowSkeleton cols={TABLE_COLUMNS.length} />
            </tbody>
          </table>
        ) : (
          <>
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-default)]">
                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className={cn(
                        "px-6 py-3 text-[12px] font-medium text-[var(--body-subtle)] uppercase tracking-wider cursor-pointer hover:text-[var(--heading)] transition-colors select-none",
                        col.align === "right" ? "text-right" : "text-left"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortField === col.field &&
                          (sortDir === "asc" ? (
                            <ArrowUp className="size-3 text-[var(--brand)]" />
                          ) : (
                            <ArrowDown className="size-3 text-[var(--brand)]" />
                          ))}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-6 py-16 text-center text-[14px] text-[var(--body-subtle)]"
                    >
                      No inventory items match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.sku}
                      className="border-b border-[var(--border-default)] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                    >
                      {/* SKU */}
                      <td className="px-6 py-4 text-[12px] text-[var(--body-subtle)] font-mono">
                        {item.sku}
                      </td>

                      {/* Product Name */}
                      <td className="px-6 py-4 text-[14px] font-medium text-[var(--heading)]">
                        {item.productName}
                      </td>

                      {/* Collection */}
                      <td className="px-6 py-4 text-[14px] text-[var(--body)]">
                        {item.collection}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                        {item.currentStock}
                      </td>

                      {/* Velocity */}
                      <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                        {item.dailySalesVelocity.toFixed(1)}/day
                      </td>

                      {/* Days Left */}
                      <td className="px-6 py-4">
                        <DaysLeftCell days={item.daysRemaining} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {(() => {
                          const cfg = STATUS_CONFIG[item.status];
                          return (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[12px] font-medium border"
                              style={{
                                backgroundColor: cfg.bg,
                                color: cfg.text,
                                borderColor: cfg.border,
                              }}
                            >
                              {cfg.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-right text-[14px] text-[var(--body)]">
                        {formatCurrency(item.unitPrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-default)]">
                <p className="text-[12px] text-[var(--body-subtle)]">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-0">
                  {/* Previous */}
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(
                      "h-9 px-3 text-[14px] font-medium flex items-center justify-center rounded-[2px] transition-colors -mr-px",
                      "bg-[var(--neutral-secondary-medium)] border border-[var(--border-default-medium)]",
                      "hover:bg-[var(--neutral-tertiary-medium)] text-[var(--body)]",
                      "disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={cn(
                        "h-9 w-9 text-[14px] font-medium flex items-center justify-center transition-colors -mr-px rounded-[2px]",
                        page === num
                          ? "text-[var(--fg-brand-strong)] bg-[var(--neutral-tertiary-medium)] border border-[var(--border-default-medium)]"
                          : "text-[var(--body)] bg-[var(--neutral-secondary-medium)] border border-[var(--border-default-medium)] hover:bg-[var(--neutral-tertiary-medium)]"
                      )}
                    >
                      {num}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={cn(
                      "h-9 px-3 text-[14px] font-medium flex items-center justify-center rounded-[2px] transition-colors",
                      "bg-[var(--neutral-secondary-medium)] border border-[var(--border-default-medium)]",
                      "hover:bg-[var(--neutral-tertiary-medium)] text-[var(--body)]",
                      "disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================== */}
      {/* PRODUCT CLASSIFICATION                                      */}
      {/* ========================================================== */}
      {classification && !loading && (
        <div className="space-y-4">
          <h2 className="text-[16px] font-semibold text-[var(--heading)]">
            Product Classification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fast Moving */}
            <div className={cn(CARD, "p-4")}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--success)" }}
                />
                <h3 className="text-[14px] font-semibold text-[var(--heading)]">
                  Fast Moving
                </h3>
                <span className="text-[12px] text-[var(--body-subtle)] ml-auto">
                  {classification.fastMoving.length} products
                </span>
              </div>
              {classification.fastMoving.length === 0 ? (
                <p className="text-[12px] text-[var(--body-subtle)] py-4 text-center">
                  No products
                </p>
              ) : (
                <div className="space-y-0">
                  {classification.fastMoving.slice(0, 5).map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between gap-2 py-2.5 border-b border-[var(--border-default)] last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[var(--heading)] truncate">
                          {item.productName}
                        </p>
                        <p className="text-[12px] text-[var(--body-subtle)] font-mono">
                          {item.sku}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-[var(--heading)]">
                          {item.dailySalesVelocity.toFixed(1)}/day
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Normal */}
            <div className={cn(CARD, "p-4")}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: "#8B5CF6" }}
                />
                <h3 className="text-[14px] font-semibold text-[var(--heading)]">
                  Normal
                </h3>
                <span className="text-[12px] text-[var(--body-subtle)] ml-auto">
                  {classification.normal.length} products
                </span>
              </div>
              {classification.normal.length === 0 ? (
                <p className="text-[12px] text-[var(--body-subtle)] py-4 text-center">
                  No products
                </p>
              ) : (
                <div className="space-y-0">
                  {classification.normal.slice(0, 5).map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between gap-2 py-2.5 border-b border-[var(--border-default)] last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[var(--heading)] truncate">
                          {item.productName}
                        </p>
                        <p className="text-[12px] text-[var(--body-subtle)] font-mono">
                          {item.sku}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-[var(--heading)]">
                          {item.dailySalesVelocity.toFixed(1)}/day
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slow Moving */}
            <div className={cn(CARD, "p-4")}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--warning)" }}
                />
                <h3 className="text-[14px] font-semibold text-[var(--heading)]">
                  Slow Moving
                </h3>
                <span className="text-[12px] text-[var(--body-subtle)] ml-auto">
                  {classification.slowMoving.length} products
                </span>
              </div>
              {classification.slowMoving.length === 0 ? (
                <p className="text-[12px] text-[var(--body-subtle)] py-4 text-center">
                  No products
                </p>
              ) : (
                <div className="space-y-0">
                  {classification.slowMoving.slice(0, 5).map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between gap-2 py-2.5 border-b border-[var(--border-default)] last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[var(--heading)] truncate">
                          {item.productName}
                        </p>
                        <p className="text-[12px] text-[var(--body-subtle)] font-mono">
                          {item.sku}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-[var(--heading)]">
                          {item.dailySalesVelocity.toFixed(1)}/day
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* AI RESTOCK PLANNER                                          */}
      {/* ========================================================== */}
      <div
        className="p-5 rounded-[2px]"
        style={{
          backgroundColor: "var(--brand-softer)",
          border: "1px solid var(--border-brand-subtle)",
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-[var(--brand)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--heading)]">
              AI Restock Planner
            </h3>
            <p className="text-[14px] text-[var(--body)] mt-1 leading-relaxed">
              Your AI Inventory Agent analyzed {inventory.length} SKUs across{" "}
              {collections.length - 1} collections.{" "}
              {summary.outOfStock + summary.lowStock} items require attention.
              Recommended purchase orders total approximately{" "}
              {formatCurrency(
                inventory
                  .filter(
                    (i) =>
                      i.status === "out_of_stock" || i.status === "critical"
                  )
                  .reduce((s, i) => s + i.reorderPoint * i.unitCost, 0)
              )}
              .
            </p>
            <ul className="mt-3 space-y-2 text-[14px]">
              {inventory
                .filter(
                  (i) =>
                    i.status === "out_of_stock" || i.status === "critical"
                )
                .slice(0, 3)
                .map((item, idx) => (
                  <li
                    key={item.sku}
                    className={cn(
                      "flex items-center gap-2",
                      idx < 2
                        ? "text-[var(--danger)]"
                        : "text-[var(--warning)]"
                    )}
                  >
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>
                      {item.productName} ({item.sku}) —{" "}
                      {item.currentStock} units,{" "}
                      {item.daysRemaining > 0
                        ? `${item.daysRemaining} days remaining`
                        : "out now"}
                      , needs {item.reorderPoint} units
                    </span>
                  </li>
                ))}
              {inventory.filter(
                (i) => i.status === "out_of_stock" || i.status === "critical"
              ).length === 0 && (
                <li className="flex items-center gap-2 text-[var(--success)]">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>All stock levels are healthy — no critical items.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
