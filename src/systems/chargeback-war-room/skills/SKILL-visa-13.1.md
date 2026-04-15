# Visa 13.1 — Merchandise/Services Not Received

## When This Skill Applies
The cardholder claims they did not receive the goods or services they paid for. This is the most common chargeback reason code for e-commerce merchants.

## What the Customer Is Claiming
"I paid for something and never got it. The merchant took my money but didn't deliver."

## Investigation Plan
1. Call `get_transaction` with the payment_id — verify the transaction details, amount, and description
2. Call `get_merchant` with the merchant_id — check the merchant category and fulfillment type
3. Call `get_shipping_info` with the payment_id — **CRITICAL**: this is the primary evidence for 13.1
4. Call `get_customer_comms` with the payment_id — check if the customer was informed about delivery
5. Call `search_past_wins` with reason_code="visa-13.1" and the merchant category — retrieve similar winning cases

## Evidence Requirements
- **Required:** Proof of delivery — tracking number with carrier confirmation, delivery date, and delivery confirmation (signature, OTP, or photo)
- **Required:** Transaction authorization proof (3DS or AVS match)
- **Strong:** Matching delivery and billing PIN codes
- **Strong:** Customer communication acknowledging delivery or post-delivery interaction
- **Strong:** Delivery photo or signed proof of delivery
- **Nice-to-have:** IP address geolocation matching billing address
- **Nice-to-have:** Prior successful deliveries to the same address

## Representment Narrative Structure
1. **Opening:** Summarize the transaction — what was purchased, when, and for how much
2. **Authorization:** Confirm the transaction was authorized (3DS/AVS)
3. **Fulfillment:** Present the shipping timeline — shipped date, carrier, tracking ID
4. **Delivery proof:** Present delivery confirmation with date, time, and method (OTP/signature/photo)
5. **Address match:** Show delivery address matches billing address
6. **Customer contact:** Reference any post-delivery communication from the customer
7. **Closing:** Request chargeback reversal based on clear evidence of delivery

## Red Flags — Do NOT Fight, Recommend Refund
- No shipping/tracking information exists for this transaction
- Tracking shows the package was returned to sender
- Delivery address differs from billing address AND no customer confirmation of alternate address
- Delivery PIN code differs from billing PIN code with no explanation
- Customer has 3+ prior disputes on this merchant
- Merchant has no delivery proof (no OTP, no signature, no photo)
- Item is a digital good but no download/access logs exist

## Confidence Scoring
- **HIGH (80-100):** All required evidence present (delivery proof + authorization), delivery and billing addresses match, no red flags
- **MEDIUM (50-79):** Required evidence present but minor gaps (e.g., no customer comms, addresses differ but same city)
- **LOW (0-49):** Required evidence missing (no delivery proof) OR any red flag present — escalate to human review
