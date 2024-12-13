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
    const [comments, setComments] = useState({});
    const [category, setCategory] = useState('hallucinations');

    useEffect(() => {
        const fetchDataFromDatabase = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`https://6tgwnaw945.execute-api.us-east-1.amazonaws.com/dev-pets/pets/reported-prompts`, {
                    headers: {
                        'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const dataArray = Array.isArray(data.documents) ? data.documents : [];

                const commentsByRowId = {};
                const transformedData = dataArray.map((item) => {
                    const cleanedData = {
                        ...item,
                        id: item._id,
                        upvotes: Number(item.upvotes) || 0, // Ensure upvotes is a valid number
                        comments: Array.isArray(item.comments) ? item.comments.map((c) => replaceHtmlEntities(c.comment)) : [],
                    };

                    commentsByRowId[cleanedData.id] = cleanedData.comments;
                    return cleanedData;
                });

                setTableData(transformedData);
                setOriginalData(transformedData);
                setComments(commentsByRowId);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataFromDatabase();
    }, []);

    const handleAddComment = useCallback(async (id, commentText) => {
        const newComment = replaceHtmlEntities(commentText);
        try {
            await fetch(`https://6tgwnaw945.execute-api.us-east-1.amazonaws.com/dev-pets/pets/reported-prompts`, {
                method: 'POST',
                headers: {
                    'x-api-key': 'klQ2fYOVVCMWHMAb8nLu9mR9H14gBidPOH5FbM70',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    comments: [{ comment: newComment }],
                }),
            });

            setComments((prevComments) => ({
                ...prevComments,
                [id]: [...(prevComments[id] || []), newComment],
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }, []);

    const columns = useMemo(() => {
        const baseColumns = [
            { Header: 'Category', accessor: 'category' },
            { Header: 'Upvotes', accessor: 'upvotes', Cell: ({ row }) => (
                <button>{row.values.upvotes}</button>
            )},
            {
                Header: 'Comments', accessor: 'comments', Cell: ({ row }) => (
                    <div>
                        <Disclosure>
                            {({ open }) => (
                                <>
                                    <Disclosure.Button>
                                        <span>Comments ({comments[row.original.id]?.length || 0})</span>
                                        <ChevronUpIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-gray-500`} />
                                    </Disclosure.Button>
                                    <Disclosure.Panel>
                                        {comments[row.original.id]?.map((comment, index) => (
                                            <div key={index}>{comment}</div>
                                        )) || <p>No comments yet.</p>}
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
                                            <input type="text" name="comment" placeholder="Add a comment" required />
                                            <button type="submit">Add Comment</button>
                                        </form>
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    </div>
                )
            },
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
    }, [category, comments, handleAddComment]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        rows
    } = useTable({
        columns,
        data: tableData,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <select onChange={(e) => setCategory(e.target.value)} value={category}>
                <option value="hallucinations">Hallucinations</option>
                <option value="copyright">Copyright</option>
                <option value="security">Security</option>
                <option value="memory">Memory</option>
                <option value="other">Other</option>
            </select>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
};

export default BotpressTable;
