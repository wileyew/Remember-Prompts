import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import botpress from "../botpress.json";
import "../index.css";
import { jsPDF } from "jspdf";
import DOMPurify from 'dompurify';
import { getConfig } from "../config";
import AWS from 'aws-sdk';

const botpressid = botpress.botId;
const clientId = botpress.clientId;

const encryptEmail = async (email) => {
  const kms = new AWS.KMS({ region: 'us-east-1' });
  const params = {
    KeyId: 'alias/overflowpromptsemailencryption',
    Plaintext: email
  };

  try {
    const data = await kms.encrypt(params).promise();
    return data.CiphertextBlob.toString('base64');
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
};

function BotpressChatbot() {
  const { user } = useAuth0();
  const [processedFormData, setProcessedFormData] = useState({});
  const [showChatbot, setShowChatbot] = useState(true);
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState('hallucinations');
  const [sliderChecked, setSliderChecked] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCertificateSuccessModal, setShowCertificateSuccessModal] = useState(false);
  const [requestCertificate, setRequestCertificate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      script.onload = async () => {
        const encryptedEmail = await encryptEmail(user.email);

        if (!encryptedEmail) {
          console.error("Failed to encrypt email. Chatbot initialization aborted.");
          return;
        }

        window.botpressWebChat.init({
          botId: botpressid,
          composerPlaceholder: "Say anything to start the conversation! If you are revisiting an old session, you will need to start a new one. Click three box icon and then click plus icon.",
          botConversationDescription: "assists with reporting hallucinations, copyrights, memory aid for prompts, or security issues",
          hostUrl: "https://cdn.botpress.cloud/webchat/v0",
          messagingUrl: "https://messaging.botpress.cloud",
          clientId: clientId,
          botName: "Overflow Prompts",
          containerWidth: "100%25",
          layoutWidth: "100%25",
          outerHeight: "50%25",
          innerHeight: "50%25",
          hideWidget: false,
          disableAnimations: true,
        });

        window.botpressWebChat.sendEvent({
          type: "text",
          channel: "web",
          payload: {
            text: 'SET_USER_DATA',
            userData: {
              email: encryptedEmail,
              name: user.name,
            },
          },
        });

        window.botpressWebChat.onEvent(() => {
          setShowChatbot(false);
        }, ["LIFECYCLE.UNLOADED"]);

        const btnConvoAdd = document.getElementById('btn-convo-add');
        if (btnConvoAdd) {
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

  const formFields = {
    hallucinations: [
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version', tooltip: 'The version of the chatbot used' },
      { name: 'prompt', label: 'Prompt', tooltip: 'The input given to the chatbot' },
      { name: 'hallucinationAnswer', label: 'Hallucination Answer', tooltip: 'The incorrect answer provided by the chatbot' },
      { name: 'updatedPromptAnswer', label: 'Proposed Correct Answer', tooltip: 'The corrected answer you suggest' },
      { name: 'dataSource', label: 'Data Source', tooltip: 'The source of the correct data' },
      { name: 'justification', label: 'Reason for Hallucination (if not known then leave empty)', tooltip: 'Explanation for why the hallucination occurred' },
      { name: 'toxicity', label: 'Was this a toxic hallucination (if not leave blank)?', tooltip: 'Give a brief explanation of why this is a toxic response.' },
      { name: 'upvotes', label: 'Allow for upvotes by other users?', type: 'checkbox' },
      { name: 'comments', label: 'Allow for comments by other users?', type: 'checkbox' }
    ],
    copyright: [
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version', tooltip: 'The version of the chatbot used' },
      { name: 'infringementPrompt', label: 'Infringement Prompt', tooltip: 'The input that led to copyright infringement' },
      { name: 'copyrightAnswer', label: 'Copyright Answer', tooltip: 'The infringing content provided by the chatbot' },
      { name: 'dataSource', label: 'Data Source', tooltip: 'The source of the original copyrighted material' },
      { name: 'justification', label: 'Reason for Copyright Infringement', tooltip: 'Explanation for why the infringement occurred' },
      { name: 'upvotes', label: 'Allow for upvotes by other users?', type: 'checkbox' },
      { name: 'comments', label: 'Allow for comments by other users?', type: 'checkbox' }
    ],
    security: [
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version', tooltip: 'The version of the chatbot used' },
      { name: 'prompt', label: 'Prompt', tooltip: 'The input given to the chatbot' },
      { name: 'securityImpact', label: 'Security Impact', tooltip: 'The impact of the security issue' },
      { name: 'securityIncidentRisk', label: 'Security Incident Risk', tooltip: 'The risk associated with the security incident' },
      { name: 'dataSource', label: 'Data Source', tooltip: 'The source of the data involved in the security issue' },
      { name: 'justification', label: 'Why is this a security issue?', tooltip: 'Explanation for why this is a security issue' },
      { name: 'upvotes', label: 'Allow for upvotes by other users?', type: 'checkbox' },
      { name: 'comments', label: 'Allow for comments by other users?', type: 'checkbox' }
    ],
    other: [
      { name: 'prompt', label: 'Prompt', tooltip: 'The prompt that created the need to remember the answer' },
      { name: 'chatbotPlatform', label: 'Platform', tooltip: 'The platform where the hallucination occurred' },
      { name: 'versionChatbot', label: 'Version', tooltip: 'The version of the chatbot used' },
      { name: 'promptAnswer', label: 'Prompt Answer', tooltip: 'The answer given by the chatbot which needs memory recall' },
      { name: 'other', label: 'Give a brief explanation of the issue faced', tooltip: 'Explanation for why this does not fit into any other category.' },
      { name: 'upvotes', label: 'Allow for upvotes by other users?', type: 'checkbox' },
      { name: 'comments', label: 'Allow for comments by other users?', type: 'checkbox' }
    ]
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    const sanitizedValue = DOMPurify.sanitize(inputValue);

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = prepareCheckboxData(formData);
    setProcessedFormData(newData);
    setShowConfirmationModal(true);
  };

  const createAndDownloadPdf = () => {
    const certificateNumber = Math.floor(Math.random() * 90000) + 10000;
    const doc = new jsPDF();
    doc.text("Overflow Prompts Certification", 20, 20);
    doc.text(`Name: ${user.name}`, 20, 30);
    doc.text(`Certificate Number: ${certificateNumber}`, 20, 40);
    doc.text("This certificate acknowledges that you are an AI evangelist!", 20, 50);
    doc.text("By submitting this report today, you are helping build a community", 20, 65);
    doc.text("of like-minded individuals that are helping cultivate crowd-sourced", 20, 80);
    doc.text("data modeling feedback. Thank you!", 20, 95);
    doc.save("certificate.pdf");
    setShowCertificateSuccessModal(true);
  };

  const prepareCheckboxData = (formData) => {
    const processedData = { ...formData };
    formFields[category].forEach(field => {
      if (field.type === 'checkbox' && formData[field.name]) {
        if (field.name === 'upvotes') {
          processedData['upvotes'] = 0;
        } else if (field.name === 'downvotes') {
          processedData['downvotes'] = 0;
        } else if (field.name === 'comments') {
          processedData['comments'] = '';
        }
      }
    });
    return processedData;
  };

  const handleConfirmSubmit = async () => {
    try {
      const payload = {
        ...formData,
        ...processedFormData,
        category,
        userEmail: user.email,
      };
      const { apiOrigin, audience } = getConfig();

      const response = await fetch(`${apiOrigin}/reported-prompts`, {
        method: 'POST',
        headers: {
          'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowSuccessModal(true);
        if (requestCertificate) {
          createAndDownloadPdf();
        }
        setFormData({});
        setProcessedFormData({});
      } else if (response.status === 400) {
        setErrorMessage('Bad Request: Please check your data.');
      } else if (response.status === 500) {
        setErrorMessage('Server Error: Please try again later.');
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
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <label className={`switch ${sliderChecked ? 'active' : ''}`}>
        <input type="checkbox" checked={sliderChecked} onChange={() => setSliderChecked(!sliderChecked)} />
        <span className="slider round"></span>
      </label>
      <h5>Want to use the chatbot instead? Click on the icon in the lower right corner of the screen and type anything to get started! Turn off chatbot by clicking slider.</h5>

      <form onSubmit={handleSubmit}>
        <label>
          Category:
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="hallucinations">Hallucinations</option>
            <option value="copyright">Copyright</option>
            <option value="security">Security Issues</option>
            <option value="other">Other</option>
          </select>
        </label>
        {formFields[category].map(field => (
          <div key={field.name} className="form-group">
            {field.type !== 'checkbox' ? (
              <label title={field.tooltip}>{field.label}:
                <textarea 
                  name={field.name} 
                  value={formData[field.name] || ''} 
                  onChange={handleChange} 
                  rows="2"
                  cols="30"
                />
              </label>
            ) : (
              <div>
                <input 
                  type="checkbox" 
                  name={field.name} 
                  checked={formData[field.name] || false} 
                  onChange={handleChange}
                />
                <span style={{ marginLeft: '0.5rem' }}>{field.label}</span>
              </div>
            )}
          </div>
        ))}
        <button type="submit" style={{ marginBottom: '20px' }}>Submit</button>
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
          <button onClick={createAndDownloadPdf} disabled={!requestCertificate}>Download Certificate</button>
          <button onClick={() => setShowSuccessModal(false)}>Close</button>
        </div>
      )}
      {showCertificateSuccessModal && (
        <div className="modal">
          <p>Certificate generated successfully!</p>
          <button onClick={() => setShowCertificateSuccessModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default BotpressChatbot;
