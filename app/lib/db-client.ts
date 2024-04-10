import { Client, Pool, QueryResult } from 'pg';

class PostgresDB {
  private static instance: PostgresDB;
  private client!: Client;
  private pool!: Pool;

  private constructor() {
    this.init();
  }

  async init() {
    // this.client = new Client({
    //   connectionString: process.env.POSTGRES_URL,
    // });
    // await this.client.connect();

    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public static getInstance(): PostgresDB {
    if (!PostgresDB.instance) {
      PostgresDB.instance = new PostgresDB();
    }
    return PostgresDB.instance;
  }

  query(text: string, values?: any[]): Promise<QueryResult> {
    return this.pool.query(text, values);
  }
}

const dBClient = PostgresDB.getInstance();
export default dBClient;
