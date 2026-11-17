const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const dbPath = path.join(__dirname, 'chargers.db')
let db = null

app.use(express.json())

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`ChargeUp Station API Server Running Successfully on port ${PORT}`)
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// ---------------- COMMUTERS CRUD ----------------

app.get('/commuters/', async (request, response) => {
  try {
    const getCommutersQuery = `
      SELECT commuter_id AS commuterId,
             commuter_name AS commuterName, email, phone
      FROM commuters
      ORDER BY commuter_id;
    `
    const commutersArray = await db.all(getCommutersQuery)
    response.send(commutersArray)
  } catch (error) {
    response.status(500).send({message: 'Unable to get commuters'})
  }
})

app.post('/commuters/', async (request, response) => {
  try {
    const {commuterName, email, phone} = request.body

    // Validation
    if (!commuterName || !email) {
      response.status(400).send({
        message: 'commuterName and email are required'
      })
      return
    }

    if (typeof commuterName !== 'string' || commuterName.trim() === '') {
      response.status(400).send({
        message: 'commuterName must be a valid non-empty string'
      })
      return
    }

    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      response.status(400).send({
        message: 'Provide a valid email address'
      })
      return
    }

    if (
      phone !== undefined &&
      phone !== null &&
      typeof phone !== 'string'
    ) {
      response.status(400).send({
        message: 'Phone must be a string'
      })
      return
    }

    const addCommuterQuery = `
      INSERT INTO commuters (commuter_name, email, phone)
      VALUES (?, ?, ?);
    `
    const dbResponse = await db.run(addCommuterQuery, [
      commuterName, email, phone || null,
    ])
    response.status(201).send({
      message: 'Commuter Added Successfully',
      commuterId: dbResponse.lastID,
    })
  } catch (error) {
    response.status(500).send({message: 'Unable to add commuter'})
  }
})

app.get('/commuters/:commuterId/', async (request, response) => {
  try {
    const {commuterId} = request.params
    const getCommuterQuery = `
      SELECT commuter_id AS commuterId,
             commuter_name AS commuterName, email, phone
      FROM commuters
      WHERE commuter_id = ?;
    `
    const commuter = await db.get(getCommuterQuery, [commuterId])
    if (!commuter) {
      response.status(404).send({message: 'Commuter Not Found'})
      return
    }
    response.send(commuter)
  } catch (error) {
    response.status(500).send({message: 'Unable to get commuter'})
  }
})

app.put('/commuters/:commuterId/', async (request, response) => {
  try {
    const {commuterId} = request.params
    const {commuterName, email, phone} = request.body

    // Validation
    if (!commuterName || !email) {
      response.status(400).send({
        message: 'commuterName and email are required'
      })
      return
    }

    if (typeof commuterName !== 'string' || commuterName.trim() === '') {
      response.status(400).send({
        message: 'commuterName must be a valid non-empty string'
      })
      return
    }

    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      response.status(400).send({
        message: 'Provide a valid email address'
      })
      return
    }

    if (
      phone !== undefined &&
      phone !== null &&
      typeof phone !== 'string'
    ) {
      response.status(400).send({
        message: 'Phone must be a string'
      })
      return
    }

    const updateCommuterQuery = `
      UPDATE commuters
      SET commuter_name = ?, email = ?, phone = ?
      WHERE commuter_id = ?;
    `
    const dbResponse = await db.run(updateCommuterQuery, [
      commuterName, email, phone || null, commuterId,
    ])
    if (dbResponse.changes === 0) {
      response.status(404).send({message: 'Commuter Not Found'})
      return
    }
    response.send({message: 'Commuter Details Updated Successfully'})
  } catch (error) {
    response.status(500).send({message: 'Unable to update commuter'})
  }
})

app.delete('/commuters/:commuterId/', async (request, response) => {
  try {
    const {commuterId} = request.params
    const deleteCommuterQuery = `
      DELETE FROM commuters WHERE commuter_id = ?;
    `
    const dbResponse = await db.run(deleteCommuterQuery, [commuterId])
    if (dbResponse.changes === 0) {
      response.status(404).send({message: 'Commuter Not Found'})
      return
    }
    response.send({message: 'Commuter Removed Successfully'})
  } catch (error) {
    response.status(409).send({
      message: 'Cannot delete commuter because rental records are linked to this commuter',
    })
  }
})



// ---------------- CHARGERS CRUD ----------------

app.get('/chargers/', async (request, response) => {
  try {
    const {type = '', order = 'ASC', order_by = 'charger_id'} = request.query

    // Allow only valid columns and sorting directions
    const allowedColumns = ['charger_id', 'charger_name', 'location', 'charger_type', 'power_output', 'price_per_hour', 'status']
    const sortOrder = order.toUpperCase()
    if (!allowedColumns.includes(order_by) ||
        !['ASC', 'DESC'].includes(sortOrder)) {
      response.status(400).send({
        message: 'Invalid order_by or order value',
      })
      return
    }
    const getChargersQuery = `
      SELECT charger_id AS chargerId,
             charger_name AS chargerName, 
             location,
             charger_type AS chargerType,
             power_output AS powerOutput,
             price_per_hour AS pricePerHour, status
      FROM chargers
      WHERE charger_type LIKE ?
      ORDER BY ${order_by} ${sortOrder};`
    const chargersArray = await db.all(getChargersQuery, [`%${type}%`])
    response.send(chargersArray)
  } catch (error) {
    response.status(500).send({message: 'Unable to get chargers'})
  }
})

app.post('/chargers/', async (request, response) => {
  try {
    const {chargerName, location, chargerType, powerOutput, pricePerHour, status} = request.body

    // Validation
    if (!chargerName || !location || !chargerType ||
        powerOutput === undefined || powerOutput === null || powerOutput === '' ||
        pricePerHour === undefined || pricePerHour === null || pricePerHour === '') {
      response.status(400).send({
        message: 'All charger details are required'
      })
      return
    }

    if (
      typeof chargerName !== 'string' || chargerName.trim() === '' ||
      typeof location !== 'string' || location.trim() === '' ||
      typeof chargerType !== 'string' || chargerType.trim() === ''
    ) {
      response.status(400).send({
        message: 'Charger name, location and type must be valid strings'
      })
      return
    }

    if (!Number.isFinite(Number(powerOutput)) || Number(powerOutput) <= 0) {
      response.status(400).send({
        message: 'powerOutput must be a positive number'
      })
      return
    }

    if (!Number.isFinite(Number(pricePerHour)) || Number(pricePerHour) < 0) {
      response.status(400).send({
        message: 'pricePerHour must be a non-negative number'
      })
      return
    }

    const chargerStatus = status || 'available'
    if (!['available', 'rented', 'maintenance'].includes(chargerStatus)) {
      response.status(400).send({message: 'Invalid charger status'})
      return
    }

    const addChargerQuery = `
      INSERT INTO chargers
        (charger_name, location, charger_type, power_output, price_per_hour, status)
      VALUES (?, ?, ?, ?, ?, ?);
    `
    const dbResponse = await db.run(addChargerQuery, [
      chargerName, location, chargerType, Number(powerOutput),
      Number(pricePerHour), chargerStatus,
    ])
    response.status(201).send({
      message: 'Charger Added Successfully',
      chargerId: dbResponse.lastID,
    })
  } catch (error) {
    response.status(500).send({message: 'Unable to add charger'})
  }
})

// This route is for Top 3 chargers based on the number of rentals.
app.get('/chargers/top/', async (request, response) => {
  try {
    const getTopChargersQuery = `
      SELECT chargers.charger_id AS chargerId,
             chargers.charger_name AS chargerName,
             chargers.location,
             COUNT(rentals.rental_id) AS totalRentals
      FROM chargers
      LEFT JOIN rentals
        ON chargers.charger_id = rentals.charger_id
      GROUP BY chargers.charger_id
      HAVING COUNT(rentals.rental_id) > 0
      ORDER BY totalRentals DESC, chargers.charger_name ASC
      LIMIT 3;
    `

    const topChargersArray = await db.all(getTopChargersQuery)
    response.status(200).send(topChargersArray)
  } catch (error) {
    response.status(500).send({message: 'Unable to get top chargers'})
  }
})

app.get('/chargers/:chargerId/', async (request, response) => {
  try {
    const {chargerId} = request.params
    const getChargerQuery = `
      SELECT charger_id AS chargerId,
             charger_name AS chargerName, location,
             charger_type AS chargerType,
             power_output AS powerOutput,
             price_per_hour AS pricePerHour, status
      FROM chargers
      WHERE charger_id = ?;
    `
    const charger = await db.get(getChargerQuery, [chargerId])
    if (!charger) {
      response.status(404).send({message: 'Charger Not Found'})
      return
    }
    response.send(charger)
  } catch (error) {
    response.status(500).send({message: 'Unable to get charger'})
  }
})

app.put('/chargers/:chargerId/', async (request, response) => {
  try {
    const {chargerId} = request.params
    const {chargerName, location, chargerType, powerOutput, pricePerHour, status} = request.body

    // Validation
    if (!chargerName || !location || !chargerType ||
        powerOutput === undefined || powerOutput === null || powerOutput === '' ||
        pricePerHour === undefined || pricePerHour === null || pricePerHour === '' ||
        !status) {
      response.status(400).send({
        message: 'All charger details are required'
      })
      return
    }

    if (
      typeof chargerName !== 'string' || chargerName.trim() === '' ||
      typeof location !== 'string' || location.trim() === '' ||
      typeof chargerType !== 'string' || chargerType.trim() === ''
    ) {
      response.status(400).send({
        message: 'Charger name, location and type must be valid strings'
      })
      return
    }

    if (!Number.isFinite(Number(powerOutput)) || Number(powerOutput) <= 0) {
      response.status(400).send({
        message: 'powerOutput must be a positive number'
      })
      return
    }

    if (!Number.isFinite(Number(pricePerHour)) || Number(pricePerHour) < 0) {
      response.status(400).send({
        message: 'pricePerHour must be a non-negative number'
      })
      return
    }

    if (!['available', 'rented', 'maintenance'].includes(status)) {
      response.status(400).send({
        message: 'Invalid charger status'
      })
      return
    }

    const updateChargerQuery = `
      UPDATE chargers
      SET charger_name = ?, location = ?, charger_type = ?,
          power_output = ?, price_per_hour = ?, status = ?
      WHERE charger_id = ?;
    `
    const dbResponse = await db.run(updateChargerQuery, [
      chargerName, location, chargerType, Number(powerOutput),
      Number(pricePerHour), status, chargerId,
    ])
    if (dbResponse.changes === 0) {
      response.status(404).send({message: 'Charger Not Found'})
      return
    }
    response.send({message: 'Charger Details Updated Successfully'})
  } catch (error) {
    response.status(500).send({message: 'Unable to update charger'})
  }
})

app.delete('/chargers/:chargerId/', async (request, response) => {
  try {
    const {chargerId} = request.params
    const deleteChargerQuery = `
      DELETE FROM chargers WHERE charger_id = ?;
    `
    const dbResponse = await db.run(deleteChargerQuery, [chargerId])
    if (dbResponse.changes === 0) {
      response.status(404).send({message: 'Charger Not Found'})
      return
    }
    response.send({message: 'Charger Removed Successfully'})
  } catch (error) {
    response.status(409).send({
      message: 'Cannot delete charger because rental records are linked to this charger',
    })
  }
})


// ---------------- RENTALS CRUD ----------------

app.get('/rentals/', async (request, response) => {
  try {
    const getRentalsQuery = `
      SELECT rentals.rental_id AS rentalId,
             commuters.commuter_name AS commuterName,
             chargers.charger_name AS chargerName,
             chargers.location AS chargerLocation,
             rentals.start_time AS startTime,
             rentals.end_time AS endTime,
             rentals.total_amount AS totalAmount,
             rentals.status
      FROM rentals
      INNER JOIN commuters
        ON rentals.commuter_id = commuters.commuter_id
      INNER JOIN chargers
        ON rentals.charger_id = chargers.charger_id
      ORDER BY rentals.rental_id DESC;
    `
    const rentalsArray = await db.all(getRentalsQuery)
    response.send(rentalsArray)
  } catch (error) {
    response.status(500).send({message: 'Unable to get rentals'})
  }
})

app.post('/rentals/', async (request, response) => {
  try {
    const {commuterId, chargerId, startTime} = request.body

    // Validation
    if (!commuterId || !chargerId || !startTime) {
      response.status(400).send({
        message: 'commuterId, chargerId and startTime are required'
      })
      return
    }

    if (
      !Number.isInteger(Number(commuterId)) ||
      Number(commuterId) <= 0 ||
      !Number.isInteger(Number(chargerId)) ||
      Number(chargerId) <= 0
    ) {
      response.status(400).send({
        message: 'commuterId and chargerId must be positive integers'
      })
      return
    }

    if (typeof startTime !== 'string' || isNaN(Date.parse(startTime))) {
      response.status(400).send({
        message: 'Provide a valid startTime'
      })
      return
    }

    const getCommuterQuery = `
      SELECT commuter_id FROM commuters WHERE commuter_id = ?;
    `
    const commuter = await db.get(getCommuterQuery, [commuterId])
    if (!commuter) {
      response.status(404).send({message: 'Commuter Not Found'})
      return
    }

    const getChargerQuery = `
      SELECT charger_id, status FROM chargers WHERE charger_id = ?;
    `
    const charger = await db.get(getChargerQuery, [chargerId])

    if (!charger) {
      response.status(404).send({message: 'Charger Not Found'})
      return
    }
    if (charger.status !== 'available') {
      response.status(409).send({message: 'Charger is not available'})
      return
    }

    const addRentalQuery = `
      INSERT INTO rentals (commuter_id, charger_id, start_time, status)
      VALUES (?, ?, ?, 'active');
    `
    const dbResponse = await db.run(addRentalQuery, [commuterId, chargerId, startTime])

    const updateChargerStatusQuery = `
      UPDATE chargers SET status = 'rented' WHERE charger_id = ?;
    `
    await db.run(updateChargerStatusQuery, [chargerId])

    response.status(201).send({
      message: 'Rental Added Successfully',
      rentalId: dbResponse.lastID,
    })
  } catch (error) {
    response.status(500).send({message: 'Unable to add rental'})
  }
})

app.get('/rentals/:rentalId/', async (request, response) => {
  try {
    const {rentalId} = request.params
    const getRentalQuery = `
      SELECT rentals.rental_id AS rentalId,
             rentals.commuter_id AS commuterId,
             rentals.charger_id AS chargerId,
             commuters.commuter_name AS commuterName,
             chargers.charger_name AS chargerName,
             rentals.start_time AS startTime,
             rentals.end_time AS endTime,
             rentals.total_amount AS totalAmount,
             rentals.status
      FROM rentals
      INNER JOIN commuters
        ON rentals.commuter_id = commuters.commuter_id
      INNER JOIN chargers
        ON rentals.charger_id = chargers.charger_id
      WHERE rentals.rental_id = ?;
    `
    const rental = await db.get(getRentalQuery, [rentalId])
    if (!rental) {
      response.status(404).send({message: 'Rental Not Found'})
      return
    }
    response.send(rental)
  } catch (error) {
    response.status(500).send({message: 'Unable to get rental'})
  }
})

app.put('/rentals/:rentalId/', async (request, response) => {
  try {
    const {rentalId} = request.params
    const {status, endTime, totalAmount} = request.body

    // Validation
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      response.status(400).send({
        message: 'Invalid rental status'
      })
      return
    }

    if (
      totalAmount !== undefined &&
      (totalAmount === '' ||
        !Number.isFinite(Number(totalAmount)) ||
        Number(totalAmount) < 0)
    ) {
      response.status(400).send({
        message: 'totalAmount must be a valid non-negative number'
      })
      return
    }

    if (
      endTime !== undefined &&
      (typeof endTime !== 'string' || isNaN(Date.parse(endTime)))
    ) {
      response.status(400).send({
        message: 'Provide a valid endTime'
      })
      return
    }

    if (status === 'completed' && !endTime) {
      response.status(400).send({
        message: 'endTime is required when completing a rental'
      })
      return
    }

    const getRentalQuery = `
      SELECT charger_id AS chargerId FROM rentals WHERE rental_id = ?;
    `
    const rental = await db.get(getRentalQuery, [rentalId])
    if (!rental) {
      response.status(404).send({message: 'Rental Not Found'})
      return
    }

    const updateRentalQuery = `
      UPDATE rentals
      SET status = ?, end_time = ?, total_amount = ?
      WHERE rental_id = ?;
    `
    await db.run(updateRentalQuery, [
      status, endTime || null,
      totalAmount === undefined ? 0 : Number(totalAmount),
      rentalId,
    ])

    if (status === 'completed' || status === 'cancelled') {
      const updateChargerStatusQuery = `
        UPDATE chargers
        SET status = 'available'
        WHERE charger_id = ? AND status = 'rented';
      `
      await db.run(updateChargerStatusQuery, [rental.chargerId])
    }
    response.send({message: 'Rental Details Updated Successfully'})
  } catch (error) {
    response.status(500).send({message: 'Unable to update rental'})
  }
})

app.delete('/rentals/:rentalId/', async (request, response) => {
  try {
    const {rentalId} = request.params
    const getRentalQuery = `
      SELECT charger_id AS chargerId FROM rentals WHERE rental_id = ?;
    `
    const rental = await db.get(getRentalQuery, [rentalId])
    if (!rental) {
      response.status(404).send({message: 'Rental Not Found'})
      return
    }

    const deleteRentalQuery = `
      DELETE FROM rentals WHERE rental_id = ?;
    `
    await db.run(deleteRentalQuery, [rentalId])

    const countActiveRentalsQuery = `
      SELECT COUNT(*) AS activeRentalCount
      FROM rentals
      WHERE charger_id = ? AND status = 'active';
    `
    const activeRentals = await db.get(countActiveRentalsQuery, [rental.chargerId])

    if (activeRentals.activeRentalCount === 0) {
      const updateChargerStatusQuery = `
        UPDATE chargers
        SET status = 'available'
        WHERE charger_id = ? AND status = 'rented';
      `
      await db.run(updateChargerStatusQuery, [rental.chargerId])
    }
    response.send({message: 'Rental Deleted Successfully'})
  } catch (error) {
    response.status(500).send({message: 'Unable to delete rental'})
  }
})
