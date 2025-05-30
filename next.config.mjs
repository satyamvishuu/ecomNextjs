/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
        bodyParser: false, // Required for Razorpay raw body signature check
      },
};

export default nextConfig;
