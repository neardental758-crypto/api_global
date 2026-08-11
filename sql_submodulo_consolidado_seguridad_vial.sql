-- ==============================================================================
-- SCRIPT SQL: Submódulo 4 - Consolidado de Seguridad Vial en Micromovilidad
-- Base de Datos: MySQL (u976663664_modulos)
-- ==============================================================================

-- 1. Insertar el Submódulo
INSERT INTO `introduccion_modulos` (
  `titulo`, 
  `url_video`, 
  `orden`, 
  `total_preguntas`, 
  `min_preguntas_aprobar`, 
  `estado`, 
  `fecha_creacion`
) VALUES (
  'Consolidado de Seguridad Vial en Micromovilidad',
  'https://bicyclecapital.co/wp-content/uploads/2026/03/Bcguiavideo2024.mp4',
  4,
  9,
  7,
  'ACTIVA',
  NOW()
);

-- Obtener el ID del submódulo generado
SET @id_submodulo = LAST_INSERT_ID();

-- 2. Asignar el submódulo a TODAS las empresas
INSERT INTO `introduccion_modulo_empresas` (`id_modulo`, `empresa`)
VALUES (@id_submodulo, 'TODAS');

-- 3. Insertar las 9 Preguntas con sus opciones y respuestas correctas
INSERT INTO `introduccion_modulo_preguntas` (
  `id_modulo`, 
  `pregunta`, 
  `opciones_respuestas`, 
  `respuesta_verdadera`, 
  `fecha_creacion`
) VALUES
(
  @id_submodulo,
  'Situación: Antes de iniciar tu recorrido observas que una de las llantas parece tener menos presión de lo normal. El vehículo aún puede utilizarse y tienes prisa por llegar a tu destino. ¿Cuál es la acción más segura?',
  '["Iniciar el recorrido y detenerse únicamente si el comportamiento del vehículo empeora.", "Conducir a menor velocidad hasta llegar a un punto donde puedas revisar mejor la llanta.", "Continuar normalmente, ya que la presión de las llantas es responsabilidad exclusiva del operador de mantenimiento.", "Reportar la novedad en la aplicación y abstenerse de utilizar el vehículo hasta que sea inspeccionado."]',
  'Reportar la novedad en la aplicación y abstenerse de utilizar el vehículo hasta que sea inspeccionado.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Vas en bicicleta eléctrica al anochecer por una vía urbana. Llevas casco correctamente ajustado, pero olvidaste instalar las luces. Consideras que el casco es suficiente porque te protegerá en caso de accidente. ¿Cuál es el principal error en este razonamiento?',
  '["Las luces son importantes únicamente cuando llueve.", "El casco solo es obligatorio en vías rápidas.", "El casco protege después del incidente, mientras que la visibilidad ayuda a prevenir que el incidente ocurra.", "Los conductores siempre detectan a los ciclistas aunque no tengan iluminación."]',
  'El casco protege después del incidente, mientras que la visibilidad ayuda a prevenir que el incidente ocurra.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Te aproximas a una intersección con semáforo en verde. Un automóvil está detenido a tu izquierda con la direccional encendida para girar a la derecha. El conductor parece estar mirando el tráfico. ¿Cuál es la acción más segura?',
  '["Reducir velocidad y prepararte para una maniobra inesperada del vehículo.", "Mantener velocidad porque tienes prioridad de paso.", "Circular pegado al automóvil para que el conductor te vea mejor.", "Acelerar para cruzar antes de que el automóvil gire."]',
  'Reducir velocidad y prepararte para una maniobra inesperada del vehículo.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Circulas junto a una fila de vehículos estacionados. No observas movimiento inmediato ni peatones cercanos. ¿Qué conducta refleja mejor una conducción basada en anticipación?',
  '["Concentrar la mirada únicamente en el punto exacto donde circula tu rueda.", "Mantener distancia lateral y analizar posibles eventos que aún no han ocurrido.", "Aumentar velocidad para reducir el tiempo de exposición al riesgo.", "Mantenerte muy cerca de los vehículos para maximizar el espacio disponible."]',
  'Mantener distancia lateral y analizar posibles eventos que aún no han ocurrido.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Llegas a una intersección al lado derecho de un bus detenido. El semáforo cambia a verde y el bus podría iniciar un giro. ¿Cuál es el mayor riesgo de continuar avanzando junto al vehículo?',
  '["Que la vía tenga una pendiente pronunciada.", "Que el conductor se distraiga con otros vehículos.", "Que te encuentres dentro de un punto ciego y el conductor no pueda detectarte.", "Que el bus acelere más rápido que tú."]',
  'Que te encuentres dentro de un punto ciego y el conductor no pueda detectarte.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Observas un charco sobre la vía mientras circulas a velocidad moderada. No sabes si debajo existe un hueco o una superficie resbalosa. ¿Cuál es la mejor decisión desde una perspectiva de gestión del riesgo?',
  '["Mantener velocidad porque no hay evidencia visible de peligro.", "Frenar bruscamente justo al entrar al charco.", "Girar abruptamente para evitarlo a último momento.", "Reducir velocidad antes de llegar y atravesarlo con movimientos suaves y controlados."]',
  'Reducir velocidad antes de llegar y atravesarlo con movimientos suaves y controlados.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Mientras conduces una bicicleta eléctrica a 25 km/h recibes una notificación. Decides mirar la pantalla durante solo dos segundos porque la vía parece despejada. ¿Cuál es el principal error de esta decisión?',
  '["Las bicicletas eléctricas requieren detenerse completamente para usar el celular.", "Dos segundos son suficientes para perder el equilibrio.", "La ausencia de riesgos visibles no significa ausencia de riesgos emergentes.", "Las notificaciones generan reflejos involuntarios en el manubrio."]',
  'La ausencia de riesgos visibles no significa ausencia de riesgos emergentes.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Debes elegir entre una ruta más corta con tráfico intenso y varias intersecciones, o una ruta un poco más larga con infraestructura ciclista continua. ¿Cuál es la mejor decisión?',
  '["Elegir la ruta más corta para reducir el tiempo total de exposición.", "Elegir la ruta con menor cantidad de conflictos potenciales, aunque tome algunos minutos más.", "Elegir cualquiera de las dos si utilizas casco y elementos reflectivos.", "Elegir la ruta más corta siempre que mantengas una velocidad moderada."]',
  'Elegir la ruta con menor cantidad de conflictos potenciales, aunque tome algunos minutos más.',
  NOW()
),
(
  @id_submodulo,
  'Situación: Un compañero deja su bicicleta eléctrica cargando durante toda la noche en una oficina vacía. Utiliza el cargador correcto y la instalación eléctrica está en buen estado. ¿Qué riesgo sigue existiendo?',
  '["Toda fuente de energía almacenada mantiene un riesgo residual que requiere supervisión razonable.", "El cargador consumirá demasiada electricidad.", "Ninguno, porque se están siguiendo las recomendaciones técnicas.", "La batería podría descargarse completamente."]',
  'Toda fuente de energía almacenada mantiene un riesgo residual que requiere supervisión razonable.',
  NOW()
);
