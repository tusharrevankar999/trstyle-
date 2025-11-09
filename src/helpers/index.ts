import { productData, trendingProducts } from "@/constants/data";
import type { Products } from "../../type";

const normalizeProducts = (items: Products[]): Products[] =>
  items.map((item) => ({
    ...item,
    oldPrice: Number(item.oldPrice),
    price: Number(item.price),
    rating: Number(item.rating),
    quantity: Number(item.quantity),
  }));

export const getProducts = async (): Promise<Products[]> => {
  // Return normalized static product data
  return normalizeProducts(productData);
};

export const getTrendingProducts = async (): Promise<Products[]> => {
  // Return normalized static trending products data
  return normalizeProducts(trendingProducts);
};

export const calculatePercentage = (oldPrice: any, price: any) => {
  return !!parseFloat(price) && !!parseFloat(oldPrice)
    ? (100 - (oldPrice / price) * 100).toFixed(0)
    : 0;
};

export const getSingleProudct = (_id: number) => {
  const item = productData.find((product) => product._id === _id);
  return item;
};

// Search products by query string
export const searchProducts = (query: string) => {
  if (!query || query.trim() === "") {
    return productData;
  }
  
  const searchTerm = query.toLowerCase().trim();
  return productData.filter((product) => 
    product.title.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
};
