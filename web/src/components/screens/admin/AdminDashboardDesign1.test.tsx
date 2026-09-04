import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDashboardDesign1 } from "./AdminDashboardDesign1";

const push = jest.fn();

// The top bar navigates on a search hit; outside the app router there is no
// router to reach for.
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  usePathname: () => "/admin",
}));

const PROPS = {
  title: "Overview",
  initials: "AD",
  logoutHref: "/",
  stats: [
    {
      id: "bookings",
      label: "Bookings",
      value: "200",
      delta: { label: "+12.4%", direction: "up" as const, tone: "good" as const },
      caption: "vs November",
    },
    {
      id: "cancellation-rate",
      label: "Cancellation rate",
      value: "16.5%",
      delta: { label: "+0.2 pts", direction: "up" as const, tone: "bad" as const },
    },
  ],
  chart: {
    title: "Bookings over time",
    series: [
      { key: "confirmed", label: "Confirmed", color: "var(--chart-1)" },
      { key: "cancelled", label: "Cancelled", color: "var(--chart-5)" },
    ],
    ranges: [
      { label: "Week", value: "week" },
      { label: "Month", value: "month" },
    ],
    dataByRange: {
      week: [
        { label: "Mon", values: { confirmed: 3, cancelled: 1 } },
        { label: "Tue", values: { confirmed: 8, cancelled: 2 } },
      ],
      month: [
        { label: "Jan", values: { confirmed: 40, cancelled: 6 } },
        { label: "Feb", values: { confirmed: 55, cancelled: 9 } },
      ],
    },
    defaultRange: "week",
  },
  queues: [
    {
      id: "applications",
      title: "Pending applications",
      viewAllHref: "#",
      emptyLabel: "Nothing waiting.",
      items: [{ id: "app-1", href: "#", initials: "LM", title: "Studio Meridian" }],
    },
  ],
};

describe("AdminDashboardDesign1", () => {
  beforeEach(() => push.mockClear());

  it("renders the page title, the figures, the chart and the queues", () => {
    render(<AdminDashboardDesign1 {...PROPS} />);

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bookings" })).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("+12.4%")).toBeInTheDocument();
    expect(screen.getByText("vs November")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bookings over time" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pending applications" })).toBeInTheDocument();
    expect(screen.getByText("Studio Meridian")).toBeInTheDocument();
  });

  it("colours a rise only when the rise is bad news", () => {
    render(<AdminDashboardDesign1 {...PROPS} />);

    // Both deltas point up; only the cancellation rate is a problem.
    expect(screen.getByText("+12.4%")).not.toHaveClass("text-destructive");
    expect(screen.getByText("+0.2 pts")).toHaveClass("text-destructive");
  });

  it("draws the range the caller selected by default, and switches on click", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardDesign1 {...PROPS} />);

    expect(screen.getByText("Mon")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Month" }));

    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.queryByText("Mon")).not.toBeInTheDocument();
  });

  it("shows an empty section rather than an empty list", () => {
    render(
      <AdminDashboardDesign1 {...PROPS} queues={[{ ...PROPS.queues[0], items: [] }]} />,
    );

    expect(screen.getByText("Nothing waiting.")).toBeInTheDocument();
  });

  // Below `md` the icon rail is hidden and this drawer is the only way
  // between admin pages, so its entries have to carry their labels — an
  // icon-only target works on the rail because a pointer can hover its
  // `title`, and a finger cannot.
  it("opens a labelled navigation drawer for narrow viewports", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardDesign1 {...PROPS} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Navigation" }));

    // Scoped to the drawer: the icon rail is hidden by a CSS breakpoint, and
    // jsdom applies no CSS, so its own links are in this document too.
    const drawer = within(screen.getByRole("dialog"));
    expect(drawer.getByRole("link", { name: "Accounts" })).toBeInTheDocument();
    // The rail marks the current page; so must the drawer.
    expect(drawer.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not navigate when a search hit is still a placeholder", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardDesign1 {...PROPS} />);

    await user.type(screen.getByRole("searchbox"), "accounts");
    await user.click(screen.getByRole("button", { name: "Accounts" }));

    expect(push).not.toHaveBeenCalled();
  });
});
