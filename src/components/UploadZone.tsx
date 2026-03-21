import { useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onImageLoad: (base64: string, dataUrl: string) => void
  image: string | null
  onClear: () => void
  dragging: boolean
  setDragging: (v: boolean) => void
}

export default function UploadZone({
  onImageLoad, image, onClear, dragging, setDragging
}: UploadZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const b64 = dataUrl.split(",")[1]
      onImageLoad(b64, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onImageLoad])

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) processFile(file)
          break
        }
      }
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [processFile])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processFile(file)
      }}
      onClick={() => !image && fileRef.current?.click()}
      className={cn(
        "relative w-full rounded-xl overflow-hidden transition-all duration-200",
        "border-2",
        image ? "border-transparent cursor-default" : "cursor-pointer",
        dragging
          ? "border-[var(--color-accent)] bg-[#1a2035]"
          : image
            ? "border-transparent"
            : "border-dashed border-[var(--color-divider)] bg-[var(--color-panel)]"
      )}
      style={{ minHeight: image ? "auto" : "200px" }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
        }}
      />

      {image ? (
        <>
          <img
            src={image}
            alt="chart"
            className="w-full block rounded-xl"
            style={{ maxHeight: "60vh", objectFit: "contain" }}
          />
          <button
            onClick={e => { e.stopPropagation(); onClear() }}
            className={cn(
              "absolute top-2 right-2",
              "w-7 h-7 rounded-full flex items-center justify-center",
              "bg-black/60 text-white text-sm",
              "hover:bg-black/80 transition-colors"
            )}
          >
            ✕
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-10 px-4 select-none">
          <div className="text-4xl mb-3">📷</div>
          <div className="font-semibold text-[var(--color-white)] mb-1">
            Drop chart screenshot here
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            or click to browse · PNG / JPG · paste from clipboard
          </div>
        </div>
      )}
    </div>
  )
}
