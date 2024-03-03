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
      script.onload = async () => { // Marked as async if you need to perform async operations inside
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

        window.botpressWebChat.onEvent((event) => {
          // setTimeout(() => {
          //   window.botpressWebChat.sendPayload({
          //     type: 'text', // Assuming 'text' is a recognized type for text messages
          //     text: 'Starting your session  ' + user.name + ', '+ ' ' + 'the email associated with your account is ' + ' ' + user.email + ' ' + ', type anything to continue!', // The message you want to send
          //   });
          // }, 6000)

          // Delay sending the payload by 6000 milliseconds (6 seconds)
          setTimeout(() => {
            window.botpressWebChat.sendPayload({
              type: 'event',
              name: 'SET_USER_DATA',
              data: {
                email: user.email,
                name: user.name,
              },
            });
          }, 6000)

          if (event.type === "webchatLoaded") {
            console.log("Botpress chatbot loaded.");

            // Delay sending the payload by 6000 milliseconds (6 seconds)
            setTimeout(() => {
              window.botpressWebChat.sendPayload({
                type: 'event',
                name: 'SET_USER_DATA',
                data: {
                  email: user.email,
                  name: user.name,
                },
              });

              window.botpressWebChat.init({
                userData: {
                  user: user.name,
                  email: user.email
                },
              });
            }, 6000);
          }
        }, ["webchatLoaded"]);
        setTimeout(() => {
          window.botpressWebChat.sendPayload({
            type: 'text', // Assuming 'text' is a recognized type for text messages
            text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.', // The message you want to send
          });
        }, 6000);
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    // Execute the async function within useEffect
    initBotpressChat();
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
