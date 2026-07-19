'use client'

import { useTranslations } from 'next-intl'
import type { ColorPalette } from '@/lib/agents/types'

interface ColorPreviewProps {
  palette: ColorPalette
}

export function ColorPreview({ palette }: ColorPreviewProps) {
  const t = useTranslations()

  return (
    <div className="glass rounded-3xl p-6 sm:p-7 animate-fade-in-up">
      <h2 className="text-lg font-semibold mb-4 tracking-tight">{t('color_preview')}</h2>

      {/* Data colors */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-6">
        {palette.dataColors.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-full aspect-square rounded-xl border border-(--border) shadow-lg shadow-black/30 transition-transform hover:scale-105"
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
          <div key={label} className="flex items-center gap-2.5 rounded-xl p-2 -m-2 hover:bg-white/[0.03] transition-colors">
            <div
              className="w-7 h-7 rounded-lg shrink-0 border border-white/10"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0">
              <p className="text-xs text-(--text-secondary)">{label}</p>
              <p className="text-xs font-mono text-(--text-primary) truncate">{color}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility */}
      {palette.contrastRatios.length > 0 && (
        <div className="mt-5 pt-5 border-t border-(--border)">
          <p className="text-xs text-(--text-secondary) mb-2.5 font-medium uppercase tracking-wide">{t('accessibility')}</p>
          <div className="flex flex-wrap gap-1.5">
            {palette.contrastRatios.map((cr, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-1 rounded-md font-mono border ${
                  cr.passesAA
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
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
