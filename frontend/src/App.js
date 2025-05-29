import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';

// Layout Components
import MainLayout from './components/layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Zones from './pages/Zones';
import WorkOrders from './pages/WorkOrders';
import Flights from './pages/Flights';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NetworkProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="zones" element={<Zones />} />
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="flights" element={<Flights />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NetworkProvider>
    </ThemeProvider>
  );
}

export default App;
