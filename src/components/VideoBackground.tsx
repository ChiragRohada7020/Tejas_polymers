"use client";


import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** YouTube video id, e.g. "KnSEkZDC1Ho". */
  videoId: string;
  /** Headline text drawn over the video. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  /** Text describing the video, for screen readers. */
  videoLabel?: string;
};

/**
 * YouTube video used as a decorative background layer.
 *
 * Implementation notes, because YouTube embeds are fussy:
 *
 * - Autoplay is only ever allowed while MUTED. Unmuted autoplay is
 *   blocked by browsers, so the video is silent by design. A visible
 *   control unmutes it.
 * - Looping via `loop=1` only works on a single video when `playlist`
 *   is set to the same id, which is why that is passed explicitly.
 * - `playsinline` stops iOS taking the video fullscreen.
 * - The IFrame API is loaded on demand rather than with a <script> tag
 *   in the document, so no other page pays for it.
 * - Data saver, slow connections and prefers-reduced-motion all skip
 *   autoplay and show the poster instead, so the hero never burns a
 *   visitor's mobile data or ignores a motion preference.
 * - The player API replaces its host element with an <iframe>, so the
 *   host div cannot be measured for the cover maths. The wrapper is
 *   measured instead, and the iframe is styled through the wrapper's
 *   own class rather than through the discarded host node.
 */

const API_SRC = "https://www.youtube.com/iframe_api";

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = API_SRC;
    tag.async = true;
    tag.onerror = () => reject(new Error("YouTube API failed to load"));
    document.head.appendChild(tag);
  });
  // Allow a later attempt to retry after a failed load.
  apiPromise.catch(() => {
    apiPromise = null;
  });
  return apiPromise;
}

/** True when the visitor would rather we did not autoplay video. */
function shouldSkipAutoplay(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (conn?.saveData) return true;
  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return true;
  return false;
}


export default function VideoBackground({
  videoId,
  title,
  subtitle,
  breadcrumb,
  videoLabel,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [posterSrc, setPosterSrc] = useState<string | null>(null);

  const mount = useCallback(async () => {
    if (!videoId) return;
    try {
      await loadYouTubeApi();
      const YT = window.YT;
      // The API swaps `hostRef` for an <iframe>, so re-read the node the
      // player is being attached to rather than trusting the earlier ref.
      const host = hostRef.current;
      if (!YT || !host) return;

      const player = new YT.Player(host, {
        videoId,
        playerVars: {
          autoplay: 1,
          // Without this the browser blocks autoplay outright.
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          // Required for loop to work on a single-video embed.
          playlist: videoId,
          loop: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setReady(true);
            setPlaying(true);
            setMuted(true);
          },
          onError: () => {
            // Embedding disabled, age gate, etc. Fall back to the poster.
            setReady(false);
            setPlaying(false);
          },
        },
      });

      playerRef.current = player;
    } catch {
      // Network or API failure: the poster layer stays visible.
      setReady(false);
      setPlaying(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    // Reduced motion and data saver still allow a manual Play.
    if (!shouldSkipAutoplay()) {
      void mount();
    }
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mount, videoId]);

  /**
   * Keep the 16:9 iframe covering the whole hero. A 50% offset plus a
   * scale is the object-fit:cover stand-in, because an iframe cannot
   * take `object-fit`. 1.5 covers the worst-case crop for a 16:9 frame
   * inside a portrait-ish container.
   */
  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!ready || !wrap || !host) return;
    const frame = host.tagName === "IFRAME" ? host : host.querySelector("iframe");
    if (!frame) return;
    frame.style.minWidth = "100%";
    frame.style.minHeight = "100%";
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.transform = "translate(-50%, -50%) scale(1.5)";
    frame.style.transformOrigin = "center center";
    frame.style.left = "50%";
    frame.style.top = "50%";
    frame.style.position = "absolute";
    frame.style.border = "0";
  }, [ready]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      // Not mounted yet (poster state): start it on demand.
      void mount();
      return;
    }
    if (playing) {
      p.pauseVideo();
      setPlaying(false);
    } else {
      p.playVideo();
      setPlaying(true);
    }
  }, [mount, playing]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {

      p.mute();
      setMuted(true);
    }
  }, []);

  if (!videoId) return null;
  return (
    <section className="relative isolate overflow-hidden bg-brand-900">
      {/* Video layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden" ref={wrapRef}>
        {/* maxres is not published for every video, so fall back. */}
        <img
          // eslint-disable-next-line @next/next/no-img-element
          src={posterSrc ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          aria-hidden="true"
          onError={() => {
            if (posterSrc) return;
            setPosterSrc(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          ref={hostRef}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Readability scrim - the video is decorative, the text is not. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/90 via-brand-900/80 to-brand-700/85"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
        {title && (
          <h1 className="text-3xl font-extrabold text-white drop-shadow-sm sm:text-4xl">
            {title}
          </h1>
        )}
        {subtitle && <div className="mt-3 max-w-2xl text-brand-100">{subtitle}</div>}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause background video" : "Play background video"}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute background video" : "Mute background video"}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>

        {/* Screen-reader only description of the decorative video. */}
        <p className="sr-only">{videoLabel ?? "Background video"}</p>
      </div>
    </section>
  );
}
