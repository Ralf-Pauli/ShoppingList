import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export function createPool() {
    const pool = new Pool({
        user: process.env.USER,
        host: process.env.HOST,
        password: process.env.PASSWORD,
        port: parseInt(process.env.DBPORT || "5432"),
        database: process.env.DATABASE
    });

    pool.on("error", (err, client) => {
        console.error("Unexpected error on idle client", err);
        process.exit(-1);
    });

    return pool;
}

export const pool = createPool();
