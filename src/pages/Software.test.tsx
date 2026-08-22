import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Software from "./Software";

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

describe("Software page", () => {
  it("shows the training center experience and actions", () => {
    render(
      <MemoryRouter>
        <Software />
      </MemoryRouter>
    );

    expect(screen.getByText(/Isoko Training Center/i)).toBeInTheDocument();
    expect(screen.getByText(/View Current Intakes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Apply Now/i).length).toBeGreaterThan(0);
  });

  it("offers department-based apply choices", () => {
    render(
      <MemoryRouter>
        <Software />
      </MemoryRouter>
    );

    const departmentChoices = screen.getAllByRole("link", { name: /apply in this department/i });

    expect(departmentChoices.length).toBeGreaterThan(0);
    expect(departmentChoices[0]).toHaveAttribute("href", "/software/booking?department=languages");
  });
});
