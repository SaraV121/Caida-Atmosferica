# Simulador de Caída Atmosférica 2027

## Universidad Mayor de San Andrés
**Carrera:** Informática  
**Asignatura:** Métodos Numéricos  
**Proyecto:** Simulador interactivo de caída atmosférica de un fragmento de asteroide.

## Descripción

Este proyecto consiste en el desarrollo de una aplicación web interactiva que permite simular la caída atmosférica de un fragmento de asteroide mediante un modelo matemático basado en una ecuación diferencial ordinaria de primer orden.

El simulador permite modificar los parámetros físicos del modelo y observar cómo evoluciona la velocidad del fragmento durante su caída.

## Objetivos

- Aplicar métodos numéricos para resolver ecuaciones diferenciales.
- Comparar los resultados obtenidos mediante diferentes métodos de aproximación.
- Analizar el comportamiento de la velocidad durante la caída.
- Evaluar el efecto del tamaño de paso sobre la precisión de los resultados.

## Modelo matemático

Se utiliza la siguiente ecuación diferencial:

\[
m\frac{dv}{dt}=-mg+kv^2
\]

Donde:

- \(m\): masa del fragmento.
- \(v\): velocidad.
- \(g\): aceleración de la gravedad.
- \(k\): coeficiente de resistencia atmosférica.
- \(t\): tiempo.

## Métodos numéricos implementados

El simulador utiliza los siguientes métodos:

1. **Método de Euler:** aproximación numérica de primer orden.
2. **Método de Heun:** método predictor-corrector de segundo orden.
3. **Método de Runge-Kutta de cuarto orden (RK4):** método de mayor precisión.
4. **Solución analítica:** permite comparar las aproximaciones numéricas con la solución exacta del modelo.

## Funcionalidades

- Modificación de los parámetros físicos.
- Simulación interactiva de la caída atmosférica.
- Cálculo de velocidades mediante diferentes métodos.
- Comparación de errores numéricos.
- Evaluación de distintos tamaños de paso.
- Validación con un ejemplo de referencia.
- Tablas de resultados e iteraciones.
- Gráficos de velocidad y error.
- Interpretación de resultados y conclusiones.


## Estructura del proyecto

```text
Asteroide/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## Conclusión

El desarrollo de este simulador permite comprender la aplicación de los métodos numéricos en la resolución de ecuaciones diferenciales ordinarias. Asimismo, facilita la comparación de precisión entre Euler, Heun y Runge-Kutta de cuarto orden, mostrando la importancia del tamaño de paso en los resultados obtenidos.

---

**Proyecto académico – Métodos Numéricos 2026**  
**Universidad Mayor de San Andrés – Carrera de Informática**
