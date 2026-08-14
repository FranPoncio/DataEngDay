# SpaceX Falcon 9 - Capstone de Data Science

Proyecto final del curso de Data Science en Coursera (IBM Applied Data Science Capstone).
Objetivo: predecir si la primera etapa del cohete **Falcon 9** de SpaceX aterriza con éxito,
a partir de datos recolectados por API y web scraping, procesados con data wrangling,
explorados con EDA (visualización y SQL), y modelados con Machine Learning.

## Estructura del proyecto

```
notebooks/
  01_data_collection_api.ipynb        -> Recolección de datos vía API de SpaceX
  02_data_collection_webscraping.ipynb -> Web scraping de Wikipedia (Falcon 9 launches)
  03_data_wrangling.ipynb             -> Limpieza y etiquetado (Class: éxito/fracaso)
  04_predictive_analysis_ml.ipynb     -> Modelos de clasificación (ML)
data/
  raw/         -> CSVs crudos generados por los notebooks 1 y 2
  processed/   -> CSVs limpios generados por el notebook 3
```

## Cómo correr el proyecto

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
jupyter notebook notebooks/
```

Correr los notebooks en orden (01 -> 02 -> 03 -> 04). Los notebooks 1 y 2 necesitan
conexión a internet (API de SpaceX y Wikipedia).

## Próximos pasos (según la consigna del capstone)

Para completar todos los criterios de calificación del proyecto final todavía faltan:
- EDA con visualización de datos (scatter, barras, tendencias anuales)
- EDA con SQL (sitios de lanzamiento, cargas útiles, tasas de éxito, órbitas, análisis temporal)
- Mapa interactivo con Folium (marcadores de sitios de lanzamiento y análisis de proximidad)
- Dashboard interactivo con Plotly Dash (gráfico de torta de éxito y dispersión payload vs. resultado)
- Informe final en PDF y slides de presentación
