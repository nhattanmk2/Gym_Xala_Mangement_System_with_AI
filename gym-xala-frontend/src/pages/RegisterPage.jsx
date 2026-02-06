import React, { useState } from "react";
import { registerMember } from "../api/authApi";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    // cccd: "",
    // gender: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) errs.fullName = "Họ tên không được để trống";
    if (!form.username.trim()) errs.username = "Username không được để trống";

    if (!form.email) {
      errs.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email không hợp lệ";
    }

    if (!form.password) {
      errs.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 6) {
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    if (!form.phone) {
      errs.phone = "Số điện thoại không được để trống";
    } else if (!/^\d{9,11}$/.test(form.phone)) {
      errs.phone = "Số điện thoại không hợp lệ";
    }

    // if (!form.cccd) {
    //   errs.cccd = "CCCD không được để trống";
    // } else if (!/^\d{9,12}$/.test(form.cccd)) {
    //   errs.cccd = "CCCD không hợp lệ";
    // }

    // if (!form.gender) errs.gender = "Vui lòng chọn giới tính";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    try {
      await registerMember(form);
      alert("Đăng ký thành công! Vui lòng nhập mã xác thực");
      navigate("/verify");
      
    } catch (err) {
        console.error(err);
      setMessage(
        err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại"
      );
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Đăng ký học viên</h2>

        {message && <p style={styles.error}>{message}</p>}

        {renderInput("Họ và tên", "fullName")}
        {renderInput("Username", "username")}
        {renderInput("Email", "email", "email")}
        {renderInput("Mật khẩu", "password", "password")}
        {renderInput("Số điện thoại", "phone")}
        {/* {renderInput("CCCD", "cccd")} */}

        {/* GENDER */}
        {/* <div style={styles.group}>
          <label>Giới tính</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">-- Chọn --</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
          {errors.gender && <span style={styles.err}>{errors.gender}</span>}
        </div> */}

        <button style={styles.button}>Đăng ký</button>

        <p style={{ textAlign: "center", marginTop: 10 }}>
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>
      </form>
    </div>
  );

  function renderInput(label, name, type = "text") {
    return (
      <div style={styles.group}>
        <label>{label}</label>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          style={styles.input}
        />
        {errors[name] && <span style={styles.err}>{errors[name]}</span>}
      </div>
    );
  }
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    padding: 30,
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: { textAlign: "center", marginBottom: 20 },
  group: { marginBottom: 12 },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    marginTop: 10,
  },
  err: { color: "red", fontSize: 13 },
  error: { color: "red", textAlign: "center" },
};

export default RegisterPage;
