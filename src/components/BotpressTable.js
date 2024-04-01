// import React, { useMemo, useState, useEffect } from 'react';
// import { useTable } from 'react-table';
// import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

// const cleanEmail = (email) => {
//   const trimmedEmail = email.trim();
//   const emailMatch = trimmedEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+/); 
//   return emailMatch ? emailMatch[0].toLowerCase() : '';
// };

// const BotpressTable = () => {
//   const { user } = useAuth0();
//   const [originalData, setOriginalData] = useState([]); // Store the original fetched data
//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState('allReports');
//   const [highlightedRow, setHighlightedRow] = useState(null);
//   const [category, setCategory] = useState('hallucinations'); // State for managing category selection

//   useEffect(() => {
//     const fetchDataFromDatabase = async () => {
//       try {
//         const response = await fetch('http://localhost:5001/reported-prompts');
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
        
//         const dataArray = Array.isArray(data) ? data : data.documents || [];
//         const safeReplace = (value) => typeof value === 'string' ? value.replace(/"/g, '') : 'N/A';
        
//         let transformedData = dataArray.map(data => ({
//           prompt: safeReplace(data.prompt),
//           hallucinationAnswer: safeReplace(data.hallucination_answer),
//           answerUpdated: safeReplace(data.answer_updated),
//           versionChatbotHallucinationAnswer: safeReplace(data.version_chatbot_hallucination_answer),
//           chatbotPlatform: safeReplace(data.chatbot_platform),
//           updatedPromptAnswer: safeReplace(data.updated_prompt_answer),
//           promptTrigger: safeReplace(data.prompt_trigger),
//           keywordSearch: safeReplace(data.keyword_search),
//           privacy: (data.privacy || "").toLowerCase().includes("public") ? "Public" : "Private",
//           email: safeReplace(data.email),
//           name: safeReplace(data.name),
//           infringementPrompt: safeReplace(data.infringementPrompt),
//           copyrightAnswer: safeReplace(data.copyrightAnswer),
//           dataSource: safeReplace(data.dataSource),
//           securityImpact: safeReplace(data.security_impact),
//           securityIncidentRisk: safeReplace(data.security_incident_risk),
//           privacyRequested: safeReplace(data.privacy_requested),
//           keywordSearch: safeReplace(data.keyword_search)
//         })).filter(row => searchQuery === '' || Object.values(row).some(value => value.toLowerCase().includes(searchQuery.toLowerCase())));
        
//         setOriginalData(transformedData); 
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError(error.message);
//         setIsLoading(false);
//       }
//     };    

//     fetchDataFromDatabase();
//   }, [user.email, searchQuery, tableData, category]);

//   useEffect(() => {
//     // Apply filters based on search query and category
//     let filteredData = originalData.filter(item => {
//       const searchCondition = searchQuery === '' || Object.values(item).some(value => value.toString().toLowerCase().includes(searchQuery.toLowerCase()));
//       if (category === 'security') {
//         return searchCondition && item.securityImpact !== 'N/A' && item.securityIncidentRisk !== 'N/A';
//       }
//       return searchCondition; // Apply only search filter for other categories
//     });

//     setTableData(filteredData);
//   }, [originalData, searchQuery, category]); // Re-filter whenever these dependencies change

//   const columns = useMemo(() => {
//     const baseColumns = [
//       { Header: 'Prompt', accessor: 'prompt' },
//       { Header: 'Hallucination Answer', accessor: 'hallucinationAnswer' },
//       { Header: 'Answer Updated', accessor: 'answerUpdated' },
//       { Header: 'Version Chatbot Hallucination Answer', accessor: 'versionChatbotHallucinationAnswer' },
//       { Header: 'Chatbot Platform', accessor: 'chatbotPlatform' },
//       { Header: 'Updated Prompt Answer', accessor: 'updatedPromptAnswer' },
//       { Header: 'Prompt Trigger', accessor: 'promptTrigger' },
//       { Header: 'Keyword Search', accessor: 'keywordSearch' },
//       { Header: 'Privacy', accessor: 'privacy', Cell: ({ value }) => value },
//       { Header: 'Email', accessor: 'email', Cell: ({value}) => cleanEmail(value) },
//       { Header: 'Name', accessor: 'name' },
//     ];

//     // Columns that are specific to the "copyright" category
//     const copyrightColumns = [
//       { Header: 'Infringement Prompt', accessor: 'infringementPrompt' },
//       { Header: 'Copyright Answer', accessor: 'copyrightAnswer' },
//       { Header: 'Data Source', accessor: 'dataSource' },
//     ];

//     const securityColumns = [
//       {Header: 'Prompt', accessor: 'prompt'},
//       {Header: 'Security Impact', accessor: 'securityImpact'},
//       {Header: 'Security Incident Risk', accessor: 'securityIncidentRisk'},
//       { Header: 'Privacy requested', accessor: 'privacyRequested' },
//       { Header: 'Keyword Search', accessor: 'keywordSearch' },
//     ];

//     // Append additional columns based on category selection
//     if (category === 'copyright') {
//       console.log('copyright');
//       return [...copyrightColumns];
//     }

//     if (category === 'security') {
//       console.log('security');
//       return [...securityColumns];
//     }
   
//     if (category === 'hallucinations') {
//       console.log('hallucinations');
//       return [...baseColumns];
//     }

//     return baseColumns; // Default to baseColumns if no specific category is selected
//   }, [category]); // Depend on category state
  
//   const handleCategoryChange = (e) => {
//     setCategory(e.target.value); // Update category state on dropdown change
//   };

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//   } = useTable({ columns, data: tableData });

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
  
//   const onRowClick = (rowIndex) => {
//     setHighlightedRow(rowIndex);
//   };

//   const shouldHideRow = (row) => {
//     // Destructure to separate privacy and all other properties
//     const { privacy, ...otherProps } = row.original;
//     console.log(`row: ${JSON.stringify(row.original)}`);

//     // Check if all other properties are 'N/A'
//     return Object.values(otherProps).every(prop => prop === 'N/A' || '');
//   };
  
//   return (
//     <div className="botpress-table-container" style={{ marginTop: '20px', maxWidth: '98%', margin: '20px auto', overflowX: 'auto'}}>
//       <h2>Reported Prompts</h2>
//       <div className="tab-buttons">
//         <button
//           className={activeTab === 'allReports' ? 'active' : ''}
//           onClick={() => setActiveTab('allReports')}
//         >
//           All Public Reports
//         </button>
//         <button
//           className={activeTab === 'myReports' ? 'active' : ''}
//           onClick={() => setActiveTab('myReports')}
//         >
//           My Reports
//         </button>
//       </div>
//       <div>
//         <select onChange={handleCategoryChange} value={category}>
//           <option value="all">Hallucinations</option>
//           <option value="copyright">Copyright</option>
//           <option value="security">Security Issues</option>
//         </select>
//       </div>
//       <input
//         type="text"
//         placeholder="Search..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//       />
//       <table {...getTableProps()}>
//         <thead>
//           {headerGroups.map(headerGroup => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map(column => (
//                 <th {...column.getHeaderProps()}>{column.render('Header')}</th>
//               ))}
//             </tr>
//           ))}
//         </thead>
       
//         <tbody {...getTableBodyProps()}>
//            {rows.map((row, index) => {
//             prepareRow(row);
//             const isHighlighted = highlightedRow === index;
//             return (
//               <tr
//                 {...row.getRowProps()}
//                 onClick={() => onRowClick(index)}
//                 hidden={shouldHideRow(row)} // Use the shouldHideRow function to conditionally hide rows
//                 style={{ color: isHighlighted ? 'black' : 'inherit' }}
//               >
//                 {row.cells.map(cell => (
//                   <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
//                 ))}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default withAuthenticationRequired(BotpressTable, {
//   // Options for withAuthenticationRequired, if any
// });
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
        let transformedData = dataArray.map(data => ({
          // Your mapping function as previously defined
          // Keeping the transformation logic as before, ensuring data integrity
          prompt: JSON.stringify(data.prompt) || 'N/A',
          hallucinationAnswer: JSON.stringify(data.hallucination_answer) || 'N/A',
          answerUpdated: JSON.stringify(data.answer_updated) || 'N/A',
          versionChatbotHallucinationAnswer: JSON.stringify(data.version_chatbot_hallucination_answer) || 'N/A',
          chatbotPlatform: JSON.stringify(data.chatbot_platform) || 'N/A',
          updatedPromptAnswer: JSON.stringify(data.updated_prompt_answer) || 'N/A',
          promptTrigger: JSON.stringify(data.prompt_trigger) || 'N/A',
          keywordSearch: JSON.stringify(data.keyword_search) || 'N/A',
          privacy: (JSON.stringify(data.privacy) || "").toLowerCase().includes("public") ? "Public" : "Private",
          email: JSON.stringify(data.email) || 'N/A',
          name: JSON.stringify(data.name) || 'N/A',
          infringementPrompt: JSON.stringify(data.infringementPrompt) || 'N/A',
          copyrightAnswer: JSON.stringify(data.copyrightAnswer) || 'N/A',
          dataSource: JSON.stringify(data.dataSource) || 'N/A',
          securityImpact: JSON.stringify(data.security_impact) || 'N/A',
          securityIncidentRisk: JSON.stringify(data.security_incident_risk) || 'N/A',
          privacyRequested: JSON.stringify(data.privacy_requested) || 'N/A',
          keywordSearch: JSON.stringify(data.keyword_search) || 'N/A'
        }));
        setOriginalData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, []); // Ensuring data is fetched only once on component mount

  useEffect(() => {
    // Filtering data based on searchQuery and category
    let filteredData = originalData.filter(item => {
      const matchesSearchQuery = searchQuery === '' || Object.values(item).some(value => value.toLowerCase().includes(searchQuery.toLowerCase()));
      // Example category-based filtering logic
      if (category === 'security') {
        return matchesSearchQuery && item.securityImpact && item.securityImpact !== 'N/A';
      }
      // Add more conditions for different categories or return true to include all items by default
      return matchesSearchQuery;
    });
    setTableData(filteredData);
  }, [originalData, searchQuery, category]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const columns = useMemo(() => {
    // Dynamically generate columns based on category
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
    const copyrightColumns = [
        { Header: 'Infringement Prompt', accessor: 'infringementPrompt' },
        { Header: 'Copyright Answer', accessor: 'copyrightAnswer' },
        { Header: 'Data Source', accessor: 'dataSource' },
      ];
  
      const securityColumns = [
        {Header: 'Prompt', accessor: 'prompt'},
        {Header: 'Security Impact', accessor: 'securityImpact'},
        {Header: 'Security Incident Risk', accessor: 'securityIncidentRisk'},
        { Header: 'Privacy requested', accessor: 'privacyRequested' },
        { Header: 'Keyword Search', accessor: 'keywordSearch' },
      ];
    if (category === 'security') {
      return [
        ...securityColumns,
        // Define other security-specific columns...
      ];
    }
    if (category === 'hallucinations') {
        console.log('hallucinations');
        return [...baseColumns];
      }
    // Return base columns as fallback
    return baseColumns;

   }, [category]);

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
          <option value="security">Security Issues</option>
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
