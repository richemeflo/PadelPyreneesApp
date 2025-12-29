import React from "react";
import { Alert } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import MatchCreatorScreen from "../match";
import { createMatch, fetchPlayer } from "@/lib/api";
import { buildAuthState } from "@/test-utils/factories";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

jest.mock("@/lib/api", () => ({
  fetchPlayer: jest.fn(),
  createMatch: jest.fn(),
}));

const fetchPlayerMock = fetchPlayer as jest.MockedFunction<typeof fetchPlayer>;
const createMatchMock = createMatch as jest.MockedFunction<typeof createMatch>;

describe("MatchCreatorScreen", () => {
  let alertSpy: jest.SpyInstance;
  let queryClient: QueryClient | undefined;

  beforeEach(() => {
    jest.useRealTimers();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    queryClient?.clear();
    alertSpy.mockRestore();
  });

  const updateInput = async (placeholder: string, value: string) => {
    const input = screen.getByPlaceholderText(placeholder);
    fireEvent.changeText(input, value);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(placeholder).props.value).toBe(value);
    });
  };

  const pressSubmitButton = () => {
    let node = screen.getByText(/Cr.er le match/i);
    while (node && !node.props?.onPress) {
      node = node.parent as typeof node;
    }
    fireEvent.press(node);
  };

  it("submits a match and shows a success alert", async () => {
    const auth = buildAuthState({ playerId: "player-2", idToken: "token-abc" });

    fetchPlayerMock.mockResolvedValue({
      id: auth.playerId,
      pairsAsA: [{ id: "pair-a", elo: 1200 }],
      pairsAsB: [],
    });
    createMatchMock.mockResolvedValue({ id: "match-1" });

    const result = renderWithProviders(<MatchCreatorScreen />, { auth });
    queryClient = result.queryClient;

    await updateInput("Identifiant de votre paire", "pair-a");
    await updateInput("Identifiant de la paire adverse", "pair-b");
    await updateInput("YYYY-MM-DDTHH:mm:ssZ", "2025-08-12T18:30:00Z");
    pressSubmitButton();

    await waitFor(() => {
      expect(createMatchMock).toHaveBeenCalled();
    });
    expect(createMatchMock).toHaveBeenCalledWith(
      auth,
      expect.objectContaining({
        pairAId: "pair-a",
        pairBId: "pair-b",
        startsAt: "2025-08-12T18:30:00Z",
      }),
    );
    expect(alertSpy).toHaveBeenCalledWith("Match", expect.stringMatching(/succ/i));
  });

  it("shows an error alert when match creation fails", async () => {
    const auth = buildAuthState({ playerId: "player-2", idToken: "token-abc" });

    fetchPlayerMock.mockResolvedValue({
      id: auth.playerId,
      pairsAsA: [{ id: "pair-a", elo: 1200 }],
      pairsAsB: [],
    });
    createMatchMock.mockRejectedValue(new Error("Boom"));

    const result = renderWithProviders(<MatchCreatorScreen />, { auth });
    queryClient = result.queryClient;

    await updateInput("Identifiant de votre paire", "pair-a");
    await updateInput("Identifiant de la paire adverse", "pair-b");
    await updateInput("YYYY-MM-DDTHH:mm:ssZ", "2025-08-12T18:30:00Z");
    pressSubmitButton();

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erreur", "Boom");
    });
  });
});
