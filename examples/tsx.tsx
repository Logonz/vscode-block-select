// @ts-nocheck
// App.tsx

import React from "react";

// Define a User interface
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// Sample data array of users
const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", isActive: true },
  { id: 2, name: "Bob", email: "bob@example.com", isActive: false },
  { id: 3, name: "Charlie", email: "charlie@example.com", isActive: true },
];

// UserItem component to display individual user information
const UserItem: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="user-item">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Status: {user.isActive ? "Active" : "Inactive"}</p>
      <button onClick={() => alert(`Contacting ${user.name}`)}>Contact</button>
    </div>
  );
};

// UserList component to display a list of users
const UserList: React.FC = () => {
  return (
    <section className="user-list">
      <h1>Active Users</h1>
      <ul>
        {users
          .filter((user) => user.isActive)
          .map((user) => (
            <li key={user.id}>
              <UserItem user={user} />
            </li>
          ))}
      </ul>
    </section>
  );
};

// Footer component with self-closing tags
const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <hr />
      <p>© 2024 Your Company. All rights reserved.</p>
      <img src="logo.png" alt="Company Logo" />
    </footer>
  );
};

// Main App component integrating all sub-components
const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Welcome to the User Dashboard</h1>
      </header>
      <main>
        <UserList />
        {/* Conditional Rendering */}
        {users.length === 0 && <p>No users available.</p>}
      </main>
      <Footer />
    </div>
  );
};

export default App;
