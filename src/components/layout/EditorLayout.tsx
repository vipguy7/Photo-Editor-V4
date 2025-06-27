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
  Layers,
  Menu as MenuIcon,
} from 'lucide-react';

// Simple Drawer component for mobile tool actions
const Drawer = ({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) =>
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end sm:hidden">
      <div className="bg-white w-3/4 h-full shadow-lg p-4 flex flex-col">
        <button
          className="self-end mb-4"
          onClick={onClose}
          aria-label="Close Drawer"
        >
          <span className="text-2xl">&times;</span>
        </button>
        {children}
      </div>
      <div className="flex-1" onClick={onClose}></div>
    </div>
  ) : null;

export const EditorLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  // Toolbar buttons as a reusable fragment
  const Toolbar = (
    <div className="flex gap-2 items-center">
      <Button
        className="h-12 w-12 rounded-full"
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo()}
        aria-label="Undo"
        title="Undo (Cmd+Z)"
      >
        <Undo className="w-6 h-6" />
      </Button>
      <Button
        className="h-12 w-12 rounded-full"
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo()}
        aria-label="Redo"
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo className="w-6 h-6" />
      </Button>
      {activeObject && (
        <>
          <Button
            className="h-12 w-12 rounded-full"
            variant="outline"
            size="sm"
            onClick={duplicateSelectedObject}
            aria-label="Duplicate"
            title="Duplicate (Cmd+D)"
          >
            <Copy className="w-6 h-6" />
          </Button>
          <Button
            className="h-12 w-12 rounded-full"
            variant="outline"
            size="sm"
            onClick={bringToFront}
            aria-label="Bring to Front"
            title="Bring to Front"
          >
            <Layers className="w-6 h-6" />
          </Button>
          <Button
            className="h-12 w-12 rounded-full"
            variant="outline"
            size="sm"
            onClick={deleteSelectedObject}
            aria-label="Delete"
            title="Delete (Del)"
          >
            <Trash2 className="w-6 h-6" />
          </Button>
        </>
      )}
      <Button
        className="h-12 w-12 rounded-full"
        variant="outline"
        size="sm"
        onClick={saveToLocalStorage}
        aria-label="Save"
        title="Save Project (Cmd+S)"
      >
        <Save className="w-6 h-6" />
        {isDirty && <span className="ml-1 text-orange-500">*</span>}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Toolbar: Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Desktop Toolbar */}
          <div className="hidden sm:flex">{Toolbar}</div>
          {/* Mobile: Open Drawer */}
          <button
            className="sm:hidden h-12 w-12 rounded-full flex items-center justify-center"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Tools"
          >
            <MenuIcon className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer for tools */}
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {Toolbar}
      </Drawer>

      {/* Canvas Area: Responsive */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <CanvasRenderer />
      </main>
    </div>
  );
};
