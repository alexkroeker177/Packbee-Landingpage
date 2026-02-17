import React from "react";
import { Scan, List, LayoutGrid, Minus, Plus } from "lucide-react";
import type { DemoProduct, ScanState } from "./types";

interface PickListPanelProps {
  items: DemoProduct[];
  lastScanItemId: string | null;
  lastScanState: ScanState;
  onItemClick: (itemId: string) => void;
  onWrongItem: () => void;
  isFinalized: boolean;
}

export const PickListPanel: React.FC<PickListPanelProps> = ({
  items,
  lastScanItemId,
  lastScanState,
  onItemClick,
  isFinalized,
}) => {
  const totalPositions = items.length;
  const totalArticles = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Packliste Header */}
      <div className="px-3 lg:px-5 pt-4 pb-3 flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Packliste</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalPositions} Positionen · {totalArticles} Artikel
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Scanner Input */}
          <div
            className={[
              "flex items-center gap-2 border rounded-lg px-3 py-1.5 w-full sm:w-[180px] transition-colors duration-300",
              lastScanState === "success" && "border-emerald-400 bg-emerald-50/50",
              lastScanState === "error" && "border-rose-400 bg-rose-50/50 animate-scan-error",
              lastScanState === "idle" && "border-gray-200",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Scan
              size={14}
              className={[
                lastScanState === "success" && "text-emerald-500",
                lastScanState === "error" && "text-rose-500",
                lastScanState === "idle" && "text-gray-400",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <span
              className={[
                "text-xs whitespace-nowrap",
                lastScanState === "error"
                  ? "text-rose-500"
                  : "text-gray-400",
              ].join(" ")}
            >
              {lastScanState === "error"
                ? "Nicht gefunden!"
                : "Barcode scannen..."}
            </span>
          </div>
          {/* View Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button className="p-1.5 bg-gray-100 text-gray-600 cursor-default">
              <List size={14} />
            </button>
            <button className="p-1.5 text-gray-400 cursor-default">
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-3 lg:px-5 grid grid-cols-[32px_1fr_40px_72px] lg:grid-cols-[40px_1fr_64px_100px] gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
        <span>Bild</span>
        <span>Artikel</span>
        <span className="text-center">Lagerort</span>
        <span className="text-right pr-1">Menge</span>
      </div>

      {/* Item Rows */}
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const isComplete = item.scannedQuantity >= item.quantity;
          const isPartial = item.scannedQuantity > 0 && !isComplete;
          const isActive =
            lastScanItemId === item.id && lastScanState === "success";

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isFinalized && !isComplete) onItemClick(item.id);
              }}
              className={[
                "px-3 lg:px-5 py-2.5 grid grid-cols-[32px_1fr_40px_72px] lg:grid-cols-[40px_1fr_64px_100px] gap-2 items-center border-b border-gray-50 transition-all duration-200 cursor-pointer",
                isComplete && "bg-emerald-50/60",
                isActive && "animate-scan-success",
                !isComplete && !isFinalized && "hover:bg-gray-50",
                isFinalized && "cursor-default",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Product Image */}
              <div
                className={`h-8 w-8 rounded-md ${item.imageColor} ${isComplete ? "opacity-60" : ""}`}
              />

              {/* Article Info */}
              <div className="min-w-0">
                <p
                  className={`text-[12px] font-medium truncate ${isComplete ? "line-through text-gray-400" : "text-slate-800"}`}
                >
                  {item.title}
                </p>
                <p className="text-[10px] text-gray-400 font-mono truncate">
                  {item.sku}
                </p>
              </div>

              {/* Storage Location */}
              <div className="flex justify-center">
                {item.storageLocation && (
                  <span
                    className={`text-[11px] font-medium px-1.5 lg:px-2 py-0.5 rounded-full ${
                      isComplete
                        ? "text-emerald-600 bg-emerald-100"
                        : "text-blue-600 bg-blue-50"
                    }`}
                  >
                    {item.storageLocation}
                  </span>
                )}
              </div>

              {/* Quantity + Buttons */}
              <div className="flex items-center justify-end gap-1.5">
                <span
                  className={[
                    "text-[13px] font-bold tabular-nums min-w-[32px] text-center",
                    isComplete && "text-emerald-600",
                    isPartial && "text-amber-600",
                    !isComplete && !isPartial && "text-slate-700",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.scannedQuantity}
                  <span className="text-gray-300 font-normal mx-0.5">/</span>
                  {item.quantity}
                </span>
                <button className="p-0.5 text-gray-300 cursor-default">
                  <Minus size={12} />
                </button>
                <button className="p-0.5 text-gray-300 cursor-default">
                  <Plus size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
