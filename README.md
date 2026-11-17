# ChargeUp Station – Charger Sharing System

## Project Details

- **Project Name:** ChargeUp Station – Charger Sharing System
- **Module:** Backend Development
- **Technology Stack:** Node.js, Express.js, SQLite
- **Team Size:** 5 Members

## Live Link

- **Live API URL:** https://backend-development-group-assignment.onrender.com

## Project Description

ChargeUp Station is a backend REST API application designed to manage an electric vehicle (EV) charger-sharing system.

The system allows commuters to access and rent available EV chargers. It provides operations to manage commuters, chargers, and rental records.

The application supports CRUD (Create, Read, Update, Delete) operations for all three main entities: commuters, chargers, and rentals.

It also includes features such as charger availability management, validation of commuter and charger IDs, SQL JOIN operations to retrieve related information, and identification of the Top 3 Most-Rented Chargers.

## Team Members and Contributions

| Member | Name | Registration Number | Role | Contribution |
|---|---|---|---|---|
| Member 1 | K Umesh | 252U1R6105 | Server Setup & Integration | Express server setup, SQLite connection, server initialization, integration of all modules, and resolving integration errors. |
| Member 2 | Diviti Bharadwaj | 252U1R6060 | Commuter Management | Commuter CRUD operations, input validation, and invalid ID handling. |
| Member 3 | Gudivari Reddy Chathurya | 252U1R6087 | Charger Management | Charger CRUD operations, Top 3 Most-Rented Chargers, and alphabetical sorting for tied rental counts. |
| Member 4 | Kadiyala Sama Kruthika | 252U1R6107 | Rental Management | Rental CRUD operations, ID verification, charger availability management, and SQL JOIN operations. |
| Member 5 | Gurram Shravana Manikanta | 252U1R6094 | Database, Documentation & Testing | Database maintenance, schema and relationship verification, sample records, Postman testing, README documentation, and screenshots. |

## Database Structure

The project uses an SQLite database named `chargers.db`.

It contains three main tables:

| Table | Description |
|---|---|
| `commuters` | Stores commuter details such as name, email, and phone number. |
| `chargers` | Stores charger details such as name, location, type, power output, price, and availability status. |
| `rentals` | Stores rental details, including commuter ID, charger ID, start time, end time, rental status, and total amount. |

The database uses primary keys and foreign keys to maintain relationships between the tables.

## How to Run

### Prerequisites

- Node.js
- npm
- SQLite
- Postman (for API testing)

### Installation

1. Clone the GitHub repository.

2. Navigate to the project folder:

```bash
cd ChargeUp-Station
```

3. Install the dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

Alternatively, use:

```bash
npm start
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port on which the Express server runs | `3000` |

The SQLite database is stored in `chargers.db`. Ensure that the database file is present in the project directory before starting the application.

## API Endpoints

Base URL: `http://localhost:3000`

### 1. Commuter Management

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/commuters/` | Get all commuters |
| GET | `/commuters/:commuterId/` | Get a commuter by ID |
| POST | `/commuters/` | Add a new commuter |
| PUT | `/commuters/:commuterId/` | Update commuter details |
| DELETE | `/commuters/:commuterId/` | Delete a commuter |

### 2. Charger Management

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/chargers/` | Get all chargers |
| GET | `/chargers/:chargerId/` | Get a charger by ID |
| POST | `/chargers/` | Add a new charger |
| PUT | `/chargers/:chargerId/` | Update charger details |
| DELETE | `/chargers/:chargerId/` | Delete a charger |
| GET | `/chargers/top/` | Get the Top 3 Most-Rented Chargers |
| GET | `/chargers/?type=DC` | Search chargers by type |
| GET | `/chargers/?order=DESC&order_by=price_per_hour` | Sort chargers by price in descending order |

The charger listing endpoint supports filtering by charger type and sorting by supported columns in ascending or descending order using the `order` and `order_by` query parameters.

### 3. Rental Management

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/rentals/` | Get all rental records |
| GET | `/rentals/:rentalId/` | Get a rental by ID |
| POST | `/rentals/` | Create a new rental |
| PUT | `/rentals/:rentalId/` | Update rental details and status |
| DELETE | `/rentals/:rentalId/` | Delete a rental |

## HTTP Status Codes

The application uses appropriate HTTP status codes to indicate the result of API operations.

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Invalid input or missing required fields |
| 404 | Requested commuter, charger, or rental not found |
| 409 | Resource conflict, such as an unavailable charger |
| 500 | Internal server error |

## Important Features

### 1. CRUD Operations

The application supports creating, retrieving, updating, and deleting commuters, chargers, and rentals.

### 2. Charger Availability Management

- Only available chargers can be rented.
- Charger status is updated when a rental is created.
- Chargers are made available when rentals are completed or cancelled.
- Unavailable chargers cannot be rented again through the normal rental creation flow.

### 3. ID Validation

The rental module verifies whether the provided commuter ID and charger ID exist before creating a rental.

### 4. SQL JOIN Operations

SQL JOIN operations are used to retrieve related commuter and charger details along with rental information.

### 5. Top 3 Most-Rented Chargers

The application identifies the three chargers with the highest number of rentals.

- Rental counts are sorted in descending order.
- Chargers with equal rental counts are sorted alphabetically.
- Chargers with zero rentals are excluded.

### 6. Input Validation

The application performs input validation to ensure that valid data is entered through API requests.

- **Commuter Validation:** Checks required commuter name and email fields, validates the email format, and checks the phone field type when provided.
- **Charger Validation:** Checks charger name, location, charger type, positive power output, non-negative price per hour, and valid charger status.
- **Rental Validation:** Checks required commuter ID, charger ID, valid start time, permitted rental status, valid end time, and non-negative total amount.

Invalid input requests return appropriate HTTP 400 responses.

### 7. Charger Search and Sorting

- Chargers can be searched using their charger type.
- Results can be sorted using supported charger columns.
- Sorting supports ascending (ASC) and descending (DESC) order.
- Allowed sorting columns and directions are validated before executing the SQL query.

## Postman Testing

The REST API endpoints are tested using Postman.

The collection includes requests for:

- Commuter CRUD operations
- Charger CRUD operations
- Charger search and sorting
- Top 3 Most-Rented Chargers
- Rental CRUD operations
- Input validation and error handling
- Invalid IDs and missing records
- Charger availability conflicts

## Screenshots

Postman screenshots demonstrating API operations, responses, and validation are stored in the `screenshots/` folder.

**### Commuter Management**

**#### GET All Commuters**

![GET All Commuters](screenshots/get-all-commuters.png)

**#### GET 1 Commuter**

![GET 1 Commuter By ID](screenshots/get-commuter-by-Id.png)

**#### POST Commuter**

![POST Commuter](screenshots/post-commuter.png)

**#### PUT Commuter**

![PUT Commuter](screenshots/put-commuter.png)

**#### DELETE Commuter**

![DELETE Commuter](screenshots/delete-commuter.png)

**### Charger Management**

**#### GET All Chargers**

![GET All Chargers](screenshots/get-all-chargers.png)

**#### GET 1 Chargers**

![GET 1 Charger By ID](screenshots/get-charger-by-Id.png)

**#### POST Charger**

![POST Charger](screenshots/post-charger.png)

**#### PUT Charger**

![PUT Charger](screenshots/put-charger.png)

**#### DELETE Charger**

![DELETE Charger](screenshots/delete-charger.png)

**#### Top 3 Most-Rented Chargers**

![Top 3 Most-Rented Chargers](screenshots/top-3-chargers.png)

**### Rental Management**

**#### GET All Rentals**

![GET All Rentals](screenshots/get-all-rentals.png)

**#### GET 1 Rental**

![GET 1 Rental By ID](screenshots/get-rental-by-Id.png)

**#### POST Rental**

![POST Rental](screenshots/post-rental.png)

**#### PUT Rental**

![PUT Rental](screenshots/put-rental.png)

**#### DELETE Rental**

![DELETE Rental](screenshots/delete-rental.png)

**#### Charger Search and Sorting**

![Search chargers by type:](screenshots/charger-Search-chargers-by-type.png)
![Sort chargers by price in descending order](screenshots/sort-chargers-by-price-in-descending-order.png)
![Search and sort together](screenshots/search-and-sort-together.png)

## Notes: Problems Faced and Solutions

1. **Database Connection:** Configured SQLite database connectivity using the `sqlite` and `sqlite3` packages.
2. **Invalid IDs:** Added validation to verify commuter, charger, and rental IDs before performing operations.
3. **Charger Availability:** Implemented availability checks to prevent renting chargers that are already unavailable.
4. **SQL JOIN Operations:** Used JOIN queries to retrieve related commuter, charger, and rental information.
5. **Rental Status Management:** Updated charger availability based on rental completion or cancellation.
6. **Top 3 Most-Rented Chargers:** Used SQL aggregation, GROUP BY, COUNT, HAVING, and ORDER BY to identify the most-rented chargers.
7. **SQL Query Parameters:** Used parameterized SQL queries to safely pass values into database operations.
8. **Deployment Port Configuration:** Used `process.env.PORT || 3000` to support deployment platforms such as Render.
9. **Input Validation:** Added validation checks to prevent invalid or incomplete data from being inserted or updated.
10. **Charger Search and Sorting:** Implemented query parameters to filter chargers by type and sort results using supported columns and sorting directions.

## Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Postman
- Git and GitHub
- Render

## Conclusion

ChargeUp Station demonstrates the development of a RESTful backend application using Node.js, Express.js, and SQLite. It provides a structured way to manage commuters, EV chargers, and rental transactions while maintaining database relationships and charger availability.