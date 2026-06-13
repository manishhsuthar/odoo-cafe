import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess, selectCurrentUser } from './authSlice';

export const useAuthActions = () => {
  const dispatch = useDispatch();

  const handleLogin = (user, token) => {
    dispatch(loginSuccess({ user, token }));
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  return { handleLogin, handleLogout };
};

export const useCurrentUser = () => {
  return useSelector(selectCurrentUser);
};
