import React, { useState, useEffect } from 'react';

const BotpressTable = () => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataFromDatabase = async () => {
      try {
        const response = await fetch('http://localhost:5001/reported-prompts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Safeguard if 'data' is not directly an array
        // Assuming 'data' is the array; adjust if it's wrapped in an object e.g., data.results
        const dataArray = Array.isArray(data) ? data : (data.documents || []);

        // Filter for public documents, assuming 'privacy: false' indicates public
        const publicData = dataArray.filter(doc => !doc.privacy);
        setTableData(publicData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderValue = (value) => {
    // Check if the value is an object, and if so, stringify it. Otherwise, return the value directly.
    return typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
  };
  return (
    <div>
      <h2>Reported Prompts</h2>
      <table>
        <thead>
          <tr>
            <th>Prompt</th>
            <th>Hallucination Answer</th>
            <th>Answer Updated</th>
            <th>Version Chatbot Hallucination Answer</th>
            <th>Chatbot Platform</th>
            <th>Updated Prompt Answer</th>
            <th>Prompt Trigger</th>
            <th>Keyword Search</th>
            <th>Privacy</th>
            <th>Email</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((doc, index) => (
            <tr key={index}>
              <td>{renderValue(doc.prompt)}</td>
              <td>{renderValue(doc.hallucinationAnswer)}</td>
              <td>{renderValue(doc.answerUpdated || 'N/A')}</td>
              <td>{renderValue(doc.versionChatbotHallucinationAnswer)}</td>
              <td>{renderValue(doc.chatbotPlatform)}</td>
              <td>{renderValue(doc.updatedPromptAnswer)}</td>
              <td>{renderValue(doc.promptTrigger)}</td>
              <td>{renderValue(doc.keywordSearch)}</td>
              <td>{renderValue(doc.privacy ? "Private" : "Public")}</td>
              <td>{renderValue(doc.email)}</td>
              <td>{renderValue(doc.name)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BotpressTable;
