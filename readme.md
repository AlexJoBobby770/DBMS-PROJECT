# Hotel Management System

A complete hotel management system built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- **Dashboard**: Overview of hotel statistics
- **Room Management**: Add, edit, delete, and view rooms
- **Guest Management**: Manage guest information
- **Booking Management**: Create and cancel bookings
- **Real-time Updates**: Data synced with MySQL database
- **Responsive Design**: Works on desktop and mobile

## Prerequisites

- **XAMPP** (for MySQL and Apache)
- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Setup Instructions

### 1. Install XAMPP and Start Services

1. Download and install XAMPP from https://www.apachefriends.org/
2. Start XAMPP Control Panel
3. Start **Apache** and **MySQL** services
4. Open phpMyAdmin at http://localhost/phpmyadmin

### 2. Create Database

1. In phpMyAdmin, click **SQL** tab
2. Copy and paste the complete SQL schema (from the database setup artifact)
3. Click **Go** to execute
4. Verify that `hotel_db` database is created with tables: `rooms`, `guests`, `bookings`

### 3. Install Node.js Dependencies

```bash
# Navigate to your project directory
cd hotel-management-system

# Install dependencies
npm install
```

### 4. Update Server Configuration (if needed)

If your MySQL has a different configuration, update `server.js`:

```javascript
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Change if you set a MySQL password
  database: "hotel_db",
  port: 3306
};
```

### 5. Start the Application

```bash
# Start the server
npm start

# Or for development
npm run dev
```

The application will be available at: http://localhost:8000

## Project Structure

```
hotel-management-system/
├── public/
│   ├── index.html          # Dashboard
│   ├── rooms.html          # Room management
│   ├── guests.html         # Guest management
│   ├── bookings.html       # Booking management
│   ├── style.css           # Styles
│   ├── dashboard.js        # Dashboard functionality
│   ├── rooms.js            # Room management
│   ├── guests.js           # Guest management
│   └── booking.js          # Booking management
├── server.js               # Express server
├── package.json            # Dependencies
└── README.md              # This file
```

## API Endpoints

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Guests
- `GET /api/guests` - Get all guests
- `POST /api/guests` - Create new guest
- `DELETE /api/guests/:id` - Delete guest

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Stats
- `GET /api/stats` - Get dashboard statistics

## Database Schema

### Tables

1. **rooms**
   - id (Primary Key)
   - room_number (Unique)
   - room_type (Enum: Standard, Deluxe, Suite, Presidential)
   - price (Decimal)
   - status (Enum: Available, Booked, Maintenance)

2. **guests**
   - id (Primary Key)
   - name
   - email (Unique)
   - phone
   - check_in_date
   - address

3. **bookings**
   - id (Primary Key)
   - guest_id (Foreign Key)
   - room_id (Foreign Key)
   - check_in_date
   - check_out_date
   - total_amount
   - status (Enum: Confirmed, Pending, Cancelled, Completed)

### Views

- **room_booking_details**: Joins bookings with guest and room information

## Usage

1. **Dashboard**: View hotel statistics and recent activities
2. **Rooms**: Add new rooms, update room status, delete rooms
3. **Guests**: Register new guests, manage guest information
4. **Bookings**: Create bookings, view booking details, cancel bookings

## Features in Detail

- **Real-time Data**: All data is fetched from and stored to MySQL database
- **Validation**: Form validation on both frontend and backend
- **Error Handling**: Comprehensive error messages and user feedback
- **Responsive Design**: Mobile-friendly interface
- **Status Management**: Automatic room status updates when booking/cancelling
- **Price Calculation**: Automatic total amount calculation based on nights and room price
- **Data Integrity**: Foreign key constraints and proper relationships

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Database connection failed: ER_BAD_DB_ERROR
   ```
   - **Solution**: Make sure MySQL is running in XAMPP and the database `hotel_db` exists

2. **Port Already in Use**
   ```
   Error: listen EADDRINUSE :::8000
   ```
   - **Solution**: Stop other applications using port 8000 or change the port in server.js

3. **Module Not Found**
   ```
   Error: Cannot find module 'express'
   ```
   - **Solution**: Run `npm install` in the project directory

4. **CORS Errors**
   - **Solution**: Make sure you're accessing the app via http://localhost:8000, not opening HTML files directly

### Verification Steps

1. **Check MySQL Connection**:
   ```bash
   # In phpMyAdmin, run:
   SELECT COUNT(*) FROM hotel_db.rooms;
   ```

2. **Test API Endpoints**:
   - Visit http://localhost:8000/api/rooms
   - Should return JSON data of rooms

3. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any JavaScript errors in Console tab

## Sample Data

The system comes with pre-loaded sample data:

- **8 Rooms**: Different types and prices
- **5 Guests**: Sample guest information
- **4 Bookings**: Sample bookings with different statuses

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Room amenities management
- [ ] Check-in/Check-out process
- [ ] Invoice generation
- [ ] Multi-language support

## Support

If you encounter any issues:

1. Check the console logs in terminal where you started the server
2. Check browser developer tools for frontend errors
3. Verify XAMPP services are running
4. Ensure all dependencies are installed with `npm install`

## License

This project is open source and available under the MIT License.

---

**Note**: This is a demonstration project. For production use, implement proper security measures, user authentication, and data validation.