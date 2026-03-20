import { create } from 'zustand'
import { AxiosResponse } from 'axios'
import axiosInstance from '@/lib/axios'
import { toaster } from '@/components/ui/toaster'
import { FavouriteI, GameInfo, GameItemI } from '@/shared/types/types';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { useEffect } from 'react';

interface FavouritesState {
    favourites: GameInfo[];
    isLoading: boolean;
    getFavourites: () => void;
    addFavourite: (gameId: GameInfo) => void;
    removeFavourite: (gameId: GameInfo) => void;
}

export const useFavouritesStore = create<FavouritesState>((set) => ({
    favourites: [],
    isLoading: false,

    getFavourites: () => {
        set({ isLoading: true });
        axiosInstance
            .get('settings/my-favourites')
            .then((response: AxiosResponse<FavouriteI>) => {
                if (response.data) {
                    const mapped = mapFavouritesToGameInfo(response.data.games);
                    set({ favourites: mapped, isLoading: false });
                } else {
                    set({ favourites: [], isLoading: false });
                }
            })
            .catch(() => {
                set({ isLoading: false });
            });
    },

    addFavourite: (game: GameInfo) => {
        axiosInstance
            .post('settings/add-favourites', { game: game.id })
            .then(() => {
                // Optimistically update UI
                set((state) => ({
                    favourites: [...state.favourites, { ...game, releasedAt: new Date() }],
                }));
                toaster.create({ title: 'Added to favourites', type: 'success' });
            })
            .catch(() => {
                toaster.create({ title: 'Failed to add favourite', type: 'error' });
            });
    },

    removeFavourite: (game: GameInfo) => {
        axiosInstance
            .delete(`settings/remove-favourites`, { data: { game: game.id } })
            .then(() => {
                set((state) => ({
                    favourites: state.favourites.filter((game) => game.id !== game.id),
                }));
                toaster.create({ title: 'Removed from favourites', type: 'success' });
            })
            .catch(() => {
                toaster.create({ title: 'Failed to remove favourite', type: 'error' });
            });
    },
}));


const mapFavouritesToGameInfo = (games: GameItemI[]): GameInfo[] => {
    return games
        .map((favourite) => {
            const game = Object.values(originalGamesInfo).find((g) => g.id === favourite.game);
            if (game) {
                return {
                    ...game,
                    releasedAt: new Date(favourite.addedAt),
                };
            }
            return null;
        })
        .filter((game) => game !== null);
};

export const useFavouritesInitializer = () => {
    const { getFavourites, isLoading } = useFavouritesStore((state) => state)

    useEffect(() => {
        if (!isLoading) {
            getFavourites()
        }
    }, [])
}