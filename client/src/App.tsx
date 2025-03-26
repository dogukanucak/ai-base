import type { Component } from 'solid-js';
import { Router, Route, A } from '@solidjs/router';
import Chat from './components/Chat';
import BackofficePage from './pages/BackofficePage';
import styles from './App.module.scss';

const App: Component = () => {
  return (
    <Router>
      <div class={styles.app}>
        <nav class={styles.nav}>
          <A href="/" class={styles.link} activeClass={styles.active} end>
            Chat
          </A>
          <A href="/backoffice" class={styles.link} activeClass={styles.active}>
            Backoffice
          </A>
        </nav>
        <main class={styles.main}>
          <Route path="/" component={Chat} />
          <Route path="/backoffice" component={BackofficePage} />
        </main>
      </div>
    </Router>
  );
};

export default App; 