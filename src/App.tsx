import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage/ChatPage';
import AuthPage from './pages/Auth/AuthPage';
import CreateProfile from './pages/CreateProfile/CreateProfile';
import { checkProfile } from './utils/checkProfile';
import ProfilePage from './pages/Profile/ProfilePage';
import About from './pages/About/About';
import Support from './pages/Support/Support';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
  };
  getSession();

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event: string, session: Session | null) => {
      setSession(session);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);


  useEffect(() => {
    if (session?.user?.id) {
      checkProfile(session.user.id).then(result => {
        setHasProfile(result);
      });
    }
  }, [session]);

  if (!session) return <AuthPage />;
  if (hasProfile === false) return <CreateProfile />;
  if (hasProfile === null) return <div>Загрузка...</div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-container">
        <Routes>
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
