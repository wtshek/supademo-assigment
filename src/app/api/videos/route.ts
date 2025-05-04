import { NextRequest, NextResponse } from "next/server";
import videos from "@/data/videos.json";
import { YouTubeSearchListResponse, YouTubeVideo } from "@/types/types";

const DEFAULT_START = 0;
const DEFAULT_LIMIT = 10;

const containsSearch = (video: YouTubeVideo, search: string): boolean => {
  const { title, description } = video.snippet;
  return (
    title.toLowerCase().includes(search) ||
    description.toLowerCase().includes(search)
  );
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.toLowerCase() || "";
    const start = parseInt(searchParams.get("start") || "", 10);
    const limit = parseInt(searchParams.get("limit") || "", 10);

    const startIdx = Number.isNaN(start) ? DEFAULT_START : start;
    const limitNum = Number.isNaN(limit) ? DEFAULT_LIMIT : limit;

    const { items } = videos as YouTubeSearchListResponse;
    let result: YouTubeVideo[] = items;

    if (search) {
      result = items.filter((item: YouTubeVideo) =>
        containsSearch(item, search)
      );
    }

    return NextResponse.json(result.slice(startIdx, startIdx + limitNum));
  } catch {
    return NextResponse.json(
      { error: "Failed to load videos data." },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
