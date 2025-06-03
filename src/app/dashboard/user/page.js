"use client";
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <p>Loading documents...</p>;
  if (products.length === 0) return <p>No documents available.</p>;

  return (
    <main className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold mb-6">Available Documents</h2>
      <ul className="space-y-4">
        {products.map((product) => (
          <li
            key={product.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold">{product.title}</h3>
              <p>{product.description}</p>
              <p className="mt-1 font-bold">₹{product.price}</p>
            </div>
            <button
              onClick={() => {
                // Redirect to checkout page with product ID as query param
                window.location.href = `/checkout?productId=${product.id}`;
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Buy Now
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
