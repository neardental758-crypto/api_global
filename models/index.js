const Prestamos = require('./mysql/prestamos');
const Reserva = require('./mysql/reservas');
const Usuario = require('./mysql/usuario');
const Puntos = require('./mysql/puntos');
const Extendido = require('./mysql/registroext');
const Empresa = require('./mysql/empresa');
const Claves = require('./mysql/historiales');
const Estacion = require('./mysql/estacion');
const Productos = require('./mysql/productos');
const Logros = require('./mysql/logros');
const ProgresoLogros = require('./mysql/progresoLogros')
const ProgresoDesafios = require('./mysql/progresoDesafios')
const Desafios = require('./mysql/desafios');
const Bicicleta = require('./mysql/bicicletas');
const Comentarios = require('./mysql/comentarios');
const CompartidoViajeActivo = require('./mysql/compartidoViajeActivo');
const CompartidoSolicitud = require('./mysql/compartidoSolicitud');
const CompartidoConductor = require('./mysql/compartidoConductor');
const CompartidoPasajero = require('./mysql/compartidoPasajero');
const CompartidoPagos = require('./mysql/compartidosPagos');
const CompartidoPenalizaciones = require('./mysql/compartidoPenalizaciones');
const CompartidoVehiculos = require('./mysql/compartidoVehiculos');
const CompartidoComentarios = require('./mysql/compartidoComentarios')
const PracticasActivas = require('./mysql/practicaActiva');
const Agendados = require('./mysql/agendamientoUsuario');
const Teorica = require('./mysql/teorica');
const Practica = require('./mysql/practicaActiva');
const Bicicletero = require('./mysql/bicicleteros');
const ViajesParticular = require('./mysql/vpviajes');
const VehiculosParticular = require('./mysql/vpusuario');
const ComentariosParticular = require('./mysql/vpcomentarios');
const Contratos = require('./mysql/contratos');
const Oficinas = require('./mysql/oficinas');
const LugarParqueo = require('./mysql/parqueo_lugar');
const Parqueaderos = require('./mysql/parqueo_parqueaderos');
const Renta_parqueo = require('./mysql/parqueo_renta');
const Reserva_parqueo = require('./mysql/parqueo_renta');
const indicadoresModels = require('./mysql/indicadores');
const Historiales = require('./mysql/historiales');
const CategoriaComponente = require('./mysql/categoria_componente');
const Componente = require('./mysql/componente');
const EstadoComponente = require('./mysql/estado_componente');
const Mantenimiento = require('./mysql/mantenimiento');
const HistorialMantenimiento = require('./mysql/historial_mantenimiento');
const preguntasBrain = require('./mysql/preguntasBrain');
const respuestaBrain = require('./mysql/respuestaBrain');
const Tematica = require('./mysql/tematica');
const Contenido = require('./mysql/contenido');
const PreguntasBrain = require('./mysql/preguntasBrain');
const RespuestaBrain = require('./mysql/respuestaBrain');
const Horarios_parqueadero = require('./mysql/parqueo_horarios');
const UsuarioEmpresas = require('./mysql/usuarios_empresas');
const preoperacionalesModels = require('./mysql/preoperacionales');
const NotificacionRenta = require('./mysql/notificacionesRentas');
const EmpresaLogro = require('./mysql/empresa_logro');
const TokenMsn = require('./mysql/tokenMsn');
const compartidoSolicitudNoEncontrada = require('./mysql/compartidoSolicitudNoEncontrada');
const AgendamientoOperario = require('./mysql/agendamientos_operarios');
const AgendamientoIncumplido = require('./mysql/agendamientos_incumplidos');
const RegistroPP = require('./mysql/registrospp');

const Candado = require('./mysql/candados');
const Rol = require('./mysql/roles');
const RolPermiso = require('./mysql/rolesPermisos');
const UsuarioCredencial = require('./mysql/usuariosCredenciales');
const UsuarioPermiso = require('./mysql/usuariosPermiso');
const UsuarioRol = require('./mysql/usuariosRoles');
const Permiso = require('./mysql/permisos');
const TarjetaNfc = require('./mysql/tarjetasNfc');

const MOTORDB = process.env.MOTORDB;

if (MOTORDB === 'mysql'){
    const models = {
        empresaModels: require('./mysql/empresa'),
        usuarioModels: require('./mysql/usuario'),
        referidosModels: require('./mysql/referidos'),
        estacionModels: require('./mysql/estacion'),
        prestamosModels: require('./mysql/prestamos'),
        productosModels: require('./mysql/productos'),
        logrosModels: require('./mysql/logros'),
        empresaLogroModels: require('./mysql/empresa_logro'),
        progresoLogrosModels: require('./mysql/progresoLogros'),
        progresoDesafiosModels: require('./mysql/progresoDesafios'),
        desafiosModels: require('./mysql/desafios'),
        reservasModels: require('./mysql/reservas'),
        bicicletasModels: require('./mysql/bicicletas'),
        bicicleterosModels: require('./mysql/bicicleteros'),
        horariosModels: require('./mysql/horarios'),
        penalizacionModels: require('./mysql/penalizacion'),
        estadosModels: require('./mysql/estados'),
        historialesModels: require('./mysql/historiales'),
        puntosModels: require('./mysql/puntos'),
        registroextModels: require('./mysql/registroext'),
        fallasModels: require('./mysql/fallas'),
        vehiculoFallaModels: require('./mysql/vehiculoFalla'),
        ticketsModels: require('./mysql/tickets'),
        comentariosModels: require('./mysql/comentarios'),
        tipoVPModels: require('./mysql/tipoVP'),
        vpusuarioModels: require('./mysql/vpusuario'),
        vpviajesModels: require('./mysql/vpviajes'),
        vpcomentariosModels: require('./mysql/vpcomentarios'),
        compartidoConductorModels: require('./mysql/compartidoConductor'),
        compartidoIndicadorModels: require('./mysql/compartidoIndicadores'),
        compartidoPasajeroModels: require('./mysql/compartidoPasajero'),
        compartidoPenalizacionModels: require('./mysql/compartidoPenalizaciones'),
        compartidoSolicitudModels: require('./mysql/compartidoSolicitud'),
        compartidoSolicitudNoEncontradaModels: require('./mysql/compartidoSolicitudNoEncontrada'),
        compartidoVehiculoModels: require('./mysql/compartidoVehiculos'),
        compartidoViajeActivoModels: require('./mysql/compartidoViajeActivo'),
        compartidoComentariosModels: require('./mysql/compartidoComentarios'),
        formularioModels: require('./mysql/formtuimpacto'),
        formularioOrganizationModels : require('./mysql/formOrganization'),
        tokenMsnModels : require('./mysql/tokenMsn'),
        compartidoPagosModels: require('./mysql/compartidosPagos'),
        agendamientoUsuariosModels: require('./mysql/agendamientoUsuario'),
        practicaActivaModels: require('./mysql/practicaActiva'),
        teoricaModels: require('./mysql/teorica'),
        actividadesModels: require('./mysql/actividades'),
        participantesActividadesModels: require('./mysql/participantesActividades'),
        contratosModels: require('./mysql/contratos'),
        oficinasModels: require('./mysql/oficinas'),
        indicadoresModels: require('./mysql/indicadores'),
        preoperacionalesModels: require('./mysql/preoperacionales'),
        parqueaderosModels: require('./mysql/parqueo_parqueaderos'),
        lugarParqueoModels: require('./mysql/parqueo_lugar'),
        rentaParqueoModels: require('./mysql/parqueo_renta'),
        reservasParqueoModels: require('./mysql/parqueo_reservas'),
        feedbackParqueoModels: require('./mysql/parqueo_feedback'),
        TyCParqueoModels: require('./mysql/parqueo_tyc'),
        horariosParqeuaderoModels: require('./mysql/parqueo_horarios'),
        contenidoModel: require('./mysql/contenido'),
        preguntasBrainModel: require('./mysql/preguntasBrain'),
        respuestaBrainModel : require('./mysql/respuestaBrain'),
        tematicaModel: require('./mysql/tematica'),
        categoriaComponenteModels: require('./mysql/categoria_componente'),
        componenteModels: require('./mysql/componente'),
        estadoComponenteModels: require('./mysql/estado_componente'),
        mantenimientoModels: require('./mysql/mantenimiento'),
        historialMantenimientoModels: require('./mysql/historial_mantenimiento'),
        versionesModels: require('./mysql/versiones'),
        UsuarioEmpresas: require('./mysql/usuarios_empresas'),
        notificacionesRentasModels: require('./mysql/notificacionesRentas'),
        RegistrosPPModels: require('./mysql/registrospp'),
        agendamientoOperarioModels: require('./mysql/agendamientos_operarios'),
        agendamientoIncumplidoModels: require('./mysql/agendamientos_incumplidos'),
        RegistroPPModels: require('./mysql/registrospp'),
        //Nuevos
        candadosModels: require('./mysql/candados'),
        rolesModels: require('./mysql/roles'),
        rolesPermisosModels: require('./mysql/rolesPermisos'),
        usuariosCredencialesModels: require('./mysql/usuariosCredenciales'),
        usuariosPermisosModels: require('./mysql/usuariosPermiso'),
        usuariosRolesModels: require('./mysql/usuariosRoles'),
        permisosModels: require('./mysql/permisos'),
        tarjetasNfcModels: require('./mysql/tarjetasNfc'),
            };

    Prestamos.belongsTo(Usuario, {foreignKey : "pre_usuario"});
    Usuario.hasMany(Prestamos,{foreignKey : "pre_usuario"});

    Prestamos.belongsTo(Bicicleta, {foreignKey : "pre_bicicleta"});
    Bicicleta.hasOne(Prestamos,{foreignKey : "pre_bicicleta"});

    Prestamos.belongsTo(Bicicletero, {foreignKey : "pre_retiro_bicicletero"});
    Bicicletero.hasOne(Prestamos,{foreignKey : "pre_retiro_bicicletero"});

    Estacion.belongsTo(Empresa,{ foreignKey : "est_empresa" });
    Empresa.hasMany(Estacion,{ foreignKey : "est_empresa" });

    Reserva.belongsTo(Usuario, {foreignKey : "res_usuario"});
    Usuario.hasMany(Reserva,{foreignKey : "res_usuario"});

    Reserva.belongsTo(Bicicleta, {foreignKey : "res_bicicleta"});
    Bicicleta.hasOne(Reserva,{foreignKey : "res_bicicleta"});

    Usuario.belongsTo(Empresa,{ foreignKey : "usu_empresa" });
    Empresa.hasOne(Usuario,{ foreignKey : "usu_empresa" });

    Usuario.belongsTo(Extendido,{ foreignKey : "usu_documento", as: 'extendido' });
    Extendido.hasOne(Usuario,{ foreignKey : "usu_documento", as: 'extendido' });

    Claves.belongsTo(Estacion,{ foreignKey : "his_estacion" });
    Estacion.hasMany(Claves,{ foreignKey : "his_estacion" });

    Claves.belongsTo(Bicicleta,{ foreignKey : "his_bicicleta" });
    Bicicleta.hasOne(Claves,{ foreignKey : "his_bicicleta" });
    
    Bicicleta.belongsTo(Estacion,{ foreignKey : "bic_estacion" });
    Estacion.hasMany(Bicicleta,{ foreignKey : "bic_estacion" });

    Bicicletero.belongsTo(Estacion,{ foreignKey : "bro_estacion" });
    Estacion.hasMany(Bicicletero,{ foreignKey : "bro_estacion" });

    Reserva.belongsTo(Estacion,{ foreignKey : "res_estacion" });
    Estacion.hasMany(Reserva,{ foreignKey : "res_estacion" });

    Comentarios.belongsTo(Prestamos,{ foreignKey : "com_prestamo" });
    Prestamos.hasMany(Comentarios,{ foreignKey : "com_prestamo" });

    Prestamos.belongsTo(Estacion,{ foreignKey : "pre_retiro_estacion" });
    Estacion.hasMany(Prestamos,{ foreignKey : "pre_retiro_estacion" });

    Comentarios.belongsTo(Usuario,{ foreignKey : "com_usuario" });
    Usuario.hasMany(Comentarios,{ foreignKey : "com_usuario" });

    Puntos.belongsTo(Usuario,{ foreignKey : "pun_usuario" });
    Usuario.hasMany(Puntos,{ foreignKey : "pun_usuario" });

    Estacion.belongsTo(Usuario, { foreignKey: 'est_direccion', targetKey: 'usu_dir_trabajo' });
    Usuario.hasOne(Estacion, { foreignKey: 'est_direccion', sourceKey: 'usu_dir_trabajo' });

    Usuario.belongsTo(Agendados, { foreignKey: 'usu_documento', targetKey: 'agendado_cedula', as: 'Agenda' });
    Agendados.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'agendado_cedula', as: 'Agenda' });

    Estacion.belongsTo(Practica, { foreignKey: 'est_estacion', targetKey: 'practica_estacion', as: 'Estacion' });
    Practica.hasOne(Estacion, { foreignKey: 'est_estacion', sourceKey: 'practica_estacion', as: 'Estacion' });

    Practica.belongsTo(Agendados, { foreignKey: '_id', targetKey: 'agendado_practica', as: 'Practica' });
    Agendados.hasOne(Practica, { foreignKey: '_id', sourceKey: 'agendado_practica', as: 'Practica' });

    Usuario.belongsTo(Teorica, { foreignKey: 'usu_documento', targetKey: 'teorica_usuario' });
    Teorica.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'teorica_usuario' });

    Usuario.belongsTo(Practica, { foreignKey: 'usu_documento', targetKey: 'practica_funcionario', as: 'Funcionario' });
    Practica.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'practica_funcionario', as: 'Funcionario' });

    Usuario.belongsTo(ProgresoLogros, { foreignKey: 'usu_documento', targetKey: 'usuario_id' });
    ProgresoLogros.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'usuario_id' });

    Logros.hasMany(ProgresoLogros, {
        foreignKey: 'logro_id',
        sourceKey: 'id_logro',
        as: 'progresos'
    });
    
    // Un progreso pertenece a un logro
    ProgresoLogros.belongsTo(Logros, {
        foreignKey: 'logro_id',
        targetKey: 'id_logro',
        as: 'logro'
    });

    Usuario.belongsTo(ProgresoDesafios, { foreignKey: 'usu_documento', targetKey: 'usuario_id' });
    ProgresoDesafios.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'usuario_id' });

    Desafios.belongsTo(ProgresoDesafios, { foreignKey: 'id_desafio', targetKey: 'desafio_id' });
    ProgresoDesafios.hasOne(Desafios, { foreignKey: 'id_desafio', sourceKey: 'desafio_id' });
      
    Bicicleta.belongsTo(Bicicletero, { foreignKey: 'bic_id', targetKey: 'bro_bicicleta' });
    Bicicletero.hasOne(Bicicleta, { foreignKey: 'bic_id', sourceKey: 'bro_bicicleta' });

    Usuario.belongsTo(ViajesParticular, { foreignKey: 'usu_documento', targetKey: 'via_usuario', as: 'usuario' });
    ViajesParticular.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'via_usuario', as: 'usuario' });
    //Particular
    VehiculosParticular.belongsTo(ViajesParticular, { foreignKey: 'vus_id', targetKey: 'via_vehiculo', as: 'vehiculo' });
    ViajesParticular.hasOne(VehiculosParticular, { foreignKey: 'vus_id', sourceKey: 'via_vehiculo', as: 'vehiculo' });

    ComentariosParticular.belongsTo(ViajesParticular, { foreignKey: 'com_id_viaje', targetKey: 'via_id', as: 'comentarios' });
    ViajesParticular.hasMany(ComentariosParticular, { foreignKey: 'com_id_viaje', sourceKey: 'via_id', as: 'comentarios' });
    //Carpooling
    CompartidoComentarios.belongsTo(Usuario,{ foreignKey : "idEnvio", targetKey: 'usu_documento', as: 'usuarioEnviado'  });
    Usuario.hasMany(CompartidoComentarios,{ foreignKey : "idEnvio", targetKey: 'usu_documento', as: 'usuarioEnviado'  });

    CompartidoComentarios.belongsTo(Usuario,{ foreignKey : "idRecibido", targetKey: 'usu_documento', as: 'usuarioRecibido'  });
    Usuario.hasMany(CompartidoComentarios,{ foreignKey : "idRecibido", targetKey: 'usu_documento', as: 'usuarioRecibido'  });

    CompartidoComentarios.belongsTo(CompartidoViajeActivo,{ foreignKey : "idViaje", targetKey: '_id', as: 'comentariosRelacionados'  });
    CompartidoViajeActivo.hasMany(CompartidoComentarios,{ foreignKey : "idViaje", targetKey: '_id', as: 'compartidoComentarios'  });

    CompartidoConductor.belongsTo(Usuario,{ foreignKey : "_id", targetKey: 'usu_documento', as: 'conductor'  });
    Usuario.hasOne(CompartidoConductor,{ foreignKey : "_id", targetKey: 'usu_documento', as: 'conductor'  });

    CompartidoViajeActivo.belongsTo(CompartidoConductor,{ foreignKey : "conductor", targetKey: '_id', as: 'viajeActivoConductor'  });
    CompartidoConductor.hasMany(CompartidoViajeActivo,{ foreignKey : "conductor", targetKey: '_id', as: 'viajeActivoConductor'  });

    CompartidoPasajero.belongsTo(Usuario,{ foreignKey : "_id", targetKey: 'usu_documento', as: 'pasajero'  });
    Usuario.hasOne(CompartidoPasajero,{ foreignKey : "_id", targetKey: 'usu_documento', as: 'pasajero'  });

    CompartidoSolicitud.belongsTo(CompartidoPasajero,{ foreignKey : "idSolicitante", targetKey: '_id', as: 'viajeActivoPasajero'  });
    CompartidoPasajero.hasMany(CompartidoSolicitud,{ foreignKey : "idSolicitante", targetKey: '_id', as: 'viajeActivoPasajero'  });

    CompartidoSolicitud.belongsTo(CompartidoViajeActivo,{ foreignKey : "idViajeSolicitado", targetKey: '_id', as: 'viajeSolicitado' });
    CompartidoViajeActivo.hasMany(CompartidoSolicitud,{ foreignKey : "idViajeSolicitado", targetKey: '_id', as: 'viajeSolicitado' });

    CompartidoSolicitud.belongsTo(Usuario, { foreignKey: 'idSolicitante', targetKey: 'usu_documento' });
    Usuario.hasMany(CompartidoSolicitud, { foreignKey: 'idSolicitante', targetKey: 'usu_documento' });

    CompartidoViajeActivo.belongsTo(Usuario,{ foreignKey : "conductor", targetKey: 'usu_documento' });
    Usuario.hasMany(CompartidoViajeActivo,{ foreignKey : "conductor", targetKey: 'usu_documento' });

    CompartidoPagos.belongsTo(CompartidoSolicitud, { foreignKey: 'idSolicitud', targetKey: '_id' });
    CompartidoSolicitud.hasMany(CompartidoPagos, { foreignKey: 'idSolicitud', sourceKey: '_id' });

    CompartidoVehiculos.belongsTo(CompartidoViajeActivo, { foreignKey: '_id', targetKey: 'vehiculo' });
    CompartidoViajeActivo.hasOne(CompartidoVehiculos, { foreignKey: '_id', sourceKey: 'vehiculo' });

    CompartidoPagos.belongsTo(Usuario, { foreignKey: 'idPasajero' });
    Usuario.hasMany(CompartidoPagos, { foreignKey: 'idPasajero' });

    CompartidoPenalizaciones.belongsTo(Usuario, { foreignKey: 'idUsuario', targetKey: 'usu_documento' });
    Usuario.hasMany(CompartidoPenalizaciones, { foreignKey: 'idUsuario', sourceKey: 'usu_documento' });

    CompartidoPenalizaciones.belongsTo(CompartidoViajeActivo, { foreignKey: 'idViaje', targetKey: '_id' });
    CompartidoViajeActivo.hasMany(CompartidoPenalizaciones, { foreignKey: 'idViaje', sourceKey: '_id' });

    //Oficinas y contratos
    Contratos.belongsTo(Empresa, { foreignKey: 'idOrganizacion', targetKey: 'emp_id' });
    Empresa.hasMany(Contratos, { foreignKey: 'idOrganizacion', sourceKey: 'emp_id' });

    Oficinas.belongsTo(Empresa, { foreignKey: 'idOrganizacion', targetKey: 'emp_id' });
    Empresa.hasMany(Oficinas, { foreignKey: 'idOrganizacion', sourceKey: 'emp_id' });

    LugarParqueo.belongsTo(Parqueaderos, { foreignKey: 'parqueadero', targetKey: 'id' });
    Parqueaderos.hasOne(LugarParqueo, { foreignKey: 'parqueadero', sourceKey: 'id' });

    Renta_parqueo.belongsTo(LugarParqueo, { foreignKey: 'lugar_parqueo', targetKey: 'id' });
    LugarParqueo.hasOne(Renta_parqueo, { foreignKey: 'lugar_parqueo', sourceKey: 'id' });

    Reserva_parqueo.belongsTo(Reserva_parqueo, { foreignKey: 'lugar_parqueo', targetKey: 'id' });
    Reserva_parqueo.hasOne(Renta_parqueo, { foreignKey: 'lugar_parqueo', sourceKey: 'id' });

    //Nuevos
    indicadoresModels.belongsTo(Prestamos, { 
        foreignKey: 'ind_viaje', 
        targetKey: 'pre_id',
        as: 'prestamo'
    });
    Prestamos.hasMany(indicadoresModels, { 
        foreignKey: 'ind_viaje', 
        sourceKey: 'pre_id',
        as: 'indicadores'
    });
    Prestamos.belongsTo(Usuario, {
        foreignKey: 'pre_usuario',
        targetKey: 'usu_documento',
        as: 'usuario'
    });

    Prestamos.belongsTo(Bicicleta, {
        foreignKey: 'pre_bicicleta',
        targetKey: 'bic_id',
        as: 'bicicleta'
    });

    Prestamos.belongsTo(Comentarios, {
        foreignKey: 'pre_id',
        targetKey: 'com_prestamo',
        as: 'comentarios'
    });
    //
    Bicicleta.belongsTo(Estacion, { foreignKey: 'bic_estacion', targetKey: 'est_estacion' });
        Estacion.hasMany(Bicicleta, { foreignKey: 'bic_estacion', sourceKey: 'est_estacion' });

    Contenido.belongsTo(Tematica, { foreignKey: 'id_tematica', targetKey: '_id' });
    Tematica.hasMany(Contenido, { foreignKey: 'id_tematica', sourceKey: '_id' });

    PreguntasBrain.belongsTo(Contenido, { foreignKey: 'id_contenido', targetKey: '_id', as: 'preguntas' });
    Contenido.hasMany(PreguntasBrain, { foreignKey: 'id_contenido', sourceKey: '_id', as: 'preguntas' });

    RespuestaBrain.belongsTo(PreguntasBrain, { foreignKey: 'id_pregunta', targetKey: '_id', as: 'respuestas' });
    PreguntasBrain.hasMany(RespuestaBrain, { foreignKey: 'id_pregunta', sourceKey: '_id', as: 'respuestas' });
    //Mantenimientos
    CategoriaComponente.hasMany(Componente, { foreignKey: 'categoria_id' });
    Componente.belongsTo(CategoriaComponente, { foreignKey: 'categoria_id' });

    Bicicleta.hasMany(EstadoComponente, { foreignKey: 'bicicleta_id' });
    EstadoComponente.belongsTo(Bicicleta, { foreignKey: 'bicicleta_id' });

    Componente.hasMany(EstadoComponente, { foreignKey: 'componente_id' });
    EstadoComponente.belongsTo(Componente, { foreignKey: 'componente_id' });

    Mantenimiento.hasMany(HistorialMantenimiento, { foreignKey: 'mantenimiento_id' });
    HistorialMantenimiento.belongsTo(Mantenimiento, { foreignKey: 'mantenimiento_id' });

    Componente.hasMany(HistorialMantenimiento, { foreignKey: 'componente_id' });
    HistorialMantenimiento.belongsTo(Componente, { foreignKey: 'componente_id' });

    
    Bicicleta.hasMany(Mantenimiento, { foreignKey: 'bicicleta_id' });
    Mantenimiento.belongsTo(Bicicleta, { foreignKey: 'bicicleta_id' });

    // En tu archivo de modelos/asociaciones (index.js)
    Mantenimiento.belongsTo(Usuario, { 
        foreignKey: 'operario_id', 
        targetKey: 'usu_documento',
        as: 'operario'
    });
    Usuario.hasMany(Mantenimiento, { 
        foreignKey: 'operario_id', 
        sourceKey: 'usu_documento',
        as: 'mantenimientos'
    });

    HistorialMantenimiento.belongsTo(Usuario,{
        foreignKey : "operario_id",
        targetKey: 'usu_documento',
        as: 'operario'
    })

    Usuario.hasMany(HistorialMantenimiento,{
        foreignKey : "operario_id",
        sourceKey: 'usu_documento',
        as: 'historiales_mantenimiento'
    })

    LugarParqueo.belongsTo(Parqueaderos, { foreignKey: 'parqueadero', as: 'parqueaderoInfo' });

    Renta_parqueo.belongsTo(Usuario, {
    foreignKey: 'usuario',
    targetKey: 'usu_documento'
    });

    Usuario.hasMany(Renta_parqueo, {
        foreignKey: 'usuario',
        sourceKey: 'usu_documento'
    });

    Renta_parqueo.belongsTo(Parqueaderos, {
        foreignKey: 'parqueadero',
        targetKey: 'id'
    });

    Parqueaderos.hasMany(Renta_parqueo, {
        foreignKey: 'parqueadero',
        sourceKey: 'id'
    });

    VehiculosParticular.belongsTo(Usuario, {
    foreignKey: 'vus_usuario',
    targetKey: 'usu_documento',
    as: 'usuario'
});

Usuario.hasMany(VehiculosParticular, {
    foreignKey: 'vus_usuario',
    sourceKey: 'usu_documento',
    as: 'vehiculos'
});

Parqueaderos.hasOne(Horarios_parqueadero, {
    foreignKey: 'parqueadero',
    sourceKey: 'id',
    as: 'horarios'
});

Horarios_parqueadero.belongsTo(Parqueaderos, {
    foreignKey: 'parqueadero',
    targetKey: 'id',
    as: 'parqueadero_info'
});

Usuario.hasOne(UsuarioEmpresas, { 
    foreignKey: 'usu_documento', 
    sourceKey: 'usu_documento',
    as: 'empresasAsignadas'
});

UsuarioEmpresas.belongsTo(Usuario, { 
    foreignKey: 'usu_documento', 
    targetKey: 'usu_documento',
    as: 'usuario'
});

preoperacionalesModels.belongsTo(Prestamos, {
    foreignKey: 'idViaje',
    targetKey: 'pre_id',
    as: 'prestamo'
});

Prestamos.hasMany(preoperacionalesModels, {
    foreignKey: 'idViaje', 
    sourceKey: 'pre_id',
    as: 'preoperacionales'
});

NotificacionRenta.belongsTo(Prestamos, { 
  foreignKey: 'not_renta_id', 
  targetKey: 'pre_id',
  as: 'renta'
});
Prestamos.hasMany(NotificacionRenta, { 
  foreignKey: 'not_renta_id', 
  sourceKey: 'pre_id',
  as: 'notificaciones'
});

NotificacionRenta.belongsTo(Usuario, { 
  foreignKey: 'not_usuario', 
  targetKey: 'usu_documento',
  as: 'usuario'
});

EmpresaLogro.belongsTo(Logros, {
    foreignKey: 'idLogro',
    targetKey: 'id_logro',
    as: 'logro'
});

TokenMsn.belongsTo(Usuario, { 
    foreignKey: 'documento', 
    targetKey: 'usu_documento',
    as: 'bc_usuario'
});

Usuario.hasOne(TokenMsn, { 
    foreignKey: 'documento', 
    sourceKey: 'usu_documento',
    as: 'token_info'
});

CompartidoViajeActivo.hasMany(CompartidoSolicitud, {
    foreignKey: 'idViajeSolicitado',
    sourceKey: '_id'
});

CompartidoSolicitud.belongsTo(CompartidoViajeActivo, {
    foreignKey: 'idViajeSolicitado',
    targetKey: '_id'
});

CompartidoConductor.hasMany(CompartidoVehiculos, {
    foreignKey: 'idpropietario',
    sourceKey: '_id'
});

CompartidoVehiculos.belongsTo(CompartidoConductor, {
    foreignKey: 'idpropietario',
    targetKey: '_id'
});


AgendamientoOperario.belongsTo(Usuario, {
    foreignKey: 'operario_id',
    targetKey: 'usu_documento'
});

Usuario.hasMany(AgendamientoOperario, {
    foreignKey: 'operario_id',
    sourceKey: 'usu_documento'
});

AgendamientoOperario.belongsTo(Estacion, {
    foreignKey: 'estacion_id',
    targetKey: 'est_estacion'
});

Estacion.hasMany(AgendamientoOperario, {
    foreignKey: 'estacion_id',
    sourceKey: 'est_estacion'
});

AgendamientoOperario.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    targetKey: 'emp_id'
});

Empresa.hasMany(AgendamientoOperario, {
    foreignKey: 'empresa_id',
    sourceKey: 'emp_id'
});

AgendamientoIncumplido.belongsTo(Usuario, {
    foreignKey: 'operario_id',
    targetKey: 'usu_documento'
});

Usuario.hasMany(AgendamientoIncumplido, {
    foreignKey: 'operario_id',
    sourceKey: 'usu_documento'
});

AgendamientoIncumplido.belongsTo(Estacion, {
    foreignKey: 'estacion_id',
    targetKey: 'est_estacion'
});

Estacion.hasMany(AgendamientoIncumplido, {
    foreignKey: 'estacion_id',
    sourceKey: 'est_estacion'
});

AgendamientoIncumplido.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    targetKey: 'emp_id'
});

Empresa.hasMany(AgendamientoIncumplido, {
    foreignKey: 'empresa_id',
    sourceKey: 'emp_id'
});

AgendamientoIncumplido.belongsTo(AgendamientoOperario, {
    foreignKey: 'agendamiento_id',
    targetKey: 'id'
});

AgendamientoOperario.hasMany(AgendamientoIncumplido, {
    foreignKey: 'agendamiento_id',
    sourceKey: 'id'
});

RegistroPP.belongsTo(Prestamos, { foreignKey: 'idViaje', targetKey: 'pre_id', as: 'prestamo' });
RegistroPP.belongsTo(Bicicleta, { foreignKey: 'vehiculo', targetKey: 'bic_id', as: 'bicicleta' });
RegistroPP.belongsTo(Usuario, { foreignKey: 'usuario', targetKey: 'usu_documento', as: 'usuarioData' });
Bicicleta.hasMany(RegistroPP, { foreignKey: 'vehiculo', sourceKey: 'bic_id', as: 'registros' });


//Nuevos
Bicicleta.belongsTo(Candado, { foreignKey: 'can_id', targetKey: 'can_id' });
Candado.hasOne(Bicicleta, { foreignKey: 'can_id', sourceKey: 'can_id' });

Usuario.belongsTo(UsuarioCredencial, { foreignKey: 'usu_documento', targetKey: 'uc_usuario_id' });
UsuarioCredencial.hasOne(Usuario, { foreignKey: 'usu_documento', sourceKey: 'uc_usuario_id' });

UsuarioRol.belongsTo(Usuario, { foreignKey: 'ur_usuario_id', targetKey: 'usu_documento' });
Usuario.hasMany(UsuarioRol, { foreignKey: 'ur_usuario_id', sourceKey: 'usu_documento' });

UsuarioRol.belongsTo(Rol, { foreignKey: 'ur_rol_id', targetKey: 'rol_id' });
Rol.hasMany(UsuarioRol, { foreignKey: 'ur_rol_id', sourceKey: 'rol_id' });

RolPermiso.belongsTo(Rol, { foreignKey: 'rp_rol_id', targetKey: 'rol_id' });
Rol.hasMany(RolPermiso, { foreignKey: 'rp_rol_id', sourceKey: 'rol_id' });

RolPermiso.belongsTo(Permiso, { foreignKey: 'rp_permiso_id', targetKey: 'per_id' });
Permiso.hasMany(RolPermiso, { foreignKey: 'rp_permiso_id', sourceKey: 'per_id' });

UsuarioPermiso.belongsTo(Usuario, { foreignKey: 'up_usuario_id', targetKey: 'usu_documento' });
Usuario.hasMany(UsuarioPermiso, { foreignKey: 'up_usuario_id', sourceKey: 'usu_documento' });

UsuarioPermiso.belongsTo(Permiso, { foreignKey: 'up_permiso_id', targetKey: 'per_id' });
Permiso.hasMany(UsuarioPermiso, { foreignKey: 'up_permiso_id', sourceKey: 'per_id' });

TarjetaNfc.belongsTo(Usuario, { foreignKey: 'tnfc_usuario_id', targetKey: 'usu_documento' });
Usuario.hasMany(TarjetaNfc, { foreignKey: 'tnfc_usuario_id', sourceKey: 'usu_documento' });


    module.exports = models

}