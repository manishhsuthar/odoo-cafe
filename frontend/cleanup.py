import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/POS.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# I will use string replace and regex to clear out unused state variables and handlers from POS.jsx.
# This makes the codebase much cleaner and reduces unnecessary re-renders in the parent.

# 1. State variables
states_to_remove = [
    r"const \[newCategoryName, setNewCategoryName\] = useState\(''\);\n",
    r"const \[newCategoryDesc, setNewCategoryDesc\] = useState\(''\);\n",
    
    r"const \[searchPaymentQuery, setSearchPaymentQuery\] = useState\(''\);\n",
    r"const \[newPaymentName, setNewPaymentName\] = useState\(''\);\n",
    r"const \[newPaymentType, setNewPaymentType\] = useState\('Cash'\);\n",
    r"const \[newPaymentValue, setNewPaymentValue\] = useState\(''\);\n",
    
    r"const \[searchCouponsQuery, setSearchCouponsQuery\] = useState\(''\);\n",
    r"const \[newCouponName, setNewCouponName\] = useState\(''\);\n",
    r"const \[newCouponCode, setNewCouponCode\] = useState\(''\);\n",
    r"const \[newCouponValue, setNewCouponValue\] = useState\(''\);\n",
    r"const \[newCouponMinAmount, setNewCouponMinAmount\] = useState\(''\);\n",
    r"const \[newCouponDiscountType, setNewCouponDiscountType\] = useState\('Percentage'\);\n",
    
    r"const \[searchBookingsQuery, setSearchBookingsQuery\] = useState\(''\);\n",
    r"const \[newBookingCustomer, setNewBookingCustomer\] = useState\(''\);\n",
    r"const \[newBookingPhone, setNewBookingPhone\] = useState\(''\);\n",
    r"const \[newBookingDateTime, setNewBookingDateTime\] = useState\(''\);\n",
    r"const \[newBookingGuests, setNewBookingGuests\] = useState\('2'\);\n",
    r"const \[newBookingTable, setNewBookingTable\] = useState\(''\);\n",
    
    r"const \[searchEmployeesQuery, setSearchEmployeesQuery\] = useState\(''\);\n",
    r"const \[newEmpName, setNewEmpName\] = useState\(''\);\n",
    r"const \[newEmpEmail, setNewEmpEmail\] = useState\(''\);\n",
    r"const \[newEmpRole, setNewEmpRole\] = useState\('Chef'\);\n",
    r"const \[newEmpPassword, setNewEmpPassword\] = useState\(''\);\n",
]

for s in states_to_remove:
    content = re.sub(s, '', content)

# 2. Handlers
handlers_to_remove = [
    r"  // Payment Methods Handlers\n  const handleAddPaymentMethod = \(e\) => \{[\s\S]*?\};\n\n  const handleTogglePaymentMethod = \(pmId\) => \{[\s\S]*?\};\n\n  const handleDeletePaymentMethod = \(pmId\) => \{[\s\S]*?\};\n",
    r"  // Coupons Handlers\n  const handleAddCoupon = \(e\) => \{[\s\S]*?\};\n\n  const handleToggleCoupon = \(cpId\) => \{[\s\S]*?\};\n\n  const handleDeleteCoupon = \(cpId\) => \{[\s\S]*?\};\n",
    r"  // Bookings Handlers\n  const handleAddBooking = \(e\) => \{[\s\S]*?\};\n\n  const handleUpdateBookingStatus = \(bkId, status\) => \{[\s\S]*?\};\n\n  const handleDeleteBooking = \(bkId\) => \{[\s\S]*?\};\n",
    r"  // Employees Handlers\n  const handleAddEmployee = \(e\) => \{[\s\S]*?\};\n\n  const handleDeleteEmployee = \(empId\) => \{[\s\S]*?\};\n\n  const handleToggleShift = \(logId\) => \{[\s\S]*?\};\n"
]

for h in handlers_to_remove:
    content = re.sub(h, '', content)


with open(file_path, 'w') as f:
    f.write(content)

print("Cleanup successful.")
