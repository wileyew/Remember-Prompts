import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";

const botpressid = botpress.botId;
const clientId = botpress.clientId;

function BotpressChatbot() {
  const { user } = useAuth0();
  const [showChatbot, setShowChatbot] = useState(false);
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState('hallucinations');

  useEffect(() => {
    if (showChatbot) {
      const script = document.createElement("script");
      script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
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
          hideWidget: false, // Change to false to show the widget
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
              email: user.email,
              name: user.name,
            },
          },
        });
        window.botpressWebChat.onEvent(() => {
          setShowChatbot(false);
        }, ["LIFECYCLE.UNLOADED"]);

      
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
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showChatbot, user]); // Include 'user' in the dependency array

  const handleChatbotToggle = () => {
    setShowChatbot(!showChatbot);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // const response = await fetch('http://localhost:5001/reported-prompts');

    try {
      const response = await fetch('http://localhost:5001/insert-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category,
          userId: user.sub, // Assuming you want to include some user identifier
        }),
      });
      if (response.ok) {
        console.log("Form submitted successfully");
      } else {
        console.error("Form submission failed with status: ", response.status);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormData({}); // Reset form data when category changes
  };

  const handleChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  };

  const formFields = {
    hallucinations: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer' },
      { name: 'versionChatbotHallucinationAnswer', label: 'Version' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer' },
      { name: 'promptTrigger', label: 'Trigger' },
      { name: 'keywordSearch', label: 'Keyword Search' }
    ],
    copyright: [
      { name: 'infringementPrompt', label: 'Infringement Prompt' },
      { name: 'copyrightAnswer', label: 'Copyright Answer' },
      { name: 'dataSource', label: 'Data Source' }
    ],
    security: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'securityImpact', label: 'Security Impact' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'keywordSearch', label: 'Keyword Search' }
    ],
    memory: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'promptTrigger', label: 'Trigger for Recall' }
    ]
  };

  return (

    <div>
          <div>
      <label className="switch"> {/* Use className instead of class */}
        <input type="checkbox" id="btn-conversations" onClick={handleChatbotToggle} /> {/* Closing input tag */}
        {showChatbot && <div id="botpress-chatbot"></div>}
        <span className="slider round"></span> {/* Use className instead of class */}
      </label>
    </div>
      <p> Not interested in the chatbot experience? No worries! You can always submit a report below. </p>
      <h1>Submit a Report</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Category:
          <select name="category" value={category} onChange={handleCategoryChange}>
            <option value="hallucinations">Hallucinations</option>
            <option value="copyright">Copyright</option>
            <option value="security">Security Issues</option>
            <option value="memory">Memory Recall</option>
          </select>
        </label>

        {formFields[category].map(field => (
          <div key={field.name}>
            <label>
              {field.label}:
              <input
                className="form-control"
                type="text"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
              />
            </label>
            <br />
          </div>
        ))}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default BotpressChatbot;
//use this code and insert the same into dynamic form code
// import React, { useEffect, useState } from "react";
// import botpress from "../botpress.json";
// import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
// import history from '../utils/history'; 

// const botpressid = botpress.botId;
// const clientId = botpress.clientId;

// function BotpressChatbot() {
//   const { user } = useAuth0();
//   const [showChatbot, setShowChatbot] = useState(false);

//   useEffect(() => {
//     if (showChatbot) {
//       const script = document.createElement("script");
//       script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
//       script.async = true;
//       script.onload = () => {
//         window.botpressWebChat.init({
//           botId: botpressid,
//           hostUrl: "https://cdn.botpress.cloud/webchat/v0",
//           messagingUrl: "https://messaging.botpress.cloud",
//           clientId: clientId,
//           botName: "Remember Prompts",
//           // Set the width of the WebChat container and layout to 100% (Full Screen)
//           containerWidth: "100%25",
//           layoutWidth: "100%25",
//           outerHeight: "50%25",
//           innerHeight: "50%25",
//           // Hide the widget and disable animations
//           hideWidget: false, // Change to false to show the widget
//           disableAnimations: true,
//           // stylesheet: 'https://style-.....a.vercel.app/bot.css',
//         });
//         window.botpressWebChat.onEvent(() => {
//           window.botpressWebChat.sendEvent({ type: "show" });
//         }, ["LIFECYCLE.LOADED"]);
//         window.botpressWebChat.init({
//           type: "text",
//           channel: "web",
//           payload: {
//             // Ensure this structure matches what your Botpress bot expects
//             text: 'SET_USER_DATA', // Assuming 'text' is how you distinguish payload types in your Botpress setup
//             userData: {
//               email: user.email,
//               name: user.name,
//             },
//           },
//         });
      
//         const btnConvoAdd = document.getElementById('btn-convo-add');
//         if (btnConvoAdd) {
//           console.log('button clicked');
//           btnConvoAdd.addEventListener('click', () => {
//             setTimeout(() => {
//               window.botpressWebChat.sendPayload({
//                 type: 'text',
//                 text: 'Hello, ' + user.name + ',' + ' ' + 'starting your session associated with the email ' + user.email + '.',
//               });
//             }, 2000);
//           });
//         }
//       };

//       document.body.appendChild(script);

//       return () => {
//         document.body.removeChild(script);
//       };
//     }
//   }, [showChatbot, user]); // Include 'user' in the dependency array

//   const handleChatbotToggle = () => {
//     setShowChatbot(!showChatbot);
//   };

//   return (
//     <div>
//       <label className="switch"> {/* Use className instead of class */}
//         <input type="checkbox" id="btn-conversations" onClick={handleChatbotToggle} /> {/* Closing input tag */}
//         {showChatbot && <div id="botpress-chatbot"></div>}
//         <span className="slider round"></span> {/* Use className instead of class */}
//       </label>
//     </div>
//   );
// }

// export default BotpressChatbot;