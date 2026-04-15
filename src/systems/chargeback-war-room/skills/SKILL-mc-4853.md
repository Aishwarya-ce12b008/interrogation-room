# Mastercard 4853 — Cardholder Dispute: Goods/Services Not Provided

## When This Skill Applies
The Mastercard cardholder claims they did not receive the goods or services paid for. This is the Mastercard equivalent of Visa 13.1, but Mastercard has slightly different evidence requirements and timelines.

## What the Customer Is Claiming
"I paid but never received what I ordered. The merchant didn't deliver the goods or provide the service."

## Investigation Plan
1. Call `get_transaction` with the payment_id — verify transaction details and what was purchased
2. Call `get_merchant` with the merchant_id — check merchant category (physical goods vs. services vs. digital)
3. Call `get_shipping_info` with the payment_id — **CRITICAL for physical goods**: delivery proof is the primary evidence
4. Call `get_customer_comms` with the payment_id — check if the customer contacted the merchant before filing the dispute
5. Call `search_past_wins` with reason_code="mc-4853" and the merchant category — retrieve similar winning cases

## Evidence Requirements

### For Physical Goods:
- **Required:** Proof of delivery — tracking number, carrier, delivery date, and confirmation method
- **Required:** Delivery to the cardholder's address (or authorized alternate)
- **Strong:** Signed delivery receipt or OTP-verified delivery
- **Strong:** Customer communication after delivery date
- **Nice-to-have:** Delivery photo

### For Services (hotels, travel, etc.):
- **Required:** Proof the service was rendered — check-in records, booking confirmation used, service logs
- **Required:** Terms and conditions accepted at time of booking
- **Strong:** Customer check-in/check-out timestamps
- **Strong:** Customer communication during the service period

### For Digital Goods:
- **Required:** Proof of digital delivery — download logs, access logs, account activity
- **Required:** IP address of access matches cardholder's known IP
- **Strong:** Continued usage after purchase date

## Representment Narrative Structure
1. **Opening:** Summarize the transaction — what, when, how much
2. **Fulfillment type:** Clarify whether this is physical goods, services, or digital delivery
3. **Delivery/fulfillment proof:** Present evidence appropriate to the type (tracking for physical, service logs for services, access logs for digital)
4. **Timeline:** Show the complete fulfillment timeline from order to delivery/access
5. **Customer interaction:** Reference any post-delivery communication
6. **Closing:** Request chargeback reversal based on confirmed fulfillment

## Red Flags — Do NOT Fight, Recommend Refund
- No delivery proof exists and the merchant cannot demonstrate fulfillment
- Service was booked but merchant has no record of the customer using it
- Digital goods show no access or download activity from the cardholder
- The merchant already issued a partial refund (double-recovery risk)
- Customer contacted the merchant about non-delivery and received no response
- Tracking shows delivery to wrong address with no explanation

## Confidence Scoring
- **HIGH (80-100):** Clear delivery/fulfillment proof matching the cardholder, no red flags
- **MEDIUM (50-79):** Delivery proof exists but has minor gaps (e.g., no signature, service was provided but no direct customer confirmation)
- **LOW (0-49):** No delivery/fulfillment proof OR merchant previously acknowledged non-delivery — escalate to human review
