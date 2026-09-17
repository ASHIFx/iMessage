import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { Navigate , Route , Routes} from "react-router"
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import PageLoader from "./components/PageLoader";

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

   return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
          <Route
            path="/auth"
            element={!authUser ? <AuthPage /> : <Navigate to={"/"} replace />}
          />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App