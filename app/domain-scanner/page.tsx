import DomainScanner from "@/components/domain-scanner"
import { ThemeProvider } from "@/components/theme-provider"

export default function DomainScannerPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="web-hack-test-theme">
      <main className="min-h-screen bg-background">
        <DomainScanner />
      </main>
    </ThemeProvider>
  )
}

