var express = require('express')
var cors = require('cors') //解决跨域
var app = express();
var port = process.env.PORT || 1124;
var SerialPort = require('serialport')

var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '1mb'}));
app.use('/static',serveStatic('public'));
app.listen(port)
app.use(cors())

app.post('/ledControl/on.do',function (req,res) {
    const str = req.body.data
    if(setContrl(str.split(','))){
        res.send({
            code:100,
            data:'开启成功！',
            message:'信息'
        })
        return
    }
    res.send({
        code:101,
        data:'开启失败！',
        message:'信息'
    })
})

/*
**指令下发
* msg：string ;  eg: '01050000ff008C3A,01050001f000D80A'
* */
function setContrl(msg){
    return new Promise(function (resolve,reject) {
        let recData=[];
        msg.map(function (item, index) {
            //16进制Buffer流
            const str = new Buffer(item,"hex")
            recData.push(str)
        })
        var i = 0
        eachWrite(recData[i])
        function eachWrite(item) {
            serialPort.write(item, function (error, result) {
                i++
                if(i>=recData.length){
                    resolve(true)
                    return
                }
                //指令是一条一条下发的
                setTimeout(function () {
                    eachWrite(recData[i])
                },40)
            })
        }

        //错误监听
        serialPort.on('error',function (error) {
            console.log('error: '+error)
            resolve(false)
        })
    })

}

//Opening a Port
var serialPort = new SerialPort('COM4', {
    baudRate : 9600,
    autoOpen:false
})
//连接串口
serialPort.open(function (err) {
    console.log('IsOpen:',serialPort.isOpen)
})
//指令监听
serialPort.on('data',function (data) {
    console.log('data received: '+data)
})

//获取端口列表
SerialPort.list(function (error, ports) {
    ports.forEach(function(port) {
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
    });
})