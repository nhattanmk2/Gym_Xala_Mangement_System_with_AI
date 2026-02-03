import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { getRoles } from "../../utils/authStorage";

export default function PtHome() {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const roles = await getRoles();
      if (!roles.includes("ROLE_PT")) {
        router.replace("/login");
      }
    };

    checkRole();
  }, []);

  return (
    <View>
      <Text>PT Dashboard</Text>
    </View>
  );
}
