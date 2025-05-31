"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductAndCheckAccess() {
      // 1. Fetch product details
      const productRes = await fetch(`/api/products/${productId}`);
      const productData = await productRes.json();
      setProduct(productData);

      // 2. Check if user purchased it
      const res = await fetch(`/api/downloads/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setDownloadUrl(data.downloadUrl);
      }

      setLoading(false);
    }

    fetchProductAndCheckAccess();
  }, [productId]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <p>{product.description}</p>
      <p className="my-2">Price: ₹{product.price}</p>

      {downloadUrl ? (
        <a href={downloadUrl} download>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Download
          </button>
        </a>
      ) : (
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Buy Now
        </button>
      )}
    </div>
  );
}
