var fs = require('fs');
var http = require('http');
var https = require('https');
const express = require('express')
const app = express()
var path = require('path');
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('createerror');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport'); 
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const WebSocket = require('ws');


// routs requirement
var uploadHandler = require('./routes/upload');
var homeRoute = require('./routes/home');
var usersRoute = require('./routes/users');
var dashboardRoute = require('./routes/dashboard');
var productsRoute = require('./routes/products');
var coursesRoute = require('./routes/courses');
var print3dRoute = require('./routes/print3d');
var paymentRoute = require('./routes/payment');
var animalfeederRoute = require('./routes/animalfeeder');
var elecrepairRoute = require('./routes/elecrepair');
var farhanRoute = require('./routes/farhan');
var manufacture = require('./routes/manufacture');
var teachers = require('./routes/teachers');


// Mongo DB connect
mongoose.connect('mongodb://0.0.0.0:27017/ikiurobotic', {useNewUrlParser: true, useUnifiedTopology: true}, (err) =>{
    if(err) throw err; //console.error('DB not Connected !!');
    else console.log('Database connected :)');
});


// express session middleware
const{
    SESS_NAME = 'sid',
    SESS_TIME = 10000 * 60 * 60 * 2 
} = process.env

app.use(session({
    name: SESS_NAME,
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESS_TIME ,
        sameSite: true,
        secure: false
    }
}));

// passport config
require('./config/passports')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// HTTPS key and ssl
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Upload
app.use('/upload', uploadHandler);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// public path setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('/home/user/videos'));



// Routes Handlers
app.use('/', homeRoute);
app.use('/users', usersRoute);
app.use('/dashboard', dashboardRoute);
app.use('/products', productsRoute);
app.use('/courses', coursesRoute);
app.use('/print3d', print3dRoute);
app.use('/payment', paymentRoute);
app.use('/animalfeeder', animalfeederRoute);
app.use('/elecrepair', elecrepairRoute);
app.use('/farhan', farhanRoute);
app.use('/manufacture', manufacture);
app.use('/teachers', teachers);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    console.log(err);
    if(!req.user) res.render('error',{
        uname: false,
        user: false,
        err
    });
    else res.render('error', {
        uname: req.user.uname,
        user: req.user,
        err
    });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// Initialize Socket.IO server
// ----------------------------------NOTE: For ESP8266 install version 2.x -> npm install socket.io@2.4.1

const io = socketIo(httpServer,{cors: {origin: "*", methods: ["GET", "POST"]}}); 

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Event listener for messages from clients
    socket.on('message', (message) => {
        console.log(`Received from ${socket.id}: ${message}`);

        // Emit message to ESP8266
        io.emit('controlLED', message);
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});



// --------------- Websocket
/*
const http_wss = new WebSocket.Server({ server: httpServer });
// const https_wss = new WebSocket.Server({ httpsServer });

var io_callback = (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // ws.send(`o`); // Echo the message back to the client
        ws.send(`${message}`); // Echo the message back to the client
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
}

http_wss.on('connection', (ws) => io_callback(ws));
// https_wss.on('connection', (socket) => io_callback(socket, https_wss));
*/


httpServer.listen(3000, () => {
    console.log('http server is started :)')
});
httpsServer.listen(443, () => {
    console.log('https server is started :)')
});



var seo = require('express-seo')(app);
seo.setConfig({
    langs: ["en", "fa"]
});
seo.setDefaults({
    title: "مرکز تحقیقات رباتیک و برنامه نویسی", // Page title
    description: {
        en: "Robotic Research Laboratory (RRL) is a leading online platform for electronic products, educational courses, and customized services in robotics, electronics, and programming. We offer a wide range of high-quality electronic components, including Arduino boards, modules, ICs, and transistors, available for purchase. In addition to our products, we provide comprehensive online courses to help you learn and master the latest in robotics and programming. Our services also include affordable 3D printing orders, allowing you to get precise prints at competitive prices. At RRL, we also take on custom electronic, programming, and robotics projects, ensuring your innovative ideas come to life.",
        fa: "مرکز تحقیقات رباتیک و برنامه‌نویسی (RRL) یک پلتفرم پیشرو در فروش آنلاین محصولات الکترونیکی، دوره‌های آموزشی، و خدمات سفارشی در زمینه رباتیک، الکترونیک و برنامه‌نویسی است. ما مجموعه‌ای گسترده از قطعات الکترونیکی با کیفیت بالا، از جمله بردهای آردوینو، ماژول‌ها، آی‌سی‌ها و ترانزیستورها را برای خرید ارائه می‌دهیم. علاوه بر محصولات، دوره‌های آموزشی جامعی را برای یادگیری و تسلط بر جدیدترین فناوری‌های رباتیک و برنامه‌نویسی به صورت آنلاین فراهم کرده‌ایم. خدمات ما شامل پذیرش سفارشات پرینت سه‌بعدی ارزان و دقیق با قیمت‌های رقابتی نیز می‌شود. در RRL، ما همچنین پروژه‌های سفارشی الکترونیک، برنامه‌نویسی و رباتیک را برای به حقیقت پیوستن ایده‌های نوآورانه شما انجام می‌دهیم."
    },
    image: "https://rrlco.ir/img/logo.png"
});
seo.add("/products", function(req, opts, next) {
    next({
        description: "فروشگاه آنلاین مرکز تحقیقات رباتیک و برنامه‌نویسی (RRL) ارائه‌دهنده‌ی مجموعه‌ای متنوع از قطعات الکترونیکی و رباتیک با کیفیت بالا و قیمت مناسب می‌باشد. در این بخش می‌توانید خرید آردوینو، خرید ماژول، خرید قطعات الکترونیکی و خرید ربات را به سادگی انجام دهید. محصولات ما شامل انواع بردهای آردوینو مانند Arduino Uno، Arduino Mega و Arduino Nano، ماژول‌های کاربردی مانند ماژول بلوتوث HC-05، ماژول وای‌فای ESP8266 و ESP32، سنسورها مثل سنسورهای دما و رطوبت DHT11 و DHT22، سنسورهای فاصله‌یاب التراسونیک HC-SR04، موتورهای الکتریکی، ترانزیستور، آی‌سی، و دیگر ابزارهای الکترونیکی می‌باشد. همچنین، انواع پک‌های آموزش رباتیک و ماژول‌های GPS و GSM نیز برای پروژه‌های پیشرفته در دسترس است. ما در RRL به دنبال تامین نیازهای علاقه‌مندان به الکترونیک و رباتیک با بهترین محصولات از برندهای معتبر هستیم تا تجربه‌ای عالی از خرید آنلاین را برای شما فراهم کنیم."
    });
});
seo.add("/courses", function(req, opts, next) {
    next({
        description: "در بخش دوره‌های آموزشی مرکز تحقیقات رباتیک و برنامه‌نویسی (RRL)، می‌توانید به مجموعه‌ای جامع و متنوع از دوره‌های آموزشی آنلاین در زمینه‌های مختلف دسترسی پیدا کنید. دوره‌های ما شامل دوره آموزشی پایتون و آموزش پایتون برای مبتدیان و حرفه‌ای‌ها، دوره‌های رباتیک مانند چگونه ربات بسازیم و ساخت ربات، و دوره‌های الکترونیک و آردوینو می‌باشد. همچنین آموزش‌های پیشرفته‌تری همچون کار با میکروکنترلرهای STM32، AVR و رزبری پای (Raspberry Pi) ارائه می‌شود. علاوه بر این، دوره‌های تخصصی در زمینه‌های برنامه‌نویسی مانند طراحی وب با استفاده از HTML، CSS، JavaScript، Node.js، React.js، Next.js و Express.js، و همچنین برنامه‌نویسی پایتون (Python) و C++ در دسترس است. برای علاقه‌مندان به بازی‌سازی با Unity و توسعه اپلیکیشن‌های موبایل با React Native نیز دوره‌های جامع و پروژه‌محوری تدارک دیده‌ایم.در بخش طراحی و مهندسی نیز دوره‌هایی مانند طراحی مدار با Altium Designer، مدل‌سازی سه‌بعدی با SolidWorks، و مباحث پیشرفته‌تری مانند اینترنت اشیا (IOT) برای علاقه‌مندان به آموزش IOT و برنامه‌نویسی میکروکنترلرها ارائه شده است. دوره‌های ما با هدف آموزش عملی و پروژه‌محور طراحی شده‌اند تا شما بتوانید مهارت‌های لازم برای موفقیت در دنیای فناوری و رباتیک را کسب کنید."
    });
});
seo.add("/print3d", function(req, opts, next) {
    next({
        description: "در بخش سفارش پرینت سه بعدی مرکز تحقیقات رباتیک و برنامه‌نویسی (RRL)، خدمات پرینت سه بعدی پیشرفته و با کیفیت بالا برای پروژه‌های مختلف شما ارائه می‌شود. شما می‌توانید برای چاپ سه‌بعدی قطعات صنعتی، نمونه‌های اولیه، ماکت‌ها، و حتی پروژه‌های شخصی خود از خدمات ما استفاده کنید. ما از تکنولوژی‌های روز دنیا و مواد با کیفیت مانند PLA، ABS، PETG، و غیره استفاده می‌کنیم تا نتیجه‌ای بی‌نظیر را به شما تحویل دهیم. در صفحه سفارش پرینت سه بعدی، می‌توانید با انتخاب قیمت پرینت سه بعدی متناسب با نیاز خود، سفارش پرینت سه بعدی خود را به‌صورت آنلاین ثبت کنید. برای پروژه‌های کوچک تا بزرگ، خدمات پرینت سه بعدی ارزان و سفارشی در دسترس است. همچنین، کارشناسان ما در طراحی و بهینه‌سازی مدل‌های سه‌بعدی به شما کمک می‌کنند تا قطعات پرینت سه‌بعدی مورد نظر خود را با بهترین کیفیت و در کمترین زمان ممکن دریافت کنید. ما آماده‌ایم تا به نیازهای خاص شما پاسخ دهیم، چه برای پروژه‌های رباتیک، الکترونیک، پروژه‌های مهندسی، یا آموزش‌های رباتیک. سفارش دهید و تجربه‌ای متفاوت از خدمات پرینت سه بعدی ما را تجربه کنید!"
    });
});



