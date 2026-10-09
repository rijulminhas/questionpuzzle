"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

interface MovingAnswerButtonProps {
  label: string;
  zoneRef: RefObject<HTMLDivElement | null>;
  obstacleRef: RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
}

const EVADE_RADIUS = 110;
const MOVE_COOLDOWN_MS = 350;
const EDGE_MARGIN = 12;
const OBSTACLE_MARGIN = 24;

export default function MovingAnswerButton({
  label,
  zoneRef,
  obstacleRef,
  disabled = false,
}: MovingAnswerButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastMoveRef = useRef(0);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const pickPosition = useCallback(() => {
    const zone = zoneRef.current;
    const button = buttonRef.current;
    if (!zone || !button) return null;

    const zoneRect = zone.getBoundingClientRect();
    const buttonWidth = button.offsetWidth || 140;
    const buttonHeight = button.offsetHeight || 48;

    const maxX = Math.max(zoneRect.width - buttonWidth - EDGE_MARGIN, EDGE_MARGIN);
    const maxY = Math.max(zoneRect.height - buttonHeight - EDGE_MARGIN, EDGE_MARGIN);

    let obstacleBox: { left: number; right: number; top: number; bottom: number } | null = null;
    const obstacleEl = obstacleRef.current;
    if (obstacleEl) {
      const obstacleRect = obstacleEl.getBoundingClientRect();
      obstacleBox = {
        left: obstacleRect.left - zoneRect.left - OBSTACLE_MARGIN,
        right: obstacleRect.right - zoneRect.left + OBSTACLE_MARGIN,
        top: obstacleRect.top - zoneRect.top - OBSTACLE_MARGIN,
        bottom: obstacleRect.bottom - zoneRect.top + OBSTACLE_MARGIN,
      };
    }

    let candidate = { x: EDGE_MARGIN, y: EDGE_MARGIN };
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const x = EDGE_MARGIN + Math.random() * Math.max(maxX - EDGE_MARGIN, 0);
      const y = EDGE_MARGIN + Math.random() * Math.max(maxY - EDGE_MARGIN, 0);

      const overlapsObstacle =
        obstacleBox !== null &&
        x < obstacleBox.right &&
        x + buttonWidth > obstacleBox.left &&
        y < obstacleBox.bottom &&
        y + buttonHeight > obstacleBox.top;

      candidate = { x, y };
      if (!overlapsObstacle) break;
    }

    return candidate;
  }, [zoneRef, obstacleRef]);

  const evade = useCallback(() => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastMoveRef.current < MOVE_COOLDOWN_MS) return;
    lastMoveRef.current = now;

    const next = pickPosition();
    if (next) setPosition(next);
  }, [disabled, pickPosition]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      if (distance < EVADE_RADIUS) evade();
    };

    zone.addEventListener("pointermove", handlePointerMove);
    return () => zone.removeEventListener("pointermove", handlePointerMove);
  }, [evade, zoneRef]);

  useEffect(() => {
    const handleResize = () => evade();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [evade]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return undefined;

    // React binds JSX onTouchStart as a passive listener, which silently
    // ignores preventDefault(). Attaching natively with passive: false lets
    // us actually block the tap from registering as a selection.
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      evade();
    };

    button.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => button.removeEventListener("touchstart", handleTouchStart);
  }, [evade]);

  const handleEvadeEvent = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    evade();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleEvadeEvent}
      onPointerDown={handleEvadeEvent}
      onFocus={() => evade()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          evade();
        }
      }}
      disabled={disabled}
      aria-label={`${label} — this button likes to play hard to get`}
      className="absolute rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-200/60 transition-[left,top] duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
      style={
        position
          ? { left: position.x, top: position.y }
          : { left: "62%", top: "50%", transform: "translateY(-50%)" }
      }
    >
      {label}
    </button>
  );
}
