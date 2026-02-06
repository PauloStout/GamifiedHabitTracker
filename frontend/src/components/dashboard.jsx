import { useEffect, useState } from "react";
import { fetchDashboardData } from "../api/api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      <ul>
        {data.users.map((user, index) => (
          <li key={index}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
