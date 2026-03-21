import { useEffect, useRef } from "react"
import { Toaster, toast } from "sonner"
import Analyzer from "@/pages/Analyzer"

export default function App() {
  const deferredPrompt = useRef<Event & { prompt: () => void } | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as Event & { prompt: () => void }
      toast("Install ChartSense to your home screen", {
        description: "Get quick access from any screen.",
        action: {
          label: "Install",
          onClick: () => {
            deferredPrompt.current?.prompt()
            deferredPrompt.current = null
          },
        },
        duration: 8000,
      })
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-dark)" }}>
      <Analyzer />
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--color-panel)",
            border: "1px solid var(--color-divider)",
            color: "var(--color-white)",
            fontFamily: "var(--font-body)",
          },
        }}
      />
    </div>
  )
}
