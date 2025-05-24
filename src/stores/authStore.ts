
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}

export interface Organization {
  id: string;
  name: string;
  adminId: string;
  members: string[];
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    organizationType: 'new' | 'join';
    organizationName?: string;
    inviteCode?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Mock data for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@company.com',
    password: 'admin123',
    name: 'John Admin',
    role: 'admin',
    organizationId: 'org1',
    organizationName: 'TechCorp Inc'
  },
  {
    id: '2',
    email: 'manager@company.com',
    password: 'manager123',
    name: 'Sarah Manager',
    role: 'manager',
    organizationId: 'org1',
    organizationName: 'TechCorp Inc'
  },
  {
    id: '3',
    email: 'member@company.com',
    password: 'member123',
    name: 'Mike Member',
    role: 'member',
    organizationId: 'org1',
    organizationName: 'TechCorp Inc'
  }
];

const mockOrganizations: Organization[] = [
  {
    id: 'org1',
    name: 'TechCorp Inc',
    adminId: '1',
    members: ['1', '2', '3'],
    createdAt: new Date().toISOString()
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      organizations: mockOrganizations,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({
            user: userWithoutPassword,
            token: 'mock-jwt-token',
            isAuthenticated: true
          });
          return true;
        }
        return false;
      },

      register: async (userData) => {
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          return false;
        }

        let organizationId: string;
        let organizationName: string;

        if (userData.organizationType === 'new') {
          organizationId = `org${Date.now()}`;
          organizationName = userData.organizationName || 'My Organization';
          
          const newOrg: Organization = {
            id: organizationId,
            name: organizationName,
            adminId: `user${Date.now()}`,
            members: [`user${Date.now()}`],
            createdAt: new Date().toISOString()
          };

          set(state => ({
            organizations: [...state.organizations, newOrg]
          }));
        } else {
          const org = get().organizations.find(o => o.id === userData.inviteCode);
          if (!org) {
            return false;
          }
          organizationId = org.id;
          organizationName = org.name;
        }

        const newUser: User = {
          id: `user${Date.now()}`,
          email: userData.email,
          name: userData.name,
          role: userData.organizationType === 'new' ? 'admin' : 'member',
          organizationId,
          organizationName
        };

        mockUsers.push({ ...newUser, password: userData.password });

        set({
          user: newUser,
          token: 'mock-jwt-token',
          isAuthenticated: true
        });

        return true;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      updateUser: (user: User) => {
        set({ user });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
