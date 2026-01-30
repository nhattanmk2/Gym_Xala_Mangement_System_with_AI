import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "GYM_XALA_TOKEN";
const ROLE_KEY = "GYM_XALA_ROLES";

export const saveAuth = async (token, roles) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(ROLE_KEY, JSON.stringify(roles));
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getRoles = async () => {
  const roles = await AsyncStorage.getItem(ROLE_KEY);
  return roles ? JSON.parse(roles) : [];
};

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
};
