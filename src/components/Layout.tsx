const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          background: "#2e7d32", // verde
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Mi App</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "10px 0" }}>Dashboard</li>
          <li style={{ margin: "10px 0" }}>Perfil</li>
        </ul>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "20px", background: "#f9f9f9" }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;