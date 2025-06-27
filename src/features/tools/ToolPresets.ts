import { useEditorStore } from '@/store/editorStore';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export type PresetState = {
  id: string;
  name: string;
  settings: any;
  createdAt: number;
};

export type PresetCategory = {
  id: string;
  name: string;
  description: string;
  presets: PresetState[];
};

export class ToolPresetsClass {
  private presetCategories: Map<string, PresetCategory> = new Map();

  constructor() {
    this.initializeDefaultPresets();
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
            strokeWidth: 0,
          },
        },
        createdAt: Date.now(),
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
            strokeWidth: 0,
          },
        },
        createdAt: Date.now(),
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
            strokeWidth: 1,
          },
        },
        createdAt: Date.now(),
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
            strokeWidth: 3,
          },
        },
        createdAt: Date.now(),
      },
    ];

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
            fitMode: 'fill',
          },
        },
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        name: 'Instagram Story',
        settings: {
          canvasSettings: {
            width: 1080,
            height: 1920,
            backgroundColor: '#000000',
            fitMode: 'fit',
          },
        },
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        name: 'Facebook Cover',
        settings: {
          canvasSettings: {
            width: 1200,
            height: 630,
            backgroundColor: '#f8f9fa',
            fitMode: 'fill',
          },
        },
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        name: 'YouTube Thumbnail',
        settings: {
          canvasSettings: {
            width: 1280,
            height: 720,
            backgroundColor: '#ff0000',
            fitMode: 'fill',
          },
        },
        createdAt: Date.now(),
      },
    ];

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
            textAlign: 'left',
          },
          canvasSettings: {
            backgroundColor: '#f1f5f9',
          },
        },
        createdAt: Date.now(),
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
            strokeWidth: 0.5,
          },
          canvasSettings: {
            backgroundColor: '#1a1a1a',
          },
        },
        createdAt: Date.now(),
      },
    ];

    this.registerCategory({
      id: 'text',
      name: 'Text Styles',
      description: 'Pre-configured text styling presets',
      presets: textPresets,
    });

    this.registerCategory({
      id: 'canvas',
      name: 'Canvas Sizes',
      description: 'Standard canvas dimensions for social media',
      presets: canvasPresets,
    });

    this.registerCategory({
      id: 'brand',
      name: 'Brand Themes',
      description: 'Complete brand styling presets',
      presets: brandPresets,
    });
  }

  registerCategory(category: PresetCategory) {
    this.presetCategories.set(category.id, category);
  }

  getCategory(categoryId: string): PresetCategory | undefined {
    return this.presetCategories.get(categoryId);
  }

  getAllCategories(): PresetCategory[] {
    return Array.from(this.presetCategories.values());
  }

  getPreset(categoryId: string, presetId: string): PresetState | undefined {
    const category = this.presetCategories.get(categoryId);
    return category?.presets.find((p) => p.id === presetId);
  }

  addPreset(categoryId: string, preset: Omit<PresetState, 'id' | 'createdAt'>) {
    const category = this.presetCategories.get(categoryId);
    if (!category) return;

    const newPreset: PresetState = {
      ...preset,
      id: generateId(),
      createdAt: Date.now(),
    };

    category.presets.push(newPreset);
  }

  removePreset(categoryId: string, presetId: string) {
    const category = this.presetCategories.get(categoryId);
    if (!category) return;

    category.presets = category.presets.filter((p) => p.id !== presetId);
  }

  applyPreset(categoryId: string, presetId: string) {
    const preset = this.getPreset(categoryId, presetId);
    if (!preset) return;

    const store = useEditorStore.getState();

    // Apply text settings if present
    if (preset.settings.textSettings) {
      store.updateTextSettings(preset.settings.textSettings);
    }

    // Apply canvas settings if present
    if (preset.settings.canvasSettings) {
      store.updateCanvasSettings(preset.settings.canvasSettings);
    }

    // TODO: Add logic for filters and objects if used in the future

    return preset;
  }
}

export const ToolPresets = new ToolPresetsClass();
