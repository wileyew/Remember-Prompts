import React, { useMemo, useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

// Clean email function defined outside the component
const cleanEmail = (email) => {
  const trimmedEmail = email.trim(); // Remove leading/trailing spaces
  // Match the email pattern; this regex is basic and might need adjustments for specific cases
  const emailMatch = trimmedEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+/); 
  return emailMatch ? emailMatch[0].toLowerCase() : ''; // Return matched email in lowercase
};

const BotpressTable = () => {
  const { user } = useAuth0();
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('allReports');
  const [highlightedRow, setHighlightedRow] = useState(null); // State to track the highlighted row

  useEffect(() => {
    const fetchDataFromDatabase = async () => {
      try {
        const response = await fetch('http://localhost:5001/reported-prompts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        const dataArray = Array.isArray(data) ? data : data.documents || [];
        const safeReplace = (value) => typeof value === 'string' ? value.replace(/"/g, '') : 'N/A';

        const transformedData = dataArray.map(data => ({
          prompt: safeReplace(data.prompt),
          hallucinationAnswer: safeReplace(data.hallucination_answer),
          answerUpdated: safeReplace(data.answer_updated),
          versionChatbotHallucinationAnswer: safeReplace(data.version_chatbot_hallucination_answer),
          chatbotPlatform: safeReplace(data.chatbot_platform),
          updatedPromptAnswer: safeReplace(data.updated_prompt_answer),
          promptTrigger: safeReplace(data.prompt_trigger),
          keywordSearch: safeReplace(data.keyword_search),
          privacy: (data.privacy || "").toLowerCase().includes("public") ? "Public" : "Private",
          email: safeReplace(data.email),
          name: safeReplace(data.name),
        }));

        setTableData(transformedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, [user.email]);

  const onRowClick = (rowIndex) => {
    setHighlightedRow(rowIndex);
  };

  const filteredData = useMemo(() => {
    return tableData.filter(report => {
      if (activeTab === 'myReports') {
        const removePeriodReport = report.email.replace(/^[.\s]+|[.\s]+$/g, "");
        console.log('removing period' + removePeriodReport);
        const removePeriodAuthReport = user.email.replace(/^[.\s]+|[.\s]+$/g, "");
        console.log('removing auth period ' + removePeriodAuthReport);
        return cleanEmail(removePeriodReport) === cleanEmail(removePeriodAuthReport);
      } else { // 'allReports' tab
        return report.privacy === 'Public';
      }
    }).filter(report => {
      return Object.values(report).some(
        value => value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [tableData, searchQuery, activeTab, user.email]);

  const columns = useMemo(() => [
    { Header: 'Prompt', accessor: 'prompt' },
    { Header: 'Hallucination Answer', accessor: 'hallucinationAnswer' },
    { Header: 'Answer Updated', accessor: 'answerUpdated' },
    { Header: 'Version Chatbot Hallucination Answer', accessor: 'versionChatbotHallucinationAnswer' },
    { Header: 'Chatbot Platform', accessor: 'chatbotPlatform' },
    { Header: 'Updated Prompt Answer', accessor: 'updatedPromptAnswer' },
    { Header: 'Prompt Trigger', accessor: 'promptTrigger' },
    { Header: 'Keyword Search', accessor: 'keywordSearch' },
    { Header: 'Privacy', accessor: 'privacy', Cell: ({ value }) => value },
    { Header: 'Email', accessor: 'email', Cell: ({value}) => cleanEmail(value) }, // Display cleaned email
    { Header: 'Name', accessor: 'name' },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: filteredData });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="botpress-table-container">
      <h2>Reported Prompts</h2>
      <div className="tab-buttons">
        <button
          className={activeTab === 'allReports' ? 'active' : ''}
          onClick={() => setActiveTab('allReports')}
        >
          All Public Reports
        </button>
        <button
          className={activeTab === 'myReports' ? 'active' : ''}
          onClick={() => setActiveTab('myReports')}
        >
          My Reports
        </button>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            const isHighlighted = highlightedRow === index;
            return (
              <tr {...row.getRowProps()} onClick={() => onRowClick(index)} style={{ color: isHighlighted ? 'black' : 'inherit' }}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default withAuthenticationRequired(BotpressTable, {
  // Options for withAuthenticationRequired, if any
});
