/**
 * SMB Analytics Knowledge Base
 *
 * Rich business context for each merchant — policies, store details,
 * owner info, etc. These chunks are embedded and uploaded to Pinecone
 * for proper vector-based RAG retrieval.
 *
 * To embed & upload: npx tsx src/systems/smb-analytics/embed-knowledge.ts
 */

export interface SMBChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    category: string;
    merchantName: string;
    system: "smb-analytics";
  };
}

export const smbKnowledgeChunks: SMBChunk[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // APEX ELECTRONICS
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "apex_about",
    text: `ABOUT APEX ELECTRONICS

Owner: Rajiv Shukla (since 2011)
Headquarters: Lajpat Rai Market, Chandni Chowk, Delhi — one of Asia's largest electronics wholesale markets.
Founded: 2011, started as a single counter selling fans and lights.
Team: 38 employees across all locations — sales staff, warehouse, delivery, accounts, and management.
GSTIN: 07AABCS1234P1Z5

Apex sells consumer electronics across four core categories: televisions, ceiling fans, LED lighting, and home appliances (mixers, irons, water purifiers). Roughly 80–120 active SKUs at any time. Mix of retail walk-in customers (60%) and B2B credit sales to smaller dealers and contractors (40%). The B2B side runs on 15–45 day credit terms depending on the dealer's history.

Rajiv is known in the market for competitive pricing and reliable after-sales support. He personally handles all B2B negotiations and large-ticket retail sales.`,
    metadata: { source: "apex-business-profile.md", category: "about", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_stores",
    text: `APEX ELECTRONICS — STORE LOCATIONS

Apex operates 4 stores across Delhi NCR:

1. **Chandni Chowk Flagship** (est. 2011) — Lajpat Rai Market. 2,400 sq ft showroom + warehouse. The original store. Handles the bulk of B2B business and walk-in retail. Open Mon–Sat, 10 AM – 8 PM.

2. **Karol Bagh Showroom** (est. 2016) — Gaffar Market. 1,200 sq ft retail-focused store. Primarily TVs and appliances. Higher footfall from residential customers. Open Mon–Sat, 11 AM – 8:30 PM.

3. **Dwarka Retail Outlet** (est. 2019) — Sector 6 market. 800 sq ft. Compact store targeting the West Delhi residential market. Fans, lighting, and small appliances. Open all 7 days, 10 AM – 9 PM.

4. **Noida Distribution Hub** (est. 2022) — Sector 63. 3,000 sq ft warehouse + small walk-in counter. Primarily serves B2B orders and online fulfillment for NCR deliveries. Mon–Sat, 9 AM – 6 PM.

Each store has its own inventory but they share stock via daily inter-store transfers using the Noida hub as the central warehouse. Rajiv visits all four stores every week — Chandni Chowk daily, others on rotation.`,
    metadata: { source: "apex-business-profile.md", category: "stores", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_return_policy",
    text: `APEX ELECTRONICS — RETURN POLICY

Retail Customers:
- 7-day replacement window from date of purchase for manufacturing defects (with original bill and packaging).
- No returns on "sale" or clearance items.
- Opened/used products can only be exchanged for the same model, not refunded.
- Refunds are issued as store credit, not cash. Cash refunds only if the product is sealed and returned within 48 hours.
- TVs and large appliances: on-site inspection by Apex technician before replacement is approved.
- Returns accepted at any of the 4 stores, regardless of where the purchase was made.

B2B / Dealer Returns:
- Defective units are swapped 1:1 within 15 days. Dealer must raise a return note on WhatsApp with photos.
- No returns accepted after 15 days — falls under brand warranty.
- Freight for return shipment is borne by the dealer unless it's a bulk defect (5+ units same issue).

All returns must be accompanied by the original GST invoice.`,
    metadata: { source: "apex-policies.md", category: "return_policy", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_cancellation_policy",
    text: `APEX ELECTRONICS — CANCELLATION POLICY

Retail Orders:
- Walk-in purchases are final once billed. No cancellations after billing.
- Pre-orders or custom orders (e.g., bulk LED panels for a contractor) can be cancelled within 24 hours of placing the order with no penalty.
- After 24 hours: 10% restocking fee if the goods haven't shipped. If shipped, treated as a return.

B2B / Dealer Orders:
- Orders confirmed on WhatsApp/call can be modified or cancelled within 12 hours.
- Once dispatched, cancellations are not accepted — treated as returns with freight deducted.
- Standing orders (monthly recurring) require 7 days advance notice for cancellation or volume change.

Rajiv's principle: "We'd rather adjust an order than lose a customer. But once it's on the truck, it's done."`,
    metadata: { source: "apex-policies.md", category: "cancellation_policy", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_warranty_general",
    text: `APEX ELECTRONICS — GENERAL WARRANTY GUIDELINES

Apex Electronics does NOT provide its own warranty on any product. All warranty claims are routed through the original brand/manufacturer. Apex's role is to facilitate the process:

1. At billing, Apex staff register the product warranty on the brand's portal (where applicable) and hand the customer a warranty card or confirmation SMS.
2. If a customer reports a defect within the warranty period, Apex's service desk logs the complaint, contacts the brand's regional service center, and shares the invoice + serial number.
3. Apex tracks open warranty cases in a shared WhatsApp group with store managers. If a brand takes more than 7 days to respond, Apex escalates to the brand's area sales manager directly.
4. For walk-in warranty issues, customers can visit any of the 4 Apex stores — the service desk will handle it regardless of where the original purchase was made.

Extended warranty is NOT offered by Apex. Some brands (Samsung, LG) offer their own extended warranty plans at point of purchase — Apex staff are trained to mention this at billing but Apex does not charge or manage the extended warranty.

For B2B / Dealer warranty: claims are handled directly by the dealer with the brand. Apex provides original invoices and batch/serial details on request to support the claim.`,
    metadata: { source: "apex-policies.md", category: "warranty_general", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_warranty_ac",
    text: `APEX ELECTRONICS — AC WARRANTY POLICY (BRAND-WISE)

All AC warranties are provided by the manufacturer, not Apex. Here is the brand-wise breakdown for the AC brands Apex sells:

LG (Split ACs — 1T, 1.5T, 2T):
- Compressor warranty: 10 years (covers hermetically sealed compressor only).
- Gas charging: Free for first year, paid after that.
- PCB / control board: 5 years.
- All other parts (condenser, fan motor, thermostat): 1 year.
- Installation must be done by LG-authorized technician for warranty to be valid. If customer uses a third-party installer, LG may reject the claim.
- LG service center for Delhi NCR: 1800-315-9999 (toll-free). Average response time: 24–48 hours.

Samsung (Split ACs — 1T, 1.5T):
- Compressor warranty: 10 years (Digital Inverter compressor).
- PCB / control board: 5 years.
- All other parts: 1 year.
- Samsung requires online registration within 15 days of purchase at samsung.com/in for warranty activation. Apex staff do this at billing.
- Samsung service center: 1800-40-7267864. Average response time: 24–72 hours.

Daikin (Split ACs — 1T, 1.5T):
- Compressor warranty: 10 years.
- PCB: 5 years.
- All other parts: 1 year.
- Daikin provides on-site service for all warranty claims. No need to carry the unit to a center.
- Daikin service: 1800-209-7070. Average response time: 24–48 hours.

Voltas (Split ACs — 1T, 1.5T):
- Compressor warranty: 5 years.
- Condenser: 5 years.
- All other parts: 1 year.
- Voltas warranty is valid only if the installation is done by a Voltas-authorized dealer. Apex coordinates this at the time of delivery.
- Voltas service: 1800-266-4555. Average response time: 48–72 hours.

Common AC warranty exclusions (all brands):
- Damage due to voltage fluctuation (customers are advised to use a stabilizer — Apex sells stabilizers separately).
- Physical damage, water ingress, or pest infestation in the outdoor unit.
- Gas leakage caused by improper installation or relocation after original installation.
- Consumables like remote control batteries and air filters.

What Apex does for AC warranty claims: Apex's service desk calls the brand's service center on behalf of the customer, shares invoice and serial number, and follows up until the technician visit is scheduled. If the brand delays beyond 5 days, Apex's store manager escalates directly to the brand's area service head.`,
    metadata: { source: "apex-policies.md", category: "warranty_ac", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_warranty_tv",
    text: `APEX ELECTRONICS — TV WARRANTY POLICY (BRAND-WISE)

All TV warranties are provided by the manufacturer, not Apex. Brand-wise breakdown:

Samsung (LED/QLED TVs — 32", 43", 55"):
- Panel warranty: 1 year (standard LED), 2 years (QLED).
- All other parts: 1 year.
- Samsung requires online registration within 15 days of purchase.
- For TVs 43" and above, Samsung provides on-site service. Below 43", customer must carry to service center or request paid pickup.
- Samsung service: 1800-40-7267864.

LG (LED/NanoCell TVs — 32", 43", 55"):
- Panel warranty: 1 year (standard LED), 2 years (NanoCell/OLED).
- All other parts: 1 year.
- LG provides on-site service for 43" and above within city limits. For locations outside Delhi NCR municipal limits, response may take 3–5 days.
- LG service: 1800-315-9999.

TCL (LED TVs — 32", 43", 55"):
- Panel warranty: 3 years (all models — this is TCL's key differentiator).
- All other parts: 1 year.
- TCL service network in Delhi NCR is smaller than Samsung/LG. Average response time: 3–5 days.
- TCL service: 1800-209-0808.

Common TV warranty exclusions (all brands):
- Wall-mount damage or fall damage (even if wall-mount was provided by brand).
- Panel damage due to external impact (cracks, pressure marks).
- Burn-in on OLED panels is handled case-by-case by LG.
- Surge/voltage damage — Apex recommends a voltage stabilizer for TVs above 43".

What Apex does for TV warranty claims: For TVs 43" and above, Apex coordinates directly with the brand for on-site service. For smaller TVs, Apex's delivery team can pick up the unit from the customer's home and drop it at the service center (charged at ₹200 within Delhi NCR). Apex tracks all open TV warranty cases weekly.`,
    metadata: { source: "apex-policies.md", category: "warranty_tv", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_credit_terms",
    text: `APEX ELECTRONICS — CREDIT & PAYMENT TERMS

Retail: Cash, UPI, credit/debit card accepted at all 4 stores. No credit for walk-in retail customers. EMI available through Bajaj Finserv and ZestMoney for purchases above ₹5,000.

B2B Credit Terms:
- New dealers: first 3 orders are strictly advance payment or cash on delivery.
- After 3 successful orders: 15-day credit at Rajiv's discretion.
- Established dealers (6+ months, consistent volume): 30-day credit. Maximum outstanding capped at ₹2,00,000.
- Top-tier dealers (2+ years, high volume): 45-day credit. Cap negotiated individually, typically ₹5,00,000–₹8,00,000.
- Interest on overdue: 1.5% per month after grace period of 7 days past due date.
- Payments accepted via NEFT/RTGS/cheque. Post-dated cheques accepted for 30-day and 45-day terms.

Rajiv reviews the receivables ageing report weekly and personally follows up on overdue accounts above ₹50,000.`,
    metadata: { source: "apex-policies.md", category: "credit_terms", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_delivery",
    text: `APEX ELECTRONICS — DELIVERY & LOGISTICS

Local Delivery (Delhi NCR):
- Free delivery within 15 km of any store for orders above ₹5,000.
- Same-day delivery for in-stock items if ordered before 2 PM.
- Next-day delivery guaranteed for all other in-stock orders.
- Delivery fleet: 2 Tata Ace mini-trucks and 1 Mahindra Bolero pickup operating out of the Noida hub, plus 1 Tata Ace at Chandni Chowk.

Outstation / B2B Shipments:
- Shipped via transport (Gati, Delhivery, or local transport operators depending on size).
- Freight charged at actuals — added to invoice or borne by dealer per agreement.
- Typical transit: 2–4 days within North India, 5–7 days for South/East India.
- Insurance on high-value shipments (TVs, bulk orders above ₹1,00,000) mandatory — 0.5% of invoice value.

Installation: Available for TVs (₹500–₹1,500 depending on wall mount type). Fans and lighting installation not provided — Apex can recommend trusted electricians.`,
    metadata: { source: "apex-policies.md", category: "delivery", merchantName: "Apex Electronics", system: "smb-analytics" },
  },
  {
    id: "apex_brands_products",
    text: `APEX ELECTRONICS — BRANDS & PRODUCT RANGE

Televisions (30% of revenue):
- Samsung, LG, TCL, Vu, OnePlus. Size range: 32" to 75". Price range: ₹12,000 to ₹1,80,000.
- Samsung and LG are the highest margin brands. TCL and Vu are volume drivers.

Ceiling Fans (25% of revenue):
- Crompton, Havells, Orient, Usha. Decorative, high-speed, and BLDC energy-efficient models.
- BLDC fans are growing fast — now 35% of fan sales vs 10% two years ago.

LED Lighting (20% of revenue):
- Philips, Syska, Wipro, Havells. Bulbs, tubes, panels, and decorative fixtures.
- Highest margin category (45-55% gross margin). Fastest inventory turnover.

Home Appliances (25% of revenue):
- Mixer grinders (Preethi, Butterfly), irons (Philips, Bajaj), water purifiers (Kent, Livpure).
- Seasonal: room heaters in winter, air coolers in summer.

Total active SKUs: ~110. New products added monthly based on brand launches and market demand.`,
    metadata: { source: "apex-business-profile.md", category: "products", merchantName: "Apex Electronics", system: "smb-analytics" },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // LUXE APPAREL CO.
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "luxe_about",
    text: `ABOUT LUXE APPAREL CO.

Owner: Priya Desai (since 2017)
Location: Ring Road, Surat, Gujarat — in the heart of India's textile capital.
Founded: 2017. Priya left a fashion merchandising role at Myntra to start her own brand. Started with 20 designs; now carries 300+ styles per season.
Team: 18 employees — 5 in-house designers, 3 production/QC, 4 sales, 2 warehouse/packing, 2 marketing, 1 accountant, Priya as CEO.
GSTIN: 24AABCN5678Q1Z3

Luxe Apparel makes and sells women's ethnic and fusion wear — kurtas, sarees, lehenga sets, and Indo-western pieces. Each product comes in multiple size-color variants (typically 5 sizes × 3–8 colors). Revenue split: 45% wholesale to boutiques and multi-brand stores, 35% retail via their own website and Instagram, 20% marketplace (Myntra, Ajio).

Priya's focus is on design-led, affordable premium — ₹800 to ₹4,500 price range. Seasonal collections drop 4 times a year with festive season (Sep–Nov) accounting for nearly 40% of annual revenue.`,
    metadata: { source: "luxe-business-profile.md", category: "about", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },
  {
    id: "luxe_channels",
    text: `LUXE APPAREL CO. — SALES CHANNELS

1. **Own Website (luxeapparel.in)** — 35% of revenue. Shopify-based. ~2,000 orders/month. Average order value: ₹1,800. Runs Instagram ads and influencer collaborations for traffic. 3.2% conversion rate.

2. **Wholesale / Boutiques** — 45% of revenue. 65 active wholesale partners across India — boutiques in Mumbai, Delhi, Jaipur, Hyderabad, Kolkata. Top 10 accounts generate 60% of wholesale revenue.

3. **Marketplaces** — 20% of revenue. Listed on Myntra (primary) and Ajio. ~1,500 orders/month combined. Higher return rates (18-22%) than website (8-10%). Commission: 25-30% to platform.

4. **Instagram Direct** — Growing channel. ~200 orders/month via Instagram DMs. Priya's team manages this manually. Planning to move to WhatsApp Commerce.

Festive season (Sep–Nov) is 40% of annual revenue. Priya starts production planning in May and marketing campaigns in August. The design team produces 50-60 new styles for each festive drop.`,
    metadata: { source: "luxe-business-profile.md", category: "channels", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },
  {
    id: "luxe_return_policy",
    text: `LUXE APPAREL CO. — RETURN & EXCHANGE POLICY

Direct / Website Orders:
- 10-day return window from delivery date. Product must be unworn, unwashed, with tags intact.
- Customers can choose: exchange for a different size/color, or store credit. No cash refunds.
- Sale items: exchange only, no store credit.
- Sarees and lehenga sets: exchange only (no returns) due to handling/draping during trial.
- Customer pays return shipping (₹80 flat). Luxe pays shipping on the replacement.

Wholesale / Boutique Returns:
- Defective pieces (stitching, print errors, wrong shade): 1:1 swap within 20 days of receipt. Must share photos on WhatsApp for approval before shipping back.
- Wrong items shipped: Luxe bears full return + re-ship cost.
- Style-based returns (didn't sell): NOT accepted. Wholesale is a firm commitment.
- Damaged in transit: claim must be raised within 48 hours with unboxing photos. Luxe files insurance claim and replaces.

Marketplace (Myntra/Ajio):
- Follows the platform's return policy. Luxe absorbs return shipping and reverse logistics costs (typically ₹120–₹180 per return).`,
    metadata: { source: "luxe-policies.md", category: "return_policy", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },
  {
    id: "luxe_cancellation_policy",
    text: `LUXE APPAREL CO. — CANCELLATION POLICY

Website Orders:
- Can be cancelled anytime before dispatch (typically within 24 hours of ordering). Full refund to original payment method.
- After dispatch: cannot cancel. Must wait for delivery and then initiate a return.

Wholesale Orders:
- Custom/bulk orders (50+ pieces per design): cannot be cancelled once production has started. 50% advance is non-refundable if cancelled mid-production.
- Standard wholesale orders (from existing catalog): can be modified or cancelled within 48 hours of confirmation. After that, a 15% cancellation fee applies.
- Festive season orders (Aug–Oct): cancellation window reduced to 24 hours due to tight production timelines.

Marketplace:
- Cancellations follow Myntra/Ajio policies. Luxe has no control over customer cancellations on marketplace. Pre-dispatch cancellations do not incur cost. Post-dispatch cancellations treated as returns.`,
    metadata: { source: "luxe-policies.md", category: "cancellation_policy", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },
  {
    id: "luxe_wholesale_terms",
    text: `LUXE APPAREL CO. — WHOLESALE & B2B TERMS

Minimum Order:
- First order: minimum ₹25,000 or 30 pieces (whichever is higher).
- Repeat orders: minimum ₹15,000 or 20 pieces.

Pricing:
- Wholesale prices are 40–50% below MRP. Exact discount depends on volume and payment terms.
- Boutiques ordering 100+ pieces per month get an additional 5% volume discount.
- Festive collection: wholesale prices fixed at 35% below MRP (tighter margins due to premium fabrics).

Payment:
- New boutiques: 100% advance or COD for first 2 orders.
- Established partners: 30-day credit. Maximum outstanding: ₹1,50,000.
- Consignment model available for select high-traffic boutiques in metro cities — Luxe retains ownership, boutique earns 25% commission on sales.

Priya personally onboards every new wholesale partner with a video call to understand their customer base and recommend the right product mix.`,
    metadata: { source: "luxe-policies.md", category: "wholesale_terms", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },
  {
    id: "luxe_shipping",
    text: `LUXE APPAREL CO. — SHIPPING & DELIVERY

Website / Direct Orders:
- Free shipping on orders above ₹999. Below that, ₹80 flat shipping.
- Standard delivery: 4–6 business days across India via Delhivery/BlueDart.
- Express delivery: 2–3 days, available for ₹150 extra.
- Cash on delivery available for orders up to ₹5,000.

Wholesale Shipments:
- Shipped via Delhivery Surface or DTDC depending on volume and destination.
- Freight charged at actuals or included in pricing for high-volume partners.
- Typical transit: 3–5 days within Gujarat/Maharashtra, 5–8 days rest of India.
- All shipments include branded packaging — Luxe tissue paper, printed box, thank-you card.

Gift wrapping available on website orders for ₹50 extra.`,
    metadata: { source: "luxe-policies.md", category: "delivery", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },
  {
    id: "luxe_quality",
    text: `LUXE APPAREL CO. — QUALITY & SIZING

Fabrics: Primarily cotton, rayon, and silk-blend. All fabric sourced from Surat mills with OEKO-TEX Standard 100 certification (free from harmful chemicals).

Quality Control: Every piece goes through a 3-point check before packing — stitching integrity, print alignment, and measurement accuracy. Rejection rate at QC: ~4%.

Sizing: XS to 3XL. Size chart published on website and included in wholesale catalog. Each size is measured by the production team, not estimated.

Common issues and how Luxe handles them:
- Color bleeding: Luxe includes a "first wash" care card with every garment. If bleeding occurs despite following instructions, exchange is offered.
- Sizing inconsistency: If a customer finds a size runs small/large compared to the chart, Luxe ships a replacement in the correct size at no cost.
- Stitching issues: Immediate 1:1 replacement, no questions asked.

Care instructions printed on every garment label — machine wash cold, gentle cycle, no bleach.`,
    metadata: { source: "luxe-policies.md", category: "quality", merchantName: "Luxe Apparel Co.", system: "smb-analytics" },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // URBAN PLATE
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "urban_about",
    text: `ABOUT URBAN PLATE

Owner: Arjun Rao (since 2019)
Location: Indiranagar, Bengaluru — a high-footfall neighborhood known for its food scene.
Founded: 2019. Arjun, a former software engineer at Flipkart, opened Urban Plate as a modern South Indian restaurant with a twist — traditional recipes, contemporary plating, and a focus on local sourcing.
Team: 22 employees — 1 head chef, 3 sous chefs, 6 kitchen staff, 5 servers, 2 bartenders, 2 delivery riders, 1 manager, 1 accountant, Arjun as owner-operator.
GSTIN: 29AABCR9012R1Z1

Urban Plate seats 55 (indoor 40 + outdoor patio 15). Revenue split: 55% dine-in, 30% delivery (Swiggy/Zomato + direct), 15% catering and corporate orders. Average daily covers: 120–150. Average ticket size: ₹450 dine-in, ₹380 delivery.

The menu rotates monthly with 5–6 specials, but the core menu of 35 items stays constant. Known for: filter coffee panna cotta, ghee roast chicken, and a weekend brunch that consistently has a 30-minute wait.`,
    metadata: { source: "urban-business-profile.md", category: "about", merchantName: "Urban Plate", system: "smb-analytics" },
  },
  {
    id: "urban_menu_specialties",
    text: `URBAN PLATE — MENU & SPECIALTIES

Core Menu (35 items, always available):
- Starters: Ghee Roast Chicken (₹380), Paneer Pepper Fry (₹280), Gunpowder Idli (₹220)
- Mains: Chettinad Chicken Curry (₹420), Malabar Fish Curry (₹450), Bisi Bele Bath (₹260)
- Biryanis: Hyderabadi Chicken Dum (₹350), Mushroom Biryani (₹290)
- Dosas: Classic Masala Dosa (₹180), Rava Onion Dosa (₹200), Cheese Burst Dosa (₹280)
- Desserts: Filter Coffee Panna Cotta (₹250), Payasam Shot (₹150), Jaggery Cheesecake (₹280)
- Drinks: Filter coffee (₹80), fresh juices, cocktails and mocktails

Monthly Specials (5–6 items, rotated):
- Seasonal ingredients drive the specials. Mango season = mango lassi, raw mango curry. Winter = ragi mudde, hot toddy.
- Specials are tested internally for a week before going on the menu. If a special consistently sells 20+ orders/day, it becomes a permanent menu item.

Weekend Brunch (Sat–Sun, 10 AM – 1 PM):
- Fixed menu: ₹799 per person. Unlimited dosas, filter coffee, 3 starters, 2 mains, 1 dessert.
- Avg 80 covers per brunch session. 30-minute wait is common. No reservations for brunch — first come, first served.`,
    metadata: { source: "urban-business-profile.md", category: "menu", merchantName: "Urban Plate", system: "smb-analytics" },
  },
  {
    id: "urban_refund_policy",
    text: `URBAN PLATE — REFUND & COMPLAINT POLICY

Dine-In:
- If a dish is unsatisfactory, the kitchen will remake it or offer an alternative — no charge. Arjun's policy: "If you're not happy, you don't pay for that dish."
- Hair/foreign object in food: dish is comped (removed from bill) + a complimentary dessert.
- Full meal comp (entire bill waived) only at manager or Arjun's discretion for serious issues.
- No refunds after payment — store credit or a return visit offer instead.

Delivery (Swiggy/Zomato):
- Missing items: refund processed through the platform. Urban Plate also sends the missing item via their own delivery rider if the customer is within 5 km.
- Cold/stale food complaints: reviewed case-by-case. If legitimate, a coupon for a free dish on next order.
- Spillage in transit: not Urban Plate's liability (packaging is spillproof), but they offer a 20% discount on next order as goodwill.

Direct Delivery (via WhatsApp/website):
- Full refund or re-delivery if order is wrong or quality is compromised. Customer must share a photo within 1 hour of delivery.`,
    metadata: { source: "urban-policies.md", category: "return_policy", merchantName: "Urban Plate", system: "smb-analytics" },
  },
  {
    id: "urban_cancellation_policy",
    text: `URBAN PLATE — CANCELLATION & RESERVATION POLICY

Reservations:
- Can be made via phone, WhatsApp, or Dineout. No deposit required for groups under 8.
- Groups of 8+: ₹500 per person deposit required. Refundable if cancelled 24 hours before.
- No-shows (group bookings): deposit forfeited. Individual no-shows: no penalty, but 3 consecutive no-shows result in reservation priority being lowered.
- Walk-ins always welcome. Wait times communicated honestly — Arjun tracks table turns on a live dashboard.

Delivery Order Cancellation:
- Swiggy/Zomato: follows platform cancellation policy. If food is already being prepared, cancellation is not accepted.
- Direct orders: can be cancelled within 5 minutes of placing. After that, the kitchen has started — no cancellation.

Catering / Corporate:
- Cancellation up to 72 hours before event: full refund minus ₹2,000 planning fee.
- 24–72 hours: 50% refund. Under 24 hours: no refund (ingredients already procured).`,
    metadata: { source: "urban-policies.md", category: "cancellation_policy", merchantName: "Urban Plate", system: "smb-analytics" },
  },
  {
    id: "urban_catering",
    text: `URBAN PLATE — CATERING & CORPORATE ORDERS

Catering Menu:
- Separate catering menu with 15 items optimized for bulk preparation and transport. Core offerings: biryani, curry stations, live dosa counter, dessert bar.
- Minimum order: 25 people. Per-head pricing: ₹600–₹1,200 depending on menu selection.
- Custom menus available for 50+ person events. Arjun personally consults on menu design for large events.

Corporate Tiffin:
- Weekly tiffin service for offices in Indiranagar/Koramangala area. ₹180/meal, minimum 10 meals/day.
- Menu changes daily. Vegetarian and non-vegetarian options. Delivered by 12:30 PM.
- Monthly billing, 15-day credit for companies. Invoiced via GST-compliant bill.

Setup:
- Catering includes staff (1 server per 15 guests), disposable eco-friendly crockery, and basic setup.
- Live counters: additional ₹3,000 per counter (chef + equipment).
- Delivery within Bengaluru city limits included. Outside city: transport charged at actuals.`,
    metadata: { source: "urban-policies.md", category: "catering", merchantName: "Urban Plate", system: "smb-analytics" },
  },
  {
    id: "urban_hygiene",
    text: `URBAN PLATE — HYGIENE & FOOD SAFETY

Certifications: FSSAI license (current, renewed annually). Score: 92/100 on last FSSAI audit.

Kitchen Practices:
- All staff undergo food safety training at onboarding. Refresher every 6 months.
- Daily temperature logs for all refrigeration units. Ingredients discarded if cold chain is broken.
- Allergen chart maintained for all menu items. Staff trained to ask about allergies before taking orders.
- Separate prep stations for vegetarian and non-vegetarian items.
- No MSG, no artificial colors. All spices ground in-house.

Sourcing:
- Vegetables and greens from local farms in Chikkaballapur (40 km from Bengaluru). Delivered fresh every morning.
- Meat and seafood from APMC-certified vendors. Received chilled, never frozen (except prawns).
- Rice and staples sourced directly from mills in Karnataka and Andhra Pradesh.

Pest control: monthly professional treatment. Daily kitchen deep-clean after service.`,
    metadata: { source: "urban-policies.md", category: "hygiene", merchantName: "Urban Plate", system: "smb-analytics" },
  },
  {
    id: "urban_hours_contact",
    text: `URBAN PLATE — HOURS & OPERATIONS

Hours:
- Lunch: 12:00 PM – 3:30 PM (last order 3:00 PM)
- Dinner: 7:00 PM – 11:00 PM (last order 10:30 PM)
- Weekend Brunch: Saturday & Sunday, 10:00 AM – 1:00 PM
- Closed on Tuesdays (kitchen maintenance + staff rest day)

Delivery Hours:
- 12:00 PM – 10:00 PM daily (except Tuesday). Available on Swiggy, Zomato, and direct WhatsApp orders.

Happy Hour: Monday, Wednesday, Friday — 7:00 PM to 8:30 PM. 30% off on cocktails and mocktails.

Private Dining: Available for up to 12 guests in the mezzanine area. ₹1,500 minimum spend per person. Book 48 hours in advance.

Contact: Instagram @urbanplate.blr, WhatsApp: +91-98765-43210, Email: hello@urbanplate.in`,
    metadata: { source: "urban-policies.md", category: "operations", merchantName: "Urban Plate", system: "smb-analytics" },
  },
];

export const SMB_CHUNK_COUNT = smbKnowledgeChunks.length;
