import React from "react";
import "./Login.css";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { loginUser } from "../../Reducer/AuthSlice";

const Login = ({ closeModal,openRegisterModal }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(loginUser(data)).then((res) => {
      console.log("LOGIN RESPONSE:", res);

      if (res?.payload?.status_code === 200) {
        // ✅ Extract token & user (adjust if your API structure differs)
        const token = res.payload.token || res.payload.data?.token;
        const user = res.payload.user || res.payload.data?.user;

        // ✅ Store in sessionStorage
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        // ✅ Close modal
        closeModal();

        // ✅ Reload UI to update navbar
        window.location.reload();
      } else {
        alert("Invalid credentials ❌");
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-login">
        {/* Close Button */}
        <span className="close-btn" onClick={closeModal}>
          ×
        </span>

        <h2>Login</h2>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="error">{errors.email.message}</p>
          )}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}

          {/* Submit */}
          <button type="submit">Login</button>
        </form>

        {/* Register Link */}
       <p className="login-link">
  Don't have an account?
  <button
    onClick={() => openRegisterModal()}   // ✅ ONLY THIS
  >
    <u>Register</u>
  </button>
</p>
      </div>
    </div>
  );
};

export default Login;