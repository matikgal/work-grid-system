import { z } from 'zod';

// ZOD: Schemat dla pojedynczej odpowiedzi sklepu
export const ShopResponseSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  shopId: z.string().min(1, "Brak identyfikatora sklepu"),
  value: z.string(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

// ZOD: Schemat dla elementu zamówienia z wciągniętymi relacjami (dołączeniami)
export const ItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  name: z.string(),
  responses: z.array(ShopResponseSchema).optional().default([]),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

// ZOD: Schemat dla całego zamówienia z opcjonalnymi elementami
export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  isLocked: z.boolean().default(false),
  items: z.array(ItemSchema).optional().default([]),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

// TYPESCRIPT
export type ShopResponse = z.infer<typeof ShopResponseSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = OrderSchema.pick({ name: true, userId: true });
export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

export const CreateItemSchema = ItemSchema.pick({ name: true, orderId: true });
export type CreateItemDTO = z.infer<typeof CreateItemSchema>;

export const CreateShopResponseSchema = ShopResponseSchema.pick({ itemId: true, shopId: true, value: true });
export type CreateShopResponseDTO = z.infer<typeof CreateShopResponseSchema>;
