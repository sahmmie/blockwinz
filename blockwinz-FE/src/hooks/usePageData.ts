import { GameCategoryEnum } from '@blockwinz/shared';
import { GameInfo } from '@/shared/types/types';
import { create } from 'zustand'
interface pageDataState {
  title: string;
  setTitle: (title: string) => void;
  currentGame: GameInfo | null;
  setCurrentGame: (game: GameInfo) => void;
  // Add other properties and methods as needed
  selectedSegment: GameCategoryEnum;
  setSelectedSegment: (segment: GameCategoryEnum) => void;
}

const usePageData = create<pageDataState>((set) => ({
  title: 'Blockwinz',
  setTitle: (title: string) => set({ title }),
  currentGame: null,
  setCurrentGame: (game: GameInfo) => set({ currentGame: game }),
  selectedSegment: GameCategoryEnum.ORIGINALS,
  setSelectedSegment: (segment: GameCategoryEnum) => set({ selectedSegment: segment }),
}))

export default usePageData;