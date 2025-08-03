import styled from 'styled-components';

interface DataCardProps {
  title: string;
  value: string;
}

const Card = styled.div`
  background: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #333;
  text-align: center;
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #aaa;
  font-size: 1rem;
`;

const Value = styled.p`
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
`;

const DataCard = ({ title, value }: DataCardProps) => {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Card>
  );
};

export default DataCard;