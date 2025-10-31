import { isAxiosError } from "axios";
import API from "../Api";
import { AUTH_LOGIN, AUTH_REGISTER } from "../endpoint";
import { useLoginStore, useRegisterStore, type ApiError, type RegisterResponse } from "../Store/authRegisterStore";
import type { AuthResponse } from "../../Pages/Types/Types";

export type RegisterPayload = {
  name: string;
  password: string;
};

export const registerUser = async (
  payload: RegisterPayload
): Promise<AuthResponse | null> => {
  const { setRegisterLoading, setRegisterData, setRegisterError } = useRegisterStore.getState();
  setRegisterLoading(true);
  try {
    const res = await API.post<RegisterResponse>(AUTH_REGISTER, payload, {
      timeout: 15000,
    });
    console.log(res,"responsee_____")
    const body = res.data;
    console.log(body,"bodyyyyyyyyyyyy_________")
    if (body.error) {
      const err: ApiError = { message: body.message };
      setRegisterError(err);
      console.log(body,"Isnidebodyyyyyyyyyyyy_________")
      return body;
    }
    console.log(body,"check the bodyyy)____")
    setRegisterData(body);
    return body;
  } catch (err: unknown) {
    let apiErr: ApiError = { message: "Unable to register" };
    if (isAxiosError(err)) {
      apiErr = {
        message: (err.response?.data as { message?: string })?.message ||
         err.response?.statusText ||
          err.message ||
          "Unable to register",
        code: err.response?.status,
        details: err.response?.data,
      };
    } else if (err instanceof Error) {
      apiErr = { message: err.message };
    }
    setRegisterError(apiErr);
    return {
      error: true,
      message: apiErr.message,
    };
  }
};


export const LoginPerson = async (
  payload: RegisterPayload
): Promise<AuthResponse | null> => {
  const { setloginLoading, setloginData, setloginError } = useLoginStore.getState();
  setloginLoading(true);
  setloginError(null);
  try {
    const res = await API.post<RegisterResponse>(AUTH_LOGIN, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    const body = res.data;
    console.log("Login Response:", body);

    if (body.error) {
      setloginError({ message: body.message });
      return body; // body already fits RegisterResponse shape
    }
    console.log(body,"cehcekc the login Body____")
    setloginData(body);
    return body;
  } catch (err: unknown) {
    let apiErr: ApiError = { message: "Unable to login" };
    if (isAxiosError(err)) {
      apiErr = {
        message: (err.response?.data as { message?: string })?.message ||
         err.response?.statusText ||
          err.message ||
          "Unable to register",
        code: err.response?.status,
        details: err.response?.data,
      };
    } else if (err instanceof Error) {
      apiErr = { message: err.message };
    }
    setloginError(apiErr);
    return {
      error: true,
      message: apiErr.message,
    };
  } finally {
    setloginLoading(false);
  }
};