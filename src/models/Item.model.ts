import { z } from 'zod';

const MIN_NAME_LENGTH = 1;
const MIN_NAME_ERROR = "Name must be at least 1 character long.";

export const ItemSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(MIN_NAME_LENGTH, MIN_NAME_ERROR),
    shopping_list_id: z.string().uuid(),
    checked: z.boolean().default(false),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const ItemCreationSchema = z.object({
    name: z.string().min(1),
    shopping_list_id: z.string().uuid(),
});

export type Item = z.infer<typeof ItemSchema>;