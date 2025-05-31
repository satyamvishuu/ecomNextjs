"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", file);

    const res = await fetch("/api/products/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Document uploaded successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setFile(null);
    } else {
      setMessage(data.error || "Upload failed");
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard - Upload Document</h2>
      {message && <p className="mb-4 text-center">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          required
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          required
          type="number"
          min="0"
          placeholder="Price (in ₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          required
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Publish
        </button>
      </form>
    </main>
  );
}
