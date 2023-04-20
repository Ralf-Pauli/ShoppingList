import { z } from 'zod';

export const ShoppingListSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    ownerId: z.string().uuid(),
    sharedWith: z.array(z.string().uuid()).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type ShoppingList = z.infer<typeof ShoppingListSchema>;
