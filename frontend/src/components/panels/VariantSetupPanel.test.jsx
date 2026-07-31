import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import VariantSetupPanel from "./VariantSetupPanel.jsx";

describe("VariantSetupPanel", () => {
  it("hides itself after the user confirms the setup", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <VariantSetupPanel
        isGameStarted={false}
        variant="CLASSIC"
        setVariant={vi.fn()}
        customPieces={null}
        setCustomPieces={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Game Variant")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
