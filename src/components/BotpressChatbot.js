import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";
import "../index.css";
import DOMPurify from 'dompurify';

const botpressid = botpress.botId;
const clientId = botpress.clientId;// Destructuring for easier access

function BotpressChatbot() {
  const { user } = useAuth0();
  const [showChatbot, setShowChatbot] = useState(true);
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState('hallucinations');
  const [sliderChecked, setSliderChecked] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestCertificate, setRequestCertificate] = useState(false);

  // Effect to load and manage the Botpress chat widget script
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
    if (sliderChecked) {
      loadBotpressScript();
    }
    return () => {
      const script = document.getElementById("botpress-script");
      if (script) document.body.removeChild(script);
    };
  }, [sliderChecked, user]);

  // Function to load the Botpress chat widget
  const loadBotpressScript = () => {
    const existingScript = document.getElementById("botpress-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
      script.async = true;
      script.id = "botpress-script";
      script.onload = () => initializeChatbot();
      document.body.appendChild(script);
    }
  };

  // Function to initialize the chat widget with user data
  const initializeChatbot = () => {
    window.botpressWebChat.init({
      botId: "61635aac-6038-42ca-b1a7-9d836bb38116",
      hostUrl: "https://cdn.botpress.cloud/webchat/v0",
      messagingUrl: "https://messaging.botpress.cloud",
      clientId: clientId,
      botName: "Remember Prompts",
      containerWidth: "100%",
      layoutWidth: "100%",
      outerHeight: "50%",
      innerHeight: "50%",
      hideWidget: false,
      disableAnimations: true,
    });

    window.botpressWebChat.sendEvent({
      type: "text",
      channel: "web",
      payload: {
        text: 'SET_USER_DATA',
        userData: {
          email: user.email,
          name: user.name,
        },
      },
    });

    window.botpressWebChat.onEvent(() => {
      window.botpressWebChat.sendEvent({ type: "show" });
    }, ["LIFECYCLE.LOADED"]);
  };

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    const sanitizedValue = DOMPurify.sanitize(inputValue);
    const error = validateInput(sanitizedValue);

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };
  const formFields = {
    hallucinations: [
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version',  tooltip: 'The version of the chatbot used' },
      { name: 'prompt', label: 'Prompt', tooltip: 'The input given to the chatbot' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer', tooltip: 'The incorrect answer provided by the chatbot' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer', tooltip: 'The corrected answer you suggest' },
      { name: 'dataSource', label: 'Data Source', tooltip: 'The source of the correct data' },
      { name: 'justification', label: 'Reason for Hallucination (if not known then leave empty)', tooltip: 'Explanation for why the hallucination occurred' },
      { name: 'toxicity', label: 'Was this a toxic hallucination? If not leave blank.', tooltip: 'Give a brief explanation of why this is a toxic response, which can contain comments or messages that contain harmful, offensive, or inappropriate content. These can include harassment, insults, or any language that could make others feel unwelcome or unsafe (otherwise leave blank.)'},
      {name: 'upvotes', label: 'Allow for upvotes?', type:'checkbox' },
      {name: 'downvotes', label: 'Allow for downvotes?', type:'checkbox' },
      {name: 'comments', label: 'Allow for comments?', type:'checkbox' }
    ],
    copyright: [
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version', tooltip: 'The version of the chatbot used'},
      { name: 'infringementPrompt', label: 'Infringement Prompt', tooltip: 'The input that led to copyright infringement' },
      { name: 'copyrightAnswer', label: 'Copyright Answer', tooltip: 'The infringing content provided by the chatbot' },
      { name: 'dataSource', label: 'Data Source', tooltip: 'The source of the original copyrighted material' },
      { name: 'justification', label: 'Reason for Copyright Infringement', tooltip: 'Explanation for why the infringement occurred' }
    ],
    security: [
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version',  tooltip: 'The version of the chatbot used' },
      { name: 'prompt', label: 'Prompt', tooltip: 'The input given to the chatbot' },
      { name: 'securityImpact', label: 'Security Impact', tooltip: 'The impact of the security issue' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk', tooltip: 'The risk associated with the security incident' },
      { name: 'dataSource', label: 'Data Source', tooltip: 'The source of the data involved in the security issue'  },
      { name: 'justification', label: 'Why is this a security issue?', tooltip: 'Explanation for why this is a security issue' }
    ],
    memory: [
      { name: 'prompt', label: 'Prompt', tooltip: 'The prompt that created the need to remember the answer'  },
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version',  tooltip: 'The version of the chatbot used' },
      { name: 'promptAnswer', label: 'Prompt Answer', tooltip: 'The answer given by the chatbot which  needs memory recall' },
      { name: 'promptTrigger', label: 'Trigger for Recall', tooltip: 'Think of a creative answer to help remember a fact. ' },
    ],
    other: [
      { name: 'prompt', label: 'Prompt', tooltip: 'The prompt that created the need to remember the answer'  },
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version',  tooltip: 'The version of the chatbot used' },
      { name: 'promptAnswer', label: 'Prompt Answer', tooltip: 'The answer given by the chatbot which  needs memory recall' },
      { name: 'other', label: 'Give a brief explanation of the issue faced.', tooltip: 'Give a brief explanation of the issue faced. This will help us understand why this does not fit into the any other category.' },
    ]
  };

  // Validation function for form inputs
  const validateInput = (value) => {
    const patterns = {
      sqlInjection: /(\b(SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER|GRANT|REVOKE)\b|--|;|\/\*|\*\/|')/i,
      xss: /<.*?>/g,
    };
    if (patterns.sqlInjection.test(value)) {
      return "Potential SQL injection detected.";
    }
    if (patterns.xss.test(value)) {
      return "Potential XSS attack detected.";
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  };

  // Confirm form submission
  const handleConfirmSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5001/insert-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category, userEmail: user.email }),
      });
      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({});
        setFormErrors({});
      } else {
        console.error("Form submission failed:", response.status);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    setShowConfirmationModal(false);
  };

  return (
    <div>
      <h1>Submit a Report</h1>
      <label className={`switch ${sliderChecked ? 'active' : ''}`}>
        <input type="checkbox" checked={sliderChecked} onChange={() => setSliderChecked(!sliderChecked)} />
        <span className="slider round"></span>
      </label>

      <form onSubmit={handleSubmit}>
  <label>
    Category:
    <select value={category} onChange={e => setCategory(e.target.value)}>
      <option value="hallucinations">Hallucinations</option>
      <option value="copyright">Copyright</option>
      <option value="security">Security Issues</option>
      <option value="memory">Memory Recall</option>
      <option value="other">Other</option>
    </select>
  </label>
  {/* Mapping over the correct array based on selected category */}
  {formFields[category].map(field => (
    <div key={field.name}>
      <label title={field.tooltip}>{field.label}:
        {field.type !== 'checkbox' ? (
          <textarea 
            name={field.name} 
            value={formData[field.name] || ''} 
            onChange={handleChange} 
            rows="5"
            cols="90"
            wrap="soft"
            className="editable-div"
          />
        ) : (
          <span className="checkbox-label">
            <input 
              type="checkbox" 
              name={field.name} 
              checked={formData[field.name] || false} 
              onChange={handleChange}
            />
            <span style={{ marginLeft: '0.5rem' }}>{field.label}</span>
          </span>
        )}
      </label>
      {formErrors[field.name] && <div style={{ color: 'red' }}>{formErrors[field.name]}</div>}
      <br />
    </div>
  ))}
  <button type="submit">Submit</button>
</form>

      {showConfirmationModal && (
        <div className="modal">
          <p>Are you sure you want to submit the form?</p>
          <button onClick={handleConfirmSubmit}>Confirm</button>
          <button onClick={() => setShowConfirmationModal(false)}>Cancel</button>
        </div>
      )}
      {showSuccessModal && (
        <div className="modal">
          <p>Form submitted successfully!</p>
          <label>
            Request Certificate
            <input type="checkbox" checked={requestCertificate} onChange={e => setRequestCertificate(e.target.checked)} />
          </label>
          <button disabled={!requestCertificate}>Download Certificate</button>
        </div>
      )}
    </div>
  );
}

export default BotpressChatbot;
