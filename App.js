import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Provider } from "react-redux";
import store from "./store";
import StackNavigator from "./StackNavigator";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    console.log("ErrorBoundary caught", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={{ color: "red", fontWeight: "700", fontSize: 18 }}>
            Runtime error caught by ErrorBoundary
          </Text>
          <Text style={{ marginTop: 12 }}>{String(this.state.error)}</Text>
          <Text style={{ marginTop: 12, color: "gray" }}>
            {this.state.info?.componentStack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <StackNavigator />
      </ErrorBoundary>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    padding: 20,
  },
});
