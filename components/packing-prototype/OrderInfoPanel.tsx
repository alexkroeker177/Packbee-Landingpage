"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  MapPin,
  CheckCircle,
  PackageCheck,
  Copy,
  Pencil,
  Settings,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import type { Address } from "./PackingPrototype";

interface OrderInfoPanelProps {
  customerName: string;
  platform: string;
  shop: string;
  country: string;
  amount: string;
  totalScanned: number;
  totalRequired: number;
  progressPercent: number;
  isComplete: boolean;
  isFinalized: boolean;
  onFinalize: () => void;
  address: Address;
  selectedPrinter: string;
  onPrinterChange: (printer: string) => void;
  onOpenAddressDialog: () => void;
}

const PRINTER_OPTIONS = ["Alpha Drucker", "Beta Drucker"];
const SHIPPING_OPTIONS = ["DHL - DHL Paket", "Hermes - Hermes Paket"];

export const OrderInfoPanel: React.FC<OrderInfoPanelProps> = ({
  customerName,
  platform,
  shop,
  country,
  amount,
  totalScanned,
  totalRequired,
  progressPercent,
  isComplete,
  isFinalized,
  onFinalize,
  address,
  selectedPrinter,
  onPrinterChange,
  onOpenAddressDialog,
}) => {
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("DHL - DHL Paket");
  const [weight, setWeight] = useState("100");
  const printerRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!isPrinterOpen && !isShippingOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (isPrinterOpen && printerRef.current && !printerRef.current.contains(e.target as Node)) {
        setIsPrinterOpen(false);
      }
      if (isShippingOpen && shippingRef.current && !shippingRef.current.contains(e.target as Node)) {
        setIsShippingOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isPrinterOpen, isShippingOpen]);

  return (
    <div className="w-full md:w-[300px] lg:w-[340px] flex flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white shrink-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Customer Header */}
        <div className="px-3 lg:px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-slate-900">
              {customerName}
            </span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-blue-200 text-blue-600 bg-blue-50">
              Bezahlt
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-green-200 text-green-600 bg-green-50">
              {platform}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
              <span className="inline-flex items-center gap-0.5">
                <MapPin size={9} />
                {country}
              </span>
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-2.5 text-[11px]">
            <div>
              <p className="text-gray-400 font-medium">Plattform</p>
              <p className="text-slate-700 font-semibold">{platform}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Shop</p>
              <p className="text-slate-700 font-semibold">{shop}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Land</p>
              <p className="text-slate-700 font-semibold">{country}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Betrag</p>
              <p className="text-slate-700 font-semibold">{amount}</p>
            </div>
          </div>
        </div>

        {/* Versandadresse */}
        <div className="px-3 lg:px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-medium text-gray-400 mb-2">
            Versandadresse
          </p>
          <div className="border border-gray-200 rounded-lg p-3 flex items-start gap-2">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-[11px] text-gray-500">
                {address.street} {address.houseNumber}
              </p>
              <p className="text-[11px] text-gray-500">
                {address.zip} {address.city}, {address.country}
              </p>
            </div>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-600 cursor-default">
                <Copy size={12} />
              </button>
              <button
                onClick={onOpenAddressDialog}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Pencil size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Versand-Einstellungen */}
        <div className="px-3 lg:px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Settings size={12} className="text-gray-400" />
            <p className="text-[11px] font-medium text-gray-400">
              Versand-Einstellungen
            </p>
          </div>

          {/* Drucker */}
          <div className="mb-3">
            <p className="text-[10px] text-gray-400 mb-1">Drucker</p>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1" ref={printerRef}>
                <button
                  onClick={() => setIsPrinterOpen((prev) => !prev)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <span>{selectedPrinter}</span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-300 transition-transform ${isPrinterOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isPrinterOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    {PRINTER_OPTIONS.map((printer) => (
                      <button
                        key={printer}
                        onClick={() => {
                          onPrinterChange(printer);
                          setIsPrinterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 transition-colors ${
                          printer === selectedPrinter
                            ? "text-blue-600 font-medium bg-blue-50"
                            : "text-slate-700"
                        }`}
                      >
                        {printer}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-1 text-gray-400 cursor-default">
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* Paket 1 */}
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Paket 1</p>
            <div className="grid grid-cols-[1fr_80px] gap-2">
              <div>
                <p className="text-[9px] text-gray-400 mb-0.5">Versandart</p>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1" ref={shippingRef}>
                    <button
                      onClick={() => setIsShippingOpen((prev) => !prev)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <span className="truncate">{selectedShipping}</span>
                      <ChevronDown
                        size={12}
                        className={`text-gray-300 shrink-0 transition-transform ${isShippingOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isShippingOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        {SHIPPING_OPTIONS.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSelectedShipping(option);
                              setIsShippingOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 transition-colors ${
                              option === selectedShipping
                                ? "text-blue-600 font-medium bg-blue-50"
                                : "text-slate-700"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="p-1 text-gray-400 cursor-default">
                    <RefreshCw size={10} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 mb-0.5">Gewicht</p>
                <div className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 flex items-center gap-1">
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent text-[11px] text-slate-700 focus:outline-none"
                  />
                  <span className="text-gray-400 text-[10px] shrink-0">kg</span>
                </div>
              </div>
            </div>
            <button className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 cursor-default">
              + Paket hinzufügen
            </button>
          </div>
        </div>

        {/* Progress (subtle, only shown when scanning starts) */}
        {totalScanned > 0 && (
          <div className="px-3 lg:px-5 py-3">
            <ProgressBar percent={progressPercent} isComplete={isComplete} />
            <p
              className={`text-[10px] mt-1 font-medium ${isComplete ? "text-emerald-600" : "text-gray-400"}`}
            >
              {isComplete
                ? "Bereit zum Versand"
                : `${totalScanned}/${totalRequired} Artikel gescannt`}
            </p>
          </div>
        )}
      </div>

      {/* CTA - Full width bottom */}
      <div className="shrink-0">
        <button
          onClick={onFinalize}
          disabled={!isComplete || isFinalized}
          className={[
            "w-full py-3.5 px-5 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300",
            !isComplete &&
              "bg-gray-100 text-gray-400 cursor-not-allowed",
            isComplete &&
              !isFinalized &&
              "bg-slate-800 text-white hover:bg-slate-900 animate-glow-pulse cursor-pointer",
            isFinalized && "bg-emerald-600 text-white cursor-default",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isFinalized ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Abgeschlossen!
            </>
          ) : (
            <>
              <PackageCheck className="h-4 w-4" />
              Abschließen & Label drucken
            </>
          )}
        </button>
      </div>
    </div>
  );
};
