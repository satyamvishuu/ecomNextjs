"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductAndStatus() {
      try {
        // Fetch product data
        const { data: productData } = await axios.get(`/api/products/${id}`);
        setProduct(productData);

        // Check if user purchased
        const { data: status } = await axios.post("/api/downloads/check", { productId: id });
        setHasPurchased(status.downloaded);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndStatus();
  }, [id]);

  const handleBuy = async () => {
    const { data } = await axios.post("/api/checkout", { productId: id });
    if (data?.url) {
      router.push(data.url);
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/downloads/file?productId=${id}`;
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      <p className="mb-2">{product.description}</p>
      <p className="mb-4 text-lg font-semibold">₹{product.price}</p>

      {hasPurchased ? (
        <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded">
          Download
        </button>
      ) : (
        <button onClick={handleBuy} className="bg-blue-600 text-white px-4 py-2 rounded">
          Buy Now
        </button>
      )}
    </div>
  );
}
