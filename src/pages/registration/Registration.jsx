import React from "react";
import "./Registration.css";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { registerUser } from "../../Reducer/AuthSlice";

const RegisterModal = ({ closeModal, openLogin }) => {

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(registerUser(data)).then((res) => {
      console.log("REGISTER RESPONSE:", res);

      if (res?.payload?.status_code === 201) {

        const user = res.payload.user || res.payload.data?.user;

        if (user) {
          sessionStorage.setItem("user", JSON.stringify(user));
        }

        // ✅ Switch to login modal
        closeModal();
        openLogin();

      } else {
        alert("Registration failed ");
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-register">

        {/* Close Button */}
        <span className="close-btn" onClick={closeModal}>×</span>

        <h2>Register</h2>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>

          <input
            type="text"
            placeholder="Full Name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}

          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword.message}</p>
          )}


          <button type="submit">Register</button>
        </form>

        <p className="login-link">
          Already have an account?
          <button onClick={() => openLogin()}>
            <u>Login</u>
          </button>
        </p>

      </div>
    </div>
  );
};

export default RegisterModal;