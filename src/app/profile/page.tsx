"use client";

import { useState, FormEvent } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import QueryForm from '../../componenets/queryForm';

interface Answer {
  unique_id: string;
  Category: string;
  subCategory: string;
  orgName: string;
}

export default function PROFILE() {
  // console.log('Rendering profile page');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<Answer[] | string>('');
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(false);

  const handleQuery = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setDisabled(true);
      setLoading(true);
      // Send question to backend server
      const response = await axios.post<Answer[]>('/api/profile', { question });
      setLoading(false);
      setDisabled(false);
      // Display result from backend
      setAnswer(response.data);
    } catch (error) {
      setLoading(false);
      setDisabled(false);
      console.error('Error:', error);
      setAnswer('Failed to get answer');
    }
  };

  return (
    <>
      <Container maxWidth="sm">
      <div style={{marginTop:'20px'}}>

      <QueryForm
        question={question}
        setQuestion={setQuestion}
        handleQuery={handleQuery}
        isDisabled={isDisabled}
        isLoading={isLoading}
        h4={'Search Profile using Open-AI'}
      />
      </div>
      </Container>
      {typeof answer !== 'string' && answer.length > 0 ? (
        <div>
          <h2>Query Result:</h2>
          <table style={{ border: '1px solid black'}}>
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {answer.map((row) => (
                <tr key={row.unique_id}>
                  <td>
                    <a
                      href={`https://sowtex.com/${row.orgName.replace(/\s+/g, '-')}/${row.Category.replace(/\s+/g, '-')}/${row.subCategory.replace(/\s+/g, '-')}/product-detail/${row.unique_id}`}
                      target="__blank"
                    >
                      {row.unique_id}
                    </a>
                  </td>
                  <td>{row.Category}</td>
                  <td>{row.subCategory}</td>
                  <td>
                    <a
                      href={`https://sowtex.com/company/${row.orgName.replace(/\s+/g, '-')}`}
                      target="__blank"
                    >
                      {row.orgName}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ marginTop: '15px' }}>{typeof answer === 'string' &&answer}</p>
      )}
    </>
  );
}
