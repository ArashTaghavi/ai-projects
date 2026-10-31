import { z } from "zod";

export const newChatSchema = z.object({
    name: z.string().trim()
        .min(1, "Document name is required.")
        .refine((name) => Array.from(name).length <= 255, "Document name must be 255 characters or fewer."),
    file: z.file().nullable()
        .refine((file): boolean => file !== null, "Choose a Word document (.docx).")
        .refine((file) => !file || /\.docx$/i.test(file.name), "Only Word documents (.docx) are allowed.")
        .refine((file) => !file || file.size > 0, "Choose a non-empty Word document (.docx)."),
});

export type NewChatFormValues = z.infer<typeof newChatSchema>;
