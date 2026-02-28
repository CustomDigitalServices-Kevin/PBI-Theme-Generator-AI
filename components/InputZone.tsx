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
    <div className="glass rounded-2xl p-6">
      {/* Toggle */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-black/20 w-fit">
        <button
          onClick={() => onTypeChange('text')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputType === 'text'
              ? 'bg-brand-500 text-white'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          {t('input_text')}
        </button>
        <button
          onClick={() => onTypeChange('image')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputType === 'image'
              ? 'bg-brand-500 text-white'
              : 'text-[var(--text-secondary)] hover:text-white'
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
          className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-500/50 resize-none transition-colors"
        />
      )}

      {/* Image upload */}
      {inputType === 'image' && (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
            {imageBase64 ? (
              <div className="flex items-center gap-3">
                <img
                  src={`data:image/png;base64,${imageBase64}`}
                  alt="Uploaded"
                  className="h-20 w-20 object-contain rounded-lg"
                />
                <span className="text-sm text-brand-400">{input}</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl mb-1">🖼️</p>
                <p className="text-sm text-[var(--text-secondary)]">{t('image_placeholder')}</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t('image_context_placeholder')}
            rows={2}
            className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-brand-500/50 resize-none transition-colors"
          />
        </div>
      )}
    </div>
  )
}
