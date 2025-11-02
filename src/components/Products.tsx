"use client";
import { getProducts, searchProducts } from "@/helpers";
import React, { useEffect, useState } from "react";
import Container from "./Container";
import ProductsData from "./ProductsData";
import { Products } from "../../type";
import { useSelector } from "react-redux";
import { StateProps } from "../../type";

const ProductsComponent = () => {
  const { searchQuery } = useSelector((state: StateProps) => state.shopping);
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const allProducts = await getProducts();
      
      if (searchQuery && searchQuery.trim() !== "") {
        const filtered = searchProducts(searchQuery);
        setProducts(filtered);
      } else {
        setProducts(allProducts);
      }
      setLoading(false);
    };

    loadProducts();
  }, [searchQuery]);

  if (loading) {
    return (
      <Container className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 -mt-10">
        <div className="col-span-full text-center py-10">Loading products...</div>
      </Container>
    );
  }

  if (products.length === 0 && searchQuery) {
    return (
      <Container className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 -mt-10">
        <div className="col-span-full text-center py-10">
          <p className="text-xl font-semibold">No products found</p>
          <p className="text-gray-600">Try searching with different keywords</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 -mt-10">
      {products?.map((item: Products) => (
        <ProductsData item={item} key={item._id} />
      ))}
    </Container>
  );
};

export default ProductsComponent;
