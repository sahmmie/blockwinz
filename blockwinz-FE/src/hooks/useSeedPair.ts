// stores/useSeedPair.ts
import { create } from 'zustand';
import axiosInstance from '@/lib/axios';
import { ActiveSeedPairI } from '@/shared/interfaces/account.interface';
import { toaster } from '@/components/ui/toaster';

interface SeedPairState {
    activeSeedPair: ActiveSeedPairI | null;
    seedPairLoading: boolean;
    rotateSeedPair: (showToast?: boolean) => Promise<void>;
    getActiveSeedPair: () => Promise<void>;
    setActiveSeedPair: (pair: ActiveSeedPairI) => void;
}

export const useSeedPair = create<SeedPairState>((set) => ({
    activeSeedPair: null,
    seedPairLoading: false,
    setActiveSeedPair: (pair) => set({ activeSeedPair: pair }),

    rotateSeedPair: async (showToast = false) => {
        set({ seedPairLoading: true });
        try {
            const response = await axiosInstance.get('/settings/rotateSeed');
            set({
                activeSeedPair: response.data,
                seedPairLoading: false,
            });
            if (showToast) {
                toaster.create({
                    title: 'Seed pair rotated',
                    type: 'success',
                });
            }
        } catch {
            set({ seedPairLoading: false });
            toaster.create({
                title: 'Failed to rotate seed pair',
                type: 'error',
            });
        }
    },

    getActiveSeedPair: async (showToast = false) => {
        set({ seedPairLoading: true });
        try {
            const response = await axiosInstance.get('/settings/activeSeed');
            set({
                activeSeedPair: response.data,
                seedPairLoading: false,
            });
        } catch {
            set({ seedPairLoading: false });
            if (showToast) {
                toaster.create({
                    title: 'Failed to get active seed pair',
                    type: 'error',
                });
            }
        }
    },
}));
