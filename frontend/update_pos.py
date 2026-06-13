import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/POS.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Add tableCarts state and QR modal state
state_block_regex = r"(const \[activeTable, setActiveTable\] = useState\(''\);)"
new_state = r"""\1
  const [tableCarts, setTableCarts] = useState({});
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleTableSelect = (tableName) => {
    if (activeTable) {
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: { cart, appliedCoupon, discountAmount, paidAmount }
      }));
    }
    
    setActiveTable(tableName);
    setIsTableModalOpen(false);
    
    setTableCarts(prev => {
      const existingData = prev[tableName] || { cart: [], appliedCoupon: null, discountAmount: 0, paidAmount: '0' };
      setCart(existingData.cart);
      setAppliedCoupon(existingData.appliedCoupon);
      setDiscountAmount(existingData.discountAmount);
      setPaidAmount(existingData.paidAmount);
      return prev;
    });
  };"""
content = re.sub(state_block_regex, new_state, content, count=1)

# 2. Replace setActiveTable('Takeaway') with handleTableSelect('Takeaway')
content = content.replace("setActiveTable('Takeaway');", "handleTableSelect('Takeaway');")

# 3. Replace setActiveTable(t.name) with handleTableSelect(t.name)
content = content.replace("setActiveTable(t.name);", "handleTableSelect(t.name);")

# 4. Remove cart clearing from sendToKitchen
send_to_kitchen_old = """      addLogEntry(`Sent Order ${newOrder.id} to Kitchen (Unpaid) for ${activeTable}: ${orderItemsString}`, 'warning');
      alert(`Order sent to Kitchen successfully for ${activeTable}!\\nTotal Amount: ₹${total}`);
      setCart([]);
      setPaidAmount('0');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } catch (err) {"""

send_to_kitchen_new = """      addLogEntry(`Sent Order ${newOrder.id} to Kitchen (Unpaid) for ${activeTable}: ${orderItemsString}`, 'warning');
      alert(`Order sent to Kitchen successfully for ${activeTable}!\\nTotal Amount: ₹${total}`);
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: { cart, appliedCoupon, discountAmount, paidAmount }
      }));
    } catch (err) {"""
content = content.replace(send_to_kitchen_old, send_to_kitchen_new)

# 5. Modify collectPayment and add processPayment
collect_payment_regex = r"(  const collectPayment = async \(\) => \{\n.*?  \};)"

# Extract old logic to create processPayment
old_collect_payment = re.search(collect_payment_regex, content, re.DOTALL).group(1)
old_collect_body = old_collect_payment.replace("const collectPayment = async () => {", "const processPayment = async () => {")

old_collect_body = old_collect_body.replace(
    "setDiscountAmount(0);",
    """setDiscountAmount(0);
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: { cart: [], appliedCoupon: null, discountAmount: 0, paidAmount: '0' }
      }));"""
)

new_collect_payment = f"""{old_collect_body}

  const collectPayment = async () => {{
    if (cart.length === 0) {{
      alert('Your cart is empty.');
      return;
    }}
    if (selectedPayment === 'UPI') {{
      setIsQrModalOpen(true);
      return;
    }}
    await processPayment();
  }};"""
content = re.sub(collect_payment_regex, new_collect_payment, content, count=1)


# 6. Add QR Modal at the bottom, near other modals (search for {/* Takeaway / Table Selection Modal */})
qr_modal = """      {/* QR Code Payment Modal */}
      {isQrModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '20px',
            textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', width: '350px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: 'var(--text-primary)' }}>UPI Payment</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Scan the QR Code to pay ₹{total}</p>
            <div style={{ padding: '15px', background: '#fff', display: 'inline-block', borderRadius: '15px', marginBottom: '20px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant@upi&pn=Cafe&am=${total}&cu=INR`} alt="UPI QR Code" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { setIsQrModalOpen(false); processPayment(); }}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#10b981', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

"""
content = content.replace("{/* Takeaway / Table Selection Modal */}", qr_modal + "{/* Takeaway / Table Selection Modal */}")

# Remove the setIsTableModalOpen(false) duplicates because it's inside handleTableSelect
content = content.replace("handleTableSelect('Takeaway');\n                  setIsTableModalOpen(false);", "handleTableSelect('Takeaway');")
content = content.replace("handleTableSelect(t.name);\n                          setIsTableModalOpen(false);", "handleTableSelect(t.name);")

with open(file_path, 'w') as f:
    f.write(content)
print("Changes applied!")
