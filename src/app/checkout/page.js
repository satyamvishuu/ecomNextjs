"use client";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [orderData, setOrderData] = useState(null);

  const createOrder = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      credentials: "include", // Important if you use cookies for auth!
    });
    const data = await res.json();
    setOrderData(data);

    // Only open Razorpay if order creation succeeded
    if (data.order && data.order.id) {
      openRazorpay(data.order);
    }
  };

  const openRazorpay = (order) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Digital Shop",
      description: "Order Payment",
      order_id: order.id,
      handler: function (response) {
        alert("Payment successful 🎉");
        console.log("Payment Response:", response);
      },
      prefill: {
        email: "user@example.com", // Replace dynamically if needed
      },
      theme: { color: "#0f172a" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    // Load Razorpay script on mount
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <button
        onClick={createOrder}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Pay Now
      </button>

      {/* Show order details and items after order is created */}
      {orderData && orderData.items && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Order Details</h2>
          <ul className="mb-4">
            {orderData.items.map((item) => (
              <li key={item.productId} className="mb-2">
                <span className="font-medium">{item.name}</span> &times; {item.quantity} @ ₹{item.price}
              </li>
            ))}
          </ul>
          <div>
            <strong>Total:</strong> ₹
            {orderData.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            )}
          </div>
        </div>
      )}
    </div>
  );
}
