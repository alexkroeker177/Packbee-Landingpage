import React from "react";
import {
  User,
  MapPin,
  Truck,
  CheckCircle,
  PackageCheck,
  Copy,
  Pencil,
  Settings,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { ProgressBar } from "./ProgressBar";

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
}

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
}) => {
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
                {customerName}
              </p>
              <p className="text-[11px] text-gray-500">Musterstraße 1c</p>
              <p className="text-[11px] text-gray-500">10115 Berlin, DE</p>
            </div>
            <div className="flex gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-600 cursor-default">
                <Copy size={12} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 cursor-default">
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
              <div className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Nicht festgelegt</span>
                <ChevronDown size={12} className="text-gray-300" />
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
                  <div className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 flex items-center justify-between">
                    <span>DHL - DHL Paket</span>
                    <ChevronDown size={12} className="text-gray-300" />
                  </div>
                  <button className="p-1 text-gray-400 cursor-default">
                    <RefreshCw size={10} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 mb-0.5">Gewicht</p>
                <div className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 flex items-center justify-between">
                  <span>113.04</span>
                  <span className="text-gray-400 text-[10px]">kg</span>
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
