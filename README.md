get-a-room
============

RESTful API for booking meeting rooms. Manage rooms and bookings.

Routes
------

| Route          | Method | Description      | JSON arguments |
|----------------|--------|------------------|----------------|
| /rooms         | GET    | List rooms       |                |
| /rooms         | POST   | Create a room    | `{ number: number, name: string }` |
| /rooms/:number | PUT    | Update a room    | `{ name: string }` |
| /rooms/:number | DELETE | Delete a room    |                |
| /bookings      | GET    | List bookings    | `{ roomNumber: (optional)number, date: (optional)date }` |
| /bookings      | POST   | Book a room      | `{ title: string, roomNumber: number, startAt: date, endAt: date }` |
| /bookings/:uid | PUT    | Update a booking | `{ title: (optional)string, roomNumber: (optional)number, startAt: (optional)date, endAt: (optional)date }` |
| /bookings/:uid | DELETE | Delete a booking |                |

Dependencies
------------

Tested with:

- NodeJS 8.11.4
- Yarn 1.9.4
- MongoDB 3.2.21


Set up
------

With all dependencies installed and MongoDB up, run:

`yarn`

Run server
----------

Start server on port PORT (env var). Defaults to 3000.

`yarn start`

Run auto-refreshable dev server
-------------------------------

`yarn dev`

Run tests with coverage
---------------------

`yarn test`

Auto-fix coding style
---------------------

`yarn linter`

Logging
-------

Requests are logged in Apache combined format to `access.log`