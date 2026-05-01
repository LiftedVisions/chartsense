import { useEffect, useRef } from "react"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom"
import { Toaster, toast } from "sonner"
import Navbar from "@/components/Navbar"
import About from "@/pages/About"
import Analyzer from "@/pages/Analyzer"
import Guide from "@/pages/Guide"
import Landing from "@/pages/Landing"
import Privacy from "@/pages/Privacy"
import Terms from "@/pages/Terms"
import { supabase } from "@/lib/supabase"

const PWA_TOAST_SESSION_KEY = "chartsense-pwa-install-nudge-shown"

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as Event & { prompt: () => void }

      if (typeof sessionStorage === "undefined") return
      if (sessionStorage.getItem(PWA_TOAST_SESSION_KEY) === "1") return

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        if (sessionStorage.getItem(PWA_TOAST_SESSION_KEY) === "1") return
        sessionStorage.setItem(PWA_TOAST_SESSION_KEY, "1")
        toast("Add ChartSense to your home screen", {
          description: "Optional — install for quicker access.",
          action: {
            label: "Install",
            onClick: () => {
              deferredPrompt.current?.prompt()
              deferredPrompt.current = null
            },
          },
          duration: 6000,
        })
      }, 45000)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
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
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
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
