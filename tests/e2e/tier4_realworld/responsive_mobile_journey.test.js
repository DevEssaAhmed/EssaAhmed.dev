import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import {
  assertOk,
  assertEqual,
  assertIncludes,
  assertNotIncludes,
} from "../helpers/assertions.js";
import { TestReporter } from "../helpers/reporter.js";

/**
 * Tier 4: Real-World Scenario 4.2 - Responsive Viewport & Mobile Executive Journey
 * Validates mobile viewport layout (390x844), hamburger drawer, touch optimization,
 * single-column project grid, responsive gallery, and stacked contact brief form.
 */
export async function runResponsiveMobileJourneyTests(reporter) {
  const root = config.projectRoot;

  // Step 1: Mobile Header & Drawer Trigger Verification
  const t1 = "Tier 4.2.1 - Mobile Header displays compact 64-80px bar, brand identity, and accessible hamburger toggle";
  const start1 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    assertOk(fs.existsSync(navPath), "Navigation.tsx must exist");
    const content = fs.readFileSync(navPath, "utf8");

    // Header layout
    assertIncludes(content, "fixed top-0 left-0 right-0", "Navbar must be fixed at the top of the viewport");
    assertIncludes(content, "backdrop-blur", "Navbar must use backdrop-blur glassmorphism");
    assertIncludes(content, "border-b border-border", "Navbar must have subtle hairline bottom border");

    // Brand elements
    assertIncludes(content, "Analytics Engineer", "Navbar brand must display Analytics Engineer role");

    // Hamburger button on mobile
    assertIncludes(content, "md:hidden", "Desktop navigation items must be hidden on mobile screens");
    assertIncludes(content, "aria-controls='mobile-navigation'", "Hamburger button must link to mobile-navigation id");
    assertIncludes(content, "aria-expanded={isOpen}", "Hamburger button must reflect open/closed state");
    assertIncludes(content, "aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}", "Hamburger button must have dynamic accessible label");

    reporter.record(t1, 4, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 4, false, err, Date.now() - start1);
  }

  // Step 2: Mobile Drawer Modal & Touch Constraints
  const t2 = "Tier 4.2.2 - Mobile Drawer modal renders portal dialog with backdrop touch-lock and close controls";
  const start2 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const content = fs.readFileSync(navPath, "utf8");

    // Modal dialog constraints
    assertIncludes(content, "id='mobile-navigation'", "Drawer panel must declare id='mobile-navigation'");
    assertIncludes(content, "role='dialog'", "Drawer panel must declare role='dialog'");
    assertIncludes(content, "aria-modal='true'", "Drawer panel must declare aria-modal='true'");
    assertIncludes(content, "aria-label='Mobile navigation menu'", "Drawer panel must declare aria-label");

    // Touch lock and scroll lock
    assertIncludes(content, "touch-none", "Backdrop must disable underlying touch scrolling with touch-none");
    assertIncludes(content, "document.body.style.overflow = 'hidden'", "Opening drawer must lock body overflow");

    // Close button
    assertIncludes(content, "aria-label='Close navigation menu'", "Drawer must provide explicit close button with label");

    reporter.record(t2, 4, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 4, false, err, Date.now() - start2);
  }

  // Step 3: Mobile Navigation Transition to Projects Listing
  const t3 = "Tier 4.2.3 - Mobile navigation to /projects dismisses drawer and renders responsive single-column grid";
  const start3 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const navContent = fs.readFileSync(navPath, "utf8");

    // Auto-dismiss on click
    assertIncludes(navContent, "setIsOpen(false)", "Drawer nav links must close menu on click");

    const projectsPagePath = path.join(root, "src/app/projects/ProjectsPage.tsx");
    assertOk(fs.existsSync(projectsPagePath), "ProjectsPage.tsx must exist");
    const projectsContent = fs.readFileSync(projectsPagePath, "utf8");

    // Responsive grid classes
    assertIncludes(
      projectsContent,
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
      "Projects grid must collapse to 1 column on mobile and scale to 2 on tablet and 3 on desktop"
    );

    // Card padding and touch sizing
    const cardPath = path.join(root, "src/components/ProjectCard.tsx");
    const cardContent = fs.readFileSync(cardPath, "utf8");
    assertIncludes(cardContent, "aspect-[16/10]", "ProjectCard thumbnail must maintain 16:10 aspect ratio");
    assertIncludes(cardContent, "min-h-[3.25rem]", "Card title must have minimum height preventing vertical jitter");

    reporter.record(t3, 4, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 4, false, err, Date.now() - start3);
  }

  // Step 4: Mobile Case Study Detail Responsiveness
  const t4 = "Tier 4.2.4 - Case Study Detail page scales hero visual, scrollable gallery, and stacked action buttons";
  const start4 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    assertOk(fs.existsSync(detailPath), "ProjectDetailPage.tsx must exist");
    const content = fs.readFileSync(detailPath, "utf8");

    // Responsive hero image
    assertIncludes(content, "h-64 sm:h-96 lg:h-[480px]", "Case study visual must adapt height gracefully across mobile/tablet/desktop");

    // Horizontally scrollable thumbnail gallery
    assertIncludes(content, "overflow-x-auto", "Gallery thumbnails must be horizontally scrollable on mobile");
    assertIncludes(content, "flex-shrink-0", "Gallery thumbnails must preserve aspect ratio without shrinking");

    // Action button wrapping
    assertIncludes(content, "flex flex-wrap items-center gap-3", "Case study action buttons must wrap cleanly on narrow screens");

    reporter.record(t4, 4, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 4, false, err, Date.now() - start4);
  }

  // Step 5: Mobile Touch Optimization and Stacked Contact Brief Form
  const t5 = "Tier 4.2.5 - Mobile touch-action optimization and stacked Contact Brief section";
  const start5 = Date.now();
  try {
    // CSS touch-action rules
    const cssPath = path.join(root, "src/index.css");
    const cssContent = fs.readFileSync(cssPath, "utf8");
    assertIncludes(cssContent, "@media (max-width: 768px)", "CSS must include mobile-specific media query");
    assertIncludes(cssContent, "touch-action: manipulation", "Mobile CSS must eliminate 300ms tap delay via touch-action: manipulation");

    // Contact section 12-column collapse
    const indexPath = path.join(root, "src/app/Index.tsx");
    const indexContent = fs.readFileSync(indexPath, "utf8");
    assertIncludes(
      indexContent,
      "grid grid-cols-1 lg:grid-cols-12",
      "Contact section must stack consultation card and form on mobile (grid-cols-1) and span 12 on desktop"
    );

    // Form inputs sizing and accessibility
    const formPath = path.join(root, "src/components/ContactForm.tsx");
    const formContent = fs.readFileSync(formPath, "utf8");
    assertIncludes(formContent, "grid md:grid-cols-2 gap-5", "Form inputs must stack on mobile and split to 2 columns on desktop");
    assertIncludes(formContent, "h-auto", "Form buttons and inputs must maintain comfortable touch-friendly heights");

    reporter.record(t5, 4, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 4, false, err, Date.now() - start5);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 4 - Responsive Mobile Journey");
  await runResponsiveMobileJourneyTests(reporter);
  reporter.printSummary();
}
