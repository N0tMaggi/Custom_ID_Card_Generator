"use client"

import { useEffect, useRef, useState } from "react"
import {
  Download,
  FileDown,
  FileUp,
  Minus,
  MonitorCog,
  Moon,
  Plus,
  Printer,
  Sparkles,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import CardEditor from "@/components/card-editor"
import IdCard from "@/components/id-card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CardLayer,
  DEFAULT_BACK_CARD_DATA,
  DEFAULT_CARD_DATA,
  applyThemePreset,
  applyThemePresetToBack,
  type CardData,
} from "@/lib/card-types"

const HEADER_HEIGHT = 64

type ProjectSave = {
  version: 1
  front: CardData
  back: CardData
}

export default function Home() {
  const [frontData, setFrontData] = useState<CardData>(DEFAULT_CARD_DATA)
  const [backData, setBackData] = useState<CardData>(DEFAULT_BACK_CARD_DATA)
  const [activeSide, setActiveSide] = useState<"front" | "back">("front")
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("photo")
  const [downloading, setDownloading] = useState(false)
  const [fitScale, setFitScale] = useState(1)
  const [zoomPercent, setZoomPercent] = useState(116)
  const [mounted, setMounted] = useState(false)
  const previewShellRef = useRef<HTMLDivElement>(null)
  const exportFrontRef = useRef<HTMLDivElement>(null)
  const exportBackRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
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

  // Front is canonical for shared content; back mirrors it
  const activeData: CardData =
    activeSide === "front" ? frontData : { ...backData, content: frontData.content }

  const handleChange = (newData: CardData) => {
    const updatedContent = newData.content
    if (activeSide === "front") {
      setFrontData(newData)
      setBackData((prev) => ({ ...prev, content: updatedContent }))
    } else {
      setFrontData((prev) => ({ ...prev, content: updatedContent }))
      setBackData({ ...newData, content: updatedContent })
    }
  }

  const updateLayer = (layerId: string, patch: Partial<CardLayer>) => {
    const setter = activeSide === "front" ? setFrontData : setBackData
    setter((current) => ({
      ...current,
      layers: current.layers.map((layer) =>
        layer.id === layerId ? ({ ...layer, ...patch } as CardLayer) : layer
      ) as CardLayer[],
    }))
  }

  const handleSideSwitch = (side: "front" | "back") => {
    setActiveSide(side)
    setSelectedLayerId(null)
  }

  const handleDownload = async () => {
    const exportRef = activeSide === "front" ? exportFrontRef : exportBackRef
    if (!exportRef.current) return

    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await renderCardInIsolatedFrame(exportRef.current, async (cardNode) => {
        return html2canvas(cardNode, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        })
      })
      const link = document.createElement("a")
      link.download = `cosplay-id-${activeSide}-${slugify(frontData.content.name || "card")}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Export failed", error)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = async () => {
    const exportRef = activeSide === "front" ? exportFrontRef : exportBackRef
    if (!exportRef.current) return

    const popup = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900")
    if (!popup) return

    const markup = exportRef.current.outerHTML
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

  const handleExportJSON = () => {
    const save: ProjectSave = { version: 1, front: frontData, back: backData }
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `id-card-${slugify(frontData.content.name || "card")}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const save = JSON.parse(event.target?.result as string) as ProjectSave
        if (save.version === 1 && save.front && save.back) {
          setFrontData(save.front)
          setBackData(save.back)
          setSelectedLayerId(null)
        }
      } catch {
        console.error("Import failed: invalid project JSON")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,175,214,0.35),_transparent_28%),radial-gradient(circle_at_82%_18%,_rgba(187,215,255,0.28),_transparent_24%),linear-gradient(180deg,_#fff8fc_0%,_#f7f5ff_45%,_#eef7ff_100%)] text-foreground transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.12),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(59,130,246,0.14),_transparent_22%),linear-gradient(180deg,_#080913_0%,_#0e1323_46%,_#09111e_100%)]">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8%] top-[-6%] h-72 w-72 rounded-full bg-pink-200/45 blur-3xl dark:bg-pink-500/12" />
        <div className="absolute right-[-7%] top-[10%] h-80 w-80 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-500/12" />
        <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-500/10" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/55 bg-white/72 backdrop-blur-2xl dark:border-white/8 dark:bg-slate-950/60">
        <div className="flex h-full items-center justify-between gap-3 px-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary px-2.5 py-2 text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-none tracking-tight text-foreground">
                Custom ID Card Generator
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Drag & drop · front & back · export
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Import JSON */}
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              title="Import project JSON"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-background dark:border-white/12 dark:bg-slate-900/80"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import</span>
            </button>

            {/* Export JSON */}
            <button
              type="button"
              onClick={handleExportJSON}
              title="Export project JSON"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-background dark:border-white/12 dark:bg-slate-900/80"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border/60 dark:bg-white/12" />

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              title="Print active side"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-background dark:border-white/12 dark:bg-slate-900/80"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download active side as PNG"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-90 disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{downloading ? "Exporting…" : "PNG"}</span>
            </button>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border/60 dark:bg-white/12" />

            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-foreground transition hover:bg-background dark:border-white/12 dark:bg-slate-900/80"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hidden import input */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleImportJSON(file)
          event.currentTarget.value = ""
        }}
      />

      {/* ── Main layout ── */}
      <main style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }} className="px-3 pb-3 pt-3">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="h-full overflow-hidden rounded-[2rem] border border-white/45 bg-white/45 shadow-[0_30px_80px_-32px_rgba(219,39,119,0.25)] backdrop-blur-2xl dark:border-white/8 dark:bg-slate-950/35 dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]"
        >
          {/* ── Left: Editor panel ── */}
          <ResizablePanel defaultSize={24} minSize={18}>
            <div className="flex h-full flex-col gap-2 overflow-hidden p-3">

              {/* Front / Back side switcher */}
              <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/50 bg-white/65 p-1 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <button
                  type="button"
                  onClick={() => handleSideSwitch("front")}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                    activeSide === "front"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => handleSideSwitch("back")}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                    activeSide === "back"
                      ? "bg-violet-500 text-white shadow-sm shadow-violet-500/30"
                      : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  Back
                </button>
              </div>

              {/* Editor scrollable area */}
              <div className="min-h-0 flex-1 overflow-y-auto rounded-[1.6rem] border border-white/40 bg-white/70 p-3 shadow-lg shadow-pink-100/25 dark:border-white/8 dark:bg-slate-900/70 dark:shadow-none">
                <CardEditor
                  data={activeData}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                  onChange={handleChange}
                  applyTheme={activeSide === "front" ? applyThemePreset : applyThemePresetToBack}
                  activeSide={activeSide}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-white/40 dark:bg-white/10" />

          {/* ── Right: Preview panel ── */}
          <ResizablePanel defaultSize={76} minSize={35}>
            <section className="flex h-full flex-col p-3">

              {/* Preview toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-white/40 bg-white/72 px-4 py-3 shadow-lg shadow-pink-100/25 dark:border-white/8 dark:bg-slate-900/72 dark:shadow-none">

                {/* Left: label + side indicator */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                      Live Preview
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {activeSide === "front" ? "Front Side" : "Back Side"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        activeSide === "back"
                          ? "bg-violet-500/12 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {activeSide === "back" ? "Rückseite" : "Vorderseite"}
                      </span>
                    </div>
                  </div>

                  {/* Mini side tabs in preview too */}
                  <div className="hidden items-center gap-1 rounded-xl border border-border/50 bg-background/70 p-1 sm:flex dark:border-white/10 dark:bg-slate-950/60">
                    <button
                      type="button"
                      onClick={() => handleSideSwitch("front")}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        activeSide === "front"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSideSwitch("back")}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        activeSide === "back"
                          ? "bg-violet-500 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Back
                    </button>
                  </div>
                </div>

                {/* Right: zoom controls */}
                <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-border/50 bg-background/70 px-3 py-2 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="hidden text-right text-[10px] text-muted-foreground sm:block leading-tight">
                    <div className="font-semibold">85.6 × 54 mm</div>
                    <div>credit card</div>
                  </div>
                  <div className="hidden h-6 w-px bg-border/60 sm:block" />
                  <button
                    type="button"
                    onClick={() => setZoomPercent((v) => Math.max(50, v - 10))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground transition hover:bg-muted/50"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-14 text-center text-sm font-bold tabular-nums text-foreground">
                    {zoomPercent}%
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomPercent((v) => Math.min(260, v + 10))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground transition hover:bg-muted/50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="range"
                    min={50}
                    max={260}
                    step={5}
                    value={zoomPercent}
                    onChange={(event) => setZoomPercent(Number(event.target.value))}
                    className="w-28 accent-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setZoomPercent(100)}
                    className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15"
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* Canvas area */}
              <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-[1.8rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.55))] p-4 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))]">
                <div
                  ref={previewShellRef}
                  className="relative h-full w-full overflow-auto rounded-[1.4rem] border border-border/40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),rgba(244,245,255,0.86))] p-5 dark:border-white/8 dark:bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.92),rgba(15,23,42,0.98))]"
                >
                  {/* Canvas badge */}
                  <div className="absolute left-4 top-4 z-10 rounded-xl border border-border/55 bg-background/85 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground shadow-sm dark:bg-slate-950/75">
                    <div className="flex items-center gap-1.5">
                      <MonitorCog className="h-3 w-3" />
                      Studio canvas
                    </div>
                  </div>

                  {/* Side badge on canvas */}
                  <div className={`absolute right-4 top-4 z-10 rounded-xl border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                    activeSide === "back"
                      ? "border-violet-300/40 bg-violet-500/10 text-violet-600 dark:border-violet-400/25 dark:bg-violet-500/15 dark:text-violet-300"
                      : "border-primary/25 bg-primary/10 text-primary"
                  }`}>
                    {activeSide === "back" ? "Back" : "Front"}
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
                          data={activeData}
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

      {/* Hidden export cards (off-screen) */}
      <div
        data-print-root
        className="pointer-events-none fixed -left-[200vw] top-0"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <IdCard ref={exportFrontRef} data={frontData} />
      </div>
      <div
        data-print-root
        className="pointer-events-none fixed -left-[200vw] top-0"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <IdCard ref={exportBackRef} data={{ ...backData, content: frontData.content }} />
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
