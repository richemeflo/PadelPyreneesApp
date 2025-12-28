import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";

import { ClubMap } from "../ClubMap";
import { buildClubInfo } from "../../../test-utils/factories";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";

describe("ClubMap", () => {
  let queryClient: QueryClient | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-06T10:00:00Z"));
  });

  afterEach(() => {
    queryClient?.clear();
    jest.useRealTimers();
  });

  it("renders club details and current opening hours", () => {
    const clubInfo = buildClubInfo();
    const result = renderWithProviders(<ClubMap clubInfo={clubInfo} />);
    queryClient = result.queryClient;

    expect(screen.getByRole("heading", { name: clubInfo.name })).toBeInTheDocument();
    expect(screen.getByText(clubInfo.address)).toBeInTheDocument();
    expect(screen.getByText("Ouvert")).toBeInTheDocument();
    expect(screen.getAllByText("08:00 - 22:00").length).toBeGreaterThan(0);
  });

  it("opens maps when clicking the itinerary button", () => {
    const clubInfo = buildClubInfo({
      location: { lat: 12.34, lng: 56.78 },
    });
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    const result = renderWithProviders(<ClubMap clubInfo={clubInfo} />);
    queryClient = result.queryClient;

    fireEvent.click(screen.getByRole("button", { name: /itin/i }));

    expect(openSpy).toHaveBeenCalledWith("https://www.google.com/maps?q=12.34,56.78", "_blank");
    openSpy.mockRestore();
  });

  it("shows overflow message when amenities exceed the limit", () => {
    const clubInfo = buildClubInfo({
      amenities: Array.from({ length: 10 }, (_value, index) => `Amenity ${index + 1}`),
    });
    const result = renderWithProviders(<ClubMap clubInfo={clubInfo} />);
    queryClient = result.queryClient;

    expect(screen.getByText(/Et 2 autre/)).toBeInTheDocument();
  });
});
