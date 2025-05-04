import { useCallback } from "react";

export const TRIM_HANDLE_WIDTH = 12;
export const TRIM_HANDLE_HEIGHT = 32;
export const TRIM_BAR_HEIGHT = 8;
export const TRIM_STEP = 0.1; // seconds

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface TrimBarProps {
  trimStart: number;
  trimEnd: number;
  duration: number;
  dragging: null | "start" | "end";
  setDragging: (d: null | "start" | "end") => void;
  setTrim: (start: number, end: number) => void;
  containerWidth: number;
  videoId?: string;
  onTrimChange: (start: number, end: number) => void;
}

const TrimBar: React.FC<TrimBarProps> = ({
  trimStart,
  trimEnd,
  duration,
  dragging,
  setDragging,
  setTrim,
  containerWidth,
  videoId,
  onTrimChange,
}) => {
  const getPosPercentNum = useCallback(
    (time: number) => (duration > 0 ? (time / duration) * 100 : 0),
    [duration]
  );
  const getTime = useCallback(
    (pos: number) => (duration > 0 ? (pos / containerWidth) * duration : 0),
    [containerWidth, duration]
  );

  const handleDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dragging) return;
    const rect = (
      e.target as HTMLDivElement
    ).parentElement!.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(containerWidth, x));
    const time = Math.round(getTime(x) / TRIM_STEP) * TRIM_STEP;
    if (dragging === "start") {
      if (time >= trimEnd - TRIM_STEP) return;
      setTrim(time, trimEnd);
    } else if (dragging === "end") {
      if (time <= trimStart + TRIM_STEP) return;
      setTrim(trimStart, Math.min(duration, time));
    }
  };

  const handleDragEnd = () => {
    if (!videoId) return;
    onTrimChange(trimStart, trimEnd);
    setDragging(null);
  };

  return (
    <div className="w-full">
      <div
        className="relative flex items-center w-full"
        style={{ height: TRIM_BAR_HEIGHT * 3 }}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div
          className="absolute top-1/2 left-0 rounded-lg bg-zinc-200 -translate-y-1/2 w-full"
          style={{ height: TRIM_BAR_HEIGHT }}
        />
        <div
          className="absolute top-1/2 bg-indigo-300 max-w-full rounded-lg -translate-y-1/2"
          style={{
            left: `${getPosPercentNum(trimStart)}%`,
            width: `${
              getPosPercentNum(trimEnd) - getPosPercentNum(trimStart)
            }%`,
            height: TRIM_BAR_HEIGHT,
          }}
        />
        {/* Start handle */}
        <div
          role="slider"
          aria-valuenow={trimStart}
          aria-valuemin={0}
          aria-valuemax={trimEnd - TRIM_STEP}
          tabIndex={0}
          className="absolute z-10 cursor-ew-resize bg-primary shadow rounded-lg"
          style={{
            left: `calc(${getPosPercentNum(trimStart)}% - ${
              TRIM_HANDLE_WIDTH / 2
            }px)`,
            width: TRIM_HANDLE_WIDTH,
            height: TRIM_HANDLE_HEIGHT,
            top: `calc(50% - ${TRIM_HANDLE_HEIGHT / 2}px)`,
          }}
          onMouseDown={() => setDragging("start")}
        />
        {/* End handle */}
        <div
          role="slider"
          aria-valuenow={trimEnd}
          aria-valuemin={trimStart + TRIM_STEP}
          aria-valuemax={duration}
          tabIndex={0}
          className="absolute z-10 cursor-ew-resize bg-primary shadow rounded-lg left"
          style={{
            left: `calc(${getPosPercentNum(trimEnd)}% - ${
              TRIM_HANDLE_WIDTH / 2
            }px)`,
            width: TRIM_HANDLE_WIDTH,
            height: TRIM_HANDLE_HEIGHT,
            top: `calc(50% - ${TRIM_HANDLE_HEIGHT / 2}px)`,
          }}
          onMouseDown={() => setDragging("end")}
        />
      </div>
      <div className="flex w-full justify-between mt-2">
        <span className="text-xs text-zinc-400">{formatTime(trimStart)}</span>
        <span className="text-xs text-zinc-400">{formatTime(trimEnd)}</span>
      </div>
    </div>
  );
};

export default TrimBar;
