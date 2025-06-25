# PRUDEV II Portfolio Manager

A comprehensive Django-based portfolio management system for managing MSME (Micro, Small, and Medium Enterprises) data and Business Growth Experts (BGEs).

## Features

### MSME Management
- **Data Upload**: Bulk import MSME data from Excel files
- **Auto-numbering**: Unique MSME codes (format: PRUDEV2-GOPA-COHORT-XXX)
- **Search & Filter**: Advanced filtering by business type, sector, location
- **Analytics Dashboard**: Comprehensive insights and statistics
- **CRUD Operations**: Create, read, update, delete MSME records

### Business Growth Expert (BGE) Management
- **Expert Database**: Manage business growth experts
- **Skill Matching**: Match BGEs with MSMEs based on expertise areas
- **Leaderboard**: Track top-performing BGEs
- **Support Requests**: MSMEs can request BGE assistance
- **Approval System**: Admin approval workflow for BGE registrations

### Analytics & Insights
- **Dashboard**: Real-time statistics and metrics
- **Business Type Analysis**: Distribution across micro, small, medium enterprises
- **Sector Analysis**: Industry breakdown and trends
- **Geographic Analysis**: Location-based insights
- **Performance Metrics**: Revenue, employee count, investment needs

## Technology Stack

- **Backend**: Django 5.2.1
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Frontend**: HTML, CSS, JavaScript
- **Data Processing**: Pandas for Excel file handling
- **Deployment**: Django development server (ready for production deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-manager
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Main application: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

## Usage

### MSME Data Management
1. **Upload Data**: Navigate to "Upload Data" and select your Excel file
2. **View Records**: Browse MSMEs in the database with search and filter options
3. **Analytics**: Check the analytics dashboard for insights
4. **Export**: Download MSME data in Excel format

### BGE Management
1. **Register BGEs**: Upload BGE data or use the signup form
2. **Approve Experts**: Admin can approve/reject BGE applications
3. **Match Services**: MSMEs can request BGE assistance
4. **Track Performance**: View leaderboard and performance metrics

### Support Requests
1. **Request Support**: MSMEs can submit support requests
2. **Auto-matching**: System matches BGEs based on expertise
3. **Track Requests**: Monitor support request status

## Data Structure

### MSME Fields
- Business Name, Owner Name, Contact Information
- Location (City, State, Country)
- Business Type (Micro, Small, Medium)
- Sector (Manufacturing, Services, Trade, etc.)
- Financial Data (Annual Revenue, Investment Needed)
- Employee Count, Business Description

### BGE Fields
- Personal Information (Name, Email, Phone)
- Location and Years of Experience
- Skills (Primary, Secondary, Tertiary areas)
- Status (Pending, Approved, Rejected)

## API Endpoints

- `/` - Dashboard
- `/msme/` - MSME list
- `/msme/upload/` - Upload MSME data
- `/msme/analytics/` - MSME analytics
- `/bge/` - BGE list
- `/bge/upload/` - Upload BGE data
- `/bge-leaderboard/` - BGE leaderboard
- `/support-request/` - Support request form
- `/admin/` - Django admin panel

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the PRUDEV II initiative.

## Support

For support and questions, please contact the development team.

---

**PRUDEV II Portfolio Manager** - Empowering MSMEs through data-driven insights and expert matching. 