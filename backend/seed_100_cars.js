const baseUrl = 'http://localhost:8080/api/cars';

const brandsModels = {
    'Toyota': ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Hilux', 'Prius'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Fit', 'HR-V'],
    'Ford': ['Mustang', 'Focus', 'Fiesta', 'Explorer', 'F-150', 'Kuga'],
    'Chevrolet': ['Cruze', 'Malibu', 'Silverado', 'Camaro', 'Tahoe'],
    'BMW': ['Serie 3', 'Serie 5', 'X3', 'X5', 'M4'],
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'e-tron'],
    'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'GLC', 'GLE'],
    'Volkswagen': ['Golf', 'Polo', 'Tiguan', 'Passat', 'T-Roc'],
    'Hyundai': ['Tucson', 'i30', 'Kona', 'Santa Fe', 'Elantra'],
    'Kia': ['Sportage', 'Ceed', 'Niro', 'Sorento', 'Rio'],
    'Nissan': ['Qashqai', 'Juke', 'X-Trail', 'Leaf', 'Micra'],
    'Peugeot': ['208', '308', '2008', '3008', '5008'],
    'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Zoe'],
    'SEAT': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
    'Fiat': ['500', 'Panda', 'Tipo', '500X'],
};

const versions = ['Active', 'Style', 'Advance', 'GT Line', 'FR', 'M Sport', 'S Line', 'AMG', 'R-Line', 'N Line', 'Tech', 'Luxury', 'Base', 'Premium', 'Exclusive'];
const colors = ['Rojo', 'Azul', 'Plata', 'Negro', 'Blanco', 'Gris', 'Verde Oscuro', 'Amarillo', 'Naranja', 'Marrón'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCars(count) {
    const cars = [];
    const brands = Object.keys(brandsModels);

    for (let i = 0; i < count; i++) {
        const brand = getRandomItem(brands);
        const model = getRandomItem(brandsModels[brand]);
        const version = getRandomItem(versions);
        const anio = getRandomInt(2015, 2024);
        const kilometros = getRandomInt(0, 150000);
        const precio = parseFloat((Math.random() * (60000 - 8000) + 8000).toFixed(2));
        const color = getRandomItem(colors);
        const vin = 'VIN' + getRandomInt(100000000, 999999999) + 'ABC';
        
        let descripcion = `Fantástico ${brand} ${model} en acabado ${version}. `;
        if (kilometros === 0) {
            descripcion += `Vehículo a estrenar directo de concesionario. `;
        } else if (kilometros < 30000) {
            descripcion += `Coche de reestreno, muy pocos kilómetros y en perfecto estado. `;
        } else {
            descripcion += `Vehículo de ocasión totalmente revisado y garantizado. `;
        }
        descripcion += `Pintura color ${color}, todas las revisiones al día. Ideal para todo tipo de trayectos.`;

        cars.push({
            marca: brand,
            modelo: model,
            version: version,
            vin: vin,
            anio: anio,
            kilometros: kilometros,
            precio: precio,
            color: color,
            descripcion: descripcion,
            disponible: true
        });
    }
    return cars;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seedDatabase() {
    console.log("Autenticando script...");
    
    // Register
    try {
        await fetch(`${baseUrl.replace('/cars', '/auth')}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "seed@taiko.com", password: "seedpassword" })
        });
    } catch(e) {}
    
    // Login
    let jwtToken = '';
    const loginRes = await fetch(`${baseUrl.replace('/cars', '/auth')}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "seed@taiko.com", password: "seedpassword" })
    });
    
    if (loginRes.ok) {
        const authData = await loginRes.json();
        jwtToken = authData.token;
        console.log("✔ Autenticación exitosa, token obtenido.");
    } else {
        console.error("No se pudo iniciar sesión. Status:", loginRes.status);
        console.error(await loginRes.text());
        return;
    }

    console.log("Generando 100 coches...");
    const carsToInsert = generateCars(100);
    let successCount = 0;
    
    for (let i = 0; i < carsToInsert.length; i++) {
        const car = carsToInsert[i];
        
        try {
            // 1. Create the car
            const createRes = await fetch(`${baseUrl}/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(car)
            });

            if (!createRes.ok) {
                console.error(`Error al crear coche ${i+1}. Status: ${createRes.status}`);
                console.error(`Body:`, await createRes.text());
                continue;
            }

            const createdCar = await createRes.json();
            const carId = createdCar.id;

            // 2. Add an image for the car
            // We use a lorempixel or dummy image that changes for each to have unique look
            const imageUrl = `https://loremflickr.com/800/600/car,auto?lock=${i + 1}`;
            const images = [
                {
                    url: imageUrl,
                    esPrincipal: true
                }
            ];

            const imgRes = await fetch(`${baseUrl}/${carId}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(images)
            });

            if (!imgRes.ok) {
                console.error(`Error al añadir imagen al coche ${i+1} (${car.marca} ${car.modelo}): ${imgRes.statusText}`);
            } else {
                console.log(`[${i + 1}/100] ✅ Coche y su imagen creados: ${car.marca} ${car.modelo} - Precio: ${car.precio}€`);
                successCount++;
            }

            // Agregamos una pausa pequeña (300ms) para no saturar la API de OpenAI (embeddings)
            await sleep(300);

        } catch (error) {
            console.error(`Excepción en el coche ${i + 1}:`, error.message);
        }
    }

    console.log(`\n¡Proceso finalizado! Se insertaron ${successCount} coches exitosamente.`);
}

seedDatabase();
