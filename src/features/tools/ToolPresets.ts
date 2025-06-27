import { generateId } from '@/lib/utils'
import { useEditorStore, PresetState } from '@/store/editorStore'

export interface PresetCategory {
  id: string
  name: string
  description: string
  presets: PresetState[]
}

export interface PresetData {
  textSettings?: any
  canvasSettings?: any
  filters?: any
  objects?: any[]
}

class ToolPresetsClass {
  private presetCategories: Map<string, PresetCategory> = new Map()

  // Initialize with default presets
  constructor() {
    this.initializeDefaultPresets()
  }

  private initializeDefaultPresets() {
    // Text Presets
    const textPresets: PresetState[] = [
      {
        id: generateId(),
        name: 'Headline Bold',
        settings: {
          textSettings: {
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#1a1a1a',
            textAlign: 'center',
            stroke: '',
            strokeWidth: 0
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Subtitle Light',
        settings: {
          textSettings: {
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 'normal',
            fill: '#666666',
            textAlign: 'center',
            stroke: '',
            strokeWidth: 0
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Myanmar Title',
        settings: {
          textSettings: {
            fontFamily: 'Pyidaungsu',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#2563eb',
            textAlign: 'center',
            stroke: '#ffffff',
            strokeWidth: 1
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Outlined Text',
        settings: {
          textSettings: {
            fontFamily: 'Montserrat',
            fontSize: 42,
            fontWeight: 'bold',
            fill: '#ffffff',
            textAlign: 'center',
            stroke: '#000000',
            strokeWidth: 3
          }
        },
        createdAt: Date.now()
      }
    ]

    // Canvas Presets
    const canvasPresets: PresetState[] = [
      {
        id: generateId(),
        name: 'Instagram Post',
        settings: {
          canvasSettings: {
            width: 1080,
            height: 1080,
            backgroundColor: '#ffffff',
            fitMode: 'fill'
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Instagram Story',
        settings: {
          canvasSettings: {
            width: 1080,
            height: 1920,
            backgroundColor: '#000000',
            fitMode: 'fit'
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Facebook Cover',
        settings: {
          canvasSettings: {
            width: 1200,
            height: 630,
            backgroundColor: '#f8f9fa',
            fitMode: 'fill'
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'YouTube Thumbnail',
        settings: {
          canvasSettings: {
            width: 1280,
            height: 720,
            backgroundColor: '#ff0000',
            fitMode: 'fill'
          }
        },
        createdAt: Date.now()
      }
    ]

    // Brand Presets
    const brandPresets: PresetState[] = [
      {
        id: generateId(),
        name: 'Modern Blue',
        settings: {
          textSettings: {
            fontFamily: 'Inter',
            fontSize: 32,
            fontWeight: '600',
            fill: '#2563eb',
            textAlign: 'left'
          },
          canvasSettings: {
            backgroundColor: '#f1f5f9'
          }
        },
        createdAt: Date.now()
      },
      {
        id: generateId(),
        name: 'Elegant Gold',
        settings: {
          textSettings: {
            fontFamily: 'Georgia',
            fontSize: 36,
            fontWeight: 'normal',
            fill: '#d4af37',
            textAlign: 'center',
            stroke: '#1a1a1a',
            strokeWidth: 0.5
          },
          canvasSettings: {
            backgroundColor: '#1a1a1a'
          }
        },
        createdAt: Date.now()
      }
    ]

    // Register categories
    this.registerCategory({
      id: 'text',
      name: 'Text Styles',
      description: 'Pre-configured text styling presets',
      presets: textPresets
    })

    this.registerCategory({
      id: 'canvas',
      name: 'Canvas Sizes',
      description: 'Standard canvas dimensions for social media',
      presets: canvasPresets
    })

    this.registerCategory({
      id: 'brand',
      name: 'Brand Themes',
      description: 'Complete brand styling presets',
      presets: brandPresets
    })
  }

  registerCategory(category: PresetCategory) {
    this.presetCategories.set(category.id, category)
  }

  getCategory(categoryId: string): PresetCategory | undefined {
    return this.presetCategories.get(categoryId)
  }

  getAllCategories(): PresetCategory[] {
    return Array.from(this.presetCategories.values())
  }

  getPreset(categoryId: string, presetId: string): PresetState | undefined {
    const category = this.presetCategories.get(categoryId)
    return category?.presets.find(p => p.id === presetId)
  }

  addPreset(categoryId: string, preset: Omit<PresetState, 'id' | 'createdAt'>) {
    const category = this.presetCategories.get(categoryId)
    if (!category) return

    const newPreset: PresetState = {
      ...preset,
      id: generateId(),
      createdAt: Date.now()
    }

    category.presets.push(newPreset)
  }

  removePreset(categoryId: string, presetId: string) {
    const category = this.presetCategories.get(categoryId)
    if (!category) return

    category.presets = category.presets.filter(p => p.id !== presetId)
  }

  applyPreset(categoryId: string, presetId: string) {
    const preset = this.getPreset(categoryId, presetId)
    if (!preset) return

    const store = useEditorStore.getState()

    // Apply text settings if present
    if (preset.settings.textSettings) {
      store.updateTextSettings(preset.settings.textSettings)
    }

    // Apply canvas settings if present
    if (preset.settings.canvasSettings) {
      store.updateCanvasSettings(preset.settings.canvasSettings)
    }

    // Apply filters if present
    if (preset.settings.filters && store.activeObject) {
      // Apply filters to active object
      // Implementation depends on filter system
    }

    // Add objects if present
    if (preset.settings.objects && store.canvas) {
      preset.settings.objects.forEach((objData: any) => {
        // Create and add objects to canvas
        // Implementation depends on object type
      })
    }

    return preset
  }

  exportPreset(categoryId: string, presetId: string): string | null {
    const preset = this.getPreset(categoryId, presetId)
    if (!preset) return null

    return JSON.stringify({
      category: categoryId,
      preset: preset,
      exportedAt: Date.now(),
      version: '1.0'
    }, null, 2)
  }

  importPreset(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      
      if (!parsed.category || !parsed.preset) {
        throw new Error('Invalid preset format')
      }

      this.addPreset(parsed.category, {
        name: parsed.preset.name + ' (Imported)',
        settings: parsed.preset.settings
      })

      return true
    } catch (error) {
      console.error('Failed to import preset:', error)
      return false
    }
  }

  searchPresets(query: string): Array<{ category: string; preset: PresetState }> {
    const results: Array<{ category: string; preset: PresetState }> = []
    
    for (const [categoryId, category] of this.presetCategories) {
      for (const preset of category.presets) {
        if (
          preset.name.toLowerCase().includes(query.toLowerCase()) ||
          category.name.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({ category: categoryId, preset })
        }
      }
    }

    return results
  }

  // Generate thumbnail for preset (placeholder implementation)
  generateThumbnail(preset: PresetState): Promise<string> {
    return new Promise((resolve) => {
      // In a real implementation, this would create a small canvas
      // apply the preset settings, and generate a thumbnail image
      
      // For now, return a placeholder
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 60
      const ctx = canvas.getContext('2d')!
      
      // Draw preview based on preset settings
      if (preset.settings.canvasSettings?.backgroundColor) {
        ctx.fillStyle = preset.settings.canvasSettings.backgroundColor
        ctx.fillRect(0, 0, 100, 60)
      }
      
      if (preset.settings.textSettings) {
        ctx.fillStyle = preset.settings.textSettings.fill || '#000000'
        ctx.font = `${Math.min(preset.settings.textSettings.fontSize / 2, 12)}px ${preset.settings.textSettings.fontFamily || 'Arial'}`
        ctx.textAlign = 'center'
        ctx.fillText('Aa', 50, 35)
      }
      
      resolve(canvas.toDataURL())
    })
  }
}

export const ToolPresets = new ToolPresetsClass()

// React hook for easier usage in components
export const usePresets = () => {
  return {
    getAllCategories: () => ToolPresets.getAllCategories(),
    getCategory: (id: string) => ToolPresets.getCategory(id),
    applyPreset: (categoryId: string, presetId: string) => ToolPresets.applyPreset(categoryId, presetId),
    addPreset: (categoryId: string, preset: Omit<PresetState, 'id' | 'createdAt'>) => 
      ToolPresets.addPreset(categoryId, preset),
    removePreset: (categoryId: string, presetId: string) => 
      ToolPresets.removePreset(categoryId, presetId),
    searchPresets: (query: string) => ToolPresets.searchPresets(query),
    exportPreset: (categoryId: string, presetId: string) => 
      ToolPresets.exportPreset(categoryId, presetId),
    importPreset: (data: string) => ToolPresets.importPreset(data),
    generateThumbnail: (preset: PresetState) => ToolPresets.generateThumbnail(preset)
  }
}