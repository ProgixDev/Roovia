import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDashboardDesign4 } from "./AdminDashboardDesign4";

// jsdom never lays anything out, so the chart's own coordinate math (mouse
// position ÷ element width) would divide by zero without this.
beforeAll(() => {
  jest.spyOn(SVGSVGElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    width: 320,
    top: 0,
    height: 150,
    right: 320,
    bottom: 150,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

// next/link reaches for the router, and the pills light the current path.
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/admin",
}));

describe("AdminDashboardDesign4", () => {
  it("renders every panel of the reference screen from its own defaults", () => {
    render(<AdminDashboardDesign4 />);

    expect(screen.getByRole("heading", { name: "Welcome back, Angela", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity by time" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent transactions" })).toBeInTheDocument();

    // Revenue, its delta, and the two band totals.
    expect(screen.getAllByText("$16,957.00")).toHaveLength(2);
    expect(screen.getByText("+12.67%")).toBeInTheDocument();
    expect(screen.getByText("$4,465.00")).toBeInTheDocument();
    expect(screen.getByText("$8,458.70")).toBeInTheDocument();
    expect(screen.getByText("January 26")).toBeInTheDocument();
    expect(screen.getByText("February 26")).toBeInTheDocument();
  });

  it("marks the current section in the top nav", () => {
    render(<AdminDashboardDesign4 />);

    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("tracks which period is selected", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardDesign4 />);

    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Year" }));

    expect(screen.getByRole("button", { name: "Year" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows no figures until the chart is actually hovered", () => {
    render(<AdminDashboardDesign4 />);

    const analytics = within(screen.getByRole("heading", { name: "Analytics" }).closest("section")!);
    expect(analytics.getByText("Income")).toBeInTheDocument();
    expect(analytics.getByText("Expenses")).toBeInTheDocument();
    expect(analytics.queryByText(/^\$/)).not.toBeInTheDocument();
    expect(analytics.getByRole("img", { name: /Move the pointer/ })).toBeInTheDocument();
  });

  it("reads a point's figures while the cursor is over it, and drops them once it leaves", () => {
    render(<AdminDashboardDesign4 />);

    const chart = screen.getByRole("img", { name: /Move the pointer/ });
    // The chart is 320 units wide over 6 points (Mar..Aug) — x = 320 lands on
    // the last one, Aug.
    fireEvent.mouseMove(chart, { clientX: 320, clientY: 0 });

    expect(screen.getByRole("img", { name: "Aug: Income $8,215.00, Expenses $4,760.00" })).toBeInTheDocument();
    expect(screen.getByText("$8,215.00")).toBeInTheDocument();
    expect(screen.getByText("$4,760.00")).toBeInTheDocument();

    fireEvent.mouseLeave(chart);

    expect(screen.getByRole("img", { name: /Move the pointer/ })).toBeInTheDocument();
    expect(screen.queryByText("$8,215.00")).not.toBeInTheDocument();
    expect(screen.queryByText("$4,760.00")).not.toBeInTheDocument();
  });

  it("lists the transactions with their tags and amounts", () => {
    render(<AdminDashboardDesign4 />);

    expect(screen.getByText("Isabella Garcia")).toBeInTheDocument();
    expect(screen.getAllByText("Multimedia")).toHaveLength(2);
    expect(screen.getAllByText("-$248.80")).toHaveLength(2);
    expect(screen.getByText("+$500.00")).toBeInTheDocument();
  });

  it("takes real data over its defaults when the caller passes some", () => {
    render(<AdminDashboardDesign4 brand="Studio Desk" personName="Sam" />);

    expect(screen.getByText("Studio Desk")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back, Sam", level: 1 })).toBeInTheDocument();
  });
});
