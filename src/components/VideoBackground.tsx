"use client";


import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/site/LocaleContext";
import { ui } from "@/lib/strings";

type Props = {
  /** YouTube video id, e.g. "lpP569Cv1x0". */
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
 * - The scrim is neutral slate rather than brand green. Tinting the
 *   footage with the brand palette made it look muddy and unclear, so
 *   the shading is a left-weighted gradient that leaves most of the
 *   frame clean while still backing the headline.
 * - The iframe is scaled to cover from its measured box, so the video
 *   is cropped as little as possible and does not look over-zoomed.
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

export default function VideoBackground({
  videoId,
  title,
  subtitle,
  breadcrumb,
  videoLabel,
}: Props) {
  const locale = useLocale();
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
            // Belt and braces: the `autoplay` playerVar is honoured by
            // most browsers, but some ignore it for an iframe that is
            // not yet in the viewport. Asking explicitly is the only
            // reliable way to get playback started.
            try {
              player.mute();
              player.playVideo();
            } catch {
              // Autoplay refused (very rare while muted) - poster stays.
            }
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
    // Always mount and try to play. The player is muted, which is the
    // only condition browsers allow to autoplay, so this is safe even
    // for reduced-motion/data-saver visitors - they simply get a
    // poster-quality first frame and can hit Pause immediately.
    void mount();
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mount, videoId]);

  /**
   * Make the 16:9 iframe cover the hero without distorting it.
   *
   * Two things this must get right:
   *
   * - The IFrame API REPLACES the host element with the <iframe>, so
   *   `hostRef` still points at a detached div and querying it finds
   *   nothing. `player.getIframe()` is the supported way to reach the
   *   real node.
   * - That iframe is created on a microtask after construction, so it
   *   is not guaranteed to exist on the first pass. We poll briefly.
   *
   * An iframe cannot take `object-fit`, so the cover maths is done here:
   * scale by whichever axis is relatively shorter. Computing it from
   * the measured box (rather than a hard-coded 1.5) keeps the crop
   * minimal, which is what stops the footage looking soft. A
   * ResizeObserver keeps it correct on mobile and on rotation.
   */
  useEffect(() => {
    const wrap = wrapRef.current;
    const player = playerRef.current;
    if (!ready || !wrap || !player) return;

    const VIDEO_RATIO = 16 / 9;

    const fit = () => {
      const frame = player.getIframe();
      if (!frame) return false;
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return true;

      const boxRatio = width / height;
      // Must be the true cover value: any smaller and the element stops
      // covering the box, exposing the letterbox bars as black edges.
      const scale =
        boxRatio > VIDEO_RATIO ? boxRatio / VIDEO_RATIO : VIDEO_RATIO / boxRatio;

      frame.style.position = "absolute";
      frame.style.left = "50%";
      frame.style.top = "50%";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.minWidth = "0";
      frame.style.minHeight = "0";
      frame.style.border = "0";
      frame.style.margin = "0";
      // The video is decorative; never let it eat clicks on the
      // Play/Mute controls rendered above it.
      frame.style.pointerEvents = "none";
      frame.style.transformOrigin = "center center";
      frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
      // Only the first styling pass adds the transition, so later
      // play/pause flips do not re-trigger it.
      if (!frame.style.transition) {
        frame.style.transition = "opacity 700ms ease";
      }
      frame.style.opacity = playing ? "1" : "0";
      return true;
    };

    // The iframe may not exist yet on the very first call.
    let attempts = 0;
    const ensure = () => {
      if (fit() || attempts > 20) return;
      attempts += 1;
      window.setTimeout(ensure, 50);
    };
    ensure();

    const observer = new ResizeObserver(() => fit());
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [ready, playing]);

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
    <section className="wave-bg-deep relative isolate overflow-hidden">
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
        {/*
          Mount point only. The IFrame API swaps this div for an
          <iframe>, so nothing visual can live here - the iframe is
          positioned and faded directly in the fit effect.
        */}
        <div ref={hostRef} />
      </div>

      {/*
        Readability scrim - the video is decorative, the text is not.
        Deliberately neutral (slate/black) rather than brand green: a
        green wash turned the footage muddy.

        This footage is high-key - lots of near-white in the frame - so
        white copy sat on white and vanished. The scrim therefore runs
        dark on the left where the copy is, and clears to the right so
        the picture still reads. The top band keeps the breadcrumb and
        headline legible. Keep the left stop genuinely dark; do not
        lighten it for a "cleaner" look without re-checking contrast.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/25"
      />
      {/* Just enough top shading to keep the breadcrumb legible. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-slate-950/70 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
        {title && (
          <h1 className="max-w-3xl text-3xl font-extrabold text-white drop-shadow-sm sm:text-4xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <div className="mt-3 max-w-xl text-brand-100 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
            {subtitle}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              playing
                ? `${ui("labelVideoPause", locale)} — ${ui("labelBackgroundVideo", locale)}`
                : `${ui("labelVideoPlay", locale)} — ${ui("labelBackgroundVideo", locale)}`
            }
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
            {ui(playing ? "labelVideoPause" : "labelVideoPlay", locale)}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={ui(muted ? "labelVideoUnmute" : "labelVideoMute", locale)}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
            {ui(muted ? "labelVideoUnmute" : "labelVideoMute", locale)}
          </button>
        </div>

        {/* Screen-reader only description of the decorative video. */}
        <p className="sr-only">{videoLabel ?? ui("labelBackgroundVideo", locale)}</p>
      </div>
    </section>
  );
}
