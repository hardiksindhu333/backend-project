import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/authApi.js";
import useAuthStore from "../store/authStore.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      console.log("LOGIN SUCCESS", data);

      if (data?.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }

      login(data.data.user); // store user

      toast.success("Login successful");

      navigate("/"); 
    },

    onError: (error) => {
      console.log("LOGIN ERROR", error);
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
};