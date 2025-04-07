import { A, Router } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, onMount } from "solid-js";
import styles from "./App.module.scss";
import Chat from "./components/Chat";
import BackofficePage from "./pages/BackofficePage";

const App: Component = () => {
  const [currentPath, setCurrentPath] = createSignal(window.location.pathname);

  onMount(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  });

  return (
    <div class={styles.app}>
      <nav class={styles.nav}>
        <A
          href="/"
          class={styles.link}
          activeClass={styles.active}
          onClick={() => setCurrentPath("/")}
        >
          Chat
        </A>
        <A
          href="/backoffice"
          class={styles.link}
          activeClass={styles.active}
          onClick={() => setCurrentPath("/backoffice")}
        >
          Backoffice
        </A>
      </nav>
      <main class={styles.main}>
        {currentPath() === "/" && <Chat />}
        {currentPath() === "/backoffice" && <BackofficePage />}
      </main>
    </div>
  );
};

const RoutedApp: Component = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default RoutedApp;
