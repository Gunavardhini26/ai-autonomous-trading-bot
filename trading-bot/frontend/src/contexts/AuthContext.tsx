import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  paper_trading_enabled: boolean;
  paper_balance: number;
  created_at: string;
}

interface BrokerConnection {
  id: number;
  broker_name: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('access_token');
        }
      }
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        localStorage.setItem('access_token', data.access_token);
        
        // Get user info
        const userResponse = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
      }
      
      return false;
    } catch (error) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        localStorage.setItem('access_token', data.access_token);
        
        // Get user info
        const userResponse = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed');
      }
      
      return false;
    } catch (error) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
      setError(null);
      
      const response = await authAPI.login({ email, password });
      const { access_token, refresh_token, user: userData } = response;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(userData);
      
      // Connect to WebSocket
      wsService.connect();
      
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    wsService.disconnect();
  };

  const connectBroker = async (brokerData: BrokerConnectionData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await brokerAPI.connect(brokerData);
      
      // Update user with new broker connection
      if (user) {
        setUser({
          ...user,
          connectedBrokers: [...user.connectedBrokers, response.connection]
        });
      }
      
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to connect broker');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectBroker = async (brokerId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await brokerAPI.disconnect(brokerId);
      
      // Update user by removing the broker connection
      if (user) {
        setUser({
          ...user,
          connectedBrokers: user.connectedBrokers.filter(b => b.id !== brokerId)
        });
      }
      
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to disconnect broker');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        connectBroker, 
        disconnectBroker, 
        isLoading, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
