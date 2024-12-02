const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cassandra = require('cassandra-driver');
const { validate: validateUuid } = require('uuid');
const path = require('path'); // Para manejar rutas

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuración del cliente Cassandra
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'testkeyspace'
});

client.connect();

// Ruta para servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Obtener todos los items
app.get('/items', async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM items');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener items:', err);
        res.status(500).send('Error al obtener los items');
    }
});

// Crear un nuevo item
app.post('/items', async (req, res) => {
    const { id, name, marca, color, precio } = req.body;

    // Validar campos requeridos
    if (!id || !name || !marca || !color || !precio) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    // Validar que el ID sea un UUID válido
    if (!validateUuid(id)) {
        return res.status(400).send('El ID debe ser un UUID válido');
    }

    try {
        await client.execute(
            'INSERT INTO items (id, name, marca, color, precio) VALUES (?, ?, ?, ?, ?)',
            [id, name, marca, color, precio],
            { prepare: true }
        );
        res.status(201).send('Item creado');
    } catch (err) {
        console.error('Error insertando item:', err);
        res.status(500).send('Error al crear el item');
    }
});

// Actualizar un item existente
app.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const { name, marca, color, precio } = req.body;

    // Validar campos requeridos
    if (!id || !name || !marca || !color || !precio) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    // Validar que el ID sea un UUID válido
    if (!validateUuid(id)) {
        return res.status(400).send('El ID debe ser un UUID válido');
    }

    try {
        const query = `
            UPDATE items 
            SET name = ?, marca = ?, color = ?, precio = ? 
            WHERE id = ?
        `;
        await client.execute(query, [name, marca, color, precio, id], { prepare: true });
        res.send('Item actualizado');
    } catch (err) {
        console.error('Error actualizando item:', err);
        res.status(500).send('Error al actualizar el item');
    }
});


// Eliminar un item
app.delete('/items/:id', async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea un UUID válido
    if (!validateUuid(id)) {
        return res.status(400).send('El ID debe ser un UUID válido');
    }

    try {
        const query = 'DELETE FROM items WHERE id = ?';
        await client.execute(query, [id], { prepare: true });
        res.send('Item eliminado');
    } catch (err) {
        console.error('Error eliminando item:', err);
        res.status(500).send('Error al eliminar el item');
    }
});

// Iniciar el servidor
app.listen(3000, () => console.log('Backend ejecutándose en http://localhost:3000'));
