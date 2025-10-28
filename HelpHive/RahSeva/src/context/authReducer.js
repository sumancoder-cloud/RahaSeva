export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        loading: true,
      };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        userRole: action.payload.role,
        user: action.payload.user,
      };
    case 'REGISTER_SUCCESS':
      // Don't store token or authenticate after registration
      // User must login separately
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        userRole: null,
        user: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        userRole: null,
        user: null,
      };
    default:
      return state;
  }
};
