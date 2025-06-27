import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/editorStore'
import { useToast } from '@/hooks/use-toast'
import { Download, Settings, Image, FileImage, Palette } from 'lucide-react'
import { downloadFile } from '@/lib/utils'

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg'
  quality: number
  scale: number
  backgroundColor: string
  transparent: boolean
}

export const ExportPanel: React.FC = () => {
  const { exportCanvas, canvas, isDirty, saveToLocalStorage } = useEditorStore()
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 0.9,
    scale: 1,
    backgroundColor: '#ffffff',
    transparent: false
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleExport = async () => {
    if (!canvas) {
      toast({
        title: "Export Failed",
        description: "No canvas found to export",
        variant: "destructive"
      })
      return
    }

    setIsExporting(true)

    try {
      // Store original canvas background
      const originalBackground = canvas.backgroundColor

      // Apply export settings
      if (!settings.transparent && settings.format !== 'svg') {
        canvas.backgroundColor = settings.backgroundColor
      } else if (settings.transparent) {
        canvas.backgroundColor = 'transparent'
      }

      let dataUrl: string | null = null

      if (settings.format === 'svg') {
        dataUrl = canvas.toSVG()
        // For SVG, we need to create a blob URL
        const blob = new Blob([dataUrl], { type: 'image/svg+xml' })
        dataUrl = URL.createObjectURL(blob)
      } else {
        // Scale canvas if needed
        if (settings.scale !== 1) {
          const originalWidth = canvas.width!
          const originalHeight = canvas.height!
          
          canvas.setDimensions({
            width: originalWidth * settings.scale,
            height: originalHeight * settings.scale
          })
          
          canvas.setZoom(settings.scale)
          canvas.renderAll()
        }

        const mimeType = settings.format === 'png' ? 'image/png' : 'image/jpeg'
        dataUrl = canvas.toDataURL(mimeType, settings.quality)

        // Restore original dimensions if scaled
        if (settings.scale !== 1) {
          const originalWidth = canvas.width! / settings.scale
          const originalHeight = canvas.height! / settings.scale
          
          canvas.setDimensions({
            width: originalWidth,
            height: originalHeight
          })
          
          canvas.setZoom(1)
          canvas.renderAll()
        }
      }

      // Restore original background
      canvas.backgroundColor = originalBackground
      canvas.renderAll()

      if (dataUrl) {
        const filename = `image-editor-export.${settings.format}`
        downloadFile(dataUrl, filename)
        
        toast({
          title: "Export Successful",
          description: `Image exported as ${filename}`,
        })
      }

    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the image",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveProject = () => {
    saveToLocalStorage()
    toast({
      title: "Project Saved",
      description: "Your project has been saved to local storage",
    })
  }

  const exportPresets = [
    {
      name: 'Instagram Post',
      settings: { format: 'jpg' as const, quality: 0.9, scale: 1, backgroundColor: '#ffffff', transparent: false }
    },
    {
      name: 'Web PNG',
      settings: { format: 'png' as const, quality: 1, scale: 1, backgroundColor: '#ffffff', transparent: true }
    },
    {
      name: 'Print Quality',
      settings: { format: 'png' as const, quality: 1, scale: 2, backgroundColor: '#ffffff', transparent: false }
    },
    {
      name: 'Vector SVG',
      settings: { format: 'svg' as const, quality: 1, scale: 1, backgroundColor: '#ffffff', transparent: true }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Export Buttons */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Quick Export</h3>
        
        <div className="grid grid-cols-2 gap-2">
          {exportPresets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => {
                setSettings(preset.settings)
                handleExport()
              }}
              disabled={isExporting}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full"
        size="lg"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export {settings.format.toUpperCase()}
          </>
        )}
      </Button>

      {/* Export Settings Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowSettings(!showSettings)}
        className="w-full"
      >
        <Settings className="w-4 h-4 mr-2" />
        {showSettings ? 'Hide' : 'Show'} Settings
      </Button>

      {/* Export Settings */}
      {showSettings && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpg', 'svg'] as const).map((format) => (
                <Button
                  key={format}
                  variant={settings.format === format ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, format })}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Quality (for JPG/PNG) */}
          {settings.format !== 'svg' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quality: {Math.round(settings.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.quality}
                onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          {/* Scale */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Scale: {settings.scale}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={settings.scale}
              onChange={(e) => setSettings({ ...settings, scale: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              Higher scale = larger file size and better quality
            </div>
          </div>

          {/* Background Color */}
          {settings.format !== 'svg' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Background</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="transparent"
                    checked={settings.transparent}
                    onChange={(e) => setSettings({ ...settings, transparent: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="transparent" className="text-sm">
                    Transparent background
                  </label>
                </div>
                
                {!settings.transparent && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Project */}
      <div className="border-t pt-4">
        <Button
          variant="outline"
          onClick={handleSaveProject}
          className="w-full"
        >
          <FileImage className="w-4 h-4 mr-2" />
          Save Project
          {isDirty && <span className="ml-1 text-orange-500">*</span>}
        </Button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Save your work to continue editing later
        </p>
      </div>

      {/* Batch Export (Future Feature) */}
      <div className="border-t pt-4 opacity-50">
        <Button
          variant="outline"
          className="w-full"
          disabled
        >
          <Palette className="w-4 h-4 mr-2" />
          Batch Export (Coming Soon)
        </Button>
      </div>
    </div>
  )
}