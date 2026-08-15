import type { VideoSectionData } from "@/components/video-section";

export async function getVideoSection(): Promise<VideoSectionData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/video-section`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
