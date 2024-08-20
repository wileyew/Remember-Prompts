import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import "../../src/index.css"; // Import the CSS file for styling
import { useTable, usePagination } from 'react-table';
import { getConfig } from "../config";
import AWS from 'aws-sdk';
import { Buffer } from 'buffer';

// Function to replace HTML entities
const replaceHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&#x2F;/g, '//')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, '"')
    .replace(/&quot;/g, '"');
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
  const [userUpvotes, setUserUpvotes] = useState(new Set());
  const [comments, setComments] = useState({});
  const [username, setUsername] = useState('');

  useEffect(() => {
    const decryptEmail = async (encryptedEmail) => {
      if (!encryptedEmail || typeof encryptedEmail !== 'string') {
        console.error('Invalid encrypted email:', encryptedEmail);
        return encryptedEmail; // Fallback to the original value
      }
    
      const kms = new AWS.KMS({ region: 'us-east-1' }); // Replace with your region
      const params = {
        KeyId: 'alias/overflowpromptsemailencryption',
        CiphertextBlob: Buffer.from(encryptedEmail, 'base64')
      };
    
      try {
        const data = await kms.decrypt(params).promise();
        return data.Plaintext.toString('utf-8');
      } catch (err) {
        console.error('Decryption error:', err);
        return encryptedEmail; // Fallback to the encrypted value if decryption fails
      }
    };
    
    const fetchDataFromDatabase = async () => {
      const { apiOrigin, audience } = getConfig();

      setIsLoading(true);
      try {
        const response = await fetch(`${apiOrigin}/reported-prompts`, {
          headers: {
            'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
            'Content-Type': 'application/json' // Ensure this matches the middleware check
          }
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const dataArray = Array.isArray(data) ? data : data.documents || [];

        const commentsByRowId = {};
        const idToMaxUpvotesMap = {};

        const transformedData = await Promise.all(dataArray.map(async (data) => {
          const decryptedEmail = await decryptEmail(data.email);
          const cleanedData = {
            ...data,
            email: replaceHtmlEntities(decryptedEmail), // Decrypt, then replace HTML entities
            chatbotPlatform: replaceHtmlEntities(data.chatbotPlatform),
            versionChatbotHallucinationAnswer: replaceHtmlEntities(data.versionChatbot),
            prompt: replaceHtmlEntities(data.prompt),
            infringementPrompt: replaceHtmlEntities(data.infringementPrompt),
            hallucinationAnswer: replaceHtmlEntities(data.hallucinationAnswer),
            answerUpdated: replaceHtmlEntities(data.updatedPromptAnswer),
            updatedPromptAnswer: replaceHtmlEntities(data.updatedPromptAnswer),
            promptTrigger: replaceHtmlEntities(data.promptTrigger),
            privacy: typeof data.privacy === 'string' && data.privacy.toLowerCase().includes("public") ? "Public" : "Private",
            name: replaceHtmlEntities(data.name),
            copyrightAnswer: replaceHtmlEntities(data.copyrightAnswer),
            dataSource: replaceHtmlEntities(data.dataSource),
            securityImpact: replaceHtmlEntities(data.security_impact),
            securityIncidentRisk: replaceHtmlEntities(data.security_incident_risk),
            privacyRequested: replaceHtmlEntities(data.privacyRequested),
            category: typeof data.category === 'string' ? replaceHtmlEntities(data.category.toLowerCase()) : '',
            upvotes: data.upvotes || 0,
            comments: Array.isArray(data.comments) ? data.comments.map(comment => replaceHtmlEntities(comment)) : [],
            id: data._id
          };

          commentsByRowId[cleanedData.id] = cleanedData.comments;

          if (idToMaxUpvotesMap[cleanedData.id]) {
            if (cleanedData.upvotes > idToMaxUpvotesMap[cleanedData.id]) {
              idToMaxUpvotesMap[cleanedData.id] = cleanedData.upvotes;
            }
          } else {
            idToMaxUpvotesMap[cleanedData.id] = cleanedData.upvotes;
          }

          return cleanedData;
        }));

        const finalData = transformedData.map(item => ({
          ...item,
          upvotes: idToMaxUpvotesMap[item.id]
        }));

        setTableData(finalData);
        setOriginalData(finalData);
        setComments(commentsByRowId);
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
      const matchesTab = activeTab === 'allReports' || (activeTab === 'myReports' && item.email === user.email);
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
      setUserUpvotes(prevUpvotes => new Set(prevUpvotes).add(id));

      const rowToUpdate = originalData.find(item => item.id === id);
      if (!rowToUpdate) {
        console.error("Error: Row not found for upvote");
        return;
      }

      const newUpvotes = parseInt(rowToUpdate.upvotes) + 1;

      const payload = {
        userEmail: user.email,
        id: id,
        upvotes: newUpvotes,
      };

      try {
        const response = await fetch(`/upvote/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to upvote');
        }

        const updateData = data => data.map(item => item.id === id ? { ...item, upvotes: newUpvotes } : item);
        setTableData(updateData);
        setOriginalData(updateData);

      } catch (error) {
        console.error('Error upvoting:', error);
      }
    }
  }, [userUpvotes, user.email, originalData]);

  const handleAddComment = useCallback(async (id, commentText) => {
    const commentData = {
      username: username,
      comment: replaceHtmlEntities(commentText), // Replace HTML entities in the comment
      userEmail: user.email
    };
    
    const { apiOrigin, audience } = getConfig();

    try {
      const response = await fetch(`${apiOrigin}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setComments((prevComments) => ({
        ...prevComments,
        [id]: [...(prevComments[id] || []), { username: username, comment: replaceHtmlEntities(commentText) }],
      }));

    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, [username, user.email]);

  const columns = useMemo(() => {
    const baseColumns = [
      { Header: 'Category', accessor: 'category' },
      { Header: 'Upvotes', accessor: 'upvotes', Cell: ({ row }) => (
        <button onClick={() => handleUpvote(row.original.id)} disabled={userUpvotes.has(row.original.id)}>
          {row.values.upvotes}
        </button>
      )},
      { Header: 'Comments', accessor: 'comments', Cell: ({ row }) => (
        <div>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button  className="disclosure-button">
                  <span>Comments ({comments[row.original.id]?.length || 0})</span>
                  <ChevronUpIcon
                    className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-gray-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                  {comments[row.original.id] && comments[row.original.id].map((comment, index) => (
                    <div key={index}><strong>{replaceHtmlEntities(comment.username)}</strong>: {replaceHtmlEntities(comment.comment)}</div>
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
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      )}
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
      ];
      return [...baseColumns, ...securityColumns];
    }

    if (category === 'other') {
      const otherColumns = [
        { Header: 'Prompt', accessor: 'prompt' },
        { Header: 'Platform', accessor: 'chatbotPlatform' },
        { Header: 'Version', accessor: 'versionChatbot' },
        { Header: 'Answer', accessor: 'promptAnswer' },
        { Header: 'Explanation', accessor: 'other' },
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

 
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable({
    columns,
    data: tableData,
    initialState: { pageIndex: 0, pageSize: 10 }
  }, usePagination);

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px'
  };


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="botpress-table-container" style={{ marginTop: '20px', maxWidth: '98%', margin: '20px auto', overflowX: 'auto' }}>
      <h2>Reported Prompts</h2>
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('allReports')} className={activeTab === 'allReports' ? 'active' : ''}>
          All Public Reports
        </button>
        {/* <button onClick={() => setActiveTab('myReports')} className={activeTab === 'myReports' ? 'active' : ''}>
          My Reports
        </button> */}
      </div>
      <div>
        <select onChange={(e) => setCategory(e.target.value)} value={category}>
          <option value="hallucinations">Hallucinations</option>
          <option value="copyright">Copyright</option>
          <option value="security">Security Issues</option>
          <option value="memory">Memory Recall</option>
          <option value="other">Other</option>
        </select>
      </div>
      <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={paginationStyle}>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{"<<"}</button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>{"<"}</button>
        <button onClick={() => nextPage()} disabled={!canNextPage}>{">"}</button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{">>"}</button>
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>Show {size}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default withAuthenticationRequired(BotpressTable, {
  // Options for handling authentication, redirecting, etc.
});
