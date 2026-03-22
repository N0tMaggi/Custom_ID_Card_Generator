export const CARD_WIDTH = 856
export const CARD_HEIGHT = 540

export type CardTheme = "pastel" | "dark" | "neon"
export type LayerType = "text" | "field" | "image" | "shape" | "chips"
export type FontChoice = "poppins" | "space" | "serif" | "mono" | "script"
export type TextAlign = "left" | "center" | "right"
export type TextTransformChoice = "none" | "uppercase" | "lowercase" | "capitalize"
export type ShapeKind = "rect" | "circle" | "line"

export interface CardContent {
  country: string
  title: string
  subtitle: string
  licenseNumber: string
  name: string
  alias: string
  pronouns: string
  dateOfBirth: string
  rank: string
  cutenessScore: string
  validUntil: string
  signature: string
  disclaimer: string
  watermarkText: string
  logoText: string
  traits: string[]
  photoUrl: string | null
  emblemUrl: string | null
}

export type StringContentKey = keyof Omit<CardContent, "traits" | "photoUrl" | "emblemUrl">
export type ImageContentKey = "photoUrl" | "emblemUrl"
export type ListContentKey = "traits"

export interface CardBackground {
  gradientAngle: number
  gradientStops: [string, string, string]
  overlayTint: string
  borderColor: string
  lineColorA: string
  lineColorB: string
  lineOpacity: number
  noiseOpacity: number
  cornerRadius: number
  topBarColor: string
  bottomBarColor: string
  shadowColor: string
  backdropGlow: string
}

interface BaseLayer {
  id: string
  name: string
  type: LayerType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  visible: boolean
  locked: boolean
}

export interface TextLayer extends BaseLayer {
  type: "text"
  text: string
  binding: StringContentKey | null
  fontFamily: FontChoice
  fontSize: number
  fontWeight: number
  letterSpacing: number
  lineHeight: number
  color: string
  backgroundColor: string
  borderColor: string
  borderWidth: number
  radius: number
  padding: number
  italic: boolean
  align: TextAlign
  transform: TextTransformChoice
}

export interface FieldLayer extends BaseLayer {
  type: "field"
  label: string
  binding: StringContentKey | null
  value: string
  fontFamily: FontChoice
  labelColor: string
  valueColor: string
  labelSize: number
  valueSize: number
  labelWeight: number
  valueWeight: number
  letterSpacing: number
  lineHeight: number
  gap: number
  backgroundColor: string
  borderColor: string
  borderWidth: number
  radius: number
  padding: number
  align: TextAlign
}

export interface ImageLayer extends BaseLayer {
  type: "image"
  binding: ImageContentKey | null
  src: string | null
  fit: "cover" | "contain"
  borderRadius: number
  borderWidth: number
  borderColor: string
  backgroundColor: string
}

export interface ShapeLayer extends BaseLayer {
  type: "shape"
  shape: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
  radius: number
  blur: number
}

export interface ChipsLayer extends BaseLayer {
  type: "chips"
  binding: ListContentKey | null
  items: string[]
  fontFamily: FontChoice
  fontSize: number
  fontWeight: number
  textColor: string
  fillColor: string
  borderColor: string
  borderWidth: number
  paddingX: number
  paddingY: number
  chipRadius: number
  gap: number
}

export type CardLayer = TextLayer | FieldLayer | ImageLayer | ShapeLayer | ChipsLayer

export interface CardData {
  theme: CardTheme
  content: CardContent
  background: CardBackground
  layers: CardLayer[]
}

interface ThemeTokens {
  primary: string
  secondary: string
  tertiary: string
  accent: string
  accentSoft: string
  chipFill: string
  chipText: string
  plate: string
  signature: string
  watermark: string
}

export const FONT_OPTIONS: { value: FontChoice; label: string }[] = [
  { value: "poppins", label: "Poppins" },
  { value: "space", label: "Space Grotesk" },
  { value: "serif", label: "DM Serif" },
  { value: "mono", label: "JetBrains Mono" },
  { value: "script", label: "Dancing Script" },
]

export const STRING_BINDINGS: { value: StringContentKey; label: string }[] = [
  { value: "country", label: "Country" },
  { value: "title", label: "Title" },
  { value: "subtitle", label: "Subtitle" },
  { value: "licenseNumber", label: "License Number" },
  { value: "name", label: "Name" },
  { value: "alias", label: "Alias" },
  { value: "pronouns", label: "Pronouns" },
  { value: "dateOfBirth", label: "Date of Birth" },
  { value: "rank", label: "Rank" },
  { value: "cutenessScore", label: "Cuteness Score" },
  { value: "validUntil", label: "Valid Until" },
  { value: "signature", label: "Signature" },
  { value: "disclaimer", label: "Disclaimer" },
  { value: "watermarkText", label: "Watermark" },
  { value: "logoText", label: "Logo Text" },
]

export const IMAGE_BINDINGS: { value: ImageContentKey; label: string }[] = [
  { value: "photoUrl", label: "Photo" },
  { value: "emblemUrl", label: "Emblem" },
]

export const LIST_BINDINGS: { value: ListContentKey; label: string }[] = [
  { value: "traits", label: "Traits" },
]

export const RANK_OPTIONS = [
  "Floof Commander",
  "Grand Boikisser",
  "Skirt Enjoyer",
  "Maid in Chief",
  "Catboy Elite",
  "Uwu Veteran",
  "Bunny Sergeant",
  "Princess Knight",
  "Femboy Novice",
]

export const PRONOUN_OPTIONS = [
  "he/him",
  "she/her",
  "they/them",
  "he/they",
  "she/they",
  "any/all",
]

export const TRAIT_SUGGESTIONS = [
  "Soft",
  "Sassy",
  "Catboy Energy",
  "Tail haver",
  "Skirt enthusiast",
  "Uwu certified",
  "Maid trained",
  "Fluffy ears",
  "Thigh-high aficionado",
  "Bunny mode",
  "Fox ears",
  "Sparkle enjoyer",
  "Knee socks",
  "Blush activated",
  "Ahoge haver",
  "Chaos gremlin",
]

const BASE_CONTENT: CardContent = {
  country: "BUNDESREPUBLIK FEMBOYLAND",
  title: "FEMBOY BOIKISSER LICENSE",
  subtitle: "Parody cosplay ID",
  licenseNumber: "FBL-0042-XOX",
  name: "Sakura Bunnymochi",
  alias: "Bunny-chan",
  pronouns: "they/them",
  dateOfBirth: "2000-04-01",
  rank: "Floof Commander",
  cutenessScore: "99/100",
  validUntil: "2099-12-31",
  signature: "Sakura~",
  disclaimer: "Cosplay only. Not a real ID.",
  watermarkText: "COSPLAY ONLY - NOT AN OFFICIAL DOCUMENT",
  logoText: "FB",
  traits: ["Soft", "Sassy", "Catboy Energy", "Tail haver"],
  photoUrl: null,
  emblemUrl: null,
}

export const THEME_PRESETS: Record<
  CardTheme,
  {
    label: string
    description: string
    colors: [string, string, string]
    background: CardBackground
    tokens: ThemeTokens
  }
> = {
  pastel: {
    label: "Pastel",
    description: "Soft gradients and dreamy glass panels.",
    colors: ["#ffd7ef", "#ead8ff", "#d6ebff"],
    background: {
      gradientAngle: 135,
      gradientStops: ["#ffd7ef", "#ead8ff", "#d6ebff"],
      overlayTint: "rgba(255,255,255,0.22)",
      borderColor: "rgba(255,255,255,0.55)",
      lineColorA: "rgba(163,117,255,0.85)",
      lineColorB: "rgba(255,113,184,0.8)",
      lineOpacity: 0.2,
      noiseOpacity: 0.08,
      cornerRadius: 28,
      topBarColor: "#bb7cff",
      bottomBarColor: "#73b9ff",
      shadowColor: "rgba(109, 40, 217, 0.22)",
      backdropGlow: "rgba(255,255,255,0.42)",
    },
    tokens: {
      primary: "#5c2ba8",
      secondary: "#7f3cb9",
      tertiary: "#2a235f",
      accent: "#ff5cb3",
      accentSoft: "rgba(255,255,255,0.42)",
      chipFill: "rgba(188,126,255,0.18)",
      chipText: "#5d20ae",
      plate: "rgba(255,255,255,0.32)",
      signature: "rgba(92,43,168,0.48)",
      watermark: "rgba(113,74,214,0.13)",
    },
  },
  dark: {
    label: "Dark",
    description: "Deep midnight gradients with luminous accents.",
    colors: ["#2c0c56", "#121a30", "#060910"],
    background: {
      gradientAngle: 145,
      gradientStops: ["#2c0c56", "#121a30", "#060910"],
      overlayTint: "rgba(255,255,255,0.05)",
      borderColor: "rgba(211,190,255,0.22)",
      lineColorA: "rgba(167,139,250,0.8)",
      lineColorB: "rgba(244,114,182,0.72)",
      lineOpacity: 0.22,
      noiseOpacity: 0.06,
      cornerRadius: 28,
      topBarColor: "#9c6cff",
      bottomBarColor: "#ef4aa8",
      shadowColor: "rgba(0, 0, 0, 0.38)",
      backdropGlow: "rgba(255,255,255,0.08)",
    },
    tokens: {
      primary: "#f5deff",
      secondary: "#d6b8ff",
      tertiary: "#f4f7ff",
      accent: "#ef4aa8",
      accentSoft: "rgba(255,255,255,0.07)",
      chipFill: "rgba(167,139,250,0.14)",
      chipText: "#f3ddff",
      plate: "rgba(255,255,255,0.06)",
      signature: "rgba(214,184,255,0.54)",
      watermark: "rgba(213,191,255,0.11)",
    },
  },
  neon: {
    label: "Neon",
    description: "High-contrast cyber candy tones.",
    colors: ["#07220f", "#170428", "#051e2f"],
    background: {
      gradientAngle: 140,
      gradientStops: ["#07220f", "#170428", "#051e2f"],
      overlayTint: "rgba(0,255,170,0.05)",
      borderColor: "rgba(127,255,224,0.25)",
      lineColorA: "rgba(57,255,20,0.88)",
      lineColorB: "rgba(0,255,255,0.82)",
      lineOpacity: 0.24,
      noiseOpacity: 0.05,
      cornerRadius: 28,
      topBarColor: "#39ff14",
      bottomBarColor: "#00f6ff",
      shadowColor: "rgba(0, 0, 0, 0.42)",
      backdropGlow: "rgba(57,255,20,0.08)",
    },
    tokens: {
      primary: "#7fffee",
      secondary: "#39ff14",
      tertiary: "#f3fff7",
      accent: "#00f6ff",
      accentSoft: "rgba(57,255,20,0.07)",
      chipFill: "rgba(0,246,255,0.12)",
      chipText: "#a7fff9",
      plate: "rgba(255,255,255,0.04)",
      signature: "rgba(0,246,255,0.5)",
      watermark: "rgba(57,255,20,0.12)",
    },
  },
}

function textLayer(overrides: Partial<TextLayer>): TextLayer {
  return {
    id: "text",
    name: "Text",
    type: "text",
    x: 0,
    y: 0,
    width: 20,
    height: 10,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    visible: true,
    locked: false,
    text: "Editable text",
    binding: null,
    fontFamily: "poppins",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1.2,
    color: "#ffffff",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    radius: 0,
    padding: 0,
    italic: false,
    align: "left",
    transform: "none",
    ...overrides,
  }
}

function fieldLayer(overrides: Partial<FieldLayer>): FieldLayer {
  return {
    id: "field",
    name: "Field",
    type: "field",
    x: 0,
    y: 0,
    width: 20,
    height: 9,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    visible: true,
    locked: false,
    label: "Label",
    binding: null,
    value: "Value",
    fontFamily: "poppins",
    labelColor: "#ffffff",
    valueColor: "#ffffff",
    labelSize: 10,
    valueSize: 16,
    labelWeight: 700,
    valueWeight: 600,
    letterSpacing: 0.08,
    lineHeight: 1.2,
    gap: 4,
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    radius: 0,
    padding: 0,
    align: "left",
    ...overrides,
  }
}

function imageLayer(overrides: Partial<ImageLayer>): ImageLayer {
  return {
    id: "image",
    name: "Image",
    type: "image",
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    visible: true,
    locked: false,
    binding: null,
    src: null,
    fit: "cover",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.15)",
    ...overrides,
  }
}

function shapeLayer(overrides: Partial<ShapeLayer>): ShapeLayer {
  return {
    id: "shape",
    name: "Shape",
    type: "shape",
    x: 0,
    y: 0,
    width: 20,
    height: 10,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    visible: true,
    locked: false,
    shape: "rect",
    fill: "rgba(255,255,255,0.15)",
    stroke: "rgba(255,255,255,0.3)",
    strokeWidth: 1,
    radius: 16,
    blur: 0,
    ...overrides,
  }
}

function chipsLayer(overrides: Partial<ChipsLayer>): ChipsLayer {
  return {
    id: "chips",
    name: "Chips",
    type: "chips",
    x: 0,
    y: 0,
    width: 30,
    height: 12,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    visible: true,
    locked: false,
    binding: "traits",
    items: [],
    fontFamily: "poppins",
    fontSize: 11,
    fontWeight: 600,
    textColor: "#ffffff",
    fillColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    paddingX: 10,
    paddingY: 5,
    chipRadius: 999,
    gap: 6,
    ...overrides,
  }
}

function createThemeLayers(theme: CardTheme): CardLayer[] {
  const { tokens } = THEME_PRESETS[theme]

  return [
    textLayer({
      id: "watermark",
      name: "Watermark",
      binding: "watermarkText",
      text: BASE_CONTENT.watermarkText,
      x: 11,
      y: 29,
      width: 78,
      height: 18,
      rotation: -26,
      zIndex: 1,
      opacity: 1,
      fontFamily: "space",
      fontSize: 34,
      fontWeight: 700,
      letterSpacing: 0.14,
      color: tokens.watermark,
      align: "center",
      transform: "uppercase",
    }),
    shapeLayer({
      id: "divider",
      name: "Divider",
      shape: "line",
      x: 4.2,
      y: 20.3,
      width: 91.8,
      height: 0.5,
      zIndex: 5,
      stroke: tokens.secondary,
      strokeWidth: 1,
      fill: "transparent",
      opacity: 0.24,
    }),
    imageLayer({
      id: "photo",
      name: "Photo",
      binding: "photoUrl",
      x: 4.1,
      y: 24.2,
      width: 22,
      height: 44.2,
      zIndex: 20,
      fit: "cover",
      borderRadius: 18,
      borderWidth: 2,
      borderColor: tokens.secondary,
      backgroundColor: tokens.plate,
    }),
    textLayer({
      id: "country",
      name: "Country",
      binding: "country",
      x: 4.1,
      y: 5.3,
      width: 44,
      height: 3.2,
      zIndex: 20,
      fontFamily: "space",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      color: tokens.secondary,
      transform: "uppercase",
    }),
    textLayer({
      id: "title",
      name: "Title",
      binding: "title",
      x: 4.1,
      y: 8.5,
      width: 45,
      height: 5.6,
      zIndex: 20,
      fontFamily: "poppins",
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: 0.12,
      color: tokens.primary,
      transform: "uppercase",
    }),
    textLayer({
      id: "subtitle",
      name: "Subtitle",
      binding: "subtitle",
      x: 4.1,
      y: 14,
      width: 28,
      height: 3.2,
      zIndex: 20,
      fontFamily: "space",
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: 0.16,
      color: tokens.secondary,
      opacity: 0.9,
      transform: "uppercase",
    }),
    textLayer({
      id: "logo-text",
      name: "Logo",
      binding: "logoText",
      x: 56.2,
      y: 4.8,
      width: 9,
      height: 10,
      zIndex: 20,
      fontFamily: "serif",
      fontSize: 28,
      fontWeight: 400,
      color: tokens.accent,
      align: "center",
      transform: "uppercase",
    }),
    imageLayer({
      id: "emblem",
      name: "Emblem",
      binding: "emblemUrl",
      x: 54.8,
      y: 3.8,
      width: 12,
      height: 12,
      zIndex: 18,
      fit: "contain",
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.12)",
      backgroundColor: "transparent",
      opacity: 0,
    }),
    textLayer({
      id: "license-label",
      name: "License Label",
      text: "LICENSE NO.",
      x: 70.4,
      y: 5.3,
      width: 23,
      height: 3.2,
      zIndex: 20,
      fontFamily: "space",
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: 0.26,
      color: tokens.secondary,
      align: "right",
      transform: "uppercase",
      opacity: 0.82,
    }),
    textLayer({
      id: "license-number",
      name: "License Number",
      binding: "licenseNumber",
      x: 61.8,
      y: 8.4,
      width: 31.5,
      height: 4.4,
      zIndex: 20,
      fontFamily: "mono",
      fontSize: 12.5,
      fontWeight: 700,
      letterSpacing: 0.2,
      color: tokens.primary,
      align: "right",
      transform: "uppercase",
    }),
    fieldLayer({
      id: "field-name",
      name: "Name Field",
      label: "Name",
      binding: "name",
      x: 31,
      y: 24.2,
      width: 29,
      height: 9.4,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.5,
      valueSize: 16,
      letterSpacing: 0.1,
      fontFamily: "poppins",
      labelWeight: 700,
      valueWeight: 700,
    }),
    fieldLayer({
      id: "field-alias",
      name: "Alias Field",
      label: "Alias",
      binding: "alias",
      x: 62,
      y: 24.2,
      width: 23,
      height: 9.4,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.5,
      valueSize: 14,
      letterSpacing: 0.1,
      fontFamily: "poppins",
      labelWeight: 700,
      valueWeight: 600,
    }),
    fieldLayer({
      id: "field-pronouns",
      name: "Pronouns Field",
      label: "Pronouns",
      binding: "pronouns",
      x: 31,
      y: 35.5,
      width: 17,
      height: 9.2,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.3,
      valueSize: 13.2,
      fontFamily: "poppins",
    }),
    fieldLayer({
      id: "field-dob",
      name: "Date of Birth Field",
      label: "Date of Birth",
      binding: "dateOfBirth",
      x: 50.5,
      y: 35.5,
      width: 24,
      height: 9.2,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.3,
      valueSize: 13.2,
      fontFamily: "poppins",
    }),
    fieldLayer({
      id: "field-rank",
      name: "Rank Field",
      label: "Rank",
      binding: "rank",
      x: 31,
      y: 46.4,
      width: 24,
      height: 9.2,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.3,
      valueSize: 13.2,
      fontFamily: "poppins",
    }),
    fieldLayer({
      id: "field-cute",
      name: "Cuteness Field",
      label: "Cuteness Score",
      binding: "cutenessScore",
      x: 57.2,
      y: 46.4,
      width: 17.5,
      height: 9.2,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.3,
      valueSize: 13.2,
      fontFamily: "poppins",
    }),
    fieldLayer({
      id: "field-valid",
      name: "Valid Until Field",
      label: "Valid Until",
      binding: "validUntil",
      x: 76.5,
      y: 46.4,
      width: 15.5,
      height: 9.2,
      zIndex: 20,
      labelColor: tokens.secondary,
      valueColor: tokens.tertiary,
      labelSize: 8.1,
      valueSize: 12.6,
      fontFamily: "poppins",
    }),
    chipsLayer({
      id: "traits",
      name: "Traits",
      x: 31,
      y: 58.6,
      width: 51,
      height: 14,
      zIndex: 20,
      binding: "traits",
      items: BASE_CONTENT.traits,
      fontFamily: "space",
      fontSize: 10.2,
      fontWeight: 700,
      textColor: tokens.chipText,
      fillColor: tokens.chipFill,
      borderColor: tokens.secondary,
      paddingX: 10,
      paddingY: 4,
      gap: 6,
      chipRadius: 999,
      borderWidth: 1,
    }),
    shapeLayer({
      id: "signature-line",
      name: "Signature Line",
      shape: "line",
      x: 4.3,
      y: 77.1,
      width: 22,
      height: 0.35,
      zIndex: 10,
      stroke: tokens.signature,
      strokeWidth: 1.5,
      fill: "transparent",
      opacity: 1,
    }),
    textLayer({
      id: "signature",
      name: "Signature",
      binding: "signature",
      x: 5.2,
      y: 71.5,
      width: 18.5,
      height: 5.6,
      zIndex: 20,
      fontFamily: "script",
      fontSize: 20,
      fontWeight: 700,
      color: tokens.secondary,
      italic: true,
    }),
    textLayer({
      id: "signature-label",
      name: "Signature Label",
      text: "Holder signature",
      x: 4.7,
      y: 78.3,
      width: 19,
      height: 3.2,
      zIndex: 20,
      fontFamily: "space",
      fontSize: 7.2,
      fontWeight: 600,
      letterSpacing: 0.16,
      color: tokens.secondary,
      opacity: 0.74,
      transform: "uppercase",
    }),
    textLayer({
      id: "disclaimer",
      name: "Disclaimer",
      binding: "disclaimer",
      x: 56.5,
      y: 89.3,
      width: 37.5,
      height: 4.5,
      zIndex: 20,
      fontFamily: "space",
      fontSize: 8.2,
      fontWeight: 600,
      letterSpacing: 0.06,
      color: tokens.secondary,
      opacity: 0.88,
      align: "right",
    }),
  ]
}

export function createCardData(theme: CardTheme = "pastel"): CardData {
  return {
    theme,
    content: { ...BASE_CONTENT },
    background: { ...THEME_PRESETS[theme].background },
    layers: createThemeLayers(theme),
  }
}

function preserveLayerTransform<T extends CardLayer>(current: T, themed: T): T {
  return {
    ...themed,
    x: current.x,
    y: current.y,
    width: current.width,
    height: current.height,
    rotation: current.rotation,
    opacity: current.opacity,
    zIndex: current.zIndex,
    visible: current.visible,
    locked: current.locked,
  }
}

export function applyThemePreset(data: CardData, theme: CardTheme): CardData {
  const themed = createCardData(theme)
  const themedById = new Map(themed.layers.map((layer) => [layer.id, layer]))

  const layers = data.layers.map((layer) => {
    const fresh = themedById.get(layer.id)
    if (!fresh || fresh.type !== layer.type) {
      return layer
    }

    switch (layer.type) {
      case "text":
        return {
          ...preserveLayerTransform(layer, fresh),
          text: layer.text,
          binding: layer.binding,
        }
      case "field":
        return {
          ...preserveLayerTransform(layer, fresh),
          label: layer.label,
          value: layer.value,
          binding: layer.binding,
        }
      case "image":
        return {
          ...preserveLayerTransform(layer, fresh),
          src: layer.src,
          binding: layer.binding,
          opacity: layer.id === "emblem" && (data.content.emblemUrl || layer.src) ? 1 : preserveLayerTransform(layer, fresh).opacity,
        }
      case "shape":
        return preserveLayerTransform(layer, fresh)
      case "chips":
        return {
          ...preserveLayerTransform(layer, fresh),
          items: layer.items,
          binding: layer.binding,
        }
      default:
        return layer
    }
  }) as CardLayer[]

  return {
    ...data,
    theme,
    background: { ...themed.background },
    layers,
  }
}

export function createLayer(type: LayerType, index = 1): CardLayer {
  const suffix = `${type}-${index}`

  switch (type) {
    case "text":
      return textLayer({
        id: `custom-${suffix}`,
        name: `Text ${index}`,
        x: 10,
        y: 10,
        width: 28,
        height: 10,
        text: "New text block",
        color: "#ffffff",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
        radius: 12,
        padding: 10,
      })
    case "field":
      return fieldLayer({
        id: `custom-${suffix}`,
        name: `Field ${index}`,
        x: 12,
        y: 16,
        width: 25,
        height: 10,
        label: "Custom label",
        value: "Custom value",
        labelColor: "#ffffff",
        valueColor: "#ffffff",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
        radius: 12,
        padding: 10,
      })
    case "image":
      return imageLayer({
        id: `custom-${suffix}`,
        name: `Image ${index}`,
        x: 14,
        y: 20,
        width: 16,
        height: 20,
        fit: "contain",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.18)",
      })
    case "shape":
      return shapeLayer({
        id: `custom-${suffix}`,
        name: `Shape ${index}`,
        x: 10,
        y: 12,
        width: 22,
        height: 12,
      })
    case "chips":
      return chipsLayer({
        id: `custom-${suffix}`,
        name: `Chips ${index}`,
        x: 10,
        y: 28,
        width: 34,
        height: 12,
        items: ["Cute", "Chaotic", "Custom"],
      })
  }
}

export const DEFAULT_CARD_DATA = createCardData("pastel")
