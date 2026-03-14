import React from "react";

export function SkeletonChart({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`w-full ${height} skeleton-pulse`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-panel border border-panel-border rounded p-4 space-y-2">
      <div className="h-3 w-20 skeleton-pulse" />
      <div className="h-8 w-32 skeleton-pulse" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 skeleton-pulse" />
      ))}
    </div>
  );
}

export function NoData({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground font-mono text-sm">
      {message}
    </div>
  );
}
