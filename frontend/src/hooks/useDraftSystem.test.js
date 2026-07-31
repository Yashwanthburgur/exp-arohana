import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useDraftSystem from "./useDraftSystem.js";
import { REQUIRED_DRAFT_ROLLS } from "../constants/boardConfig.js";

describe("useDraftSystem", () => {
  it("does not allow Ready until both sides have completed the required draft rolls", () => {
    const { result } = renderHook(() => useDraftSystem());

    act(() => {
      result.current.setWhiteArmy(
        Array.from(
          { length: REQUIRED_DRAFT_ROLLS },
          (_, index) => `WHITE-${index}`,
        ),
      );
    });

    act(() => {
      result.current.setWhiteReady(true);
    });

    expect(result.current.whiteReady).toBe(false);

    act(() => {
      result.current.setBlackArmy(
        Array.from(
          { length: REQUIRED_DRAFT_ROLLS },
          (_, index) => `BLACK-${index}`,
        ),
      );
    });

    act(() => {
      result.current.setWhiteReady(true);
    });

    expect(result.current.whiteReady).toBe(true);
  });
});
