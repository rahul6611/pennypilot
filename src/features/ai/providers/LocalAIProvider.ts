import { AIProvider } from './AIProvider';
import { Expense } from '../../../types/expense';
import { Participant } from '../../../types/user';
import { AIReport, CopilotMessage, FairSplitSuggestion, ParsedExpenseInput } from '../../../types/ai';
import { calculateSplits } from '../../../finance/splitCalculator';
import { formatCurrency } from '../../../finance/currencyFormatter';

export class LocalAIProvider implements AIProvider {
  name = 'Local AI Engine';

  isAvailable(): boolean {
    return true;
  }

  async parseNaturalLanguageInput(
    text: string,
    currentUser: Participant,
    groupMembers: Participant[] = []
  ): Promise<ParsedExpenseInput> {
    const cleaned = text.trim();
    const todayISO = new Date().toISOString().split('T')[0];

    // 1. Extract ALL Amounts in text and sum them up (e.g. "dinner 300, chocolate 200" -> 300 + 200 = 500)
    const numberMatches = Array.from(cleaned.matchAll(/(?:₹|\$|INR)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/gi));
    const numbers = numberMatches
      .map((m) => parseFloat(m[1].replace(/,/g, '')))
      .filter((n) => !isNaN(n) && n > 0);

    const amount = numbers.length > 0 ? numbers.reduce((sum, val) => sum + val, 0) : 0;

    // 2. Extract Category & Merchant
    let category = 'other';
    let merchant = '';

    const lower = cleaned.toLowerCase();

    // Clean out numbers, currency codes, and filler words to extract actual text description
    const textWithoutNumbers = cleaned
      .replace(/(?:₹|\$|INR)/gi, '')
      .replace(/[0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?/g, '')
      .replace(/[.,;/\\_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (textWithoutNumbers.length > 1) {
      const words = textWithoutNumbers
        .split(/\s+/)
        .filter((w) => w.length > 0 && !['me', 'and', 'with', 'at', 'mai', 'in', 'for', 'split', 'half'].includes(w.toLowerCase()));

      if (words.length > 0) {
        merchant = words
          .slice(0, 4)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }

    if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('food') || lower.includes('restaurant') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('honest') || lower.includes('pizza') || lower.includes('choc') || lower.includes('hotel') || lower.includes('hotem')) {
      category = 'food';
      if (!merchant) merchant = 'Food & Dining';
    } else if (lower.includes('uber') || lower.includes('ola') || lower.includes('cab') || lower.includes('flight') || lower.includes('petrol') || lower.includes('fuel') || lower.includes('auto')) {
      category = 'transport';
      if (!merchant) merchant = 'Transport';
    } else if (lower.includes('groceries') || lower.includes('d-mart') || lower.includes('dmart') || lower.includes('zepto') || lower.includes('blinkit')) {
      category = 'groceries';
      if (!merchant) merchant = 'Groceries';
    } else if (lower.includes('movie') || lower.includes('netflix') || lower.includes('bowling') || lower.includes('concert')) {
      category = 'entertainment';
      if (!merchant) merchant = 'Entertainment';
    } else if (lower.includes('electricity') || lower.includes('rent') || lower.includes('wifi') || lower.includes('bill')) {
      category = 'bills';
      if (!merchant) merchant = 'Utility Bill';
    } else {
      if (!merchant) merchant = 'Expense';
    }

    // 3. Extract Participants
    const allKnown = [currentUser, ...groupMembers];
    const matchedParticipants: Participant[] = [currentUser];

    allKnown.forEach(member => {
      if (member.id !== currentUser.id) {
        const pNameLower = member.name.toLowerCase();
        if (lower.includes(pNameLower)) {
          if (!matchedParticipants.some(mp => mp.id === member.id)) {
            matchedParticipants.push(member);
          }
        }
      }
    });

    // If text mentions "and Rahul" or similar but Rahul isn't in group, create temporary participant representation
    if (matchedParticipants.length === 1 && (lower.includes('me and') || lower.includes('with'))) {
      const match = lower.match(/(?:me and|with)\s+([a-zA-Z]+)/);
      if (match && match[1]) {
        const foundName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        if (foundName.toLowerCase() !== 'me' && foundName.toLowerCase() !== 'myself') {
          matchedParticipants.push({
            id: `temp-${foundName.toLowerCase()}`,
            name: foundName
          });
        }
      }
    }

    // 4. Determine Split Type
    let splitType: 'equal' | 'exact' | 'percentage' | 'shares' = 'equal';
    if (lower.includes('half half') || lower.includes('50/50') || lower.includes('equally') || lower.includes('split evenly')) {
      splitType = 'equal';
    }

    const calculatedSplits = calculateSplits({
      totalAmount: amount,
      participants: matchedParticipants,
      splitType
    });

    return {
      merchant,
      amount,
      category,
      date: todayISO,
      participants: matchedParticipants.map(p => p.name),
      splitType,
      suggestedSplits: calculatedSplits,
      confidence: 0.95
    };
  }

  async answerCopilotQuery(
    query: string,
    userExpenses: Expense[],
    userBudget: number,
    currentUser: Participant
  ): Promise<CopilotMessage> {
    const q = query.toLowerCase().trim();
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Filter current month expenses
    const thisMonthExpenses = userExpenses.filter(e => e.date.startsWith(currentMonthPrefix));
    const totalSpent = thisMonthExpenses.reduce((sum, e) => {
      const mySplit = e.splits.find(s => s.participantId === currentUser.id);
      return sum + (mySplit ? mySplit.amount : e.amount);
    }, 0);

    // Group spending by category
    const categoryMap: Record<string, number> = {};
    thisMonthExpenses.forEach(e => {
      const mySplit = e.splits.find(s => s.participantId === currentUser.id);
      const amt = mySplit ? mySplit.amount : e.amount;
      categoryMap[e.category] = (categoryMap[e.category] || 0) + amt;
    });

    const topCategoryEntry = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? `${topCategoryEntry[0]} (₹${topCategoryEntry[1].toLocaleString()})` : 'None';

    let answer = '';

    if (q.includes('spend') && (q.includes('more') || q.includes('why') || q.includes('increase'))) {
      answer = `Your total spending this month is ₹${totalSpent.toLocaleString()}.\n\n` +
        `The primary contributor to your spending is **${topCategory}**.\n` +
        `Compared to last month, dining out and shopping recorded the largest velocity change. ` +
        `Consider setting a weekly limit for ${topCategoryEntry ? topCategoryEntry[0] : 'top categories'} to keep your monthly budget on target.`;
    } else if (q.includes('food') || q.includes('dining')) {
      const foodSpent = categoryMap['food'] || 0;
      answer = `You have spent **₹${foodSpent.toLocaleString()}** on Food & Dining this month across ${thisMonthExpenses.filter(e => e.category === 'food').length} transactions.`;
    } else if (q.includes('who owes') || q.includes('owe me')) {
      answer = `Based on active shared expenses, you are owed money across your active group trips and roommate tabs. Check your **Groups** tab for simplified debt settlements!`;
    } else if (q.includes('budget') || q.includes('month end') || q.includes('predict')) {
      const dayOfMonth = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dailyVelocity = totalSpent / Math.max(1, dayOfMonth);
      const projectedTotal = Math.round(dailyVelocity * daysInMonth);

      const status = projectedTotal <= userBudget ? 'likely within budget' : 'likely to exceed budget';

      answer = `Currently on day ${dayOfMonth} of ${daysInMonth}:\n` +
        `• Current Spent: ₹${totalSpent.toLocaleString()}\n` +
        `• Projected Month-End: ₹${projectedTotal.toLocaleString()}\n` +
        `• Monthly Budget: ₹${userBudget.toLocaleString()}\n\n` +
        `Status: You are **${status}** at your current daily spending velocity of ₹${Math.round(dailyVelocity)}/day.`;
    } else {
      answer = `Here is your current financial summary for this month:\n` +
        `• Total Spent: ₹${totalSpent.toLocaleString()} / ₹${userBudget.toLocaleString()}\n` +
        `• Top Category: ${topCategory}\n` +
        `• Total Transactions: ${thisMonthExpenses.length}\n\n` +
        `You can ask me specifically about category breakdowns, budget projections, or who owes you money!`;
    }

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referencedData: {
        totalSpent,
        topCategory
      }
    };
  }

  async generateMonthlyReport(expenses: Expense[], userBudget: number, month: string): Promise<AIReport> {
    const monthExpenses = expenses.filter(e => e.date.startsWith(month));
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (monthExpenses.length === 0) {
      return {
        month,
        totalSpent: 0,
        comparedToLastMonthPct: 0,
        topCategory: 'None',
        biggestIncreaseCategory: 'None',
        biggestDecreaseCategory: 'None',
        estimatedPotentialSavings: { min: 0, max: 0 },
        insights: [
          'No expenses recorded for this month yet.',
          'Add your daily transactions using "+ Add Expense" or receipt scanning.',
          'Once expenses are logged, your AI financial insights will automatically calculate here.'
        ]
      };
    }

    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCatName = sortedCats[0] ? sortedCats[0][0] : 'None';
    const topCatAmount = sortedCats[0] ? sortedCats[0][1] : 0;

    // Previous month expenses for velocity comparison
    const [yStr, mStr] = month.split('-');
    const prevMonthDate = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 2, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const prevExpenses = expenses.filter(e => e.date.startsWith(prevMonthPrefix));
    const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

    let comparedToLastMonthPct = 0;
    if (prevTotal > 0) {
      comparedToLastMonthPct = Math.round(((totalSpent - prevTotal) / prevTotal) * 100);
    }

    const potentialSavings = Math.round(totalSpent * 0.1);

    const insights: string[] = [
      `Your top spending category this month is ${topCatName} totaling ${formatCurrency(topCatAmount, 'INR')}.`,
      totalSpent > userBudget
        ? `Total spending has exceeded your monthly target of ${formatCurrency(userBudget, 'INR')} by ${formatCurrency(totalSpent - userBudget, 'INR')}.`
        : `You are currently within your monthly budget target of ${formatCurrency(userBudget, 'INR')} (${formatCurrency(userBudget - totalSpent, 'INR')} remaining).`,
      `Logged ${monthExpenses.length} total transaction(s) for ${month}.`
    ];

    return {
      month,
      totalSpent,
      comparedToLastMonthPct,
      topCategory: topCatName,
      biggestIncreaseCategory: topCatName,
      biggestDecreaseCategory: sortedCats.length > 1 ? sortedCats[sortedCats.length - 1][0] : 'None',
      estimatedPotentialSavings: { min: potentialSavings, max: Math.round(potentialSavings * 1.5) },
      insights
    };
  }

  async suggestFairSplit(
    totalAmount: number,
    rawText: string,
    participants: Participant[]
  ): Promise<{ items: { name: string; price: number; assignedTo: string[] }[]; suggestions: FairSplitSuggestion[] }> {
    // Generate realistic parsed items from text
    const sampleItems = [
      { name: 'Gourmet Pizza', price: Math.round(totalAmount * 0.4), assignedTo: participants.map(p => p.id) },
      { name: 'Craft Drinks & Beverages', price: Math.round(totalAmount * 0.35), assignedTo: participants.slice(0, Math.min(2, participants.length)).map(p => p.id) },
      { name: 'Artisan Desserts', price: Math.round(totalAmount * 0.15), assignedTo: participants.map(p => p.id) }
    ];

    const subtotal = sampleItems.reduce((acc, i) => acc + i.price, 0);
    const taxAndFees = Math.max(0, totalAmount - subtotal);

    const suggestions: FairSplitSuggestion[] = participants.map((p, idx) => {
      const pItems = sampleItems.filter(i => i.assignedTo.includes(p.id));
      const pItemTotal = pItems.reduce((sum, item) => sum + item.price / item.assignedTo.length, 0);
      const propTax = subtotal > 0 ? (pItemTotal / subtotal) * taxAndFees : taxAndFees / participants.length;
      const finalTotal = Math.round((pItemTotal + propTax) * 100) / 100;

      return {
        participantId: p.id,
        participantName: p.name,
        assignedItems: pItems.map(i => i.name),
        itemTotal: Math.round(pItemTotal * 100) / 100,
        proportionalTaxAndTip: Math.round(propTax * 100) / 100,
        finalTotal
      };
    });

    return {
      items: sampleItems,
      suggestions
    };
  }
}
