const express = require("express"); // Import express
let mysql = require("mysql"); // Import mysql
const bodyParser = require("body-parser"); // Import body-parser
const bcrypt = require('bcrypt'); // Import bcrypt
const cookieParser = require("cookie-parser"); // Import cookie-parser
const sessions = require("express-session"); // Import express-session
const nodemailer = require("nodemailer"); // Import nodemailer
const app = express(); // Create express app
const multer=require("multer");
const upload = multer({ dest: 'uploads/' });


//le decimos a express que use el paquete cookie parser
//para trabajar con cookies
app.use(cookieParser());
//le decimos a express que configure las sesiones con
//llave secreta secret
//creamos el tiempo de expiracion en milisegundos
const timeEXp = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "rfghf66a76ythggi87au7td",
  saveUninitialized: true,
  cookie: { maxAge: timeEXp },
  resave: false
}));
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "multiservicioadso@gmail.com",
    pass: "lnivdxmvnjnggzbt",
  },
});
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');//se establece express para que maneje plantillas ejs
app.use('/public/', express.static('./public'));//en la carpeta public cargaremos los archivos


//estaticos
const port = 10101;
const pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  user: 'root',
  password: 'Sena1234',
  database: 'multiServicios',
  debug: false
});
app.get('/', (req, res) => {
  let session = req.session;
  //verificamos si existe la sesion llamada correo y además que no haya expirado y también que
  //sea original, es decir, firmada por nuestro server
  if (session.correo) {
    return res.render('index', { nombres: session.nombres })//se retorna la plantilla llamada
    //index al cliente
  }
  return res.render('index', { nombres: undefined })//se retorna la plantilla llamada index al
  //cliente
})


app.get('/interfaz-index', (req, res) => {
  let session = req.session;
  if (session.nombres) {
    return res.render('index', { nombres: session.nombres })
  }
  return res.render('index', { nombres: undefined })
})

app.get('/interfaz-registro-profesional', (req, res) => {
  //se retorna la plantilla llamada registro que contiene
  //el formulario de registro
  res.render('registrop')

})
app.get('/interfaz-terminos-y-condiciones', (req, res) => {
  //se retorna la plantilla llamada registro que contiene
  //el formulario de registro
  res.render('terminos')

})
app.post('/registrop', (req, res) => {
  let nombres = req.body.nombre;
  let apellidos = req.body.apellidos;
  let correo = req.body.correo;
  let contrasenia = req.body.contrasenia;
  let profesion = req.body.profesion;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(contrasenia, salt);

  // Verificar si el correo electrónico ya existe en la base de datos
  pool.query(
    "SELECT correo FROM profesional WHERE correo = ?",
    [correo],
    (error, results) => {
      if (error) throw error;

      if (results.length > 0) {
        // El correo electrónico ya existe en la base de datos
        return res.render('registrop', { error: 'El correo electrónico ya está registrado' });
      } else {
        // El correo electrónico no existe, realizar la inserción
        pool.query(
          "INSERT INTO profesional (correo, nombres, apellidos, profesion, contrasenia) VALUES (?, ?, ?, ?, ?)",
          [correo, nombres, apellidos, profesion, hash],
          (error) => {
            if (error) throw error;

            transporter
              .sendMail({
                from: "multiservicioadso@gmail.com",
                to: `${correo}`,
                subject: "Correo del cliente",
                html: `
                  <div>
                    <p>Bienvenido</p>
                    <p>Haz ingresado a Multiservicios</p>
                    <p>Agradecemos tu inscripción</p>
                  </div>
                `,
              })
              .then((result) => {
                console.log(result);
                return res.render('registrop', { error: 'Registro exitoso' });
              })
              .catch((err) => {
                console.log(err);
                return res.render('registrop', { error: 'solicito caducada' });
              });
          });
      }
    });
});

app.post('/login', (req, res) => {
  // Se obtienen los valores de los campos de entrada del formulario de inicio de sesión
  let correo = req.body.correo;
  let contrasenia = req.body.contrasenia;

  new Promise((resolve, reject) => {
    pool.query("SELECT contrasenia, nombres, apellidos FROM profesional WHERE correo = ?", [correo], (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  })
    .then((data) => {
      // Si existe un registro con el correo proporcionado en el formulario de inicio de sesión...
      if (data.length > 0) {
        let contraseniaEncriptada = data[0].contrasenia;
        // Si la contraseña enviada por el usuario coincide con el hash guardado en la base de datos del usuario, hacemos login
        if (bcrypt.compareSync(contrasenia, contraseniaEncriptada)) {
          // Recogemos la sesión de la solicitud del usuario
          let session = req.session;
          // Iniciamos sesión para el usuario y almacenamos el correo encriptado en la sesión con el nombre 'correo'
          session.correo = correo;
          // También agregamos los nombres del usuario a la sesión
          session.nombres = `${data[0].nombres} ${data[0].apellidos}`;
          return res.redirect('/perfilpr');
        }
        // Si la contraseña enviada por el usuario es incorrecta...
        return res.render('registrop', { error: 'Usuario o contraseña incorrecta' });
      }
      // Si no existe el usuario en la base de datos...
      return res.render('registrop', { error: 'Usuario no registrado' });
    })
    .catch((error) => {
      throw error;
    });
});

app.post('/public', upload.single('image'), (req, res) => {
  const imageFile = req.file;
  const originalName = imageFile.originalname;
  const destinationPath = path.join(__dirname, '/public/update', originalName);

  fs.rename(imageFile.path, destinationPath, (error) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error al guardar la imagen');
    } else {
      res.send('Imagen guardada exitosamente');
    }
  });
});


app.get('/perfilpr', (req, res) => {
  pool.query("SELECT * FROM profesional", (error, data) => {
    if (error) throw error;

    if (data.length > 0) {
      console.log(data);
      let session = req.session;
      if (session.correo) {
        return res.render('perfilpr', { nombres: session.nombres, profesional: data });
      }
      return res.render('perfilpr', { nombres: undefined, profesional: data });
    }
   
  });
});



app.get('/interfaz-registro', (req, res) => {
  //se retorna la plantilla llamada registro que contiene
  //el formulario de registro
  res.render('registro')

})
app.post('/registro', (req, res) => {
  //se obtienen los valores de los inputs del formulario
  //de registro
  let correo = req.body.correo;
  let nombre = req.body.nombre;
  let apellido = req.body.apellido;
  let telefono = req.body.telefono;
  let contrasenia = req.body.contrasenia;
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  //convertimos a hash el password del usuario
  const hash = bcrypt.hashSync(contrasenia, salt);
  pool.query("INSERT INTO usuario VALUES (?, ?, ?, ?, ?)", [correo, nombre, apellido, hash, telefono],
    (error) => {
      if (error) throw error;
      transporter
        .sendMail({
          from: "multiservicioadso@gmail.com",
          to: `${correo}`,
          subject: "correo del cliente",
          html: ` 
              <div> 
              <p>Bienvenido </p> 
              <p>Haz ingresado a multiservicios</p> 
              <p>agradecemos tu inscripcion </p> 
              </div> 
          ` ,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        })
      return res.redirect('/interfaz-registro');
    });
});

app.get('/interfaz-login-persona', (req, res) => {
  //se retorna la plantilla llamada login que contiene
  //el formulario de login
  res.render('loginp')
})
app.get('/interfaz-perfil-usuario', (req, res) => {
  //se retorna la plantilla llamada login que contiene
  //el formulario de login
  res.render('listaServi')
})
app.post('/loginp', (req, res) => {
  // Se obtienen los valores de los campos de entrada del formulario de inicio de sesión
  let correo = req.body.correo;
  let contrasenia = req.body.contrasenia;
  pool.query("SELECT contrasenia, nombres, apellidos FROM usuario WHERE correo=?", [correo], (error, data) => {
    if (error) throw error;
    // Si existe un registro con el correo proporcionado en el formulario de inicio de sesión...
    if (data.length > 0) {
      let contraseniaEncriptada = data[0].contrasenia;
      // Si la contraseña enviada por el usuario coincide con el hash guardado en la base de datos del usuario, hacemos login
      if (bcrypt.compareSync(contrasenia, contraseniaEncriptada)) {
        // Recogemos la sesión de la solicitud del usuario
        let session = req.session;
        // Iniciamos sesión para el usuario y almacenamos el correo encriptado en la sesión con el nombre 'correo'
        session.correo = correo;
        // También agregamos los nombres del usuario a la sesión
        session.nombres = `${data[0].nombres} ${data[0].apellidos}`;
        return res.redirect('/PerfilUsuario');
      }
      // Si la contraseña enviada por el usuario es incorrecta...
      return res.send('Usuario o contraseña incorrecta');
    }
    // Si no existe el usuario en la base de datos...
    return res.send('Usuario o contraseña incorrecta');
  });
});
app.get('/perfilUsuario', (req, res) => {
  pool.query("SELECT * FROM usuario", (error, data) => {
    if (error) throw error
    let session = req.session;
    if (session.correo) {
      pool.query("SELECT DISTINCT nombres, profesion FROM profesional", (errorProfesionales, dataProfesionales) => {
        if (errorProfesionales) throw errorProfesionales;

        console.log(data);
        console.log(dataProfesionales);

        if (data.length > 0) {
          const profesionales = dataProfesionales.map((row) => row.profesion);
          const profesionalesEncontrados = [];
          const tipoConsulta = '';
          return res.render('perfilUsuario', { nombres: session.nombres, usuario: data[0], profesionales, profesionalesEncontrados, profesionSeleccionada: tipoConsulta });
        }
      
        return res.render('perfilUsuario', { nombres: undefined, usuario: data[0], profesionalesEncontrados: dataProfesionales });
      });
    } else {
      return res.render('Usuario no registrado');
    }
  });
});




app.get('/interfaz-Perfil', (req, res) => {
  // se retorna la plantilla llamada login que contiene
  // el formulario de login
  res.render('consulta', { profesionalesEncontrados: [] });
});

app.post("/consulta", (req, res) => {
  const tipoConsulta = req.body.tipoConsulta;
  pool.query(
    "SELECT * FROM profesional WHERE profesion = ?",
    [tipoConsulta],
    (error, results) => {
      if (error) {
        console.error("Error al obtener los profesionales:", error);
        res.status(500).send("Error en el servidor");
      } else {
        const profesionalesEncontrados = results;
        pool.query(
          "SELECT DISTINCT profesion FROM profesional",
          (error, results) => {
            if (error) {
              console.error("Error al obtener las profesiones:", error);
              res.status(500).send("Error en el servidor");
            } else {
              const profesiones = results.map((row) => row.profesion);
              res.render("perfilUsuario", {
                profesionales: profesiones,
                profesionalesEncontrados: profesionalesEncontrados,
                profesionSeleccionada: tipoConsulta,
                nombres: req.session.nombres,
                profesiones: profesiones 

                
              });
            }
          }
        );
      }
    }
  );
});


app.get('/test-cookies', (req, res) => {
  // Recogemos la cookie de sesión
  let session = req.session;
  if (session.correo) {
    res.send(`Usted tiene una sesión en nuestro sistema con correo: ${session.correo}`);
  } else {
    res.send('Por favor inicie sesión para acceder a esta ruta protegida');
  }
});

app.get('/logout', (req, res) => {
  // Recogemos la cookie de sesión
  let session = req.session;
  // Verificamos si existe la sesión llamada 'correo' y además que no haya expirado y que sea original (firmada por nuestro servidor)
  // Si la sesión está iniciada, la destruimos
  if (session.correo) {
    // La destruimos
    req.session.destroy();
    // Redirigimos al usuario a la ruta raíz
    return res.redirect('/');
  } else {
    return res.send('Por favor inicie sesión');
  }
});

app.post('/comprar/:correo', (req, res) => {
  // Recogemos la cookie de sesión
  let session = req.session;
  // Verificamos si existe la sesión llamada correo y además que no haya expirado y también
  // que sea original, es decir, firmada por nuestro servidor
  if (session.correo) {
    // Obtenemos el código del artículo que pasamos por la ruta como parámetro
    let correo = req.params.correo;

    // Verificar si ya existe una entrada en la tabla client_profesional con los mismos valores
    pool.query("SELECT * FROM client_profesional WHERE fk_cliente = ? AND fk_profesional = ?", [session.correo, correo], (error, results) => {
      if (error) throw error;

      if (results.length > 0) {
        // Ya existe una entrada con los mismos valores, realizar una acción o mostrar un mensaje de error
        return res.send('Ya has realizado esta compra anteriormente');
      } else {
        // No existe una entrada duplicada, insertar el nuevo registro
        pool.query("INSERT INTO client_profesional(fk_cliente, fk_profesional) VALUES (?, ?)", [session.correo, correo], (error) => {
          if (error) throw error;
          // Se retorna la plantilla llamada compraok al cliente notificando que la compra ha sido exitosa
          return res.render("resultado", { nombres: session.nombres });
        });
      }
    });
  } else {
    // Si el usuario no está logueado, le enviamos un mensaje para que inicie sesión
    return res.send('Por favor inicie sesión para realizar su compra');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
