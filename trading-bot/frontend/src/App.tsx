import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Portfolio from './components/Portfolio/Portfolio';
import Trading from './components/Trading/Trading';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App min-h-screen bg-gray-50">
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Navbar />
                    <main className="flex-1 ml-64">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/trading" element={<Trading />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </div>
    </Provider>
  );
}

export default App;
