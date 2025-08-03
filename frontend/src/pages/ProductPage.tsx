import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const FormContainer = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const Message = styled.p<{
  success?: boolean;
}>`
  color: ${({ success }) => (success ? '#28a745' : '#dc3545')};
  font-size: 1rem;
  margin-top: 1rem;
  text-align: center;
  white-space: pre-wrap;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ProductPage: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Error: You must be logged in to initiate a purchase.');
      console.error('No token found in local storage.');
      return;
    }

    try {
      const requestUrl = `/api/v1/purchase/purchase`;
      const requestBody = { productUrl: website };
      const requestHeaders = { Authorization: `Bearer ${token}` };

      console.log('Sending request to:', requestUrl);
      console.log('Request body:', requestBody);
      console.log('Request headers:', requestHeaders);

      const response = await axios.post(
        requestUrl,
        requestBody,
        {
          headers: requestHeaders,
        }
      );
      setMessage(`Success: ${response.data.message || 'Request sent'}`);
      console.log('Response:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage(`Error: ${errorMessage}`);
      console.error('Purchase failed:', error.response || error);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Add Product</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <Input
              name="productUrl"
              type="url"
              placeholder="Product URL"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
            />
          <Button type="submit">Initiate Purchase</Button>
        </Form>
        {message && <Message success={!message.startsWith('Error')}>{message}</Message>}
      </FormContainer>
    </PageContainer>
  );
};

export default ProductPage;
