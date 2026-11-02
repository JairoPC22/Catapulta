# Videos de CatapultaPayment

## Entregables

La carpeta `videos/` contiene únicamente los dos resultados:

- `catapultapay-sitio-16x9.mp4`: 1920 × 1080, 30 fps, 998 cuadros (33,267 s).
- `catapultapay-redes-9x16.mp4`: 1080 × 1920, 30 fps, 781 cuadros (26,033 s).

Formato H.264, píxeles yuv420p y cabecera MP4 al principio para reproducción progresiva. La voz, música y tiempos del audio original se conservan mediante copia directa de AAC (`-c:a copy`). No se usaron servicios de generación de pago.

## Diseño y sincronización

Ilustración vectorial propia: comerciante con delantal, cliente y asesor con auriculares. Brazos articulados, movimiento de tarjeta hacia la terminal, parpadeo, pequeños cambios de postura, conexiones bancarias, confirmación de pago y conversación de soporte. Se conservan el logo y los colores de la marca.

Los textos son resúmenes visuales; los subtítulos inferiores siguen la locución. La transcripción automática se revisó manualmente para corregir nombres y términos. Los cortes están marcados en segundos, dentro de `H` y `V` en `tools/render-videos.py`:

| Concepto | Horizontal | Vertical |
| --- | --- | --- |
| Negocio / presentación | 0–6,42 | 0–5,12 |
| Venta perdida | — | 5,12 |
| Experiencia | 6,42 | — |
| Bancos patrocinadores | 9,74 | 8,64 |
| Terminales físicos | 11,30 | 11,28 |
| Pasarelas virtuales | 12,38 | 12,32 |
| Atención a cada negocio | 13,92 | — |
| Acompañamiento / elección de equipo | 16,02 / 18,20 | 13,62 |
| Pagos seguros | 20,34 | 18,10 |
| Soporte bilingüe | 22,40 | 16,16 |
| Más de 100 negocios | — | 20,64 |
| Contacto y cierre | 26,18–33,267 | 23,50–26,033 |

La pieza vertical tiene composición propia y áreas de seguridad para títulos y subtítulos; no es un recorte del horizontal. Las cifras narradas se mantienen como parte del audio recibido, sin añadir cifras nuevas.

## Regeneración local gratuita

Requisitos: Python 3, Pillow, aggdraw y FFmpeg/ffprobe. El renderizador busca también paquetes en `%TEMP%/catapulta-video-deps`. Instalar dependencias con `python -m pip install Pillow aggdraw` en un entorno local de Python, si fuera necesario.

Ejecutar desde la raíz del repositorio:

```text
python tools/render-videos.py --preview
python tools/render-videos.py
```

`--format horizontal` o `--format vertical` limita la exportación. El directorio de trabajo es `%TEMP%/catapulta-motion-v2`. Los originales se copian a su subcarpeta `originals` solo si no existe ya el respaldo. Conservar ese respaldo para nuevas exportaciones: el script utiliza el audio del respaldo existente.

El renderizador no reemplaza los entregables automáticamente. Primero inspeccionar los cuadros y las transiciones; después copiar solo los MP4 verificados a `videos/`. No colocar imágenes, guiones ni pruebas en esa carpeta.

## Validación

- Mismo número de cuadros, dimensiones y frecuencia que los originales.
- SHA-256 de los paquetes AAC idéntico antes y después de cada exportación.
- Decodificación completa de ambos archivos sin errores.
- Inspección visual de escenas, títulos y subtítulos de los dos formatos.
- Los resultados completos de identidad de audio están en `content/video-verification.json`.

Los videos entregados no sustituyen automáticamente `video1.mp4` del bloque Nosotros. Son piezas separadas para sitio y redes; cambiar dónde se muestran requiere decidir su colocación.
