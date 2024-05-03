import React, { useState } from 'react';

const DynamicForm = ({ onSave }) => {
  const [category, setCategory] = useState('hallucinations');
  const [formData, setFormData] = useState({});

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormData({}); // Reset form data when category changes
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
          <label key={field.name}>
            {field.label}:
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
            />
          </label>
        ))}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DynamicForm;
