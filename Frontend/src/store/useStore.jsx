import { create } from 'zustand';

const useStore = create((set) => ({
  // Authentication state
  user: null,
  isAuthenticated: false,
  
  // Health data
  vitals: {
    heartRate: 0,
    spo2: 0,
    temperature: 0,
    lastUpdated: null,
  },
  
  // Emergency status
  emergency: {
    isActive: false,
    lastTriggered: null,
    location: null,
  },
  
  // Actions
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  
  // Update vitals
  updateVitals: (newVitals) => 
    set((state) => ({
      vitals: {
        ...state.vitals,
        ...newVitals,
        lastUpdated: new Date().toISOString(),
      },
    })),
    
  // Emergency actions
  triggerEmergency: (location) => 
    set({
      emergency: {
        isActive: true,
        lastTriggered: new Date().toISOString(),
        location,
      },
    }),
    
  resolveEmergency: () => 
    set({
      emergency: {
        isActive: false,
        lastTriggered: null,
        location: null,
      },
    }),
}));

export default useStore;
