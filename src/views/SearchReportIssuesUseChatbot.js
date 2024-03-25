import React, { useEffect } from "react";
import Hero from "../components/Hero";
import BotpressChatbot from "../components/BotpressChatbot";
import botpress from "../botpress.json";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const SearchReportIssuesUseChatbot = () => {
  const { user } = useAuth0();
  console.log('user from browser' + user.email);

  useEffect(() => {
    // Mock async function to demonstrate async/await usage
    const fetchAdditionalUserData = async () => {
      // Simulate fetching additional data
      return new Promise(resolve => setTimeout(() => resolve({ extraData: 'Extra Value' }), 1000));
    };

    const initBotpressChat = async () => {
      const additionalUserData = await fetchAdditionalUserData(); // Await the mock async call
      console.log('Additional user data:', additionalUserData); // Example usage of fetched data

      const script = document.createElement("script");
      script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
      script.async = true;
      script.onload = () => {
        window.botpressWebChat.init({
          botId: botpress.botId,
          hostUrl: "https://cdn.botpress.cloud/webchat/v0",
          messagingUrl: "https://messaging.botpress.cloud",
          clientId: botpress.clientId,
          botName: "Remember Prompts",
          containerWidth: "100%",
          layoutWidth: "100%",
          outerHeight: "50%",
          hideWidget: true,
          disableAnimations: true,
          userData: {
            email: user.email,
            name: user.name,
          },
          stylesheet: 'https://style-.....a.vercel.app/bot.css',
        });

        // Send payload when chatbot is loaded
        setTimeout(() => {
          window.botpressWebChat.sendPayload({
            type: 'text',
            text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.',
          });
        }, 2000); // Adjust the delay as needed
      };

      //   // Send welcome message after a delay
      //   setTimeout(() => {
      //     window.botpressWebChat.sendPayload({
      //       type: 'text',
      //       text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.',
      //     });
      //   }, 2000); // Adjust the delay as needed
      // };

      document.body.appendChild(script);

      // Event listener for new chat session
      window.botpressWebChat.onEvent((event) => {
        if (event.type === "open") {
          console.log("New chat session started.");
          // Send payload for new chat session
          setTimeout(() => {
            window.botpressWebChat.sendPayload({
              type: 'text',
              text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.',
            });
          })
        }
      }, ["open"]);

      return () => {
        document.body.removeChild(script);
      };
    };

    // Execute the async function within useEffect
    initBotpressChat();
    const btnConvoAdd = document.getElementById('btn-convo-add');
    if (btnConvoAdd) {
      console.log('button clicked');
      btnConvoAdd.addEventListener('click', () => {
        setTimeout(() => {
          window.botpressWebChat.sendPayload({
            type: 'text',
            text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.',
          });
        }, 2000);
      });
    }
  }, [user.email, user.name]);

  return (
    <>
      <Hero />
      <BotpressChatbot />
    </>
  );
};

export default withAuthenticationRequired(SearchReportIssuesUseChatbot, {
  onRedirecting: () => <div>Loading...</div>,
});
