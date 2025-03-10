"use client"

import { useState } from "react"
import {
  Copy,
  Database,
  Download,
  FileSearch,
  Globe,
  Plus,
  Search,
  Trash2,
  FileType,
  Image,
  File,
  FileText,
  Network,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DorkGenerator() {
  const [site, setSite] = useState("turkiyesigorta.com.tr")
  const [dorks, setDorks] = useState<string[]>([])
  const [customDorks, setCustomDorks] = useState<string[]>([])
  const [customDork, setCustomDork] = useState("")

  // Genel dork parametreleri
  const [fileType, setFileType] = useState("")
  const [inUrl, setInUrl] = useState("")
  const [inTitle, setInTitle] = useState("")
  const [inText, setInText] = useState("")

  // Veritabanı dork parametreleri
  const [dbType, setDbType] = useState("mysql")
  const [includeErrors, setIncludeErrors] = useState(true)
  const [includeBackups, setIncludeBackups] = useState(true)
  const [includeConfigs, setIncludeConfigs] = useState(true)

  // Dosya arama parametreleri
  const [fileKeywords, setFileKeywords] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "jpg",
    "jpeg",
    "png",
  ])

  // Dosya türleri grupları
  const fileTypeGroups = {
    "Resim Dosyaları": ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "svg", "webp"],
    "Ofis Belgeleri": ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"],
    "Metin Dosyaları": ["pdf", "txt", "rtf", "md", "csv"],
    "Web Dosyaları": ["html", "htm", "xml", "json", "js", "css", "php", "asp", "aspx", "jsp"],
    "Arşiv Dosyaları": ["zip", "rar", "7z", "tar", "gz", "bz2"],
    "Veri Dosyaları": ["sql", "db", "sqlite", "bak", "config", "ini", "env", "log"],
  }

  const generateGeneralDorks = () => {
    if (!site) {
      toast({
        title: "Site gerekli",
        description: "Lütfen dork oluşturmak için bir hedef site girin",
        variant: "destructive",
      })
      return
    }

    const newDorks = [`site:${site}`]

    if (fileType) {
      newDorks.push(`site:${site} filetype:${fileType}`)
    }

    if (inUrl) {
      newDorks.push(`site:${site} inurl:${inUrl}`)
    }

    if (inTitle) {
      newDorks.push(`site:${site} intitle:${inTitle}`)
    }

    if (inText) {
      newDorks.push(`site:${site} intext:${inText}`)
    }

    if (fileType && inText) {
      newDorks.push(`site:${site} filetype:${fileType} intext:${inText}`)
    }

    if (inUrl && inTitle) {
      newDorks.push(`site:${site} inurl:${inUrl} intitle:${inTitle}`)
    }

    setDorks(newDorks)

    toast({
      title: "Dorklar oluşturuldu",
      description: `${newDorks.length} dork oluşturuldu`,
    })
  }

  const generateDatabaseDorks = () => {
    if (!site) {
      toast({
        title: "Site gerekli",
        description: "Lütfen dork oluşturmak için bir hedef site girin",
        variant: "destructive",
      })
      return
    }

    const newDorks: string[] = []

    // Veritabanı dosya uzantıları
    if (dbType === "mysql") {
      newDorks.push(`site:${site} filetype:sql`)
      newDorks.push(`site:${site} filetype:sql intext:"INSERT INTO"`)
      newDorks.push(`site:${site} filetype:sql intext:"CREATE TABLE"`)
    } else if (dbType === "mongodb") {
      newDorks.push(`site:${site} filetype:json intext:"_id"`)
      newDorks.push(`site:${site} intext:"mongodb://"`)
    } else if (dbType === "postgresql") {
      newDorks.push(`site:${site} filetype:sql intext:"CREATE SEQUENCE"`)
      newDorks.push(`site:${site} intext:"postgresql://"`)
    } else if (dbType === "sqlite") {
      newDorks.push(`site:${site} filetype:sqlite`)
      newDorks.push(`site:${site} filetype:db`)
    }

    // Veritabanı bilgilerini açığa çıkarabilecek hata mesajları
    if (includeErrors) {
      if (dbType === "mysql") {
        newDorks.push(`site:${site} intext:"MySQL Error"`)
        newDorks.push(`site:${site} intext:"Warning: mysql_connect()"`)
      } else if (dbType === "mongodb") {
        newDorks.push(`site:${site} intext:"MongoError"`)
      } else if (dbType === "postgresql") {
        newDorks.push(`site:${site} intext:"PostgreSQL Error"`)
      } else if (dbType === "sqlite") {
        newDorks.push(`site:${site} intext:"SQLite Error"`)
      }
    }

    // Veritabanı yedek dosyaları
    if (includeBackups) {
      newDorks.push(`site:${site} inurl:backup filetype:sql`)
      newDorks.push(`site:${site} inurl:dump filetype:sql`)
      newDorks.push(`site:${site} inurl:db filetype:sql`)
      newDorks.push(`site:${site} inurl:database filetype:sql`)

      if (dbType === "mongodb") {
        newDorks.push(`site:${site} inurl:backup filetype:json`)
      }
    }

    // Veritabanı kimlik bilgilerini içerebilecek yapılandırma dosyaları
    if (includeConfigs) {
      newDorks.push(`site:${site} filetype:env`)
      newDorks.push(`site:${site} filetype:config`)
      newDorks.push(`site:${site} filetype:ini`)
      newDorks.push(`site:${site} intext:"DB_PASSWORD"`)
      newDorks.push(`site:${site} intext:"DB_USERNAME"`)

      // Kullanıcı adı ve şifre için ek dorklar
      newDorks.push(`site:${site} intext:"username password"`)
      newDorks.push(`site:${site} intext:"kullanıcı adı şifre"`)
      newDorks.push(`site:${site} intext:"login" filetype:php`)
      newDorks.push(`site:${site} intext:"giriş" filetype:php`)
      newDorks.push(`site:${site} intext:"api_key" OR intext:"apikey" OR intext:"api key"`)
      newDorks.push(`site:${site} intext:"token" filetype:js OR filetype:json`)

      if (dbType === "mysql") {
        newDorks.push(`site:${site} intext:"mysqli_connect"`)
      }
    }

    setDorks(newDorks)

    toast({
      title: "Veritabanı dorkları oluşturuldu",
      description: `${newDorks.length} veritabanı ile ilgili dork oluşturuldu`,
    })
  }

  const generateFileDorks = () => {
    if (!site) {
      toast({
        title: "Site gerekli",
        description: "Lütfen dork oluşturmak için bir hedef site girin",
        variant: "destructive",
      })
      return
    }

    if (selectedFileTypes.length === 0) {
      toast({
        title: "Dosya türü gerekli",
        description: "Lütfen en az bir dosya türü seçin",
        variant: "destructive",
      })
      return
    }

    const newDorks: string[] = []

    // Her seçili dosya türü için temel dorklar
    selectedFileTypes.forEach((fileType) => {
      newDorks.push(`site:${site} filetype:${fileType}`)

      if (fileKeywords) {
        newDorks.push(`site:${site} filetype:${fileType} intext:"${fileKeywords}"`)
      }

      if (yearFilter) {
        newDorks.push(`site:${site} filetype:${fileType} intext:"${yearFilter}"`)
      }

      if (fileKeywords && yearFilter) {
        newDorks.push(`site:${site} filetype:${fileType} intext:"${fileKeywords}" intext:"${yearFilter}"`)
      }
    })

    // Dosya türlerine göre özel dorklar
    if (selectedFileTypes.some((type) => ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(type))) {
      newDorks.push(
        `site:${site} (filetype:doc OR filetype:docx OR filetype:xls OR filetype:xlsx OR filetype:ppt OR filetype:pptx) intext:"gizli"`,
      )
      newDorks.push(
        `site:${site} (filetype:doc OR filetype:docx OR filetype:xls OR filetype:xlsx OR filetype:ppt OR filetype:pptx) intext:"özel"`,
      )
      newDorks.push(
        `site:${site} (filetype:doc OR filetype:docx OR filetype:xls OR filetype:xlsx OR filetype:ppt OR filetype:pptx) intext:"rapor"`,
      )
    }

    if (selectedFileTypes.some((type) => ["jpg", "jpeg", "png", "gif"].includes(type))) {
      newDorks.push(`site:${site} (filetype:jpg OR filetype:jpeg OR filetype:png OR filetype:gif) inurl:resim`)
      newDorks.push(`site:${site} (filetype:jpg OR filetype:jpeg OR filetype:png OR filetype:gif) inurl:gorsel`)
    }

    if (selectedFileTypes.includes("pdf")) {
      newDorks.push(`site:${site} filetype:pdf inurl:rapor`)
      newDorks.push(`site:${site} filetype:pdf inurl:belge`)
      newDorks.push(`site:${site} filetype:pdf inurl:dokuman`)
    }

    setDorks(newDorks)

    toast({
      title: "Dosya dorkları oluşturuldu",
      description: `${newDorks.length} dosya arama dorku oluşturuldu`,
    })
  }

  const toggleFileType = (fileType: string) => {
    setSelectedFileTypes((current) =>
      current.includes(fileType) ? current.filter((type) => type !== fileType) : [...current, fileType],
    )
  }

  const selectFileTypeGroup = (group: string) => {
    const groupTypes = fileTypeGroups[group as keyof typeof fileTypeGroups]
    setSelectedFileTypes((current) => {
      const newTypes = [...current]
      groupTypes.forEach((type) => {
        if (!newTypes.includes(type)) {
          newTypes.push(type)
        }
      })
      return newTypes
    })
  }

  const unselectFileTypeGroup = (group: string) => {
    const groupTypes = fileTypeGroups[group as keyof typeof fileTypeGroups]
    setSelectedFileTypes((current) => current.filter((type) => !groupTypes.includes(type)))
  }

  const addCustomDork = () => {
    if (!customDork) return

    setCustomDorks([...customDorks, customDork])
    setCustomDork("")

    toast({
      title: "Özel dork eklendi",
      description: "Özel dorkunuz listeye eklendi",
    })
  }

  const removeCustomDork = (index: number) => {
    const newCustomDorks = [...customDorks]
    newCustomDorks.splice(index, 1)
    setCustomDorks(newCustomDorks)

    toast({
      title: "Özel dork kaldırıldı",
      description: "Özel dork listeden kaldırıldı",
    })
  }

  const copyDork = (dork: string) => {
    navigator.clipboard.writeText(dork)

    toast({
      title: "Panoya kopyalandı",
      description: "Dork panoya kopyalandı",
    })
  }

  const exportDorks = () => {
    const allDorks = [...dorks, ...customDorks]
    if (allDorks.length === 0) {
      toast({
        title: "Dışa aktarılacak dork yok",
        description: "Dışa aktarmadan önce bazı dorklar oluşturun",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([allDorks.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dorklar.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Dorklar dışa aktarıldı",
      description: `${allDorks.length} dork dorklar.txt dosyasına aktarıldı`,
    })
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ayzio Technology Dork Tarama Uygulaması</h1>
          <p className="text-muted-foreground">
            Yusuf için özel olarak hazırlanmış güvenlik araştırması ve bilgi toplama için özelleştirilmiş arama
            sorguları oluşturun
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/scraper">
              <Search className="mr-2 h-4 w-4" />
              Web Kazıma
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

      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>                                                      Hedef Site</CardTitle>
              <CardDescription>Hedeflemek istediğiniz alan adını girin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site">Alan Adı</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Input id="site" placeholder="ornek.com" value={site} onChange={(e) => setSite(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="files">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="database">Veritabanı</TabsTrigger>
              <TabsTrigger value="files">Dosyalar</TabsTrigger>
              <TabsTrigger value="credentials">Kimlik Bilgileri</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Dork Parametreleri</CardTitle>
                  <CardDescription>Genel dork oluşturma için parametreleri yapılandırın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileType">Dosya Türü</Label>
                    <Select value={fileType} onValueChange={setFileType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dosya türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Herhangi</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="doc">DOC</SelectItem>
                        <SelectItem value="xls">XLS</SelectItem>
                        <SelectItem value="ppt">PPT</SelectItem>
                        <SelectItem value="txt">TXT</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="asp">ASP</SelectItem>
                        <SelectItem value="jsp">JSP</SelectItem>
                        <SelectItem value="cfg">CFG</SelectItem>
                        <SelectItem value="log">LOG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inUrl">URL İçinde</Label>
                    <Input
                      id="inUrl"
                      placeholder="admin, giris, portal, vb."
                      value={inUrl}
                      onChange={(e) => setInUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inTitle">Başlık İçinde</Label>
                    <Input
                      id="inTitle"
                      placeholder="admin, panel, vb."
                      value={inTitle}
                      onChange={(e) => setInTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inText">Metin İçinde</Label>
                    <Input
                      id="inText"
                      placeholder="şifre, kullanıcı adı, vb."
                      value={inText}
                      onChange={(e) => setInText(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={generateGeneralDorks} className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Genel Dorkları Oluştur
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Veritabanı Dork Parametreleri</CardTitle>
                  <CardDescription>Veritabanı keşfi için parametreleri yapılandırın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbType">Veritabanı Türü</Label>
                    <Select value={dbType} onValueChange={setDbType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Veritabanı türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="includeErrors" checked={includeErrors} onCheckedChange={setIncludeErrors} />
                    <Label htmlFor="includeErrors">Hata mesajlarını dahil et</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="includeBackups" checked={includeBackups} onCheckedChange={setIncludeBackups} />
                    <Label htmlFor="includeBackups">Yedek dosyalarını dahil et</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="includeConfigs" checked={includeConfigs} onCheckedChange={setIncludeConfigs} />
                    <Label htmlFor="includeConfigs">Yapılandırma dosyalarını dahil et</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={generateDatabaseDorks} className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    Veritabanı Dorklarını Oluştur
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Dosya Arama Parametreleri</CardTitle>
                  <CardDescription>
                    Tüm dosya türlerini (PDF, Word, Excel, JPG, PNG vb.) bulmak için parametreleri yapılandırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileKeywords">Dosya Anahtar Kelimeleri</Label>
                    <Input
                      id="fileKeywords"
                      placeholder="rapor, belge, gizli, vb."
                      value={fileKeywords}
                      onChange={(e) => setFileKeywords(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearFilter">Yıl Filtresi</Label>
                    <Input
                      id="yearFilter"
                      placeholder="2023, 2022, vb."
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Dosya Türleri</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {Object.entries(fileTypeGroups).map(([group, types]) => (
                        <div key={group} className="border rounded-md p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{group}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => selectFileTypeGroup(group)}
                              >
                                Tümünü Seç
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => unselectFileTypeGroup(group)}
                              >
                                Temizle
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {types.map((type) => (
                              <Badge
                                key={type}
                                variant={selectedFileTypes.includes(type) ? "default" : "outline"}
                                className="cursor-pointer text-xs py-1"
                                onClick={() => toggleFileType(type)}
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                    <FileType className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Bu seçenek tüm dosya türlerini (PDF, Word, Excel, JPG, PNG vb.) bulmak için optimize edilmiştir.
                      Aradığınız dosya türlerini seçin.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={generateFileDorks} className="w-full">
                    <FileSearch className="mr-2 h-4 w-4" />
                    Dosya Dorklarını Oluştur
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <CardTitle>Kimlik Bilgileri Arama</CardTitle>
                  <CardDescription>
                    Kullanıcı adı, şifre, API anahtarı ve token gibi kimlik bilgilerini bulmak için dorklar oluşturun
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>Uyarı:</strong> Bu özellik, yalnızca yasal güvenlik testleri ve kendi sistemleriniz için
                      kullanılmalıdır. Başkalarının kimlik bilgilerini izinsiz aramak ve kullanmak yasalara aykırıdır.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Aranacak Kimlik Bilgisi Türleri</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm font-medium mb-2">Kullanıcı Kimlik Bilgileri</h4>
                        <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                          <li>Kullanıcı adı ve şifre kombinasyonları</li>
                          <li>Giriş formları ve sayfaları</li>
                          <li>Kimlik doğrulama yapılandırmaları</li>
                        </ul>
                      </div>
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm font-medium mb-2">API ve Servis Anahtarları</h4>
                        <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                          <li>API anahtarları ve tokenlar</li>
                          <li>Servis kimlik bilgileri</li>
                          <li>OAuth yapılandırmaları</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialKeywords">Özel Anahtar Kelimeler</Label>
                    <Input
                      id="credentialKeywords"
                      placeholder="username, password, api_key, token, vb."
                      defaultValue="username password login api_key token secret"
                    />
                    <p className="text-xs text-muted-foreground">
                      Virgülle ayırarak özel anahtar kelimeler ekleyebilirsiniz
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => {
                      if (!site) {
                        toast({
                          title: "Site gerekli",
                          description: "Lütfen dork oluşturmak için bir hedef site girin",
                          variant: "destructive",
                        })
                        return
                      }

                      const newDorks = [
                        `site:${site} intext:"username" AND intext:"password"`,
                        `site:${site} intext:"kullanıcı adı" AND intext:"şifre"`,
                        `site:${site} intext:"login" filetype:php OR filetype:html OR filetype:js`,
                        `site:${site} intext:"giriş" filetype:php OR filetype:html OR filetype:js`,
                        `site:${site} intext:"api_key" OR intext:"apikey" OR intext:"api key"`,
                        `site:${site} intext:"token" filetype:js OR filetype:json OR filetype:config`,
                        `site:${site} intext:"secret" OR intext:"password" filetype:env OR filetype:yml`,
                        `site:${site} intext:"authentication" filetype:xml OR filetype:json`,
                        `site:${site} intext:"kimlik doğrulama" OR intext:"yetkilendirme"`,
                        `site:${site} intext:"config" AND (intext:"password" OR intext:"username")`,
                      ]

                      setDorks(newDorks)

                      toast({
                        title: "Kimlik bilgisi dorkları oluşturuldu",
                        description: `${newDorks.length} kimlik bilgisi arama dorku oluşturuldu`,
                      })
                    }}
                    className="w-full"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Kimlik Bilgisi Dorklarını Oluştur
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Özel Dorklar</CardTitle>
              <CardDescription>Kendi özel dork sorgularınızı ekleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Özel dork sorgusu girin"
                  value={customDork}
                  onChange={(e) => setCustomDork(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addCustomDork()
                    }
                  }}
                />
                <Button variant="outline" size="icon" onClick={addCustomDork}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {customDorks.length > 0 && (
                <div className="space-y-2 mt-4">
                  {customDorks.map((dork, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span className="text-sm truncate mr-2">{dork}</span>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => copyDork(dork)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeCustomDork(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="max-h-[400px] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Oluşturulan Dorklar</CardTitle>
                  <CardDescription>
                    {dorks.length + customDorks.length > 0
                      ? `${dorks.length + customDorks.length} dork oluşturuldu`
                      : "Henüz dork oluşturulmadı"}
                  </CardDescription>
                </div>
                {(dorks.length > 0 || customDorks.length > 0) && (
                  <Button variant="outline" size="sm" onClick={exportDorks}>
                    <Download className="mr-2 h-4 w-4" />
                    Dışa Aktar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {dorks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Oluşturulan Dorklar</h3>
                  <div className="space-y-2">
                    {dorks.map((dork, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                        <span className="text-xs font-mono overflow-hidden text-ellipsis">{dork}</span>
                        <div className="flex items-center space-x-1 ml-2 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyDork(dork)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-0"
                            onClick={() =>
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, "_blank")
                            }
                          >
                            <Search className="h-3 w-3 mr-1" />
                            Ara
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dorks.length > 0 && customDorks.length > 0 && <Separator className="my-4" />}

              {customDorks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Özel Dorklar</h3>
                  <div className="space-y-2">
                    {customDorks.map((dork, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                        <span className="text-xs font-mono overflow-hidden text-ellipsis">{dork}</span>
                        <div className="flex items-center space-x-1 ml-2 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyDork(dork)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-0"
                            onClick={() =>
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, "_blank")
                            }
                          >
                            <Search className="h-3 w-3 mr-1" />
                            Ara
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dorks.length === 0 && customDorks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[120px] text-center">
                  <FileSearch className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Dork Oluşturulmadı</h3>
                  <p className="text-muted-foreground max-w-md text-sm">
                    Dork oluşturmak için bir hedef site girin ve parametreleri yapılandırın veya manuel olarak özel
                    dorklar ekleyin.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Ayzio Dork Tarama Sistemi Kullanımı
              </CardTitle>
              <CardDescription>
                Bu araç, hedef sitedeki tüm dosya türlerini (PDF, Word, Excel, JPG, PNG vb.) keşfetmenize yardımcı olur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                    <File className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-300">Ofis Belgeleri</p>
                      <p className="text-muted-foreground text-xs">
                        Word, Excel, PowerPoint dosyaları genellikle önemli iş belgeleri içerir
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-md flex items-start">
                    <Image className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-300">Görsel Dosyalar</p>
                      <p className="text-muted-foreground text-xs">
                        JPG, PNG, GIF dosyaları şemalar, planlar ve diğer görsel bilgiler içerebilir
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Nasıl Kullanılır:</p>
                  <ol className="text-blue-700 dark:text-blue-300 text-xs mt-2 space-y-1 list-decimal pl-4">
                    <li>Hedef siteyi girin</li>
                    <li>"Dosyalar" sekmesinde aradığınız dosya türlerini seçin</li>
                    <li>İsteğe bağlı olarak anahtar kelimeler ve yıl filtresi ekleyin</li>
                    <li>"Dosya Dorklarını Oluştur" butonuna tıklayın</li>
                    <li>Oluşturulan dorkları Google'da aramak için "Ara" butonunu kullanın</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="help">
              <AccordionTrigger>Dork Operatör Referansı</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium">site:</h4>
                    <p className="text-muted-foreground">Sonuçları belirli bir alan adı veya web sitesiyle sınırlar.</p>
                    <p className="font-mono text-xs mt-1">Örnek: site:ornek.com</p>
                  </div>

                  <div>
                    <h4 className="font-medium">inurl:</h4>
                    <p className="text-muted-foreground">URL'de belirli metni içeren sayfaları arar.</p>
                    <p className="font-mono text-xs mt-1">Örnek: inurl:admin</p>
                  </div>

                  <div>
                    <h4 className="font-medium">intitle:</h4>
                    <p className="text-muted-foreground">Başlıkta belirli metni içeren sayfaları arar.</p>
                    <p className="font-mono text-xs mt-1">Örnek: intitle:"index of"</p>
                  </div>

                  <div>
                    <h4 className="font-medium">intext:</h4>
                    <p className="text-muted-foreground">İçeriğinde belirli metni içeren sayfaları arar.</p>
                    <p className="font-mono text-xs mt-1">Örnek: intext:"şifre"</p>
                  </div>

                  <div>
                    <h4 className="font-medium">filetype:</h4>
                    <p className="text-muted-foreground">Belirli dosya türlerini arar.</p>
                    <p className="font-mono text-xs mt-1">Örnek: filetype:pdf</p>
                  </div>

                  <div>
                    <h4 className="font-medium">Operatörleri Birleştirme</h4>
                    <p className="text-muted-foreground">
                      Daha spesifik aramalar için birden fazla operatörü birleştirebilirsiniz.
                    </p>
                    <p className="font-mono text-xs mt-1">Örnek: site:ornek.com filetype:pdf intext:"gizli"</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="disclaimer">
              <AccordionTrigger>Yasal Uyarı</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>Bu araç yalnızca eğitim ve meşru güvenlik araştırması amaçları için sağlanmıştır.</p>
                  <p>
                    Bu aracı yalnızca sahip olduğunuz veya test etmek için açık izniniz olan web sitelerinde kullanın.
                  </p>
                  <p>
                    Bilgisayar sistemlerine ve verilere yetkisiz erişim yasadışıdır ve hukuki ve cezai yaptırımlara
                    neden olabilir.
                  </p>
                  <p>
                    Bu aracın yaratıcısı, bu aracın yanlış kullanımından veya neden olduğu hasardan sorumlu değildir.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

