import React from "react";
import { Alert } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";
import { QueryClient } from "@tanstack/react-query";

import SignInScreen from "../sign-in";
import { buildAuthState } from "@/test-utils/factories";
import { routerMock } from "@/test-utils/expoRouterMock";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

describe("SignInScreen", () => {
  let alertSpy: jest.SpyInstance;
  let queryClient: QueryClient | undefined;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    queryClient?.clear();
    alertSpy.mockRestore();
  });

  it("shows an alert when required fields are missing", () => {
    const result = renderWithProviders(<SignInScreen />);
    queryClient = result.queryClient;

    fireEvent.press(screen.getByText("Se connecter"));

    expect(alertSpy).toHaveBeenCalled();
    expect(result.authValue.signIn).not.toHaveBeenCalled();
  });

  it("signs in and navigates when inputs are valid", () => {
    const result = renderWithProviders(<SignInScreen />);
    queryClient = result.queryClient;
    const authState = buildAuthState({ playerId: "player-9", idToken: "token-999" });

    fireEvent.changeText(screen.getByPlaceholderText("Identifiant joueur"), authState.playerId);
    fireEvent.changeText(screen.getByPlaceholderText("ID Token Firebase"), authState.idToken);
    fireEvent.press(screen.getByText("Se connecter"));

    expect(result.authValue.signIn).toHaveBeenCalledWith(authState);
    expect(routerMock.replace).toHaveBeenCalledWith("/(tabs)");
  });
});
