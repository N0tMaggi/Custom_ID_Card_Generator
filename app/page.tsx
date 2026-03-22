"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Minus, MonitorCog, Moon, Plus, Printer, Sparkles, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import CardEditor from "@/components/card-editor"
import IdCard from "@/components/id-card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useIsMobile } from "@/hooks/use-mobile"
import { CARD_HEIGHT, CARD_WIDTH, CardLayer, DEFAULT_CARD_DATA, type CardData } from "@/lib/card-types"

const HEADER_HEIGHT = 88

export default function Home() {
  const [data, setData] = useState<CardData>(DEFAULT_CARD_DATA)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("photo")
  const [downloading, setDownloading] = useState(false)
  const [fitScale, setFitScale] = useState(1)
  const [zoomPercent, setZoomPercent] = useState(116)
  const [mounted, setMounted] = useState(false)
  const previewShellRef = useRef<HTMLDivElement>(null)
  const exportCardRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const node = previewShellRef.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const availableWidth = Math.max(entry.contentRect.width - 32, 240)
      const nextScale = Math.min(availableWidth / CARD_WIDTH, 1.35)
      setFitScale(nextScale)
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const previewScale = fitScale * (zoomPercent / 100)

  const updateLayer = (layerId: string, patch: Partial<CardLayer>) => {
    setData((current) => ({
      ...current,
      layers: current.layers.map((layer) => (layer.id === layerId ? ({ ...layer, ...patch } as CardLayer) : layer)) as CardLayer[],
    }))
  }

  const handleDownload = async () => {
    if (!exportCardRef.current) return

    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await renderCardInIsolatedFrame(exportCardRef.current, async (cardNode) => {
        return html2canvas(cardNode, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        })
      })
      const link = document.createElement("a")
      link.download = `cosplay-license-${slugify(data.content.name || "card")}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Export failed", error)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = async () => {
    if (!exportCardRef.current) return

    const popup = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900")
    if (!popup) return

    const markup = exportCardRef.current.outerHTML
    popup.document.open()
    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Card</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              display: flex;
              justify-content: center;
              padding: 12mm;
              box-sizing: border-box;
            }
            [data-card-print] {
              width: 85.6mm !important;
              height: 54mm !important;
            }
            [data-card-surface] {
              box-shadow: none !important;
            }
            @page {
              size: auto;
              margin: 12mm;
            }
          </style>
        </head>
        <body>${markup}</body>
      </html>
    `)
    popup.document.close()

    const images = Array.from(popup.document.images)
    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve()
              return
            }
            image.onload = () => resolve()
            image.onerror = () => resolve()
          })
      )
    )

    popup.focus()
    popup.print()
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,175,214,0.35),_transparent_28%),radial-gradient(circle_at_82%_18%,_rgba(187,215,255,0.28),_transparent_24%),linear-gradient(180deg,_#fff8fc_0%,_#f7f5ff_45%,_#eef7ff_100%)] text-foreground transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.12),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(59,130,246,0.14),_transparent_22%),linear-gradient(180deg,_#080913_0%,_#0e1323_46%,_#09111e_100%)]">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8%] top-[-6%] h-72 w-72 rounded-full bg-pink-200/45 blur-3xl dark:bg-pink-500/12" />
        <div className="absolute right-[-7%] top-[10%] h-80 w-80 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-500/12" />
        <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-500/10" />
      </div>

      <header className="sticky top-0 z-40 h-[88px] border-b border-white/55 bg-white/70 backdrop-blur-2xl dark:border-white/8 dark:bg-slate-950/55">
        <div className="flex h-full items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary px-3 py-2 text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold sm:text-lg">Custom ID Card Generator</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Live builder with fullscreen preview, drag layout and parody-only export.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </div>
      </header>

      <main style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }} className="px-3 pb-3 pt-3">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="h-full overflow-hidden rounded-[2rem] border border-white/45 bg-white/45 shadow-[0_30px_80px_-32px_rgba(219,39,119,0.25)] backdrop-blur-2xl dark:border-white/8 dark:bg-slate-950/35 dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]"
        >
          <ResizablePanel defaultSize={24} minSize={18}>
            <div className="h-full overflow-hidden p-3">
              <div className="h-full overflow-y-auto rounded-[1.6rem] border border-white/40 bg-white/70 p-3 shadow-lg shadow-pink-100/25 dark:border-white/8 dark:bg-slate-900/70 dark:shadow-none">
                <CardEditor
                  data={data}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                  onChange={setData}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-white/40 dark:bg-white/10" />

          <ResizablePanel defaultSize={76} minSize={35}>
            <section className="flex h-full flex-col p-3">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-[1.6rem] border border-white/40 bg-white/72 px-5 py-4 shadow-lg shadow-pink-100/25 dark:border-white/8 dark:bg-slate-900/72 dark:shadow-none">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Live Preview</div>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">Fullscreen studio preview</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Drag the middle divider from left to right to resize editor and preview live.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-border/60 bg-background/80 px-4 py-3 dark:bg-slate-950/65">
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <div>Card size: 85.6mm x 54mm</div>
                    <div>Fullscreen workspace</div>
                  </div>
                  <div className="hidden h-8 w-px bg-border/70 sm:block" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoomPercent((current) => Math.max(50, current - 10))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground transition hover:bg-muted/50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-20 text-center text-sm font-semibold text-foreground">{zoomPercent}%</div>
                    <button
                      type="button"
                      onClick={() => setZoomPercent((current) => Math.min(260, current + 10))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground transition hover:bg-muted/50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={260}
                    step={5}
                    value={zoomPercent}
                    onChange={(event) => setZoomPercent(Number(event.target.value))}
                    className="w-40 accent-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setZoomPercent(100)}
                    className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
                  >
                    Fit
                  </button>
                </div>
              </div>

              <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-[1.8rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.55))] p-4 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))]">
                <div
                  ref={previewShellRef}
                  className="relative h-full w-full overflow-auto rounded-[1.4rem] border border-border/40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),rgba(244,245,255,0.86))] p-5 dark:border-white/8 dark:bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.92),rgba(15,23,42,0.98))]"
                >
                  <div className="absolute left-5 top-5 z-10 rounded-2xl border border-border/60 bg-background/85 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm dark:bg-slate-950/70">
                    <div className="flex items-center gap-2">
                      <MonitorCog className="h-3.5 w-3.5" />
                      Studio canvas
                    </div>
                  </div>
                  <div className="flex min-h-full min-w-max items-center justify-center px-4 py-12">
                    <div
                      style={{
                        width: CARD_WIDTH * previewScale,
                        height: CARD_HEIGHT * previewScale,
                      }}
                    >
                      <div
                        style={{
                          width: CARD_WIDTH,
                          height: CARD_HEIGHT,
                          transform: `scale(${previewScale})`,
                          transformOrigin: "top left",
                        }}
                      >
                        <IdCard
                          data={data}
                          selectedLayerId={selectedLayerId}
                          onSelectLayer={setSelectedLayerId}
                          onLayerChange={updateLayer}
                          interactive
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <div
        data-print-root
        className="pointer-events-none fixed -left-[200vw] top-0"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <IdCard ref={exportCardRef} data={data} />
      </div>
    </div>
  )
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function renderCardInIsolatedFrame<T>(
  sourceCard: HTMLDivElement,
  render: (cardNode: HTMLDivElement) => Promise<T>
) {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.position = "fixed"
  iframe.style.left = "-99999px"
  iframe.style.top = "0"
  iframe.style.width = `${CARD_WIDTH}px`
  iframe.style.height = `${CARD_HEIGHT}px`
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    if (!doc) {
      throw new Error("Could not create export document")
    }

    doc.open()
    doc.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: ${CARD_WIDTH}px;
              height: ${CARD_HEIGHT}px;
              background: transparent;
              overflow: hidden;
            }
            body {
              display: flex;
              align-items: flex-start;
              justify-content: flex-start;
            }
            #mount {
              width: ${CARD_WIDTH}px;
              height: ${CARD_HEIGHT}px;
            }
          </style>
        </head>
        <body>
          <div id="mount"></div>
        </body>
      </html>
    `)
    doc.close()

    const mount = doc.getElementById("mount")
    if (!mount) {
      throw new Error("Could not mount export card")
    }

    const clone = sourceCard.cloneNode(true) as HTMLDivElement
    clone.style.width = `${CARD_WIDTH}px`
    clone.style.height = `${CARD_HEIGHT}px`
    mount.appendChild(clone)

    const images = Array.from(clone.querySelectorAll("img"))
    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve()
              return
            }
            image.onload = () => resolve()
            image.onerror = () => resolve()
          })
      )
    )

    return await render(clone)
  } finally {
    iframe.remove()
  }
}
