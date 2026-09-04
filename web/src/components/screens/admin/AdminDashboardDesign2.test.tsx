import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";
import { AdminDashboardDesign2 } from "./AdminDashboardDesign2";

// next/link reaches for the router; outside the app router there is none.
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/admin",
}));

describe("AdminDashboardDesign2", () => {
  it("renders every panel of the reference screen from its own defaults", () => {
    render(<AdminDashboardDesign2 />);

    expect(screen.getByRole("heading", { name: "Lifestats", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Challenges" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "June 2023" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Output" })).toBeInTheDocument();

    // Vitals, ring centre, output figure.
    expect(screen.getByText("108bpm")).toBeInTheDocument();
    expect(screen.getByText("2.5km")).toBeInTheDocument();
    expect(screen.getByText("1.7l")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("1034 ml")).toBeInTheDocument();
    expect(screen.getByText("2.5 Kg")).toBeInTheDocument();
    expect(screen.getByText("amazing!")).toBeInTheDocument();
  });

  it("prints each activity bar's own figure", () => {
    render(<AdminDashboardDesign2 />);

    expect(screen.getByText("23%")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    // "Thu" is both a bar label and a day of the week strip.
    expect(screen.getAllByText("Thu")).toHaveLength(2);
  });

  it("states each challenge's progress and status in text, not colour alone", () => {
    render(<AdminDashboardDesign2 />);

    expect(screen.getByText("15,000 steps in a day")).toBeInTheDocument();
    expect(screen.getByText("12540/15000")).toBeInTheDocument();
    expect(screen.getAllByText("On Going")).toHaveLength(2);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("marks the selected day of the week strip", () => {
    render(<AdminDashboardDesign2 />);

    const selected = screen.getByText("20").closest("[aria-current]");
    expect(selected).toHaveAttribute("aria-current", "date");
  });

  // Below `lg` the capsule rail is hidden, leaving this drawer as the only
  // navigation on the screen — and its entries have to carry their labels,
  // since the rail's `title` tooltips are unreachable by touch.
  it("opens a labelled navigation drawer for narrow viewports", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardDesign2 />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sections" }));

    // Scoped to the drawer: the rail is hidden by a CSS breakpoint, and jsdom
    // applies no CSS, so the rail's own links are in this document too.
    const drawer = within(screen.getByRole("dialog"));
    expect(drawer.getByRole("link", { name: "Accounts" })).toBeInTheDocument();
    expect(drawer.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("takes real data over its defaults when the caller passes some", () => {
    render(
      <AdminDashboardDesign2
        title="Studio stats"
        vitals={[{ id: "hr", icon: Heart, value: "64bpm", label: "Resting" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Studio stats", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("64bpm")).toBeInTheDocument();
    expect(screen.queryByText("108bpm")).not.toBeInTheDocument();
  });
});
