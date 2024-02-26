import React, { useState, useEffect } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import PublicReports from "./views/PublicReportedIssuesAndRememberTriggers";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
import SearchReportIssuesUseChatbot from "./views/SearchReportIssuesUseChatbot";
import PublicReportedIssuesAndRememberTriggers from "./views/PublicReportedIssuesAndRememberTriggers";
initFontAwesome();

const App = () => {
  // Detect user's preference at the beginning
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');

  // Update the mode based on user's system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const onSelectMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'dark')
      document.body.classList.add('dark-mode');
    else
      document.body.classList.remove('dark-mode');
  };

  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className={`d-flex flex-column h-100 ${mode}-mode`}>
        <NavBar mode={mode} onSelectMode={onSelectMode} />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact render={(props) => <Home {...props} mode={mode} />} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
            <Route path="/remember-prompts" component={SearchReportIssuesUseChatbot} />
            <Route path="/reported-prompts" component={PublicReportedIssuesAndRememberTriggers} />
          </Switch>
        </Container>
        <Footer mode={mode} />
      </div>
    </Router>
  );
};

export default App;
