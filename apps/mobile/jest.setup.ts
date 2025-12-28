import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";
jest.mock("expo-router", () => ({
  ...(() => {
    const React = require("react");
    const { Text } = require("react-native");
    const mockRouter = require("./test-utils/expoRouterMock");
    return {
      useRouter: mockRouter.useRouter,
      useLocalSearchParams: mockRouter.useLocalSearchParams,
      Link: ({ children }: { children: React.ReactNode }) => React.createElement(Text, null, children),
    };
  })(),
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

try {
  require.resolve("react-native/Libraries/Animated/NativeAnimatedHelper");
  jest.doMock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}));
} catch {
  // Module removed in newer React Native versions.
}
