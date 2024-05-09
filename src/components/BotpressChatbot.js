import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";

// Define botpress and history imports here

const botpressid = botpress.botId;
const clientId = botpress.clientId;

function BotpressChatbot() {
  const { user } = useAuth0();
  const [showChatbot, setShowChatbot] = useState(false);
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState('hallucinations'); // Define initial category state

  useEffect(() => {
    // Existing useEffect logic for chatbot initialization
  }, [showChatbot, user]); // Include 'user' in the dependency array

  const handleChatbotToggle = () => {
    setShowChatbot(!showChatbot);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here, e.g., send data to backend
    console.log("Form submitted with data:", formData);
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

  // Define form fields for each category
  const formFields = {
    hallucinations: [
      { name: 'prompt', label: 'Prompt' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer' },
      { name: 'versionChatbotHallucinationAnswer', label: 'Version' },
      { name: 'chatbotPlatform', label: 'Platform' },
      { name: 'updatedPromptAnswer', label: 'Updated Prompt Answer' },
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
      {/* Existing JSX for chatbot */}
      <p> Not interested in the chatbot experience? No worries! You can always submit a report below. </p>
      
      {/* Form for report submission */}
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
        <input class="form-control height-30"
          type="text"
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
        />
      </label>
      <br /> {/* Line break after each input field */}
      
    </div>
  ))}
  <br></br>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default BotpressChatbot;
