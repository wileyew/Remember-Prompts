import React, { useMemo, useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const cleanEmail = (email) => {
  const trimmedEmail = email.trim();
  const emailMatch = trimmedEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+/); 
  return emailMatch ? emailMatch[0].toLowerCase() : '';
};

const BotpressTable = () => {
  const { user } = useAuth0();
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('allReports');
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [category, setCategory] = useState('hallucinations'); // State for managing category selection

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
        
                let transformedData = dataArray.map(data => ({
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
                  infringementPrompt: safeReplace(data.infringementPrompt),
                  copyrightAnswer: safeReplace(data.copyrightAnswer),
                  dataSource: safeReplace(data.dataSource)
                })).filter(row => searchQuery === '' || Object.values(row).some(value => value.toLowerCase().includes(searchQuery.toLowerCase())));
                if (searchQuery) {
                  transformedData = transformedData.filter(row =>
                    Object.values(row).some(value => value.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                }

                setTableData(transformedData);
                setIsLoading(false);
              } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
                setIsLoading(false);
              }
            };    

    fetchDataFromDatabase();
  }, [user.email, searchQuery]);

  const columns = useMemo(() => {
    const baseColumns = [
      { Header: 'Prompt', accessor: 'prompt' },
      { Header: 'Hallucination Answer', accessor: 'hallucinationAnswer' },
      { Header: 'Answer Updated', accessor: 'answerUpdated' },
      { Header: 'Version Chatbot Hallucination Answer', accessor: 'versionChatbotHallucinationAnswer' },
      { Header: 'Chatbot Platform', accessor: 'chatbotPlatform' },
      { Header: 'Updated Prompt Answer', accessor: 'updatedPromptAnswer' },
      { Header: 'Prompt Trigger', accessor: 'promptTrigger' },
      { Header: 'Keyword Search', accessor: 'keywordSearch' },
      { Header: 'Privacy', accessor: 'privacy', Cell: ({ value }) => value },
      { Header: 'Email', accessor: 'email', Cell: ({value}) => cleanEmail(value) },
      { Header: 'Name', accessor: 'name' },
    ];

    // Columns that are specific to the "copyright" category
    const copyrightColumns = [
      { Header: 'Infringement Prompt', accessor: 'infringementPrompt' },
      { Header: 'Copyright Answer', accessor: 'copyrightAnswer' },
      { Header: 'Data Source', accessor: 'dataSource' },
    ];
    

    // Append additional columns based on category selection
    if (category === 'copyright') {
      console.log('copyright');
      return [...copyrightColumns];
    }
   
    if (category === 'hallucinations') {
      console.log('hallucinations');
      return [...baseColumns];
    }

    return baseColumns; // Default to baseColumns if no specific category is selected
  }, [category]); // Depend on category state

  
  const handleCategoryChange = (e) => {
    setCategory(e.target.value); // Update category state on dropdown change
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: tableData });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const onRowClick = (rowIndex) => {
    setHighlightedRow(rowIndex);
  };

  const shouldHideRow = (row) => {
    // Destructure to separate privacy and all other properties
    const { privacy, ...otherProps } = row.original;
    console.log(`row: ${JSON.stringify(row.original)}`);

    // Check if all other properties are 'N/A'
    return Object.values(otherProps).every(prop => prop === 'N/A' || '');
  };
  
  
  return (
    <div className="botpress-table-container" style={{ marginTop: '20px', maxWidth: '98%', margin: '20px auto', overflowX: 'auto'}}>
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
      <div>
        <select onChange={handleCategoryChange} value={category}>
          <option value="all">Hallucinations</option>
          <option value="copyright">Copyright</option>
          {/* Add more categories as needed */}
        </select>
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
              <tr
              {...row.getRowProps()}
              onClick={() => onRowClick(index)}
              hidden={shouldHideRow(row)} // Use the shouldHideRow function to conditionally hide rows
              style={{ color: isHighlighted ? 'black' : 'inherit' }}
            >
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