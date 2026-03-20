import { create } from 'zustand';
import { UserI } from '../shared/interfaces/account.interface';
import axiosService from '@/lib/axios';

interface AccountStoreI {
    userData: UserI | null; // State to store the user data
    setAccountData: (data: UserI | null) => void; // Function to update the user data
    /**
     *  Fetches the user profile data from the server and updates the state
     * @returns UserI | null
     */
    fetchProfileData: () => Promise<UserI | null>;
}

const useAccount = create<AccountStoreI>((set) => ({
    userData: null,
    setAccountData: (data: UserI | null) => set({ userData: data }),
    fetchProfileData: async () => {
        try {
            const response = await axiosService.get('/authentication/profile');
            set({ userData: response.data });
            return response.data;
        } catch (error) {
            set({ userData: null });
            throw error;
        }
    },
}));

export default useAccount;
