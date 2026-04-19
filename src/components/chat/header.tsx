import { View, Text } from "react-native";
import { Ellipsis, Menu, SquarePen } from "lucide-react-native";

export function ChatHeader() {
  return (
    <View
      style={{
        width: "100%",
        height: 100,
        position: "absolute",
        left: 0,
        backgroundColor: "#000",
        borderBottomWidth: 0.5,
        borderBottomColor: "#333",
        paddingHorizontal: 16,
        paddingTop: 40,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Menu size={22} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontFamily: 'Helvetica',
            }}
          >
            ChadGPT
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 18,
          }}
        >
          <SquarePen size={20} color="#fff" />
          <Ellipsis size={20} color="#fff" />
        </View>
      </View>
    </View>
  );
}
