# dormitory-booking-systm
DormiFind is a web-based platform that connects tenants with dormitory owners, allowing seamless room booking, payment tracking, and dormitory management.


##  Features

### Tenant
- Browse and search dormitories by location and price
- View dormitory details, amenities, and room availability
- Send booking requests
- Upload payment screenshots (GCash)
- View payment history and status
- Receive notifications for booking and payment updates

### Owner
- Register and manage dormitory listings
- Add room details, amenities, and house rules
- Upload dormitory images and GCash QR code
- Approve or reject booking requests
- View and verify tenant payments
- Receive notifications for new bookings and payments

### Admin
- Manage users (view, ban/unban owners)
- Approve or reject dormitory applications
- Manage dormitory listings (activate/deactivate)
- Post announcements for all users
- Handle user reports and disputes

---

##  Tech Stack

| Layer   | Technology |
|-------  |------------|
| Frontend| React.js, CSS |
| Backend | PHP |
| Database| MySQL |
| HTTP Client | Axios |
| Icons    | React Icons |
| Server   | XAMPP (Apache) |

## Project Structure
dormifind/
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── contexts/ # React context (Auth)
│ │ ├── hooks/ # Custom hooks (useAutoRefresh)
│ │ ├── pages/ # Page components
│ │ └── App.jsx
│ └── package.json
│
└── backend/
├── api/ # PHP API endpoints
│ ├── admin/ # Admin functions
│ ├── bookings/ # Booking operations
│ ├── dormitories/ # Dormitory operations
│ ├── payments/ # Payment operations
│ ├── reports/ # Report functions
│ └── users/ # User functions
├── config/ # Database configuration
├── uploads/ # Uploaded images
│ ├── dormitories/
│ ├── payments/
│ └── proofs/
└── .htaccess

 License
This project is for educational purposes only.

Developers
Ramos Rafaella Mae
Granados Michelle
Tapales Sysrel
Milcha Balbin
Napila Jhelian
Magada Kim ALfrederick


## 📁 Project Structure
