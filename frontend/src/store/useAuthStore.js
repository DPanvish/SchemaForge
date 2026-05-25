import { create } from 'zustand';

const useAuthStore = create((set) => ({
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  
  login: (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    set({ userInfo: userData });
  },
  
  logout: () => {
    localStorage.removeItem('userInfo');
    set({ userInfo: null });
  },
}));

export default useAuthStore;