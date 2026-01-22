import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import { useEffect, useState } from "react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("landing");

  const isDemo = Boolean(localStorage.getItem("demo-user"));

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
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

  const resetDemo = () => {
    localStorage.removeItem("demo-user");
    location.reload();
  };

  if (user || isDemo) {
    return (
      <Dashboard
        onHome={goToLanding}
        onLogout={logout}
        isDemo={isDemo}
        onResetDemo={resetDemo}
      />
    );
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
