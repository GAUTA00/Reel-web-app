import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/Authcontext'; // ✅ import this

function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* ✅ Wrap all routes in AuthProvider */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
