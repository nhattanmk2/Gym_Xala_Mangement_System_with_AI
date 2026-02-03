import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getToken, getRoles } from "../utils/authStorage";

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      const roles = await getRoles();

      if (!token) {
        router.replace("/login");
        return;
      }

      const role = roles?.[0];

      if (role === "ROLE_PT") {
        router.replace("/(pt)/pt-home");
      } else if (role === "ROLE_MEMBER") {
        router.replace("/(member)/member-home");
      } else {
        router.replace("/login");
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  if (checkingAuth) return null; // tránh render khi chưa kiểm tra xong

  return <Stack screenOptions={{ headerShown: false }} />;
}

