"use client";

import React, { useEffect, useRef, useState } from "react";
import { YT_IFRAME_API_SRC, VIDEO_TRIM_STORAGE_KEY } from "@/utils/const";
import { YouTubeVideo, VideoTrimRecord } from "@/types/types";
import { FaPlay, FaPause } from "react-icons/fa";
import TrimBar from "./_Player/TrimBar";

// Control constants
export const CONTROL_BUTTON_SIZE = 36;
export const CONTROL_ICON_COLOR = "#171717";

// Types
interface PlayerState {
  playing: boolean;
  duration: number;
  trimStart: number;
  trimEnd: number;
}

// Types for YT
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
}

interface PlayerProps {
  video?: YouTubeVideo;
}

// Helper to get and set trim data in localStorage
const getTrimData = (videoId: string, duration: number): VideoTrimRecord => {
  const raw = localStorage.getItem(VIDEO_TRIM_STORAGE_KEY);
  const data: Record<string, VideoTrimRecord> = raw ? JSON.parse(raw) : {};
  let record = data[videoId];
  if (!record) {
    record = { videoId, startTime: 0, endTime: duration };
    data[videoId] = record;
    localStorage.setItem(VIDEO_TRIM_STORAGE_KEY, JSON.stringify(data));
  }
  return record;
};

const setTrimData = (videoId: string, startTime: number, endTime: number) => {
  const raw = localStorage.getItem(VIDEO_TRIM_STORAGE_KEY);
  const data: Record<string, VideoTrimRecord> = raw ? JSON.parse(raw) : {};
  data[videoId] = { videoId, startTime, endTime };
  localStorage.setItem(VIDEO_TRIM_STORAGE_KEY, JSON.stringify(data));
};

const Player: React.FC<PlayerProps> = ({ video }) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState(false);
  const [state, setState] = useState<PlayerState>({
    playing: false,
    duration: 0,
    trimStart: 0,
    trimEnd: 0, // will be set to duration after load
  });
  const [dragging, setDragging] = useState<null | "start" | "end">(null);
  const PLAYER_HEIGHT = 390;
  const PLAYER_WIDTH = 640;
  const [containerWidth, setContainerWidth] = useState<number>(PLAYER_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }
    const tag = document.createElement("script");
    tag.src = YT_IFRAME_API_SRC;
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
    return () => {
      tag.remove();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize player
  useEffect(() => {
    if (!apiReady || !iframeRef.current) return;

    // Clean up any previous player instance
    if (playerRef.current) {
      // @ts-expect-error: destroy is available on YT.Player but not in our YTPlayer type
      playerRef.current.destroy?.();
      playerRef.current = null;
    }

    playerRef.current = new window.YT.Player(iframeRef.current, {
      height: PLAYER_HEIGHT.toString(),
      width: PLAYER_WIDTH.toString(),
      videoId: video?.id.videoId,
      playerVars: {
        rel: 0,
      },
      events: {
        onReady: (event: { target: YTPlayer }) => {
          const duration = event.target.getDuration();

          let trimStart = 0;
          let trimEnd = duration;
          if (video?.id.videoId) {
            const record = getTrimData(video.id.videoId, duration);
            trimStart = record.startTime;
            trimEnd = record.endTime;
          }
          setState((s) => ({
            ...s,
            duration,
            trimStart,
            trimEnd,
          }));
        },
        onStateChange: (event: { data: number }) => {
          if (event.data === 1) setState((s) => ({ ...s, playing: true }));
          if (event.data === 2 || event.data === 0)
            setState((s) => ({ ...s, playing: false }));
        },
      },
    });

    // Cleanup on unmount or before re-initializing
    return () => {
      if (playerRef.current) {
        // @ts-expect-error: destroy is available on YT.Player but not in our YTPlayer type
        playerRef.current.destroy?.();
        playerRef.current = null;
      }
    };
  }, [apiReady, video]);

  // Play trimmed section
  const handlePlay = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(state.trimStart, true);
    playerRef.current.playVideo();
    setState((s) => ({ ...s, playing: true }));
  };
  const handlePause = () => {
    if (!playerRef.current) return;
    playerRef.current.pauseVideo();
    setState((s) => ({ ...s, playing: false }));
  };

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(state.trimStart, true);
    playerRef.current.pauseVideo();
  }, [state.trimStart]);

  // Effect to track play time and stop at trimEnd
  useEffect(() => {
    if (!state.playing || !playerRef.current) return;
    const interval = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
      if (currentTime >= state.trimEnd) {
        playerRef.current?.pauseVideo();
        playerRef.current?.seekTo(state.trimEnd, true);
        setState((s) => ({ ...s, playing: false }));
      }
    }, 500); // check every 200ms
    return () => clearInterval(interval);
  }, [state.playing, state.trimEnd]);

  return (
    <div className="w-full flex flex-col" ref={containerRef}>
      <div>
        <div
          className="mb-4 w-full"
          style={{
            aspectRatio: `${PLAYER_WIDTH} / ${PLAYER_HEIGHT}`,
          }}
        >
          <div ref={iframeRef} className="rounded-lg w-full h-full" />
        </div>
        <div className="flex gap-4">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            <button
              aria-label={state.playing ? "Pause" : "Play"}
              onClick={state.playing ? handlePause : handlePlay}
              className="flex item-center justify-center hover:cursor-pointer w-fit h-fit"
            >
              {state.playing ? <FaPause /> : <FaPlay />}
            </button>
          </div>
          {/* Trim Bar */}
          <TrimBar
            trimStart={state.trimStart}
            trimEnd={state.trimEnd}
            duration={state.duration}
            dragging={dragging}
            setDragging={setDragging}
            setTrim={(start: number, end: number) =>
              setState((s) => ({ ...s, trimStart: start, trimEnd: end }))
            }
            containerWidth={containerWidth}
            videoId={video?.id.videoId}
            onTrimChange={(start: number, end: number) => {
              if (video?.id.videoId) setTrimData(video.id.videoId, start, end);
            }}
          />
        </div>
      </div>
      <div className="font-bold text-lg lg:text-xl mb-1">
        {video?.snippet.title}
      </div>
      <div className="text-zinc-600 text-sm">{video?.snippet.description}</div>
    </div>
  );
};

export default Player;
