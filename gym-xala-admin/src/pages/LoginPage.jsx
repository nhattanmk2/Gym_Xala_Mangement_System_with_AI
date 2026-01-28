import React, { useState } from "react";
import { login } from "../api/authApi";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("SUBMIT CLICKED");

    try {
      const data = await login(username, password);

      console.log("LOGIN RESPONSE:", data);

      // ✅ CHECK ROLE ĐÚNG
      if (!data.roles || !data.roles.includes("ROLE_ADMIN")) {
        setError("Bạn không có quyền truy cập trang Admin");
        return;
      }

      // ✅ LƯU TOKEN + INFO
      localStorage.setItem("token", data.token);
      localStorage.setItem("roles", JSON.stringify(data.roles));
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);

      alert("Đăng nhập Admin thành công!");

      // TODO: redirect dashboard
      // window.location.href = "/dashboard";

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Admin Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
    padding: "20px",
  },
  form: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    textAlign: "center",
  },
};

export default LoginPage;
