import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";
import "../../src/index.css";

const botpressid = botpress.botId;
const clientId = botpress.clientId;

function BotpressChatbot() {
  const { user } = useAuth0();
  const [showChatbot, setShowChatbot] = useState(false);
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState('hallucinations');
  const [sliderValue, setSliderValue] = useState('off');

  useEffect(() => {
    const widgetContainer = document.getElementById('bp-web-widget-container');
    if (widgetContainer) {
      widgetContainer.style.display = showChatbot ? 'none' : 'block'; 
    }
  
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
  }, [showChatbot, user]); 

  useEffect(() => {
    const bpWidgetBtn = document.querySelector('.bpw-widget-btn.bpw-floating-button.bpw-anim-undefined');
    if (bpWidgetBtn) {
      bpWidgetBtn.classList.toggle('ng-hide', sliderValue === 'off');
    }
  }, [sliderValue]);

  const formFields = {
    hallucinations: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer' },
      { name: 'versionChatbotHallucinationAnswer', label: 'Version' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer' },
      { name: 'promptTrigger', label: 'Trigger' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'justification', label: 'Reason for Hallucination' }
    ],
    copyright: [
      { name: 'infringementPrompt', label: 'Infringement Prompt' },
      { name: 'copyrightAnswer', label: 'Copyright Answer' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'justification', label: 'Reason for Copyright Infringement' }
    ],
    security: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'securityImpact', label: 'Security Impact' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'justification', label: 'Why is this a security issue?' }

    ],
    memory: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'promptAnswer', label: 'Prompt Answer' },
      { name: 'promptTrigger', label: 'Trigger for Recall' },
    ]
  };

  const handleChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChatbotToggle = (e) => {
    setShowChatbot(e.target.value === 'on');
    setSliderValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/insert-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category,
          userId: user.sub,
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

  return (
    <div>
      <h1>Submit a Report</h1>
      <p>Enable our chatbot experience with the radio button below! The chatbot is connected to ChatGPT to provide a creative memory recall trigger for prompt or prompt answers that are difficult to remember. For example, to remember George Washington as the first president, chatgpt may give a prompt trigger for washer with a ton on it! If experiencing issues with removing chatbot icon when slider is not toggled on, simply refresh the page.</p>
      <label>
        <input type="radio" name="botToggle" value="on" checked={sliderValue === 'on'} onChange={handleChatbotToggle} />
        On
      </label>
      <label>
        <input type="radio" name="botToggle" value="off" checked={sliderValue === 'off'} onChange={handleChatbotToggle} />
        Off
      </label>
      {sliderValue === 'on' && (
        <div id="tchat-label" className="tchat-label">
          Your Label Element
        </div>
      )}
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
              <br></br>
              <textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                rows="5"
                cols="90"
                wrap="soft"
                className="editable-div"
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
