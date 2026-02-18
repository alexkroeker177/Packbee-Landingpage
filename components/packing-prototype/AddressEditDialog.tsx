"use client";

import React, { useState } from "react";
import { MapPin, X } from "lucide-react";
import type { Address } from "./PackingPrototype";

interface AddressEditDialogProps {
  address: Address;
  onSave: (address: Address) => void;
  onClose: () => void;
}

export const AddressEditDialog: React.FC<AddressEditDialogProps> = ({
  address,
  onSave,
  onClose,
}) => {
  const [editAddress, setEditAddress] = useState<Address>(address);

  const updateField = (field: keyof Address, value: string) => {
    setEditAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editAddress);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-[480px] max-h-[90%] overflow-y-auto mx-4">
        {/* Dialog Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Versandadresse bearbeiten
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Lieferadresse für diese Bestellung anpassen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Vorname / Nachname */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Vorname"
              required
              value={editAddress.firstName}
              onChange={(v) => updateField("firstName", v)}
            />
            <FormField
              label="Nachname"
              required
              value={editAddress.lastName}
              onChange={(v) => updateField("lastName", v)}
            />
          </div>

          {/* Firma */}
          <FormField
            label="Firma"
            value={editAddress.company}
            onChange={(v) => updateField("company", v)}
          />

          {/* Straße / Hausnr. */}
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <FormField
              label="Straße"
              required
              value={editAddress.street}
              onChange={(v) => updateField("street", v)}
            />
            <FormField
              label="Hausnr."
              value={editAddress.houseNumber}
              onChange={(v) => updateField("houseNumber", v)}
            />
          </div>

          {/* PLZ / Ort */}
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <FormField
              label="PLZ"
              required
              value={editAddress.zip}
              onChange={(v) => updateField("zip", v)}
            />
            <FormField
              label="Ort"
              required
              value={editAddress.city}
              onChange={(v) => updateField("city", v)}
            />
          </div>

          {/* Bundesland/Region */}
          <FormField
            label="Bundesland/Region"
            value={editAddress.state}
            onChange={(v) => updateField("state", v)}
          />

          {/* E-Mail / Telefon */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="E-Mail"
              value={editAddress.email}
              onChange={(v) => updateField("email", v)}
            />
            <FormField
              label="Telefon"
              value={editAddress.phone}
              onChange={(v) => updateField("phone", v)}
            />
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-[12px] font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, required, value, onChange }) => (
  <div>
    <label className="block text-[11px] font-medium text-gray-500 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-slate-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
    />
  </div>
);
