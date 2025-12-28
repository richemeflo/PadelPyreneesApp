import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthContext, AuthState } from "@/context/AuthContext";

type RenderWithProvidersOptions = RenderOptions & {
  auth?: AuthState | null;
  queryClient?: QueryClient;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { auth = null, queryClient = createTestQueryClient(), ...options }: RenderWithProvidersOptions = {}
) {
  const authValue = {
    auth,
    signIn: jest.fn(),
    signOut: jest.fn(),
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={authValue}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  );

  return {
    authValue,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
