"use client"

import { CardTheme, THEME_PRESETS } from "@/lib/card-types"
import { cn } from "@/lib/utils"

interface ThemeSelectorProps {
  value: CardTheme
  onChange: (theme: CardTheme) => void
}

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Object.entries(THEME_PRESETS).map(([id, theme]) => {
        const active = value === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id as CardTheme)}
            className={cn(
              "rounded-2xl border p-3 text-left transition-all",
              active
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/15"
                : "border-border bg-white/50 hover:border-primary/30 hover:bg-white/70 dark:bg-slate-950/55 dark:hover:bg-slate-900/70"
            )}
          >
            <div
              className={cn(
                "mb-3 h-12 rounded-xl border",
                active ? "border-white/60" : "border-white/40"
              )}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.join(", ")})`,
              }}
            />
            <div className={cn("text-sm font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
              {theme.label}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{theme.description}</div>
          </button>
        )
      })}
    </div>
  )
}
