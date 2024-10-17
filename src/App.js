import React, { useState, useEffect } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import Loading from "./components/Loading";
import Tutorials from "./components/Tutorials";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Chatbot from "./components/BotpressChatbot";
import Home from "./views/Home";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import SearchReportIssuesUseChatbot from "./views/SearchReportIssuesUseChatbot";
import PublicReportedIssuesAndRememberTriggers from "./views/PublicReportedIssuesAndRememberTriggers";
import ButtonComponent from "./components/ButtonComponent"; // Ensure this is the correct path
import initFontAwesome from "./utils/initFontAwesome";
import BotpressChatbot from "./components/BotpressChatbot";
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';


// Initialize Amplify configuration
Amplify.configure(awsExports);

initFontAwesome();

const App = () => {
  const { user, isLoading, error } = useAuth0();
  
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');

  useEffect(() => {
    // Centralized event listener for navigating to /conversations
    const navigateToConversations = () => {
      history.push('/conversations');
    };
    const btnConvo = document.getElementById('btn-conversations');
    if (btnConvo) {
      btnConvo.addEventListener('click', navigateToConversations);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setMode(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      if (btnConvo) {
        btnConvo.removeEventListener('click', navigateToConversations);
      }
    };
  }, []);

  const onSelectMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  };

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
            <Route path="/remember-prompts" render={() => <Chatbot user={user} />} />
            <Route path="/reported-prompts" component={PublicReportedIssuesAndRememberTriggers} />
            <Route path="/tutorials" component={Tutorials} />
            <Route path="/insert-prompts" component={BotpressChatbot} />
            <Route path="/conversations" component={ButtonComponent} />
          </Switch>
        </Container>
        <Footer mode={mode} />
      </div>
    </Router>
  );
};

// Wrap the App with Authenticator from AWS Amplify
export default App;
