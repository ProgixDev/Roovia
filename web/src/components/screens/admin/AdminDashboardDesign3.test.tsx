import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDashboardDesign3 } from "./AdminDashboardDesign3";

// next/link reaches for the router, and the pills light the current path.
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/admin",
}));

// jsdom never lays anything out, so the chart's own coordinate math (mouse
// position ÷ element width) would divide by zero without this.
beforeAll(() => {
  jest.spyOn(HTMLDivElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    width: 350,
    top: 0,
    height: 160,
    right: 350,
    bottom: 160,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

describe("AdminDashboardDesign3", () => {
  it("renders every panel of the reference screen from its own defaults", () => {
    render(<AdminDashboardDesign3 />);

    expect(screen.getByText("Cryptech")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Crypto Market Cap" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "All Crypto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fear and Greed Index" })).toBeInTheDocument();

    // Coin tiles carry the prices; the table repeats them in its own rows.
    expect(screen.getAllByText("$118,506.21")).toHaveLength(2);
    expect(screen.getAllByText("$2,989.81")).toHaveLength(2);
    expect(screen.getAllByText("$95.15")).toHaveLength(2);
    expect(screen.getAllByText("$2.82")).toHaveLength(2);
  });

  it("marks the current section in the top nav", () => {
    render(<AdminDashboardDesign3 />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Exchange" })).not.toHaveAttribute("aria-current");
  });

  it("draws the caller's default range and switches on click", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardDesign3 />);

    const marketCap = within(screen.getByRole("heading", { name: "Crypto Market Cap" }).closest("section")!);
    expect(marketCap.getByText("Mon")).toBeInTheDocument();
    // The callout only carries two-decimal figures ("$2.63T"); the axis
    // ticks are one-decimal ("$2.5T") and stay regardless of hover.
    expect(marketCap.queryByText(/^\$\d\.\d\dT$/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "6M" }));

    expect(screen.getByText("Apr")).toBeInTheDocument();
    expect(screen.queryByText("Mon")).not.toBeInTheDocument();
  });

  it("shows a column's figure only while the cursor is over it, and every column shares one fill", () => {
    render(<AdminDashboardDesign3 />);

    const row = screen.getByText("Mon").closest("ul")!.previousElementSibling as HTMLElement;

    // 1W has 7 columns over a 350-wide row (mocked) — x=120 lands in the
    // third, Wed.
    fireEvent.mouseMove(row, { clientX: 120, clientY: 0 });
    expect(screen.getByText("$2.63T")).toBeInTheDocument();

    // Only the height carries the value — Fri (2.1T) and Sat (2.75T) get the
    // same fill and the same rim on top, just a different bar height.
    const bars = row.querySelectorAll<HTMLElement>(":scope > div > div:last-child");
    const fri = bars[4];
    const sat = bars[5];
    expect(fri.style.backgroundImage).toBe(sat.style.backgroundImage);
    expect(fri.style.borderTopColor).toBe(sat.style.borderTopColor);

    fireEvent.mouseLeave(row);
    expect(screen.queryByText("$2.63T")).not.toBeInTheDocument();
  });

  it("states each move's direction with an arrow, not colour alone", () => {
    render(<AdminDashboardDesign3 />);

    // Tether is the one falling row in the reference figures.
    const tether = screen.getByText("Tether").closest("tr");
    expect(tether).not.toBeNull();
    expect(tether).toHaveTextContent("0.05%");
    expect(tether).toHaveTextContent("▼");

    const bitcoin = screen.getByText("Bitcoin").closest("tr");
    expect(bitcoin).toHaveTextContent("▲");
  });

  it("reads the index out for assistive tech, gauge and all", () => {
    render(<AdminDashboardDesign3 />);

    expect(screen.getByRole("img", { name: "68 — Greed" })).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("takes real data over its defaults when the caller passes some", () => {
    render(<AdminDashboardDesign3 brand="Studio Desk" />);

    expect(screen.getByText("Studio Desk")).toBeInTheDocument();
    expect(screen.queryByText("Cryptech")).not.toBeInTheDocument();
  });
});
