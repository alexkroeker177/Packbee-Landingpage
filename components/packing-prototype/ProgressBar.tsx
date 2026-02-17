import React from "react";

interface ProgressBarProps {
  percent: number;
  isComplete: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  isComplete,
}) => {
  return (
    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${
          isComplete ? "bg-emerald-500" : "bg-purple-500"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
