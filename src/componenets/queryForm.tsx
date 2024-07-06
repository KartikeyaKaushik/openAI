// components/QueryForm.js
import { useState, FormEvent } from 'react';
import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/system';
import Typography from '@mui/material/Typography';

const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'gray',
    },
    '&:hover fieldset': {
      borderColor: 'black',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3f51b5',
      borderWidth: 2,
    },
  },
});

const QueryForm = ({ question, setQuestion, handleQuery, isDisabled, isLoading, h4 }) => {
  return (
    <Box
      component="form"
      onSubmit={handleQuery}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        '& .MuiButton-root': { m: 1 },
      }}
      noValidate
      autoComplete="off"
    >
      
      <Typography variant="h4" component="h1" gutterBottom>
        {h4}
      </Typography>
      <CustomTextField
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
        required
        InputProps={{
          style: {
            backgroundColor: 'white',
          },
        }}
      />
      <Button
        disabled={isDisabled}
        type="submit"
        variant="contained"
        color="primary"
        sx={{ width: 'fit-content' }}
      >
        {isLoading ? (
          <span>
            <CircularProgress size={24} />
            &nbsp; Loading...
          </span>
        ) : (
          'Ask'
        )}
      </Button>
    </Box>
  );
};

export default QueryForm;
