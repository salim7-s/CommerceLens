import { describe, it, expect } from "vitest";
import { agentService } from "../../src/services/AgentService";
import { productService } from "../../src/services/ProductService";

describe("Catalog Quality Agent Service", () => {
  it("executes dry-run planning without state mutations", async () => {
    // 1. Fetch weak shoe before agent run
    const shoeBefore = await productService.getProduct("prod_shoe_001");
    expect(shoeBefore).not.toBeNull();
    const originalName = shoeBefore!.name;

    // 2. Run agent in default dry-run mode
    const result = await agentService.runGoal("Get all footwear products ready for WooCommerce", "dry_run", false);

    expect(result.run.status).toBe("completed");
    expect(result.run.mode).toBe("dry_run");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.length).toBeLessThanOrEqual(25);

    // Assert that list_products, get_health, suggest_improvements tools were used
    const toolsUsed = new Set(result.steps.map((s) => s.tool));
    expect(toolsUsed.has("list_products")).toBe(true);
    expect(toolsUsed.has("get_health")).toBe(true);
    expect(toolsUsed.has("suggest_improvements")).toBe(true);

    // Verify dry-run: product state in DB was NOT mutated
    const shoeAfter = await productService.getProduct("prod_shoe_001");
    expect(shoeAfter!.name).toBe(originalName);
  });
});
