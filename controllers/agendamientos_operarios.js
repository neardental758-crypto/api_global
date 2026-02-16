const { agendamientoOperarioModels, usuarioModels, estacionModels, empresaModels, mantenimientoModels, UsuarioEmpresas, agendamientoIncumplidoModels} = require("../models");
const { Op } = require("sequelize");
const { httpError } = require("../utils/handleError");
const { sequelize } = require('../config/mysql');
const getOperarios = async (req, res) => {
  try {
    const operarios = await usuarioModels.findAll({
      where: {
        usu_rol_dash: 'operario'
      },
      attributes: ['usu_documento', 'usu_nombre', 'usu_empresa']
    });
    res.send(operarios);
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_GET_OPERARIOS");
  }
};

const getAgendamientos = async (req, res) => {
  try {

    let page = 1;
    let limit = 20;
    let filters = {};

    if (req.query.filter) {
      const filter = JSON.parse(req.query.filter);
      page = parseInt(filter.page) || 1;
      limit = parseInt(filter.limit) || 20;
      
      if (filter.empresa) filters.empresa = filter.empresa;
      if (filter.estacion) filters.estacion = filter.estacion;
      if (filter.operario) filters.operario = filter.operario;
      if (filter.dia) filters.dia = filter.dia;
      if (filter.search) filters.search = filter.search;
    }

    const offset = (page - 1) * limit;

    const whereConditions = {};
    
    if (filters.dia) {
      whereConditions.dias_semana = {
        [Op.like]: `%${filters.dia}%`
      };
    }

    if (filters.operario) {
      whereConditions.operario_id = filters.operario;
    }

    const includeConditions = [
      {
        model: usuarioModels,
        attributes: ['usu_nombre', 'usu_documento']
      },
      {
        model: estacionModels,
        attributes: ['est_estacion'],
        required: !!(filters.estacion || filters.empresa),
        where: filters.estacion ? { est_estacion: filters.estacion } : {},
        include: [
          {
            model: empresaModels,
            attributes: ['emp_nombre'],
            required: !!filters.empresa,
            where: filters.empresa ? { emp_nombre: filters.empresa } : {}
          }
        ]
      }
    ];

    const { count, rows } = await agendamientoOperarioModels.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: [['id', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    let dataFormatted = rows.map(ag => ({
      ...ag.dataValues,
      operario_nombre: ag.bc_usuario?.usu_nombre || 'N/A',
      estacion_nombre: ag.bc_estacione?.est_estacion || 'N/A',
      empresa_nombre: ag.bc_estacione?.bc_empresa?.emp_nombre || 'N/A'
    }));

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      dataFormatted = dataFormatted.filter(item =>
        item.operario_nombre.toLowerCase().includes(searchLower) ||
        item.estacion_nombre.toLowerCase().includes(searchLower) ||
        item.empresa_nombre.toLowerCase().includes(searchLower)
      );
    }

    const allData = await agendamientoOperarioModels.findAll({
      include: [
        {
          model: usuarioModels,
          attributes: ['usu_nombre', 'usu_documento']
        },
        {
          model: estacionModels,
          attributes: ['est_estacion'],
          include: [
            {
              model: empresaModels,
              attributes: ['emp_nombre']
            }
          ]
        }
      ]
    });
const allFormatted = allData.map(ag => ({
  operario_id: ag.operario_id,
  operario_nombre: ag.bc_usuario?.usu_nombre || 'N/A',
  estacion_nombre: ag.bc_estacione?.est_estacion || 'N/A',
  empresa_nombre: ag.bc_estacione?.bc_empresa?.emp_nombre || 'N/A'
}));

const empresas = [...new Set(allFormatted.map(e => e.empresa_nombre).filter(e => e && e !== 'N/A'))].sort();
const todasEstaciones = allFormatted.map(e => ({
  nombre: e.estacion_nombre,
  empresa: e.empresa_nombre
})).filter(e => e.nombre && e.nombre !== 'N/A');
const estacionesUnicas = [...new Map(todasEstaciones.map(e => [e.nombre, e])).values()];
const operarios = [...new Map(allFormatted.map(e => [e.operario_id, { id: e.operario_id, nombre: e.operario_nombre }])).values()];

res.send({
  data: dataFormatted,
  total: count,
  page,
  totalPages: Math.ceil(count / limit),
  filters: {
    empresas,
    estaciones: estacionesUnicas,
    operarios
  }
});
  } catch (error) {
    console.error('Controller error:', error);
    httpError(res, "ERROR_GET_AGENDAMIENTOS");
  }
};
const getAgendamientosIncumplidos = async (req, res) => {
  try {
    const incumplidos = await agendamientoIncumplidoModels.findAll({
      include: [
        {
          model: usuarioModels,
          attributes: ['usu_nombre', 'usu_documento']
        },
        {
          model: estacionModels,
          attributes: ['est_estacion'],
          include: [
            {
              model: empresaModels,
              attributes: ['emp_nombre']
            }
          ]
        }
      ],
      order: [['fecha_incumplimiento', 'DESC']]
    });

    const dataFormatted = incumplidos.map(inc => ({
      ...inc.dataValues,
      operario_nombre: inc.bc_usuario?.usu_nombre || 'N/A',
      estacion_nombre: inc.bc_estacione?.est_estacion || 'N/A',
      empresa_nombre: inc.bc_estacione?.bc_empresa?.emp_nombre || 'N/A'
    }));

    res.send({
      data: dataFormatted,
      total: dataFormatted.length
    });
  } catch (error) {
    console.error('Controller error:', error);
    httpError(res, "ERROR_GET_INCUMPLIDOS");
  }
};

const getIncumplidosCount = async (req, res) => {
  try {
    const count = await agendamientoIncumplidoModels.count({
      where: {
        revisado: false
      }
    });

    res.send({ count });
  } catch (error) {
    console.error('Controller error:', error);
    httpError(res, "ERROR_GET_INCUMPLIDOS_COUNT");
  }
};

const marcarIncumplidoRevisado = async (req, res) => {
  try {
    const { id } = req.params;
    
    await agendamientoIncumplidoModels.update(
      { revisado: true },
      { where: { id } }
    );

    res.send({ message: 'Incumplido marcado como revisado' });
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_MARCAR_REVISADO");
  }
};

const marcarTodosRevisados = async (req, res) => {
  try {
    await agendamientoIncumplidoModels.update(
      { revisado: true },
      { where: { revisado: false } }
    );

    res.send({ message: 'Todos los incumplidos marcados como revisados' });
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_MARCAR_TODOS_REVISADOS");
  }
};

const createAgendamiento = async (req, res) => {
  try {
    const { operario_id, estacion_id, empresa_id, dias_semana, notas } = req.body;

    if (!dias_semana || !Array.isArray(dias_semana) || dias_semana.length === 0) {
      return httpError(res, "ERROR_DIAS_REQUERIDOS");
    }

    const fechaCreacion = new Date();
    fechaCreacion.setHours(fechaCreacion.getHours() - 5);
    
    const diasString = dias_semana.join(',');

    const agendamiento = await agendamientoOperarioModels.create({
      operario_id,
      estacion_id,
      empresa_id,
      dias_semana: diasString,
      notas,
      estado: 'pendiente',
      activo: true,
      fecha_creacion: fechaCreacion
    });

    res.send(agendamiento);
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_CREATE_AGENDAMIENTO");
  }
};

const updateAgendamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { operario_id, estacion_id, empresa_id, dias_semana, notas, estado, activo } = req.body;

    let diasString = dias_semana;
    if (Array.isArray(dias_semana)) {
      diasString = dias_semana.join(',');
    }

    await agendamientoOperarioModels.update(
      { 
        operario_id, 
        estacion_id, 
        empresa_id, 
        dias_semana: diasString,
        notas, 
        estado,
        activo
      },
      { where: { id } }
    );

    const agendamiento = await agendamientoOperarioModels.findByPk(id);
    res.send(agendamiento);
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_UPDATE_AGENDAMIENTO");
  }
};

const deleteAgendamiento = async (req, res) => {
  try {
    const { id } = req.params;
    await agendamientoOperarioModels.destroy({ where: { id } });
    res.send({ message: 'Agendamiento eliminado' });
  } catch (error) {
    console.error(error);
    httpError(res, "ERROR_DELETE_AGENDAMIENTO");
  }
};

const getEmpresasOperario = async (req, res) => {
  try {
    const { operario_id } = req.params;
    
    const usuarioEmpresas = await UsuarioEmpresas.findOne({
      where: { usu_documento: operario_id }
    });
    
    if (!usuarioEmpresas || !usuarioEmpresas.empresa_ids || usuarioEmpresas.empresa_ids.length === 0) {
      return res.send([]);
    }
    
    const empresas = await empresaModels.findAll({
      where: {
        emp_id: {
          [Op.in]: usuarioEmpresas.empresa_ids
        }
      }
    });
    
    res.send(empresas);
  } catch (error) {
    console.error('Error getEmpresasOperario:', error);
    httpError(res, "ERROR_GET_EMPRESAS_OPERARIO");
  }
};

const getEstacionesEmpresa = async (req, res) => {
  try {
    const { empresa_id } = req.params;
    
    const empresa = await empresaModels.findOne({
      where: { emp_id: empresa_id },
      attributes: ['emp_nombre']
    });
    
    if (!empresa) {
      return res.send([]);
    }
    
    const estaciones = await estacionModels.findAll({
      where: {
        est_empresa: empresa.emp_nombre
      },
      attributes: ['est_estacion', 'est_empresa']
    });
    
    res.send(estaciones);
  } catch (error) {
    console.error('Error getEstacionesEmpresa:', error);
    httpError(res, "ERROR_GET_ESTACIONES_EMPRESA");
  }
};

module.exports = {
    getAgendamientos,
    createAgendamiento,
    updateAgendamiento,
    deleteAgendamiento,
    getAgendamientosIncumplidos,
    getOperarios,
    getEmpresasOperario,
    getEstacionesEmpresa,
        getIncumplidosCount, marcarIncumplidoRevisado, marcarTodosRevisados
    
}
