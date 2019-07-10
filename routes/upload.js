
// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

// default options
app.use(fileUpload());

app.put('/:tipo/:id', ( req, res, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de collección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de Colección no es válida',
            errors: { message: 'Tipo de Colección no es válida' }
        });
    }


    if ( !req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArch = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones
    var extensionesP = ['png', 'jpg', 'gif', 'jpeg'];

    result = extensionesP.findIndex(item => extensionArch.toLowerCase() === item.toLowerCase());

    if( result < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son: '+ extensionesP.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArch }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        //res.status(200).json({
        //    ok: true,
        //    mensaje: 'Archivo movido'
        //});
    });
      
});

function subirPorTipo( tipo, id, nombreArchivo, res ) {
    
    if( tipo === 'usuarios' ){
        Usuario.findById(id, (err, usuario)=>{

            if( !usuario ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario no es válido',
                    errors: {mesajes: 'El usuario no es válido' }
                });
            }
            var pathViejo = './uploads/usuarios/'+usuario.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync(pathViejo)  ) {
                fs.unlink(pathViejo, ( err ) => {

                    if( err ) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'No pudo eliminar el anteior archivo',
                            errors: err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioAct) => {
                usuarioAct.passqord = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioAct
                });
            });

        });
    }
    if( tipo === 'medicos' ){
        Medico.findById(id, (err, medico)=>{
            if( !medico ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico no es válido',
                    errors: {mesajes: 'El medico no es válido' }
                });
            }
            var pathViejo = './uploads/medicos/'+medico.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync(pathViejo)  ) {
                fs.unlink(pathViejo, ( err ) => {
                    if( err ) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'No pudo eliminar el anteior archivo',
                            errors: err
                        });
                    }
                });
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoAct) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    medico: medicoAct
                });
            });

        });
    }
    
    if( tipo === 'hospitales' ){
        Hospital.findById(id, (err, hospital)=>{
            if( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no es válido',
                    errors: {mesajes: 'El hospital no es válido' }
                });
            }
            var pathViejo = './uploads/hospitales/'+hospital.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync(pathViejo)  ) {
                fs.unlink(pathViejo, ( err ) => {
                    if( err ) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'No pudo eliminar el anteior archivo',
                            errors: err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalAct) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    hospital: hospitalAct
                });
            });

        });
    }

}

module.exports = app;