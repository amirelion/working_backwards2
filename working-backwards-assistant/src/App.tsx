import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { RecoilRoot } from 'recoil';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { WorkingBackwardsProvider } from './features/working-backwards/contexts/WorkingBackwardsProvider';
import { Toaster } from 'react-hot-toast';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Import components
import Layout from './components/Layout';
import { AdminRoute } from './components/ProtectedRoute';

// Import pages - using React.lazy for code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const InitialThoughtsPage = React.lazy(() => import('./pages/InitialThoughtsPage'));
const WorkingBackwardsPage = React.lazy(() => import('./pages/WorkingBackwardsPage'));
const PRFAQPage = React.lazy(() => import('./features/prfaq'));
const AssumptionsPage = React.lazy(() => import('./pages/AssumptionsPage'));
const ExperimentsPage = React.lazy(() => import('./pages/ExperimentsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const TestPage = React.lazy(() => import('./pages/TestPage'));

// Error fallback component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ErrorFallback() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      p: 4,
      textAlign: 'center',
    }}>
      <h2>Something went wrong</h2>
      <p>We're sorry, but there was an error loading this page.</p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          background: '#FF9900',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '16px',
        }}
      >
        Reload Page
      </button>
    </Box>
  );
}

// Loading component for Suspense
function LoadingFallback() {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <CircularProgress />
    </Box>
  );
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#232F3E', // Amazon dark blue
    },
    secondary: {
      main: '#FF9900', // Amazon orange
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F8F8',
    },
  },
  typography: {
    fontFamily: '"Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: '#232F3E',
          '&:hover': {
            backgroundColor: '#1A2433',
          },
        },
        containedSecondary: {
          backgroundColor: '#FF9900',
          '&:hover': {
            backgroundColor: '#E88A00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <RecoilRoot>
      <Provider store={store}>
        <AuthProvider>
          <Router>
            <WorkingBackwardsProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/initial-thoughts" element={<InitialThoughtsPage />} />
                      <Route path="/working-backwards" element={<WorkingBackwardsPage />} />
                      <Route path="/prfaq" element={<PRFAQPage />} />
                      <Route path="/assumptions" element={<AssumptionsPage />} />
                      <Route path="/experiments" element={<ExperimentsPage />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                      <Route path="/test" element={<TestPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </Layout>
                <Toaster position="top-right" />
              </ThemeProvider>
            </WorkingBackwardsProvider>
          </Router>
        </AuthProvider>
      </Provider>
    </RecoilRoot>
  );
}

export default App;
