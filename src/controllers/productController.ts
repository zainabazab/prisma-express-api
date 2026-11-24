import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// GET all products
export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
    });
  }
};

// CREATE product
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, price, stock } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      (stock !== undefined &&
        (!Number.isInteger(stock) || stock < 0)) ||
      (description !== undefined &&
        description !== null &&
        typeof description !== "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid product data",
      });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description ?? null,
        price,
        stock: stock ?? 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, stock } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const data: {
      name?: string;
      description?: string | null;
      price?: number;
      stock?: number;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid product name",
        });
        return;
      }
      data.name = name.trim();
    }

    if (description !== undefined) {
      if (
        description !== null &&
        typeof description !== "string"
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid description",
        });
        return;
      }
      data.description = description;
    }

    if (price !== undefined) {
      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid price",
        });
        return;
      }
      data.price = price;
    }

    if (stock !== undefined) {
      if (!Number.isInteger(stock) || stock < 0) {
        res.status(400).json({
          success: false,
          message: "Invalid stock",
        });
        return;
      }
      data.stock = stock;
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      res.status(409).json({
        success: false,
        message: "Cannot delete product because it is referenced by an order",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};