"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import {
  Globe,
  Search,
  AlertTriangle,
  Info,
  CheckCircle,
  Download,
  FileText,
  BarChart,
  Zap,
  Shield,
  Server,
  Wifi,
  Code,
  Database,
} from "lucide-react"

interface DomainData {
  domain: string
  type: "subdomain" | "path" | "main"
  status: number
  ip?: string
  technologies?: string[]
  lastChecked: string
  openPorts?: number[]
  headers?: Record<string, string>
  responseTime?: number
}

interface NetworkNode {
  id: string
  label: string
  type: "domain" | "subdomain" | "path" | "ip" | "api" | "service"
  level: number
}

interface NetworkLink {
  source: string
  target: string
  value: number
}

// NetworkGraph bileşeni
function NetworkGraph({ data }: { data: { nodes: NetworkNode[]; links: NetworkLink[] } }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return

    // Mevcut içeriği temizle
    const container = containerRef.current
    container.innerHTML = ""

    // Canvas oluştur
    const canvas = document.createElement("canvas")
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Arka planı çiz
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Düğüm pozisyonlarını hesapla
    const nodePositions: Record<string, { x: number; y: number }> = {}

    // Ana domain'i ortaya yerleştir
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    data.nodes.forEach((node) => {
      if (node.level === 0) {
        // Ana domain ortada
        nodePositions[node.id] = { x: centerX, y: centerY }
      } else if (node.level === 1) {
        // Level 1 düğümleri (alt domainler ve pathler) çemberde
        const angle = Math.random() * Math.PI * 2
        const radius = 150
        nodePositions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      } else {
        // Diğer düğümler daha dışta
        const angle = Math.random() * Math.PI * 2
        const radius = 250 + (node.level - 2) * 50
        nodePositions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      }
    })

    // Bağlantıları çiz
    ctx.strokeStyle = "#adb5bd"
    ctx.lineWidth = 1

    data.links.forEach((link) => {
      const source = nodePositions[link.source]
      const target = nodePositions[link.target]

      if (source && target) {
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      }
    })

    // Düğümleri çiz
    data.nodes.forEach((node) => {
      const pos = nodePositions[node.id]
      if (!pos) return

      // Düğüm tipine göre renk
      let color = "#6c757d"
      switch (node.type) {
        case "domain":
          color = "#3b82f6"
          break // blue-500
        case "subdomain":
          color = "#10b981"
          break // green-500
        case "path":
          color = "#8b5cf6"
          break // purple-500
        case "ip":
          color = "#6b7280"
          break // gray-500
        case "api":
          color = "#f59e0b"
          break // amber-500
        case "service":
          color = "#ec4899"
          break // pink-500
      }

      // Düğümü çiz
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Etiketi çiz
      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.fillText(node.label, pos.x + 8, pos.y + 3)
    })

    // Lejant ekle
    const legendItems = [
      { label: "Ana Domain", color: "#3b82f6" },
      { label: "Alt Domain", color: "#10b981" },
      { label: "Path", color: "#8b5cf6" },
      { label: "IP Adresi", color: "#6b7280" },
      { label: "API", color: "#f59e0b" },
      { label: "Servis", color: "#ec4899" },
    ]

    const legendX = 20
    let legendY = 20

    ctx.font = "12px Arial"
    legendItems.forEach((item) => {
      // Renk kutusu
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 15, 15)

      // Etiket
      ctx.fillStyle = "#000"
      ctx.fillText(item.label, legendX + 20, legendY + 12)

      legendY += 25
    })
  }, [data])

  return (
    <div ref={containerRef} className="w-full h-[500px] border rounded-md bg-background">
      {data.nodes.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Ağ haritası için tarama başlatın</p>
        </div>
      )}
    </div>
  )
}

export default function DomainScanner() {
  const [domain, setDomain] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanResults, setScanResults] = useState<DomainData[]>([])
  const [activeTab, setActiveTab] = useState("results")
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const [networkData, setNetworkData] = useState<{ nodes: NetworkNode[]; links: NetworkLink[] }>({
    nodes: [],
    links: [],
  })

  // Tarama ayarları
  const [scanDepth, setScanDepth] = useState(2)
  const [scanTimeout, setScanTimeout] = useState(30)
  const [includeSubdomains, setIncludeSubdomains] = useState(true)
  const [includePaths, setIncludePaths] = useState(true)
  const [detectTechnologies, setDetectTechnologies] = useState(true)
  const [scanPorts, setScanPorts] = useState(false)
  const [commonPorts] = useState<string[]>(["80", "443", "8080", "8443"])
  const [useWordlist, setUseWordlist] = useState(true)
  const [wordlistSize, setWordlistSize] = useState("medium")
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true)
  const [requestDelay, setRequestDelay] = useState(500)
  const [maxConcurrentRequests, setMaxConcurrentRequests] = useState(5)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [saveScreenshots, setSaveScreenshots] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")

  // Interval temizleme
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  // Tarama işlemini başlat
  const startScan = () => {
    try {
      // Domain kontrolü
      if (!domain) {
        toast({
          title: "Domain gerekli",
          description: "Lütfen tarama için bir domain girin",
          variant: "destructive",
        })
        return
      }

      // Önceki interval'ı temizle
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }

      setIsScanning(true)
      setProgress(0)
      setScanResults([])
      setLogs([])
      setActiveTab("logs")

      // Log ekle
      addLog(`Tarama başlatılıyor: ${domain}`)
      addLog(`Tarama derinliği: ${scanDepth}`)
      addLog(`Alt domain taraması: ${includeSubdomains ? "Açık" : "Kapalı"}`)
      addLog(`Path taraması: ${includePaths ? "Açık" : "Kapalı"}`)
      addLog(`Teknoloji tespiti: ${detectTechnologies ? "Açık" : "Kapalı"}`)
      addLog(`Port taraması: ${scanPorts ? "Açık" : "Kapalı"}`)

      // Simüle edilmiş tarama işlemi
      const totalSteps = 100
      let currentStep = 0

      // Ağ verisi oluşturma
      const nodes: NetworkNode[] = [{ id: domain, label: domain, type: "domain", level: 0 }]
      const links: NetworkLink[] = []

      // Ana domain'i ekle
      addLog(`Ana domain ekleniyor: ${domain}`)
      setScanResults([
        {
          domain: domain,
          type: "main",
          status: 200,
          ip: "104.21.234.56",
          technologies: ["Nginx", "PHP", "WordPress"],
          lastChecked: new Date().toISOString(),
          responseTime: 120,
        },
      ])

      // Yeni interval oluştur
      const newIntervalId = setInterval(
        () => {
          if (currentStep >= totalSteps) {
            clearInterval(newIntervalId)
            setIntervalId(null)
            setIsScanning(false)
            setProgress(100)
            setActiveTab("results")

            // Ağ verilerini güncelle
            setNetworkData({ nodes, links })

            addLog(`Tarama tamamlandı: ${domain}`)
            addLog(`Toplam bulunan sonuç: ${scanResults.length + 1}`)

            toast({
              title: "Tarama tamamlandı",
              description: `${domain} için tarama işlemi başarıyla tamamlandı`,
            })
            return
          }

          // Tarama adımlarını gerçekleştir
          simulateScanStep(currentStep, nodes, links)

          // İlerlemeyi güncelle
          currentStep++
          setProgress(Math.floor((currentStep / totalSteps) * 100))
        },
        Math.max(100, requestDelay / 10),
      ) // Simülasyon için hızlandırılmış

      // Interval ID'yi kaydet
      setIntervalId(newIntervalId)
    } catch (error) {
      console.error("Tarama işlemi başlatılırken hata oluştu:", error)
      toast({
        title: "Hata",
        description: "Tarama işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      setIsScanning(false)
    }
  }

  // Log ekle
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prevLogs) => [...prevLogs, `[${timestamp}] ${message}`])
  }

  // Tarama adımını simüle eden fonksiyon
  const simulateScanStep = (currentStep: number, nodes: NetworkNode[], links: NetworkLink[]) => {
    // Wordlist dışında otomatik alt domain keşfi için DNS permütasyonları
    const commonSubdomains = [
      "www",
      "mail",
      "webmail",
      "remote",
      "blog",
      "dev",
      "test",
      "stage",
      "api",
      "admin",
      "intranet",
      "portal",
      "secure",
      "vpn",
      "ftp",
      "cloud",
      "support",
      "shop",
      "store",
      "app",
      "m",
      "mobile",
      "help",
      "docs",
      "kb",
      "wiki",
    ]

    // Yaygın path'ler
    const commonPaths = [
      "/admin",
      "/login",
      "/wp-admin",
      "/dashboard",
      "/panel",
      "/cp",
      "/user",
      "/account",
      "/profile",
      "/settings",
      "/config",
      "/setup",
      "/install",
      "/docs",
      "/documentation",
      "/help",
      "/faq",
      "/about",
      "/contact",
      "/support",
    ]

    // Teknolojiler listesi
    const technologies = [
      "Apache",
      "Nginx",
      "IIS",
      "Node.js",
      "PHP",
      "ASP.NET",
      "WordPress",
      "Joomla",
      "Drupal",
      "Laravel",
      "React",
      "Angular",
      "Vue.js",
      "jQuery",
      "Bootstrap",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Cloudflare",
      "AWS",
      "Azure",
    ]

    // IP adresleri
    const ipAddresses = [
      "104.21.234.56",
      "172.67.178.45",
      "13.32.99.166",
      "13.33.88.45",
      "151.101.1.195",
      "151.101.65.195",
      "104.16.182.15",
      "104.16.183.15",
    ]

    // Her adımda yeni veri ekleme
    if (currentStep < 30 && includeSubdomains) {
      // Alt domain ekleme
      const randomSubdomain = commonSubdomains[Math.floor(Math.random() * commonSubdomains.length)]
      const fullSubdomain = `${randomSubdomain}.${domain}`
      const randomStatus = Math.random() > 0.2 ? 200 : [403, 404, 500, 502, 503][Math.floor(Math.random() * 5)]
      const randomIP = ipAddresses[Math.floor(Math.random() * ipAddresses.length)]

      const randomTechs = []
      if (detectTechnologies) {
        const techCount = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < techCount; i++) {
          randomTechs.push(technologies[Math.floor(Math.random() * technologies.length)])
        }
      }

      const randomPorts = []
      if (scanPorts) {
        const portCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < portCount; i++) {
          randomPorts.push(Number.parseInt(commonPorts[Math.floor(Math.random() * commonPorts.length)]))
        }
      }

      const newData: DomainData = {
        domain: fullSubdomain,
        type: "subdomain",
        status: randomStatus,
        ip: randomIP,
        technologies: randomTechs,
        lastChecked: new Date().toISOString(),
        openPorts: randomPorts,
        responseTime: Math.floor(Math.random() * 500) + 50,
      }

      addLog(`Alt domain bulundu: ${fullSubdomain} (${randomStatus})`)
      setScanResults((prev) => [...prev, newData])

      // Ağ verilerine ekle
      if (randomStatus === 200) {
        nodes.push({ id: fullSubdomain, label: randomSubdomain, type: "subdomain", level: 1 })
        links.push({ source: domain, target: fullSubdomain, value: 1 })

        // IP bağlantısı
        if (!nodes.some((n) => n.id === randomIP)) {
          nodes.push({ id: randomIP, label: randomIP, type: "ip", level: 2 })
        }
        links.push({ source: fullSubdomain, target: randomIP, value: 1 })
      }
    } else if (currentStep >= 30 && currentStep < 70 && includePaths) {
      // Path ekleme
      const randomPath = commonPaths[Math.floor(Math.random() * commonPaths.length)]
      const fullPath = `${domain}${randomPath}`
      const randomStatus = Math.random() > 0.3 ? 200 : [403, 404, 500, 502, 503][Math.floor(Math.random() * 5)]

      const randomTechs = []
      if (detectTechnologies) {
        const techCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < techCount; i++) {
          randomTechs.push(technologies[Math.floor(Math.random() * technologies.length)])
        }
      }

      const newData: DomainData = {
        domain: fullPath,
        type: "path",
        status: randomStatus,
        technologies: randomTechs,
        lastChecked: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 300) + 20,
      }

      addLog(`Path bulundu: ${fullPath} (${randomStatus})`)
      setScanResults((prev) => [...prev, newData])

      // Ağ verilerine ekle
      if (randomStatus === 200) {
        nodes.push({ id: fullPath, label: randomPath, type: "path", level: 1 })
        links.push({ source: domain, target: fullPath, value: 1 })
      }
    } else if (currentStep >= 70) {
      // Alt domainlerin path'lerini ekleme
      if (includeSubdomains && includePaths) {
        const existingSubdomains = scanResults
          .filter((r) => r.type === "subdomain" && r.status === 200)
          .map((r) => r.domain)

        if (existingSubdomains.length > 0) {
          const randomSubdomain = existingSubdomains[Math.floor(Math.random() * existingSubdomains.length)]
          const randomPath = commonPaths[Math.floor(Math.random() * commonPaths.length)]
          const fullPath = `${randomSubdomain}${randomPath}`
          const randomStatus = Math.random() > 0.4 ? 200 : [403, 404, 500, 502, 503][Math.floor(Math.random() * 5)]

          const randomTechs = []
          if (detectTechnologies) {
            const techCount = Math.floor(Math.random() * 3) + 1
            for (let i = 0; i < techCount; i++) {
              randomTechs.push(technologies[Math.floor(Math.random() * technologies.length)])
            }
          }

          const newData: DomainData = {
            domain: fullPath,
            type: "path",
            status: randomStatus,
            technologies: randomTechs,
            lastChecked: new Date().toISOString(),
            responseTime: Math.floor(Math.random() * 300) + 20,
          }

          addLog(`Alt domain path bulundu: ${fullPath} (${randomStatus})`)
          setScanResults((prev) => [...prev, newData])

          // Ağ verilerine ekle
          if (randomStatus === 200) {
            nodes.push({ id: fullPath, label: randomPath, type: "path", level: 2 })
            links.push({ source: randomSubdomain, target: fullPath, value: 1 })
          }
        }
      }
    }
  }

  // Sonuçları dışa aktar
  const exportResults = () => {
    if (scanResults.length === 0) {
      toast({
        title: "Dışa aktarılacak sonuç yok",
        description: "Lütfen önce bir tarama gerçekleştirin",
        variant: "destructive",
      })
      return
    }

    let content = ""
    let filename = `${domain}-scan-results.`

    if (exportFormat === "json") {
      content = JSON.stringify(scanResults, null, 2)
      filename += "json"
    } else if (exportFormat === "csv") {
      // CSV başlık
      content = "Domain,Type,Status,IP,Technologies,LastChecked,ResponseTime\n"
      // CSV satırları
      scanResults.forEach((result) => {
        content += `${result.domain},${result.type},${result.status},${result.ip || ""},${
          result.technologies ? result.technologies.join("|") : ""
        },${result.lastChecked},${result.responseTime || ""}\n`
      })
      filename += "csv"
    } else if (exportFormat === "txt") {
      scanResults.forEach((result) => {
        content += `Domain: ${result.domain}\n`
        content += `Type: ${result.type}\n`
        content += `Status: ${result.status}\n`
        if (result.ip) content += `IP: ${result.ip}\n`
        if (result.technologies && result.technologies.length > 0)
          content += `Technologies: ${result.technologies.join(", ")}\n`
        content += `Last Checked: ${result.lastChecked}\n`
        if (result.responseTime) content += `Response Time: ${result.responseTime}ms\n`
        content += "\n"
      })
      filename += "txt"
    }

    // Dosyayı indir
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Dışa aktarma başarılı",
      description: `Sonuçlar ${filename} dosyasına aktarıldı`,
    })
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="web-hack-test-theme">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Web Hack Test - Domain Tarama</h1>
            <p className="text-muted-foreground">
              Hedef domain'in yapısını keşfedin, alt domainleri ve güvenlik açıklarını tespit edin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Search className="mr-2 h-4 w-4" />
                Dork Oluşturucu
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/scraper">
                <Globe className="mr-2 h-4 w-4" />
                Web Kazıma
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hedef Domain</CardTitle>
                <CardDescription>Taramak istediğiniz domain adını girin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="ornek.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={isScanning}
                  />
                  <Button onClick={startScan} disabled={isScanning || !domain}>
                    {isScanning ? "Taranıyor..." : "Taramayı Başlat"}
                  </Button>
                </div>

                {isScanning && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>İlerleme</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarama Ayarları</CardTitle>
                <CardDescription>Tarama parametrelerini özelleştirin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="scanDepth">Tarama Derinliği</Label>
                    <span className="text-sm text-muted-foreground">{scanDepth}</span>
                  </div>
                  <Slider
                    id="scanDepth"
                    min={1}
                    max={5}
                    step={1}
                    value={[scanDepth]}
                    onValueChange={(value) => setScanDepth(value[0])}
                    disabled={isScanning}
                  />
                  <p className="text-xs text-muted-foreground">
                    Daha yüksek derinlik daha fazla sonuç üretir ancak daha uzun sürer
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeSubdomains"
                        checked={includeSubdomains}
                        onCheckedChange={setIncludeSubdomains}
                        disabled={isScanning}
                      />
                      <Label htmlFor="includeSubdomains">Alt Domainleri Tara</Label>
                    </div>
                    <Badge variant={includeSubdomains ? "default" : "outline"}>
                      {includeSubdomains ? "Açık" : "Kapalı"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includePaths"
                        checked={includePaths}
                        onCheckedChange={setIncludePaths}
                        disabled={isScanning}
                      />
                      <Label htmlFor="includePaths">Path'leri Tara</Label>
                    </div>
                    <Badge variant={includePaths ? "default" : "outline"}>{includePaths ? "Açık" : "Kapalı"}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="detectTechnologies"
                        checked={detectTechnologies}
                        onCheckedChange={setDetectTechnologies}
                        disabled={isScanning}
                      />
                      <Label htmlFor="detectTechnologies">Teknolojileri Tespit Et</Label>
                    </div>
                    <Badge variant={detectTechnologies ? "default" : "outline"}>
                      {detectTechnologies ? "Açık" : "Kapalı"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="scanPorts" checked={scanPorts} onCheckedChange={setScanPorts} disabled={isScanning} />
                      <Label htmlFor="scanPorts">Port Taraması Yap</Label>
                    </div>
                    <Badge variant={scanPorts ? "default" : "outline"}>{scanPorts ? "Açık" : "Kapalı"}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useWordlist"
                        checked={useWordlist}
                        onCheckedChange={setUseWordlist}
                        disabled={isScanning}
                      />
                      <Label htmlFor="useWordlist">Wordlist Kullan</Label>
                    </div>
                    <Badge variant={useWordlist ? "default" : "outline"}>{useWordlist ? "Açık" : "Kapalı"}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="respectRobotsTxt"
                        checked={respectRobotsTxt}
                        onCheckedChange={setRespectRobotsTxt}
                        disabled={isScanning}
                      />
                      <Label htmlFor="respectRobotsTxt">robots.txt'ye Uy</Label>
                    </div>
                    <Badge variant={respectRobotsTxt ? "default" : "outline"}>
                      {respectRobotsTxt ? "Açık" : "Kapalı"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="requestDelay">İstek Gecikmesi (ms)</Label>
                    <span className="text-sm text-muted-foreground">{requestDelay}ms</span>
                  </div>
                  <Slider
                    id="requestDelay"
                    min={0}
                    max={2000}
                    step={100}
                    value={[requestDelay]}
                    onValueChange={(value) => setRequestDelay(value[0])}
                    disabled={isScanning}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="maxConcurrentRequests">Eşzamanlı İstek Sayısı</Label>
                    <span className="text-sm text-muted-foreground">{maxConcurrentRequests}</span>
                  </div>
                  <Slider
                    id="maxConcurrentRequests"
                    min={1}
                    max={20}
                    step={1}
                    value={[maxConcurrentRequests]}
                    onValueChange={(value) => setMaxConcurrentRequests(value[0])}
                    disabled={isScanning}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="results">Sonuçlar</TabsTrigger>
                <TabsTrigger value="network">Ağ Haritası</TabsTrigger>
                <TabsTrigger value="logs">Loglar</TabsTrigger>
                <TabsTrigger value="analysis">Analiz</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Tarama Sonuçları</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className="text-sm border rounded p-1"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="txt">TXT</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={exportResults} disabled={scanResults.length === 0}>
                      <Download className="bg-white text-black hover:bg-gray-100" />
                      Dışa Aktar
                    </Button>
                  </div>
                </div>

                {scanResults.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Domain/Path</TableHead>
                          <TableHead>Tür</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Teknolojiler</TableHead>
                          <TableHead>Yanıt Süresi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scanResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{result.domain}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  result.type === "main"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : result.type === "subdomain"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                }
                              >
                                {result.type === "main"
                                  ? "Ana Domain"
                                  : result.type === "subdomain"
                                    ? "Alt Domain"
                                    : "Path"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={result.status === 200 ? "default" : "destructive"}
                                className={
                                  result.status === 200
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }
                              >
                                {result.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{result.ip || "-"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {result.technologies && result.technologies.length > 0 ? (
                                  result.technologies.map((tech, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {tech}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{result.responseTime ? `${result.responseTime}ms` : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                    <Search className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">Henüz Sonuç Yok</h3>
                    <p className="text-muted-foreground max-w-md text-sm">
                      Sonuçları görmek için bir domain taraması başlatın. Tarama tamamlandığında sonuçlar burada
                      listelenecektir.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="network">
                <Card>
                  <CardHeader>
                    <CardTitle>Ağ Haritası</CardTitle>
                    <CardDescription>Domain ve alt domainlerin ağ haritası</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NetworkGraph data={networkData} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarama Logları</CardTitle>
                    <CardDescription>Tarama sırasında gerçekleşen olayların kaydı</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                      {logs.length > 0 ? (
                        <div className="space-y-1 font-mono text-sm">
                          {logs.map((log, index) => (
                            <div key={index} className="text-muted-foreground">
                              {log}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium">Henüz Log Yok</h3>
                          <p className="text-muted-foreground max-w-md text-sm">
                            Tarama başladığında loglar burada görüntülenecektir.
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle>Güvenlik Analizi</CardTitle>
                    <CardDescription>Tespit edilen güvenlik sorunları ve öneriler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {scanResults.length > 0 ? (
                      <div className="space-y-4">
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Analiz Raporu</AlertTitle>
                          <AlertDescription>
                            {domain} için güvenlik analizi tamamlandı. Aşağıda tespit edilen sorunlar ve öneriler
                            listelenmektedir.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4 mt-4">
                          <div className="border rounded-md p-4">
                            <h3 className="text-lg font-medium flex items-center">
                              <Shield className="h-5 w-5 mr-2 text-amber-500" />
                              Güvenlik Özeti
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div className="border rounded-md p-3 text-center">
                                <div className="text-2xl font-bold">{scanResults.length}</div>
                                <div className="text-sm text-muted-foreground">Toplam Bulunan</div>
                              </div>
                              <div className="border rounded-md p-3 text-center">
                                <div className="text-2xl font-bold">
                                  {scanResults.filter((r) => r.type === "subdomain").length}
                                </div>
                                <div className="text-sm text-muted-foreground">Alt Domain</div>
                              </div>
                              <div className="border rounded-md p-3 text-center">
                                <div className="text-2xl font-bold">
                                  {scanResults.filter((r) => r.type === "path").length}
                                </div>
                                <div className="text-sm text-muted-foreground">Path</div>
                              </div>
                              <div className="border rounded-md p-3 text-center">
                                <div className="text-2xl font-bold text-amber-500">3</div>
                                <div className="text-sm text-muted-foreground">Güvenlik Sorunu</div>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <h3 className="text-lg font-medium flex items-center">
                              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                              Tespit Edilen Sorunlar
                            </h3>
                            <div className="space-y-3 mt-4">
                              <div className="flex items-start p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="font-medium">Hassas Dizinler Açık</h4>
                                  <p className="text-sm text-muted-foreground">
                                    /admin, /config gibi hassas dizinler dışarıdan erişilebilir durumda.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="font-medium">Eski Yazılım Sürümleri</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Bazı alt domainlerde güncel olmayan ve güvenlik açığı içerebilecek yazılım sürümleri
                                    tespit edildi.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="font-medium">HTTP Kullanımı</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Bazı alt domainler HTTPS yerine güvenli olmayan HTTP protokolü kullanıyor.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <h3 className="text-lg font-medium flex items-center">
                              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                              Öneriler
                            </h3>
                            <div className="space-y-3 mt-4">
                              <div className="flex items-start p-3 border rounded-md">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="font-medium">Hassas Dizinleri Koruyun</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Admin paneli ve yapılandırma dizinlerini IP kısıtlaması veya güçlü kimlik doğrulama
                                    ile koruyun.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start p-3 border rounded-md">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="font-medium">Yazılımları Güncelleyin</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Tüm yazılım bileşenlerini en son güvenlik yamalarını içeren sürümlere güncelleyin.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start p-3 border rounded-md">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="font-medium">HTTPS Kullanın</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Tüm alt domainlerde HTTPS protokolünü zorunlu hale getirin ve HTTP'den HTTPS'ye
                                    yönlendirme yapın.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <BarChart className="h-10 w-10 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium">Analiz Henüz Yapılmadı</h3>
                        <p className="text-muted-foreground max-w-md text-sm">
                          Güvenlik analizi için önce bir domain taraması başlatın. Tarama tamamlandığında analiz
                          sonuçları burada görüntülenecektir.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Ayzıo Domain Tarama Sistemi
                </CardTitle>
                <CardDescription>
                  Bu araç, hedef domain'in yapısını keşfetmenize, alt domainleri ve güvenlik açıklarını tespit etmenize
                  yardımcı olur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                      <Server className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Alt Domain Keşfi</p>
                        <p className="text-muted-foreground text-xs">
                          Hedef domain'in tüm alt domainlerini otomatik olarak keşfedin
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                      <Wifi className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Port Taraması</p>
                        <p className="text-muted-foreground text-xs">
                          Açık portları tespit edin ve potansiyel hizmetleri belirleyin
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                      <Code className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Teknoloji Tespiti</p>
                        <p className="text-muted-foreground text-xs">
                          Kullanılan web teknolojilerini ve yazılım sürümlerini tespit edin
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                      <Database className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Path Keşfi</p>
                        <p className="text-muted-foreground text-xs">
                          Gizli dizinleri ve dosyaları otomatik olarak keşfedin
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-md">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">Nasıl Kullanılır:</p>
                    <ol className="text-blue-700 dark:text-blue-300 text-xs mt-2 space-y-1 list-decimal pl-4">
                      <li>Hedef domain'i girin</li>
                      <li>Tarama ayarlarını ihtiyacınıza göre özelleştirin</li>
                      <li>"Taramayı Başlat" butonuna tıklayın</li>
                      <li>Sonuçları ve ağ haritasını inceleyin</li>
                      <li>Güvenlik analizini gözden geçirin ve önerileri uygulayın</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

