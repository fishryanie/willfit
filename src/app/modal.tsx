import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from 'components/base';

export default function ModalScreen() {
  return (
    <ThemedView flex contentCenter padding={20}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
