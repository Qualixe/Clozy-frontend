"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// A horizontal, swipeable product-grid slider.
//
// Unlike the generic `Carousel`, the nav buttons here center themselves on
// the actual rendered height of the product image — not a guessed
// percentage of the whole card (image + title + price). Any slide wraps its
// image in `ProductCarouselMedia`, whose height is measured with a
// ResizeObserver, so the buttons land in the right spot at any column count
// or breakpoint, automatically.
// ---------------------------------------------------------------------------

type ProductCarouselApi = UseEmblaCarouselType[1]
type UseProductCarouselParameters = Parameters<typeof useEmblaCarousel>
type ProductCarouselOptions = UseProductCarouselParameters[0]
type ProductCarouselPlugin = UseProductCarouselParameters[1]

type ProductCarouselProps = {
  opts?: ProductCarouselOptions
  plugins?: ProductCarouselPlugin
  setApi?: (api: ProductCarouselApi) => void
}

type ProductCarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  mediaHeight: number | null
  registerMediaRef: (node: HTMLElement | null) => void
} & ProductCarouselProps

const ProductCarouselContext =
  React.createContext<ProductCarouselContextProps | null>(null)

function useProductCarousel() {
  const context = React.useContext(ProductCarouselContext)

  if (!context) {
    throw new Error(
      "useProductCarousel must be used within a <ProductCarousel />"
    )
  }

  return context
}

function ProductCarousel({
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ProductCarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: "x" },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [mediaHeight, setMediaHeight] = React.useState<number | null>(null)
  const mediaNodeRef = React.useRef<HTMLElement | null>(null)

  const registerMediaRef = React.useCallback((node: HTMLElement | null) => {
    mediaNodeRef.current = node
  }, [])

  const onSelect = React.useCallback((api: ProductCarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  React.useEffect(() => {
    const node = mediaNodeRef.current
    if (!node) return

    const measure = () => setMediaHeight(node.getBoundingClientRect().height)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [api])

  return (
    <ProductCarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        mediaHeight,
        registerMediaRef,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="product-carousel"
        {...props}
      >
        {children}
      </div>
    </ProductCarouselContext.Provider>
  )
}

function ProductCarouselContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { carouselRef } = useProductCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="product-carousel-content"
    >
      <div className={cn("-ml-3 flex", className)} {...props} />
    </div>
  )
}

function ProductCarouselItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="product-carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full pl-3",
        className
      )}
      {...props}
    />
  )
}

/**
 * Wrap a slide's image element with this. Its rendered height is measured
 * and used to vertically center the prev/next buttons on the image itself.
 */
function ProductCarouselMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { registerMediaRef } = useProductCarousel()

  return <div ref={registerMediaRef} className={cn(className)} {...props} />
}

function ProductCarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  style,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev, canScrollNext, mediaHeight } = useProductCarousel()

  // Nothing to page through at all (e.g. fewer items than fit in one view)
  // — render nothing rather than a disabled button stranded far from the
  // visible cards.
  if (!canScrollPrev && !canScrollNext) return null

  return (
    <Button
      data-slot="product-carousel-previous"
      variant={variant}
      size={size}
      style={{ ...(mediaHeight ? { top: mediaHeight / 2 } : {}), ...style }}
      className={cn(
        "absolute left-2 -translate-y-1/2 touch-manipulation rounded-full lg:-left-12",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function ProductCarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  style,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollPrev, canScrollNext, mediaHeight } = useProductCarousel()

  // Nothing to page through at all (e.g. fewer items than fit in one view)
  // — render nothing rather than a disabled button stranded far from the
  // visible cards.
  if (!canScrollPrev && !canScrollNext) return null

  return (
    <Button
      data-slot="product-carousel-next"
      variant={variant}
      size={size}
      style={{ ...(mediaHeight ? { top: mediaHeight / 2 } : {}), ...style }}
      className={cn(
        "absolute right-2 -translate-y-1/2 touch-manipulation rounded-full lg:-right-12",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type ProductCarouselApi,
  ProductCarousel,
  ProductCarouselContent,
  ProductCarouselItem,
  ProductCarouselMedia,
  ProductCarouselPrevious,
  ProductCarouselNext,
  useProductCarousel,
}
