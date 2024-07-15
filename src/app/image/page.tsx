"use client";
import { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  interface Row {
    unique_id: string;
    Category: string;
    subCategory: string;
    orgName: string;
  }
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [responsee, setResponse] = useState('');
  const [answer, setAnswer] = useState<any>('');
  const [uploadedFilePath, setUploadedFilePath] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(false);

  const onFileChange = (e:any) => {
    
    setFile(e.target.files[0]);
  };

  const onFileUpload = async (e:any) => {
    e.preventDefault();
    setDisabled(true);
    setLoading(true);
    const formData = new FormData();
    if(file){
      formData.append('file', file);
    }

    try {
        const res1 = await axios.post('https://sowtex.com/upload-image-openAI', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(`https://sowtex.com/assets/images/openAI/${res1.data.fileName}`);
      const res = await axios.post('/api/uploads', {fileName:`${res1.data.fileName}`}, {
        headers: {
            'Content-Type': 'application/json',
        }
      });
      setLoading(false);
      setDisabled(false);
      console.log(res.data);
      const { filePath } = res.data;
      setResponse(res.data.response.res);
      setAnswer(res.data.response.rows);
      setUploadedFilePath(`${filePath}`);
      setMessage('File uploaded successfully');
    } catch (err:any) {
      setLoading(false);
      setDisabled(false);
      if (err.response && err.response.status === 500) {
        setMessage('There was a problem with the server');
        setAnswer('Failed to get response');
      } else {
        setMessage(err.response ? err.response.data.message : 'An error occurred');
        setAnswer('Failed to get response');
      }
    }
  };

  return (
    <>
      <div className="App" style={{ display: 'flex', justifyContent:'center' }}>
        <div>
          <h1>Upload Image</h1>
          {message ? <p>{message}</p> : null}
          <form onSubmit={onFileUpload}>
            <input type="file" onChange={onFileChange} />
            <button disabled={isDisabled} type="submit">
              {isLoading ? (
                <span>
                  <i className="fa fa-spinner fa-spin"></i> Loading...
                </span>
              ) : (
                'Upload'
              )}
            </button>
          </form>
        </div>
        <div>
          {uploadedFilePath ? (
            <div>
              <h3>Uploaded Image:</h3>
              <img
                style={{ width: '100px', marginLeft: '20px' }}
                src={`${uploadedFilePath}`}
                alt="Uploaded"
              />
            </div>
          ) : null}
        </div>
      </div>
      {/* <div style={{ margin: '20px' }}>{responsee && responsee}</div> */}
      <div style={{ display: 'flex', justifyContent:'center',marginTop:'20px' }}>
        {answer && typeof answer !== 'string' ? (
          <div>
            {/* <h2>Query Result:</h2> */}
            <table style={{ border: '1px solid black'}} >
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {answer.map((row:any) => (
                  <tr key={row.unique_id && row.unique_id}>
                    <td>
                      <a
                        href={`https://sowtex.com/${row.orgName && row.orgName.replace(/\s+/g, '-')}/${row.Category && row.Category.replace(
                          /\s+/g,
                          '-'
                        )}/${row.subCategory && row.subCategory.replace(/\s+/g, '-')}/product-detail/${row.unique_id}`}
                        target="__blank"
                      >
                        {row.unique_id && row.unique_id}
                      </a>
                    </td>
                    <td>{row.Category && row.Category}</td>
                    <td>{row.subCategory && row.subCategory}</td>
                    <td>
                      <a
                        href={`https://sowtex.com/company/${row.orgName && row.orgName.replace(/\s+/g, '-')}`}
                        target="__blank"
                      >
                        {row.orgName && row.orgName}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ marginTop: '15px' }}>{answer}</p>
        )}
      </div>
    </>
  );
}

export default ImageUpload;
