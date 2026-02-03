import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { getRoles } from "../../utils/authStorage";

export default function MemberHome() {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const roles = await getRoles();
      if (!roles.includes("ROLE_MEMBER")) {
        router.replace("/login");
      }
    };

    checkRole();
  }, []);

  return (
    <View>
      <Text>Member Dashboard</Text>
    </View>
  );
}
