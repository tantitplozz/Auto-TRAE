import { useEffect, useState } from 'react';
import styled from 'styled-components';
import ChartCard from '../components/Dashboard/ChartCard';
import DataCard from '../components/Dashboard/DataCard';
import { websocketService } from '../services/websocketService';

// A new component for real-time status
const RealtimeStatusCard = styled.div`
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  grid-column: span 2; // Make it wider
`;

const StatusTitle = styled.h3`
  margin-top: 0;
  color: #00aaff;
`;

const StatusMessage = styled.p`
  font-size: 1rem;
  color: #ccc;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  background-color: #444;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;

  &::before {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 10px;
    background-color: #00aaff;
    transition: width 0.5s ease-in-out;
  }
`;

const DashboardPage = () => {
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Example URL to test the purchase flow
    const testProductUrl = 'http://example.com/product/123';

    // Listen for status updates
    websocketService.on('purchase:status', (data) => {
      setStatus(data.status);
      setProgress(data.progress);
      setError('');
    });

    // Listen for errors
    websocketService.on('purchase:error', (data) => {
      setStatus('ERROR');
      setError(data.message);
      setProgress(0);
    });

    // Trigger a purchase flow for demonstration
    // In a real app, this would be triggered by a user action
    const timer = setTimeout(() => websocketService.startPurchase(testProductUrl), 2000);

    return () => {
      clearTimeout(timer);
      websocketService.off('purchase:status');
      websocketService.off('purchase:error');
    };
  }, []);

  return (
    <Container>
      <Header>
        <h1>Dashboard</h1>
      </Header>
      <MainContent>
        <Grid>
          <DataCard title="Users" value="1,234" />
          <DataCard title="Revenue" value="$56,789" />
          <DataCard title="Orders" value="3,456" />
          <DataCard title="Growth" value="+15%" />
          <ChartCard />
          <RealtimeStatusCard>
            <StatusTitle>Real-time Purchase Status</StatusTitle>
            <StatusMessage>Status: {status}</StatusMessage>
            {error && <StatusMessage style={{ color: 'red' }}>Error: {error}</StatusMessage>}
            <ProgressBar progress={progress} />
          </RealtimeStatusCard>
        </Grid>
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
`;

const Header = styled.header`
  background-color: #2a2a2a;
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;

  h1 {
    margin: 0;
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  flex-grow: 1;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

export default DashboardPage;
