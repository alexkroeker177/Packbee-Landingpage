"use client";

import React from "react";
import { PackingPrototype } from "./packing-prototype/PackingPrototype";

export const AppWindow: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden flex flex-col lg:aspect-[16/9] min-h-[400px] lg:min-h-[600px]">
      <PackingPrototype />
    </div>
  );
};
