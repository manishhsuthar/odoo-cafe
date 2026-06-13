import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/POS.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add imports
imports = """import POSCategoriesManagement from './components/POSCategoriesManagement';
import POSPaymentMethodsManagement from './components/POSPaymentMethodsManagement';
import POSCouponsManagement from './components/POSCouponsManagement';
import POSBookingsManagement from './components/POSBookingsManagement';
import POSEmployeesManagement from './components/POSEmployeesManagement';
import POSReports from './components/POSReports';"""

content = content.replace("import POSProductsManagement from './components/POSProductsManagement';", f"import POSProductsManagement from './components/POSProductsManagement';\n{imports}")


# Replace categories block
content = re.sub(
    r"\) \: view === 'categories' \? \([\s\S]*?\) \: view === 'payment-methods' \? \(",
    r") : view === 'categories' ? (\n          <POSCategoriesManagement \n            categoriesList={categoriesList}\n            setCategoriesList={setCategoriesList}\n            addLogEntry={addLogEntry}\n          />\n        ) : view === 'payment-methods' ? (",
    content
)

# Replace payment-methods block
content = re.sub(
    r"\) \: view === 'payment-methods' \? \([\s\S]*?\) \: view === 'coupons' \? \(",
    r") : view === 'payment-methods' ? (\n          <POSPaymentMethodsManagement \n            allPaymentMethods={allPaymentMethods}\n            setAllPaymentMethods={setAllPaymentMethods}\n            addLogEntry={addLogEntry}\n          />\n        ) : view === 'coupons' ? (",
    content
)

# Replace coupons block
content = re.sub(
    r"\) \: view === 'coupons' \? \([\s\S]*?\) \: view === 'bookings' \? \(",
    r") : view === 'coupons' ? (\n          <POSCouponsManagement \n            allCouponsList={allCouponsList}\n            setAllCouponsList={setAllCouponsList}\n            addLogEntry={addLogEntry}\n          />\n        ) : view === 'bookings' ? (",
    content
)

# Replace bookings block
content = re.sub(
    r"\) \: view === 'bookings' \? \([\s\S]*?\) \: view === 'employees' \? \(",
    r") : view === 'bookings' ? (\n          <POSBookingsManagement \n            bookingsList={bookingsList}\n            setBookingsList={setBookingsList}\n            addLogEntry={addLogEntry}\n            tablesList={tablesList}\n          />\n        ) : view === 'employees' ? (",
    content
)

# Replace employees block
content = re.sub(
    r"\) \: view === 'employees' \? \([\s\S]*?\) \: view === 'reports' \? \(",
    r") : view === 'employees' ? (\n          <POSEmployeesManagement \n            allEmployeesList={allEmployeesList}\n            setAllEmployeesList={setAllEmployeesList}\n            attendanceLogsList={attendanceLogsList}\n            setAttendanceLogsList={setAttendanceLogsList}\n            addLogEntry={addLogEntry}\n          />\n        ) : view === 'reports' ? (",
    content
)

# Replace reports block
content = re.sub(
    r"\) \: view === 'reports' \? \([\s\S]*?\) \: \(",
    r") : view === 'reports' ? (\n          <POSReports \n            ordersList={ordersList}\n            logs={logs}\n            reloadManagementData={reloadManagementData}\n          />\n        ) : (",
    content
)

with open(file_path, 'w') as f:
    f.write(content)

print("Replacement successful.")
