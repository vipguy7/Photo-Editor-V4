import create from 'zustand';
import type { fabric } from 'fabric';

export interface PresetState {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  createdAt: number;
}

interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  // Add more as needed
}

interface TextSettings {
  [key: string]: unknown;
}

interface HistoryEntry {
  json: object | null;
  action: string;
  timestamp: number;
}

interface EditorStoreState {
  history: HistoryEntry[];
  historyIndex: number;
  activeObject: fabric.Object | null;
  isDirty: boolean;
  isLoading: boolean;
  presets: PresetState[];
  canvas: fabric.Canvas | null;
  canvasSettings: CanvasSettings;
  textSettings: TextSettings;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  deleteSelectedObject: () => void;
  duplicateSelectedObject: () => void;
  bringToFront: () => void;
  saveToLocalStorage: () => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  updateTextSettings: (settings: Partial<TextSettings>) => void;
  setActiveObject: (object: fabric.Object | null) => void;
  setCanvas: (canvas: fabric.Canvas) => void;
  saveToHistory: (action: string) => void;
  loadFromLocalStorage: () => void;
  // ... other actions (add as needed)
}

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  history: [],
  historyIndex: 0,
  activeObject: null,
  isDirty: false,
  isLoading: false,
  presets: [],
  canvas: null,
  canvasSettings: { width: 800, height: 600, backgroundColor: '#fff' },
  textSettings: {},

  canUndo: () => get().historyIndex > 0,
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  undo: () => {
    const { historyIndex, canvas } = get();
    if (historyIndex > 0 && canvas) {
      // Load previous state (implement as needed)
      set({ historyIndex: historyIndex - 1, isDirty: true });
    }
  },

  redo: () => {
    const { history, historyIndex, canvas } = get();
    if (historyIndex < history.length - 1 && canvas) {
      // Load next state (implement as needed)
      set({ historyIndex: historyIndex + 1, isDirty: true });
    }
  },

  deleteSelectedObject: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      canvas.remove(activeObject);
      set({ activeObject: null, isDirty: true });
    }
  },

  duplicateSelectedObject: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({ left: (activeObject.left || 0) + 20, top: (activeObject.top || 0) + 20 });
        canvas.add(cloned);
        set({ activeObject: cloned, isDirty: true });
      });
    }
  },

  bringToFront: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      canvas.bringToFront(activeObject);
      set({ isDirty: true });
    }
  },

  saveToLocalStorage: () => {
    const { canvas } = get();
    if (canvas) {
      localStorage.setItem('photoEditorV4Project', JSON.stringify(canvas.toJSON()));
      set({ isDirty: false });
    }
  },

  updateCanvasSettings: (settings) => {
    const { canvasSettings, canvas } = get();
    const newSettings = { ...canvasSettings, ...settings };
    if (canvas) {
      canvas.setWidth(newSettings.width);
      canvas.setHeight(newSettings.height);
      canvas.backgroundColor = newSettings.backgroundColor;
      canvas.renderAll();
    }
    set({ canvasSettings: newSettings, isDirty: true });
  },

  updateTextSettings: (settings) => {
    const { textSettings } = get();
    set({ textSettings: { ...textSettings, ...settings }, isDirty: true });
  },

  setActiveObject: (object: fabric.Object | null) => set({ activeObject: object }),
  setCanvas: (canvas: fabric.Canvas) => set({ canvas }),
  saveToHistory: (action: string) => {
    const { canvas, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      json: canvas ? canvas.toJSON() : null,
      action,
      timestamp: Date.now(),
    });
    set({ history: newHistory, historyIndex: newHistory.length - 1, isDirty: true });
  },
  loadFromLocalStorage: () => {
    const { canvas } = get();
    const data = localStorage.getItem('photoEditorV4Project');
    if (canvas && data) {
      canvas.loadFromJSON(JSON.parse(data), () => {
        canvas.renderAll();
      });
    }
  },
}));
