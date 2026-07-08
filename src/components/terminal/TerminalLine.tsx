import React from 'react';

interface TerminalLineProps {
  text: string;
  isCert?: boolean;
  certNameLength?: number;
  isCurrentLine?: boolean;
}

export const TerminalLine: React.FC<TerminalLineProps> = ({
  text,
  isCert = false,
  certNameLength = 0,
  isCurrentLine = false
}) => {
  const cursor = isCurrentLine ? (
    <span className="inline-block w-2 h-4 sm:h-5 bg-[#ffb000] ml-0.5 animate-pulse align-middle" />
  ) : null;

  if (text === '') {
    return <div className="h-3" />;
  }

  if (!isCert) {
    return (
      <div className="min-h-[1.2em] text-[#ffb000] font-mono">
        {text}
        {cursor}
      </div>
    );
  }

  // Splitting certification text dynamically for responsive rendering
  // namePart is the certification title
  const namePart = text.slice(0, certNameLength);
  // restPart contains the padded spaces and the institute name
  const restPart = text.slice(certNameLength);
  const institutePart = restPart.trim();

  return (
    <div className="min-h-[1.2em] font-mono text-xs sm:text-sm md:text-base leading-relaxed">
      {/* Desktop view: Monospace register layout with aligned columns */}
      <div className="hidden sm:block whitespace-pre text-white">
        <span>{namePart}</span>
        <span className="text-[#ffb000]/80">{restPart}</span>
        {cursor}
      </div>

      {/* Mobile view: Stacked details layout */}
      <div className="block sm:hidden pb-1 text-white">
        <div>
          <span>{namePart}</span>
          {cursor}
        </div>
        {institutePart && (
          <div className="text-[#ffb000]/60 text-xs pl-3 mt-0.5">
            → {institutePart}
          </div>
        )}
      </div>
    </div>
  );
};
