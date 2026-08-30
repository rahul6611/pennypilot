import { Expense } from '../types/expense';
import { Group } from '../types/group';
import { Settlement } from '../types/settlement';
import { UserProfile } from '../types/user';

export const CURRENT_USER: UserProfile = {
  uid: 'user-me-101',
  email: 'alex@pennypilot.app',
  displayName: 'Alex (Me)',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'INR',
  monthlyBudget: 50000,
  isDemoUser: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z'
};

export const DEMO_MEMBERS = [
  { id: 'user-me-101', name: 'Alex (Me)', isCurrentUser: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'user-rahul-102', name: 'Rahul', isCurrentUser: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'user-amit-103', name: 'Amit', isCurrentUser: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'user-neha-104', name: 'Neha', isCurrentUser: false, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
];

export const DEMO_GROUPS: Group[] = [
  {
    id: 'group-goa-1',
    name: 'Goa Trip 🏖️',
    description: 'Beach villa, seafood & scooter rentals',
    category: 'trip',
    createdBy: 'user-me-101',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    members: DEMO_MEMBERS
  },
  {
    id: 'group-roommates-2',
    name: 'Roommates 🏠',
    description: 'Monthly rent, wifi, maid & groceries',
    category: 'home',
    createdBy: 'user-rahul-102',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
    members: [DEMO_MEMBERS[0], DEMO_MEMBERS[1], DEMO_MEMBERS[2]]
  },
  {
    id: 'group-office-3',
    name: 'Office Squad 🍱',
    description: 'Team lunches & coffee breaks',
    category: 'office',
    createdBy: 'user-neha-104',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-08-12T10:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    members: DEMO_MEMBERS
  }
];

export const DEMO_EXPENSES: Expense[] = [
  // Current Month Expenses (August 2026)
  {
    id: 'exp-101',
    userId: 'user-me-101',
    description: 'Honest Restaurant Dinner',
    amount: 2840,
    category: 'food',
    date: '2026-08-16',
    paymentMethod: 'upi',
    notes: 'Dinner with Rahul, Amit & Neha',
    groupId: 'group-goa-1',
    groupName: 'Goa Trip 🏖️',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'equal',
    splits: [
      { participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 710 },
      { participantId: 'user-rahul-102', participantName: 'Rahul', amount: 710 },
      { participantId: 'user-amit-103', participantName: 'Amit', amount: 710 },
      { participantId: 'user-neha-104', participantName: 'Neha', amount: 710 }
    ],
    createdAt: '2026-08-16T20:30:00Z',
    updatedAt: '2026-08-16T20:30:00Z'
  },
  {
    id: 'exp-102',
    userId: 'user-rahul-102',
    description: 'Beach Shack Drinks & Snacks',
    amount: 3200,
    category: 'food',
    date: '2026-08-15',
    paymentMethod: 'upi',
    groupId: 'group-goa-1',
    groupName: 'Goa Trip 🏖️',
    paidBy: 'user-rahul-102',
    paidByName: 'Rahul',
    splitType: 'equal',
    splits: [
      { participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 800 },
      { participantId: 'user-rahul-102', participantName: 'Rahul', amount: 800 },
      { participantId: 'user-amit-103', participantName: 'Amit', amount: 800 },
      { participantId: 'user-neha-104', participantName: 'Neha', amount: 800 }
    ],
    createdAt: '2026-08-15T18:00:00Z',
    updatedAt: '2026-08-15T18:00:00Z'
  },
  {
    id: 'exp-103',
    userId: 'user-me-101',
    description: 'Zara Weekend Outfit Shopping',
    amount: 8900,
    category: 'shopping',
    date: '2026-08-14',
    paymentMethod: 'card',
    notes: 'Personal wardrobe refresh',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 8900 }],
    createdAt: '2026-08-14T16:20:00Z',
    updatedAt: '2026-08-14T16:20:00Z'
  },
  {
    id: 'exp-104',
    userId: 'user-me-101',
    description: 'Uber Airport Ride',
    amount: 1450,
    category: 'transport',
    date: '2026-08-13',
    paymentMethod: 'upi',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 1450 }],
    createdAt: '2026-08-13T09:15:00Z',
    updatedAt: '2026-08-13T09:15:00Z'
  },
  {
    id: 'exp-105',
    userId: 'user-me-101',
    description: 'Netflix Monthly Subscription',
    amount: 649,
    category: 'entertainment',
    date: '2026-08-10',
    paymentMethod: 'card',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 649 }],
    createdAt: '2026-08-10T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'exp-106',
    userId: 'user-rahul-102',
    description: 'Monthly Apartment Wi-Fi',
    amount: 1200,
    category: 'bills',
    date: '2026-08-08',
    paymentMethod: 'upi',
    groupId: 'group-roommates-2',
    groupName: 'Roommates 🏠',
    paidBy: 'user-rahul-102',
    paidByName: 'Rahul',
    splitType: 'equal',
    splits: [
      { participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 400 },
      { participantId: 'user-rahul-102', participantName: 'Rahul', amount: 400 },
      { participantId: 'user-amit-103', participantName: 'Amit', amount: 400 }
    ],
    createdAt: '2026-08-08T11:00:00Z',
    updatedAt: '2026-08-08T11:00:00Z'
  },
  {
    id: 'exp-107',
    userId: 'user-me-101',
    description: 'D-Mart Grocery Stocking',
    amount: 4650,
    category: 'groceries',
    date: '2026-08-05',
    paymentMethod: 'card',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 4650 }],
    createdAt: '2026-08-05T19:40:00Z',
    updatedAt: '2026-08-05T19:40:00Z'
  },
  {
    id: 'exp-108',
    userId: 'user-neha-104',
    description: 'Sushi Team Lunch',
    amount: 3800,
    category: 'food',
    date: '2026-08-03',
    paymentMethod: 'card',
    groupId: 'group-office-3',
    groupName: 'Office Squad 🍱',
    paidBy: 'user-neha-104',
    paidByName: 'Neha',
    splitType: 'equal',
    splits: [
      { participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 950 },
      { participantId: 'user-rahul-102', participantName: 'Rahul', amount: 950 },
      { participantId: 'user-amit-103', participantName: 'Amit', amount: 950 },
      { participantId: 'user-neha-104', participantName: 'Neha', amount: 950 }
    ],
    createdAt: '2026-08-03T13:30:00Z',
    updatedAt: '2026-08-03T13:30:00Z'
  },
  {
    id: 'exp-109',
    userId: 'user-me-101',
    description: 'Cult.fit Gym Annual Membership',
    amount: 12500,
    category: 'health',
    date: '2026-08-01',
    paymentMethod: 'card',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 12500 }],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'exp-110',
    userId: 'user-me-101',
    description: 'House Rent Share',
    amount: 15000,
    category: 'bills',
    date: '2026-08-01',
    paymentMethod: 'bank',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 15000 }],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z'
  },

  // Previous Month Expenses (July 2026) for comparison
  {
    id: 'exp-201',
    userId: 'user-me-101',
    description: 'Swiggy Gourmet Food',
    amount: 3200,
    category: 'food',
    date: '2026-07-25',
    paymentMethod: 'upi',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 3200 }],
    createdAt: '2026-07-25T20:00:00Z',
    updatedAt: '2026-07-25T20:00:00Z'
  },
  {
    id: 'exp-202',
    userId: 'user-me-101',
    description: 'H&M Clothing Shopping',
    amount: 5800,
    category: 'shopping',
    date: '2026-07-18',
    paymentMethod: 'card',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 5800 }],
    createdAt: '2026-07-18T15:00:00Z',
    updatedAt: '2026-07-18T15:00:00Z'
  },
  {
    id: 'exp-203',
    userId: 'user-me-101',
    description: 'Cab Rides Total',
    amount: 2250,
    category: 'transport',
    date: '2026-07-12',
    paymentMethod: 'upi',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 2250 }],
    createdAt: '2026-07-12T10:00:00Z',
    updatedAt: '2026-07-12T10:00:00Z'
  },
  {
    id: 'exp-204',
    userId: 'user-me-101',
    description: 'House Rent July',
    amount: 15000,
    category: 'bills',
    date: '2026-07-01',
    paymentMethod: 'bank',
    paidBy: 'user-me-101',
    paidByName: 'Alex (Me)',
    splitType: 'exact',
    splits: [{ participantId: 'user-me-101', participantName: 'Alex (Me)', amount: 15000 }],
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z'
  }
];

export const DEMO_SETTLEMENTS: Settlement[] = [
  {
    id: 'set-1',
    groupId: 'group-goa-1',
    fromParticipantId: 'user-neha-104',
    fromParticipantName: 'Neha',
    toParticipantId: 'user-me-101',
    toParticipantName: 'Alex (Me)',
    amount: 500,
    paymentMethod: 'upi',
    notes: 'UPI payment for dinner share',
    date: '2026-08-16',
    createdAt: '2026-08-16T21:00:00Z'
  }
];
