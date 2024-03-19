// import React, { useEffect } from 'react';
// import botpress from "../botpress.json";
// import Botpress from 'botpress';

// const botpressid = botpress.botId;
// const clientId = botpress.clientId;
// const hostUrl = botpress.host;
// const messaging = botpress.messagingUrl;

// const BotpressChatbot = () => {

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdn.botpress.cloud/webchat/v0/inject.js';
//     <script>window.botpressWebChat.init({});</script>;

//     script.async = true;
//     script.onload = () => {
//       window.botpressWebChat.init({
//         botId: botpressid,
//             hostUrl: hostUrl,
//             messagingUrl: messaging,
//             clientId: clientId,
//                 botName: 'Remember Prompts',
//                 hideWidget: true,
//                 disableAnimations:false,
//                 //stylesheet: 'https://style-.....a.vercel.app/bot.css',
//       });
//                 window.botpressWebChat.onEvent(() => {
//                 window.botpressWebChat.sendEvent({ type: 'show' });
//             }, ['LIFECYCLE.LOADED']);
//     }
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return (
//     <div>
//       {/* <Container >
//         <Row>
//           <Col className="bg-light" lg={9}>
//             <div id="bp-web-widget-container" />
//           </Col>
//           <Col className="bg-dark" lg={3} />
//         </Row>
//       </Container> */}
//     </div>
//   );
//   // useEffect(() => {
//   //   const botpress = new Botpress({
//   //     botId: botpressid,
//   //     hostUrl: hostUrl,
//   //     messagingUrl: messaging,
//   //     clientId: clientId,
//   //   });

//   //   botpress.init();

//   //   botpress.on('message', (message) => {
//   //    'Type anything to get started!'
//   //   });

//   //   return () => {
//   //     botpress.destroy();
//   //   };
//   // }, []);

//   // return (
//   //   <div>
//   //     <BotpressWidget botpress={botpress} />
//   //   </div>
//   // );
// };
// export default BotpressChatbot;
"use client";

import React, { useEffect } from "react";
import botpress from "../botpress.json";

const botpressid = botpress.botId;
const clientId = botpress.clientId;

function BotpressChatbot() {
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
      });    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <></>;
}

export default BotpressChatbot;