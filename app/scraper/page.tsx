import WebScraper from "@/components/web-scraper"
import { ThemeProvider } from "@/components/theme-provider"

export default function ScraperPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="web-hack-test-theme">
      <main className="min-h-screen bg-background">
        <WebScraper />
      </main>
    </ThemeProvider>
  )
}

