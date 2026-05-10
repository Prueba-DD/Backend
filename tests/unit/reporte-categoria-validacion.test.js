import test from 'node:test';
import assert from 'node:assert/strict';
import { createReporte } from '../../src/controllers/reporte.controller.js';
import { CategoriaRiesgoModel } from '../../src/models/categoria-riesgo.model.js';
import { ReporteModel } from '../../src/models/reporte.model.js';

const createMockResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const createValidRequest = (overrides = {}) => ({
  user: { sub: 7 },
  body: {
    tipo_contaminacion: ' Inundacion ',
    nivel_severidad: 'alto',
    titulo: 'Reporte de inundacion',
    descripcion: 'Nivel alto de agua en la zona',
    direccion: 'Calle 10',
    municipio: 'Valledupar',
    departamento: 'Cesar',
    latitud: 10.45,
    longitud: -73.25,
    ...overrides,
  },
});

test('createReporte rechaza categoria inexistente o inactiva antes de insertar', async (t) => {
  t.mock.method(CategoriaRiesgoModel, 'esValido', async () => false);
  t.mock.method(ReporteModel, 'create', async () => {
    throw new Error('No debe insertar reportes con categoria invalida');
  });

  const req = createValidRequest({ tipo_contaminacion: 'categoria_inexistente' });
  const res = createMockResponse();
  const next = t.mock.fn();

  await createReporte(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.status, 'error');
  assert.equal(res.body.message, 'La categoría de contaminación no existe o está inactiva.');
  assert.equal(ReporteModel.create.mock.callCount(), 0);
  assert.equal(next.mock.callCount(), 0);
});

test('createReporte crea reporte cuando la categoria existe y esta activa', async (t) => {
  t.mock.method(CategoriaRiesgoModel, 'esValido', async () => true);
  t.mock.method(ReporteModel, 'create', async () => 15);
  t.mock.method(ReporteModel, 'findById', async () => ({
    id_reporte: 15,
    tipo_contaminacion: 'inundacion',
    estado: 'pendiente',
  }));

  const req = createValidRequest();
  const res = createMockResponse();
  const next = t.mock.fn();

  await createReporte(req, res, next);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.data.reporte.tipo_contaminacion, 'inundacion');
  assert.equal(ReporteModel.create.mock.calls[0].arguments[0].tipo_contaminacion, 'inundacion');
  assert.equal(next.mock.callCount(), 0);
});
