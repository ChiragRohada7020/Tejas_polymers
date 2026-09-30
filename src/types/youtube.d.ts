/**
 * Minimal typings for the slice of the YouTube IFrame API we use.
 *
 * The global `Window` augmentation lives here rather than in the
 * component so `VideoBackground` stays free of `any` casts.
 */

/** The player instance handed back by `new YT.Player(...)`. */
type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
};

interface Window {
  YT?: {
    Player: new (
      element: HTMLElement | string,
      options: Record<string, unknown>
    ) => YouTubePlayer;
  };
  onYouTubeIframeAPIReady?: () => void;
}
