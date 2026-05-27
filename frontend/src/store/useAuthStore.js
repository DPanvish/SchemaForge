import { create } from 'zustand';

const useAuthStore = create((set) => ({
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  
  login: (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    set({ userInfo: userData });
  },
  
  logout: () => {
    console.log("💥 Executing Nuclear Logout...");

    localStorage.clear();
    sessionStorage.clear();

    set({ user: null, token: null });

    window.location.href = '/';
  }
}));

export default useAuthStore;