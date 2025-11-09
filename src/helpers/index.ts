import { productData, trendingProducts } from "@/constants/data";
import type { Products } from "../../type";

export const getProducts = async (): Promise<Products[]> => {
  // Return static product data
  return productData;
};

export const getTrendingProducts = async (): Promise<Products[]> => {
  // Return static trending products data
  return trendingProducts;
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
