import { Request, Response } from "express";
import { prisma } from "../config/prisma";


export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items } = req.body;

    // 1. Validate request data
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and a non-empty items array are required",
      });
    }

    // 2. Validate user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // 3. Validate order items
    for (const item of items) {
      if (
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item needs a valid productId and positive quantity",
        });
      }
    }

    // 4. Prevent duplicate products in the same order
    const productIds = items.map(
      (item: { productId: number }) => item.productId
    );

    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "A product can only appear once in an order",
      });
    }

    // 5. Start database transaction
    const order = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        // 6. Calculate total using database price
        const itemPrice = Number(product.price);
        total += itemPrice * item.quantity;

        // 7. Save purchase price snapshot
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        // 8. Atomically check and decrease stock
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      // 9. Create order and related order items
      return tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          success: false,
          message: "Insufficient product stock",
        });
      }
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};


export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
    });
  }
};