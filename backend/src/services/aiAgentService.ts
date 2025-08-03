import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Session and State Management
interface AgentState {
  lastAction?: string;
  status?: 'idle' | 'running' | 'error';
  errorDetails?: string;
  purchaseHistory?: any[];
}

export const createAgent = async (agentData: Prisma.AIAgentCreateInput) => {
  const initialState: AgentState = {
    status: 'idle',
    purchaseHistory: [],
  };

  return prisma.aIAgent.create({
    data: {
      ...agentData,
      state: initialState as any, // Using 'any' for now, Prisma JSON support can be tricky
    },
  });
};

export const getAgentById = async (id: string) => {
  return prisma.aIAgent.findUnique({ where: { id } });
};

export const getAgentByUserId = async (userId: string) => {
  return prisma.aIAgent.findFirst({ where: { userId } });
};

export const getAllAgents = async () => {
  return prisma.aIAgent.findMany();
};

export const updateAgent = async (id: string, updateData: Prisma.AIAgentUpdateInput) => {
  return prisma.aIAgent.update({
    where: { id },
    data: updateData,
  });
};

export const updateAgentState = async (id: string, newState: Partial<AgentState>) => {
  const agent = await getAgentById(id);
  if (!agent) throw new Error('Agent not found');

  const currentState = (agent.state as AgentState) || {};
  const updatedState = { ...currentState, ...newState };

  return prisma.aIAgent.update({
    where: { id },
    data: { state: updatedState as any }, // Using 'any' for now
  });
};

export const deleteAgent = async (id: string) => {
  return prisma.aIAgent.delete({ where: { id } });
};
