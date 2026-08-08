"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export type VideoSectionItem = {
  id: string;
  videoUrl: string;
  posterUrl: string | null;
  caption: string | null;
};

export type VideoSectionData = {
  enabled: boolean;
  heading: string;
  items: VideoSectionItem[];
};

/**
 * A row of portrait, silently-looping video cards with a caption overlay —
 * dashboard-managed at Theme > Video Section. Clicking a card opens it in a
 * popup that plays with sound.
 */
export function VideoSection({ data }: { data: VideoSectionData }) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const active = data.items.find((item) => item.id === openId) ?? null;

  if (!data.enabled || data.items.length === 0) return null;

  return (
    <section className="w-full bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {data.heading}
        </h2>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {data.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              aria-label={item.caption ? `Play video: ${item.caption}` : "Play video"}
              className="relative aspect-[9/16] w-[65%] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted text-left sm:w-[38%] lg:w-[19%]"
            >
              <video
                src={item.videoUrl}
                poster={item.posterUrl ?? undefined}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
              {item.caption && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute inset-x-3 bottom-3 text-sm font-medium text-white">
                    {item.caption}
                  </p>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent
          showCloseButton={false}
          className="aspect-[9/16] h-[85vh] w-auto max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border-none bg-black p-0 sm:max-w-sm"
        >
          {active && (
            <video
              key={active.id}
              src={active.videoUrl}
              poster={active.posterUrl ?? undefined}
              autoPlay
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={() => setOpenId(null)}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default VideoSection;
