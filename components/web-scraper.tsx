"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/hooks/use-toast"
import {
  Network,
  Search,
  Download,
  FileText,
  AlertTriangle,
  Info,
  Play,
  Pause,
  RotateCcw,
  Copy,
  ExternalLink,
  Code,
  Database,
  FolderSearch,
  Folder,
  File,
  FileJson,
  FileCode,
  Image,
} from "lucide-react"

interface ScrapedData {
  url: string
  title: string
  content: string
  timestamp: string
  status: number
  type?: string
  size?: string
  path?: string
}

export default function WebScraper() {
  const [targetUrl, setTargetUrl] = useState("https://example.com")
  const [dorkQuery, setDorkQuery] = useState("")
  const [customDorks, setCustomDorks] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ScrapedData[]>([])
  const [activeTab, setActiveTab] = useState("input")
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [maxResults, setMaxResults] = useState(20)
  const [searchDepth, setSearchDepth] = useState(2)
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [extractImages, setExtractImages] = useState(false)
  const [extractLinks, setExtractLinks] = useState(true)
  const [requestDelay, setRequestDelay] = useState(500)
  const [exportFormat, setExportFormat] = useState("json")
  const [scrapingMode, setScrapingMode] = useState<"dork" | "direct">("dork")
  const [fileTypes, setFileTypes] = useState<string[]>(["html", "php", "js", "css", "txt", "pdf", "xml", "json"])
  const [scanSubfolders, setScanSubfolders] = useState(true)

  // Interval temizleme
  React.useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const startScraping = () => {
    if (scrapingMode === "dork" && !dorkQuery) {
      toast({
        title: "Dork sorgusu gerekli",
        description: "Lütfen kazıma için bir dork sorgusu girin",
        variant: "destructive",
      })
      return
    }

    if (!targetUrl) {
      toast({
        title: "Hedef URL gerekli",
        description: "Lütfen kazıma için bir hedef URL girin",
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
    setResults([])
    setActiveTab("results")

    // Simüle edilmiş kazıma işlemi
    const totalSteps = 100
    let currentStep = 0

    // Yeni interval oluştur
    const newIntervalId = setInterval(
      () => {
        if (currentStep >= totalSteps) {
          clearInterval(newIntervalId)
          setIntervalId(null)
          setIsScanning(false)
          setProgress(100)

          toast({
            title: "Kazıma tamamlandı",
            description: `${results.length} sonuç başarıyla kazındı`,
          })
          return
        }

        // Kazıma adımlarını gerçekleştir
        if (scrapingMode === "dork") {
          simulateDorkScrapingStep()
        } else {
          simulateDirectScrapingStep()
        }

        // İlerlemeyi güncelle
        currentStep++
        setProgress(Math.floor((currentStep / totalSteps) * 100))
      },
      Math.max(100, requestDelay / 10),
    ) // Simülasyon için hızlandırılmış

    // Interval ID'yi kaydet
    setIntervalId(newIntervalId)
  }

  const stopScraping = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
      setIsScanning(false)

      toast({
        title: "Kazıma durduruldu",
        description: "Kazıma işlemi kullanıcı tarafından durduruldu",
      })
    }
  }

  const resetScraping = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setIsScanning(false)
    setProgress(0)
    setResults([])

    toast({
      title: "Kazıma sıfırlandı",
      description: "Kazıma sonuçları temizlendi",
    })
  }

  // Dork tabanlı kazıma simülasyonu
  const simulateDorkScrapingStep = () => {
    // Örnek içerik
    const contentTemplates = [
      "Bu sayfada aradığınız bilgiler bulunmaktadır. Kullanıcı adı ve şifre bilgileri için yönetici ile iletişime geçin.",
      "Gizli belgelere erişim için yetkilendirme gereklidir. Lütfen kimlik bilgilerinizi girin.",
      "Veritabanı yapılandırma dosyası. Bu dosya hassas bilgiler içerebilir.",
      "API anahtarları ve token bilgileri. Bu bilgileri güvenli bir şekilde saklayın.",
      "Kullanıcı listesi ve erişim seviyeleri. Bu bilgiler yalnızca yetkili personel tarafından görüntülenebilir.",
      "Sistem yapılandırma dosyası. Sunucu ayarları ve güvenlik parametreleri içerir.",
      "Yedekleme dosyaları ve arşivler. Eski veritabanı kayıtları ve kullanıcı bilgileri bulunabilir.",
      "Hata günlükleri ve sistem mesajları. Güvenlik açıkları ve hatalar hakkında bilgi içerebilir.",
      "Geliştirici notları ve dokümantasyon. Sistem mimarisi ve güvenlik önlemleri hakkında bilgiler.",
      "Test verileri ve örnek kullanıcı hesapları. Geliştirme aşamasında kullanılan test bilgileri.",
    ]

    // Örnek başlıklar
    const titleTemplates = [
      "Kullanıcı Yönetimi",
      "Sistem Yapılandırması",
      "API Dokümantasyonu",
      "Veritabanı Şeması",
      "Güvenlik Ayarları",
      "Yedekleme Sistemi",
      "Hata Günlükleri",
      "Geliştirici Notları",
      "Test Verileri",
      "Erişim Kontrol Listesi",
    ]

    // Dork sorgusundan URL oluştur
    const domain = new URL(targetUrl).hostname
    const randomPath = `/${Math.random().toString(36).substring(7)}`
    const randomStatus = Math.random() > 0.2 ? 200 : [403, 404, 500, 502, 503][Math.floor(Math.random() * 5)]

    const newData: ScrapedData = {
      url: `${targetUrl}${randomPath}`,
      title: titleTemplates[Math.floor(Math.random() * titleTemplates.length)],
      content: contentTemplates[Math.floor(Math.random() * contentTemplates.length)],
      timestamp: new Date().toISOString(),
      status: randomStatus,
      type: "html",
      path: randomPath,
    }

    setResults((prev) => [...prev, newData])
  }

  // Doğrudan site kazıma simülasyonu
  const simulateDirectScrapingStep = () => {
    // Dosya türleri
    const fileTypeOptions = [
      { ext: "html", type: "HTML Dosyası" },
      { ext: "php", type: "PHP Dosyası" },
      { ext: "js", type: "JavaScript Dosyası" },
      { ext: "css", type: "CSS Dosyası" },
      { ext: "txt", type: "Metin Dosyası" },
      { ext: "pdf", type: "PDF Dosyası" },
      { ext: "xml", type: "XML Dosyası" },
      { ext: "json", type: "JSON Dosyası" },
      { ext: "jpg", type: "Resim Dosyası" },
      { ext: "png", type: "Resim Dosyası" },
      { ext: "svg", type: "SVG Dosyası" },
      { ext: "doc", type: "Word Dosyası" },
      { ext: "xls", type: "Excel Dosyası" },
      { ext: "zip", type: "Arşiv Dosyası" },
      { ext: "sql", type: "SQL Dosyası" },
      { ext: "bak", type: "Yedek Dosyası" },
      { ext: "log", type: "Log Dosyası" },
      { ext: "config", type: "Yapılandırma Dosyası" },
      { ext: "env", type: "Ortam Değişkenleri" },
    ]

    // Klasör yapısı
    const folderStructure = [
      "/admin",
      "/includes",
      "/assets",
      "/images",
      "/css",
      "/js",
      "/api",
      "/backup",
      "/config",
      "/data",
      "/docs",
      "/uploads",
      "/temp",
      "/cache",
      "/logs",
      "/vendor",
      "/system",
      "/public",
      "/private",
    ]

    // Rastgele bir klasör ve dosya seç
    const randomFolder = scanSubfolders ? folderStructure[Math.floor(Math.random() * folderStructure.length)] : ""

    const randomFileType = fileTypeOptions[Math.floor(Math.random() * fileTypeOptions.length)]
    const randomFileName = Math.random().toString(36).substring(7)
    const randomFilePath = `${randomFolder}/${randomFileName}.${randomFileType.ext}`
    const randomStatus = Math.random() > 0.2 ? 200 : [403, 404, 500, 502, 503][Math.floor(Math.random() * 5)]
    const randomSize = `${Math.floor(Math.random() * 1000) + 1}KB`

    // İçerik oluştur
    let content = ""
    if (randomFileType.ext === "html" || randomFileType.ext === "php") {
      content = `<!DOCTYPE html>\n<html>\n<head>\n  <title>Sayfa Başlığı</title>\n</head>\n<body>\n  <h1>Örnek İçerik</h1>\n  <p>Bu bir örnek içeriktir.</p>\n  <!-- Kullanıcı: admin, Şifre: password123 -->\n</body>\n</html>`
    } else if (randomFileType.ext === "js") {
      content = `// API Anahtarı\nconst API_KEY = "sk_test_51HZ6qIJLOrX7pYzWbwkMwQVHtXUWClOgNu2Vvc";\n\nfunction authenticate() {\n  // Kullanıcı kimlik doğrulama\n  const username = "admin";\n  const password = "secure_password";\n  // API isteği gönder\n}`
    } else if (randomFileType.ext === "json") {
      content = `{\n  "database": {\n    "host": "localhost",\n    "user": "dbadmin",\n    "password": "db_password_123",\n    "name": "app_database"\n  },\n  "api": {\n    "key": "api_secret_key_123",\n    "endpoint": "https://api.example.com"\n  }\n}`
    } else if (randomFileType.ext === "env" || randomFileType.ext === "config") {
      content = `DB_HOST=localhost\nDB_USER=root\nDB_PASS=root_password\nAPI_KEY=sk_live_51HZ6qIJLOrX7pYzWbwkMwQVHtXUWClOgNu2Vvc\nSECRET_KEY=app_secret_key_123\nADMIN_EMAIL=admin@example.com`
    } else if (randomFileType.ext === "log") {
      content = `[2023-03-15 08:45:12] ERROR: Failed login attempt for user 'admin'\n[2023-03-15 09:12:34] INFO: Database backup completed\n[2023-03-15 10:23:45] WARNING: High server load detected\n[2023-03-15 11:34:56] ERROR: API key expired for client 'example_client'`
    } else {
      content = `Bu bir ${randomFileType.type} içeriğidir. Dosya boyutu: ${randomSize}`
    }

    const newData: ScrapedData = {
      url: `${targetUrl}${randomFilePath}`,
      title: `${randomFileName}.${randomFileType.ext}`,
      content: content,
      timestamp: new Date().toISOString(),
      status: randomStatus,
      type: randomFileType.ext,
      size: randomSize,
      path: randomFilePath,
    }

    setResults((prev) => [...prev, newData])
  }

  const exportResults = () => {
    if (results.length === 0) {
      toast({
        title: "Dışa aktarılacak sonuç yok",
        description: "Lütfen önce bir kazıma gerçekleştirin",
        variant: "destructive",
      })
      return
    }

    let content = ""
    let filename = `web-scraping-results-${new Date().toISOString().split("T")[0]}.`

    if (exportFormat === "json") {
      content = JSON.stringify(results, null, 2)
      filename += "json"
    } else if (exportFormat === "csv") {
      // CSV başlık
      content = "URL,Title,Type,Size,Path,Status,Timestamp\n"
      // CSV satırları
      results.forEach((result) => {
        content += `"${result.url}","${result.title}","${result.type || ""}","${result.size || ""}","${result.path || ""}",${result.status},"${result.timestamp}"\n`
      })
      filename += "csv"
    } else if (exportFormat === "txt") {
      results.forEach((result, index) => {
        content += `--- Sonuç ${index + 1} ---\n`
        content += `URL: ${result.url}\n`
        content += `Başlık: ${result.title}\n`
        if (result.type) content += `Tür: ${result.type}\n`
        if (result.size) content += `Boyut: ${result.size}\n`
        if (result.path) content += `Yol: ${result.path}\n`
        content += `Durum: ${result.status}\n`
        content += `Zaman: ${new Date(result.timestamp).toLocaleString()}\n`
        content += `İçerik:\n${result.content}\n\n`
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Panoya kopyalandı",
      description: "İçerik panoya kopyalandı",
    })
  }

  // Dosya türüne göre ikon seç
  const getFileIcon = (type?: string) => {
    if (!type) return <File className="h-4 w-4" />

    switch (type.toLowerCase()) {
      case "html":
      case "php":
      case "asp":
      case "jsp":
        return <FileCode className="h-4 w-4" />
      case "js":
      case "css":
      case "ts":
        return <Code className="h-4 w-4" />
      case "json":
      case "xml":
      case "yaml":
      case "yml":
        return <FileJson className="h-4 w-4" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
      case "webp":
        return <Image className="h-4 w-4" />
      case "pdf":
      case "doc":
      case "docx":
      case "xls":
      case "xlsx":
      case "txt":
        return <FileText className="h-4 w-4" />
      case "sql":
      case "db":
        return <Database className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Web Hack Test - Web Kazıma Sistemi</h1>
          <p className="text-muted-foreground">Web sitelerinden veri kazıma ve analiz</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Dork Oluşturucu
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/domain-scanner">
              <Network className="mr-2 h-4 w-4" />
              Domain Tarama
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kazıma Modu</CardTitle>
              <CardDescription>Kazıma yöntemini seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={scrapingMode === "dork" ? "default" : "outline"}
                  onClick={() => setScrapingMode("dork")}
                  className="h-24 flex flex-col"
                  disabled={isScanning}
                >
                  <Search className="h-8 w-8 mb-2" />
                  <span>Dork Tabanlı Kazıma</span>
                </Button>
                <Button
                  variant={scrapingMode === "direct" ? "default" : "outline"}
                  onClick={() => setScrapingMode("direct")}
                  className="h-24 flex flex-col"
                  disabled={isScanning}
                >
                  <FolderSearch className="h-8 w-8 mb-2" />
                  <span>Doğrudan Site Kazıma</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {scrapingMode === "dork" ? (
            <Card>
              <CardHeader>
                <CardTitle>Dork Sorgusu</CardTitle>
                <CardDescription>Kazıma için kullanılacak dork sorgusunu girin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetUrl">Hedef URL</Label>
                    <Input
                      id="targetUrl"
                      placeholder="https://example.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      disabled={isScanning}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dorkQuery">Google Dork Sorgusu</Label>
                    <Textarea
                      id="dorkQuery"
                      placeholder='site:example.com filetype:pdf intext:"gizli"'
                      value={dorkQuery}
                      onChange={(e) => setDorkQuery(e.target.value)}
                      disabled={isScanning}
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">Örnek: site:example.com filetype:pdf intext:"gizli"</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {!isScanning ? (
                  <Button onClick={startScraping} className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Dork Kazımayı Başlat
                  </Button>
                ) : (
                  <div className="w-full space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between">
                      <Button onClick={stopScraping} variant="destructive" size="sm">
                        <Pause className="mr-2 h-4 w-4" />
                        Durdur
                      </Button>
                      <span className="text-sm text-muted-foreground">{progress}% Tamamlandı</span>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Doğrudan Site Kazıma</CardTitle>
                <CardDescription>Hedef web sitesini doğrudan kazıyın</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="directTargetUrl">Hedef URL</Label>
                    <Input
                      id="directTargetUrl"
                      placeholder="https://example.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      disabled={isScanning}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dosya Türleri</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "html",
                        "php",
                        "js",
                        "css",
                        "txt",
                        "pdf",
                        "xml",
                        "json",
                        "jpg",
                        "doc",
                        "sql",
                        "env",
                        "config",
                        "log",
                      ].map((type) => (
                        <Badge
                          key={type}
                          variant={fileTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (isScanning) return
                            setFileTypes((prev) =>
                              prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
                            )
                          }}
                        >
                          {getFileIcon(type)}
                          <span className="ml-1">.{type}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scanSubfolders"
                        checked={scanSubfolders}
                        onCheckedChange={setScanSubfolders}
                        disabled={isScanning}
                      />
                      <Label htmlFor="scanSubfolders">Alt Klasörleri Tara</Label>
                    </div>
                    <Badge variant={scanSubfolders ? "default" : "outline"}>{scanSubfolders ? "Açık" : "Kapalı"}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {!isScanning ? (
                  <Button onClick={startScraping} className="w-full">
                    <FolderSearch className="mr-2 h-4 w-4" />
                    Doğrudan Kazımayı Başlat
                  </Button>
                ) : (
                  <div className="w-full space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between">
                      <Button onClick={stopScraping} variant="destructive" size="sm">
                        <Pause className="mr-2 h-4 w-4" />
                        Durdur
                      </Button>
                      <span className="text-sm text-muted-foreground">{progress}% Tamamlandı</span>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Kazıma Ayarları</CardTitle>
              <CardDescription>Kazıma parametrelerini özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxResults">Maksimum Sonuç</Label>
                  <Select
                    value={maxResults.toString()}
                    onValueChange={(value) => setMaxResults(Number.parseInt(value))}
                    disabled={isScanning}
                  >
                    <SelectTrigger id="maxResults">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 sonuç</SelectItem>
                      <SelectItem value="20">20 sonuç</SelectItem>
                      <SelectItem value="50">50 sonuç</SelectItem>
                      <SelectItem value="100">100 sonuç</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchDepth">Arama Derinliği</Label>
                  <Select
                    value={searchDepth.toString()}
                    onValueChange={(value) => setSearchDepth(Number.parseInt(value))}
                    disabled={isScanning}
                  >
                    <SelectTrigger id="searchDepth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Düşük (1)</SelectItem>
                      <SelectItem value="2">Orta (2)</SelectItem>
                      <SelectItem value="3">Yüksek (3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="followRedirects"
                      checked={followRedirects}
                      onCheckedChange={setFollowRedirects}
                      disabled={isScanning}
                    />
                    <Label htmlFor="followRedirects">Yönlendirmeleri Takip Et</Label>
                  </div>
                  <Badge variant={followRedirects ? "default" : "outline"}>{followRedirects ? "Açık" : "Kapalı"}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="extractImages"
                      checked={extractImages}
                      onCheckedChange={setExtractImages}
                      disabled={isScanning}
                    />
                    <Label htmlFor="extractImages">Resimleri Çıkart</Label>
                  </div>
                  <Badge variant={extractImages ? "default" : "outline"}>{extractImages ? "Açık" : "Kapalı"}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="extractLinks"
                      checked={extractLinks}
                      onCheckedChange={setExtractLinks}
                      disabled={isScanning}
                    />
                    <Label htmlFor="extractLinks">Bağlantıları Çıkart</Label>
                  </div>
                  <Badge variant={extractLinks ? "default" : "outline"}>{extractLinks ? "Açık" : "Kapalı"}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestDelay">İstek Gecikmesi (ms)</Label>
                <Select
                  value={requestDelay.toString()}
                  onValueChange={(value) => setRequestDelay(Number.parseInt(value))}
                  disabled={isScanning}
                >
                  <SelectTrigger id="requestDelay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100ms (Hızlı)</SelectItem>
                    <SelectItem value="500">500ms (Normal)</SelectItem>
                    <SelectItem value="1000">1000ms (Yavaş)</SelectItem>
                    <SelectItem value="2000">2000ms (Çok Yavaş)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exportFormat">Dışa Aktarma Formatı</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="exportFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Metin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={resetScraping} className="w-full" disabled={isScanning}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Sıfırla
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="results">Sonuçlar</TabsTrigger>
              <TabsTrigger value="content">İçerik</TabsTrigger>
              <TabsTrigger value="analysis">Analiz</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Kazıma Sonuçları</h3>
                <Button variant="outline" size="sm" onClick={exportResults} disabled={results.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Dışa Aktar
                </Button>
              </div>

              {results.length > 0 ? (
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <div className="p-4 space-y-4">
                    {results.map((result, index) => (
                      <Card key={index} className={result.status === 200 ? "" : "border-red-200 dark:border-red-800"}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {getFileIcon(result.type)}
                              <div className="ml-2">
                                <CardTitle className="text-base">{result.title}</CardTitle>
                                <CardDescription className="text-xs truncate max-w-md">{result.url}</CardDescription>
                              </div>
                            </div>
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
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="flex justify-between items-center mb-2">
                            {result.type && <Badge variant="outline">{result.type}</Badge>}
                            {result.size && <span className="text-xs text-muted-foreground">{result.size}</span>}
                          </div>
                          <p className="text-sm line-clamp-3">{result.content}</p>
                        </CardContent>
                        <CardFooter className="py-2 flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.content)}
                              className="h-7 px-2 py-0"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Kopyala
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab("content")}
                              className="h-7 px-2 py-0"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              İçerik
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md bg-muted/20">
                  <Search className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Henüz Sonuç Yok</h3>
                  <p className="text-muted-foreground max-w-md text-sm mt-1">
                    Sonuçları görmek için bir kazıma işlemi başlatın
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>İçerik Görüntüleyici</CardTitle>
                  <CardDescription>Kazınan içeriği görüntüleyin ve analiz edin</CardDescription>
                </CardHeader>
                <CardContent>
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Select defaultValue="0">
                          <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Görüntülenecek içeriği seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {results.map((result, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {result.title} - {result.path || result.url}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(results[0]?.content || "")}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Kopyala
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(results[0]?.url, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Sayfayı Aç
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-md p-4 bg-muted/20">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            {getFileIcon(results[0]?.type)}
                            <h3 className="text-lg font-medium ml-2">{results[0]?.title}</h3>
                          </div>
                          {results[0]?.type && <Badge variant="outline">{results[0]?.type}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{results[0]?.url}</p>
                        {results[0]?.path && (
                          <p className="text-sm text-muted-foreground mb-4">Yol: {results[0]?.path}</p>
                        )}
                        <div className="border-t pt-4">
                          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[300px] p-2 bg-muted rounded-md">
                            {results[0]?.content}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">İçerik Yok</h3>
                      <p className="text-muted-foreground max-w-md text-sm mt-1">
                        İçerik görüntülemek için önce bir kazıma gerçekleştirin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Veri Analizi</CardTitle>
                  <CardDescription>Kazınan verilerin analizi ve özeti</CardDescription>
                </CardHeader>
                <CardContent>
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Analiz Raporu</AlertTitle>
                        <AlertDescription>
                          Bu analiz, kazıma sonuçlarına göre otomatik olarak oluşturulmuştur.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">{results.length}</div>
                          <div className="text-sm text-muted-foreground">Toplam Sonuç</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">{results.filter((r) => r.status === 200).length}</div>
                          <div className="text-sm text-muted-foreground">Başarılı</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">{results.filter((r) => r.status !== 200).length}</div>
                          <div className="text-sm text-muted-foreground">Hatalı</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold text-amber-500">3</div>
                          <div className="text-sm text-muted-foreground">Hassas Bilgi</div>
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                          Tespit Edilen Hassas Bilgiler
                        </h3>
                        <div className="space-y-3 mt-4">
                          <div className="flex items-start p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="font-medium">Kimlik Bilgileri</h4>
                              <p className="text-sm text-muted-foreground">
                                Kullanıcı adı ve şifre bilgileri içeren sayfalar tespit edildi.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="font-medium">API Anahtarları</h4>
                              <p className="text-sm text-muted-foreground">
                                API anahtarları ve token bilgileri içeren yapılandırma dosyaları bulundu.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="font-medium">Veritabanı Bilgileri</h4>
                              <p className="text-sm text-muted-foreground">
                                Veritabanı bağlantı bilgileri ve yapılandırma dosyaları tespit edildi.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Folder className="h-5 w-5 mr-2 text-blue-500" />
                          Dosya Türleri Dağılımı
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {Array.from(new Set(results.map((r) => r.type)))
                            .filter(Boolean)
                            .map((type) => (
                              <Badge
                                key={type}
                                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {getFileIcon(type as string)}
                                <span className="ml-1">{type}</span>
                                <span className="ml-1">({results.filter((r) => r.type === type).length})</span>
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Database className="h-5 w-5 mr-2 text-purple-500" />
                          Klasör Yapısı
                        </h3>
                        <div className="mt-4">
                          <div className="border rounded-md p-3">
                            <div className="flex items-center">
                              <Folder className="h-5 w-5 text-amber-500 mr-2" />
                              <span className="font-medium">Kök Dizin</span>
                            </div>
                            <div className="ml-6 mt-2 space-y-2">
                              {Array.from(new Set(results.map((r) => r.path?.split("/")[1]).filter(Boolean))).map(
                                (folder) => (
                                  <div key={folder} className="flex items-center">
                                    <Folder className="h-4 w-4 text-blue-500 mr-2" />
                                    <span>/{folder}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      ({results.filter((r) => r.path?.startsWith(`/${folder}`)).length} dosya)
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">Analiz Yok</h3>
                      <p className="text-muted-foreground max-w-md text-sm mt-1">
                        Analiz görüntülemek için önce bir kazıma gerçekleştirin
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
                <Search className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Ayzıo Web Kazıma Sistemi
              </CardTitle>
              <CardDescription>
                Bu araç, web sitelerinden veri kazımanıza ve analiz etmenize yardımcı olur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                    <Search className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-300">Dork Tabanlı Kazıma</p>
                      <p className="text-muted-foreground text-xs">
                        Google dork sorgularını kullanarak hassas bilgileri ve dosyaları bulun
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                    <FolderSearch className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-300">Doğrudan Site Kazıma</p>
                      <p className="text-muted-foreground text-xs">
                        Web sitesini doğrudan tarayarak klasörleri ve dosyaları keşfedin
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Nasıl Kullanılır:</p>
                  <ol className="text-blue-700 dark:text-blue-300 text-xs mt-2 space-y-1 list-decimal pl-4">
                    <li>Kazıma modunu seçin: Dork tabanlı veya doğrudan site kazıma</li>
                    <li>Hedef URL'yi ve diğer parametreleri girin</li>
                    <li>Kazıma ayarlarını ihtiyacınıza göre özelleştirin</li>
                    <li>"Kazımayı Başlat" butonuna tıklayın</li>
                    <li>Sonuçları ve içerik analizini inceleyin</li>
                    <li>Gerekirse sonuçları dışa aktarın</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

