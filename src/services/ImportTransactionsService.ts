import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

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

    const createdTransactions = await this.createTransactions(transactions);

    await fs.promises.unlink(filePath);
    await Promise.all(createdTransactions);
    return createdTransactions;
  }

  private async createTransactions(
    csvTransaction: CSVTransaction[],
  ): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const createTransactionsPromises = csvTransaction.map(
      async ({ type, category_title, value, title }: CSVTransaction) => {
        let category = await categoriesRepository.findOne({
          where: {
            title: category_title,
          },
        });

        if (!category) {
          category = categoriesRepository.create({ title: category_title });
          await categoriesRepository.save(category);
        }

        const transaction = transactionsRepository.create({
          title,
          value,
          type,
          category,
        });

        await transactionsRepository.save(transaction);

        return transaction;
      },
    );

    const createdTransactions = await Promise.all(createTransactionsPromises);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
