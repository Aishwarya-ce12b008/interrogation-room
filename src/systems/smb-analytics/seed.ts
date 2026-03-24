import { supabase } from "@/lib/supabase";

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomId(): string {
  return crypto.randomUUID();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function monthsBetween(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

const SEED_START = new Date("2025-10-01");
const SEED_END = new Date("2026-03-15");
const MONTHS = monthsBetween(SEED_START, SEED_END);

function maxDayForMonth(month: Date, monthIdx: number): number {
  const isLastMonth = monthIdx === MONTHS.length - 1;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return isLastMonth ? SEED_END.getDate() : daysInMonth;
}

function gstInvoiceNumber(prefix: string, type: "S" | "P", num: number): string {
  return `${prefix}/${type}/${String(num).padStart(4, "0")}`;
}

// ─── Batch insert helper ────────────────────────────────────────────────────

async function batchInsert(table: string, rows: Record<string, unknown>[], batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  }
}

// ─── SHARMA ELECTRONICS ─────────────────────────────────────────────────────

async function seedApex(merchantId: string) {
  // --- Parties ---
  const customers = [
    { id: randomId(), merchant_id: merchantId, name: "Rajesh Gupta", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9811234567", city: "Delhi", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Vikram Malhotra", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9818765432", city: "Delhi", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Sanjay Kapoor", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9810011223", city: "Noida", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Amit Jain", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9812233445", city: "Gurgaon", credit_terms_days: 15 },
    { id: randomId(), merchant_id: merchantId, name: "Delhi Public School", type: "customer", business_type: "education", business_vertical: "institution", phone: "9813344556", city: "Delhi", credit_terms_days: 60 },
    { id: randomId(), merchant_id: merchantId, name: "Priya Electronics", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9814455667", city: "Delhi", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "RK Enterprises", type: "customer", business_type: "electronics", business_vertical: "distributor", phone: "9815566778", city: "Faridabad", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Suresh Traders", type: "customer", business_type: "electronics", business_vertical: "distributor", phone: "9816677889", city: "Ghaziabad", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "MegaMart Retail", type: "customer", business_type: "general", business_vertical: "retailer", phone: "9817788990", city: "Delhi", credit_terms_days: 60 },
    { id: randomId(), merchant_id: merchantId, name: "Pooja Sharma", type: "customer", business_type: "electronics", business_vertical: "consumer", phone: "9818899001", city: "Delhi", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Naveen Kumar", type: "customer", business_type: "electronics", business_vertical: "consumer", phone: "9819900112", city: "Delhi", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Anand Electricals", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9810012234", city: "Delhi", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Bright Solutions", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9811123345", city: "Noida", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Mohan Lal & Sons", type: "customer", business_type: "electronics", business_vertical: "retailer", phone: "9812234456", city: "Delhi", credit_terms_days: 30 },
  ];

  const suppliers = [
    { id: randomId(), merchant_id: merchantId, name: "Samsung India Dist.", type: "supplier", business_type: "electronics", business_vertical: "distributor", phone: "9820001111", city: "Mumbai", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "LG Electronics Dist.", type: "supplier", business_type: "electronics", business_vertical: "distributor", phone: "9820002222", city: "Mumbai", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Havells India", type: "supplier", business_type: "electronics", business_vertical: "manufacturer", phone: "9820003333", city: "Noida", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Syska LED Dist.", type: "supplier", business_type: "electronics", business_vertical: "distributor", phone: "9820004444", city: "Mumbai", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Bajaj Electricals", type: "supplier", business_type: "electronics", business_vertical: "manufacturer", phone: "9820005555", city: "Mumbai", credit_terms_days: 60 },
    { id: randomId(), merchant_id: merchantId, name: "Philips India", type: "supplier", business_type: "electronics", business_vertical: "manufacturer", phone: "9820006666", city: "Gurgaon", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Orient Electric", type: "supplier", business_type: "electronics", business_vertical: "manufacturer", phone: "9820007777", city: "Noida", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Crompton Greaves", type: "supplier", business_type: "electronics", business_vertical: "manufacturer", phone: "9820008888", city: "Mumbai", credit_terms_days: 45 },
  ];

  await batchInsert("parties", [...customers, ...suppliers]);

  // --- Items (80-120 SKUs across categories) ---
  const categories: { cat: string; items: { name: string; pp: number; sp: number; unit: string; hsn: string }[] }[] = [
    {
      cat: "LED TVs",
      items: [
        { name: "Samsung 32\" LED TV", pp: 12500, sp: 15999, unit: "pcs", hsn: "8528" },
        { name: "Samsung 43\" Smart TV", pp: 22000, sp: 27999, unit: "pcs", hsn: "8528" },
        { name: "LG 32\" LED TV", pp: 11800, sp: 14999, unit: "pcs", hsn: "8528" },
        { name: "LG 43\" Smart TV", pp: 21000, sp: 26999, unit: "pcs", hsn: "8528" },
        { name: "Samsung 55\" 4K TV", pp: 38000, sp: 47999, unit: "pcs", hsn: "8528" },
        { name: "LG 55\" 4K TV", pp: 36000, sp: 45999, unit: "pcs", hsn: "8528" },
      ],
    },
    {
      cat: "Washing Machines",
      items: [
        { name: "Samsung 7kg Front Load", pp: 22000, sp: 28999, unit: "pcs", hsn: "8450" },
        { name: "LG 7kg Top Load", pp: 14000, sp: 18999, unit: "pcs", hsn: "8450" },
        { name: "Samsung 6.5kg Top Load", pp: 12000, sp: 15999, unit: "pcs", hsn: "8450" },
        { name: "LG 8kg Front Load", pp: 26000, sp: 33999, unit: "pcs", hsn: "8450" },
      ],
    },
    {
      cat: "Fans",
      items: [
        { name: "Havells Ceiling Fan 1200mm", pp: 1400, sp: 1899, unit: "pcs", hsn: "8414" },
        { name: "Orient Ceiling Fan 1200mm", pp: 1200, sp: 1599, unit: "pcs", hsn: "8414" },
        { name: "Crompton Ceiling Fan", pp: 1100, sp: 1499, unit: "pcs", hsn: "8414" },
        { name: "Bajaj Table Fan 400mm", pp: 1000, sp: 1399, unit: "pcs", hsn: "8414" },
        { name: "Havells Pedestal Fan", pp: 1800, sp: 2499, unit: "pcs", hsn: "8414" },
        { name: "Orient Wall Fan", pp: 1300, sp: 1799, unit: "pcs", hsn: "8414" },
      ],
    },
    {
      cat: "LED Lighting",
      items: [
        { name: "Syska 9W LED Bulb (Pack of 3)", pp: 180, sp: 299, unit: "pack", hsn: "9405" },
        { name: "Philips 12W LED Bulb", pp: 110, sp: 179, unit: "pcs", hsn: "9405" },
        { name: "Havells 15W LED Bulb", pp: 130, sp: 199, unit: "pcs", hsn: "9405" },
        { name: "Syska LED Tube Light 22W", pp: 220, sp: 349, unit: "pcs", hsn: "9405" },
        { name: "Philips LED Batten 20W", pp: 280, sp: 449, unit: "pcs", hsn: "9405" },
        { name: "Havells LED Panel 18W", pp: 350, sp: 549, unit: "pcs", hsn: "9405" },
        { name: "Syska LED Downlight 12W", pp: 200, sp: 329, unit: "pcs", hsn: "9405" },
        { name: "Crompton LED Bulb 7W", pp: 65, sp: 99, unit: "pcs", hsn: "9405" },
      ],
    },
    {
      cat: "Cables & Wires",
      items: [
        { name: "Havells Wire 1.5 sq mm (90m)", pp: 1800, sp: 2299, unit: "roll", hsn: "8544" },
        { name: "Havells Wire 2.5 sq mm (90m)", pp: 2800, sp: 3499, unit: "roll", hsn: "8544" },
        { name: "Havells Wire 4 sq mm (90m)", pp: 4200, sp: 5299, unit: "roll", hsn: "8544" },
        { name: "Polycab Wire 1.5 sq mm (90m)", pp: 1700, sp: 2199, unit: "roll", hsn: "8544" },
        { name: "Polycab Wire 2.5 sq mm (90m)", pp: 2650, sp: 3399, unit: "roll", hsn: "8544" },
      ],
    },
    {
      cat: "Switches & MCBs",
      items: [
        { name: "Havells MCB 32A SP", pp: 220, sp: 349, unit: "pcs", hsn: "8536" },
        { name: "Havells MCB 16A SP", pp: 180, sp: 279, unit: "pcs", hsn: "8536" },
        { name: "Legrand Modular Switch", pp: 45, sp: 79, unit: "pcs", hsn: "8536" },
        { name: "Havells Switch Board 8M", pp: 280, sp: 449, unit: "pcs", hsn: "8536" },
        { name: "Anchor Switch 6A", pp: 35, sp: 59, unit: "pcs", hsn: "8536" },
      ],
    },
    {
      cat: "Kitchen Appliances",
      items: [
        { name: "Bajaj Mixer Grinder 750W", pp: 2200, sp: 2999, unit: "pcs", hsn: "8509" },
        { name: "Philips Mixer Grinder 500W", pp: 2800, sp: 3699, unit: "pcs", hsn: "8509" },
        { name: "Bajaj Electric Kettle 1.5L", pp: 600, sp: 899, unit: "pcs", hsn: "8516" },
        { name: "Crompton Induction Cooktop", pp: 1600, sp: 2199, unit: "pcs", hsn: "8516" },
        { name: "Bajaj Room Heater", pp: 1200, sp: 1699, unit: "pcs", hsn: "8516" },
        { name: "Philips Iron Box", pp: 800, sp: 1199, unit: "pcs", hsn: "8516" },
      ],
    },
    {
      cat: "Batteries & UPS",
      items: [
        { name: "Luminous Inverter 900VA", pp: 4500, sp: 5999, unit: "pcs", hsn: "8504" },
        { name: "Luminous Battery 150Ah", pp: 9000, sp: 11999, unit: "pcs", hsn: "8507" },
        { name: "Exide Battery 150Ah", pp: 8500, sp: 10999, unit: "pcs", hsn: "8507" },
        { name: "Microtek UPS 1100VA", pp: 4800, sp: 6499, unit: "pcs", hsn: "8504" },
      ],
    },
    {
      cat: "Water Purifiers",
      items: [
        { name: "Kent RO Purifier 8L", pp: 11000, sp: 14999, unit: "pcs", hsn: "8421" },
        { name: "Eureka Forbes Aquaguard", pp: 9500, sp: 12999, unit: "pcs", hsn: "8421" },
        { name: "HUL Pureit Classic", pp: 1200, sp: 1699, unit: "pcs", hsn: "8421" },
      ],
    },
    {
      cat: "Refrigerators",
      items: [
        { name: "Samsung 253L Frost Free", pp: 18000, sp: 23999, unit: "pcs", hsn: "8418" },
        { name: "LG 260L Frost Free", pp: 19000, sp: 24999, unit: "pcs", hsn: "8418" },
        { name: "Samsung 192L Direct Cool", pp: 11000, sp: 14999, unit: "pcs", hsn: "8418" },
        { name: "Whirlpool 190L Direct Cool", pp: 10500, sp: 13999, unit: "pcs", hsn: "8418" },
      ],
    },
    {
      cat: "ACs",
      items: [
        { name: "Samsung 1.5T Split AC 3★", pp: 28000, sp: 35999, unit: "pcs", hsn: "8415" },
        { name: "LG 1.5T Split AC 5★", pp: 35000, sp: 44999, unit: "pcs", hsn: "8415" },
        { name: "Daikin 1T Split AC 3★", pp: 24000, sp: 31999, unit: "pcs", hsn: "8415" },
        { name: "Voltas 1.5T Split AC", pp: 25000, sp: 32999, unit: "pcs", hsn: "8415" },
      ],
    },
  ];

  const allItems: Record<string, unknown>[] = [];
  const itemMap: { id: string; cat: string; pp: number; sp: number; name: string }[] = [];

  for (const catGroup of categories) {
    for (const item of catGroup.items) {
      const id = randomId();
      allItems.push({
        id,
        merchant_id: merchantId,
        name: item.name,
        category: catGroup.cat,
        unit: item.unit,
        purchase_price: item.pp,
        selling_price: item.sp,
        hsn_code: item.hsn,
      });
      itemMap.push({ id, cat: catGroup.cat, pp: item.pp, sp: item.sp, name: item.name });
    }
  }
  await batchInsert("items", allItems);

  // --- High-margin categories vs low-margin to create margin shift ---
  const highMarginCats = ["LED Lighting", "Switches & MCBs", "Cables & Wires"];
  const lowMarginCats = ["LED TVs", "Washing Machines", "Refrigerators", "ACs"];

  // --- Generate invoices, payments, expenses, inventory ---
  const invoices: Record<string, unknown>[] = [];
  const invoiceItemRows: Record<string, unknown>[] = [];
  const payments: Record<string, unknown>[] = [];
  const expenses: Record<string, unknown>[] = [];
  const inventoryRows: Record<string, unknown>[] = [];

  let saleNum = 1;
  let purchaseNum = 1;

  // Top 3 customers get most revenue — for receivables concentration
  const topCustomers = customers.slice(0, 3);
  const otherCustomers = customers.slice(3);

  // INSIGHT: Top customers not returning — top 2 customers have no purchases in last 60+ days
  const topCustomerLastPurchase: Record<string, Date> = {};

  for (const month of MONTHS) {
    const monthIdx = MONTHS.indexOf(month);
    const maxDay = maxDayForMonth(month, monthIdx);

    // INSIGHT: Sales mix shifting toward low-margin categories over time
    const lowMarginWeight = 0.4 + monthIdx * 0.08; // increases each month

    // ~60-80 sale invoices per month
    const numSales = randBetween(60, 80);
    for (let s = 0; s < numSales; s++) {
      const day = randBetween(1, maxDay);
      const invoiceDate = new Date(month.getFullYear(), month.getMonth(), day);

      // Pick customer — top 3 get 60% of invoices by value
      let customer;
      if (Math.random() < 0.45 && monthIdx < 4) {
        customer = pick(topCustomers);
        topCustomerLastPurchase[customer.id] = invoiceDate;
      } else if (Math.random() < 0.2 && monthIdx >= 4) {
        // INSIGHT: top customers NOT returning in later months
        customer = pick(topCustomers);
        if (!topCustomerLastPurchase[customer.id] || topCustomerLastPurchase[customer.id] < new Date("2026-01-01")) {
          customer = pick(otherCustomers);
        }
      } else {
        customer = pick(otherCustomers);
      }

      // Pick items — bias toward low-margin in later months
      const numItems = randBetween(1, 4);
      const selectedItems: typeof itemMap[number][] = [];
      for (let i = 0; i < numItems; i++) {
        const useLowMargin = Math.random() < lowMarginWeight;
        const pool = itemMap.filter(it =>
          useLowMargin ? lowMarginCats.includes(it.cat) : highMarginCats.includes(it.cat)
        );
        selectedItems.push(pick(pool.length > 0 ? pool : itemMap));
      }

      let totalAmount = 0;
      const invId = randomId();
      const discount = monthIdx >= 3 ? randFloat(0, 3) : 0;

      for (const item of selectedItems) {
        const qty = item.cat === "LED Lighting" || item.cat === "Switches & MCBs"
          ? randBetween(2, 20) : randBetween(1, 3);
        const lineTotal = qty * item.sp * (1 - discount / 100);
        invoiceItemRows.push({
          id: randomId(),
          invoice_id: invId,
          item_id: item.id,
          quantity: qty,
          unit_price: item.sp,
          discount_percent: discount,
          total_amount: parseFloat(lineTotal.toFixed(2)),
        });
        totalAmount += lineTotal;
      }

      const dueDays = customer.credit_terms_days || 0;
      const dueDate = addDays(invoiceDate, dueDays);

      // INSIGHT: Receivables concentration — top customer invoices often unpaid/partial
      let status: "paid" | "unpaid" | "partial" = "paid";
      if (topCustomers.some(tc => tc.id === customer.id) && dueDays > 0) {
        if (monthIdx >= 3) status = Math.random() < 0.6 ? "unpaid" : "partial";
        else status = Math.random() < 0.3 ? "unpaid" : "paid";
      } else if (dueDays > 0) {
        status = Math.random() < 0.15 ? "unpaid" : "paid";
      }

      invoices.push({
        id: invId,
        merchant_id: merchantId,
        party_id: customer.id,
        type: "sale",
        invoice_number: gstInvoiceNumber("SE", "S", saleNum++),
        invoice_date: dateStr(invoiceDate),
        due_date: dateStr(dueDate),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        discount_amount: parseFloat((totalAmount * discount / 100).toFixed(2)),
        status,
      });

      if (status === "paid") {
        payments.push({
          id: randomId(),
          merchant_id: merchantId,
          invoice_id: invId,
          party_id: customer.id,
          payment_date: dateStr(addDays(invoiceDate, randBetween(0, dueDays || 0))),
          amount: parseFloat(totalAmount.toFixed(2)),
          mode: pick(["cash", "upi", "bank"]),
        });
      } else if (status === "partial") {
        const partial = parseFloat((totalAmount * randFloat(0.3, 0.6)).toFixed(2));
        payments.push({
          id: randomId(),
          merchant_id: merchantId,
          invoice_id: invId,
          party_id: customer.id,
          payment_date: dateStr(addDays(invoiceDate, randBetween(5, 20))),
          amount: partial,
          mode: pick(["upi", "bank"]),
        });
      }
    }

    // --- Purchase invoices (18-25/month) ---
    const numPurchases = randBetween(18, 25);
    for (let p = 0; p < numPurchases; p++) {
      const day = randBetween(1, maxDay);
      const invoiceDate = new Date(month.getFullYear(), month.getMonth(), day);
      const supplier = pick(suppliers);

      const numItems = randBetween(2, 5);
      let totalAmount = 0;
      const invId = randomId();

      for (let i = 0; i < numItems; i++) {
        const purchaseLowMargin = Math.random() < 0.6;
        const pool = itemMap.filter(it =>
          purchaseLowMargin ? lowMarginCats.includes(it.cat) : highMarginCats.includes(it.cat)
        );
        const item = pick(pool.length > 0 ? pool : itemMap);
        const qty = item.pp >= 10000 ? randBetween(3, 8)
                  : item.pp >= 1000  ? randBetween(4, 12)
                  :                    randBetween(10, 30);
        const lineTotal = qty * item.pp;
        invoiceItemRows.push({
          id: randomId(),
          invoice_id: invId,
          item_id: item.id,
          quantity: qty,
          unit_price: item.pp,
          discount_percent: 0,
          total_amount: lineTotal,
        });
        totalAmount += lineTotal;
      }

      const creditDays = supplier.credit_terms_days;
      const dueDate = addDays(invoiceDate, creditDays);

      // INSIGHT: Paying suppliers too early — pay 10-15 days before due date
      const earlyPayDays = randBetween(10, 20);
      const actualPayDate = addDays(invoiceDate, Math.max(3, creditDays - earlyPayDays));

      invoices.push({
        id: invId,
        merchant_id: merchantId,
        party_id: supplier.id,
        type: "purchase",
        invoice_number: gstInvoiceNumber("SE", "P", purchaseNum++),
        invoice_date: dateStr(invoiceDate),
        due_date: dateStr(dueDate),
        total_amount: totalAmount,
        discount_amount: 0,
        status: "paid",
      });

      payments.push({
        id: randomId(),
        merchant_id: merchantId,
        invoice_id: invId,
        party_id: supplier.id,
        payment_date: dateStr(actualPayDate),
        amount: totalAmount,
        mode: pick(["bank", "bank", "upi"]),
      });
    }

    // --- Expenses ---
    const fixedExpenses = [
      { cat: "Rent", amount: 45000, day: 1 },
      { cat: "Staff Salary", amount: 120000, day: 28 },
    ];
    for (const exp of fixedExpenses) {
      expenses.push({
        id: randomId(), merchant_id: merchantId, category: exp.cat, amount: exp.amount,
        expense_date: dateStr(new Date(month.getFullYear(), month.getMonth(), exp.day)), notes: null,
      });
    }
    const variableExpenses = [
      { cat: "Electricity", total: randBetween(8000, 15000) },
      { cat: "Transport", total: randBetween(5000, 12000) },
      { cat: "Marketing", total: randBetween(3000, 8000) },
      { cat: "Packaging", total: randBetween(2000, 5000) },
      { cat: "Miscellaneous", total: randBetween(2000, 6000) },
    ];
    const spreadDays = [5, 12, 19, 26];
    for (const exp of variableExpenses) {
      for (const day of spreadDays) {
        if (day > maxDay) break;
        const portion = Math.round(exp.total / spreadDays.length) + randBetween(-200, 200);
        expenses.push({
          id: randomId(), merchant_id: merchantId, category: exp.cat, amount: Math.max(0, portion),
          expense_date: dateStr(new Date(month.getFullYear(), month.getMonth(), day)), notes: null,
        });
      }
    }

    // --- Inventory snapshots (weekly) ---
    for (let week = 0; week < 4; week++) {
      const snapDate = new Date(month.getFullYear(), month.getMonth(), 1 + week * 7);
      if (snapDate > SEED_END) break;

      // INSIGHT: Slow-moving inventory — some items have high stock, low velocity
      for (const item of itemMap) {
        const isSlowMover = ["Water Purifiers", "Batteries & UPS"].includes(item.cat);
        const baseStock = isSlowMover ? randBetween(15, 40) : randBetween(2, 15);
        // Slow movers accumulate stock over time
        const stock = isSlowMover ? baseStock + monthIdx * 3 : baseStock;
        inventoryRows.push({
          id: randomId(),
          merchant_id: merchantId,
          item_id: item.id,
          quantity_on_hand: stock,
          snapshot_date: dateStr(snapDate),
        });
      }
    }
  }

  await batchInsert("invoices", invoices);
  await batchInsert("invoice_items", invoiceItemRows);
  await batchInsert("payments", payments);
  await batchInsert("expenses", expenses);
  await batchInsert("inventory_snapshots", inventoryRows);
}

// ─── NOOR COLLECTIONS ───────────────────────────────────────────────────────

async function seedLuxe(merchantId: string) {
  const customers = [
    { id: randomId(), merchant_id: merchantId, name: "Fatima Textiles", type: "customer", business_type: "apparel", business_vertical: "wholesaler", phone: "9925001111", city: "Surat", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Zara Fashion House", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925002222", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Mumtaz Garments", type: "customer", business_type: "apparel", business_vertical: "wholesaler", phone: "9925003333", city: "Ahmedabad", credit_terms_days: 60 },
    { id: randomId(), merchant_id: merchantId, name: "Shilpa Boutique", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925004444", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Riyaz Brothers", type: "customer", business_type: "apparel", business_vertical: "distributor", phone: "9925005555", city: "Surat", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Neha Sarees", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925006666", city: "Baroda", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Meena Cloth Store", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925007777", city: "Surat", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Aisha Fashion", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925008888", city: "Rajkot", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Kiran Readymade", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925009999", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Heena Designer Wear", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925010101", city: "Surat", credit_terms_days: 60 },
    { id: randomId(), merchant_id: merchantId, name: "Imran Wholesale", type: "customer", business_type: "apparel", business_vertical: "wholesaler", phone: "9925020202", city: "Surat", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Roshni Drapes", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925030303", city: "Ahmedabad", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Sameer Textiles", type: "customer", business_type: "textiles", business_vertical: "wholesaler", phone: "9925040404", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Mrs. Patel Walk-in", type: "customer", business_type: "apparel", business_vertical: "consumer", phone: "9925050505", city: "Surat", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Tanvi Collections", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925060606", city: "Surat", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Siddiqui Garments", type: "customer", business_type: "apparel", business_vertical: "wholesaler", phone: "9925070707", city: "Surat", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Arjun Fabrics", type: "customer", business_type: "textiles", business_vertical: "retailer", phone: "9925080808", city: "Baroda", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Divya Fashion Hub", type: "customer", business_type: "apparel", business_vertical: "retailer", phone: "9925090909", city: "Surat", credit_terms_days: 30 },
  ];

  const suppliers = [
    { id: randomId(), merchant_id: merchantId, name: "Surat Silk Mills", type: "supplier", business_type: "textiles", business_vertical: "manufacturer", phone: "9926001111", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Reliance Fabric Dist.", type: "supplier", business_type: "textiles", business_vertical: "distributor", phone: "9926002222", city: "Mumbai", credit_terms_days: 45 },
    { id: randomId(), merchant_id: merchantId, name: "Jain Textiles Wholesale", type: "supplier", business_type: "textiles", business_vertical: "wholesaler", phone: "9926003333", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Bombay Dyeing Dist.", type: "supplier", business_type: "textiles", business_vertical: "distributor", phone: "9926004444", city: "Mumbai", credit_terms_days: 60 },
    { id: randomId(), merchant_id: merchantId, name: "Laxmi Thread Co.", type: "supplier", business_type: "textiles", business_vertical: "manufacturer", phone: "9926005555", city: "Surat", credit_terms_days: 30 },
    { id: randomId(), merchant_id: merchantId, name: "Patel Fabrics", type: "supplier", business_type: "textiles", business_vertical: "wholesaler", phone: "9926006666", city: "Ahmedabad", credit_terms_days: 45 },
  ];

  await batchInsert("parties", [...customers, ...suppliers]);

  // --- Items with size/color variants ---
  const itemDefs: { name: string; cat: string; pp: number; sp: number; hsn: string; variants: { type: string; values: string[] }[] }[] = [
    { name: "Cotton Kurta", cat: "Kurtas", pp: 350, sp: 699, hsn: "6204", variants: [{ type: "size", values: ["S", "M", "L", "XL"] }, { type: "color", values: ["White", "Blue", "Pink"] }] },
    { name: "Silk Kurta", cat: "Kurtas", pp: 800, sp: 1499, hsn: "6204", variants: [{ type: "size", values: ["S", "M", "L", "XL"] }, { type: "color", values: ["Red", "Green", "Gold"] }] },
    { name: "Palazzo Pants", cat: "Bottoms", pp: 280, sp: 549, hsn: "6204", variants: [{ type: "size", values: ["S", "M", "L", "XL"] }] },
    { name: "Dupatta Chiffon", cat: "Dupattas", pp: 150, sp: 349, hsn: "6214", variants: [{ type: "color", values: ["Red", "Blue", "Green", "Yellow", "Pink"] }] },
    { name: "Saree Georgette", cat: "Sarees", pp: 600, sp: 1299, hsn: "5407", variants: [{ type: "color", values: ["Red", "Blue", "Green", "Maroon"] }] },
    { name: "Saree Banarasi", cat: "Sarees", pp: 2200, sp: 3999, hsn: "5407", variants: [{ type: "color", values: ["Gold", "Red", "Maroon"] }] },
    { name: "Lehenga Set", cat: "Festive", pp: 1800, sp: 3499, hsn: "6204", variants: [{ type: "size", values: ["S", "M", "L"] }, { type: "color", values: ["Red", "Pink", "Blue"] }] },
    { name: "Anarkali Suit", cat: "Suits", pp: 900, sp: 1799, hsn: "6204", variants: [{ type: "size", values: ["S", "M", "L", "XL"] }] },
    { name: "Churidar Set", cat: "Suits", pp: 500, sp: 999, hsn: "6204", variants: [{ type: "size", values: ["S", "M", "L", "XL"] }] },
    { name: "Stole Pashmina", cat: "Accessories", pp: 400, sp: 899, hsn: "6214", variants: [{ type: "color", values: ["Cream", "Black", "Red"] }] },
    { name: "Fabric Piece (unstitched)", cat: "Fabric", pp: 200, sp: 449, hsn: "5208", variants: [{ type: "color", values: ["White", "Blue", "Pink", "Green"] }] },
  ];

  const allItems: Record<string, unknown>[] = [];
  const itemMap: { id: string; cat: string; pp: number; sp: number; name: string; size?: string }[] = [];

  for (const def of itemDefs) {
    if (def.variants.length === 0) {
      const id = randomId();
      allItems.push({ id, merchant_id: merchantId, name: def.name, category: def.cat, unit: "pcs", purchase_price: def.pp, selling_price: def.sp, hsn_code: def.hsn });
      itemMap.push({ id, cat: def.cat, pp: def.pp, sp: def.sp, name: def.name });
    } else {
      // Generate all variant combinations
      const expand = (variants: { type: string; values: string[] }[], idx: number, current: { type: string; value: string }[]): { type: string; value: string }[][] => {
        if (idx >= variants.length) return [current];
        const results: { type: string; value: string }[][] = [];
        for (const val of variants[idx].values) {
          results.push(...expand(variants, idx + 1, [...current, { type: variants[idx].type, value: val }]));
        }
        return results;
      };
      const combos = expand(def.variants, 0, []);
      for (const combo of combos) {
        const id = randomId();
        const label = combo.map(c => c.value).join(" / ");
        const variantType = combo.map(c => c.type).join(",");
        const variantValue = combo.map(c => c.value).join(",");
        allItems.push({
          id, merchant_id: merchantId,
          name: `${def.name} - ${label}`, category: def.cat, unit: "pcs",
          purchase_price: def.pp, selling_price: def.sp, hsn_code: def.hsn,
          variant_type: variantType, variant_value: variantValue,
        });
        itemMap.push({ id, cat: def.cat, pp: def.pp, sp: def.sp, name: `${def.name} - ${label}`, size: combo.find(c => c.type === "size")?.value });
      }
    }
  }
  await batchInsert("items", allItems);

  const invoices: Record<string, unknown>[] = [];
  const invoiceItemRows: Record<string, unknown>[] = [];
  const paymentRows: Record<string, unknown>[] = [];
  const expenseRows: Record<string, unknown>[] = [];
  const inventoryRows: Record<string, unknown>[] = [];

  let saleNum = 1;
  let purchaseNum = 1;

  // INSIGHT: High-value customers going silent — top 3 by revenue
  const topCustomers = customers.slice(0, 3);

  // Festival months: Oct (Navratri/Dussehra), Nov (Diwali), Dec-Jan (wedding season)
  const festiveMonthIdx = [0, 1]; // Oct, Nov in our MONTHS array

  for (const month of MONTHS) {
    const monthIdx = MONTHS.indexOf(month);
    const maxDay = maxDayForMonth(month, monthIdx);
    const isFestive = festiveMonthIdx.includes(monthIdx);

    // INSIGHT: Discount trend increasing over time
    const baseDiscount = 3 + monthIdx * 2.5; // starts at 3%, reaches ~18% by month 6

    // Revenue dip in Jan-Feb (months 3-4)
    const isSlowMonth = monthIdx === 3 || monthIdx === 4;
    const numSales = isSlowMonth ? randBetween(25, 40) : isFestive ? randBetween(70, 90) : randBetween(45, 60);

    for (let s = 0; s < numSales; s++) {
      const day = randBetween(1, maxDay);
      const invoiceDate = new Date(month.getFullYear(), month.getMonth(), day);

      // INSIGHT: Top customers go silent in recent months
      let customer;
      if (monthIdx < 3 && Math.random() < 0.4) {
        customer = pick(topCustomers);
      } else if (monthIdx >= 4 && Math.random() < 0.1) {
        customer = pick(topCustomers);
      } else {
        customer = pick(customers.slice(3));
      }

      const numItems = randBetween(1, 5);
      let totalAmount = 0;
      const invId = randomId();
      const discount = randFloat(Math.max(0, baseDiscount - 3), baseDiscount + 2);

      for (let i = 0; i < numItems; i++) {
        // INSIGHT: Wrong sizes in stock — M and L sell fast, S and XL don't
        let item;
        if (Math.random() < 0.6) {
          const popular = itemMap.filter(it => it.size === "M" || it.size === "L" || !it.size);
          item = pick(popular.length > 0 ? popular : itemMap);
        } else {
          item = pick(itemMap);
        }

        const qty = isFestive ? randBetween(3, 15) : randBetween(1, 6);
        const lineTotal = qty * item.sp * (1 - discount / 100);
        invoiceItemRows.push({
          id: randomId(), invoice_id: invId, item_id: item.id,
          quantity: qty, unit_price: item.sp, discount_percent: discount,
          total_amount: parseFloat(lineTotal.toFixed(2)),
        });
        totalAmount += lineTotal;
      }

      const dueDays = customer.credit_terms_days || 0;
      const dueDate = addDays(invoiceDate, dueDays);

      // INSIGHT: DSO high — customers pay slowly
      let status: "paid" | "unpaid" | "partial" = "paid";
      if (dueDays > 0) {
        status = Math.random() < 0.35 ? "unpaid" : Math.random() < 0.2 ? "partial" : "paid";
      }

      invoices.push({
        id: invId, merchant_id: merchantId, party_id: customer.id, type: "sale",
        invoice_number: gstInvoiceNumber("NC", "S", saleNum++),
        invoice_date: dateStr(invoiceDate), due_date: dateStr(dueDate),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        discount_amount: parseFloat((totalAmount * discount / 100 / (1 - discount / 100)).toFixed(2)),
        status,
      });

      if (status === "paid") {
        // Customers pay late — DSO is high
        const payDelay = dueDays > 0 ? randBetween(dueDays, dueDays + 20) : 0;
        paymentRows.push({
          id: randomId(), merchant_id: merchantId, invoice_id: invId, party_id: customer.id,
          payment_date: dateStr(addDays(invoiceDate, payDelay)),
          amount: parseFloat(totalAmount.toFixed(2)), mode: pick(["upi", "bank", "cash"]),
        });
      } else if (status === "partial") {
        paymentRows.push({
          id: randomId(), merchant_id: merchantId, invoice_id: invId, party_id: customer.id,
          payment_date: dateStr(addDays(invoiceDate, randBetween(15, 40))),
          amount: parseFloat((totalAmount * randFloat(0.3, 0.5)).toFixed(2)),
          mode: pick(["upi", "bank"]),
        });
      }
    }

    // --- Purchases: INSIGHT — purchases lag sales peaks, stock up AFTER rush ---
    const purchaseMonthBoost = monthIdx >= 1 && monthIdx <= 2; // Nov-Dec: stocking AFTER Oct festive rush
    const numPurchases = purchaseMonthBoost ? randBetween(12, 18) : randBetween(6, 12);

    for (let p = 0; p < numPurchases; p++) {
      const day = randBetween(1, maxDay);
      const invoiceDate = new Date(month.getFullYear(), month.getMonth(), day);
      const supplier = pick(suppliers);

      const numItems = randBetween(2, 5);
      let totalAmount = 0;
      const invId = randomId();

      for (let i = 0; i < numItems; i++) {
        const item = pick(itemMap);
        const qty = randBetween(5, 20);
        const lineTotal = qty * item.pp;
        invoiceItemRows.push({
          id: randomId(), invoice_id: invId, item_id: item.id,
          quantity: qty, unit_price: item.pp, discount_percent: 0, total_amount: lineTotal,
        });
        totalAmount += lineTotal;
      }

      const creditDays = supplier.credit_terms_days;
      const dueDate = addDays(invoiceDate, creditDays);

      // INSIGHT: DPO < DSO — Noor pays suppliers fast
      const payDelay = randBetween(5, Math.max(10, creditDays - 10));

      invoices.push({
        id: invId, merchant_id: merchantId, party_id: supplier.id, type: "purchase",
        invoice_number: gstInvoiceNumber("NC", "P", purchaseNum++),
        invoice_date: dateStr(invoiceDate), due_date: dateStr(dueDate),
        total_amount: totalAmount, discount_amount: 0, status: "paid",
      });

      paymentRows.push({
        id: randomId(), merchant_id: merchantId, invoice_id: invId, party_id: supplier.id,
        payment_date: dateStr(addDays(invoiceDate, payDelay)),
        amount: totalAmount, mode: pick(["bank", "bank", "upi"]),
      });
    }

    // --- Expenses: fixed costs stay constant even in slow months ---
    const noorFixedExpenses = [
      { cat: "Rent", amount: 35000, day: 1 },
      { cat: "Staff Salary", amount: 85000, day: 28 },
    ];
    for (const exp of noorFixedExpenses) {
      expenseRows.push({
        id: randomId(), merchant_id: merchantId, category: exp.cat, amount: exp.amount,
        expense_date: dateStr(new Date(month.getFullYear(), month.getMonth(), exp.day)), notes: null,
      });
    }
    const noorVariableExpenses = [
      { cat: "Electricity", total: randBetween(4000, 8000) },
      { cat: "Transport", total: randBetween(3000, 7000) },
      { cat: "Marketing", total: isFestive ? randBetween(15000, 25000) : randBetween(3000, 6000) },
      { cat: "Shop Maintenance", total: randBetween(2000, 5000) },
      { cat: "Packaging", total: randBetween(1500, 4000) },
    ];
    const noorSpreadDays = [5, 12, 19, 26];
    for (const exp of noorVariableExpenses) {
      for (const day of noorSpreadDays) {
        if (day > maxDay) break;
        const portion = Math.round(exp.total / noorSpreadDays.length) + randBetween(-150, 150);
        expenseRows.push({
          id: randomId(), merchant_id: merchantId, category: exp.cat, amount: Math.max(0, portion),
          expense_date: dateStr(new Date(month.getFullYear(), month.getMonth(), day)), notes: null,
        });
      }
    }

    // --- Inventory snapshots ---
    for (let week = 0; week < 4; week++) {
      const snapDate = new Date(month.getFullYear(), month.getMonth(), 1 + week * 7);
      if (snapDate > SEED_END) break;

      for (const item of itemMap) {
        // INSIGHT: Wrong sizes — S and XL have high stock, M and L low
        let stock;
        if (item.size === "S" || item.size === "XL") {
          stock = randBetween(20, 50); // overstocked
        } else if (item.size === "M" || item.size === "L") {
          stock = randBetween(0, 5); // understocked / sold out
        } else {
          stock = randBetween(5, 25);
        }
        inventoryRows.push({
          id: randomId(), merchant_id: merchantId, item_id: item.id,
          quantity_on_hand: stock, snapshot_date: dateStr(snapDate),
        });
      }
    }
  }

  await batchInsert("invoices", invoices);
  await batchInsert("invoice_items", invoiceItemRows);
  await batchInsert("payments", paymentRows);
  await batchInsert("expenses", expenseRows);
  await batchInsert("inventory_snapshots", inventoryRows);
}

// ─── RAJU'S KITCHEN ─────────────────────────────────────────────────────────

async function seedUrbanPlate(merchantId: string) {
  const customers = [
    { id: randomId(), merchant_id: merchantId, name: "Walk-in Customer", type: "customer", business_type: "food_service", business_vertical: "consumer", phone: null, city: "Bengaluru", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Swiggy Orders", type: "customer", business_type: "food_delivery", business_vertical: "aggregator", phone: null, city: "Bengaluru", credit_terms_days: 7 },
    { id: randomId(), merchant_id: merchantId, name: "Zomato Orders", type: "customer", business_type: "food_delivery", business_vertical: "aggregator", phone: null, city: "Bengaluru", credit_terms_days: 7 },
    { id: randomId(), merchant_id: merchantId, name: "TechPark Cafeteria (Manyata)", type: "customer", business_type: "corporate", business_vertical: "institution", phone: "9945001111", city: "Bengaluru", credit_terms_days: 15 },
    { id: randomId(), merchant_id: merchantId, name: "WeWork Hebbal", type: "customer", business_type: "corporate", business_vertical: "institution", phone: "9945002222", city: "Bengaluru", credit_terms_days: 15 },
    { id: randomId(), merchant_id: merchantId, name: "Birthday/Party Orders", type: "customer", business_type: "food_service", business_vertical: "consumer", phone: null, city: "Bengaluru", credit_terms_days: 0 },
  ];

  const suppliers = [
    { id: randomId(), merchant_id: merchantId, name: "BigBasket Wholesale", type: "supplier", business_type: "grocery", business_vertical: "wholesaler", phone: "9946001111", city: "Bengaluru", credit_terms_days: 7 },
    { id: randomId(), merchant_id: merchantId, name: "Reliance Fresh B2B", type: "supplier", business_type: "grocery", business_vertical: "retailer", phone: "9946002222", city: "Bengaluru", credit_terms_days: 7 },
    { id: randomId(), merchant_id: merchantId, name: "Metro Cash & Carry", type: "supplier", business_type: "grocery", business_vertical: "wholesaler", phone: "9946003333", city: "Bengaluru", credit_terms_days: 15 },
    { id: randomId(), merchant_id: merchantId, name: "Sri Lakshmi Vegetables", type: "supplier", business_type: "produce", business_vertical: "distributor", phone: "9946004444", city: "Bengaluru", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Nandini Dairy", type: "supplier", business_type: "dairy", business_vertical: "manufacturer", phone: "9946005555", city: "Bengaluru", credit_terms_days: 7 },
    { id: randomId(), merchant_id: merchantId, name: "VRK Meats", type: "supplier", business_type: "meat", business_vertical: "distributor", phone: "9946006666", city: "Bengaluru", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Spar Wholesale", type: "supplier", business_type: "grocery", business_vertical: "wholesaler", phone: "9946007777", city: "Bengaluru", credit_terms_days: 15 },
    { id: randomId(), merchant_id: merchantId, name: "KK Spices & Masala", type: "supplier", business_type: "spices", business_vertical: "distributor", phone: "9946008888", city: "Bengaluru", credit_terms_days: 7 },
    { id: randomId(), merchant_id: merchantId, name: "Ganesh Gas Agency", type: "supplier", business_type: "fuel", business_vertical: "distributor", phone: "9946009999", city: "Bengaluru", credit_terms_days: 0 },
    { id: randomId(), merchant_id: merchantId, name: "Sri Balaji Rice Mill", type: "supplier", business_type: "grains", business_vertical: "manufacturer", phone: "9946010101", city: "Bengaluru", credit_terms_days: 7 },
  ];

  await batchInsert("parties", [...customers, ...suppliers]);

  // --- Menu items ---
  const menuItems: { name: string; cat: string; pp: number; sp: number; unit: string; hsn: string; popular: boolean; profitable: boolean }[] = [
    // INSIGHT: Most popular dish not most profitable — Chicken Biryani is #1 by volume but low margin
    { name: "Chicken Biryani", cat: "Biryani", pp: 120, sp: 220, unit: "plate", hsn: "2106", popular: true, profitable: false },
    { name: "Mutton Biryani", cat: "Biryani", pp: 180, sp: 320, unit: "plate", hsn: "2106", popular: false, profitable: true },
    { name: "Veg Biryani", cat: "Biryani", pp: 50, sp: 160, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Egg Biryani", cat: "Biryani", pp: 65, sp: 180, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Butter Chicken", cat: "North Indian", pp: 100, sp: 260, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Paneer Butter Masala", cat: "North Indian", pp: 70, sp: 220, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Dal Makhani", cat: "North Indian", pp: 35, sp: 180, unit: "plate", hsn: "2106", popular: false, profitable: true },
    { name: "Chicken Tikka", cat: "Starters", pp: 90, sp: 220, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Paneer Tikka", cat: "Starters", pp: 55, sp: 200, unit: "plate", hsn: "2106", popular: false, profitable: true },
    { name: "Gobi Manchurian", cat: "Starters", pp: 30, sp: 160, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Tandoori Roti", cat: "Breads", pp: 5, sp: 30, unit: "pcs", hsn: "1905", popular: true, profitable: true },
    { name: "Butter Naan", cat: "Breads", pp: 8, sp: 50, unit: "pcs", hsn: "1905", popular: true, profitable: true },
    { name: "Garlic Naan", cat: "Breads", pp: 10, sp: 60, unit: "pcs", hsn: "1905", popular: true, profitable: true },
    { name: "Plain Rice", cat: "Rice", pp: 15, sp: 80, unit: "plate", hsn: "1006", popular: true, profitable: true },
    { name: "Jeera Rice", cat: "Rice", pp: 20, sp: 100, unit: "plate", hsn: "1006", popular: false, profitable: true },
    { name: "Raita", cat: "Sides", pp: 10, sp: 50, unit: "bowl", hsn: "0403", popular: true, profitable: true },
    { name: "Gulab Jamun (2 pcs)", cat: "Desserts", pp: 12, sp: 60, unit: "plate", hsn: "1704", popular: true, profitable: true },
    { name: "Kulfi", cat: "Desserts", pp: 15, sp: 70, unit: "pcs", hsn: "2105", popular: false, profitable: true },
    { name: "Masala Chai", cat: "Beverages", pp: 8, sp: 40, unit: "cup", hsn: "0902", popular: true, profitable: true },
    { name: "Cold Coffee", cat: "Beverages", pp: 15, sp: 80, unit: "glass", hsn: "0901", popular: true, profitable: true },
    { name: "Fresh Lime Soda", cat: "Beverages", pp: 8, sp: 60, unit: "glass", hsn: "2202", popular: true, profitable: true },
    { name: "Mineral Water", cat: "Beverages", pp: 10, sp: 30, unit: "bottle", hsn: "2201", popular: true, profitable: false },
    { name: "Chicken Fried Rice", cat: "Chinese", pp: 70, sp: 200, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Veg Fried Rice", cat: "Chinese", pp: 35, sp: 160, unit: "plate", hsn: "2106", popular: false, profitable: true },
    { name: "Chicken Noodles", cat: "Chinese", pp: 65, sp: 190, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Meals (Veg Thali)", cat: "Meals", pp: 55, sp: 150, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Meals (Non-Veg Thali)", cat: "Meals", pp: 90, sp: 220, unit: "plate", hsn: "2106", popular: true, profitable: true },
    { name: "Parcel Biryani (Family Pack)", cat: "Biryani", pp: 350, sp: 650, unit: "pack", hsn: "2106", popular: false, profitable: false },
  ];

  const allItems: Record<string, unknown>[] = [];
  const itemMap = menuItems.map(item => {
    const id = randomId();
    allItems.push({
      id, merchant_id: merchantId, name: item.name, category: item.cat,
      unit: item.unit, purchase_price: item.pp, selling_price: item.sp, hsn_code: item.hsn,
    });
    return { ...item, id };
  });
  await batchInsert("items", allItems);

  const invoices: Record<string, unknown>[] = [];
  const invoiceItemRows: Record<string, unknown>[] = [];
  const paymentRows: Record<string, unknown>[] = [];
  const expenseRows: Record<string, unknown>[] = [];
  const inventoryRows: Record<string, unknown>[] = [];

  let saleNum = 1;
  let purchaseNum = 1;

  const walkIn = customers[0];
  const swiggy = customers[1];
  const zomato = customers[2];
  const corpCustomers = customers.slice(3, 5);
  const partyOrders = customers[5];

  for (const month of MONTHS) {
    const monthIdx = MONTHS.indexOf(month);
    const maxDay = maxDayForMonth(month, monthIdx);

    // INSIGHT: Purchase prices trending up each month (2-3% per month)
    const priceInflation = 1 + monthIdx * 0.025;

    // --- Daily orders ---
    for (let day = 1; day <= maxDay; day++) {
      const orderDate = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = orderDate.getDay(); // 0=Sun, 6=Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // INSIGHT: Weekend understocking pattern — more orders on weekends
      const baseOrders = isWeekend ? randBetween(18, 28) : randBetween(10, 16);

      for (let o = 0; o < baseOrders; o++) {
        const invId = randomId();
        // Simulate hour of day for INSIGHT: empty tables during 2-5pm
        const hour = (() => {
          const r = Math.random();
          if (r < 0.35) return randBetween(12, 14); // lunch rush
          if (r < 0.55) return randBetween(19, 22); // dinner rush
          if (r < 0.65) return randBetween(14, 17); // SLOW: 2-5pm
          if (r < 0.80) return randBetween(11, 12); // late morning
          return randBetween(17, 19); // early evening
        })();

        // Customer type
        let customer;
        const rand = Math.random();
        if (rand < 0.45) customer = walkIn;
        else if (rand < 0.65) customer = swiggy;
        else if (rand < 0.80) customer = zomato;
        else if (rand < 0.90) customer = pick(corpCustomers);
        else customer = walkIn;

        // INSIGHT: Bulk orders — occasional large party/corporate order
        const isBulk = Math.random() < 0.03;
        const numItems = isBulk ? randBetween(8, 15) : randBetween(1, 4);

        let totalAmount = 0;
        for (let i = 0; i < numItems; i++) {
          // Popular items sell more
          const pool = Math.random() < 0.7
            ? itemMap.filter(it => it.popular)
            : itemMap;
          const item = pick(pool);
          const qty = isBulk ? randBetween(5, 20) : (item.unit === "pcs" ? randBetween(1, 4) : 1);
          const lineTotal = qty * item.sp;
          invoiceItemRows.push({
            id: randomId(), invoice_id: invId, item_id: item.id,
            quantity: qty, unit_price: item.sp, discount_percent: 0, total_amount: lineTotal,
          });
          totalAmount += lineTotal;
        }

        if (isBulk) {
          customer = partyOrders;
        }

        const dueDays = customer.credit_terms_days || 0;
        invoices.push({
          id: invId, merchant_id: merchantId, party_id: customer.id, type: "sale",
          invoice_number: gstInvoiceNumber("RK", "S", saleNum++),
          invoice_date: dateStr(orderDate), due_date: dateStr(addDays(orderDate, dueDays)),
          total_amount: totalAmount, discount_amount: 0,
          status: dueDays > 0 ? (Math.random() < 0.2 ? "unpaid" : "paid") : "paid",
        });

        if (dueDays === 0 || Math.random() > 0.2) {
          paymentRows.push({
            id: randomId(), merchant_id: merchantId, invoice_id: invId, party_id: customer.id,
            payment_date: dateStr(addDays(orderDate, dueDays === 0 ? 0 : randBetween(3, dueDays + 5))),
            amount: totalAmount, mode: dueDays === 0 ? pick(["cash", "upi", "upi"]) : pick(["bank", "upi"]),
          });
        }
      }
    }

    // --- Purchase invoices (ingredient procurement) ---
    // INSIGHT: Weekday overstock, weekend understock — purchases happen Mon-Fri uniformly
    const numPurchases = randBetween(18, 25);
    for (let p = 0; p < numPurchases; p++) {
      const day = randBetween(1, maxDay);
      const purchaseDate = new Date(month.getFullYear(), month.getMonth(), day);
      const supplier = pick(suppliers);
      const invId = randomId();
      let totalAmount = 0;

      const numItems = randBetween(3, 8);
      for (let i = 0; i < numItems; i++) {
        const item = pick(itemMap);
        const qty = randBetween(10, 50);
        // INSIGHT: Purchase prices inflating
        const inflatedPP = parseFloat((item.pp * priceInflation).toFixed(2));
        const lineTotal = qty * inflatedPP;
        invoiceItemRows.push({
          id: randomId(), invoice_id: invId, item_id: item.id,
          quantity: qty, unit_price: inflatedPP, discount_percent: 0,
          total_amount: parseFloat(lineTotal.toFixed(2)),
        });
        totalAmount += lineTotal;
      }

      const creditDays = supplier.credit_terms_days;
      invoices.push({
        id: invId, merchant_id: merchantId, party_id: supplier.id, type: "purchase",
        invoice_number: gstInvoiceNumber("RK", "P", purchaseNum++),
        invoice_date: dateStr(purchaseDate), due_date: dateStr(addDays(purchaseDate, creditDays)),
        total_amount: parseFloat(totalAmount.toFixed(2)), discount_amount: 0, status: "paid",
      });
      paymentRows.push({
        id: randomId(), merchant_id: merchantId, invoice_id: invId, party_id: supplier.id,
        payment_date: dateStr(addDays(purchaseDate, randBetween(0, creditDays))),
        amount: parseFloat(totalAmount.toFixed(2)), mode: pick(["cash", "upi", "bank"]),
      });
    }

    // --- Expenses ---
    // INSIGHT: One category (Gas/Fuel) growing faster than revenue
    const gasExpenseBase = 12000;
    const gasExpense = Math.round(gasExpenseBase * (1 + monthIdx * 0.12)); // +12% per month, way faster than revenue growth

    const rajuFixedExpenses = [
      { cat: "Rent", amount: 55000, day: 1 },
      { cat: "Staff Salary", amount: 140000, day: 28 },
    ];
    for (const exp of rajuFixedExpenses) {
      expenseRows.push({
        id: randomId(), merchant_id: merchantId, category: exp.cat, amount: exp.amount,
        expense_date: dateStr(new Date(month.getFullYear(), month.getMonth(), exp.day)), notes: null,
      });
    }
    const rajuVariableExpenses = [
      { cat: "Gas/Fuel", total: gasExpense },
      { cat: "Electricity", total: randBetween(12000, 18000) },
      { cat: "Packaging (Delivery)", total: randBetween(8000, 15000) },
      { cat: "Platform Commission", total: randBetween(10000, 20000) },
      { cat: "Maintenance", total: randBetween(3000, 8000) },
      { cat: "Miscellaneous", total: randBetween(2000, 5000) },
    ];
    const rajuSpreadDays = [4, 11, 18, 25];
    for (const exp of rajuVariableExpenses) {
      for (const day of rajuSpreadDays) {
        if (day > maxDay) break;
        const portion = Math.round(exp.total / rajuSpreadDays.length) + randBetween(-300, 300);
        expenseRows.push({
          id: randomId(), merchant_id: merchantId, category: exp.cat, amount: Math.max(0, portion),
          expense_date: dateStr(new Date(month.getFullYear(), month.getMonth(), day)), notes: null,
        });
      }
    }

    // --- Inventory snapshots (weekly) ---
    for (let week = 0; week < 4; week++) {
      const snapDate = new Date(month.getFullYear(), month.getMonth(), 1 + week * 7);
      if (snapDate > SEED_END) break;
      const snapDow = snapDate.getDay();
      const isWeekendSnap = snapDow === 0 || snapDow === 6;

      for (const item of itemMap) {
        // INSIGHT: Weekend understocking — lower stock on weekends
        const base = isWeekendSnap ? randBetween(2, 8) : randBetween(10, 25);
        inventoryRows.push({
          id: randomId(), merchant_id: merchantId, item_id: item.id,
          quantity_on_hand: base, snapshot_date: dateStr(snapDate),
        });
      }
    }
  }

  await batchInsert("invoices", invoices);
  await batchInsert("invoice_items", invoiceItemRows);
  await batchInsert("payments", paymentRows);
  await batchInsert("expenses", expenseRows);
  await batchInsert("inventory_snapshots", inventoryRows);
}

// ─── MAIN SEED FUNCTION ─────────────────────────────────────────────────────

export async function seedAll() {
  // Clear existing data (order matters due to FKs)
  const tables = ["inventory_snapshots", "payments", "invoice_items", "expenses", "invoices", "items", "parties", "merchants"];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) console.warn(`Warning clearing ${table}: ${error.message}`);
  }

  // Insert merchants
  const merchants = [
    { id: randomId(), name: "Apex Electronics", business_type: "electronics", business_vertical: "retailer", city: "Delhi", gstin: "07AABCS1234P1Z5" },
    { id: randomId(), name: "Luxe Apparel Co.", business_type: "apparel", business_vertical: "retailer", city: "Surat", gstin: "24AABCN5678Q1Z3" },
    { id: randomId(), name: "Urban Plate", business_type: "food_service", business_vertical: "restaurant", city: "Bengaluru", gstin: "29AABCR9012R1Z1" },
  ];
  await batchInsert("merchants", merchants);

  // Seed each merchant
  await seedApex(merchants[0].id);
  await seedLuxe(merchants[1].id);
  await seedUrbanPlate(merchants[2].id);

  return merchants;
}
