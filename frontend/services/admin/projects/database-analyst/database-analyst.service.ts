import { httpClient } from "@/lib/http-client";

export interface DatabaseAnswer {
    sql: string;
    text: string;
    result: string;
}

export const databaseAnalystService = {
    ask: (payload: { query: string }) =>
        httpClient<DatabaseAnswer>("/database-analyst/ask", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
};
