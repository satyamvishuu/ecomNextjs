export default function AdminLayout({ children }) {
    return (
      <div className="flex">
        <aside className="w-60 bg-gray-800 text-white p-4">
          <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
          <ul className="space-y-2">
            <li><a href="/dashboard/admin">Dashboard</a></li>
            <li><a href="/dashboard/admin/products">Products</a></li>
            <li><a href="/dashboard/admin/orders">Orders</a></li>
            <li><a href="/logout" className="text-red-300">Logout</a></li>
          </ul>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    );
  }
  