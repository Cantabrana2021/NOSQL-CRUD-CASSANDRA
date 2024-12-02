// Importar uuidv4 desde un CDN
import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';

// URL de la API de backend
const apiUrl = 'http://localhost:3000/items';

// Actualizar la función fetchItems para mostrar los nuevos campos
export async function fetchItems() {
    try {
        const response = await fetch(apiUrl);
        const items = await response.json();
        const itemList = document.getElementById('itemList');
        itemList.innerHTML = ''; // Limpiar lista existente

        if (items.length === 0) {
            itemList.innerHTML = '<tr><td colspan="5">No hay items disponibles.</td></tr>';
            return;
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.marca}</td>
                <td>${item.color}</td>
                <td>${item.precio}</td>
                <td>
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                </td>
            `;
            itemList.appendChild(tr);

            // Asignar eventos
            const editButton = tr.querySelector('.edit-button');
            editButton.addEventListener('click', () => 
                editItem(item.id, item.name, item.marca, item.color, item.precio)
            );

            const deleteButton = tr.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => deleteItem(item.id));
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Crear un nuevo item
export async function createItem() {
    const id = uuidv4(); // Generar un UUID
    const name = document.getElementById('itemName').value;
    const marca = document.getElementById('itemMarca').value;
    const color = document.getElementById('itemColor').value;
    const precio = document.getElementById('itemPrecio').value;

    if (!name || !marca || !color || !precio) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, marca, color, precio })
    });

    fetchItems(); // Refrescar la lista de items
}

// Actualizar un item
export async function updateItem() {
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value;
    const marca = document.getElementById('itemMarca').value;
    const color = document.getElementById('itemColor').value;
    const precio = document.getElementById('itemPrecio').value;

    if (!id || !name || !marca || !color || !precio) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, marca, color, precio })
    });

    fetchItems(); // Refrescar la lista de items
}

// Editar un item existente
export function editItem(id, name, marca, color, precio) {
    document.getElementById('itemId').value = id;
    document.getElementById('itemName').value = name;
    document.getElementById('itemMarca').value = marca;
    document.getElementById('itemColor').value = color;
    document.getElementById('itemPrecio').value = precio;
}


// Función para eliminar un item
export async function deleteItem(id) {
    if (!id) {
        const selectedId = document.getElementById('itemId').value;
        if (!selectedId) {
            alert('Por favor, selecciona un ID para eliminar.');
            return;
        }
        id = selectedId;
    }

    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });

    fetchItems(); // Refrescar la lista de items
}



// Llamar a fetchItems() al cargar la página para mostrar los datos existentes
window.onload = fetchItems;
