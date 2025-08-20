// Format order items as an HTML list
const formatOrderItems = (items) => {
  if (!items || !items.length) return '<p>No items in this order.</p>';
  return (
    `<ul style="padding-left:16px;">` +
    items
      .map(
        (item) => `
      <li>
        <strong>${item.title}</strong> &mdash; Qty: ${
          item.quantity
        } &mdash; $${item.price.toFixed(2)} each
        <br/>
        Tax: $${item.taxAmount.toFixed(2)} (${(item.taxRate).toFixed(2)}%)
      </li>
    `
      )
      .join('') +
    `</ul>`
  );
};

// Format shipping address as HTML
const formatShippingAddress = (address) => {
  if (!address) return '<p>No shipping address provided.</p>';
  
  // Handle different address field naming conventions
  const street = address.street1 || address.street || '';
  const street2 = address.street2 || address.apt || '';
  const zipCode = address.zipCode || address.zip || '';
  const country = address.country || 'United States';
  const phone = address.phone || '';
  const name = address.name || 'Recipient'; // Default name if missing
  
  return `
    <div style="line-height: 1.6;">
      ${name ? `<strong>${name}</strong><br/>` : ''}
      ${street}<br/>
      ${street2 ? `${street2}<br/>` : ''}
      ${address.city || 'Unknown City'}, ${address.state || 'Unknown State'} ${zipCode}<br/>
      ${country}<br/>
      ${phone ? `📞 ${phone}` : ''}
    </div>
  `;
};

module.exports = {
  formatOrderItems,
  formatShippingAddress,
};
