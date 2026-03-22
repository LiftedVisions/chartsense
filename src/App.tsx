import { useEffect, useRef } from "react"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom"
import { Toaster, toast } from "sonner"
import Navbar from "@/components/Navbar"
import Analyzer from "@/pages/Analyzer"
import Guide from "@/pages/Guide"
import Landing from "@/pages/Landing"
import { supabase } from "@/lib/supabase"

function AuthRedirectListener() {
  const navigate = useNavigate()
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate("/analyze")
    })
    return () => subscription.unsubscribe()
  }, [navigate])
  return null
}

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
    <BrowserRouter>
      <AuthRedirectListener />
      <div style={{ minHeight: "100vh", background: "var(--color-dark)" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyzer />} />
          <Route path="/guide" element={<Guide />} />
        </Routes>
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
    </BrowserRouter>
  )
}
