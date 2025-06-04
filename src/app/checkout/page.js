"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Simulate getting user email from session/context (replace with your logic)
function useUserEmail() {
  return "user@example.com";
}

export default function CheckoutPage() {
  const [product, setProduct] = useState(null);      // For Buy Now
  const [cartItems, setCartItems] = useState([]);    // For Cart
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [downloadItems, setDownloadItems] = useState([]);
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const userEmail = useUserEmail();

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch product for Buy Now
  useEffect(() => {
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch(() => setProduct(null));
    }
  }, [productId]);

  // Fetch cart items for cart checkout
  useEffect(() => {
    if (!productId) {
      fetch("/api/cart", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setCartItems(data.items || []))
        .catch(() => setCartItems([]));
    }
  }, [productId]);

  // Create order (single product or cart)
  const createOrder = async () => {
    setLoading(true);
    let body = {};
    if (productId && product) {
      body.productId = product.id; // For Buy Now
    }
    // For cart checkout, body stays empty

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      alert("Checkout failed: " + text);
      setLoading(false);
      return;
    }
    
    const data = await res.json();
    setOrderData(data);

    if (data.order && data.order.id) {
      openRazorpay(data.order, userEmail, data.items);
    } else {
      alert(data.error || "Order creation failed");
    }
    setLoading(false);
  };

  // Razorpay payment
  const openRazorpay = (order, email, purchasedItems) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Digital Shop",
      description: "Order Payment",
      order_id: order.id,
      handler: function (response) {
        fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            productId: productId || null,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setPaymentSuccess(true);
              setDownloadItems(purchasedItems);
              alert("Payment verified and order placed! 🎉");
            } else {
              alert("Payment verification failed: " + data.error);
            }
          });
      },
      prefill: {
        email: email,
      },
      theme: { color: "#0f172a" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // UI
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* Show product for Buy Now */}
      {productId && product && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{product.title}</h2>
          <p>{product.description}</p>
          <p className="font-bold">₹{product.price}</p>
        </div>
      )}

      {/* Show cart items if cart checkout */}
      {!productId && cartItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Cart Items</h2>
          <ul className="mb-4">
            {cartItems.map((item) => (
              <li key={item.id} className="mb-2">
                <span className="font-medium">{item.product.title}</span> &times; {item.quantity} @ ₹{item.product.price}
              </li>
            ))}
          </ul>
          <div>
            <strong>Total:</strong> ₹
            {cartItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            )}
          </div>
        </div>
      )}

      {/* Show message if nothing to checkout */}
      {!productId && cartItems.length === 0 && (
        <div className="mb-6 text-red-500">Your cart is empty.</div>
      )}

      {!paymentSuccess && (
        <button
          onClick={createOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading || (!productId && cartItems.length === 0)}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      )}

      {/* Show order details after order creation */}
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

      {/* Show download links after payment success */}
      {paymentSuccess && downloadItems.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Download Your Files</h2>
          <ul>
            {downloadItems.map((item) => (
              <li key={item.productId} className="mb-2">
                <a
                  href={`/api/download/${item.productId}`}
                  className="text-blue-600 underline"
                  download
                  target="_blank"
                >
                  Download {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}









// "use client";
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// export default function CheckoutPage() {
//   const searchParams = useSearchParams();
//   const productId = searchParams.get("productId");

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [paymentProcessing, setPaymentProcessing] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (!productId) {
//       setMessage("No product selected");
//       setLoading(false);
//       return;
//     }

//     async function fetchProduct() {
//       const res = await fetch(`/api/products/${productId}`);
//       if (res.ok) {
//         const data = await res.json();
//         setProduct(data);
//       } else {
//         setMessage("Product not found");
//       }
//       setLoading(false);
//     }
//     fetchProduct();
//   }, [productId]);

//   // Razorpay checkout handler
//   async function handlePayment() {
//     setPaymentProcessing(true);
//     try {
//       // Create Razorpay order on backend
//       const res = await fetch("/api/checkout", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId }),
//       });
//       const { orderId, razorpayKey } = await res.json();

//       if (!orderId || !razorpayKey) {
//         setMessage("Failed to create payment order");
//         setPaymentProcessing(false);
//         return;
//       }

//       const options = {
//         key: razorpayKey,
//         order_id: orderId,
//         amount: product.price * 100, // in paise
//         currency: "INR",
//         name: "Your Company",
//         description: product.title,
//         handler: async function (response) {
//           // Call backend to verify payment
//           const verifyRes = await fetch("/api/checkout/verify", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               amount: product.price,
//               currency: "INR",
//               receipt: orderId,
//             }),
//           });

//           const verifyData = await verifyRes.json();

//           if (verifyData.success) {
//             setMessage("Payment successful! You can now download your document.");
//             // You can also enable download button here or redirect
//           } else {
//             setMessage("Payment verification failed.");
//           }
//         },
//         prefill: {
//           email: "", // Optionally prefill user email
//         },
//         theme: {
//           color: "#3399cc",
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       setMessage("Payment failed. Try again.");
//     }
//     setPaymentProcessing(false);
//   }

//   if (loading) return <p>Loading product info...</p>;

//   if (!product)
//     return (
//       <main className="p-6 max-w-xl mx-auto">
//         <p>{message || "Product not found"}</p>
//       </main>
//     );

//   return (
//     <main className="p-6 max-w-xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">Checkout</h1>
//       <h2 className="text-xl font-semibold">{product.title}</h2>
//       <p>{product.description}</p>
//       <p className="font-bold mt-2 mb-4">Price: ₹{product.price}</p>

//       <button
//         onClick={handlePayment}
//         disabled={paymentProcessing}
//         className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
//       >
//         {paymentProcessing ? "Processing..." : "Pay Now"}
//       </button>

//       {message && <p className="mt-4">{message}</p>}
//     </main>
//   );
// }

