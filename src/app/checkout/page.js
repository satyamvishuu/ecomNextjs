// "use client";
// import { useEffect, useState } from "react";

// // Simulate getting user email from session/context (replace with your logic)
// function useUserEmail() {
//   return "user@example.com";
// }

// export default function CheckoutPage() {
//   const [orderData, setOrderData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const userEmail = useUserEmail();

//   useEffect(() => {
//     if (!window.Razorpay) {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.async = true;
//       document.body.appendChild(script);
//     }
//   }, []);

//   const createOrder = async () => {
//     setLoading(true);
//     const res = await fetch("/api/checkout", {
//       method: "POST",
//       credentials: "include",
//     });
//     const data = await res.json();
//     setOrderData(data);

//     if (data.order && data.order.id) {
//       openRazorpay(data.order, data.user);
//     } else {
//       alert(data.error || "Order creation failed");
//     }
//     setLoading(false);
//   };

//   const openRazorpay = (order, user) => {
//     const options = {
//       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//       amount: order.amount,
//       currency: order.currency,
//       name: "Digital Shop",
//       description: "Order Payment",
//       order_id: order.id,
//       handler: function (response) {
//         fetch("/api/checkout/verify", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             amount: order.amount,
//             currency: order.currency,
//             receipt: order.receipt,
//           }),
//         })
//           .then((res) => res.json())
//           .then((data) => {
//             if (data.success) {
//               alert("Payment verified and order placed! 🎉");
//             } else {
//               alert("Payment verification failed: " + data.error);
//             }
//           });
//       },
//       prefill: {
//         email: user?.email || userEmail,
//       },
//       theme: { color: "#0f172a" },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Checkout</h1>
//       <button
//         onClick={createOrder}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         disabled={loading}
//       >
//         {loading ? "Processing..." : "Pay Now"}
//       </button>

//       {orderData && orderData.items && (
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold mb-2">Order Details</h2>
//           <ul className="mb-4">
//             {orderData.items.map((item) => (
//               <li key={item.productId} className="mb-2">
//                 <span className="font-medium">{item.name}</span> &times; {item.quantity} @ ₹{item.price}
//               </li>
//             ))}
//           </ul>
//           <div>
//             <strong>Total:</strong> ₹
//             {orderData.items.reduce(
//               (sum, item) => sum + item.price * item.quantity,
//               0
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }







"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!productId) {
      setMessage("No product selected");
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        setMessage("Product not found");
      }
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  // Razorpay checkout handler
  async function handlePayment() {
    setPaymentProcessing(true);
    try {
      // Create Razorpay order on backend
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const { orderId, razorpayKey } = await res.json();

      if (!orderId || !razorpayKey) {
        setMessage("Failed to create payment order");
        setPaymentProcessing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        order_id: orderId,
        amount: product.price * 100, // in paise
        currency: "INR",
        name: "Your Company",
        description: product.title,
        handler: async function (response) {
          // Call backend to verify payment
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: product.price,
              currency: "INR",
              receipt: orderId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setMessage("Payment successful! You can now download your document.");
            // You can also enable download button here or redirect
          } else {
            setMessage("Payment verification failed.");
          }
        },
        prefill: {
          email: "", // Optionally prefill user email
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage("Payment failed. Try again.");
    }
    setPaymentProcessing(false);
  }

  if (loading) return <p>Loading product info...</p>;

  if (!product)
    return (
      <main className="p-6 max-w-xl mx-auto">
        <p>{message || "Product not found"}</p>
      </main>
    );

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <h2 className="text-xl font-semibold">{product.title}</h2>
      <p>{product.description}</p>
      <p className="font-bold mt-2 mb-4">Price: ₹{product.price}</p>

      <button
        onClick={handlePayment}
        disabled={paymentProcessing}
        className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
      >
        {paymentProcessing ? "Processing..." : "Pay Now"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}

