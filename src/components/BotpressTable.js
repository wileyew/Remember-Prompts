import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable } from 'react-table';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const cleanEmail = (email) => {
  if (!email) return '';  // Safeguard against undefined emails
  const trimmedEmail = email.trim();
  const emailMatch = trimmedEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+/);
  return emailMatch ? emailMatch[0].toLowerCase() : '';
};

const BotpressTable = () => {
  const { user } = useAuth0();
  const [originalData, setOriginalData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('allReports');
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [category, setCategory] = useState('hallucinations');

  useEffect(() => {
    const fetchDataFromDatabase = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5001/reported-prompts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const dataArray = Array.isArray(data) ? data : data.documents || [];
        const transformedData = dataArray.map(data => ({
          ...data,
          prompt: JSON.stringify(data.prompt) || 'N/A',
          hallucinationAnswer: JSON.stringify(data.hallucination_answer) || 'N/A',
          answerUpdated: JSON.stringify(data.answer_updated) || 'N/A',
          versionChatbotHallucinationAnswer: JSON.stringify(data.version_chatbot_hallucination_answer) || 'N/A',
          chatbotPlatform: JSON.stringify(data.chatbot_platform) || 'N/A',
          updatedPromptAnswer: JSON.stringify(data.updated_prompt_answer) || 'N/A',
          promptTrigger: JSON.stringify(data.prompt_trigger) || 'N/A',
          keywordSearch: JSON.stringify(data.keyword_search) || 'N/A',
          privacy: JSON.stringify(data.privacy || '').toLowerCase().includes("public") ? "Public" : "Private",
          email: cleanEmail(data.email),
          name: JSON.stringify(data.name) || 'N/A',
          copyrightAnswer: JSON.stringify(data.copyrightAnswer) || 'N/A',
          dataSource: JSON.stringify(data.dataSource) || 'N/A',
          securityImpact: JSON.stringify(data.security_impact) || 'N/A',
          securityIncidentRisk: JSON.stringify(data.security_incident_risk) || 'N/A',
          privacyRequested: JSON.stringify(data.privacy_requested) || 'N/A',
          category: (JSON.stringify(data.category) || '').replace(/"/g, '').toLowerCase(),
          upvotes: data.upvotes || 0
        }));
        setOriginalData(transformedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, []);

  useEffect(() => {
    const filteredData = originalData.filter(item =>
      (searchQuery === '' || Object.values(item).some(value =>
        (value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false)))
      && (category === 'all' || item.category === category)
    );

    setTableData(filteredData);
  }, [originalData, searchQuery, category]);

  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleUpvote = useCallback((id) => {
    setOriginalData(currentData =>
      currentData.map(item =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
  }, []);

  const columns = useMemo(() => [
    { Header: 'Prompt', accessor: 'prompt' },
    { Header: 'Category', accessor: 'category' },
    { Header: 'Upvotes', accessor: 'upvotes', Cell: ({ row }) => (
        <button onClick={() => handleUpvote(row.original.id)}>{row.values.upvotes}</button>
      )
    }
  ], [handleUpvote]);

  const tableInstance = useTable({ columns, data: tableData });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="botpress-table-container" style={{ marginTop: '20px', maxWidth: '98%', margin: '20px auto', overflowX: 'auto' }}>
      <h2>Reported Prompts</h2>
      <div className="tab-buttons">
        <button className={activeTab === 'allReports' ? 'active' : ''} onClick={() => setActiveTab('allReports')}>
          All Public Reports
        </button>
        <button className={activeTab === 'myReports' ? 'active' : ''} onClick={() => setActiveTab('myReports')}>
          My Reports
        </button>
      </div>
      <div>
        <select onChange={handleCategoryChange} value={category}>
          <option value="all">All Categories</option>
          <option value="hallucinations">Hallucinations</option>
          <option value="copyright">Copyright</option>
          <option value="security">Security Issues</option>
        </select>
      </div>
      <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange} />
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
            return (
              <tr {...row.getRowProps()} onClick={() => setHighlightedRow(index)} style={{ backgroundColor: highlightedRow === index ? '#EEE' : 'inherit' }}>
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
  // Options for handling authentication, redirecting, etc.
});
