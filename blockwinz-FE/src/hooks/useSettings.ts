import { create } from 'zustand'
import { useEffect } from 'react'
// TODO: Uncomment when hotkeys are ready
// import { useHotkeysHandler } from '../Settings'
import useAccount from './userAccount'
import { ProfileI, UserI } from '@/shared/interfaces/account.interface'
import axiosInstance from '@/lib/axios'
import { toaster } from '@/components/ui/toaster'
import { HotkeyConfigs } from '@/shared/types/core'

const defaultSettings: Partial<ProfileI> = {
    isMuted: false,
    isTurbo: false,
    isHotKeysActive: false,
}

const getSettingsFromPlayer = (profile: Partial<ProfileI>): Partial<ProfileI> => {
    if (!profile) return defaultSettings

    return {
        isMuted: profile?.isMuted || false,
        isTurbo: profile?.isTurbo || false,
        isHotKeysActive: profile?.isHotKeysActive || false,
    }
}

// Create Zustand Store
interface SettingsState {
    settings: Partial<ProfileI>
    hotKeysConfig: HotkeyConfigs
    isHotKeysEnabled: boolean
    gameContainerRef: React.RefObject<HTMLDivElement>
    setHotKeysConfig: (config: HotkeyConfigs) => void
    setIsHotKeysEnabled: (isEnabled: boolean) => void
    updatePlayerSettings: (newSettings: Partial<ProfileI>) => void
    initializeSettings: (player: Partial<UserI>) => void
    isLoading: boolean
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    isLoading: false,
    settings: defaultSettings,
    hotKeysConfig: {},
    isHotKeysEnabled: true,
    gameContainerRef: { current: null } as React.RefObject<HTMLDivElement>,
    setHotKeysConfig: (config: HotkeyConfigs) => set({ hotKeysConfig: config }),
    setIsHotKeysEnabled: (isEnabled: boolean) => set({ isHotKeysEnabled: isEnabled }),
    updatePlayerSettings: (newSettings: Partial<UserI>) => {
        const settings = get().settings

        const updatedSettings = {
            ...settings,
            ...newSettings,
        }

        // Optimistic UI update
        set({ settings: updatedSettings, isLoading: true })

        axiosInstance.patch('/settings/profile', {
            isMuted: updatedSettings.isMuted,
            isTurbo: updatedSettings.isTurbo,
            isHotKeysActive: updatedSettings.isHotKeysActive,
        }).then((response) => {
            set({ settings: getSettingsFromPlayer(response.data), isLoading: false })
        }).catch(() => {
            toaster.create({
                title: 'Failed to update settings',
                type: 'error',
            })
            set({ isLoading: false })
        })
    },
    initializeSettings: (player: Partial<UserI>) => {
        set({ settings: getSettingsFromPlayer(player), isLoading: false })
    },
}))

// Hotkeys Handler Integration
export const useSettingsWithHotkeys = () => {
    // TODO: Uncomment when hotkeys are ready
    // const { settings, hotKeysConfig, isHotKeysEnabled, gameContainerRef } = useSettingsStore()

    // useHotkeysHandler({
    //     configs: hotKeysConfig,
    //     isEnabled: settings.isHotKeysActive && isHotKeysEnabled,
    //     gameContainerRef,
    // })
}

// Initialize store with player settings on mount
export const useSettingsInitializer = () => {
    const { userData } = useAccount()
    const initializeSettings = useSettingsStore((state) => state.initializeSettings)

    useEffect(() => {
        if (userData) {
            initializeSettings(userData.profile);
        }
    }, [userData, initializeSettings])
}
