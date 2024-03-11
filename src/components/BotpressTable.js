import React, { useMemo, useState, useEffect } from 'react';
import { useTable } from 'react-table';

const BotpressTable = () => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataFromDatabase = async () => {
      try {
        const response = await fetch('http://localhost:5001/reported-prompts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const dataArray = Array.isArray(data) ? data : data.documents || [];
        console.log('array from data set' + JSON.stringify(dataArray));
        //transform data from dataArray, ask chatGPT to do the transformation.
        const publicData = dataArray.filter(doc => !doc.privacy);
        setTableData(publicData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDataFromDatabase();
  }, []);

  const renderValue = (value) => {
    console.log('values taken from table ' + JSON.stringify(value));
    // Check if the value is an object, and if so, stringify it. Otherwise, return the value directly.
    return typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Prompt',
        accessor: 'prompt',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Hallucination Answer',
        accessor: 'hallucinationAnswer',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Answer Updated',
        accessor: 'answerUpdated',
        Cell: ({ value }) => renderValue(value || 'N/A'),
      },
      {
        Header: 'Version Chatbot Hallucination Answer',
        accessor: 'versionChatbotHallucinationAnswer',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Chatbot Platform',
        accessor: 'chatbotPlatform',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Updated Prompt Answer',
        accessor: 'updatedPromptAnswer',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Prompt Trigger',
        accessor: 'promptTrigger',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Keyword Search',
        accessor: 'keywordSearch',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Privacy',
        accessor: 'privacy',
        Cell: ({ value }) => renderValue(value ? "Private" : "Public"),
      },
      {
        Header: 'Email',
        accessor: 'email',
        Cell: ({ value }) => renderValue(value),
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ value }) => renderValue(value),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data: tableData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Reported Prompts</h2>
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
          {rows.map(row => {
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
    </div>
  );
};

export default BotpressTable;
