var ws=require('nodejs-websocket');
var SerialPort = require('serialport')

var server = ws.createServer(function (conn, res) {
    conn.on("text",function(str){
        broadcast(server,str.split(','));
        server.emit('my other event', { my: 'data' });
    });
    conn.on("close",function(code,reason){
        console.log('connection closed');
    })
    //处理错误事件信息
    conn.on('error',function(err){
        console.log('throw err',err);
    })
}).listen(5000);

/*
**指令下发
* msg：string ;  eg: '01050000ff008C3A,01050001f000D80A'
* server：socket server
* */
function broadcast(server, msg) {
    var recData = [];
    msg.map(function (item, index) {
        //发送数据到客户端
        server.connections.forEach(function (conn) {
            conn.sendText(item);
        })
        //16进制Buffer流
        const str = new Buffer(item,"hex")
        recData.push(str)
    })
    var i = 0
    eachWrite(recData[i])
    function eachWrite(item) {
        serialPort.write(item, function (error, result) {
            i++
            if(i>=recData.length)return
            //指令是一条一条下发的
            setTimeout(function () {
                eachWrite(recData[i])
            },40)
        })
    }

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
//错误监听
serialPort.on('error',function (error) {
    console.log('error: '+error)
})

//获取端口列表
SerialPort.list(function (error, ports) {
    ports.forEach(function(port) {
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
    });
})