"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { DEMO_ORDER } from "./demo-data";
import { Sidebar } from "./Sidebar";
import { PrototypeHeader } from "./PrototypeHeader";
import { PickListPanel } from "./PickListPanel";
import { OrderInfoPanel } from "./OrderInfoPanel";
import { AddressEditDialog } from "./AddressEditDialog";
import type { DemoProduct, ScanState } from "./types";

export interface Address {
  firstName: string;
  lastName: string;
  company: string;
  nameAddition: string;
  street: string;
  houseNumber: string;
  addressAddition: string;
  zip: string;
  city: string;
  state: string;
  country: string;
  isoCode: string;
  email: string;
  phone: string;
}

const DEFAULT_ADDRESS: Address = {
  firstName: "Max",
  lastName: "Mustermann",
  company: "Firma GmbH",
  nameAddition: "",
  street: "Musterstraße",
  houseNumber: "1c",
  addressAddition: "",
  zip: "10115",
  city: "Berlin",
  state: "Berlin",
  country: "DE",
  isoCode: "DE",
  email: "max@example.com",
  phone: "+49 123 456789",
};

export const PackingPrototype: React.FC = () => {
  const [items, setItems] = useState<DemoProduct[]>(
    DEMO_ORDER.items.map((i) => ({ ...i }))
  );
  const [lastScanItemId, setLastScanItemId] = useState<string | null>(null);
  const [lastScanState, setLastScanState] = useState<ScanState>("idle");
  const [isFinalized, setIsFinalized] = useState(false);
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [selectedPrinter, setSelectedPrinter] = useState("Alpha Drucker");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
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

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const handleAddressSave = useCallback((newAddress: Address) => {
    setAddress(newAddress);
    setIsAddressDialogOpen(false);
    showToast("Versandadresse erfolgreich aktualisiert");
  }, [showToast]);

  return (
    <div className="relative flex h-full">
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
            address={address}
            selectedPrinter={selectedPrinter}
            onPrinterChange={setSelectedPrinter}
            onOpenAddressDialog={() => setIsAddressDialogOpen(true)}
          />
        </div>
      </div>

      {/* Address Dialog - rendered at prototype root for proper containment */}
      {isAddressDialogOpen && (
        <AddressEditDialog
          address={address}
          onSave={handleAddressSave}
          onClose={() => setIsAddressDialogOpen(false)}
        />
      )}

      {/* Success Toast */}
      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" />
            </svg>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};
