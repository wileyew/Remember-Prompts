import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";
import "../../src/index.css";

const botpressid = botpress.botId;
const clientId = botpress.clientId;

function BotpressChatbot() {
  const { user } = useAuth0();
  const [showChatbot, setShowChatbot] = useState(true);
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState('hallucinations');
  const [sliderChecked, setSliderChecked] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    const widgetContainer = document.getElementById('bp-web-widget-container');
    if (widgetContainer) {
      widgetContainer.style.display = sliderChecked ? 'block' : 'none'; 
    }
  
    if (sliderChecked) {
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
  }, [sliderChecked, user]); 

  useEffect(() => {
    const bpWidgetBtn = document.querySelector('.bpw-widget-btn.bpw-floating-button.bpw-anim-undefined');
    if (bpWidgetBtn) {
      bpWidgetBtn.style.display = sliderChecked ? 'block' : 'none';
    }
  }, [sliderChecked]);

  const formFields = {
    hallucinations: [
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'versionChatbot', label: 'Version' },
      { name: 'prompt', label: 'Prompt' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer' },      { name: 'dataSource', label: 'Data Source' },
      { name: 'justification', label: 'Reason for Hallucination (if not known then leave empty)' },
      {name: 'privacy', label: 'Submit Report Privately? If not checked, we will assume this is a public report and will only be shown in My Reports AND all reports.', type: 'checkbox'}
    ],
    copyright: [
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'versionChatbot', label: 'Version' },
      { name: 'infringementPrompt', label: 'Infringement Prompt' },
      { name: 'copyrightAnswer', label: 'Copyright Answer' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'justification', label: 'Reason for Copyright Infringement' }
    ],
    security: [
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'versionChatbot', label: 'Version' },
      { name: 'prompt', label: 'Prompt' },
      { name: 'securityImpact', label: 'Security Impact' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'justification', label: 'Why is this a security issue?' }

    ],
    memory: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'versionChatbot', label: 'Version' },
      { name: 'promptAnswer', label: 'Prompt Answer' },
      { name: 'promptTrigger', label: 'Trigger for Recall' },
    ]
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: value,
    }));
  };

  const handleChatbotToggle = () => {
    setSliderChecked(!sliderChecked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5001/insert-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category,
          userEmail: user.email,
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
    setShowConfirmationModal(false);
  };

  const handleCancelSubmit = () => {
    setShowConfirmationModal(false);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormData({}); // Reset form data when category changes
  };

  return (
    <div>
      <h1>Submit a Report</h1>
      <p>Check out the chatbot experience by clicking on the black background with white dialogue button in the bottom right corner. The chatbot is connected to ChatGPT to provide a creative memory recall trigger for prompt or prompt answers that are difficult to remember. For example, to remember George Washington as the first president, chatgpt may give a prompt trigger for washer with a ton on it! Don't want to use the chatbot? No worries, simply click the toggle below and use the form below!</p>
      <label className={`switch ${sliderChecked ? 'active' : ''}`}>
        <input type="checkbox" id="btn-conversations" checked={sliderChecked} onChange={handleChatbotToggle} />
        <span className="slider round"></span>
      </label>
      {sliderChecked}
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
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                />
              ) : (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  rows="5"
                  cols="90"
                  wrap="soft"
                  className="editable-div"
                />
              )}
            </label>
            <br />
          </div>
        ))}

        <button type="submit">Submit</button>
      </form>
      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to submit the form?</p>
            <button onClick={handleConfirmSubmit}>Confirm</button>
            <button onClick={handleCancelSubmit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BotpressChatbot;
