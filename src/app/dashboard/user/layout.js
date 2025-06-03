import LogoutButton from "../../../components/LogOutBtn.js"

export default function UserLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-60 bg-black p-4">
        <h2 className="text-lg font-semibold mb-4">User Dashboard</h2>
        <ul className="space-y-2">
          <li><a href="/dashboard/user">Home</a></li>
          <li><a href="/dashboard/user/orders">My Orders</a></li>
          <li><LogoutButton /></li>
        </ul>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
