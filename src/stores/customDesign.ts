import { create } from 'zustand';

export type CustomPosition = 'front' | 'back' | 'leftArm' | 'rightArm';

export interface DesignPosition {
  x: number;
  y: number;
}

export interface CustomPart {
  applied: boolean;
  imageFile: File | null;
  previewUrl: string | null;
  text: string;
  position: DesignPosition;
  scale: number;
}

export interface CustomDesignState {
  front: CustomPart;
  back: CustomPart;
  leftArm: CustomPart;
  rightArm: CustomPart;
  activePosition: CustomPosition;
  setActivePosition: (position: CustomPosition) => void;
  togglePart: (position: CustomPosition) => void;
  setPartImage: (position: CustomPosition, file: File | null) => void;
  setPartText: (position: CustomPosition, text: string) => void;
  setPartPosition: (position: CustomPosition, pos: DesignPosition) => void;
  setPartScale: (position: CustomPosition, scale: number) => void;
  resetPart: (position: CustomPosition) => void;
  resetAll: () => void;
  getAppliedParts: () => CustomPosition[];
  getCustomPrice: () => number;
}

const initialPart: CustomPart = {
  applied: false,
  imageFile: null,
  previewUrl: null,
  text: '',
  position: { x: 0, y: 0 },
  scale: 1,
};

const CUSTOM_PRICE_PER_PART = 25000; // IDR 25,000 per part

export const useCustomDesignStore = create<CustomDesignState>((set, get) => ({
  front: { ...initialPart },
  back: { ...initialPart },
  leftArm: { ...initialPart },
  rightArm: { ...initialPart },
  activePosition: 'front',

  setActivePosition: (position) => {
    set({ activePosition: position });
  },

  togglePart: (position) => {
    set((state) => ({
      [position]: {
        ...state[position],
        applied: !state[position].applied,
      },
    }));
  },

  setPartImage: (position, file) => {
    const previewUrl = file ? URL.createObjectURL(file) : null;
    set((state) => ({
      [position]: {
        ...state[position],
        imageFile: file,
        previewUrl,
        applied: true,
      },
    }));
  },

  setPartText: (position, text) => {
    set((state) => ({
      [position]: {
        ...state[position],
        text,
        applied: text.length > 0 || state[position].imageFile !== null,
      },
    }));
  },

  setPartPosition: (position, pos) => {
    set((state) => ({
      [position]: {
        ...state[position],
        position: pos,
      },
    }));
  },

  setPartScale: (position, scale) => {
    set((state) => ({
      [position]: {
        ...state[position],
        scale: Math.max(0.5, Math.min(2, scale)),
      },
    }));
  },

  resetPart: (position) => {
    const state = get();
    if (state[position].previewUrl) {
      URL.revokeObjectURL(state[position].previewUrl!);
    }
    set({ [position]: { ...initialPart } });
  },

  resetAll: () => {
    const state = get();
    ['front', 'back', 'leftArm', 'rightArm'].forEach((pos) => {
      const part = state[pos as CustomPosition];
      if (part.previewUrl) {
        URL.revokeObjectURL(part.previewUrl);
      }
    });
    set({
      front: { ...initialPart },
      back: { ...initialPart },
      leftArm: { ...initialPart },
      rightArm: { ...initialPart },
      activePosition: 'front',
    });
  },

  getAppliedParts: () => {
    const state = get();
    const positions: CustomPosition[] = ['front', 'back', 'leftArm', 'rightArm'];
    return positions.filter((pos) => state[pos].applied);
  },

  getCustomPrice: () => {
    const appliedParts = get().getAppliedParts();
    return appliedParts.length * CUSTOM_PRICE_PER_PART;
  },
}));
