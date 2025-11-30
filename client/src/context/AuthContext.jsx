import { createContext, useContext, useReducer, useEffect } from "react";
import apiClient from "../utils/api";
import { FullPageLoader } from "../components/LoadingSpinner";

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { ...state, loading: true, error: null };

        case "LOGIN_SUCCESS":
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };

        case "LOGIN_FAILURE":
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };

        case "LOGOUT":
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                error: null,
            };

        case "SET_USER":
            return { ...state, user: action.payload };

        case "SET_LOADING":
            return { ...state, loading: action.payload };

        case "CLEAR_ERROR":
            return { ...state, error: null };

        default:
            return state;
    }
};

const initialState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem("authToken"),
    loading: true,
    error: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    //  Check for existing token on app start
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            dispatch({ type: "SET_LOADING", payload: true });
            apiClient.setAuthToken(token);

            apiClient
                .getCurrentUser()
                .then((user) => {
                    dispatch({
                        type: "LOGIN_SUCCESS",
                        payload: { user, token },
                    });
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);

                    // Only logout if backend says token is invalid
                    if (error?.response?.status === 401) {
                        localStorage.removeItem("authToken");
                        dispatch({ type: "LOGOUT" });
                    }
                })
                .finally(() => {
                    dispatch({ type: "SET_LOADING", payload: false });
                });
        } else {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, []);

    //  LOGIN
    const login = async (credentials) => {
        dispatch({ type: "LOGIN_START" });

        try {
            const response = await apiClient.login(credentials);

            //  Save token in localStorage
            localStorage.setItem("authToken", response.token);

            apiClient.setAuthToken(response.token);

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: {
                    user: response.user,
                    token: response.token,
                },
            });

            return response;
        } catch (error) {
            dispatch({
                type: "LOGIN_FAILURE",
                payload: error.message,
            });
            throw error;
        }
    };

    //  LOGOUT
    const logout = async () => {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("authToken");
            dispatch({ type: "LOGOUT" });
        }
    };

    //  REGISTER
    const register = async (userData) => {
        dispatch({ type: "LOGIN_START" });

        try {
            const response = await apiClient.register(userData);

            //  Save token in localStorage
            localStorage.setItem("authToken", response.token);

            apiClient.setAuthToken(response.token);

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: {
                    user: response.user,
                    token: response.token,
                },
            });

            return response;
        } catch (error) {
            dispatch({
                type: "LOGIN_FAILURE",
                payload: error.message,
            });
            throw error;
        }
    };

    const updateUser = (userData) => {
        dispatch({ type: "SET_USER", payload: userData });
    };

    const clearError = () => {
        dispatch({ type: "CLEAR_ERROR" });
    };

    const value = {
        ...state,
        login,
        logout,
        register,
        updateUser,
        clearError,
    };

    // Show loader only during initial auth check
    if (state.loading && !state.user && localStorage.getItem("authToken")) {
        return <FullPageLoader message="Checking authentication..." />;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;