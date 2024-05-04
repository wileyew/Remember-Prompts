import React, { useState } from 'react';

const DynamicForm = ({ onSave }) => {
  const [category, setCategory] = useState('hallucinations');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      fetch('http://your-backend-server-url/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      { name: 'updatedPromptAnswer', label: 'Updated Prompt Answer' },
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
              <input
                type="text"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
              />
            </label>
            {formErrors[field.name] && <div style={{ color: 'red' }}>{formErrors[field.name]}</div>}
          </div>
        ))}

        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  );
};

export default DynamicForm;
