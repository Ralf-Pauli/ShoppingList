import { z } from 'zod';

const MIN_NAME_LENGTH = 1;
const MIN_NAME_ERROR = "Name must be at least 1 character long.";

export const ShoppingListSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(MIN_NAME_LENGTH, MIN_NAME_ERROR),
    ownerId: z.string().uuid(),
    sharedWith: z.array(z.string().uuid()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});


export const ShoppingListCreationSchema = z.object({
    name: z.string().min(MIN_NAME_LENGTH, MIN_NAME_ERROR),
});


export type ShoppingList = z.infer<typeof ShoppingListSchema>;
