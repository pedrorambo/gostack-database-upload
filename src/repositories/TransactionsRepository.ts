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

    const balance = transactions.reduce(
      (accumulator, { type, value }: Transaction) => {
        const valueNumber = Number(value);
        switch (type) {
          case 'income':
            accumulator.income += valueNumber;
            accumulator.total += valueNumber;
            break;
          case 'outcome':
            accumulator.outcome += valueNumber;
            accumulator.total -= valueNumber;
            break;
          default:
            break;
        }
        return accumulator;
      },
      {
        total: 0,
        outcome: 0,
        income: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
