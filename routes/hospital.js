// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ================================
// Obtener todos los hospitales
// ================================
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            ( err, hospitales ) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count( (err, conteo ) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            });
        });
});

// ================================
// Actualizar un nuevo hospital
// ================================
app.put('/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, ( err, hospital ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if ( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id:' + id + ' no existe',
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado ) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital ' + id,
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});

// ================================
// Crear un nuevo medico
// ================================
app.post('/', mdAutenticacion.verificaToken, ( req, res, next ) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
    });
    hospital.save( ( err, hospitalGuardado ) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        });

    } );

    
});

// ================================
// Borrar un hospital por el id
// ================================
app.delete('/:id', mdAutenticacion.verificaToken, ( req, res ) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, ( err, hospitalBorrado ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital ' + id,
                errors: err
            });
        }

        if ( !hospitalBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id ' + id,
                errors: { message: 'No existe un hospital con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });


});


module.exports = app;