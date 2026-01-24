import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";

import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("landing");

  const isDemo = Boolean(localStorage.getItem("demo-user"));

  useEffect(() => {
    if (auth) {
      return onAuthStateChanged(auth, setUser);
    }
  }, []);

  const goToLanding = () => {
    localStorage.removeItem("demo-user");
    setScreen("landing");
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("demo-user");
    setScreen("landing");
  };

  if (user || isDemo) {
    return <Dashboard onHome={goToLanding} onLogout={logout} isDemo={isDemo} />;
  }

  if (screen === "login") {
    return <Login />;
  }

  return (
    <Landing
      onLogin={() => setScreen("login")}
      onDemo={() => {
        localStorage.setItem("demo-user", "true");
        location.reload();
      }}
    />
  );
}
