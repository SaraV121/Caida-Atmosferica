const G_DEFAULT = 9.81;

let grafica = null;
let graficaErrores = null;

function funcion(t, v, m, k, g) {
    return -g + (k / m) * v * v;
}

function solucionAnalitica(t, m, k, g, v0) {
    if (k === 0) {
        return v0 - g * t;
    }

    const vt = Math.sqrt((m * g) / k);
    const r = v0 / vt;
    const lambda = g / vt;

    if (Math.abs(r) === 1) {
        return v0;
    }

    let resultado;

    if (Math.abs(r) < 1) {
        resultado = vt * Math.tanh(
            Math.atanh(r) - lambda * t
        );
    } else if (r > 1) {
        const u = 0.5 * Math.log((r + 1) / (r - 1));
        const z = u - lambda * t;
        const denominador = Math.sinh(z);

        if (Math.abs(denominador) < 1e-12) {
            throw new Error(
                "La solución analítica presenta una singularidad. Pruebe otros parámetros."
            );
        }

        resultado = vt * Math.cosh(z) / denominador;
    } else {
        throw new Error(
            "Para esta condición inicial negativa, la solución analítica no está implementada en este simulador. Use v₀ mayor que -Vt."
        );
    }

    if (!Number.isFinite(resultado)) {
        throw new Error(
            "No se pudo calcular la solución analítica con estos parámetros."
        );
    }

    return resultado;
}

function metodoEuler(t, v, h, m, k, g) {
    return v + h * funcion(t, v, m, k, g);
}

function metodoHeun(t, v, h, m, k, g) {
    const k1 = funcion(t, v, m, k, g);

    const k2 = funcion(
        t + h,
        v + h * k1,
        m,
        k,
        g
    );

    return v + (h / 2) * (k1 + k2);
}

function metodoRK4(t, v, h, m, k, g) {
    const k1 = funcion(t, v, m, k, g);

    const k2 = funcion(
        t + h / 2,
        v + (h / 2) * k1,
        m,
        k,
        g
    );

    const k3 = funcion(
        t + h / 2,
        v + (h / 2) * k2,
        m,
        k,
        g
    );

    const k4 = funcion(
        t + h,
        v + h * k3,
        m,
        k,
        g
    );

    return v + (h / 6) * (
        k1 + 2 * k2 + 2 * k3 + k4
    );
}

function formato(numero) {
    if (!Number.isFinite(numero)) {
        return "No disponible";
    }

    return numero.toFixed(6);
}

function obtenerParametros() {
    const m = Number(document.getElementById("masa").value);
    const k = Number(document.getElementById("coeficiente").value);
    const v0 = Number(document.getElementById("velocidadInicial").value);
    const tiempo = Number(document.getElementById("tiempo").value);
    const h = Number(document.getElementById("paso").value);
    const g = Number(document.getElementById("gravedad").value);

    if (![m, k, v0, tiempo, h, g].every(Number.isFinite)) {
        throw new Error("Todos los campos deben contener valores numéricos válidos.");
    }

    if (m <= 0) {
        throw new Error("La masa debe ser mayor que cero.");
    }

    if (k < 0) {
        throw new Error("El coeficiente de resistencia no puede ser negativo.");
    }

    if (tiempo <= 0) {
        throw new Error("El tiempo debe ser mayor que cero.");
    }

    if (h <= 0) {
        throw new Error("El tamaño de paso debe ser mayor que cero.");
    }

    if (g <= 0) {
        throw new Error("La gravedad debe ser mayor que cero.");
    }

    if (Math.ceil(tiempo / h) > 10000) {
        throw new Error("Demasiadas iteraciones. Aumente el tamaño de paso h.");
    }

    return { m, k, v0, tiempo, h, g };
}

function ejecutarSimulacion(p, tiempoObjetivo = p.tiempo) {
    const { m, k, v0, g, h } = p;

    let t = 0;
    let vEuler = v0;
    let vHeun = v0;
    let vRK4 = v0;

    const datos = [{
        iteracion: 0,
        tiempo: 0,
        euler: v0,
        heun: v0,
        rk4: v0,
        analitica: solucionAnalitica(0, m, k, g, v0)
    }];

    let iteracion = 0;

    while (t < tiempoObjetivo - 1e-12) {
        const pasoActual = Math.min(h, tiempoObjetivo - t);

        vEuler = metodoEuler(t, vEuler, pasoActual, m, k, g);
        vHeun = metodoHeun(t, vHeun, pasoActual, m, k, g);
        vRK4 = metodoRK4(t, vRK4, pasoActual, m, k, g);

        t = Math.min(tiempoObjetivo, t + pasoActual);
        iteracion++;

        const exacta = solucionAnalitica(t, m, k, g, v0);

        if (![vEuler, vHeun, vRK4].every(Number.isFinite)) {
            throw new Error(
                "Un método produjo valores no finitos. Pruebe con un paso h más pequeño."
            );
        }

        datos.push({
            iteracion,
            tiempo: t,
            euler: vEuler,
            heun: vHeun,
            rk4: vRK4,
            analitica: exacta
        });

        if (iteracion > 10000) {
            throw new Error("Se superó el máximo de iteraciones permitido.");
        }
    }

    return datos;
}

function calcularErrores(datos) {
    return datos.map(d => ({
        iteracion: d.iteracion,
        tiempo: d.tiempo,
        errorEuler: Math.abs(d.analitica - d.euler),
        errorHeun: Math.abs(d.analitica - d.heun),
        errorRK4: Math.abs(d.analitica - d.rk4)
    }));
}

function mostrarResultados(datos, p) {
    const ultimo = datos[datos.length - 1];

    const vt = p.k === 0
        ? Infinity
        : Math.sqrt((p.m * p.g) / p.k);

    document.getElementById("velocidadTerminal").textContent =
        Number.isFinite(vt) ? formato(vt) : "No aplica";

    document.getElementById("resultadoEuler").textContent =
        formato(ultimo.euler);

    document.getElementById("resultadoHeun").textContent =
        formato(ultimo.heun);

    document.getElementById("resultadoRK4").textContent =
        formato(ultimo.rk4);

    document.getElementById("resultadoAnalitico").textContent =
        formato(ultimo.analitica);
}

function generarTablaResultados(datos) {
    const tabla = document.getElementById("tablaResultados");

    tabla.innerHTML = "";

    datos.forEach(d => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${d.iteracion}</td>
            <td>${formato(d.tiempo)}</td>
            <td>${formato(d.euler)}</td>
            <td>${formato(d.heun)}</td>
            <td>${formato(d.rk4)}</td>
            <td>${formato(d.analitica)}</td>
        `;

        tabla.appendChild(fila);
    });
}

function generarTablaErrores(errores) {
    const tabla = document.getElementById("tablaErrores");

    tabla.innerHTML = "";

    errores.forEach(e => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${e.iteracion}</td>
            <td>${formato(e.tiempo)}</td>
            <td>${formato(e.errorEuler)}</td>
            <td>${formato(e.errorHeun)}</td>
            <td>${formato(e.errorRK4)}</td>
        `;

        tabla.appendChild(fila);
    });
}

function generarGrafica(datos) {
    const ctx = document.getElementById("graficoVelocidad");

    if (grafica !== null) {
        grafica.destroy();
    }

    grafica = new Chart(ctx, {
        type: "line",

        data: {
            labels: datos.map(d => formato(d.tiempo)),

            datasets: [
                {
                    label: "Euler",
                    data: datos.map(d => d.euler),
                    borderColor: "#f87171",
                    backgroundColor: "#f87171",
                    borderWidth: 2,
                    pointRadius: 2,
                    tension: 0.1
                },
                {
                    label: "Heun",
                    data: datos.map(d => d.heun),
                    borderColor: "#facc15",
                    backgroundColor: "#facc15",
                    borderWidth: 2,
                    pointRadius: 2,
                    tension: 0.1
                },
                {
                    label: "RK4",
                    data: datos.map(d => d.rk4),
                    borderColor: "#4ade80",
                    backgroundColor: "#4ade80",
                    borderWidth: 2,
                    pointRadius: 2,
                    tension: 0.1
                },
                {
                    label: "Solución analítica",
                    data: datos.map(d => d.analitica),
                    borderColor: "#38bdf8",
                    backgroundColor: "#38bdf8",
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    labels: {
                        color: "#e5e7eb"
                    }
                },

                title: {
                    display: true,
                    text: "Velocidad en función del tiempo",
                    color: "#ffffff"
                }
            },

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tiempo (segundos)",
                        color: "#cbd5e1"
                    },

                    ticks: {
                        color: "#cbd5e1",
                        maxTicksLimit: 12
                    },

                    grid: {
                        color: "#26364f"
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "Velocidad (m/s)",
                        color: "#cbd5e1"
                    },

                    ticks: {
                        color: "#cbd5e1"
                    },

                    grid: {
                        color: "#26364f"
                    }
                }
            }
        }
    });
}

function generarAnalisis(datos, errores) {
    const ultimoError = errores[errores.length - 1];

    const lista = [
        { nombre: "Euler", error: ultimoError.errorEuler },
        { nombre: "Heun", error: ultimoError.errorHeun },
        { nombre: "RK4", error: ultimoError.errorRK4 }
    ].sort((a, b) => a.error - b.error);

    const ultimoDato = datos[datos.length - 1];

    const texto = lista[0].error < 1e-10
        ? "Los tres métodos presentan errores muy pequeños en el tiempo final."
        : `El método ${lista[0].nombre} presenta el menor error absoluto al finalizar la simulación.`;

    document.getElementById("analisis").innerHTML = `
        <p>
            <strong>Método más preciso:</strong>
            ${lista[0].nombre}, con error absoluto de
            ${formato(lista[0].error)} m/s.
        </p>

        <p>
            <strong>Error de Euler:</strong>
            ${formato(ultimoError.errorEuler)} m/s.
        </p>

        <p>
            <strong>Error de Heun:</strong>
            ${formato(ultimoError.errorHeun)} m/s.
        </p>

        <p>
            <strong>Error de RK4:</strong>
            ${formato(ultimoError.errorRK4)} m/s.
        </p>

        <p>
            <strong>Influencia de h:</strong>
            al disminuir el tamaño de paso generalmente mejora la aproximación.
            Los órdenes globales teóricos son O(h) para Euler, O(h²) para Heun
            y O(h⁴) para RK4, siempre que el problema y el cálculo se mantengan
            en condiciones adecuadas.
        </p>

        <p>
            <strong>Conclusión:</strong>
            ${texto}
        </p>

        <p>
            <strong>Velocidad final analítica:</strong>
            ${formato(ultimoDato.analitica)} m/s.
        </p>

        <p>
            <strong>Número de iteraciones:</strong>
            ${ultimoDato.iteracion}.
        </p>
    `;
}

function calcularComparacionUnPaso(p, h, tiempoObjetivo = 5) {
    const datos = ejecutarSimulacion(
        { ...p, h, tiempo: tiempoObjetivo },
        tiempoObjetivo
    );

    const ultimo = datos[datos.length - 1];

    return {
        h,
        exacta: ultimo.analitica,
        euler: ultimo.euler,
        heun: ultimo.heun,
        rk4: ultimo.rk4,
        errorEuler: Math.abs(ultimo.analitica - ultimo.euler),
        errorHeun: Math.abs(ultimo.analitica - ultimo.heun),
        errorRK4: Math.abs(ultimo.analitica - ultimo.rk4)
    };
}

function generarComparacionPaso() {
    const mensaje = document.getElementById("mensajeComparacion");

    try {
        const p = obtenerParametros();
        const h = Number(document.getElementById("pasoComparacion").value);

        const resultado = calcularComparacionUnPaso(p, h, 5);

        document.getElementById("valorPasoComparacion").textContent =
            `${h.toFixed(2)} s`;

        const filas = [
            ["Solución analítica", resultado.exacta, 0],
            ["Euler", resultado.euler, resultado.errorEuler],
            ["Heun", resultado.heun, resultado.errorHeun],
            ["RK4", resultado.rk4, resultado.errorRK4]
        ];

        const tabla = document.getElementById("tablaComparacionPaso");
        tabla.innerHTML = "";

        filas.forEach(item => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${item[0]}</td>
                <td>${formato(item[1])}</td>
                <td>${formato(item[2])}</td>
            `;

            tabla.appendChild(fila);
        });

        const errores = [
            { nombre: "Euler", error: resultado.errorEuler },
            { nombre: "Heun", error: resultado.errorHeun },
            { nombre: "RK4", error: resultado.errorRK4 }
        ].sort((a, b) => a.error - b.error);

        document.getElementById("interpretacionPaso").innerHTML =
            `Para h = ${h.toFixed(2)} s y t = 5 s, el método con menor error es
            <strong>${errores[0].nombre}</strong>
            (${formato(errores[0].error)} m/s). La solución analítica de referencia
            es ${formato(resultado.exacta)} m/s.`;

        mensaje.style.color = "#4ade80";
        mensaje.textContent = "Comparación calculada correctamente.";

        generarGraficaErrores(p);

    } catch (error) {
        mensaje.style.color = "#f87171";
        mensaje.textContent = error.message;
    }
}

function generarGraficaErrores(p) {
    const pasos = [1, 0.5, 0.25, 0.1];

    const resultados = pasos.map(h =>
        calcularComparacionUnPaso(p, h, 5)
    );

    const tabla = document.getElementById("tablaErroresPaso");
    tabla.innerHTML = "";

    resultados.forEach(r => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${r.h.toFixed(2)}</td>
            <td>${formato(r.errorEuler)}</td>
            <td>${formato(r.errorHeun)}</td>
            <td>${formato(r.errorRK4)}</td>
        `;

        tabla.appendChild(fila);
    });

    const ctx = document.getElementById("graficoErrores");

    if (graficaErrores) {
        graficaErrores.destroy();
    }

    graficaErrores = new Chart(ctx, {
        type: "line",

        data: {
            labels: resultados.map(r => `${r.h} s`),

            datasets: [
                {
                    label: "Error Euler",
                    data: resultados.map(r => r.errorEuler),
                    borderColor: "#f87171",
                    backgroundColor: "#f87171",
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: "Error Heun",
                    data: resultados.map(r => r.errorHeun),
                    borderColor: "#facc15",
                    backgroundColor: "#facc15",
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: "Error RK4",
                    data: resultados.map(r => r.errorRK4),
                    borderColor: "#4ade80",
                    backgroundColor: "#4ade80",
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: "#e5e7eb"
                    }
                },

                title: {
                    display: true,
                    text: "Error absoluto en t = 5 segundos",
                    color: "#ffffff"
                }
            },

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tamaño de paso h",
                        color: "#cbd5e1"
                    },
                    ticks: {
                        color: "#cbd5e1"
                    },
                    grid: {
                        color: "#26364f"
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "Error absoluto (m/s)",
                        color: "#cbd5e1"
                    },
                    ticks: {
                        color: "#cbd5e1"
                    },
                    grid: {
                        color: "#26364f"
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function generarConclusiones(datos, errores) {
    const ultimo = errores[errores.length - 1];

    const orden = [
        { nombre: "Euler", error: ultimo.errorEuler },
        { nombre: "Heun", error: ultimo.errorHeun },
        { nombre: "RK4", error: ultimo.errorRK4 }
    ].sort((a, b) => a.error - b.error);

    document.getElementById("conclusiones").innerHTML = `
        <p>
            <strong>1. Comparación:</strong>
            para los parámetros seleccionados, ${orden[0].nombre}
            obtuvo el menor error absoluto al finalizar el intervalo.
        </p>

        <p>
            <strong>2. Precisión:</strong>
            los resultados numéricos se aproximan a la solución analítica;
            la diferencia depende del método y del tamaño de paso utilizado.
        </p>

        <p>
            <strong>3. Tamaño de paso:</strong>
            reducir h suele aumentar la precisión, aunque también incrementa
            la cantidad de iteraciones y el costo de cálculo.
        </p>

        <p>
            <strong>4. Interpretación:</strong>
            el modelo representa cómo la gravedad y la resistencia del aire
            determinan la evolución de la velocidad y su aproximación a la
            velocidad terminal.
        </p>

        <p>
            <strong>5. Alcance:</strong>
            las conclusiones corresponden al modelo simplificado y no deben
            interpretarse como una predicción física de un impacto real.
        </p>
    `;
}

function ejecutar() {
    const mensaje = document.getElementById("mensaje");

    try {
        const parametros = obtenerParametros();
        const datos = ejecutarSimulacion(parametros);
        const errores = calcularErrores(datos);

        mostrarResultados(datos, parametros);
        generarTablaResultados(datos);
        generarTablaErrores(errores);
        generarGrafica(datos);
        generarAnalisis(datos, errores);
        generarConclusiones(datos, errores);

        mensaje.style.color = "#4ade80";
        mensaje.textContent =
            "Simulación ejecutada correctamente. Resultados actualizados.";

        generarComparacionPaso();

    } catch (error) {
        mensaje.style.color = "#f87171";
        mensaje.textContent = error.message;
    }
}

function restablecer() {
    document.getElementById("masa").value = 5;
    document.getElementById("coeficiente").value = 0.05;
    document.getElementById("velocidadInicial").value = 0;
    document.getElementById("tiempo").value = 15;
    document.getElementById("paso").value = 0.5;
    document.getElementById("gravedad").value = G_DEFAULT;
    document.getElementById("pasoComparacion").value = 0.5;
    document.getElementById("valorPasoComparacion").textContent = "0.50 s";

    ejecutar();
}

document.getElementById("btnSimular").addEventListener(
    "click",
    ejecutar
);

document.getElementById("btnRestablecer").addEventListener(
    "click",
    restablecer
);

document.getElementById("pasoComparacion").addEventListener(
    "input",
    function () {
        document.getElementById("valorPasoComparacion").textContent =
            `${Number(this.value).toFixed(2)} s`;
    }
);

document.getElementById("btnCompararPaso").addEventListener(
    "click",
    generarComparacionPaso
);

ejecutar();
