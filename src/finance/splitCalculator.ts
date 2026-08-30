import { IndividualSplit, ItemizedSplitItem, SplitType } from '../types/expense';

export interface SplitCalculationParams {
  totalAmount: number;
  participants: { id: string; name: string }[];
  splitType: SplitType;
  customExacts?: Record<string, number>;
  customPercentages?: Record<string, number>;
  customShares?: Record<string, number>;
  items?: ItemizedSplitItem[];
  taxAndFees?: number;
}

export function calculateSplits(params: SplitCalculationParams): IndividualSplit[] {
  const {
    totalAmount,
    participants,
    splitType,
    customExacts = {},
    customPercentages = {},
    customShares = {},
    items = [],
    taxAndFees = 0
  } = params;

  if (participants.length === 0 || totalAmount <= 0) {
    return [];
  }

  const numParticipants = participants.length;

  if (splitType === 'equal') {
    const baseShare = Math.floor((totalAmount / numParticipants) * 100) / 100;
    let remainder = Math.round((totalAmount - baseShare * numParticipants) * 100) / 100;

    return participants.map((p, index) => {
      let amount = baseShare;
      if (remainder > 0 && index === 0) {
        amount = Math.round((amount + remainder) * 100) / 100;
      }
      return {
        participantId: p.id,
        participantName: p.name,
        amount
      };
    });
  }

  if (splitType === 'exact') {
    return participants.map((p) => {
      const amount = customExacts[p.id] || 0;
      return {
        participantId: p.id,
        participantName: p.name,
        amount: Math.round(amount * 100) / 100
      };
    });
  }

  if (splitType === 'percentage') {
    let allocated = 0;
    const splits = participants.map((p, idx) => {
      const pct = customPercentages[p.id] || 0;
      let amount = Math.floor((totalAmount * (pct / 100)) * 100) / 100;
      if (idx === participants.length - 1) {
        // Adjust last participant to match total exactly
        amount = Math.round((totalAmount - allocated) * 100) / 100;
      } else {
        allocated += amount;
      }
      return {
        participantId: p.id,
        participantName: p.name,
        percentage: pct,
        amount
      };
    });
    return splits;
  }

  if (splitType === 'shares') {
    const totalShares = Object.values(customShares).reduce((acc, s) => acc + (s || 0), 0) || numParticipants;
    let allocated = 0;
    return participants.map((p, idx) => {
      const shares = customShares[p.id] || 1;
      let amount = Math.floor((totalAmount * (shares / totalShares)) * 100) / 100;
      if (idx === participants.length - 1) {
        amount = Math.round((totalAmount - allocated) * 100) / 100;
      } else {
        allocated += amount;
      }
      return {
        participantId: p.id,
        participantName: p.name,
        shares,
        amount
      };
    });
  }

  if (splitType === 'itemized') {
    // Itemized calculation
    const participantTotals: Record<string, number> = {};
    participants.forEach((p) => (participantTotals[p.id] = 0));

    let itemsSubtotal = 0;
    items.forEach((item) => {
      itemsSubtotal += item.price;
      const assignees = item.assignedToParticipantIds.length > 0 ? item.assignedToParticipantIds : participants.map((p) => p.id);
      const itemPerPerson = item.price / assignees.length;
      assignees.forEach((pid) => {
        if (participantTotals[pid] !== undefined) {
          participantTotals[pid] += itemPerPerson;
        }
      });
    });

    // Distribute tax and fees proportionally based on items subtotal share
    participants.forEach((p) => {
      const pSubtotal = participantTotals[p.id] || 0;
      const proportion = itemsSubtotal > 0 ? pSubtotal / itemsSubtotal : 1 / numParticipants;
      const pTax = taxAndFees * proportion;
      participantTotals[p.id] = Math.round((pSubtotal + pTax) * 100) / 100;
    });

    return participants.map((p) => ({
      participantId: p.id,
      participantName: p.name,
      amount: participantTotals[p.id] || 0
    }));
  }

  return [];
}
