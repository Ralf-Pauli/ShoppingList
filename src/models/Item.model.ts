import { z } from 'zod';

export const ItemSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    shoppingListId: z.string().uuid(),
    checked: z.boolean().default(false),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type Item = z.infer<typeof ItemSchema>;