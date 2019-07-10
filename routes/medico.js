// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ================================
// Obtener todos los médicos
// ================================
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            ( err, medicos ) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos',
                    errors: err
                });
            }

            Medico.count( (err, conteo ) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });
            });
        });
});

// ================================
// Actualizar un nuevo medico
// ================================
app.put('/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, ( err, medico ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if ( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id:' + id + ' no existe',
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado ) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico ' + id,
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });

});

// ================================
// Crear un nuevo medico
// ================================
app.post('/', mdAutenticacion.verificaToken, ( req, res, next ) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save( ( err, medicoGuardado ) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });

    } );

    
});

// ================================
// Borrar un medico por el id
// ================================
app.delete('/:id', mdAutenticacion.verificaToken, ( req, res ) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, ( err, medicoBorrado ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario ' + id,
                errors: err
            });
        }

        if ( !medicoBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id ' + id,
                errors: { message: 'No existe un medico con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });


});




module.exports = app;