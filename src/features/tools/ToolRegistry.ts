import { fabric } from 'fabric'
import { generateId } from '@/lib/utils'

export interface ToolDefinition {
  id: string
  name: string
  icon: string
  category: ToolCategory
  description: string
  shortcut?: string
  component?: React.ComponentType<any>
  handler?: ToolHandler
}

export type ToolCategory = 'selection' | 'drawing' | 'text' | 'shapes' | 'adjustments' | 'ai' | 'branding'

export interface ToolHandler {
  activate: (canvas: fabric.Canvas) => void
  deactivate: (canvas: fabric.Canvas) => void
  onMouseDown?: (canvas: fabric.Canvas, event: fabric.IEvent) => void
  onMouseMove?: (canvas: fabric.Canvas, event: fabric.IEvent) => void
  onMouseUp?: (canvas: fabric.Canvas, event: fabric.IEvent) => void
}

class ToolRegistryClass {
  private tools: Map<string, ToolDefinition> = new Map()
  private activeTool: string | null = null
  private activeCanvas: fabric.Canvas | null = null

  register(tool: ToolDefinition) {
    this.tools.set(tool.id, tool)
  }

  unregister(toolId: string) {
    this.tools.delete(toolId)
  }

  getTool(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId)
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.category === category)
  }

  activateTool(toolId: string, canvas: fabric.Canvas) {
    // Deactivate current tool
    if (this.activeTool && this.activeCanvas) {
      const currentTool = this.tools.get(this.activeTool)
      if (currentTool?.handler?.deactivate) {
        currentTool.handler.deactivate(this.activeCanvas)
      }
    }

    // Activate new tool
    const tool = this.tools.get(toolId)
    if (tool && tool.handler) {
      tool.handler.activate(canvas)
      this.activeTool = toolId
      this.activeCanvas = canvas
    }
  }

  getActiveTool(): string | null {
    return this.activeTool
  }

  isToolActive(toolId: string): boolean {
    return this.activeTool === toolId
  }
}

export const ToolRegistry = new ToolRegistryClass()

// Built-in tools
const selectTool: ToolDefinition = {
  id: 'select',
  name: 'Select',
  icon: 'MousePointer',
  category: 'selection',
  description: 'Select and move objects',
  shortcut: 'V',
  handler: {
    activate: (canvas) => {
      canvas.isDrawingMode = false
      canvas.selection = true
      canvas.defaultCursor = 'default'
    },
    deactivate: (canvas) => {
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }
}

const textTool: ToolDefinition = {
  id: 'text',
  name: 'Text',
  icon: 'Type',
  category: 'text',
  description: 'Add text to your design',
  shortcut: 'T',
  handler: {
    activate: (canvas) => {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'text'
    },
    deactivate: (canvas) => {
      canvas.selection = true
      canvas.defaultCursor = 'default'
    },
    onMouseDown: (canvas, event) => {
      const pointer = canvas.getPointer(event.e)
      const text = new fabric.IText('Edit text', {
        left: pointer.x,
        top: pointer.y,
        fontFamily: 'Arial',
        fontSize: 32,
        fill: '#000000'
      })
      
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      canvas.renderAll()
    }
  }
}

const rectangleTool: ToolDefinition = {
  id: 'rectangle',
  name: 'Rectangle',
  icon: 'Square',
  category: 'shapes',
  description: 'Draw rectangles',
  shortcut: 'R',
  handler: {
    activate: (canvas) => {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
    },
    deactivate: (canvas) => {
      canvas.selection = true
      canvas.defaultCursor = 'default'
    },
    onMouseDown: (canvas, event) => {
      const pointer = canvas.getPointer(event.e)
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 100,
        fill: 'rgba(0, 123, 255, 0.3)',
        stroke: '#007bff',
        strokeWidth: 2
      })
      
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
    }
  }
}

const circleTool: ToolDefinition = {
  id: 'circle',
  name: 'Circle',
  icon: 'Circle',
  category: 'shapes',
  description: 'Draw circles',
  shortcut: 'C',
  handler: {
    activate: (canvas) => {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
    },
    deactivate: (canvas) => {
      canvas.selection = true
      canvas.defaultCursor = 'default'
    },
    onMouseDown: (canvas, event) => {
      const pointer = canvas.getPointer(event.e)
      const circle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 50,
        fill: 'rgba(40, 167, 69, 0.3)',
        stroke: '#28a745',
        strokeWidth: 2
      })
      
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
    }
  }
}

const cropTool: ToolDefinition = {
  id: 'crop',
  name: 'Crop',
  icon: 'Crop',
  category: 'adjustments',
  description: 'Crop your image',
  shortcut: 'P',
  handler: {
    activate: (canvas) => {
      canvas.isDrawingMode = false
      canvas.selection = false
      // Crop tool implementation would go here
    },
    deactivate: (canvas) => {
      canvas.selection = true
    }
  }
}

// Register built-in tools
ToolRegistry.register(selectTool)
ToolRegistry.register(textTool)
ToolRegistry.register(rectangleTool)
ToolRegistry.register(circleTool)
ToolRegistry.register(cropTool)