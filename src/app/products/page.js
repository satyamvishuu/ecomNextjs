"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Uncomment this line to debug
        // console.log("API response:", data);

        // If your API returns { products: [...] }
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Documents</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(products) && products.map((product) => (
          <div key={product.id} className="border rounded p-4 shadow">
            <h2 className="font-semibold text-lg">{product.title}</h2>
            <p>{product.description}</p>
            <p className="text-green-600 font-bold mt-2">₹{product.price}</p>
            <Link
              href={`/products/${product.id}`}  // <-- changed here
              className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
