import { ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FieldError, UseFormSetValue } from 'react-hook-form'

import type { CommunityCreatePayload } from '@/features/communities/model/community.schemas'
import { Button } from '@/shared/ui/button'

const acceptedImageTypes = 'image/jpeg,image/png,image/webp'

type CommunityImageUploaderProps = {
  error: FieldError | undefined
  inputId: string
  selectedImage: CommunityCreatePayload['image']
  setValue: UseFormSetValue<CommunityCreatePayload>
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toLocaleString('es-EC', {
      maximumFractionDigits: 1,
    })} KB`
  }

  return `${(bytes / 1024 / 1024).toLocaleString('es-EC', {
    maximumFractionDigits: 1,
  })} MB`
}

export function CommunityImageUploader({
  error,
  inputId,
  selectedImage,
  setValue,
}: CommunityImageUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedImage?.type.startsWith('image/')) {
      setPreviewUrl(null)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(selectedImage)
    setPreviewUrl(nextPreviewUrl)

    return () => URL.revokeObjectURL(nextPreviewUrl)
  }, [selectedImage])

  const openFilePicker = () => {
    if (imageInputRef.current) imageInputRef.current.value = ''
    imageInputRef.current?.click()
  }

  const selectImage = (file: File | undefined) => {
    setIsDragActive(false)

    if (!file) return

    setValue('image', file, { shouldDirty: true, shouldValidate: true })
  }

  const clearImage = () => {
    setValue('image', null, { shouldDirty: true, shouldValidate: true })

    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <input
        accept={acceptedImageTypes}
        aria-label="Imagen de la comunidad"
        aria-describedby={error ? 'community-image-error' : undefined}
        aria-invalid={Boolean(error)}
        className="sr-only"
        id={inputId}
        onChange={(event) => selectImage(event.target.files?.[0])}
        ref={imageInputRef}
        type="file"
      />

      {!selectedImage ? (
        <button
          aria-describedby={error ? 'community-image-error' : undefined}
          aria-label="Subir imagen de la comunidad"
          className={`flex min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:py-10 ${isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-secondary/40 hover:border-foreground/30 hover:bg-secondary/60'}`}
          onClick={openFilePicker}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragActive(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragActive(false)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            selectImage(event.dataTransfer.files?.[0])
          }}
          type="button"
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
            {isDragActive ? (
              <Upload aria-hidden="true" className="size-5" />
            ) : (
              <ImagePlus aria-hidden="true" className="size-5" />
            )}
          </span>
          <span className="space-y-1">
            <span className="block text-sm font-medium">
              {isDragActive
                ? 'Suelta la imagen aquí'
                : 'Arrastra una imagen aquí'}
            </span>
            <span className="block text-sm text-muted-foreground">
              o selecciona una desde tu dispositivo
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            JPG, PNG o WebP · máximo 5 MB
          </span>
        </button>
      ) : (
        <div className="grid gap-4 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-[9rem_1fr] sm:items-center">
          <div className="aspect-square overflow-hidden rounded-lg border bg-background">
            {previewUrl ? (
              <img
                alt={`Vista previa de ${selectedImage.name}`}
                className="size-full object-contain"
                src={previewUrl}
              />
            ) : (
              <div className="flex size-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                No se puede mostrar la vista previa.
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <p className="truncate text-sm font-medium">
                {selectedImage.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedImage.size)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={openFilePicker}
                size="sm"
                type="button"
                variant="outline"
              >
                <RefreshCw aria-hidden="true" />
                Cambiar imagen
              </Button>
              <Button
                onClick={clearImage}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" />
                Quitar imagen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
