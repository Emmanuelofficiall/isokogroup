import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TrainingAIHelper from "./TrainingAIHelper";

describe("TrainingAIHelper", () => {
  it("returns guidance for a concept request", async () => {
    render(<TrainingAIHelper />);

    fireEvent.change(screen.getByPlaceholderText(/ask about a training topic/i), {
      target: { value: "What is data analysis?" },
    });

    fireEvent.click(screen.getByRole("button", { name: /get guidance/i }));

    expect(await screen.findByText(/Data analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Power BI/i)).toBeInTheDocument();
  });
});
