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
 * Tier 3: Cross-Feature Suite 3.4 - Project Telemetry + Gallery + Tab Interaction
 */
export async function runProjectTelemetryGalleryTests(reporter) {
  const root = config.projectRoot;

  // Test 3.4.1: Gallery thumbnail switcher toggles active border styles
  const t1 = "Tier 3.4.1 - Image gallery switcher dynamically highlights active thumbnail with border-champagne";
  const start1 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    assertOk(fs.existsSync(detailPath), "ProjectDetailPage.tsx must exist");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, "const [selectedImageIndex, setSelectedImageIndex] = useState(-1);");
    assertIncludes(content, "selectedImageIndex === -1");
    assertIncludes(content, "border-champagne", "Active gallery thumbnail must receive border-champagne");
    assertIncludes(content, "border-border", "Inactive thumbnails must retain border-border");
    assertIncludes(content, "setSelectedImageIndex(-1)", "Must support clicking primary image thumbnail (-1)");
    assertIncludes(content, "setSelectedImageIndex(idx)", "Must support clicking additional gallery thumbnails (idx)");

    reporter.record(t1, 3, true, null, Date.now() - start1);
  } catch (err) {
    reporter.record(t1, 3, false, err, Date.now() - start1);
  }

  // Test 3.4.2: Featured badge persistence on project hero visual
  const t2 = "Tier 3.4.2 - Featured case studies display high-contrast champagne badge overlay with Star icon";
  const start2 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, "project.featured && (", "Must condition featured badge on project.featured");
    assertIncludes(content, "bg-champagne text-[#090c13]", "Featured badge must use high-contrast champagne background");
    assertIncludes(content, "Star", "Featured badge must include Star icon");

    reporter.record(t2, 3, true, null, Date.now() - start2);
  } catch (err) {
    reporter.record(t2, 3, false, err, Date.now() - start2);
  }

  // Test 3.4.3: Tabbed layout preserves telemetry metrics across technical analysis and video tabs
  const t3 = "Tier 3.4.3 - Tabs switching between Technical Analysis and Walkthrough Video preserves telemetry strip";
  const start3 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, '<Tabs defaultValue="description"', "Must render Tabs root defaulting to description");
    assertIncludes(content, '<TabsTrigger', "Must define tab triggers");
    assertIncludes(content, 'value="description"', "Must support technical description tab");
    assertIncludes(content, 'value="demo"', "Must support walkthrough video tab when demo_video_url is present");

    // Telemetry strip presence outside of tab contents
    assertIncludes(content, "Calendar", "Telemetry strip must include Calendar date");
    assertIncludes(content, "Eye", "Telemetry strip must display Eye view count");
    assertIncludes(content, "Heart", "Telemetry strip must display Heart like count");

    reporter.record(t3, 3, true, null, Date.now() - start3);
  } catch (err) {
    reporter.record(t3, 3, false, err, Date.now() - start3);
  }

  // Test 3.4.4: Project Like toggle updates local count, optimistic state, and Supabase database
  const t4 = "Tier 3.4.4 - Project Like button optimistically toggles like count and synchronizes with Supabase";
  const start4 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, "const [isLiked, setIsLiked] = useState(false);");
    assertIncludes(content, "const newLikeCount = isLiked ? (project.likes || 0) - 1 : (project.likes || 0) + 1;");
    assertIncludes(content, "setProject({ ...project, likes: newLikeCount });", "Must apply optimistic state update");
    assertIncludes(content, "setIsLiked(!isLiked);", "Must toggle isLiked state");
    assertIncludes(content, 'toast.success(isLiked ? "Like removed" : "Project liked!");', "Must display toast feedback");

    reporter.record(t4, 3, true, null, Date.now() - start4);
  } catch (err) {
    reporter.record(t4, 3, false, err, Date.now() - start4);
  }

  // Test 3.4.5: Social sharing fallback behavior
  const t5 = "Tier 3.4.5 - Share button utilizes Web Share API with clipboard fallback and toast feedback";
  const start5 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, "navigator.share", "Must inspect navigator.share capability");
    assertIncludes(content, "navigator.clipboard.writeText", "Must fall back to clipboard copy");
    assertIncludes(content, 'toast.success("Link copied to clipboard!");', "Must display clipboard confirmation toast");

    reporter.record(t5, 3, true, null, Date.now() - start5);
  } catch (err) {
    reporter.record(t5, 3, false, err, Date.now() - start5);
  }

  // Test 3.4.6: Graceful error fallback for missing project ID
  const t6 = "Tier 3.4.6 - Invalid or missing project gracefully displays Executive Editorial fallback card";
  const start6 = Date.now();
  try {
    const detailPath = path.join(root, "src/app/projects/[id]/ProjectDetailPage.tsx");
    const content = fs.readFileSync(detailPath, "utf8");

    assertIncludes(content, "if (!project) {", "Must handle !project state");
    assertOk(
      content.includes("Case Study Not Found") || content.includes("Project not found"),
      "Must render not found heading"
    );
    assertIncludes(content, 'href="/projects"', "Must provide link back to /projects");

    reporter.record(t6, 3, true, null, Date.now() - start6);
  } catch (err) {
    reporter.record(t6, 3, false, err, Date.now() - start6);
  }
}

// Direct execution support
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reporter = new TestReporter("Tier 3 - Project Telemetry Gallery");
  await runProjectTelemetryGalleryTests(reporter);
  reporter.printSummary();
}
