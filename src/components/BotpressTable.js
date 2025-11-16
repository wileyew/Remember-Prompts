import React, { useState, useEffect } from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

const BotpressTable = () => {
  const { user } = useAuth0();
  const [originalData, setOriginalData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataFromDatabase = async () => {
      try {
        // Update the fetch URL to your Express server's endpoint
        const base = process.env.REACT_APP_API_BASE_URL || '';
        const response = await fetch(`${base}/reported-prompts`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data retrieved:', data);

        setTableData(data.documents || []); // Update state with fetched data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, []); // Dependency array left empty to run effect once after initial render

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="botpress-table-container" style={{ marginTop: '20px', maxWidth: '98%', margin: '20px auto', overflowX: 'auto' }}>
      <h2>Reported Prompts</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name/Prompt</th>
            <th>Age</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody>
          {tableData.map((doc, index) => (
            <tr key={index}>
              <td>{doc._id}</td>
              <td>{doc.name || doc.prompt}</td>
              <td>{doc.age || 'N/A'}</td>
              {/* Render additional fields here */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default withAuthenticationRequired(BotpressTable, {
  // Options for handling authentication, redirecting, etc.
});
