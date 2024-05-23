import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";

const DynamicForm = ({ onSave }) => {
  
  const [category, setCategory] = useState('hallucinations');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // State to toggle chatbot
  const { user } = useAuth0(); // Get user information from Auth0

  const userId = user.sub;
  const botpressid = botpress.botId;; // Replace with your Botpress bot ID
  const clientId = botpress.clientId; // Replace with your client ID

  useEffect(() => {
    if (showChatbot) {
      const script = document.createElement("script");
      script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
      script.async = true;
      script.onload = () => {
        console.log("Botpress script loaded.");
        window.botpressWebChat.init({
          botId: botpressid,
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
        window.botpressWebChat.onEvent(() => {
          window.botpressWebChat.sendEvent({ type: "show" });
        }, ["LIFECYCLE.LOADED"]);
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

        const btnConvoAdd = document.getElementById('btn-convo-add');
        if (btnConvoAdd) {
          btnConvoAdd.addEventListener('click', () => {
            setTimeout(() => {
              window.botpressWebChat.sendPayload({
                type: 'text',
                text: `Hello, ${user.name}, starting your session associated with the email ${user.email}.`,
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

  const handleChatbotToggle = () => {
    setShowChatbot(!showChatbot);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormData({}); // Reset form data when category changes
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const errors = {};
    formFields[category].forEach((field) => {
      if (!formData[field.name]) {
        errors[field.name] = `${field.label} is required.`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      console.log('user information ' + userId);
      const dataToSubmit = {
        ...formData,
        userId: userId, // Include user ID in the form data
        category: category // Include category in the form data
      };
      fetch('http://localhost:5001/insert-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Form data submitted successfully:', data);
          setIsSubmitting(false);
          setFormData({});
        })
        .catch((error) => {
          console.error('Error submitting form data:', error);
          setIsSubmitting(false);
        });
    } else {
      console.log('Form has errors. Not submitting.');
    }
  };

  // Define form fields for each category
  const formFields = {
    hallucinations: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer' },
      { name: 'versionChatbotHallucinationAnswer', label: 'Version' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer' },
      { name: 'promptTrigger', label: 'Trigger' },
      { name: 'keywordSearch', label: 'Keyword Search' },
    ],
    copyright: [
      { name: 'infringementPrompt', label: 'Infringement Prompt' },
      { name: 'copyrightAnswer', label: 'Copyright Answer' },
      { name: 'dataSource', label: 'Data Source' },
    ],
    security: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'securityImpact', label: 'Security Impact' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk' },
      { name: 'dataSource', label: 'Data Source' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'keywordSearch', label: 'Keyword Search' },
    ],
    memory: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'promptTrigger', label: 'Trigger for Recall' },
    ],
  };

  return (
    <div>
      <h1>Submit a Report</h1>
      <button onClick={handleChatbotToggle}>
        {showChatbot ? 'Hide Chatbot' : 'Show Chatbot'}
      </button>
      
      <form onSubmit={handleFormSubmit}>
        <label>
          Category:
          <select name="category" value={category} onChange={handleCategoryChange}>
            <option value="hallucinations">Hallucinations</option>
            <option value="copyright">Copyright</option>
            <option value="security">Security Issues</option>
            <option value="memory">Memory Recall</option>
          </select>
        </label>

        {formFields[category].map((field) => (
          <div key={field.name}>
            <label>
              {field.label}:
              <textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                rows="4"
                cols="50"
                wrap="soft"
                className="form-control"
              />
            </label>
            {formErrors[field.name] && <div style={{ color: 'red' }}>{formErrors[field.name]}</div>}
          </div>
        ))}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;
