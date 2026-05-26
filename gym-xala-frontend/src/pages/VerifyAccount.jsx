import { useState } from "react";
import { verifyAccount } from "../api/authApi";
import { useNavigate } from "react-router-dom";

const VerifyAccount = () => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await verifyAccount({
        username,
        verificationCode: Number(code),
      });

      alert("🎉 Xác thực thành công, vui lòng đăng nhập");
      navigate("/login");
    } catch (err) {
      setError("❌ Mã xác thực không đúng hoặc tài khoản đã được kích hoạt");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Xác thực tài khoản</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleVerify} style={styles.form}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          placeholder="Mã xác thực"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button type="submit">Xác thực</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "80px auto",
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 8,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  error: {
    color: "red",
  },
};

export default VerifyAccount;
