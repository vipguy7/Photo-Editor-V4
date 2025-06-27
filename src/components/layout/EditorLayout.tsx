import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CanvasRenderer } from '@/features/canvas/CanvasRenderer';
import { useEditorStore } from '@/store/editorStore';
import {
  Undo,
  Redo,
  Trash2,
  Copy,
  Save,
  Layers
} from 'lucide-react';

export const EditorLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    activeObject,
    duplicateSelectedObject,
    bringToFront,
    deleteSelectedObject,
    saveToLocalStorage,
    isDirty
  } = useEditorStore();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
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
          {/* Status info here, e.g. current tool, canvas size, etc. */}
          <span>Photo Editor V4</span>
        </div>
      </div>
    </div>
  );
};
