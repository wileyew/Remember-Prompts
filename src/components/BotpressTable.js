import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import "../../src/index.css";
import { useTable, usePagination } from 'react-table';
import config from '../utils/config'; // Import the config object directly
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
  const [originalData, setOriginalData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('allReports');
  const [category, setCategory] = useState('hallucinations');
  const [userUpvotes, setUserUpvotes] = useState(new Set());
  const [comments, setComments] = useState({});
  const [minimalView, setMinimalView] = useState(false); // Toggle for minimal view

  useEffect(() => {
    const fetchDataFromDatabase = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://6tgwnaw945.execute-api.us-east-1.amazonaws.com/dev-pets/pets/reported-prompts`,
          {
            headers: {
              'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const documents = Array.isArray(data.documents) ? data.documents : [];

        // Load comments from local storage
        const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
        const commentsByRowId = {};

        const transformedData = documents.map((doc) => {
          const backendComments = Array.isArray(doc.comments) ? doc.comments : [];
          const localComments = Array.isArray(storedComments[doc._id])
            ? storedComments[doc._id]
            : [];

          // Merge backend and local comments without duplicates
          const allComments = [
            ...backendComments,
            ...localComments.filter(
              localComment =>
                !backendComments.some(
                  backendComment => backendComment.comment === localComment.comment
                )
            ),
          ];

          // Store comments by _id
          commentsByRowId[doc._id] = allComments;

          // Transform data for the table
          return {
            ...doc,
            id: doc._id, // Use _id as id
            upvotes: Number(doc.upvotes) || 0,
            comments: allComments,
          };
        });

        console.log('Processed comments by _id:', commentsByRowId);

        setTableData(transformedData);
        setOriginalData(transformedData);
        setComments(commentsByRowId);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, []);

  useEffect(() => {
    const filteredData = originalData.filter(item => {
      const matchesSearchQuery =
        searchQuery === '' ||
        Object.values(item).some(value =>
          value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false
        );
      const matchesCategory = category === 'all' || item.category === category;
      const matchesTab = activeTab === 'allReports' || activeTab === 'myReports';
      return matchesSearchQuery && matchesCategory && matchesTab;
    });

    setTableData(filteredData);
  }, [originalData, searchQuery, category, activeTab]);

  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleUpvote = useCallback(async (id) => {
    if (!id) {
      console.error("Invalid ID provided for upvote.");
      return;
    }

    if (!userUpvotes.has(id)) {
      setUserUpvotes(prevUpvotes => new Set(prevUpvotes).add(id));

      const rowToUpdate = originalData.find(item => item.id === id);
      if (!rowToUpdate) {
        console.error("Error: Row not found for upvote.");
        return;
      }

      const currentUpvotes = Number(rowToUpdate.upvotes) || 0;
      const newUpvotes = currentUpvotes + 1;

      setTableData(prevData =>
        prevData.map(item =>
          item.id === id ? { ...item, upvotes: newUpvotes } : item
        )
      );

      try {
        await fetch(`https://n7mam9mzqb.execute-api.us-east-1.amazonaws.com/Upvotes/${id}`, {
          method: 'POST',
          headers: {
            'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, upvotes: newUpvotes }),
        });
      } catch (error) {
        console.error('Error upvoting:', error);
      }
    }
  }, [userUpvotes, originalData]);

  // eslint-disable-next-line no-unused-vars
  const handleAddComment = useCallback(async (id, commentText) => {
    const newComment = {
      comment: replaceHtmlEntities(commentText),
    };

    try {
      const response = await fetch(
        `https://6tgwnaw945.execute-api.us-east-1.amazonaws.com/dev-pets/pets/reported-prompts`,
        {
          method: 'POST',
          headers: {
            'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            comments: [newComment],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setComments(prevComments => {
        const updatedComments = {
          ...prevComments,
          [id]: [...(prevComments[id] || []), newComment],
        };
        localStorage.setItem('comments', JSON.stringify(updatedComments));
        return updatedComments;
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, []);

  const columns = useMemo(() => {
    if (minimalView) {
      // Minimal view: only show the essential columns (prompt and platform)
      switch (category) {
        case 'hallucinations':
        case 'security':
        case 'other':
          return [
            { Header: 'Prompt', accessor: 'prompt' },
            { Header: 'Platform', accessor: 'chatbotPlatform' },
          ];
        case 'copyright':
          return [
            { Header: 'Infringement Prompt', accessor: 'infringementPrompt' },
            // Optionally, if there's a field representing the platform, include it here
          ];
        case 'memory':
          return [
            { Header: 'Prompt', accessor: 'prompt' },
            { Header: 'Trigger for Recall', accessor: 'prompt_record' },
          ];
        default:
          return [
            { Header: 'Prompt', accessor: 'prompt' },
            { Header: 'Platform', accessor: 'chatbotPlatform' },
          ];
      }
    } else {
      // Full view includes additional details along with base columns
      const baseColumns = [
        { Header: 'Category', accessor: 'category' },
        {
          Header: 'Upvotes',
          accessor: 'upvotes',
          Cell: ({ row }) => (
            <button
              onClick={() => handleUpvote(row.original.id)}
              disabled={userUpvotes.has(row.original.id)}
            >
              {row.values.upvotes}
            </button>
          )
        },
        {
          Header: 'Comments',
          accessor: 'comments',
          Cell: ({ row }) => (
            <div>
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="disclosure-button">
                      <span>
                        Comments ({comments[row.original.id]?.length || 0})
                      </span>
                      <ChevronUpIcon
                        className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-gray-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                      {comments[row.original.id]?.length > 0 ? (
                        comments[row.original.id].map((comment, index) => (
                          <div key={index} className="mb-2">
                            {replaceHtmlEntities(comment.comment)}
                          </div>
                        ))
                      ) : (
                        <p>No comments yet.</p>
                      )}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const commentText = e.target.elements.comment.value.trim();
                          if (commentText) {
                            handleAddComment(row.original.id, commentText);
                            e.target.reset();
                          }
                        }}
                      >
                        <input
                          type="text"
                          name="comment"
                          placeholder="Add a comment"
                          className="border rounded px-2 py-1 w-full mb-2"
                        />
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Add Comment
                        </button>
                      </form>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
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
        const copyrightColumns = [
          { Header: 'Infringement Prompt', accessor: 'infringementPrompt' },
          { Header: 'Copyright Answer', accessor: 'copyrightAnswer' },
          { Header: 'Data Source', accessor: 'dataSource' },
        ];
        return [...baseColumns, ...copyrightColumns];
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
    }
  }, [handleUpvote, userUpvotes, category, comments, handleAddComment, minimalView]);

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
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    usePagination
  );

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
      </div>
      <div style={{ marginBottom: '10px' }}>
        <select onChange={handleCategoryChange} value={category}>
          <option value="hallucinations">Hallucinations</option>
          <option value="copyright">Copyright</option>
          <option value="security">Security Issues</option>
          <option value="memory">Memory Recall</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={minimalView} 
            onChange={(e) => setMinimalView(e.target.checked)} 
          />
          Minimal View
        </label>
      </div>
      <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange} />
      <table className="reportTable" {...getTableProps()}>
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

export default BotpressTable;
