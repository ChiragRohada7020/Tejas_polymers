"use client";

import { useEffect, useRef, useState } from "react";
import { EditableText } from "@/components/site/Editable";

type Props = {
  /** Raw value, e.g. "120+", "6+", "Pachora", "ISO 9001". */
  value: string;
  contentKey: string;
  editMode: boolean;
  className?: string;
  /** Stagger in ms, so the counters run in sequence. */
  delay?: number;
  /** Animation length in ms. */
  duration?: number;
};

/** Splits "120+" into { number: 120, prefix: "", suffix: "+" }. */
function parseValue(raw: string) {
  const match = raw.trim().match(/^([^\d]*)(\d[\d,]*)(.*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const number = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(number)) return null;
  return { prefix, number, suffix };
}

/** Ease-out cubic, so the number decelerates as it lands. */
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const format = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * A stat number that counts up from 0 when it scrolls into view.
 *
 * The final value is rendered server-side so crawlers, no-JS visitors and
 * reduced-motion users always see the real number — the count-up is purely
 * visual polish layered on top. Non-numeric values (e.g. "ISO 9001") render
 * as static text, and in admin edit mode it falls back to the plain editor.
 */
export default function AnimatedStat({
  value,
  contentKey,
  editMode,
  className,
  delay = 0,
  duration = 1600,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  const parsed = parseValue(value);

  useEffect(() => {
    const node = ref.current;
    if (!parsed || !node) return;

    if (typeof IntersectionObserver !== "function") {
      setDisplay(format(parsed.number));
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          setDisplay(format(parsed.number));
          return;
        }

        let start = 0;
        const tick = (now: number) => {
          if (!start) start = now;
          const elapsed = now - start - delay;
          if (elapsed < 0) {
            frame = requestAnimationFrame(tick);
            return;
          }
          const progress = Math.min(1, elapsed / duration);
          setDisplay(format(easeOut(progress) * parsed.number));
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            setDisplay(format(parsed.number));
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, duration]);

  // Admins edit the raw text — never animate underneath the editor.
  if (editMode) {
    return (
      <span ref={ref}>
        <EditableText contentKey={contentKey} editMode value={value} as="span" />
      </span>
    );
  }

  const shown = display === null ? value : `${parsed?.prefix ?? ""}${display}${parsed?.suffix ?? ""}`;

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
