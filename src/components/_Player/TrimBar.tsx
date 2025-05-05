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

  const getPointerX = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ): number => {
    if ("touches" in e && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    if ("clientX" in e) {
      return e.clientX;
    }
    return 0;
  };

  const handleDrag = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!dragging) return;
    // Prevent scrolling on touch
    if ("touches" in e) e.preventDefault();
    const rect = (
      e.target as HTMLDivElement
    ).parentElement!.getBoundingClientRect();
    let x = getPointerX(e) - rect.left;
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

  const handleDragEnd = (
    e?:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    if (e && "touches" in e) e.preventDefault();
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
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
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
          onTouchStart={(e) => {
            e.preventDefault();
            setDragging("start");
          }}
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
          onTouchStart={(e) => {
            e.preventDefault();
            setDragging("end");
          }}
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
