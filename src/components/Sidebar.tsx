"use client";

import React, { useRef } from "react";
import { YouTubeVideo } from "@/types/types";
import { FaSpinner } from "react-icons/fa";

interface SidebarProps {
  videos: YouTubeVideo[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onVideoSelect: (video: YouTubeVideo) => void;
  selectedVideoId?: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  videos,
  loading,
  hasMore,
  onLoadMore,
  onVideoSelect,
  selectedVideoId,
  className = "",
}) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLLIElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );
    if (loadMoreTriggerRef.current) {
      observer.current.observe(loadMoreTriggerRef.current);
    }
    return () => observer.current?.disconnect();
  }, [videos, hasMore, loading, onLoadMore]);

  const handleVideoSelect = (video: YouTubeVideo) => {
    onVideoSelect(video);
  };

  return (
    <aside
      ref={asideRef}
      className={`w-full lg:max-h-screen lg:overflow-y-scroll pretty-scrollbar ${className}`}
    >
      <ul className="flex flex-col gap-4">
        {videos.map((video, idx) => {
          const loadMoreTrigger = idx === videos.length - 1;
          const isSelected = video.id.videoId === selectedVideoId;
          return (
            <li
              key={`${idx}-${video.id.videoId}`}
              ref={loadMoreTrigger ? loadMoreTriggerRef : undefined}
              className={`w-full rounded-lg shadow p-4 hover:bg-indigo-50 hover:text-gray-900 transition-colors cursor-pointer flex gap-2 items-center ${
                isSelected ? "bg-indigo-100 text-indigo-700" : ""
              }`}
              onClick={() => handleVideoSelect(video)}
            >
              <div>
                <div
                  className={`font-semibold text-lg mb-1 ${
                    isSelected ? "text-primary" : "text-black"
                  }`}
                >
                  {video.snippet.title}
                </div>
                <div className="text-sm text-zinc-600 line-clamp-2">
                  {video.snippet.description}
                </div>
              </div>
            </li>
          );
        })}
        {loading && <FaSpinner className="animate-spin mx-auto my-4" />}
        {!hasMore && !loading && videos.length > 0 && (
          <li className="text-center text-zinc-400 mt-4">No more videos.</li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
