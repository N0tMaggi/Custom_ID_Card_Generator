"use client"

import { forwardRef, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CardData,
  CardLayer,
  ChipsLayer,
  FieldLayer,
  FontChoice,
  ImageLayer,
  ShapeLayer,
  StringContentKey,
  TextLayer,
} from "@/lib/card-types"

interface IdCardProps {
  data: CardData
  selectedLayerId?: string | null
  onSelectLayer?: (id: string | null) => void
  onLayerChange?: (id: string, patch: Partial<CardLayer>) => void
  interactive?: boolean
}

type InteractionState =
  | {
      id: string
      mode: "drag" | "resize"
      pointerId: number
      startX: number
      startY: number
      startLayer: CardLayer
    }
  | null

const FONT_MAP: Record<FontChoice, string> = {
  poppins: "Poppins, system-ui, sans-serif",
  space: '"Space Grotesk", system-ui, sans-serif',
  serif: '"DM Serif Display", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  script: '"Dancing Script", cursive',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatMaybeDate(key: StringContentKey | null, value: string) {
  if (!key) return value
  if (key !== "dateOfBirth" && key !== "validUntil") return value
  if (!value) return "-"

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function resolveText(data: CardData, layer: TextLayer | FieldLayer) {
  if ("binding" in layer && layer.binding) {
    return formatMaybeDate(layer.binding, data.content[layer.binding] ?? "")
  }

  return "text" in layer ? layer.text : layer.value
}

function resolveImage(data: CardData, layer: ImageLayer) {
  if (layer.binding) {
    return data.content[layer.binding] ?? null
  }

  return layer.src
}

function resolveChips(data: CardData, layer: ChipsLayer) {
  if (layer.binding) {
    return data.content[layer.binding]
  }

  return layer.items
}

const IdCard = forwardRef<HTMLDivElement, IdCardProps>(function IdCard(
  { data, selectedLayerId = null, onSelectLayer, onLayerChange, interactive = false },
  ref
) {
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const [interaction, setInteraction] = useState<InteractionState>(null)

  useEffect(() => {
    if (!interactive || !interaction || !onLayerChange) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const surface = surfaceRef.current
      if (!surface) return

      const rect = surface.getBoundingClientRect()
      const dx = ((event.clientX - interaction.startX) / rect.width) * 100
      const dy = ((event.clientY - interaction.startY) / rect.height) * 100

      if (interaction.mode === "drag") {
        onLayerChange(interaction.id, {
          x: clamp(interaction.startLayer.x + dx, 0, 100 - interaction.startLayer.width),
          y: clamp(interaction.startLayer.y + dy, 0, 100 - interaction.startLayer.height),
        })
        return
      }

      const minWidth = interaction.startLayer.type === "shape" && interaction.startLayer.shape === "line" ? 8 : 6
      const minHeight = interaction.startLayer.type === "shape" && interaction.startLayer.shape === "line" ? 0.2 : 4

      onLayerChange(interaction.id, {
        width: clamp(interaction.startLayer.width + dx, minWidth, 100 - interaction.startLayer.x),
        height: clamp(interaction.startLayer.height + dy, minHeight, 100 - interaction.startLayer.y),
      })
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId === interaction.pointerId) {
        setInteraction(null)
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [interaction, interactive, onLayerChange])

  const sortedLayers = [...data.layers].sort((a, b) => a.zIndex - b.zIndex)

  const startInteraction = (event: ReactPointerEvent, layer: CardLayer, mode: "drag" | "resize") => {
    if (!interactive || layer.locked || !onLayerChange) return

    event.stopPropagation()
    onSelectLayer?.(layer.id)
    setInteraction({
      id: layer.id,
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLayer: layer,
    })
  }

  return (
    <div
      ref={ref}
      data-card-print
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}
    >
      <div
        ref={surfaceRef}
        data-card-surface
        onClick={() => interactive && onSelectLayer?.(null)}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: data.background.cornerRadius,
          background: `linear-gradient(${data.background.gradientAngle}deg, ${data.background.gradientStops.join(", ")})`,
          border: `1px solid ${data.background.borderColor}`,
          boxShadow: `0 30px 80px -24px ${data.background.shadowColor}, inset 0 0 0 1px ${data.background.backdropGlow}`,
          fontFamily: "var(--font-sans), sans-serif",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 18% 18%, ${data.background.backdropGlow} 0%, transparent 38%),
              radial-gradient(circle at 82% 82%, ${data.background.overlayTint} 0%, transparent 42%),
              linear-gradient(180deg, ${data.background.overlayTint}, transparent 28%)
            `,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: data.background.lineOpacity,
          }}
        >
          <svg viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`} width="100%" height="100%" preserveAspectRatio="none">
            {[0, 28, 56, 84, 112, 140].map((offset) => (
              <path
                key={`top-${offset}`}
                d={`M -50 ${80 + offset} Q ${CARD_WIDTH / 4} ${40 + offset}, ${CARD_WIDTH / 2} ${80 + offset} T ${CARD_WIDTH + 50} ${72 + offset}`}
                fill="none"
                stroke={data.background.lineColorA}
                strokeWidth="2"
              />
            ))}
            {[0, 28, 56, 84, 112, 140].map((offset) => (
              <path
                key={`bottom-${offset}`}
                d={`M -50 ${330 + offset} Q ${CARD_WIDTH / 3} ${300 + offset}, ${CARD_WIDTH * 0.6} ${340 + offset} T ${CARD_WIDTH + 50} ${310 + offset}`}
                fill="none"
                stroke={data.background.lineColorB}
                strokeWidth="1.8"
              />
            ))}
          </svg>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: data.background.noiseOpacity,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.7) 0.6px, transparent 0.7px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.6) 0.5px, transparent 0.7px)",
            backgroundSize: "18px 18px, 14px 14px",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: `linear-gradient(90deg, ${data.background.topBarColor}, ${data.background.bottomBarColor})`,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${data.background.bottomBarColor}, ${data.background.topBarColor})`,
          }}
        />

        {sortedLayers.map((layer) => {
          if (!layer.visible) return null

          const isSelected = interactive && selectedLayerId === layer.id
          const baseStyle: CSSProperties = {
            position: "absolute",
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            width: `${layer.width}%`,
            height: `${layer.height}%`,
            opacity: layer.opacity,
            transform: `rotate(${layer.rotation}deg)`,
            transformOrigin: "center center",
            zIndex: layer.zIndex,
            cursor: interactive && !layer.locked ? "grab" : "default",
            userSelect: "none",
          }

          return (
            <div
              key={layer.id}
              style={baseStyle}
              onPointerDown={(event) => startInteraction(event, layer, "drag")}
              onClick={(event) => {
                event.stopPropagation()
                onSelectLayer?.(layer.id)
              }}
            >
              {layer.type === "text" && renderTextLayer(data, layer)}
              {layer.type === "field" && renderFieldLayer(data, layer)}
              {layer.type === "image" && renderImageLayer(data, layer)}
              {layer.type === "shape" && renderShapeLayer(layer)}
              {layer.type === "chips" && renderChipsLayer(data, layer)}

              {isSelected ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: 14,
                      border: "1.5px dashed rgba(255,255,255,0.96)",
                      boxShadow: "0 0 0 1px rgba(17,24,39,0.35)",
                      pointerEvents: "none",
                    }}
                  />
                  {!layer.locked ? (
                    <button
                      type="button"
                      aria-label={`Resize ${layer.name}`}
                      onPointerDown={(event) => startInteraction(event, layer, "resize")}
                      style={{
                        position: "absolute",
                        right: -10,
                        bottom: -10,
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.8)",
                        background: "rgba(17,24,39,0.9)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
                        cursor: "nwse-resize",
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
})

function renderTextLayer(data: CardData, layer: TextLayer) {
  const text = resolveText(data, layer) || "-"

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: layer.align === "center" ? "center" : layer.align === "right" ? "flex-end" : "flex-start",
        textAlign: layer.align,
        fontFamily: FONT_MAP[layer.fontFamily],
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        letterSpacing: `${layer.letterSpacing}em`,
        lineHeight: layer.lineHeight,
        color: layer.color,
        fontStyle: layer.italic ? "italic" : "normal",
        textTransform: layer.transform,
        background: layer.backgroundColor,
        border: `${layer.borderWidth}px solid ${layer.borderColor}`,
        borderRadius: layer.radius,
        padding: layer.padding,
        whiteSpace: "pre-wrap",
        overflow: "hidden",
      }}
    >
      {text}
    </div>
  )
}

function renderFieldLayer(data: CardData, layer: FieldLayer) {
  const value = resolveText(data, layer) || "-"

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: layer.gap,
        justifyContent: "flex-start",
        textAlign: layer.align,
        background: layer.backgroundColor,
        border: `${layer.borderWidth}px solid ${layer.borderColor}`,
        borderRadius: layer.radius,
        padding: layer.padding,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MAP[layer.fontFamily],
          fontSize: layer.labelSize,
          fontWeight: layer.labelWeight,
          letterSpacing: `${layer.letterSpacing}em`,
          lineHeight: 1.1,
          color: layer.labelColor,
          textTransform: "uppercase",
        }}
      >
        {layer.label}
      </div>
      <div
        style={{
          fontFamily: FONT_MAP[layer.fontFamily],
          fontSize: layer.valueSize,
          fontWeight: layer.valueWeight,
          lineHeight: layer.lineHeight,
          color: layer.valueColor,
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </div>
    </div>
  )
}

function renderImageLayer(data: CardData, layer: ImageLayer) {
  const src = resolveImage(data, layer)

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: layer.borderRadius,
        overflow: "hidden",
        border: `${layer.borderWidth}px solid ${layer.borderColor}`,
        background: layer.backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={layer.name}
          crossOrigin="anonymous"
          style={{
            width: "100%",
            height: "100%",
            objectFit: layer.fit,
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "rgba(255,255,255,0.8)",
            fontFamily: FONT_MAP.space,
          }}
        >
          <div style={{ fontSize: layer.binding === "photoUrl" ? 34 : 26 }}>{layer.binding === "photoUrl" ? "IMG" : "LOGO"}</div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            {layer.binding === "photoUrl" ? "Upload photo" : "Upload emblem"}
          </div>
        </div>
      )}
    </div>
  )
}

function renderShapeLayer(layer: ShapeLayer) {
  if (layer.shape === "line") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderTop: `${layer.strokeWidth}px solid ${layer.stroke}`,
          opacity: 1,
        }}
      />
    )
  }

  const borderRadius = layer.shape === "circle" ? "999px" : layer.radius

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius,
        background: layer.fill,
        border: `${layer.strokeWidth}px solid ${layer.stroke}`,
        filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
      }}
    />
  )
}

function renderChipsLayer(data: CardData, layer: ChipsLayer) {
  const items = resolveChips(data, layer).slice(0, 12)

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
        gap: layer.gap,
        overflow: "hidden",
      }}
    >
      {items.map((item) => (
        <div
          key={item}
          style={{
            padding: `${layer.paddingY}px ${layer.paddingX}px`,
            borderRadius: layer.chipRadius,
            background: layer.fillColor,
            border: `${layer.borderWidth}px solid ${layer.borderColor}`,
            color: layer.textColor,
            fontFamily: FONT_MAP[layer.fontFamily],
            fontSize: layer.fontSize,
            fontWeight: layer.fontWeight,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

IdCard.displayName = "IdCard"

export default IdCard
