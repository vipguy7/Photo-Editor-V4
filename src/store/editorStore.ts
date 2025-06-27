import { create } from 'zustand'
import { fabric } from 'fabric'
import { generateId } from '@/lib/utils'

export interface EditorState {
  canvas: fabric.Canvas | null
  activeObject: fabric.Object | null
  selectedTool: string
  isLoading: boolean
  history: HistoryState[]
  historyIndex: number
  presets: PresetState[]
  currentImage: string | null
  canvasSettings: CanvasSettings
  textSettings: TextSettings
  isDirty: boolean
}

export interface HistoryState {
  id: string
  action: string
  timestamp: number
  canvasState: string
}

export interface PresetState {
  id: string
  name: string
  settings: Record<string, any>
  thumbnail?: string
  createdAt: number
}

export interface CanvasSettings {
  width: number
  height: number
  backgroundColor: string
  fitMode: 'fit' | 'fill' | 'stretch'
}

export interface TextSettings {
  fontFamily: string
  fontSize: number
  fontWeight: string
  fill: string
  textAlign: string
  stroke: string
  strokeWidth: number
  shadow: fabric.Shadow | null
  backgroundColor: string
}

export interface EditorStore extends EditorState {
  // Canvas actions
  setCanvas: (canvas: fabric.Canvas) => void
  setActiveObject: (object: fabric.Object | null) => void
  setSelectedTool: (tool: string) => void
  setLoading: (loading: boolean) => void
  setCurrentImage: (image: string | null) => void
  setIsDirty: (dirty: boolean) => void
  
  // History actions
  saveToHistory: (action: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Preset actions
  savePreset: (name: string, settings: Record<string, any>) => void
  loadPreset: (presetId: string) => void
  deletePreset: (presetId: string) => void
  
  // Canvas settings
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void
  updateTextSettings: (settings: Partial<TextSettings>) => void
  
  // Object manipulation
  deleteSelectedObject: () => void
  duplicateSelectedObject: () => void
  bringToFront: () => void
  sendToBack: () => void
  
  // Export/Import
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => string | null
  importImage: (imageUrl: string) => void
  
  // Local storage
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  clearLocalStorage: () => void
}

const defaultCanvasSettings: CanvasSettings = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  fitMode: 'fit'
}

const defaultTextSettings: TextSettings = {
  fontFamily: 'Arial',
  fontSize: 32,
  fontWeight: 'normal',
  fill: '#000000',
  textAlign: 'left',
  stroke: '',
  strokeWidth: 0,
  shadow: null,
  backgroundColor: ''
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  canvas: null,
  activeObject: null,
  selectedTool: 'select',
  isLoading: false,
  history: [],
  historyIndex: -1,
  presets: [],
  currentImage: null,
  canvasSettings: defaultCanvasSettings,
  textSettings: defaultTextSettings,
  isDirty: false,

  // Canvas actions
  setCanvas: (canvas) => set({ canvas }),
  setActiveObject: (object) => set({ activeObject: object }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentImage: (image) => set({ currentImage: image }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  // History actions
  saveToHistory: (action) => {
    const { canvas, history, historyIndex } = get()
    if (!canvas) return

    const canvasState = JSON.stringify(canvas.toJSON())
    const newHistoryItem: HistoryState = {
      id: generateId(),
      action,
      timestamp: Date.now(),
      canvasState
    }

    // Remove any history after current index and add new item
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newHistoryItem)

    // Limit history to 50 items
    const limitedHistory = newHistory.slice(-50)

    set({
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1,
      isDirty: true
    })
  },

  undo: () => {
    const { canvas, history, historyIndex } = get()
    if (!canvas || historyIndex <= 0) return

    const previousState = history[historyIndex - 1]
    canvas.loadFromJSON(previousState.canvasState, () => {
      canvas.renderAll()
      set({ 
        historyIndex: historyIndex - 1,
        activeObject: null,
        isDirty: true
      })
    })
  },

  redo: () => {
    const { canvas, history, historyIndex } = get()
    if (!canvas || historyIndex >= history.length - 1) return

    const nextState = history[historyIndex + 1]
    canvas.loadFromJSON(nextState.canvasState, () => {
      canvas.renderAll()
      set({ 
        historyIndex: historyIndex + 1,
        activeObject: null,
        isDirty: true
      })
    })
  },

  canUndo: () => {
    const { historyIndex } = get()
    return historyIndex > 0
  },

  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },

  // Preset actions
  savePreset: (name, settings) => {
    const { presets } = get()
    const newPreset: PresetState = {
      id: generateId(),
      name,
      settings,
      createdAt: Date.now()
    }
    set({ presets: [...presets, newPreset] })
  },

  loadPreset: (presetId) => {
    const { presets, canvas, updateTextSettings } = get()
    const preset = presets.find(p => p.id === presetId)
    if (!preset || !canvas) return

    // Apply preset settings based on type
    if (preset.settings.textSettings) {
      updateTextSettings(preset.settings.textSettings)
    }
    // Add more preset types as needed
  },

  deletePreset: (presetId) => {
    const { presets } = get()
    set({ presets: presets.filter(p => p.id !== presetId) })
  },

  // Canvas settings
  updateCanvasSettings: (settings) => {
    const { canvasSettings, canvas } = get()
    const newSettings = { ...canvasSettings, ...settings }
    
    if (canvas) {
      canvas.setWidth(newSettings.width)
      canvas.setHeight(newSettings.height)
      canvas.backgroundColor = newSettings.backgroundColor
      canvas.renderAll()
    }
    
    set({ canvasSettings: newSettings, isDirty: true })
  },

  updateTextSettings: (settings) => {
    const { textSettings } = get()
    set({ textSettings: { ...textSettings, ...settings }, isDirty: true })
  },

  // Object manipulation
  deleteSelectedObject: () => {
    const { canvas, activeObject, saveToHistory } = get()
    if (!canvas || !activeObject) return

    canvas.remove(activeObject)
    canvas.renderAll()
    saveToHistory('Delete object')
    set({ activeObject: null })
  },

  duplicateSelectedObject: () => {
    const { canvas, activeObject, saveToHistory } = get()
    if (!canvas || !activeObject) return

    activeObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.renderAll()
      saveToHistory('Duplicate object')
      set({ activeObject: cloned })
    })
  },

  bringToFront: () => {
    const { canvas, activeObject, saveToHistory } = get()
    if (!canvas || !activeObject) return

    canvas.bringToFront(activeObject)
    canvas.renderAll()
    saveToHistory('Bring to front')
  },

  sendToBack: () => {
    const { canvas, activeObject, saveToHistory } = get()
    if (!canvas || !activeObject) return

    canvas.sendToBack(activeObject)
    canvas.renderAll()
    saveToHistory('Send to back')
  },

  // Export/Import
  exportCanvas: (format) => {
    const { canvas } = get()
    if (!canvas) return null

    switch (format) {
      case 'png':
        return canvas.toDataURL('image/png')
      case 'jpg':
        return canvas.toDataURL('image/jpeg', 0.9)
      case 'svg':
        return canvas.toSVG()
      default:
        return null
    }
  },

  importImage: (imageUrl) => {
    const { canvas, canvasSettings, saveToHistory } = get()
    if (!canvas) return

    fabric.Image.fromURL(imageUrl, (img) => {
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasAspect = canvasSettings.width / canvasSettings.height
      const imageAspect = (img.width || 1) / (img.height || 1)

      if (canvasSettings.fitMode === 'fit') {
        if (imageAspect > canvasAspect) {
          img.scaleToWidth(canvasSettings.width)
        } else {
          img.scaleToHeight(canvasSettings.height)
        }
      } else if (canvasSettings.fitMode === 'fill') {
        if (imageAspect > canvasAspect) {
          img.scaleToHeight(canvasSettings.height)
        } else {
          img.scaleToWidth(canvasSettings.width)
        }
      } else {
        img.scaleToWidth(canvasSettings.width)
        img.scaleToHeight(canvasSettings.height)
      }

      img.set({
        left: canvasSettings.width / 2,
        top: canvasSettings.height / 2,
        originX: 'center',
        originY: 'center'
      })

      canvas.add(img)
      canvas.centerObject(img)
      canvas.renderAll()
      saveToHistory('Import image')
      set({ currentImage: imageUrl })
    })
  },

  // Local storage
  saveToLocalStorage: () => {
    const state = get()
    const dataToSave = {
      presets: state.presets,
      canvasSettings: state.canvasSettings,
      textSettings: state.textSettings,
      canvasData: state.canvas?.toJSON() || null
    }
    localStorage.setItem('image-editor-data', JSON.stringify(dataToSave))
    set({ isDirty: false })
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem('image-editor-data')
      if (!saved) return

      const data = JSON.parse(saved)
      const { canvas } = get()

      set({
        presets: data.presets || [],
        canvasSettings: data.canvasSettings || defaultCanvasSettings,
        textSettings: data.textSettings || defaultTextSettings
      })

      if (data.canvasData && canvas) {
        canvas.loadFromJSON(data.canvasData, () => {
          canvas.renderAll()
        })
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  },

  clearLocalStorage: () => {
    localStorage.removeItem('image-editor-data')
    set({ isDirty: false })
  }
}))