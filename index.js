const e = require('express');
const express = require('express')
const app = express()
const port = 3000

const database = require("mariadb")
const pool = database.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "planning"
});

//Para que pueda recibir JSON
app.use(express.json())

//Solicitar listado de tareas
app.get('/tasks/', async (req, res) => {
    let conn
    try {
        conn = await pool.getConnection()
        const rows = await conn.query("SELECT * FROM todo")
        res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ message: error })
    }
    if (conn) { conn.release() }
})

//Solicitar tarea
app.get('/tasks/:id', async (req, res) => {
    let conn
    try {
        conn = await pool.getConnection()
        const rows = await conn.query("SELECT * FROM todo WHERE id = ?", [req.params.id])
        res.status(200).json(rows[0])
    } catch (error) {
        res.status(500).json({ message: error })
    }
    if (conn) { conn.release() }
})

//Crear tarea
app.post('/tasks', async (req, res) => {
    let conn
    try{
        conn = await pool.getConnection()
        const rows = await conn.query("INSERT INTO todo (name, description, created_at, status) VALUES (?, ?, CURDATE(), ?)", [req.body.name, req.body.description, req.body.status])
        if(rows.affectedRows == 1){
            res.status(200).json({id: rows.insertId, ...req.body})
        }else{
            throw "No se pudo crear"
        }
    }catch(error){
        res.status(500).json({message: error}) //NO SÉ POR QUÉ SALTA IGUAL EL ERROR AUNQUE NO EJECUTE EL THROW
    }
    if (conn) { conn.release() }
})

//Actualizar tarea
app.put('/tasks/:id', async (req, res) => {
    let conn
    try{
        conn = await pool.getConnection()
        const rows = await conn.query("UPDATE todo SET name = ?, description = ?, updated_at = CURDATE(), status = ? WHERE id = ?", [req.body.name, req.body.description, req.body.status, req.params.id])
        if(rows.affectedRows == 1){
            res.status(200).json({id: req.params.id, ...req.body})
        }else{
            throw "No se pudo actualizar"
        }
    }catch(error){
        res.status(500).json({message: error})
    }
    if (conn) { conn.release() }
})

//Eliminar tarea
app.delete('/tasks/:id', async (req, res) => {
    let conn
    try{
        conn = await pool.getConnection()
        const rows = await conn.query("DELETE FROM todo WHERE id = ?", [req.params.id])
        if(rows.affectedRows == 1){
            res.status(200).json({id: req.params.id})
        } else{
            throw "No se pudo eliminar"
        }
    }catch(error){
        res.status(500).json({message: error})
    }
    if (conn) { conn.release() }
})

//Inicializa el puerto para recibir peticiones
app.listen(port, () => {
    console.log(`API app listening at http://localhost:${port}`)
})