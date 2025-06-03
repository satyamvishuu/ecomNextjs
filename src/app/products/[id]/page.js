"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(setProduct)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      <p className="mb-2">{product.description}</p>
      <p className="text-green-600 font-bold mb-2">₹{product.price}</p>
      <a
        href={product.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Download/View File
      </a>
      <div className="mt-4 text-sm text-gray-600">
        Uploaded by: {product.user?.email || "Unknown"}
      </div>
      <Link href="/products" className="block mt-6 text-blue-500 underline">
        ← Back to Products
      </Link>
    </div>
  );
}
