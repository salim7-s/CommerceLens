# Demo Script: Step-by-Step Live Presentation

> **Objective:** Deliver a flawless live demo of CommerceLens within 60–75 seconds, highlighting the transformation from a weak listing to a 85+ score WooCommerce product.

---

## 1. Pre-Demo Setup Checklist (2 Minutes Before Demo)

- [ ] Dev server running: `npm run dev` (running at `http://localhost:3000`).
- [ ] Database seeded: `npm run seed` (ensures Footwear, Apparel, Electronics categories exist).
- [ ] Browser tabs prepared:
  1. Tab 1: `http://localhost:3000/products` (CommerceLens Product Catalog)
  2. Tab 2: `http://localhost:3000/agent` (Catalog Quality Agent)
  3. Tab 3: WooCommerce Admin / Storefront (`http://localhost:8080/shop` or Mock Store view)
- [ ] Cloudinary and AI keys verified or `SYNC_MODE=mock AI_PROVIDER=mock` active if offline.

---

## 2. Step-by-Step Demo Flow

### Step 1: Show the Weak Product (15 seconds)
1. Navigate to `/products`.
2. Point out the demo item:
   - **Name:** "shoe"
   - **Category:** Footwear
   - **Price:** $49.99
   - **Health Score Badge:** Red `35 / 100` (Status: `Needs Work`)
   - **Sync Status:** `None`
3. Click the **Improve** button next to "shoe".

### Step 2: Showcase Cloudinary Media Optimization (15 seconds)
1. On the `/products/[id]/improve` page, show the media gallery on the left.
2. Highlight the 5 Cloudinary variant cards created via URL transformations:
   - **Original:** Raw uploaded image.
   - **Optimized (`f_auto,q_auto`):** Auto-format & compression (mention: "Saves ~60% bandwidth").
   - **Thumbnail (`c_fill,w_200,h_200,g_auto`):** Smart auto-crop for list views.
   - **Product Card (`c_pad,w_600,h_600,b_white`):** Uniform padded white frame for catalog views.
   - **Marketplace Square (`c_pad,w_1000,h_1000,b_white`):** High-res for marketplace syndication.

### Step 3: Trigger Vision AI Enrichment (20 seconds)
1. Look at the Health Checklist:
   - ❌ Title: "shoe" is too short (needs 15–70 chars).
   - ❌ Description: "nice red shoe" is only 13 chars (needs $\ge$ 120 chars).
   - ❌ SEO Tags: 0 tags (needs $\ge$ 3).
   - ❌ Alt Text: Missing.
   - ❌ Required Attributes: Size missing.
2. Click **Analyze Product**.
3. Watch the AI suggestions populate on the right panel:
   - **Title:** "Classic Red Canvas Low-Top Sneakers"
   - **Description:** "Engineered for daily casual wear, these vibrant red canvas low-top sneakers feature reinforced stitching, flexible rubber outsoles, and breathable uppers..."
   - **SEO Keywords:** `["canvas sneakers", "red low-top shoes", "casual footwear", "unisex sneakers"]`
   - **Alt Text:** "Vibrant red canvas sneaker on a clean white background"
   - **Inferred Attributes:** Color: Red (High confidence, Vision), Material: Canvas (Medium confidence).
   - **Missing Attributes Flagged:** Size (Needs human input).
4. Click **Accept All**.
5. **The "Wow" Moment:** Show the Health Score meter animate from **35 $\rightarrow$ 85**, flipping the badge from **Needs Work** to **Ready**.

### Step 4: Gated WooCommerce Publish (15 seconds)
1. Click **Mark Ready for WooCommerce** (unlocked because score $\ge$ 80).
2. Click **Sync to WooCommerce**.
3. Show immediate status change to green **Synced**.
4. Open the WooCommerce Storefront tab and refresh:
   - The product is published with the enriched title, full description, SEO tags, attributes, and Cloudinary card image!
5. Re-click **Sync to WooCommerce** in CommerceLens to prove **Idempotency**:
   - The sync succeeds, logs an update in `/sync-log`, and creates zero duplicate products in WooCommerce.

### Step 5: Autonomous Catalog Quality Agent (15 seconds)
1. Navigate to `/agent`.
2. Enter the prompt: *"Scan catalog and prepare all draft footwear for WooCommerce"*.
3. Click **Run Dry-Run Plan**.
4. Show the step-by-step function calling execution in `agent_steps`:
   - Inspects product health $\rightarrow$ Runs suggestions $\rightarrow$ Generates approvable plan.
5. Explain the safety boundary: *"Notice no changes are made without the user clicking 'Approve and Apply'."*
