import DorkGenerator from "@/components/dork-generator"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="dork-generator-theme">
      <main className="min-h-screen bg-background">
        <DorkGenerator />
      </main>
    </ThemeProvider>
  )
}

