import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CanvasRenderer } from '@/features/canvas/CanvasRenderer'
import { TextTool } from '@/features/tools/TextTool'
import { ImageUploader } from '@/features/upload/ImageUploader'
import { ExportPanel } from '@/features/export/ExportPanel'
import { useEditorStore } from '@/store/editorStore'
import { ToolRegistry } from '@/features/tools/ToolRegistry'
import { usePresets } from '@/features/tools/ToolPresets'
import { 
  Menu, 
  X, 
  MousePointer, 
  Type, 
  Image, 
  Download, 
  Undo, 
  Redo, 
  Trash2,
  Copy,
  Save,
  Settings,
  Layers,
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const EditorLayout: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>('upload')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const {
    selectedTool,
    setSelectedTool,
    activeObject,
    deleteSelectedObject,
    duplicateSelectedObject,
    bringToFront,
    sendToBack,
    undo,
    redo,
    canUndo,
    canRedo,
    canvas,
    saveToLocalStorage,
    isDirty
  } = useEditorStore()

  const { getAllCategories, applyPreset } = usePresets()

  const handleToolSelect = (toolId: string) => {
    if (canvas) {
      ToolRegistry.activateTool(toolId, canvas)
      setSelectedTool(toolId)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
        case 's':
          e.preventDefault()
          saveToLocalStorage()
          break
        case 'd':
          e.preventDefault()
          duplicateSelectedObject()
          break
      }
    } else {
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (activeObject && document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault()
            deleteSelectedObject()
          }
          break
        case 'v':
          handleToolSelect('select')
          break
        case 't':
          handleToolSelect('text')
          break
      }
    }
  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeObject])

  const toolCategories = [
    { id: 'upload', name: 'Upload', icon: Image, component: ImageUploader },
    { id: 'text', name: 'Text', icon: Type, component: TextTool },
    { id: 'export', name: 'Export', icon: Download, component: ExportPanel }
  ]

  const tools = ToolRegistry.getAllTools()

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
        "md:translate-x-0 md:static md:z-auto",
        "fixed inset-y-0 z-40 transition-transform duration-300",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Image Editor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Professional design tool
          </p>
        </div>

        {/* Tool Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {toolCategories.map((category) => (
              <Button
                key={category.id}
                variant={activePanel === category.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePanel(category.id)}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <category.icon className="w-4 h-4" />
                <span className="text-xs">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Tool Panel */}
        <div className="flex-1 p-4 overflow-y-auto">
          {(() => {
            const activeCategory = toolCategories.find(cat => cat.id === activePanel)
            if (activeCategory?.component) {
              const Component = activeCategory.component
              return <Component />
            }
            return null
          })()}
        </div>

        {/* Presets Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-sm mb-3">Quick Presets</h3>
          <div className="space-y-2">
            {getAllCategories().slice(0, 2).map((category) => (
              <div key={category.id}>
                <p className="text-xs text-gray-500 mb-1">{category.name}</p>
                <div className="grid grid-cols-2 gap-1">
                  {category.presets.slice(0, 4).map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(category.id, preset.id)}
                      className="text-xs h-8"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            {/* Tool Selection */}
            <div className="flex items-center space-x-2">
              {tools.slice(0, 5).map((tool) => {
                const IconComponent = require('lucide-react')[tool.icon]
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolSelect(tool.id)}
                    title={`${tool.name} (${tool.shortcut})`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Button>
                )
              })}
            </div>

            {/* History Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo()}
                title="Undo (Cmd+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo()}
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Object Controls */}
            {activeObject && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateSelectedObject}
                  title="Duplicate (Cmd+D)"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bringToFront}
                  title="Bring to Front"
                >
                  <Layers className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedObject}
                  title="Delete (Del)"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Save Indicator */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveToLocalStorage}
                title="Save Project (Cmd+S)"
              >
                <Save className="w-4 h-4" />
                {isDirty && <span className="ml-1 text-orange-500">*</span>}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-8">
          <CanvasRenderer className="h-full" />
        </div>

        {/* Status Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Tool: {tools.find(t => t.id === selectedTool)?.name || 'None'}</span>
              {activeObject && (
                <span>Selected: {activeObject.type}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>Canvas: 800×600</span>
              <span>Zoom: 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  )
}