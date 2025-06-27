import React, { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/lib/utils'

interface CanvasRendererProps {
  className?: string
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { 
    canvas, 
    setCanvas, 
    setActiveObject, 
    canvasSettings, 
    saveToHistory,
    loadFromLocalStorage 
  } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSettings.width,
      height: canvasSettings.height,
      backgroundColor: canvasSettings.backgroundColor,
      selection: true,
      preserveObjectStacking: true
    })

    // Enable touch events for mobile
    fabricCanvas.enableRetinaScaling = true
    fabricCanvas.fireRightClick = true
    fabricCanvas.stopContextMenu = true

    // Canvas event handlers
    fabricCanvas.on('selection:created', (e) => {
      setActiveObject(e.selected?.[0] || null)
    })

    fabricCanvas.on('selection:updated', (e) => {
      setActiveObject(e.selected?.[0] || null)
    })

    fabricCanvas.on('selection:cleared', () => {
      setActiveObject(null)
    })

    fabricCanvas.on('object:modified', () => {
      saveToHistory('Object modified')
    })

    fabricCanvas.on('object:added', () => {
      saveToHistory('Object added')
    })

    fabricCanvas.on('object:removed', () => {
      saveToHistory('Object removed')
    })

    // Touch gesture support
    let isDrawing = false
    let lastPosX = 0
    let lastPosY = 0

    fabricCanvas.on('mouse:down', (e) => {
      if (e.e.touches && e.e.touches.length > 1) {
        // Multi-touch - disable drawing
        isDrawing = false
        return
      }
      
      isDrawing = true
      const pointer = fabricCanvas.getPointer(e.e)
      lastPosX = pointer.x
      lastPosY = pointer.y
    })

    fabricCanvas.on('mouse:move', (e) => {
      if (!isDrawing) return
      
      const pointer = fabricCanvas.getPointer(e.e)
      // Handle drawing/manipulation here
    })

    fabricCanvas.on('mouse:up', () => {
      isDrawing = false
    })

    setCanvas(fabricCanvas)

    // Load from localStorage on initialization
    setTimeout(() => {
      loadFromLocalStorage()
    }, 100)

    return () => {
      fabricCanvas.dispose()
    }
  }, [])

  // Update canvas settings when they change
  useEffect(() => {
    if (!canvas) return

    canvas.setWidth(canvasSettings.width)
    canvas.setHeight(canvasSettings.height)
    canvas.backgroundColor = canvasSettings.backgroundColor
    canvas.renderAll()
  }, [canvas, canvasSettings])

  return (
    <div className={cn("flex items-center justify-center bg-gray-50 dark:bg-gray-900", className)}>
      <div className="relative shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block max-w-full max-h-full"
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
          }}
        />
      </div>
    </div>
  )
}