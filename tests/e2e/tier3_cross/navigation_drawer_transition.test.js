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
 * Tier 3: Cross-Feature Suite 3.3 - Navigation Drawer + Route Transition Interaction
 */
export async function runNavigationDrawerTransitionTests(reporter) {
  const root = config.projectRoot;

  // Test 3.3.1: Mobile drawer opens via portal with body scroll lock and dark backdrop
  const t1 = "Tier 3.3.1 - Mobile drawer locks body scroll, mounts via portal, and renders backdrop";
  const start1 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    assertOk(fs.existsSync(navPath), "Navigation.tsx must exist");
    const content = fs.readFileSync(navPath, "utf8");

    // Scroll lock logic
    assertIncludes(content, "document.body.style.overflow = 'hidden'", "Opening drawer must lock body scroll");
    assertIncludes(content, "document.body.style.overflow = ''", "Closing drawer or unmount must restore body scroll");

    // Portal and accessibility attributes
    assertIncludes(content, "createPortal", "Drawer must render into document.body via createPortal");
    assertIncludes(content, 'role=\'dialog\'', "Mobile drawer panel must have role='dialog'");
    assertIncludes(content, 'aria-modal=\'true\'', "Mobile drawer must declare aria-modal='true'");
    assertIncludes(content, 'aria-label=\'Mobile navigation menu\'', "Mobile drawer must have accessible aria-label");

    // Backdrop styling
    assertOk(
      content.includes("backdrop-blur-sm") && (content.includes("bg-black/70") || content.includes("bg-black/75")),
      "Backdrop must use high-contrast dark blur (bg-black/70 or bg-black/75 backdrop-blur-sm)"
    );

    reporter.record(t1, 3, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 3, false, err, Date.now() - start1);
  }

  // Test 3.3.2: Route change automatically closes drawer and clears scroll lock
  const t2 = "Tier 3.3.2 - Route transitions (location.pathname change) automatically dismiss mobile drawer";
  const start2 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const content = fs.readFileSync(navPath, "utf8");

    // Route change effect
    assertIncludes(content, "useEffect(() => {", "Must have useEffect for route tracking");
    assertIncludes(content, "setIsOpen(false);", "Must close menu on route change");
    assertIncludes(content, "[location.pathname]", "Must depend on location.pathname for route changes");

    reporter.record(t2, 3, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 3, false, err, Date.now() - start2);
  }

  // Test 3.3.3: Escape key dismisses mobile drawer cleanly
  const t3 = "Tier 3.3.3 - Escape key press closes mobile drawer and removes keydown listener";
  const start3 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const content = fs.readFileSync(navPath, "utf8");

    assertIncludes(content, "event.key === 'Escape'", "Must check for Escape key press");
    assertIncludes(content, "window.addEventListener('keydown', handleEscape)", "Must attach keydown listener");
    assertIncludes(content, "window.removeEventListener('keydown', handleEscape)", "Must clean up keydown listener on close/unmount");

    reporter.record(t3, 3, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 3, false, err, Date.now() - start3);
  }

  // Test 3.3.4: Active navigation indicator updates across routes with champagne highlight
  const t4 = "Tier 3.3.4 - Navigation items synchronize active route state with champagne styling";
  const start4 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const content = fs.readFileSync(navPath, "utf8");

    // Active path logic
    assertIncludes(content, "isActivePath = (path: string)", "Must define isActivePath function");
    assertIncludes(content, "path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)");

    // Champagne active styling
    assertIncludes(content, "text-champagne border-b-2 border-champagne", "Active desktop nav link must use champagne border");
    assertIncludes(content, "bg-champagne text-[#090c13]", "Active mobile icon wrapper must use champagne accent");
    assertIncludes(content, "layoutId='activeDot'", "Active mobile item must display champagne activeDot indicator");

    reporter.record(t4, 3, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 3, false, err, Date.now() - start4);
  }

  // Test 3.3.5: Hash navigation to #contact dismisses drawer and targets anchor
  const t5 = "Tier 3.3.5 - Drawer 'Get in Touch' button navigates to /#contact and dismisses drawer";
  const start5 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const content = fs.readFileSync(navPath, "utf8");

    assertIncludes(content, "to='/#contact'", "Drawer must include hash link to /#contact");
    assertIncludes(content, "onClick={() => setIsOpen(false)}", "Contact CTA must close drawer on click");
    assertIncludes(content, "bg-champagne hover:bg-white text-[#090c13]", "Contact CTA must use champagne styling");

    reporter.record(t5, 3, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 3, false, err, Date.now() - start5);
  }

  // Test 3.3.6: Reduced motion preference disables spring transitions in Navigation and PageTransition
  const t6 = "Tier 3.3.6 - Accessibility: prefers-reduced-motion suppresses animations across drawer and page transitions";
  const start6 = Date.now();
  try {
    const navPath = path.join(root, "src/components/Navigation.tsx");
    const pageTransitionPath = path.join(root, "src/components/PageTransition.tsx");

    const navContent = fs.readFileSync(navPath, "utf8");
    const ptContent = fs.readFileSync(pageTransitionPath, "utf8");

    assertIncludes(navContent, "useReducedMotion", "Navigation must consume useReducedMotion hook");
    assertIncludes(navContent, "prefersReducedMotion ? { duration: 0 }", "Drawer panel must suppress spring duration when motion is reduced");

    assertIncludes(ptContent, "useReducedMotion", "PageTransition must consume useReducedMotion hook");
    assertIncludes(ptContent, "if (prefersReducedMotion) {", "PageTransition must bypass animation when motion is reduced");
    assertIncludes(ptContent, 'className="bg-[#07090e] min-h-screen"', "Reduced motion fallback must preserve obsidian canvas");

    reporter.record(t6, 3, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 3, false, err, Date.now() - start6);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 3 - Navigation Drawer Transition");
  await runNavigationDrawerTransitionTests(reporter);
  reporter.printSummary();
}
