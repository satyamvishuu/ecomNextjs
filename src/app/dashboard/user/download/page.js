"use client";

import { useEffect, useState } from "react";
import DownloadButton from "@/components/DownloadButton";

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      const res = await fetch("/api/downloads");
      const data = await res.json();
      setDownloads(data.downloads || []);
      setLoading(false);
    };

    fetchDownloads();
  }, []);

  if (loading) return <p>Loading downloads...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Downloads</h1>
      {downloads.length === 0 ? (
        <p>No purchased items yet.</p>
      ) : (
        downloads.map((item) => (
          <div key={item.product.id} className="mb-4">
            <p>{item.product.name}</p>
            <DownloadButton productId={item.product.id} />
          </div>
        ))
      )}
    </div>
  );
}
