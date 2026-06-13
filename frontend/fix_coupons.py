import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/components/POSCouponsManagement.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Update Imports
content = content.replace("import { Search, Trash2 } from 'lucide-react';", "import { Search, Trash2, Edit2, Save, X } from 'lucide-react';")

# 2. Update states and functions
states_addition = """  const [newCouponMinAmount, setNewCouponMinAmount] = useState('');

  const [editCouponId, setEditCouponId] = useState(null);
  const [editCouponData, setEditCouponData] = useState({ name: '', code: '', discountType: 'Percentage', value: '', minAmount: '' });

  const handleEditClick = (cp) => {
    setEditCouponId(cp.id);
    setEditCouponData({ name: cp.name, code: cp.code, discountType: cp.discountType, value: cp.value, minAmount: cp.minAmount });
  };

  const handleCancelEdit = () => {
    setEditCouponId(null);
  };

  const handleSaveEdit = (cpId) => {
    if (!editCouponData.name || !editCouponData.code || !editCouponData.value) return;
    const updated = allCouponsList.map(cp => 
      cp.id === cpId ? { ...cp, name: editCouponData.name, code: editCouponData.code.toUpperCase(), discountType: editCouponData.discountType, value: parseFloat(editCouponData.value), minAmount: parseFloat(editCouponData.minAmount || 0) } : cp
    );
    localStorage.setItem('coupons_list', JSON.stringify(updated));
    setAllCouponsList(updated);
    addLogEntry(`Updated coupon: ${editCouponData.code.toUpperCase()}`, 'success');
    setEditCouponId(null);
  };"""

content = content.replace("  const [newCouponMinAmount, setNewCouponMinAmount] = useState('');", states_addition)

# 3. Fix input layout sizes
# Add 'width: "100%", boxSizing: "border-box", ' to style objects in the form that have 'padding: "10px 12px"'
content = re.sub(
    r"style=\{\{\s*padding: '10px 12px',",
    r"style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',",
    content
)

# 4. Replace row rendering to include edit capabilities
old_row = r"""return filtered\.map\(cp => \(\s*<tr key=\{cp\.id\} style=\{\{ borderBottom: '1\.5px solid var\(--border-color\)' \}\}>\s*<td style=\{\{ \.\.\.tdStyle, fontWeight: '700' \}\}>\{cp\.name\}</td>\s*<td style=\{\{ \.\.\.tdStyle, color: 'var\(--text-link\)', fontWeight: '750', fontFamily: 'var\(--mono\)' \}\}>\{cp\.code\}</td>\s*<td style=\{tdStyle\}>\{cp\.discountType === 'Percentage' \? `\$\{cp\.value\}%` : `₹\$\{cp\.value\}`\} Off</td>\s*<td style=\{tdStyle\}>₹\{cp\.minAmount \|\| '0'\}</td>\s*<td style=\{tdStyle\}>\s*<span style=\{\{\s*fontSize: '11px',\s*fontWeight: '800',\s*padding: '4px 10px',\s*borderRadius: '6px',\s*backgroundColor: cp\.activated \? 'rgba\(16, 185, 129, 0\.1\)' : 'rgba\(239, 68, 68, 0\.1\)',\s*color: cp\.activated \? '#10b981' : '#ef4444'\s*\}\}>\s*\{cp\.activated \? 'Active' : 'Inactive'\}\s*</span>\s*</td>\s*<td style=\{\{ \.\.\.tdStyle, textAlign: 'center' \}\}>\s*<div style=\{\{ display: 'flex', justifyContent: 'center', gap: '8px' \}\}>\s*<button\s*onClick=\{.*?\}\s*style=\{\{.*?\}\}\s*>\s*\{cp\.activated \? 'Deactivate' : 'Activate'\}\s*</button>\s*<button\s*onClick=\{.*?\}\s*style=\{\{.*?\}\}\s*title="Delete Coupon"\s*>\s*<Trash2 size=\{14\} />\s*</button>\s*</div>\s*</td>\s*</tr>\s*\);"""

# Let's write the new row in multiple parts carefully since regex might be hard.
# I'll just use string replacement starting from `<tr key={cp.id}`
row_start = r"""<tr key={cp.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>"""

new_row_logic = """<tr key={cp.id} style={{ borderBottom: '1.5px solid var(--border-color)', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    {editCouponId === cp.id ? (
                      <>
                        <td style={tdStyle}>
                          <input type="text" value={editCouponData.name} onChange={(e) => setEditCouponData({ ...editCouponData, name: e.target.value })} style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                        </td>
                        <td style={tdStyle}>
                          <input type="text" value={editCouponData.code} onChange={(e) => setEditCouponData({ ...editCouponData, code: e.target.value })} style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textTransform: 'uppercase' }} />
                        </td>
                        <td style={tdStyle}>
                           <div style={{ display: 'flex', gap: '4px' }}>
                             <select value={editCouponData.discountType} onChange={(e) => setEditCouponData({ ...editCouponData, discountType: e.target.value })} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}>
                               <option value="Percentage">%</option>
                               <option value="Fixed">₹</option>
                             </select>
                             <input type="number" value={editCouponData.value} onChange={(e) => setEditCouponData({ ...editCouponData, value: e.target.value })} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                           </div>
                        </td>
                        <td style={tdStyle}>
                           <input type="number" value={editCouponData.minAmount} onChange={(e) => setEditCouponData({ ...editCouponData, minAmount: e.target.value })} style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>{cp.name}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750', fontFamily: 'var(--mono)' }}>{cp.code}</td>
                        <td style={tdStyle}>{cp.discountType === 'Percentage' ? `${cp.value}%` : `₹${cp.value}`} Off</td>
                        <td style={tdStyle}>₹{cp.minAmount || '0'}</td>
                      </>
                    )}
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: cp.activated ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: cp.activated ? '#10b981' : '#ef4444'
                      }}>
                        {cp.activated ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {editCouponId === cp.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(cp.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Save">
                              <Save size={14} />
                            </button>
                            <button onClick={handleCancelEdit} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Cancel">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(cp)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} title="Edit Coupon">
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleCoupon(cp.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: cp.activated ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                color: cp.activated ? '#ef4444' : '#10b981',
                                fontSize: '12px',
                                fontWeight: '850',
                                cursor: 'pointer'
                              }}
                            >
                              {cp.activated ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(cp.id)}
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>"""

content = re.sub(old_row, new_row_logic, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("Updates successful.")
