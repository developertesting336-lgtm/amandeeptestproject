import { useEffect, useState } from "react";
import { Search, Trash2, Users as UsersIcon } from "lucide-react";
import "./Users.css";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | string;
  createdAt?: string;
  isActive?: boolean;
}

const API_ADMIN_USERS = "http://localhost:5000/api/admin/users";

const Users = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(API_ADMIN_USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const rawList = result.data?.users || result.data || result.users || [];
        setUsers(Array.isArray(rawList) ? rawList : []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log("Unable to load live admin users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_ADMIN_USERS}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase().trim()) ||
    u.email?.toLowerCase().includes(search.toLowerCase().trim()) ||
    u._id?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <section className="admin-users-section">
      <div className="users-header">
        <div>
          <span className="users-eyebrow">ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>View registered platform accounts, inspect permissions, and manage user access.</p>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by user name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="users-count">
          {filteredUsers.length} {filteredUsers.length === 1 ? "User" : "Users"}
        </span>
      </div>

      {error && <div className="users-error">{error}</div>}

      {loading ? (
        <div className="users-loading">Loading platform users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-empty">
          <UsersIcon size={48} color="#d9a256" style={{ margin: "0 auto 16px" }} />
          <h3>No Users Found</h3>
          <p>Registered customer and admin accounts will be listed here.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const initial = u.name ? u.name.charAt(0).toUpperCase() : "U";
                const dateStr = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-box">{initial}</div>
                        <div>
                          <strong>{u.name || "User"}</strong>
                          <br />
                          <span className="user-id-sub">#{u._id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>

                    <td>{u.email}</td>

                    <td>
                      <span className={`role-badge ${u.role === "admin" ? "admin" : "user"}`}>
                        {u.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </td>

                    <td>{dateStr}</td>

                    <td>
                      <div className="user-actions">
                        <button
                          className="user-delete-btn"
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Users;
