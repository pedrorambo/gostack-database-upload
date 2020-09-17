import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

interface RequestDTO {
  filePath: string;
}

class ImportTransactionsService {
  async execute({ filePath }: RequestDTO): Promise<Transaction[]> {
    const transactions = await this.loadTransactionsFromFile(filePath);
    const createdTransactions = await this.createTransactions(transactions);
    await fs.promises.unlink(filePath);
    return createdTransactions;
  }

  private async createTransactions(
    csvTransaction: CSVTransaction[],
  ): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const createTransactionsPromises = csvTransaction.map(
      async ({ type, category_title, value, title }: CSVTransaction) => {
        const transaction = await createTransactionService.execute({
          value,
          category_title,
          type,
          title,
        });

        return transaction;
      },
    );

    const createdTransactions = await Promise.all(createTransactionsPromises);

    return createdTransactions;
  }

  private async loadTransactionsFromFile(
    filePath: string,
  ): Promise<CSVTransaction[]> {
    const readStream = fs.createReadStream(filePath);

    const parser = csvParse({
      from_line: 2,
    });

    const parseObject = readStream.pipe(parser);

    const transactions: CSVTransaction[] = [];

    parseObject.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      const transaction: CSVTransaction = {
        title,
        type,
        value,
        category_title: category,
      };

      transactions.push(transaction);
    });

    await new Promise(resolve => parseObject.on('end', resolve));

    return transactions;
  }
}

export default ImportTransactionsService;
