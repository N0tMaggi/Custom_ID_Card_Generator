"use client"

import { useRef, useState, type ComponentType, type HTMLInputTypeAttribute, type ReactNode } from "react"
import {
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Layers3,
  Lock,
  LockOpen,
  Palette,
  Plus,
  Shuffle,
  Sparkles,
  Type,
  Shapes,
  Tags,
  Trash2,
} from "lucide-react"
import ThemeSelector from "@/components/theme-selector"
import {
  CardData,
  CardLayer,
  CardTheme,
  FONT_OPTIONS,
  FontChoice,
  IMAGE_BINDINGS,
  ImageContentKey,
  ImageLayer,
  LIST_BINDINGS,
  ListContentKey,
  PRONOUN_OPTIONS,
  RANK_OPTIONS,
  STRING_BINDINGS,
  StringContentKey,
  TextLayer,
  TRAIT_SUGGESTIONS,
  applyThemePreset,
  createLayer,
} from "@/lib/card-types"

interface CardEditorProps {
  data: CardData
  selectedLayerId: string | null
  onSelectLayer: (id: string | null) => void
  onChange: (data: CardData) => void
  applyTheme?: (data: CardData, theme: CardTheme) => CardData
  activeSide?: "front" | "back"
}

export default function CardEditor({ data, selectedLayerId, onSelectLayer, onChange, applyTheme, activeSide = "front" }: CardEditorProps) {
  const [newTrait, setNewTrait] = useState("")
  const photoInputRef = useRef<HTMLInputElement>(null)
  const emblemInputRef = useRef<HTMLInputElement>(null)
  const layerImageInputRef = useRef<HTMLInputElement>(null)

  const selectedLayer = data.layers.find((layer) => layer.id === selectedLayerId) ?? null
  const watermarkLayer = data.layers.find((layer) => layer.id === "watermark") ?? null
  const sortedLayers = [...data.layers].sort((a, b) => b.zIndex - a.zIndex)

  const updateContent = <K extends keyof CardData["content"]>(key: K, value: CardData["content"][K]) => {
    onChange({
      ...data,
      content: {
        ...data.content,
        [key]: value,
      },
    })
  }

  const updateBackground = <K extends keyof CardData["background"]>(key: K, value: CardData["background"][K]) => {
    onChange({
      ...data,
      background: {
        ...data.background,
        [key]: value,
      },
    })
  }

  const updateLayer = (layerId: string, patch: Partial<CardLayer>) => {
    onChange({
      ...data,
      layers: data.layers.map((layer) => (layer.id === layerId ? ({ ...layer, ...patch } as CardLayer) : layer)) as CardLayer[],
    })
  }

  const removeLayer = (layerId: string) => {
    onChange({
      ...data,
      layers: data.layers.filter((layer) => layer.id !== layerId) as CardLayer[],
    })
    if (selectedLayerId === layerId) {
      onSelectLayer(null)
    }
  }

  const addTrait = (trait: string) => {
    const trimmed = trait.trim()
    if (!trimmed || data.content.traits.includes(trimmed)) return
    updateContent("traits", [...data.content.traits, trimmed])
    setNewTrait("")
  }

  const removeTrait = (trait: string) => {
    updateContent(
      "traits",
      data.content.traits.filter((item) => item !== trait)
    )
  }

  const randomize = () => {
    const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]
    const names = ["Yuki Starfluff", "Mochi Ribbonpaw", "Haru Glitterbean", "Kira Silkwhisker", "Ren Petalcloud"]
    const aliases = ["Star-chan", "Ribbon", "Glitzy", "Whiskers", "Petal"]
    const titles = ["FEMBOY BOIKISSER LICENSE", "CUTIE CLEARANCE PASS", "MINISTRY OF FLOOF ID"]
    const logos = ["FB", "UwU", "HEH", "QT", "XOX"]
    const signatures = ["Yuki~", "Mochi <3", "Haru", "~Ren~", "Kira"]
    const traits = [...TRAIT_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5)
    const accentSets = [
      ["#ff9bc7", "#f3d5ff", "#c8e7ff"],
      ["#2f0d58", "#131d39", "#07111d"],
      ["#0d2813", "#220631", "#08273f"],
    ] as const
    const colors = pick(accentSets)
    const year = 2050 + Math.floor(Math.random() * 80)

    onChange({
      ...data,
      content: {
        ...data.content,
        title: pick(titles),
        licenseNumber: `FBL-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}-${pick(["XOX", "UWU", "QTY", "PFF"])}`,
        name: pick(names),
        alias: pick(aliases),
        pronouns: pick(PRONOUN_OPTIONS),
        rank: pick(RANK_OPTIONS),
        cutenessScore: pick(["99/100", "101%", "inf/10", "SSS+", "Certified"]),
        validUntil: `${year}-12-31`,
        signature: pick(signatures),
        logoText: pick(logos),
        traits,
      },
      background: {
        ...data.background,
        gradientStops: [...colors] as [string, string, string],
      },
    })
  }

  const uploadIntoContent = (binding: ImageContentKey, file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const value = (event.target?.result as string) ?? null
      onChange({
        ...data,
        content: {
          ...data.content,
          [binding]: value,
        },
        layers: data.layers.map((layer) =>
          layer.type === "image" && layer.binding === binding
            ? ({ ...layer, opacity: 1 } as CardLayer)
            : layer
        ) as CardLayer[],
      })
    }
    reader.readAsDataURL(file)
  }

  const uploadIntoSelectedLayer = (file: File) => {
    if (!selectedLayer || selectedLayer.type !== "image") return

    const reader = new FileReader()
    reader.onload = (event) => {
      updateLayer(selectedLayer.id, {
        src: (event.target?.result as string) ?? null,
        binding: null,
        opacity: 1,
      })
    }
    reader.readAsDataURL(file)
  }

  const addLayerOfType = (type: CardLayer["type"]) => {
    const index = data.layers.filter((layer) => layer.type === type).length + 1
    const topZ = data.layers.reduce((max, layer) => Math.max(max, layer.zIndex), 0)
    const layer = createLayer(type, index)
    const withZ = { ...layer, zIndex: topZ + 5 }
    onChange({
      ...data,
      layers: [...data.layers, withZ] as CardLayer[],
    })
    onSelectLayer(withZ.id)
  }

  const duplicateSelectedLayer = () => {
    if (!selectedLayer) return

    const duplicated = {
      ...selectedLayer,
      id: `${selectedLayer.id}-copy-${Date.now()}`,
      name: `${selectedLayer.name} Copy`,
      x: Math.min(selectedLayer.x + 2, 90),
      y: Math.min(selectedLayer.y + 2, 90),
      zIndex: selectedLayer.zIndex + 1,
    }

    onChange({
      ...data,
      layers: [...data.layers, duplicated] as CardLayer[],
    })
    onSelectLayer(duplicated.id)
  }

  const setSelectedLayerImageBinding = (binding: ImageContentKey | null) => {
    if (!selectedLayer || selectedLayer.type !== "image") return

    updateLayer(selectedLayer.id, {
      binding,
      src: binding ? null : selectedLayer.src,
      opacity: binding === "emblemUrl" && !data.content.emblemUrl ? 0.35 : 1,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/40 bg-white/55 p-4 shadow-lg shadow-pink-100/40 backdrop-blur-xl dark:border-white/12 dark:bg-slate-800/95 dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-foreground">Card Builder Studio</div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${activeSide === "back" ? "bg-violet-500/15 text-violet-600 dark:text-violet-300" : "bg-primary/12 text-primary dark:text-pink-200"}`}>
                {activeSide === "back" ? "Back" : "Front"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground dark:text-slate-300">
              Drag elements in preview · fine-tune here
            </div>
          </div>
          <button
            type="button"
            onClick={randomize}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15 dark:border-primary/35 dark:bg-primary/20 dark:text-pink-100"
          >
            <Shuffle className="h-4 w-4" />
            Randomize
          </button>
        </div>
      </div>

      <DetailsSection title="Content" icon={Sparkles} defaultOpen>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Country">
            <Input value={data.content.country} onChange={(value) => updateContent("country", value)} />
          </Field>
          <Field label="Card Title">
            <Input value={data.content.title} onChange={(value) => updateContent("title", value)} />
          </Field>
          <Field label="Subtitle">
            <Input value={data.content.subtitle} onChange={(value) => updateContent("subtitle", value)} />
          </Field>
          <Field label="License Number">
            <Input value={data.content.licenseNumber} onChange={(value) => updateContent("licenseNumber", value)} />
          </Field>
          <Field label="Name">
            <Input value={data.content.name} onChange={(value) => updateContent("name", value)} />
          </Field>
          <Field label="Alias">
            <Input value={data.content.alias} onChange={(value) => updateContent("alias", value)} />
          </Field>
          <Field label="Pronouns">
            <Select
              value={data.content.pronouns}
              onChange={(value) => updateContent("pronouns", value)}
              options={PRONOUN_OPTIONS.map((option) => ({ value: option, label: option }))}
            />
          </Field>
          <Field label="Rank">
            <Select
              value={data.content.rank}
              onChange={(value) => updateContent("rank", value)}
              options={RANK_OPTIONS.map((option) => ({ value: option, label: option }))}
            />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={data.content.dateOfBirth} onChange={(value) => updateContent("dateOfBirth", value)} />
          </Field>
          <Field label="Valid Until">
            <Input type="date" value={data.content.validUntil} onChange={(value) => updateContent("validUntil", value)} />
          </Field>
          <Field label="Cuteness Score">
            <Input value={data.content.cutenessScore} onChange={(value) => updateContent("cutenessScore", value)} />
          </Field>
          <Field label="Logo Text">
            <Input value={data.content.logoText} onChange={(value) => updateContent("logoText", value)} />
          </Field>
        </div>

        <Field label="Signature" className="mt-3">
          <Input value={data.content.signature} onChange={(value) => updateContent("signature", value)} />
        </Field>
        <Field label="Disclaimer" className="mt-3">
          <Input value={data.content.disclaimer} onChange={(value) => updateContent("disclaimer", value)} />
        </Field>
        <Field label="Watermark Text" className="mt-3">
          <Textarea value={data.content.watermarkText} onChange={(value) => updateContent("watermarkText", value)} />
        </Field>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <UploadTile
            title="Photo"
            subtitle="Main portrait on the left"
            onPick={() => photoInputRef.current?.click()}
            onClear={data.content.photoUrl ? () => updateContent("photoUrl", null) : undefined}
            preview={data.content.photoUrl}
          />
          <UploadTile
            title="Emblem / Logo"
            subtitle="Top emblem, sticker or custom logo"
            onPick={() => emblemInputRef.current?.click()}
            onClear={data.content.emblemUrl ? () => updateContent("emblemUrl", null) : undefined}
            preview={data.content.emblemUrl}
          />
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) uploadIntoContent("photoUrl", file)
            event.currentTarget.value = ""
          }}
        />
        <input
          ref={emblemInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) uploadIntoContent("emblemUrl", file)
            event.currentTarget.value = ""
          }}
        />

        <div className="mt-4">
          <Field label="Traits / Chips">
            <div className="rounded-2xl border border-border/70 bg-background/60 p-3 dark:bg-slate-950/55">
              <div className="mb-3 flex flex-wrap gap-2">
                {data.content.traits.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => removeTrait(trait)}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:border-white/18 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {trait} x
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTrait}
                  onChange={setNewTrait}
                  placeholder="Add custom trait"
                  onEnter={() => addTrait(newTrait)}
                />
                <button
                  type="button"
                  onClick={() => addTrait(newTrait)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRAIT_SUGGESTIONS.filter((trait) => !data.content.traits.includes(trait))
                  .slice(0, 12)
                  .map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => addTrait(trait)}
                      className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:border-white/12 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      + {trait}
                    </button>
                  ))}
              </div>
            </div>
          </Field>
        </div>
      </DetailsSection>

      <DetailsSection title="Theme & Background" icon={Palette} defaultOpen>
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-slate-300">Preset Themes</div>
            <ThemeSelector
              value={data.theme}
              onChange={(theme) => onChange((applyTheme ?? applyThemePreset)(data, theme))}
            />
          </div>
          {watermarkLayer ? (
            <Check
              checked={watermarkLayer.visible}
              onChange={(checked) => updateLayer(watermarkLayer.id, { visible: checked })}
              label="Show watermark"
            />
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <ColorField label="Gradient A" value={data.background.gradientStops[0]} onChange={(value) => updateBackground("gradientStops", [value, data.background.gradientStops[1], data.background.gradientStops[2]])} />
            <ColorField label="Gradient B" value={data.background.gradientStops[1]} onChange={(value) => updateBackground("gradientStops", [data.background.gradientStops[0], value, data.background.gradientStops[2]])} />
            <ColorField label="Gradient C" value={data.background.gradientStops[2]} onChange={(value) => updateBackground("gradientStops", [data.background.gradientStops[0], data.background.gradientStops[1], value])} />
            <RangeField label="Gradient Angle" value={data.background.gradientAngle} min={0} max={360} step={1} onChange={(value) => updateBackground("gradientAngle", value)} />
            <ColorField label="Top Bar" value={data.background.topBarColor} onChange={(value) => updateBackground("topBarColor", value)} />
            <ColorField label="Bottom Bar" value={data.background.bottomBarColor} onChange={(value) => updateBackground("bottomBarColor", value)} />
            <ColorField label="Wave Color A" value={data.background.lineColorA} onChange={(value) => updateBackground("lineColorA", value)} />
            <ColorField label="Wave Color B" value={data.background.lineColorB} onChange={(value) => updateBackground("lineColorB", value)} />
            <ColorField label="Border" value={data.background.borderColor} onChange={(value) => updateBackground("borderColor", value)} />
            <ColorField label="Overlay Tint" value={data.background.overlayTint} onChange={(value) => updateBackground("overlayTint", value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <RangeField label="Wave Opacity" value={data.background.lineOpacity} min={0} max={1} step={0.01} onChange={(value) => updateBackground("lineOpacity", value)} />
            <RangeField label="Noise Opacity" value={data.background.noiseOpacity} min={0} max={0.25} step={0.01} onChange={(value) => updateBackground("noiseOpacity", value)} />
            <RangeField label="Corner Radius" value={data.background.cornerRadius} min={0} max={50} step={1} onChange={(value) => updateBackground("cornerRadius", value)} />
          </div>
        </div>
      </DetailsSection>
      <DetailsSection title="Add Components" icon={Layers3} defaultOpen>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <AddCard icon={Type} title="Text" onClick={() => addLayerOfType("text")} />
          <AddCard icon={Sparkles} title="Field" onClick={() => addLayerOfType("field")} />
          <AddCard icon={ImagePlus} title="Image" onClick={() => addLayerOfType("image")} />
          <AddCard icon={Shapes} title="Shape" onClick={() => addLayerOfType("shape")} />
          <AddCard icon={Tags} title="Chips" onClick={() => addLayerOfType("chips")} />
        </div>
      </DetailsSection>

      <DetailsSection title="Layer Stack" icon={Layers3} defaultOpen>
        <div className="space-y-2">
          {sortedLayers.map((layer) => {
            const selected = layer.id === selectedLayerId

            return (
              <div
                key={layer.id}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition ${
                  selected
                    ? "border-primary/35 bg-primary/10 shadow-sm shadow-primary/10 dark:border-primary/40 dark:bg-primary/20"
                    : "border-border/70 bg-white/55 hover:border-primary/20 hover:bg-white/70 dark:border-white/12 dark:bg-slate-800/95 dark:hover:bg-slate-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectLayer(layer.id)}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-semibold text-foreground">{layer.name}</div>
                  <div className="text-xs text-muted-foreground dark:text-slate-300">
                    {layer.type} - z {layer.zIndex}
                  </div>
                </button>
                <IconToggle
                  active={layer.visible}
                  onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                  icon={layer.visible ? Eye : EyeOff}
                  label={layer.visible ? "Hide layer" : "Show layer"}
                />
                <IconToggle
                  active={!layer.locked}
                  onClick={() => updateLayer(layer.id, { locked: !layer.locked })}
                  icon={layer.locked ? Lock : LockOpen}
                  label={layer.locked ? "Unlock layer" : "Lock layer"}
                />
                <IconToggle
                  active={false}
                  onClick={() => removeLayer(layer.id)}
                  icon={Trash2}
                  label="Delete layer"
                  danger
                />
              </div>
            )
          })}
        </div>
      </DetailsSection>

      <DetailsSection title="Selected Layer Inspector" icon={Layers3} defaultOpen={Boolean(selectedLayer)}>
        {selectedLayer ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3 dark:border-primary/35 dark:bg-primary/18">
              <div>
                <div className="text-sm font-semibold text-foreground">{selectedLayer.name}</div>
                <div className="text-xs text-muted-foreground dark:text-slate-300">
                  {selectedLayer.type} - drag on preview or edit precise values here
                </div>
              </div>
              <button
                type="button"
                onClick={duplicateSelectedLayer}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-white/70 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-white dark:bg-slate-800 dark:text-pink-100 dark:hover:bg-slate-700"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Layer Name">
                <Input value={selectedLayer.name} onChange={(value) => updateLayer(selectedLayer.id, { name: value })} />
              </Field>
              <Field label="Opacity">
                <RangeFieldCompact value={selectedLayer.opacity} min={0} max={1} step={0.01} onChange={(value) => updateLayer(selectedLayer.id, { opacity: value })} />
              </Field>
              <Field label="X Position (%)">
                <NumberInput value={selectedLayer.x} onChange={(value) => updateLayer(selectedLayer.id, { x: value })} min={0} max={100} step={0.1} />
              </Field>
              <Field label="Y Position (%)">
                <NumberInput value={selectedLayer.y} onChange={(value) => updateLayer(selectedLayer.id, { y: value })} min={0} max={100} step={0.1} />
              </Field>
              <Field label="Width (%)">
                <NumberInput value={selectedLayer.width} onChange={(value) => updateLayer(selectedLayer.id, { width: value })} min={1} max={100} step={0.1} />
              </Field>
              <Field label="Height (%)">
                <NumberInput value={selectedLayer.height} onChange={(value) => updateLayer(selectedLayer.id, { height: value })} min={0.2} max={100} step={0.1} />
              </Field>
              <Field label="Rotation (deg)">
                <NumberInput value={selectedLayer.rotation} onChange={(value) => updateLayer(selectedLayer.id, { rotation: value })} min={-180} max={180} step={1} />
              </Field>
              <Field label="Z Index">
                <NumberInput value={selectedLayer.zIndex} onChange={(value) => updateLayer(selectedLayer.id, { zIndex: value })} min={0} max={100} step={1} />
              </Field>
            </div>

            {selectedLayer.type === "text" ? (
              <TextLayerInspector layer={selectedLayer} updateLayer={updateLayer} />
            ) : null}
            {selectedLayer.type === "field" ? (
              <FieldLayerInspector layer={selectedLayer} updateLayer={updateLayer} />
            ) : null}
            {selectedLayer.type === "image" ? (
              <ImageLayerInspector
                layer={selectedLayer}
                updateLayer={updateLayer}
                setBinding={setSelectedLayerImageBinding}
                openUpload={() => layerImageInputRef.current?.click()}
                clearImage={() => updateLayer(selectedLayer.id, { src: null, binding: null })}
              />
            ) : null}
            {selectedLayer.type === "shape" ? (
              <ShapeLayerInspector layer={selectedLayer} updateLayer={updateLayer} />
            ) : null}
            {selectedLayer.type === "chips" ? (
              <ChipsLayerInspector layer={selectedLayer} updateLayer={updateLayer} />
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground dark:border-white/12 dark:bg-slate-900/65 dark:text-slate-300">
            Waehle im Preview oder in der Layer-Liste ein Element aus, um Position, Groesse, Farbe, Schrift, Bindings und mehr zu bearbeiten.
          </div>
        )}
      </DetailsSection>

      <input
        ref={layerImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) uploadIntoSelectedLayer(file)
          event.currentTarget.value = ""
        }}
      />
    </div>
  )
}

function TextLayerInspector({
  layer,
  updateLayer,
}: {
  layer: TextLayer
  updateLayer: (layerId: string, patch: Partial<CardLayer>) => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/55 p-4 dark:border-white/12 dark:bg-slate-800/92">
      <SectionTitle>Text Settings</SectionTitle>
      <Field label="Binding">
        <Select
          value={layer.binding ?? "__none"}
          onChange={(value) => updateLayer(layer.id, { binding: value === "__none" ? null : (value as StringContentKey) })}
          options={[{ value: "__none", label: "Static text" }, ...STRING_BINDINGS.map((item) => ({ value: item.value, label: item.label }))]}
        />
      </Field>
      <Field label="Text">
        <Textarea value={layer.text} onChange={(value) => updateLayer(layer.id, { text: value })} />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Font">
          <Select
            value={layer.fontFamily}
            onChange={(value) => updateLayer(layer.id, { fontFamily: value as FontChoice })}
            options={FONT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Field>
        <Field label="Align">
          <Select
            value={layer.align}
            onChange={(value) => updateLayer(layer.id, { align: value as TextLayer["align"] })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </Field>
        <Field label="Transform">
          <Select
            value={layer.transform}
            onChange={(value) => updateLayer(layer.id, { transform: value as TextLayer["transform"] })}
            options={[
              { value: "none", label: "None" },
              { value: "uppercase", label: "Uppercase" },
              { value: "lowercase", label: "Lowercase" },
              { value: "capitalize", label: "Capitalize" },
            ]}
          />
        </Field>
        <Field label="Italic">
          <Check checked={layer.italic} onChange={(checked) => updateLayer(layer.id, { italic: checked })} label="Enable italic style" />
        </Field>
        <Field label="Font Size">
          <NumberInput value={layer.fontSize} onChange={(value) => updateLayer(layer.id, { fontSize: value })} min={6} max={72} step={0.5} />
        </Field>
        <Field label="Weight">
          <NumberInput value={layer.fontWeight} onChange={(value) => updateLayer(layer.id, { fontWeight: value })} min={300} max={900} step={100} />
        </Field>
        <Field label="Letter Spacing">
          <NumberInput value={layer.letterSpacing} onChange={(value) => updateLayer(layer.id, { letterSpacing: value })} min={-0.1} max={1} step={0.01} />
        </Field>
        <Field label="Line Height">
          <NumberInput value={layer.lineHeight} onChange={(value) => updateLayer(layer.id, { lineHeight: value })} min={0.8} max={2} step={0.05} />
        </Field>
        <ColorField label="Text Color" value={layer.color} onChange={(value) => updateLayer(layer.id, { color: value })} />
        <ColorField label="Background" value={layer.backgroundColor} onChange={(value) => updateLayer(layer.id, { backgroundColor: value })} />
        <ColorField label="Border" value={layer.borderColor} onChange={(value) => updateLayer(layer.id, { borderColor: value })} />
        <Field label="Border Width">
          <NumberInput value={layer.borderWidth} onChange={(value) => updateLayer(layer.id, { borderWidth: value })} min={0} max={12} step={0.5} />
        </Field>
        <Field label="Radius">
          <NumberInput value={layer.radius} onChange={(value) => updateLayer(layer.id, { radius: value })} min={0} max={40} step={1} />
        </Field>
        <Field label="Padding">
          <NumberInput value={layer.padding} onChange={(value) => updateLayer(layer.id, { padding: value })} min={0} max={40} step={1} />
        </Field>
      </div>
    </div>
  )
}

function FieldLayerInspector({
  layer,
  updateLayer,
}: {
  layer: Extract<CardLayer, { type: "field" }>
  updateLayer: (layerId: string, patch: Partial<CardLayer>) => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/55 p-4 dark:border-white/12 dark:bg-slate-800/92">
      <SectionTitle>Field Settings</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Label">
          <Input value={layer.label} onChange={(value) => updateLayer(layer.id, { label: value })} />
        </Field>
        <Field label="Binding">
          <Select
            value={layer.binding ?? "__none"}
            onChange={(value) => updateLayer(layer.id, { binding: value === "__none" ? null : (value as StringContentKey) })}
            options={[{ value: "__none", label: "Static value" }, ...STRING_BINDINGS.map((item) => ({ value: item.value, label: item.label }))]}
          />
        </Field>
        <Field label="Fallback Value">
          <Input value={layer.value} onChange={(value) => updateLayer(layer.id, { value })} />
        </Field>
        <Field label="Font">
          <Select
            value={layer.fontFamily}
            onChange={(value) => updateLayer(layer.id, { fontFamily: value as FontChoice })}
            options={FONT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Field>
        <Field label="Align">
          <Select
            value={layer.align}
            onChange={(value) => updateLayer(layer.id, { align: value as Extract<CardLayer, { type: "field" }>["align"] })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </Field>
        <Field label="Gap">
          <NumberInput value={layer.gap} onChange={(value) => updateLayer(layer.id, { gap: value })} min={0} max={24} step={1} />
        </Field>
        <Field label="Label Size">
          <NumberInput value={layer.labelSize} onChange={(value) => updateLayer(layer.id, { labelSize: value })} min={6} max={40} step={0.5} />
        </Field>
        <Field label="Value Size">
          <NumberInput value={layer.valueSize} onChange={(value) => updateLayer(layer.id, { valueSize: value })} min={6} max={48} step={0.5} />
        </Field>
        <Field label="Label Weight">
          <NumberInput value={layer.labelWeight} onChange={(value) => updateLayer(layer.id, { labelWeight: value })} min={300} max={900} step={100} />
        </Field>
        <Field label="Value Weight">
          <NumberInput value={layer.valueWeight} onChange={(value) => updateLayer(layer.id, { valueWeight: value })} min={300} max={900} step={100} />
        </Field>
        <Field label="Letter Spacing">
          <NumberInput value={layer.letterSpacing} onChange={(value) => updateLayer(layer.id, { letterSpacing: value })} min={-0.1} max={1} step={0.01} />
        </Field>
        <Field label="Line Height">
          <NumberInput value={layer.lineHeight} onChange={(value) => updateLayer(layer.id, { lineHeight: value })} min={0.8} max={2} step={0.05} />
        </Field>
        <ColorField label="Label Color" value={layer.labelColor} onChange={(value) => updateLayer(layer.id, { labelColor: value })} />
        <ColorField label="Value Color" value={layer.valueColor} onChange={(value) => updateLayer(layer.id, { valueColor: value })} />
        <ColorField label="Background" value={layer.backgroundColor} onChange={(value) => updateLayer(layer.id, { backgroundColor: value })} />
        <ColorField label="Border" value={layer.borderColor} onChange={(value) => updateLayer(layer.id, { borderColor: value })} />
        <Field label="Border Width">
          <NumberInput value={layer.borderWidth} onChange={(value) => updateLayer(layer.id, { borderWidth: value })} min={0} max={12} step={0.5} />
        </Field>
        <Field label="Radius">
          <NumberInput value={layer.radius} onChange={(value) => updateLayer(layer.id, { radius: value })} min={0} max={40} step={1} />
        </Field>
        <Field label="Padding">
          <NumberInput value={layer.padding} onChange={(value) => updateLayer(layer.id, { padding: value })} min={0} max={32} step={1} />
        </Field>
      </div>
    </div>
  )
}

function ImageLayerInspector({
  layer,
  updateLayer,
  setBinding,
  openUpload,
  clearImage,
}: {
  layer: ImageLayer
  updateLayer: (layerId: string, patch: Partial<CardLayer>) => void
  setBinding: (binding: ImageContentKey | null) => void
  openUpload: () => void
  clearImage: () => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/55 p-4 dark:border-white/12 dark:bg-slate-800/92">
      <SectionTitle>Image Settings</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Binding">
          <Select
            value={layer.binding ?? "__none"}
            onChange={(value) => setBinding(value === "__none" ? null : (value as ImageContentKey))}
            options={[{ value: "__none", label: "Standalone image" }, ...IMAGE_BINDINGS.map((item) => ({ value: item.value, label: item.label }))]}
          />
        </Field>
        <Field label="Fit">
          <Select
            value={layer.fit}
            onChange={(value) => updateLayer(layer.id, { fit: value as ImageLayer["fit"] })}
            options={[
              { value: "cover", label: "Cover" },
              { value: "contain", label: "Contain" },
            ]}
          />
        </Field>
        <ColorField label="Frame Color" value={layer.borderColor} onChange={(value) => updateLayer(layer.id, { borderColor: value })} />
        <ColorField label="Background" value={layer.backgroundColor} onChange={(value) => updateLayer(layer.id, { backgroundColor: value })} />
        <Field label="Border Width">
          <NumberInput value={layer.borderWidth} onChange={(value) => updateLayer(layer.id, { borderWidth: value })} min={0} max={20} step={0.5} />
        </Field>
        <Field label="Radius">
          <NumberInput value={layer.borderRadius} onChange={(value) => updateLayer(layer.id, { borderRadius: value })} min={0} max={999} step={1} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={openUpload}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
        >
          <ImagePlus className="h-4 w-4" />
          Upload Image
        </button>
        <button
          type="button"
          onClick={clearImage}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/80 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-white dark:border-white/12 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

function ShapeLayerInspector({
  layer,
  updateLayer,
}: {
  layer: Extract<CardLayer, { type: "shape" }>
  updateLayer: (layerId: string, patch: Partial<CardLayer>) => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/55 p-4 dark:border-white/12 dark:bg-slate-800/92">
      <SectionTitle>Shape Settings</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Shape">
          <Select
            value={layer.shape}
            onChange={(value) => updateLayer(layer.id, { shape: value as Extract<CardLayer, { type: "shape" }>["shape"] })}
            options={[
              { value: "rect", label: "Rectangle" },
              { value: "circle", label: "Circle" },
              { value: "line", label: "Line" },
            ]}
          />
        </Field>
        <Field label="Blur">
          <NumberInput value={layer.blur} onChange={(value) => updateLayer(layer.id, { blur: value })} min={0} max={24} step={1} />
        </Field>
        <ColorField label="Fill" value={layer.fill} onChange={(value) => updateLayer(layer.id, { fill: value })} />
        <ColorField label="Stroke" value={layer.stroke} onChange={(value) => updateLayer(layer.id, { stroke: value })} />
        <Field label="Stroke Width">
          <NumberInput value={layer.strokeWidth} onChange={(value) => updateLayer(layer.id, { strokeWidth: value })} min={0} max={20} step={0.5} />
        </Field>
        <Field label="Radius">
          <NumberInput value={layer.radius} onChange={(value) => updateLayer(layer.id, { radius: value })} min={0} max={100} step={1} />
        </Field>
      </div>
    </div>
  )
}

function ChipsLayerInspector({
  layer,
  updateLayer,
}: {
  layer: Extract<CardLayer, { type: "chips" }>
  updateLayer: (layerId: string, patch: Partial<CardLayer>) => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/55 p-4 dark:border-white/12 dark:bg-slate-800/92">
      <SectionTitle>Chips Settings</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Binding">
          <Select
            value={layer.binding ?? "__none"}
            onChange={(value) => updateLayer(layer.id, { binding: value === "__none" ? null : (value as ListContentKey) })}
            options={[{ value: "__none", label: "Custom chips" }, ...LIST_BINDINGS.map((item) => ({ value: item.value, label: item.label }))]}
          />
        </Field>
        <Field label="Items (comma separated)">
          <Textarea value={layer.items.join(", ")} onChange={(value) => updateLayer(layer.id, { items: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
        </Field>
        <Field label="Font">
          <Select
            value={layer.fontFamily}
            onChange={(value) => updateLayer(layer.id, { fontFamily: value as FontChoice })}
            options={FONT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Field>
        <Field label="Font Size">
          <NumberInput value={layer.fontSize} onChange={(value) => updateLayer(layer.id, { fontSize: value })} min={6} max={32} step={0.5} />
        </Field>
        <Field label="Weight">
          <NumberInput value={layer.fontWeight} onChange={(value) => updateLayer(layer.id, { fontWeight: value })} min={300} max={900} step={100} />
        </Field>
        <Field label="Gap">
          <NumberInput value={layer.gap} onChange={(value) => updateLayer(layer.id, { gap: value })} min={0} max={20} step={1} />
        </Field>
        <Field label="Padding X">
          <NumberInput value={layer.paddingX} onChange={(value) => updateLayer(layer.id, { paddingX: value })} min={0} max={30} step={1} />
        </Field>
        <Field label="Padding Y">
          <NumberInput value={layer.paddingY} onChange={(value) => updateLayer(layer.id, { paddingY: value })} min={0} max={20} step={1} />
        </Field>
        <Field label="Radius">
          <NumberInput value={layer.chipRadius} onChange={(value) => updateLayer(layer.id, { chipRadius: value })} min={0} max={999} step={1} />
        </Field>
        <Field label="Border Width">
          <NumberInput value={layer.borderWidth} onChange={(value) => updateLayer(layer.id, { borderWidth: value })} min={0} max={10} step={0.5} />
        </Field>
        <ColorField label="Text Color" value={layer.textColor} onChange={(value) => updateLayer(layer.id, { textColor: value })} />
        <ColorField label="Fill" value={layer.fillColor} onChange={(value) => updateLayer(layer.id, { fillColor: value })} />
        <ColorField label="Border" value={layer.borderColor} onChange={(value) => updateLayer(layer.id, { borderColor: value })} />
      </div>
    </div>
  )
}

function DetailsSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-3xl border border-white/40 bg-white/60 shadow-lg shadow-pink-100/30 backdrop-blur-xl dark:border-white/12 dark:bg-slate-900/95 dark:shadow-none"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-pink-100">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
        </div>
        <div className="text-xs font-medium text-muted-foreground transition group-open:rotate-180 dark:text-slate-300">v</div>
      </summary>
      <div className="border-t border-white/40 px-4 py-4 dark:border-white/8">{children}</div>
    </details>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-slate-300">{children}</div>
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:text-slate-300">{label}</label>
      {children}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  onEnter,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: HTMLInputTypeAttribute
  onEnter?: () => void
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && onEnter) onEnter()
      }}
      className="w-full rounded-2xl border border-border/70 bg-white/85 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/12 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400"
    />
  )
}

function Textarea({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-border/70 bg-white/85 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/12 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400"
    />
  )
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-2xl border border-border/70 bg-white/85 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/12 dark:bg-slate-900 dark:text-slate-50"
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-border/70 bg-white/85 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/12 dark:bg-slate-900 dark:text-slate-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const parsed = parseColorValue(value)

  return (
    <Field label={label}>
      <div className="rounded-2xl border border-border/70 bg-white/85 p-3 dark:border-white/12 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-12 w-12 overflow-hidden rounded-2xl border border-border/70 dark:border-white/18"
            style={{
              background: `linear-gradient(0deg, rgba(255,255,255,0.22), rgba(255,255,255,0.22)), ${formatColor(parsed.hex, parsed.alpha)}`,
            }}
          >
            <input
              type="color"
              value={parsed.hex}
              onChange={(event) => onChange(formatColor(event.target.value, parsed.alpha))}
              className="h-full w-full cursor-pointer opacity-0"
            />
          </button>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-14 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:text-slate-300">
            Alpha
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(parsed.alpha * 100)}
            onChange={(event) => onChange(formatColor(parsed.hex, Number(event.target.value) / 100))}
            className="flex-1 accent-primary"
          />
          <div className="w-12 text-right text-xs font-semibold text-foreground">
            {Math.round(parsed.alpha * 100)}%
          </div>
        </div>
      </div>
    </Field>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      <RangeFieldCompact value={value} min={min} max={max} step={step} onChange={onChange} />
    </Field>
  )
}

function RangeFieldCompact({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white/85 px-3 py-3 dark:border-white/12 dark:bg-slate-900">
      <div className="mb-2 text-sm font-medium text-foreground">{value}</div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </div>
  )
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/85 px-3 py-2.5 text-sm text-foreground dark:border-white/12 dark:bg-slate-900 dark:text-slate-100">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  )
}

function AddCard({
  icon: Icon,
  title,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border/70 bg-white/75 p-3 text-left transition hover:border-primary/30 hover:bg-primary/10 dark:border-white/12 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-pink-100">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground dark:text-slate-300">Add a new draggable {title.toLowerCase()} layer.</div>
    </button>
  )
}

function UploadTile({
  title,
  subtitle,
  onPick,
  onClear,
  preview,
}: {
  title: string
  subtitle: string
  onPick: () => void
  onClear?: () => void
  preview: string | null
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-white/75 dark:border-white/12 dark:bg-slate-800">
      <button type="button" onClick={onPick} className="relative flex h-36 w-full items-center justify-center overflow-hidden bg-primary/5 dark:bg-slate-900">
        {preview ? <img src={preview} alt={title} className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="relative z-10 rounded-2xl bg-black/45 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-white">
          {preview ? "Replace" : "Upload"}
        </div>
      </button>
      <div className="flex items-center justify-between gap-2 p-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground dark:text-slate-300">{subtitle}</div>
        </div>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-border bg-white/85 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-white dark:border-white/12 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

function IconToggle({
  active,
  onClick,
  icon: Icon,
  label,
  danger = false,
}: {
  active: boolean
  onClick: () => void
  icon: ComponentType<{ className?: string }>
  label: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-xl border p-2 transition ${
        danger
          ? "border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 dark:border-destructive/35 dark:bg-destructive/10"
          : active
            ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary/35 dark:bg-primary/20 dark:text-pink-100"
            : "border-border bg-white/80 text-muted-foreground hover:bg-white dark:border-white/12 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function parseColorValue(value: string) {
  const trimmed = value.trim().toLowerCase()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(trimmed)) {
    return { hex: normalizeHex(trimmed), alpha: 1 }
  }

  const rgbaMatch = trimmed.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/)
  if (rgbaMatch) {
    const r = clampColorChannel(Number(rgbaMatch[1]))
    const g = clampColorChannel(Number(rgbaMatch[2]))
    const b = clampColorChannel(Number(rgbaMatch[3]))
    const alpha = rgbaMatch[4] === undefined ? 1 : clampAlpha(Number(rgbaMatch[4]))
    return { hex: rgbToHex(r, g, b), alpha }
  }

  return { hex: "#ffffff", alpha: 1 }
}

function normalizeHex(value: string) {
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }

  return value
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clampColorChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`
}

function hexToRgb(value: string) {
  const normalized = normalizeHex(value).replace("#", "")
  const int = Number.parseInt(normalized, 16)

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function formatColor(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  const safeAlpha = clampAlpha(alpha)
  if (safeAlpha >= 0.999) {
    return hex
  }

  return `rgba(${r},${g},${b},${Number(safeAlpha.toFixed(2))})`
}

function clampColorChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function clampAlpha(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 1))
}
