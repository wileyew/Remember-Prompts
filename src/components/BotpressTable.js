import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable } from 'react-table';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import "../../src/index.css"; // Import the CSS file for styling

const cleanEmail = (email) => {
  if (!email) return '';
  const trimmedEmail = email.trim();
  const emailMatch = trimmedEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+/);
  return emailMatch ? emailMatch[0].toLowerCase() : '';
};

const removeQuotesAndSlashes = (text) => {
  return typeof text === 'string' ? text.replace(/[\\"]/g, '') : 'N/A';
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
  const [userUpvotes, setUserUpvotes] = useState(new Set()); // Store IDs of upvoted rows by the user
  const [comments, setComments] = useState({}); // Store comments for each row
  const [username, setUsername] = useState(''); // Store the username for comments

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
          chatbotPlatform: removeQuotesAndSlashes(data.chatbotPlatform),
          versionChatbotHallucinationAnswer: removeQuotesAndSlashes(data.versionChatbot),
          prompt: removeQuotesAndSlashes(data.prompt),
          infringementPrompt: removeQuotesAndSlashes(data.infringementPrompt),
          hallucinationAnswer: removeQuotesAndSlashes(data.hallucinationAnswer),
          answerUpdated: removeQuotesAndSlashes(data.updatedPromptAnswer),
          updatedPromptAnswer: removeQuotesAndSlashes(data.updatedPromptAnswer),
          promptTrigger: removeQuotesAndSlashes(data.promptTrigger),
          privacy: removeQuotesAndSlashes(data.privacy || '').toLowerCase().includes("public") ? "Public" : "Private",
          email: cleanEmail(data.email),
          name: removeQuotesAndSlashes(data.name),
          copyrightAnswer: removeQuotesAndSlashes(data.copyrightAnswer),
          dataSource: removeQuotesAndSlashes(data.dataSource),
          securityImpact: removeQuotesAndSlashes(data.security_impact),
          securityIncidentRisk: removeQuotesAndSlashes(data.security_incident_risk),
          privacyRequested: removeQuotesAndSlashes(data.privacyRequested),
          category: removeQuotesAndSlashes(data.category || '').toLowerCase(),
          upvotes: data.upvotes || 0,
          id: data.id  // assuming each data entry has a unique identifier
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
    const filteredData = originalData.filter(item => {
      const matchesSearchQuery = searchQuery === '' || Object.values(item).some(value =>
        (value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false));
      const matchesCategory = category === 'all' || item.category === category;
      const matchesTab = activeTab === 'allReports' || (activeTab === 'myReports' && cleanEmail(item.userEmail).includes(cleanEmail(user.email)));
      return matchesSearchQuery && matchesCategory && matchesTab;
    });

    setTableData(filteredData);
  }, [originalData, searchQuery, category, activeTab, user.email]);

  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleUpvote = useCallback(async (id) => {
    if (!userUpvotes.has(id)) {
      const newUserUpvotes = new Set(userUpvotes).add(id);
      setUserUpvotes(newUserUpvotes);

      try {
        const response = await fetch(`http://localhost:5001/upvote/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: user.email }),
        });

        if (!response.ok) {
          throw new Error('Failed to upvote');
        }

        setOriginalData(currentData =>
          currentData.map(item =>
            item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
          )
        );
      } catch (error) {
        console.error('Error upvoting:', error);
      }
    }
  }, [userUpvotes, user.email]);

  const handleAddComment = useCallback((id, comment) => {
    setComments((prevComments) => ({
      ...prevComments,
      [id]: [...(prevComments[id] || []), { username, comment }],
    }));
  }, [username]);

  const columns = useMemo(() => {
    const baseColumns = [
      { Header: 'Category', accessor: 'category' },
      { Header: 'Upvotes', accessor: 'upvotes', Cell: ({ row }) => (
          <button onClick={() => handleUpvote(row.original.id)} disabled={userUpvotes.has(row.original.id)}>
            {row.values.upvotes}
          </button>
        )
      },
      { Header: 'Comments', accessor: 'comments', Cell: ({ row }) => (
          <div>
            {comments[row.original.id] && comments[row.original.id].map((comment, index) => (
              <div key={index}><strong>{comment.username}</strong>: {comment.comment}</div>
            ))}
            <form onSubmit={(e) => {
              e.preventDefault();
              const comment = e.target.elements.comment.value;
              handleAddComment(row.original.id, comment);
              e.target.reset();
            }}>
              <input type="text" name="comment" placeholder="Add a comment" required />
              <button type="submit">Add</button>
            </form>
          </div>
        )
      }
    ];

    if (category === 'hallucinations') {
      const hallucinationColumns = [
        { Header: 'Platform', accessor: 'chatbotPlatform' },
        { Header: 'Version', accessor: 'versionChatbotHallucinationAnswer' },
        { Header: 'Prompt', accessor: 'prompt' },
        { Header: 'Hallucination Answer', accessor: 'hallucinationAnswer' },
        { Header: 'Proposed Correct Answer', accessor: 'updatedPromptAnswer' },
        { Header: 'Justification', accessor: 'justification' },
        { Header: 'Data Source', accessor: 'dataSource' },
        { Header: 'Trigger', accessor: 'promptTrigger' },
      ];
      return [...baseColumns, ...hallucinationColumns];
    }

    if (category === 'copyright') {
      const hallucinationColumns = [
        { Header: 'Infringement Prompt', accessor: 'infringementPrompt' },
        { Header: 'Copyright Answer', accessor: 'copyrightAnswer' },
        { Header: 'Data Source', accessor: 'dataSource' },
      ];
      return [...baseColumns, ...hallucinationColumns];
    }

    if (category === 'security') {
      const securityColumns = [
        { Header: 'Prompt', accessor: 'prompt' },
        { Header: 'Security Impact', accessor: 'securityImpact' },
        { Header: 'Security Incident Risk', accessor: 'securityIncidentRisk' },
        { Header: 'Data Source', accessor: 'dataSource' },
        { Header: 'Platform', accessor: 'chatbotPlatform' },
        { Header: 'Keyword Search', accessor: 'keywordSearch' },
      ];
      return [...baseColumns, ...securityColumns];
    }

if (category === 'other') {
  const otherColumns = [
   { Header: 'Prompt', accessor: 'prompt' },
    { Header: 'Platform', accessor: 'chatbotPlatform' },
    { Header: 'Version', accessor: 'versionChatbot' },
    { Header: 'Answer', accessor: 'promptAnswer'},
    { Header: 'Explanation', accessor: 'other'},
  ];
  return [...baseColumns, ...otherColumns];
}

    if (category === 'memory') {
      const memoryColumns = [
        { Header: 'Prompt', accessor: 'prompt' },
        { Header: 'Trigger for Recall', accessor: 'prompt_record' },
      ];
      return [...baseColumns, ...memoryColumns];
    }

    return baseColumns;
  }, [handleUpvote, userUpvotes, category, comments, handleAddComment]);

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
      <br />
      <div>
        <select onChange={handleCategoryChange} value={category}>
          <option value="hallucinations">Hallucinations</option>
          <option value="copyright">Copyright</option>
          <option value="security">Security Issues</option>
          <option value="memory">Memory Recall</option>
          <option value="other">Other</option>
        </select>
      </div>
      <br />
      <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange} />
      <br /><br />
      <div>
        <label>
          Username for Comments:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
        </label>
      </div>
      <br /><br />
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