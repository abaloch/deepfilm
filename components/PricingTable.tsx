'use client';

import Script from 'next/script';

declare global {
    namespace JSX {
      interface IntrinsicElements {
        'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
        };
      }
    }
  }

export default function PricingTable() {
  return (
    <div>
      <Script async src="https://js.stripe.com/v3/pricing-table.js" />
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <stripe-pricing-table
              pricing-table-id="prctbl_1R9bEjPfnvEhFMZfc62Uww9n"
              publishable-key="pk_test_51R9YmWPfnvEhFMZf9QpWWyHth2a6iGnARB1Iczw0ZVDiEgjBC0SKo2kCcwqS78GDAE94XJTHeomtNKVL2gCRxKVJ00kaIncd4s"
            ></stripe-pricing-table>
          `
        }}
      />
    </div>
  );
}
