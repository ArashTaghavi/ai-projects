import { z } from "zod";

export const questionSchema = z.object({
    query: z.string().trim().min(1, "Enter a question."),
});

export type QuestionValues = z.infer<typeof questionSchema>;
