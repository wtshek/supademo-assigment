"use client";

import Player from "@/components/Player";
import Sidebar from "@/components/Sidebar";
import { YouTubeVideo } from "@/types/types";
import { useState, useEffect } from "react";
import Searchbar from "@/components/Searchbar";
import { useVideosFetch } from "@/hooks/useVideosFetch";
import { API_PATH, PAGE_SIZE, MOBILE_BREAKPOINT } from "@/utils/const";
import Image from "next/image";

export default function Home() {
  const { data, loading, hasMore, loadMore, onSearch } =
    useVideosFetch<YouTubeVideo>({
      apiUrl: API_PATH,
      pageSize: PAGE_SIZE,
    });
  const [selectedVideo, setSelectedVideo] = useState<
    YouTubeVideo | undefined
  >();

  useEffect(() => {
    if (!selectedVideo && data && data.length > 0) {
      setSelectedVideo(data[0]);
    }
  }, [data, selectedVideo]);

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    if (
      typeof window !== "undefined" &&
      window.innerWidth < MOBILE_BREAKPOINT
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="flex lg:items-center flex-col lg:flex-row gap-4">
        <Image src="/supademo_logo.svg" alt="logo" width={148} height={32} />
        <Searchbar className="w-full lg:w-2/3 mx-auto" onSearch={onSearch} />
      </div>
      <div className="flex flex-col gap-6 mt-5">
        <div className="flex flex-col-reverse lg:flex-row gap-6">
          <Sidebar
            videos={data}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onVideoSelect={handleVideoSelect}
            selectedVideoId={selectedVideo?.id.videoId}
            className="lg:w-[35vw]"
          />
          <div className="lg:w-[55vw]">
            <Player video={selectedVideo} />
          </div>
        </div>
      </div>
    </>
  );
}
