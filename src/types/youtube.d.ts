declare global {
  interface Window {
    YT: {
      Player: new (
        element: string | HTMLElement,
        options: unknown
      ) => import("@/components/Player").YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export {};
