import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { fabric } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Download } from 'lucide-react'

interface FontOption {
  name: string
  family: string
  url?: string
}

const MYANMAR_FONTS: FontOption[] = [
  { name: 'Pyidaungsu', family: 'Pyidaungsu', url: 'https://fonts.googleapis.com/css2?family=Pyidaungsu:wght@400;700&display=swap' },
  { name: 'Myanmar3', family: 'Myanmar3', url: '/fonts/myanmar3.woff2' },
  { name: 'Noto Sans Myanmar', family: 'Noto Sans Myanmar', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;700&display=swap' }
]

const GOOGLE_FONTS: FontOption[] = [
  { name: 'Inter', family: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { name: 'Roboto', family: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { name: 'Open Sans', family: 'Open Sans', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' },
  { name: 'Lato', family: 'Lato', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { name: 'Montserrat', family: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap' },
  { name: 'Poppins', family: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' }
]

const DEFAULT_FONTS: FontOption[] = [
  { name: 'Arial', family: 'Arial' },
  { name: 'Times New Roman', family: 'Times New Roman' },
  { name: 'Courier New', family: 'Courier New' },
  { name: 'Georgia', family: 'Georgia' }
]

export const TextTool: React.FC = () => {
  const { 
    canvas, 
    activeObject, 
    textSettings, 
    updateTextSettings, 
    saveToHistory 
  } = useEditorStore()

  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const [customFontFile, setCustomFontFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [isSubtitle, setIsSubtitle] = useState(false)

  // Load fonts on component mount
  useEffect(() => {
    loadWebFonts()
  }, [])

  // Update text content when active object changes
  useEffect(() => {
    if (activeObject && activeObject.type === 'i-text') {
      const textObj = activeObject as fabric.IText
      setTextContent(textObj.text || '')
      setIsSubtitle(textObj.name === 'subtitle')
    }
  }, [activeObject])

  const loadWebFonts = async () => {
    const allFonts = [...MYANMAR_FONTS, ...GOOGLE_FONTS]
    
    for (const font of allFonts) {
      if (font.url && !loadedFonts.has(font.family)) {
        try {
          await loadFont(font)
          setLoadedFonts(prev => new Set([...prev, font.family]))
        } catch (error) {
          console.warn(`Failed to load font: ${font.name}`, error)
        }
      }
    }
  }

  const loadFont = (font: FontOption): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (font.url?.startsWith('http')) {
        // Load Google Font
        const link = document.createElement('link')
        link.href = font.url
        link.rel = 'stylesheet'
        link.onload = () => resolve()
        link.onerror = () => reject()
        document.head.appendChild(link)
      } else if (font.url) {
        // Load local font file
        const fontFace = new FontFace(font.family, `url(${font.url})`)
        fontFace.load().then((loadedFace) => {
          document.fonts.add(loadedFace)
          resolve()
        }).catch(reject)
      } else {
        resolve() // Default system font
      }
    })
  }

  const handleCustomFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCustomFontFile(file)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const fontFamily = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      const fontFace = new FontFace(fontFamily, arrayBuffer)
      
      await fontFace.load()
      document.fonts.add(fontFace)
      
      setLoadedFonts(prev => new Set([...prev, fontFamily]))
      updateTextSettings({ fontFamily })
    } catch (error) {
      console.error('Failed to load custom font:', error)
    }
  }

  const addText = () => {
    if (!canvas) return

    const text = new fabric.IText('Click to edit text', {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: textSettings.fontFamily,
      fontSize: textSettings.fontSize,
      fill: textSettings.fill,
      fontWeight: textSettings.fontWeight,
      textAlign: textSettings.textAlign,
      stroke: textSettings.stroke,
      strokeWidth: textSettings.strokeWidth,
      shadow: textSettings.shadow,
      backgroundColor: textSettings.backgroundColor,
      name: isSubtitle ? 'subtitle' : 'text'
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    text.enterEditing()
    canvas.renderAll()
    saveToHistory('Add text')
  }

  const updateActiveText = (property: string, value: any) => {
    if (!canvas || !activeObject || activeObject.type !== 'i-text') return

    const textObj = activeObject as fabric.IText
    textObj.set(property, value)
    canvas.renderAll()
    saveToHistory(`Update text ${property}`)
  }

  const handleTextChange = (newText: string) => {
    setTextContent(newText)
    updateActiveText('text', newText)
  }

  const toggleBold = () => {
    const newWeight = textSettings.fontWeight === 'bold' ? 'normal' : 'bold'
    updateTextSettings({ fontWeight: newWeight })
    updateActiveText('fontWeight', newWeight)
  }

  const setTextAlign = (align: string) => {
    updateTextSettings({ textAlign: align })
    updateActiveText('textAlign', align)
  }

  const handleFontSizeChange = (size: number[]) => {
    const fontSize = size[0]
    updateTextSettings({ fontSize })
    updateActiveText('fontSize', fontSize)
  }

  const handleColorChange = (color: string) => {
    updateTextSettings({ fill: color })
    updateActiveText('fill', color)
  }

  const handleStrokeChange = (stroke: string) => {
    updateTextSettings({ stroke })
    updateActiveText('stroke', stroke)
  }

  const handleStrokeWidthChange = (width: number[]) => {
    const strokeWidth = width[0]
    updateTextSettings({ strokeWidth })
    updateActiveText('strokeWidth', strokeWidth)
  }

  const handleFontChange = (fontFamily: string) => {
    updateTextSettings({ fontFamily })
    updateActiveText('fontFamily', fontFamily)
  }

  const addShadow = () => {
    const shadow = new fabric.Shadow({
      color: 'rgba(0,0,0,0.5)',
      blur: 5,
      offsetX: 2,
      offsetY: 2
    })
    
    updateTextSettings({ shadow })
    updateActiveText('shadow', shadow)
  }

  const removeShadow = () => {
    updateTextSettings({ shadow: null })
    updateActiveText('shadow', null)
  }

  const allFonts = [...DEFAULT_FONTS, ...MYANMAR_FONTS, ...GOOGLE_FONTS]

  return (
    <div className="space-y-6">
      {/* Add Text Button */}
      <div className="flex gap-2">
        <Button 
          onClick={addText} 
          className="flex-1"
          variant={isSubtitle ? "outline" : "default"}
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text
        </Button>
        <Button 
          onClick={() => {
            setIsSubtitle(!isSubtitle)
            addText()
          }}
          variant={isSubtitle ? "default" : "outline"}
        >
          Add Subtitle
        </Button>
      </div>

      {/* Text Content Editor */}
      {activeObject?.type === 'i-text' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Text Content</label>
            <Input
              value={textContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text"
            />
          </div>
        </div>
      )}

      {/* Font Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Font Family</label>
        <select
          value={textSettings.fontFamily}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full p-2 border rounded-md bg-background"
        >
          <optgroup label="Default Fonts">
            {DEFAULT_FONTS.map(font => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Myanmar Fonts">
            {MYANMAR_FONTS.map(font => (
              <option key={font.family} value={font.family}>
                {font.name} {loadedFonts.has(font.family) ? '✓' : '⏳'}
              </option>
            ))}
          </optgroup>
          <optgroup label="Google Fonts">
            {GOOGLE_FONTS.map(font => (
              <option key={font.family} value={font.family}>
                {font.name} {loadedFonts.has(font.family) ? '✓' : '⏳'}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Custom Font Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Upload Custom Font</label>
        <input
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleCustomFontUpload}
          className="w-full p-2 border rounded-md"
        />
        {customFontFile && (
          <p className="text-xs text-muted-foreground mt-1">
            Loaded: {customFontFile.name}
          </p>
        )}
      </div>

      {/* Font Size */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Font Size: {textSettings.fontSize}px
        </label>
        <Slider
          value={[textSettings.fontSize]}
          onValueChange={handleFontSizeChange}
          min={8}
          max={200}
          step={1}
          className="w-full"
        />
      </div>

      {/* Text Formatting */}
      <div className="space-y-3">
        <label className="text-sm font-medium block">Formatting</label>
        
        {/* Bold and Alignment */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={textSettings.fontWeight === 'bold' ? 'default' : 'outline'}
            onClick={toggleBold}
          >
            <Bold className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant={textSettings.textAlign === 'left' ? 'default' : 'outline'}
            onClick={() => setTextAlign('left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant={textSettings.textAlign === 'center' ? 'default' : 'outline'}
            onClick={() => setTextAlign('center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant={textSettings.textAlign === 'right' ? 'default' : 'outline'}
            onClick={() => setTextAlign('right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="text-sm font-medium mb-2 block">Text Color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={textSettings.fill}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-10 h-10 rounded border cursor-pointer"
          />
          <Input
            value={textSettings.fill}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      {/* Stroke/Outline */}
      <div>
        <label className="text-sm font-medium mb-2 block">Outline</label>
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={textSettings.stroke || '#000000'}
              onChange={(e) => handleStrokeChange(e.target.value)}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={textSettings.stroke || ''}
              onChange={(e) => handleStrokeChange(e.target.value)}
              placeholder="Outline color"
              className="flex-1"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Outline Width: {textSettings.strokeWidth}px
            </label>
            <Slider
              value={[textSettings.strokeWidth]}
              onValueChange={handleStrokeWidthChange}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label className="text-sm font-medium mb-2 block">Text Shadow</label>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={addShadow}
            variant={textSettings.shadow ? 'default' : 'outline'}
          >
            Add Shadow
          </Button>
          <Button
            size="sm"
            onClick={removeShadow}
            variant="outline"
            disabled={!textSettings.shadow}
          >
            Remove Shadow
          </Button>
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="text-sm font-medium mb-2 block">Background Color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={textSettings.backgroundColor || '#ffffff'}
            onChange={(e) => updateTextSettings({ backgroundColor: e.target.value })}
            className="w-10 h-10 rounded border cursor-pointer"
          />
          <Input
            value={textSettings.backgroundColor || ''}
            onChange={(e) => updateTextSettings({ backgroundColor: e.target.value })}
            placeholder="Background color (optional)"
            className="flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateTextSettings({ backgroundColor: '' })}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}