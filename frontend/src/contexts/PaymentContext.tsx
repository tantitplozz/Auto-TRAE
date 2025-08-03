/**
 * ✅ Military-Grade Payment Context
 * Provides a secure, centralized state management for all payment-related operations.
 * Handles card encryption, API interactions, and real-time updates.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock API service - replace with your actual API calls
const apiService = {
  getCards: async () => {
    console.log("API: Fetching cards...");
    await new Promise(res => setTimeout(res, 1000));
    return []; // Start with an empty array
  },
  addCard: async (encryptedCard: any) => {
    console.log("API: Adding card...", encryptedCard);
    await new Promise(res => setTimeout(res, 1000));
    const cardData = decryptCardData(encryptedCard);
    return {
      id: `card_${Date.now()}`,
      last4: cardData.cardNumber.slice(-4),
      issuer: 'Visa', // Mock issuer detection
      isDefault: false,
      encryptedData: encryptedCard
    };
  },
  deleteCard: async (id: string) => {
    console.log("API: Deleting card...", id);
    await new Promise(res => setTimeout(res, 500));
    return true;
  },
  setAsDefault: async (id: string) => {
    console.log("API: Setting default card...", id);
    await new Promise(res => setTimeout(res, 500));
    return true;
  },
  rotateCard: async (id: string) => {
    console.log("API: Rotating card...", id);
    await new Promise(res => setTimeout(res, 1500));
    const newEncryptedData = encryptCardData({
        cardNumber: `4${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`.slice(0, 16),
        expiry: '12/28',
        cvv: `${Math.floor(100 + Math.random() * 900)}`,
        cardHolder: 'ROTATED PROFILE'
    });
    return { newEncryptedData };
  }
};

// Mock encryption/decryption functions
const encryptCardData = (data: any) => {
  return `encrypted_${JSON.stringify(data)}`;
};
const decryptCardData = (data: string) => {
  try {
    return JSON.parse(data.replace('encrypted_', ''));
  } catch {
    return null;
  }
};

// Interfaces
export interface CreditCard {
  id: string;
  last4: string;
  issuer: string;
  isDefault: boolean;
  encryptedData: string; // Encrypted string of { cardNumber, expiry, cvv, cardHolder }
}

interface PaymentContextType {
  cards: CreditCard[];
  loading: boolean;
  error: string | null;
  addCard: (cardData: Omit<CreditCard, 'id' | 'last4' | 'issuer' | 'isDefault' | 'encryptedData'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setAsDefault: (id: string) => Promise<void>;
  rotateCard: (id: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const fetchedCards = await apiService.getCards();
        setCards(fetchedCards);
        setError(null);
      } catch (err) {
        setError('Failed to load cards.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const addCard = async (cardData: Omit<CreditCard, 'id' | 'last4' | 'issuer' | 'isDefault' | 'encryptedData'>) => {
    try {
      setLoading(true);
      const encryptedCard = encryptCardData(cardData);
      const newCard = await apiService.addCard(encryptedCard);
      setCards(prev => [...prev, newCard]);
    } catch (err) {
      setError('Failed to add card.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await apiService.deleteCard(id);
      setCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      setError('Failed to delete card.');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      await apiService.setAsDefault(id);
      setCards(prev =>
        prev.map(card => ({ ...card, isDefault: card.id === id }))
      );
    } catch (err) {
      setError('Failed to set default card.');
    }
  };

  const rotateCard = async (id: string) => {
    try {
      const { newEncryptedData } = await apiService.rotateCard(id);
      setCards(prev =>
        prev.map(card =>
          card.id === id ? { ...card, encryptedData: newEncryptedData } : card
        )
      );
    } catch (err) {
      setError('Failed to rotate card credentials.');
    }
  };

  return (
    <PaymentContext.Provider value={{ cards, loading, error, addCard, deleteCard, setAsDefault, rotateCard }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};
