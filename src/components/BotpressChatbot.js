"use client";

import React, { useEffect } from "react";
import botpress from "../botpress.json";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import history from '../utils/history'; 


const botpressid = botpress.botId;
const clientId = botpress.clientId;


function BotpressChatbot() {
  const { user } = useAuth0();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
    <script>window.botpressWebChat.init({});</script>;
    script.async = true;
    script.onload = () => {
      window.botpressWebChat.init({
        botId: botpressid,
        hostUrl: "https://cdn.botpress.cloud/webchat/v0",
        messagingUrl: "https://messaging.botpress.cloud",
        clientId: clientId,
        botName: "Remember Prompts",
        // Set the width of the WebChat container and layout to 100% (Full Screen)
        containerWidth: "100%25",
        layoutWidth: "100%25",
        outerHeight: "50%25",
        innerHeight: "50%25",
        // Hide the widget and disable animations
        hideWidget: true,
        disableAnimations: true,
        // stylesheet: 'https://style-.....a.vercel.app/bot.css',
      });
      window.botpressWebChat.onEvent(() => {
        window.botpressWebChat.sendEvent({ type: "show" });
      }, ["LIFECYCLE.LOADED"]);
      window.botpressWebChat.init({
        type: "text",
        channel: "web",
        payload: {
          // Ensure this structure matches what your Botpress bot expects
          text: 'SET_USER_DATA', // Assuming 'text' is how you distinguish payload types in your Botpress setup
          userData: {
            email: 'Evan',
            name: 'wiley',
          },
        },
      });
    
      const btn = document.getElementById('btn-conversations');
      if (btn) {
        const handleClick = () => {
          history.push('/conversations');
        };
        btn.addEventListener('click', handleClick);
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
        // Cleanup the event listener on component unmount
        return () => btn.removeEventListener('click', handleClick);
      }};
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Add event listener to the button
 

  return <></>;
}

export default BotpressChatbot;