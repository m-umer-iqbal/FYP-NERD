import React from "react"

function App() {
  const features = [
    { id: 1, name: "Responza" },
    { id: 2, name: "DOMinex" },
    { id: 3, name: "FormLock" },
    { id: 4, name: "StylePeek" },
    { id: 5, name: "ShotStack" },
    { id: 6, name: "Translify" },
  ];

  return (
    <div style={{
      width: "100vw",        // Laptop ki poori width
      height: "100vh",       // Laptop ki poori height
      padding: "40px",       // Flexible padding
      border: "8px solid #000",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      overflowY: "auto"      // Agar content zyada ho tw scroll ho saky
    }}>

      {/* Navbar Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "4px solid #000",
        paddingBottom: "20px",
        marginBottom: "30px"
      }}>
        <h1 style={{ margin: 0, fontWeight: "900", fontSize: "32px", textTransform: "uppercase" }}>N.E.R.D</h1>
        <button style={{
          padding: "10px 25px",
          border: "3px solid #000",
          background: "none",
          fontWeight: "900",
          fontSize: "16px",
          cursor: "pointer"
        }}>Signup/Login</button>
      </div>

      {/* Main Features: Flexible Layout */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
        {features.map((item) => (
          <div key={item.id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 0",
            borderBottom: "2px solid #eee"
          }}>
            {/* Feature Name: Bold and Start of Line */}
            <span style={{ fontWeight: "900", fontSize: "24px", color: "#000" }}>{item.name}</span>

            {/* GO TO Button: End of same line */}
            <button style={{
              padding: "12px 40px",
              border: "3px solid #000",
              backgroundColor: "#fff",
              fontWeight: "900",
              fontSize: "14px",
              cursor: "pointer",
              transition: "0.2s"
            }}>GO TO</button>
          </div>
        ))}
      </div>

      {/* Footer Section: No website link line */}
      <div style={{ borderTop: "4px solid #000", marginTop: "40px", paddingTop: "30px" }}>
        <div style={{ textAlign: "center", fontWeight: "900", fontSize: "16px", letterSpacing: "1px" }}>
          @NERD copyrigth 2026
        </div>
      </div>
    </div>
  );
}

export default App
