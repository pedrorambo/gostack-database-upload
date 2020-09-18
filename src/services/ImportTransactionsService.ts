import csvParse from 'csv-parse';
import fs from 'fs';

import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface RequestDTO {
  filePath: string;
}

interface TransactionsCategoriesDTO {
  transactions: CSVTransaction[];
  categories: string[];
}

class ImportTransactionsService {
  async execute({ filePath }: RequestDTO): Promise<Transaction[]> {
    const { transactions, categories } = await this.getCSVTransactionsFromFile(
      filePath,
    );

    const createdTransactions = await this.createTransactions({
      transactions,
      categories,
    });

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }

  private async createTransactions({
    transactions,
    categories,
  }: TransactionsCategoriesDTO): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const categoryTitlesToAdd = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      categoryTitlesToAdd.map(title => ({
        title,
      })),
    );
    await categoriesRepository.save(newCategories);

    const transactionCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transactionCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }

  private async getCSVTransactionsFromFile(filePath: string) {
    const readStream = fs.createReadStream(filePath);
    const parser = csvParse({ from_line: 2 });
    const parserCSV = readStream.pipe(parser);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parserCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parserCSV.on('end', resolve));

    return {
      transactions,
      categories,
    };
  }
}

export default ImportTransactionsService;
