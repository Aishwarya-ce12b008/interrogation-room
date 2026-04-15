# Visa 13.3 — Not as Described or Defective Merchandise

## When This Skill Applies
The cardholder claims the goods or services received were materially different from what was described, or that the merchandise was defective/damaged.

## What the Customer Is Claiming
"I got the product, but it's not what I ordered. It's fake, defective, or completely different from the listing."

## Investigation Plan
1. Call `get_transaction` with the payment_id — verify what was purchased (description field is key)
2. Call `get_merchant` with the merchant_id — check merchant category and whether they're an authorized seller
3. Call `get_shipping_info` with the payment_id — confirm the item was delivered (establishes that something was received)
4. Call `get_customer_comms` with the payment_id — **CRITICAL**: review the back-and-forth about the complaint. Did the merchant offer a resolution? Did the customer refuse?
5. Call `search_past_wins` with reason_code="visa-13.3" and the merchant category — retrieve similar winning cases

## Evidence Requirements
- **Required:** Proof that the item delivered matches the item described/ordered (product listing, serial numbers, supplier invoices)
- **Required:** Customer communication history showing the merchant's response to the complaint
- **Strong:** Merchant offered a return/replacement and customer did not respond or refused
- **Strong:** Product serial number or batch verification from the authorized distributor
- **Strong:** Delivery confirmation proving the customer received the item
- **Nice-to-have:** Product listing screenshots at time of purchase
- **Nice-to-have:** Third-party quality certifications or supplier authenticity proof

## Representment Narrative Structure
1. **Opening:** Summarize the transaction and what was purchased
2. **Product verification:** Present evidence that the item shipped matches the listing (serial numbers, supplier records, product specs)
3. **Delivery confirmation:** Confirm the item was received by the cardholder
4. **Merchant response:** Show the merchant responded to the complaint and offered a resolution (return, replacement, or credit)
5. **Customer non-cooperation:** Highlight if the customer did not return the item, refused the resolution, or stopped responding
6. **Policy compliance:** Reference the merchant's return policy and show it was communicated
7. **Closing:** Request reversal — the merchant fulfilled as described and offered a resolution per their policy

## Red Flags — Do NOT Fight, Recommend Refund
- The merchant cannot verify the serial number or product authenticity
- The customer's complaint photos clearly show a different/damaged product and the merchant has no counter-evidence
- The merchant never responded to the customer's complaint
- The merchant has a history of "not as described" complaints (3+ in 90 days)
- The item has no serial number, batch number, or way to verify what was shipped
- The merchant offered no return/replacement option

## Confidence Scoring
- **HIGH (80-100):** Product verified as authentic/matching, merchant offered resolution, customer refused or didn't return the item
- **MEDIUM (50-79):** Product verification available but customer comms are weak or merchant response was slow
- **LOW (0-49):** Cannot verify the product matches the description OR merchant never responded to complaint — escalate to human review
