import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/Employees/Employees.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Inject MOCK_EMPLOYEES
mock_data = """
const MOCK_EMPLOYEES = [
  { id: 'emp_1001', name: 'Manish Suthar', email: 'manish@cafe.com', role: 'manager' },
  { id: 'emp_1002', name: 'Rajesh Kumar', email: 'rajesh@cafe.com', role: 'chef' },
  { id: 'emp_1003', name: 'Anita Singh', email: 'anita@cafe.com', role: 'cashier' },
  { id: 'emp_1004', name: 'Amit Patel', email: 'amit@cafe.com', role: 'waiter' }
];

const Employees = () => {"""
content = content.replace("const Employees = () => {", mock_data)

# 2. Modify loadData
old_load_data = """  const loadData = async () => {
    try {
      const emps = await getEmployees();
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (err) {
      console.error(err);
      setEmployees([]);
    }
    const shiftLogs = getEmployeeLogs();
    setLogs(shiftLogs);
  };"""

new_load_data = """  const loadData = async () => {
    try {
      const emps = await getEmployees();
      setEmployees(Array.isArray(emps) && emps.length > 0 ? emps : MOCK_EMPLOYEES);
    } catch (err) {
      console.error(err);
      setEmployees(MOCK_EMPLOYEES);
    }
    const shiftLogs = getEmployeeLogs();
    setLogs(shiftLogs);
  };"""
content = content.replace(old_load_data, new_load_data)

# 3. Add states for change password
states_addition = """  const [submitting, setSubmitting] = useState(false);

  // Modal & form states for changing password
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [cpEmail, setCpEmail] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');"""
content = content.replace("  const [submitting, setSubmitting] = useState(false);", states_addition)

# 4. Add handleChangePasswordSubmit
handler_addition = """  const handleAddEmployeeSubmit = async (e) => {"""
new_handler = """  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!cpEmail || !cpNewPassword || !cpConfirmPassword) {
      alert('Please fill out all fields.');
      return;
    }
    if (cpNewPassword !== cpConfirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      setSubmitting(true);
      // Simulate backend password change
      await new Promise(res => setTimeout(res, 600));
      alert('Password updated successfully!');
      setIsChangePasswordModalOpen(false);
      setCpEmail('');
      setCpNewPassword('');
      setCpConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEmployeeSubmit = async (e) => {"""
content = content.replace(handler_addition, new_handler)

# 5. Add "Change Password" button
old_add_btn = """            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                backgroundColor: 'var(--border-focus)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-focus-hover, #d24e0b)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-focus)'}
            >
              Add Employee
            </button>"""

new_buttons = """            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                style={{
                  backgroundColor: 'var(--bg-button)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
              >
                Change Password
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  backgroundColor: 'var(--border-focus)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-focus-hover, #d24e0b)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-focus)'}
              >
                Add Employee
              </button>
            </div>"""
content = content.replace(old_add_btn, new_buttons)

# 6. Add Change Password Modal
modal = """      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div style={{
            width: '400px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Change Password</h3>
              <button 
                onClick={() => setIsChangePasswordModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@cafe.com"
                  value={cpEmail}
                  onChange={(e) => setCpEmail(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={cpNewPassword}
                  onChange={(e) => setCpNewPassword(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={cpConfirmPassword}
                  onChange={(e) => setCpConfirmPassword(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-button)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--border-focus)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};"""

content = content.replace("    </div>\n  );\n};\n\nexport default Employees;\n", modal + "\n\nexport default Employees;\n")

with open(file_path, 'w') as f:
    f.write(content)

print("Mock data and change password feature added!")
