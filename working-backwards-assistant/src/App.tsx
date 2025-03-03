import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { RecoilRoot } from 'recoil';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import LandingPage from './pages/LandingPage';
import InitialThoughtsPage from './pages/InitialThoughtsPage';
import WorkingBackwardsPage from './pages/WorkingBackwardsPage';
import PRFAQPage from './pages/PRFAQPage';
import AssumptionsPage from './pages/AssumptionsPage';
import ExperimentsPage from './pages/ExperimentsPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import TestPage from './pages/TestPage';

// Import components
import Layout from './components/Layout';
import { AdminRoute } from './components/ProtectedRoute';

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
    <AuthProvider>
      <Provider store={store}>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
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
              </Layout>
            </Router>
          </ThemeProvider>
        </RecoilRoot>
      </Provider>
    </AuthProvider>
  );
}

export default App;
