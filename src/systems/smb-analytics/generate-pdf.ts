/**
 * Generate Apex Electronics business profile PDF
 *
 * Usage: npx tsx src/systems/smb-analytics/generate-pdf.ts
 */

import puppeteer from "puppeteer";
import path from "path";

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Public Sans', -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
    padding: 60px 70px;
    max-width: 100%;
  }

  .header {
    border-bottom: 3px solid #c0392b;
    padding-bottom: 24px;
    margin-bottom: 36px;
  }

  .header h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36pt;
    font-weight: 400;
    color: #1a1a1a;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }

  .header .subtitle {
    font-size: 12pt;
    color: #666;
    font-weight: 400;
  }

  .intro {
    color: #c0392b;
    font-size: 11pt;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18pt;
    font-weight: 400;
    color: #1a1a1a;
    margin-top: 32px;
    margin-bottom: 14px;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #1a1a1a;
    margin-top: 18px;
    margin-bottom: 6px;
  }

  p {
    margin-bottom: 12px;
    text-align: justify;
  }

  .bold { font-weight: 700; }
  .accent { color: #c0392b; font-weight: 600; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 20px 0;
    font-size: 10pt;
  }

  table th {
    background: #f7f7f7;
    font-weight: 600;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 2px solid #ddd;
  }

  table td {
    padding: 9px 14px;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }

  table tr:last-child td { border-bottom: none; }

  ul {
    margin: 8px 0 14px 20px;
    padding: 0;
  }

  ul li {
    margin-bottom: 5px;
    line-height: 1.6;
  }

  .divider {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 28px 0;
  }

  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 2px solid #c0392b;
    font-size: 9pt;
    color: #999;
    text-align: center;
  }

  .page-break { page-break-before: always; }
</style>
</head>
<body>

<div class="header">
  <h1>Apex Electronics</h1>
  <div class="subtitle">Business Profile &amp; Policy Document &bull; Delhi NCR</div>
</div>

<p class="intro">
  This document provides a comprehensive overview of Apex Electronics — our history, store network, product range, and all customer-facing and B2B policies. It serves as the definitive reference for anyone looking to understand how Apex operates, from return policies to credit terms.
</p>

<!-- ─── ABOUT US ─── -->

<h2>1. Who We Are</h2>

<p>Apex Electronics was founded in 2011 by <span class="bold">Rajiv Shukla</span>, starting as a single counter in Lajpat Rai Market, Chandni Chowk — one of Asia's largest electronics wholesale markets. What began as a small fans-and-lights operation has grown into a 4-store electronics retail and distribution business across Delhi NCR.</p>

<p>Today, Apex employs <span class="bold">38 people</span> across all locations and carries <span class="bold">80–120 active SKUs</span> spanning televisions, ceiling fans, LED lighting, and home appliances. The revenue mix is approximately <span class="bold">60% retail walk-in</span> and <span class="bold">40% B2B credit sales</span> to dealers and contractors, with B2B running on 15–45 day credit terms.</p>

<p>Rajiv is known in the market for competitive pricing and reliable after-sales support. He personally handles all B2B negotiations and large-ticket retail sales. GSTIN: <span class="bold">07AABCS1234P1Z5</span>.</p>

<!-- ─── STORE NETWORK ─── -->

<h2>2. Store Network</h2>

<p>Apex operates <span class="bold">4 stores across Delhi NCR</span>, each serving a different segment of the market:</p>

<table>
  <tr>
    <th>Store</th>
    <th>Location</th>
    <th>Est.</th>
    <th>Size</th>
    <th>Focus</th>
    <th>Hours</th>
  </tr>
  <tr>
    <td><span class="bold">Chandni Chowk Flagship</span></td>
    <td>Lajpat Rai Market</td>
    <td>2011</td>
    <td>2,400 sq ft</td>
    <td>B2B + retail showroom</td>
    <td>Mon–Sat, 10 AM – 8 PM</td>
  </tr>
  <tr>
    <td><span class="bold">Karol Bagh Showroom</span></td>
    <td>Gaffar Market</td>
    <td>2016</td>
    <td>1,200 sq ft</td>
    <td>Retail — TVs &amp; appliances</td>
    <td>Mon–Sat, 11 AM – 8:30 PM</td>
  </tr>
  <tr>
    <td><span class="bold">Dwarka Retail Outlet</span></td>
    <td>Sector 6 Market</td>
    <td>2019</td>
    <td>800 sq ft</td>
    <td>Residential — fans, lighting</td>
    <td>All 7 days, 10 AM – 9 PM</td>
  </tr>
  <tr>
    <td><span class="bold">Noida Distribution Hub</span></td>
    <td>Sector 63</td>
    <td>2022</td>
    <td>3,000 sq ft</td>
    <td>Warehouse + B2B fulfillment</td>
    <td>Mon–Sat, 9 AM – 6 PM</td>
  </tr>
</table>

<p>Each store maintains its own inventory. Inter-store transfers happen daily via the Noida hub, which serves as the central warehouse. Rajiv visits all four stores weekly — Chandni Chowk daily, others on rotation.</p>

<!-- ─── PRODUCTS ─── -->

<h2>3. Brands &amp; Product Range</h2>

<p><span class="accent">Televisions</span> (30% of revenue) — Samsung, LG, TCL, Vu, OnePlus. Size range: 32" to 75". Price range: ₹12,000 to ₹1,80,000. Samsung and LG are the highest-margin brands; TCL and Vu are volume drivers.</p>

<p><span class="accent">Ceiling Fans</span> (25% of revenue) — Crompton, Havells, Orient, Usha. Decorative, high-speed, and BLDC energy-efficient models. BLDC fans are growing fast — now 35% of fan sales vs 10% two years ago.</p>

<p><span class="accent">LED Lighting</span> (20% of revenue) — Philips, Syska, Wipro, Havells. Bulbs, tubes, panels, and decorative fixtures. Highest-margin category at 45–55% gross margin and fastest inventory turnover.</p>

<p><span class="accent">Home Appliances</span> (25% of revenue) — Mixer grinders (Preethi, Butterfly), irons (Philips, Bajaj), water purifiers (Kent, Livpure). Seasonal additions: room heaters in winter, air coolers in summer.</p>

<p>Total active SKUs: ~110. New products added monthly based on brand launches and market demand.</p>

<div class="page-break"></div>

<!-- ─── RETURN POLICY ─── -->

<h2>4. Return Policy</h2>

<h3>Retail Customers</h3>
<ul>
  <li><span class="bold">7-day replacement window</span> from date of purchase for manufacturing defects (with original bill and packaging).</li>
  <li>No returns on "sale" or clearance items.</li>
  <li>Opened/used products can only be exchanged for the same model, not refunded.</li>
  <li>Refunds are issued as <span class="bold">store credit</span>, not cash. Cash refunds only if the product is sealed and returned within 48 hours.</li>
  <li>TVs and large appliances: on-site inspection by Apex technician before replacement is approved.</li>
  <li>Returns accepted at any of the 4 stores, regardless of where the purchase was made.</li>
</ul>

<h3>B2B / Dealer Returns</h3>
<ul>
  <li>Defective units swapped <span class="bold">1:1 within 15 days</span>. Dealer must raise a return note on WhatsApp with photos.</li>
  <li>No returns accepted after 15 days — falls under brand warranty.</li>
  <li>Freight for return shipment borne by dealer unless it's a bulk defect (5+ units, same issue).</li>
</ul>

<p>All returns must be accompanied by the original GST invoice.</p>

<!-- ─── CANCELLATION ─── -->

<h2>5. Cancellation Policy</h2>

<h3>Retail Orders</h3>
<ul>
  <li>Walk-in purchases are <span class="bold">final once billed</span>. No cancellations after billing.</li>
  <li>Pre-orders or custom orders can be cancelled within 24 hours with no penalty.</li>
  <li>After 24 hours: 10% restocking fee if goods haven't shipped. If shipped, treated as a return.</li>
</ul>

<h3>B2B / Dealer Orders</h3>
<ul>
  <li>Orders confirmed on WhatsApp/call can be modified or cancelled within <span class="bold">12 hours</span>.</li>
  <li>Once dispatched, cancellations are not accepted — treated as returns with freight deducted.</li>
  <li>Standing orders (monthly recurring) require <span class="bold">7 days advance notice</span> for cancellation or volume change.</li>
</ul>

<p>Rajiv's principle: <em>"We'd rather adjust an order than lose a customer. But once it's on the truck, it's done."</em></p>

<!-- ─── WARRANTY ─── -->

<h2>6. Warranty Policy</h2>

<h3>General Guidelines</h3>
<p>Apex Electronics does <span class="bold">not</span> provide its own warranty on any product. All warranty claims are routed through the original brand/manufacturer. Apex's role is to facilitate:</p>
<ul>
  <li>At billing, staff register the product warranty on the brand's portal and hand the customer a warranty card or confirmation SMS.</li>
  <li>For defect reports within warranty, Apex's service desk logs the complaint, contacts the brand's service center, and shares invoice + serial number.</li>
  <li>Open warranty cases are tracked in a shared WhatsApp group with store managers. If a brand takes more than <span class="bold">7 days</span> to respond, Apex escalates to the brand's area sales manager.</li>
  <li>Customers can visit <span class="bold">any of the 4 stores</span> for warranty support — regardless of where the purchase was made.</li>
</ul>
<p>Extended warranty is <span class="bold">not offered</span> by Apex. Some brands (Samsung, LG) offer their own extended plans at point of purchase — staff mention this at billing, but Apex does not charge for or manage extended warranties.</p>
<p>For B2B / Dealers: warranty claims are handled directly by the dealer with the brand. Apex provides original invoices and batch/serial details on request.</p>

<h3>AC Warranty — Brand-Wise</h3>
<table>
  <tr>
    <th>Brand</th>
    <th>Compressor</th>
    <th>PCB / Control Board</th>
    <th>Other Parts</th>
    <th>Service Contact</th>
  </tr>
  <tr>
    <td><span class="bold">LG</span></td>
    <td>10 years</td>
    <td>5 years</td>
    <td>1 year</td>
    <td>1800-315-9999</td>
  </tr>
  <tr>
    <td><span class="bold">Samsung</span></td>
    <td>10 years (Digital Inverter)</td>
    <td>5 years</td>
    <td>1 year</td>
    <td>1800-40-7267864</td>
  </tr>
  <tr>
    <td><span class="bold">Daikin</span></td>
    <td>10 years</td>
    <td>5 years</td>
    <td>1 year</td>
    <td>1800-209-7070</td>
  </tr>
  <tr>
    <td><span class="bold">Voltas</span></td>
    <td>5 years</td>
    <td>–</td>
    <td>1 year (condenser: 5 years)</td>
    <td>1800-266-4555</td>
  </tr>
</table>
<p><span class="bold">Key notes:</span></p>
<ul>
  <li>LG requires installation by an LG-authorized technician — third-party installation may void the warranty.</li>
  <li>Samsung requires online registration within <span class="bold">15 days</span> of purchase at samsung.com/in. Apex staff handle this at billing.</li>
  <li>Daikin provides <span class="bold">on-site service</span> for all warranty claims — no need to carry the unit.</li>
  <li>Voltas warranty is valid only if installation is done by a Voltas-authorized dealer. Apex coordinates this at delivery.</li>
  <li>Gas charging is free in the first year (all brands); paid after that.</li>
</ul>
<p><span class="bold">Common AC exclusions (all brands):</span> voltage fluctuation damage (stabilizer recommended), physical damage, water ingress, pest infestation in outdoor unit, gas leakage from improper installation/relocation, and consumables (remote batteries, air filters).</p>

<h3>TV Warranty — Brand-Wise</h3>
<table>
  <tr>
    <th>Brand</th>
    <th>Panel</th>
    <th>Other Parts</th>
    <th>On-Site Service</th>
    <th>Service Contact</th>
  </tr>
  <tr>
    <td><span class="bold">Samsung</span></td>
    <td>1 year (LED), 2 years (QLED)</td>
    <td>1 year</td>
    <td>43" and above</td>
    <td>1800-40-7267864</td>
  </tr>
  <tr>
    <td><span class="bold">LG</span></td>
    <td>1 year (LED), 2 years (NanoCell/OLED)</td>
    <td>1 year</td>
    <td>43" and above (within city limits)</td>
    <td>1800-315-9999</td>
  </tr>
  <tr>
    <td><span class="bold">TCL</span></td>
    <td>3 years (all models)</td>
    <td>1 year</td>
    <td>Limited network; 3–5 day response</td>
    <td>1800-209-0808</td>
  </tr>
</table>
<p><span class="bold">Common TV exclusions (all brands):</span> wall-mount/fall damage, panel damage from external impact, surge/voltage damage. Apex recommends a voltage stabilizer for TVs above 43".</p>
<p>For TVs 43" and above, Apex coordinates on-site service directly with the brand. For smaller TVs, Apex's delivery team can pick up the unit and drop it at the service center (₹200 within Delhi NCR).</p>

<h3>Other Categories</h3>
<table>
  <tr>
    <th>Category</th>
    <th>Warranty Period</th>
    <th>Brands</th>
    <th>How Apex Helps</th>
  </tr>
  <tr>
    <td>Ceiling Fans</td>
    <td>2 years (motor)</td>
    <td>Crompton, Havells, Orient</td>
    <td>Keeps spare blades &amp; capacitors for quick fixes</td>
  </tr>
  <tr>
    <td>LED Lighting</td>
    <td>1 year</td>
    <td>Philips, Syska, Wipro</td>
    <td>Handles in-store exchanges with bill</td>
  </tr>
  <tr>
    <td>Appliances</td>
    <td>1 year</td>
    <td>Various</td>
    <td>Provides toll-free number, escalates delays</td>
  </tr>
</table>

<!-- ─── CREDIT TERMS ─── -->

<h2>7. Credit &amp; Payment Terms</h2>

<h3>Retail</h3>
<p>Cash, UPI, credit/debit card accepted at all 4 stores. No credit for walk-in customers. <span class="bold">EMI available</span> through Bajaj Finserv and ZestMoney for purchases above ₹5,000.</p>

<h3>B2B Credit Terms</h3>
<table>
  <tr>
    <th>Dealer Tier</th>
    <th>Criteria</th>
    <th>Credit Period</th>
    <th>Max Outstanding</th>
  </tr>
  <tr>
    <td>New dealers</td>
    <td>First 3 orders</td>
    <td>Advance / COD only</td>
    <td>—</td>
  </tr>
  <tr>
    <td>Established</td>
    <td>6+ months, consistent volume</td>
    <td>30 days</td>
    <td>₹2,00,000</td>
  </tr>
  <tr>
    <td>Top-tier</td>
    <td>2+ years, high volume</td>
    <td>45 days</td>
    <td>₹5,00,000 – ₹8,00,000</td>
  </tr>
</table>

<p>Interest on overdue: <span class="bold">1.5% per month</span> after a 7-day grace period. Payments accepted via NEFT/RTGS/cheque. Post-dated cheques accepted for 30 and 45-day terms.</p>

<p>Rajiv reviews the receivables ageing report weekly and personally follows up on overdue accounts above ₹50,000.</p>

<!-- ─── DELIVERY ─── -->

<h2>8. Delivery &amp; Logistics</h2>

<h3>Local Delivery (Delhi NCR)</h3>
<ul>
  <li><span class="bold">Free delivery</span> within 15 km of any store for orders above ₹5,000.</li>
  <li><span class="bold">Same-day delivery</span> for in-stock items ordered before 2 PM.</li>
  <li>Next-day delivery guaranteed for all other in-stock orders.</li>
  <li>Fleet: 2 Tata Ace mini-trucks and 1 Mahindra Bolero (Noida hub) + 1 Tata Ace (Chandni Chowk).</li>
</ul>

<h3>Outstation / B2B Shipments</h3>
<ul>
  <li>Shipped via Gati, Delhivery, or local transport operators.</li>
  <li>Freight charged at actuals — added to invoice or borne by dealer per agreement.</li>
  <li>Transit: 2–4 days within North India, 5–7 days for South/East India.</li>
  <li>Insurance mandatory on high-value shipments (above ₹1,00,000) — 0.5% of invoice value.</li>
</ul>

<h3>Installation</h3>
<p>Available for TVs (₹500–₹1,500 depending on wall mount type). Fan and lighting installation not provided — Apex recommends trusted electricians.</p>

<hr class="divider">

<div class="footer">
  Apex Electronics &bull; Lajpat Rai Market, Chandni Chowk, Delhi &bull; GSTIN: 07AABCS1234P1Z5 &bull; Est. 2011
</div>

</body>
</html>`;

async function main() {
  console.log("Generating Apex Electronics PDF...\n");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const outputPath = path.join(process.cwd(), "public", "apex-electronics-profile.pdf");

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "0", right: "0" },
  });

  await browser.close();

  console.log(`PDF saved to: ${outputPath}`);
}

main().catch(console.error);
