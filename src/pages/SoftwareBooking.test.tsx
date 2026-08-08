import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SoftwareBooking from "./SoftwareBooking";

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

describe("SoftwareBooking page", () => {
  it("shows department selection before the course list", () => {
    render(
      <MemoryRouter>
        <SoftwareBooking />
      </MemoryRouter>
    );

    expect(screen.getByText(/Choose a Department/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Language Department/i })).toBeInTheDocument();
  });
});
