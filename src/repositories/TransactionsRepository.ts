import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const calculateBalanceReducer = (
      accumulator: Balance,
      { type, value }: Transaction,
    ): Balance => {
      const numericValue = Number(value);
      switch (type) {
        case 'income':
          accumulator.income += numericValue;
          break;
        case 'outcome':
          accumulator.outcome += numericValue;
          break;
        default:
          break;
      }
      accumulator.total = accumulator.income - accumulator.outcome;
      return accumulator;
    };

    const balance = transactions.reduce(calculateBalanceReducer, {
      total: 0,
      outcome: 0,
      income: 0,
    });

    return balance;
  }
}

export default TransactionsRepository;
