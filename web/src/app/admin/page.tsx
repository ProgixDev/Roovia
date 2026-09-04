"use client";

// Swap this single import to reskin the admin overview — each
// AdminDashboardDesign* file is self-contained (rail, header, panels), the
// same way mobile's onboarding route swaps OnboardingDesign1 … 6.
//
// Design 2 defaults every prop to the figures its reference screen was drawn
// with, so it renders bare; design 1 takes its data as props (its demo set is
// in this file's history, `git show HEAD:web/src/app/admin/page.tsx`).
//
// A client component because the designs are interactive (search, ranges,
// theme menu), and those cannot be server-rendered as-is.
import { AdminDashboardDesign4 as AdminDashboard } from "@/components/screens/admin/AdminDashboardDesign4";

export default function AdminDashboardRoute() {
  return <AdminDashboard />;
}
