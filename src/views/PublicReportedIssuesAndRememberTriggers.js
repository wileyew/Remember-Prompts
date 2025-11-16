import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import BotpressTable from "../components/BotpressTable";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import axios from 'axios'; // Import axios

export const PublicReportedIssuesAndRememberTriggers = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchDataFromDatabase();
  }, []);

  const fetchDataFromDatabase = async () => {
    try {
      const response = await axios.post(
        'https://data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
        {
          collection: 'prompts',
          database: 'userprompts',
          dataSource: 'RememberPrompt',
          filter: {},
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE',
          },
        }
      );
      const data = response.data;
      console.log('Data retrieved in view:', data);

      // Assuming 'data' contains the array of documents you want to display
      // Ensure data.documents is an array and default to an empty array if it's not available
      setTableData(Array.isArray(data.documents) ? data.documents : []); 
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Reported Prompts</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name/Prompt</th> {/* Adjusted for clarity */}
            <th>Age</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody>
          {tableData.map((doc, index) => (
            <tr key={index}>
              <td>{doc._id}</td>
              {/* Handling documents with either 'name' or 'prompt' field */}
              <td>{doc.name || doc.prompt}</td>
              {/* Handling missing 'age' field by displaying a default message or value */}
              <td>{doc.age || 'N/A'}</td>
              {/* Render additional fields here */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default withAuthenticationRequired(PublicReportedIssuesAndRememberTriggers, {
  onRedirecting: () => <Loading />,
});
