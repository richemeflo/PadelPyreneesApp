import React from "react";
import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react-native";

import DashboardScreen from "../index";
import { fetchPlayer, fetchTournaments } from "@/lib/api";
import { buildAuthState } from "@/test-utils/factories";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

jest.mock("@/lib/api", () => ({
  fetchPlayer: jest.fn(),
  fetchTournaments: jest.fn(),
}));

const fetchPlayerMock = fetchPlayer as jest.MockedFunction<typeof fetchPlayer>;
const fetchTournamentsMock = fetchTournaments as jest.MockedFunction<typeof fetchTournaments>;

describe("DashboardScreen", () => {
  let queryClient: QueryClient | undefined;

  afterEach(() => {
    queryClient?.clear();
  });

  it("shows a login prompt when auth is missing", () => {
    const result = renderWithProviders(<DashboardScreen />, { auth: null });
    queryClient = result.queryClient;

    expect(
      screen.getByText("Connectez-vous pour voir votre tableau de bord."),
    ).toBeTruthy();
    expect(fetchPlayerMock).not.toHaveBeenCalled();
    expect(fetchTournamentsMock).not.toHaveBeenCalled();
  });

  it("renders player info and tournaments when auth is present", async () => {
    const auth = buildAuthState({ playerId: "player-9", idToken: "token-999" });

    fetchPlayerMock.mockResolvedValue({
      id: "player-9",
      pseudo: "Alex",
      elo: 1234,
      locale: "fr",
      pairsAsA: [{ id: "pair-a", elo: 1200 }],
      pairsAsB: [],
    });
    fetchTournamentsMock.mockResolvedValue([
      { id: "t-1", name: "Open Test", startsAt: "2025-08-12T18:30:00Z" },
    ]);

    const result = renderWithProviders(<DashboardScreen />, { auth });
    queryClient = result.queryClient;

    expect(await screen.findByText("Bienvenue")).toBeTruthy();
    expect(await screen.findByText("Alex")).toBeTruthy();
    expect(await screen.findByText("Elo: 1234")).toBeTruthy();
    expect(await screen.findByText("Open Test")).toBeTruthy();
    expect(fetchPlayerMock).toHaveBeenCalledWith(auth, "player-9");
    expect(fetchTournamentsMock).toHaveBeenCalledWith(auth, 3);
  });
});
