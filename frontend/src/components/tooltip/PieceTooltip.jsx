/**
 * PieceTooltip - Displays piece name on hover or tap
 * Works on both desktop (hover) and mobile (tap) devices
 * Follows design bible principles for premium UI experience
 */
import { useState } from "react";

function PieceTooltip({ pieceType, children }) {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  // Toggle on tap/click for mobile, keep separate from hover
  const toggleTooltip = () => setIsVisible(!isVisible);

  // Prevent focus issues on mobile while still allowing click
  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="inline-block relative"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseDown={handleMouseDown}
      onClick={toggleTooltip}
    >
      {children}

      {isVisible && (
        <div
          className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-1
            px-2 py-1 rounded bg-black/80 backdrop-blur-sm
            text-white text-xs text-center whitespace-nowrap
            pointer-events-none
            transition-all duration-200
            opacity-100 scale-100
          "
          style={{ minWidth: "60px" }}
        >
          <span>{pieceType}</span>
        </div>
      )}
    </div>
  );
}

export default PieceTooltip;
