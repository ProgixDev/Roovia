import { render, screen } from "@testing-library/react-native";
import React from "react";
import { AccessibilityInfo, Text, View } from "react-native";

import { Skeleton, SkeletonLine } from "./Skeleton";

describe("Skeleton", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  // A placeholder has nothing to announce, and a grid of twelve would
  // announce it twelve times. The screen that owns them says "loading" once.
  it("is hidden from screen readers", async () => {
    await render(<Skeleton testID="block" height={40} />);

    // `includeHiddenElements` is required precisely BECAUSE it is hidden:
    // RNTL skips accessibility-hidden elements by default, so needing this
    // flag is itself the evidence the hiding took effect. The flags live on
    // the GROUP, which is what `Skeleton` gives the testID to.
    const group = screen.getByTestId("block", { includeHiddenElements: true });
    expect(group.props.accessibilityElementsHidden).toBe(true);
    expect(group.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  it("does not swallow a label the owning screen puts around it", async () => {
    await render(
      <View accessibilityLabel="Loading your data">
        <Skeleton height={40} />
        <Text>anything</Text>
      </View>,
    );

    expect(screen.getByLabelText("Loading your data")).toBeOnTheScreen();
  });

  // The pulse carries no information the static block does not, so a viewer
  // who has asked for less movement simply gets the block.
  it("checks the reduce-motion setting before animating", async () => {
    const spy = jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);

    await render(<Skeleton height={40} />);

    expect(spy).toHaveBeenCalled();
  });

  it("renders a line without crashing at its default size", async () => {
    await render(<SkeletonLine />);

    expect(screen.root).toBeTruthy();
  });
});
