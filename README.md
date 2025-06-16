# Pegman FL_Shop Database Schema

This document provides an overview of the database schema used in the Pegman fl_shop backend application. It includes details about all tables, their fields, and relationships.

## Table of Contents

- [Enumerations](#enumerations)
- [Tables](#tables)
  - [Owner](#owner)
  - [Outlet](#outlet)
  - [Outlet Details](#outlet-details)
  - [Outlet Legal Document](#outlet-legal-document)
  - [Outlet Manager](#outlet-manager)
  - [Outlet Bartender](#outlet-bartender)
  - [Outlet Timing](#outlet-timing)
  - [Outlet Timing Slot](#outlet-timing-slot)
  - [Session](#session)
  - [Relationships](#relationships)

## Enumerations

The application uses several PostgreSQL enumerations to enforce data consistency:


### `account_type`
- SAVINGS
- CURRENT

### `day_of_week`
- MONDAY
- TUESDAY
- WEDNESDAY
- THURSDAY
- FRIDAY
- SATURDAY
- SUNDAY
## Tables


### Owner

Stores information about outlet owners.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Owner name |
| email | VARCHAR | Owner email |
| mobileNumber | VARCHAR(10) | Mobile number (unique) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Session

Stores information about outlet owners.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| ownerId | UUID
| model | VARCHAR | Model of the phone |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet

Central table that connects all outlet-related information.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| ownerId | UUID | Reference to owner |
| isVerified | BOOLEAN | Verification status |
| detailsId | UUID | Reference to outlet details |
| legalDocumentId | UUID | Reference to legal documents |
| managerId | UUID | Reference to outlet manager |
| timingId | UUID | Reference to outlet timing |
| bartenderId | UUID | Reference to outlet bartender |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Details

Stores basic information about an outlet.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Outlet name |
| address | TEXT | Full address |
| contactNumber | VARCHAR(10) | Contact number |
| latitude | DOUBLE PRECISION | Geographic latitude |
| longitude | DOUBLE PRECISION | Geographic longitude |
| country | VARCHAR(100) | Country |
| pincode | VARCHAR(6) | Postal code |
| outletImageUrls | TEXT[] | Array of image URLs |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Legal Document

Stores legal and financial information about an outlet.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| onShopLicenseUrl | TEXT | On-shop license document URL |
| offShopLicenseUrl | TEXT | Off-shop license document URL |
| panCardNumber | VARCHAR(10) | PAN card number |
| panCardUrl | TEXT | PAN card document URL |
| gstNumber | VARCHAR(15) | GST registration number |
| bankAccountNumber | VARCHAR(30) | Bank account number |
| bankAccountType | account_type | Type of bank account |
| bankIfscCode | VARCHAR(11) | Bank IFSC code |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Manager

Stores information about outlet managers.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Manager name |
| contactNumber | VARCHAR(10) | Contact number |
| email | VARCHAR(320) | Email address |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Bartender

Stores information about outlet bartenders.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Bartender name |
| contactNumber | VARCHAR(10) | Contact number |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Timing

Stores general timing information about an outlet.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Timing Slot

Stores specific opening and closing times for each day of the week.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| outletTimingId | UUID | Reference to outlet timing |
| day | day_of_week | Day of the week |
| openingTime | TIME | Opening time |
| closingTime | TIME | Closing time |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |


## Relationships

### Owner Relationships
- An owner can have one outlet
- An owner can have multiple sessions

### Session Relationships
- A session belongs to one owner

### Outlet Relationships
- An outlet belongs to one owner
- An outlet has one details record
- An outlet has one legal document record
- An outlet has one manager
- An outlet has one timing record
- An outlet has one bartender (optional)

### Outlet Timing Relationships
- An outlet timing can have many timing slots
