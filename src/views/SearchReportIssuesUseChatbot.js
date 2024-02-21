import React, { useEffect } from "react";

import Hero from "../components/Hero";
import BotpressChatbot from "../components/BotpressChatbot";
import botpress from "../botpress.json";

const botpressid = botpress.botId;
const clientId = botpress.clientId;

const SearchReportIssuesUseChatbot = () => {
    
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
    
            // Hide the widget and disable animations
            hideWidget: true,
            disableAnimations: true,
            // stylesheet: 'https://style-.....a.vercel.app/bot.css',
          });
          window.botpressWebChat.onEvent(() => {
            window.botpressWebChat.sendEvent({ type: "show" });
          }, ["LIFECYCLE.LOADED"]);
        };
        document.body.appendChild(script);
    
        return () => {
          document.body.removeChild(script);
        };
      }, []);
    
      return <></>;
    }    

export default SearchReportIssuesUseChatbot;
