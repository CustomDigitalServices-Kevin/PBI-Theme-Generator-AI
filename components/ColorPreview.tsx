'use client'

import { useTranslations } from 'next-intl'
import type { ColorPalette } from '@/lib/agents/types'

interface ColorPreviewProps {
  palette: ColorPalette
}

export function ColorPreview({ palette }: ColorPreviewProps) {
  const t = useTranslations()

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">{t('color_preview')}</h2>

      {/* Data colors */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
        {palette.dataColors.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-full aspect-square rounded-xl shadow-lg"
              style={{ backgroundColor: color }}
              title={color}
            />
            <span className="text-[10px] text-(--text-secondary) font-mono">
              {color}
            </span>
          </div>
        ))}
      </div>

      {/* Theme colors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('color_bg'), color: palette.background },
          { label: t('color_fg'), color: palette.foreground },
          { label: t('color_accent'), color: palette.tableAccent },
          { label: t('color_link'), color: palette.hyperlink },
          { label: t('color_header_bg'), color: palette.headerBackground },
          { label: t('color_header_fg'), color: palette.headerForeground },
          { label: t('color_selection'), color: palette.selectionColor },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md shrink-0 border border-white/10"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="text-xs text-(--text-secondary)">{label}</p>
              <p className="text-xs font-mono text-(--text-primary)">{color}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility */}
      {palette.contrastRatios.length > 0 && (
        <div className="mt-4 pt-4 border-t border-(--border)">
          <p className="text-xs text-(--text-secondary) mb-2">{t('accessibility')}</p>
          <div className="flex flex-wrap gap-1.5">
            {palette.contrastRatios.map((cr, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-1 rounded-md font-mono ${
                  cr.passesAA
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {cr.color} {cr.ratio.toFixed(1)}:1
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
