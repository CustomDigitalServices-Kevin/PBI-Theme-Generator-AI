'use client'

import { useTranslations } from 'next-intl'

interface InputZoneProps {
  input: string
  inputType: 'text' | 'image'
  onInputChange: (value: string) => void
  onTypeChange: (type: 'text' | 'image') => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  imageBase64?: string
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]'

export function InputZone({
  input,
  inputType,
  onInputChange,
  onTypeChange,
  onImageUpload,
  imageBase64,
}: InputZoneProps) {
  const t = useTranslations()

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      {/* Toggle */}
      <div
        role="tablist"
        aria-label={t('input_text') + ' / ' + t('input_image')}
        className="flex gap-1 mb-5 p-1 rounded-xl bg-black/25 w-fit"
      >
        <button
          role="tab"
          aria-selected={inputType === 'text'}
          onClick={() => onTypeChange('text')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${FOCUS_RING} ${
            inputType === 'text'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/40'
              : 'text-(--text-secondary) hover:text-(--text-primary)'
          }`}
        >
          {t('input_text')}
        </button>
        <button
          role="tab"
          aria-selected={inputType === 'image'}
          onClick={() => onTypeChange('image')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${FOCUS_RING} ${
            inputType === 'image'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/40'
              : 'text-(--text-secondary) hover:text-(--text-primary)'
          }`}
        >
          {t('input_image')}
        </button>
      </div>

      {/* Text input */}
      {inputType === 'text' && (
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('text_placeholder')}
          rows={4}
          className={`w-full bg-black/20 border border-(--border) rounded-2xl px-4 py-3.5 text-sm text-(--text-primary) placeholder:text-(--text-secondary)/60 focus:border-brand-500/60 resize-none transition-colors ${FOCUS_RING}`}
        />
      )}

      {/* Image upload */}
      {inputType === 'image' && (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-(--border) rounded-2xl cursor-pointer hover:border-brand-500/50 hover:bg-white/[0.02] transition-colors">
            {imageBase64 ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- client-side base64 preview of a user-picked file, not an optimizable static/remote asset */}
                <img
                  src={`data:image/png;base64,${imageBase64}`}
                  alt="Uploaded"
                  className="h-20 w-20 object-contain rounded-lg"
                />
                <span className="text-sm text-brand-300">{input}</span>
              </div>
            ) : (
              <div className="text-center px-4">
                <p className="text-2xl mb-1">🖼️</p>
                <p className="text-sm text-(--text-secondary)">{t('image_placeholder')}</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className={`sr-only ${FOCUS_RING}`}
            />
          </label>
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t('image_context_placeholder')}
            rows={2}
            className={`w-full bg-black/20 border border-(--border) rounded-2xl px-4 py-3.5 text-sm text-(--text-primary) placeholder:text-(--text-secondary)/60 focus:border-brand-500/60 resize-none transition-colors ${FOCUS_RING}`}
          />
        </div>
      )}
    </div>
  )
}
