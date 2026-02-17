"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { DEMO_ORDER } from "./demo-data";
import { Sidebar } from "./Sidebar";
import { PrototypeHeader } from "./PrototypeHeader";
import { PickListPanel } from "./PickListPanel";
import { OrderInfoPanel } from "./OrderInfoPanel";
import type { DemoProduct, ScanState } from "./types";

export const PackingPrototype: React.FC = () => {
  const [items, setItems] = useState<DemoProduct[]>(
    DEMO_ORDER.items.map((i) => ({ ...i }))
  );
  const [lastScanItemId, setLastScanItemId] = useState<string | null>(null);
  const [lastScanState, setLastScanState] = useState<ScanState>("idle");
  const [isFinalized, setIsFinalized] = useState(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state
  const totalRequired = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalScanned = items.reduce((sum, i) => sum + i.scannedQuantity, 0);
  const isComplete = totalScanned >= totalRequired;
  const progressPercent =
    totalRequired > 0 ? (totalScanned / totalRequired) * 100 : 0;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const clearScanState = useCallback(() => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => {
      setLastScanItemId(null);
      setLastScanState("idle");
    }, 600);
  }, []);

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (isFinalized) return;

      const item = items.find((i) => i.id === itemId);
      if (!item || item.scannedQuantity >= item.quantity) return;

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, scannedQuantity: i.scannedQuantity + 1 }
            : i
        )
      );

      setLastScanItemId(itemId);
      setLastScanState("success");
      clearScanState();
    },
    [isFinalized, items, clearScanState]
  );

  const handleWrongItem = useCallback(() => {
    if (isFinalized) return;

    setLastScanItemId("wrong");
    setLastScanState("error");

    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => {
      setLastScanItemId(null);
      setLastScanState("idle");
    }, 800);
  }, [isFinalized]);

  const handleFinalize = useCallback(() => {
    if (!isComplete || isFinalized) return;

    setIsFinalized(true);

    // Auto-reset after 2.5 seconds
    resetTimerRef.current = setTimeout(() => {
      setItems(DEMO_ORDER.items.map((i) => ({ ...i, scannedQuantity: 0 })));
      setIsFinalized(false);
      setLastScanItemId(null);
      setLastScanState("idle");
    }, 2500);
  }, [isComplete, isFinalized]);

  return (
    <div className="flex h-full">
      {/* Sidebar - hidden below lg */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PrototypeHeader
          orderNumber={DEMO_ORDER.orderNumber}
          position={1}
          totalOrders={20}
        />

        {/* Body: Pick List + Order Info */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <PickListPanel
            items={items}
            lastScanItemId={lastScanItemId}
            lastScanState={lastScanState}
            onItemClick={handleItemClick}
            onWrongItem={handleWrongItem}
            isFinalized={isFinalized}
          />
          <OrderInfoPanel
            customerName={DEMO_ORDER.customerName}
            platform={DEMO_ORDER.platform}
            shop={DEMO_ORDER.shop}
            country={DEMO_ORDER.country}
            amount={DEMO_ORDER.amount}
            totalScanned={totalScanned}
            totalRequired={totalRequired}
            progressPercent={progressPercent}
            isComplete={isComplete}
            isFinalized={isFinalized}
            onFinalize={handleFinalize}
          />
        </div>
      </div>
    </div>
  );
};
