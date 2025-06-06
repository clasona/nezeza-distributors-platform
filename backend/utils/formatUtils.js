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
        Tax: $${item.taxAmount.toFixed(2)} (${(item.taxRate * 100).toFixed(2)}%)
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
  return `
    <p>
      ${address.fullName ? address.fullName + '<br/>' : ''}
      ${address.street}<br/>
      ${address.city}, ${address.state} ${address.zip}<br/>
      ${address.country}
    </p>
  `;
};

module.exports = {
  formatOrderItems,
  formatShippingAddress,
};
