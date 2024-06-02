import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";
import DOMPurify from 'dompurify';

const DynamicForm = ({ onSave }) => {
  const { user } = useAuth0(); // Get user information from Auth0
  const [category, setCategory] = useState('hallucinations');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // State to toggle chatbot

  const userEmail = user.email;
  const botpressid = botpress.botId; // Replace with your Botpress bot ID
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
    const sanitizedValue = DOMPurify.sanitize(e.target.value);
    setFormData((prev) => ({ ...prev, [e.target.name]: sanitizedValue }));
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
      const dataToSubmit = {
        ...formData,
        userEmail: userEmail, // Include user ID in the form data
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
      { name: 'prompt', label: 'Prompt', type: 'textarea' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer', type: 'textarea' },
      { name: 'versionChatbotHallucinationAnswer', label: 'Version', type: 'textarea' },
      { name: 'chatbotPlatform', label: 'Platform', type: 'textarea' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer', type: 'textarea' },
      { name: 'promptTrigger', label: 'Trigger', type: 'textarea' },
      { name: 'keywordSearch', label: 'Keyword Search', type: 'textarea' },
    ],
    copyright: [
      { name: 'infringementPrompt', label: 'Infringement Prompt', type: 'textarea' },
      { name: 'copyrightAnswer', label: 'Copyright Answer', type: 'textarea' },
      { name: 'dataSource', label: 'Data Source', type: 'textarea' },
    ],
    security: [
      { name: 'prompt', label: 'Prompt', type: 'textarea' },
      { name: 'securityImpact', label: 'Security Impact', type: 'textarea' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk', type: 'textarea' },
      { name: 'dataSourceSecurity', label: 'Data Source', type: 'textarea' },
      { name: 'chatbotPlatform', label: 'Platform', type: 'textarea' },
      { name: 'keywordSearch', label: 'Keyword Search', type: 'textarea' },
    ],
    memory: [
      { name: 'prompt', label: 'Prompt', type: 'textarea' },
      { name: 'promptTrigger', label: 'Trigger for Recall', type: 'textarea' },
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
            <option value="security">Security Issue</option>
            <option value="memory">Memory Recall</option>
          </select>
        </label>

        {formFields[category].map((field) => (
          <div key={field.name}>
            <label>
              {field.label}:
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  rows="4"
                  cols="50"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                />
              )}
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
