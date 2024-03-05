import React, { useState, useEffect } from 'react';
import { Client } from '@botpress/client';
import CryptoJS from 'react-native-crypto-js';


const BotpressTable = () => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Correctly initiate the Client instance
  const token = 'bp_pat_Rb3zkaR6ckHH7QNttAXKure07NziWNrId0Ua';
  const workspaceId = '61635aac-6038-42ca-b1a7-9d836bb38116';
  const client = new Client({ token, workspaceId });

  useEffect(() => {
    fetchDataFromDatabase();
  }, []); // Dependency array is empty, meaning this effect runs once on mount

  const fetchDataFromDatabase = async () => {
    try {
      const allBots = [];
      let nextToken;

      do {
        const resp = await client.listBots({ nextToken });
        nextToken = resp.meta.nextToken;
        allBots.push(...resp.bots);
      } while (nextToken);

      // Assuming allBots is the data you want to display
      // If additional processing is needed to fit the tableData structure, do it here
      console.log(allBots);
      setTableData(allBots); // Directly setting allBots as tableData
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTableData = tableData.filter((rowData) =>
    Object.values(rowData).some(
      (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <h2>Reported Prompts</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <table>
        <thead>
          <tr>
            {tableData.length > 0 &&
              Object.keys(tableData[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredTableData.map((rowData, index) => (
            <tr key={index}>
              {Object.values(rowData).map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BotpressTable;
