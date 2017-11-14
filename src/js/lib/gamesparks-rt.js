var OpCodes={LOGIN_RESULT:-1,PING_RESULT:-3,UDP_CONNECT_MESSAGE:-5,PLAYER_READY_MESSAGE:-7,PLAYER_CONNECT_MESSAGE:-101,PLAYER_DISCONNECT_MESSAGE:-103};var Connection=function(a){this.session=a;this.stopped=!1};
Connection.prototype={stop:function(){this.stopped=!0;this.stopInternal()},onPacketReceived:function(a,b){if(a.command)if(a.command.abstractResultType){var c=a.command;c.configure(a,this.session);c.executeAsync()?this.session.submitAction(a.command):a.command.execute()}else this.session.submitAction(a.command);else a.hasPayload||(c=a.sender?CustomCommand.pool.pop().configure(a.opCode,a.sender,null,a.data,0,this.session,b):CustomCommand.pool.pop().configure(a.opCode,0,null,a.data,0,this.session,b))&&
this.session.submitAction(c)}};var ReliableConnection=function(a,b,c){Connection.call(this,c);this.remotehost=a;this.remoteport=b};ReliableConnection.prototype=Object.create(Connection.prototype);ReliableConnection.prototype.connect=function(){this.client=new WebSocket("wss://"+this.remotehost+":"+this.remoteport);this.client.binaryType="arraybuffer";this.client.onopen=this.onopen.bind(this);this.client.onclose=this.onclose.bind(this);this.client.onerror=this.onerror.bind(this);this.client.onmessage=this.onmessage.bind(this)};
ReliableConnection.prototype.onopen=function(a){this.stopped||null==this.session?null!=this.client&&(this.client.close(),this.client=null):(this.session.log("ReliableConnection",GameSparksRT.logLevel.DEBUG," TCP Connection Established"),a=new LoginCommand(this.session.connectToken),this.send(a))};
ReliableConnection.prototype.onmessage=function(a){if(this.stopped)null!=this.client&&(this.client.close(),this.client=null);else{var b=a.data;a=b.byteLength;var c=new Stream;b=Array.from(new Uint8Array(b));c.writeBytes(b,0,a);for(c.setPosition(0);c.getPosition()<a;){b=PooledObjects.packetPool.pop();var d=this.read(c,b);this.onPacketReceived(b,d);PooledObjects.packetPool.push(b);PooledObjects.packetPool.pop()}}};
ReliableConnection.prototype.onclose=function(a){null!=this.session&&this.session.log("ReliableConnection",GameSparksRT.logLevel.DEBUG," TCP Connection Closed")};ReliableConnection.prototype.onerror=function(a){null!=this.session&&this.session.log("ReliableConnection",GameSparksRT.logLevel.DEBUG," TCP Connection Error");console.log(a)};
ReliableConnection.prototype.send=function(a){if(null!=this.client&&this.client.readyState==WebSocket.OPEN){var b=new Stream;a=a.toPacket(this.session,!1);var c=Packet.serializeLengthDelimited(b,a);b=new Uint8Array(b.getBuffer());this.client.send(b);PooledObjects.packetPool.push(a);return c}return-1};ReliableConnection.prototype.read=function(a,b){if(this.stopped)return 0;b.session=this.session;b.reliable=!0;var c=Packet.deserializeLengthDelimited(a,b);null==b.reliable&&(b.reliable=!0);return c};
ReliableConnection.prototype.stopInternal=function(){null!=this.client&&this.client.readyState==WebSocket.OPEN&&(this.client.close(),this.client=null)};var Wire={VARINT:0,FIXED64:1,LENGTH_DELIMITED:2,FIXED32:5};var Key=function(a,b){this.field=a;this.wireType=b};Key.prototype={toString:function(){return"[Key: "+this.field+", "+this.wireType+"]"}};function assert(a,b){if(!a){b=b||"Assertion failed";if("undefined"!==typeof Error)throw Error(b);throw b;}}var Stream=function(){this.buffer="";this.position=0};
Stream.prototype={getPosition:function(){return this.position},setPosition:function(a){this.position=a},getLength:function(){return this.buffer.length},bytesAvailable:function(){return this.buffer.length-this.position},readByte:function(){var a=this.readChar();return"number"===typeof a&&-1==a?0:a.charCodeAt(0)},readChar:function(){var a=this.readChars("",this.position,1);var b=a[0];a=a[1];return 1==b?a.slice(0,1):-1},readChars:function(a,b,c){assert("string"===typeof a,"buffer must be string");if(0>=
this.bytesAvailable())return console.log("WARNING: Reached end of the stream"),[0,a];if(0>=c)return console.log("WARNING: no characters read (length = 0)"),[0,a];0<a.length?assert(0<=b&&b<a.length,"position out of range"):b=0;var d=this.position;var e=d+c;e>this.buffer.length&&(e=this.buffer.length);c=e-d;d=this.buffer.slice(d,e);this.position=e;0==b?(e=d,d.length<a.length&&(e+=a.slice(c))):(e=a.slice(0,b)+d,b+c+1<=a.length&&(e+=a.slice(b+c)));return[c,e]},read:function(a,b,c){assert("object"===typeof a&&
Array.isArray(a),"buffer must be array");var d="";for(var e=[],f=0;f<a.length;f++)d+=String.fromCharCode(a[f]);d=this.readChars(d,b,c);a=d[0];d=d[1];for(f=0;f<d.length;f++)e.push(d.charCodeAt(f));return[a,e]},writeByte:function(a){assert("number"===typeof a,"not valid byte");assert(0<=a&&255>=a,"not valid byte");this.writeChar(String.fromCharCode(a))},writeChar:function(a){this.writeChars(a,0,1)},writeChars:function(a,b,c){assert("string"===typeof a,"buffer must be string");assert(a&&0<a.length,"buffer must not be nil or empty");
if(0>this.bytesAvailable())console.log("WARNING: Reached end of the stream");else{if(0>=c)return console.log("WARNING: no characters written (length = 0)"),[0,a];assert(0<=b&&b<a.length,"position out of range");var d=b+c;d>a.length&&(d=a.length);c=d-b;a=a.slice(b,d);0==this.position?(b=a,this.buffer.length>a.length&&(b+=this.buffer.slice(c))):(b=this.buffer.slice(0,this.position)+a,this.position+c+1<=this.buffer.length&&(b+=this.buffer.slice(this.position+c)));this.buffer=b;this.position+=c}},writeBytes:function(a,
b,c){assert("object"===typeof a&&Array.isArray(a),"buffer must be array");for(var d="",e=b;e<b+c&&!(e>=a.length);e++)d+=String.fromCharCode(a[e]);this.writeChars(d,0,c)},seek:function(a){this.position-=a;0>this.position?this.position=0:this.position>=this.buffer.length&&(this.position=this.buffer.length-1)},toHex:function(){for(var a="",b=0;b<16*Math.ceil(this.buffer.length/16);b++){if(0==b%16){for(var c=b.toString(16),d=c.length;8>d;d++)a+="0";a=a+c+"  "}if(b>=this.buffer.length)a+="## ";else{c=
this.buffer.charCodeAt(b).toString(16);for(d=c.length;2>d;d++)a+="0";a=a+c+" "}0==(b+1)%8&&(a+=" ");0==(b+1)%16&&(c=this.buffer.slice(b-16+1,b+1),a=a+c.replace("[^ -~]",".")+"\n")}return a},toString:function(){return this.buffer},getBuffer:function(){for(var a=[],b=0;b<this.buffer.length;b++)a.push(this.buffer.charCodeAt(b));return a}};var PositionStream=function(){this.tempBuffer=[];this.bytesRead=0;this.stream=null};PositionStream.prototype={wrap:function(a){this.bytesRead=0;this.stream=a},read:function(a,b,c){a=this.stream.read(a,b,c);this.bytesRead+=a[0];return a},readByte:function(){var a=this.read(this.tempBuffer,0,1);return 1==a[0]?(this.tempBuffer=a[1],this.tempBuffer[0]):-1},seek:function(a){for(var b=0;b<a;b++)this.readByte();return this.bytesRead},getLength:function(){return this.stream.getLength()},getPosition:function(){return this.bytesRead}};var LimitedPositionStream=function(){PositionStream.call(this);this.limit=0};LimitedPositionStream.prototype=Object.create(PositionStream.prototype);LimitedPositionStream.prototype.wrap=function(a,b){PositionStream.prototype.wrap.call(this,a);this.limit=b};LimitedPositionStream.prototype.read=function(a,b,c){return PositionStream.prototype.read.call(this,a,b,c>this.limit-this.bytesRead?this.limit-this.bytesRead:c)};
LimitedPositionStream.prototype.readByte=function(){return this.bytesRead>=this.limit?-1:PositionStream.prototype.readByte.call(this)};LimitedPositionStream.prototype.skipToEnd=function(){if(this.bytesRead<this.limit){for(var a=PooledObjects.byteBufferPool.pop();256==this.read(a,this.bytesRead,256)[0];);PooledObjects.byteBufferPool.push(a)}};var ProtocolParser={readBool:function(a){a=a.readByte();if(0>a)return console.log("WARNING: Stream ended too early"),!1;if(1==a)return!0;if(0==a)return!1;print("WARNING: Invalid boolean value");return!1},readUInt32:function(a){for(var b,c=0,d=0;4>=d;d++){b=a.readByte();if(0>b)return console.log("WARNING: Stream ended too early"),0;if(4==d&&0!=(b&240))return console.log("WARNING: Got larger VarInt than 32bit unsigned"),0;if(0==(b&128))return c|b<<7*d;c|=(b&127)<<7*d}console.log("WARNING: Got larger VarInt than 32bit unsigned");
return 0},readZInt32:function(a){a=ProtocolParser.readUInt32(a);return a>>1^a<<31>>31},readSingle:function(a){for(var b=[],c=1;4>=c;c++)b[4-c]=a.readByte();a=b[0]<<24|b[1]<<16|b[2]<<8|b[3];b=-1;for(var d=c=0;22>=d;d++)c+=((a&1<<22-d)>>>22-d)*Math.pow(2,b),--b;return(2147483648==(a&2147483648)?-1:1)*Math.pow(2,((a&2139095040)>>23)-127)*(c+1)},readUInt64:function(a){for(var b,c=0,d=0;9>=d;d++){b=a.readByte();if(0>b)return console.log("WARNING: Stream ended too early"),0;if(9==d&&0!=(b&254))return console.log("WARNING: Got larger VarInt than 64 bit unsigned"),
0;if(0==(b&128))return c+b*Math.pow(128,d);c+=(b&127)*Math.pow(128,d)}console.log("WARNING: Got larger VarInt than 64 bit unsigned");return 0},readZInt64:function(a){a=ProtocolParser.readUInt64(a);var b=!1;1==a%2&&(b=!0);a=Math.floor(a/2);return 1==b?-a:a},readDouble:function(a){for(var b=[],c=1;8>=c;c++)b[8-c]=a.readByte();a=b[0]<<24|b[1]<<16|b[2]<<8|b[3];b=b[4]<<24|b[5]<<16|b[6]<<8|b[7];c=-1;for(var d=0,e=0;51>=e;e++)d+=(20>e?(a&1<<19-e)>>>19-e:(b&1<<e-20+31)>>>e-20+31)*Math.pow(2,c),--c;return(2147483648==
(a&2147483648)?-1:1)*Math.pow(2,((a&2146435072)>>20)-1023)*(d+1)},readString:function(a){for(var b=ProtocolParser.readUInt32(a),c=PooledObjects.memoryStreamPool.pop(),d=PooledObjects.byteBufferPool.pop(),e=0,f,g;e<b;){f=a.read(d,0,Math.min(b-e,d.length));g=f[0];d=f[1];if(0==g)return console.log("WARNING: Expected "+(b-e).toString()+" got "+e),0;c.writeBytes(d,0,g);e+=g}f=c.toString().slice(0,c.getPosition());PooledObjects.byteBufferPool.push(d);PooledObjects.memoryStreamPool.push(c);return f},readKey:function(a,
b){if(128>a)return new Key(a>>3,a&7);var c=ProtocolParser.readUInt32(b)<<4|a>>3&15;return new Key(c,a&7)},skipKey:function(a,b){b.wireType==Wire.FIXED32?a.seek(4):b.wireType==Wire.FIXED64?a.seek(8):b.wireType==Wire.LENGTH_DELIMITED?a.seek(ProtocolParser.readUInt32(a)):b.wireType==Wire.VARINT?ProtocolParser.readSkipVarInt(a):console.log("WARNING: Unknown wire type: "+b.wireType)},readSkipVarInt:function(a){for(;;){var b=a.readByte();if(0>b){console.log("WARNING: Stream ended too early");break}if(0==
(b&128))break}},writeBool:function(a,b){return b?a.writeByte(1):a.writeByte(0)},writeUInt32:function(a,b){for(b=Math.abs(b);;){var c=b&127;b>>>=7;if(0==b){a.writeByte(c);break}else c|=128,a.writeByte(c)}},writeZInt32:function(a,b){ProtocolParser.writeUInt32(a,b<<1^b>>31)},writeUInt64:function(a,b){for(b=Math.abs(b);;){var c=b&127;b=Math.floor(b/128);if(0==b){a.writeByte(c);break}else c|=128,a.writeByte(c)}},writeZInt64:function(a,b){var c=!1;0>b&&(b=-b,c=!0);b*=2;1==c&&(b+=1);ProtocolParser.writeUInt64(a,
b)},frexp:function(a){a=Number(a);var b=[a,0];if(0!==a&&Number.isFinite(a)){var c=Math.abs(a),d=Math.max(-1023,Math.floor((Math.log2||function(a){return Math.log(a)*Math.LOG2E})(c))+1);for(c*=Math.pow(2,-d);.5>c;)c*=2,d--;for(;1<=c;)c*=.5,d++;0>a&&(c=-c);b[0]=c;b[1]=d}return b},writeSingle:function(a,b){var c=[0,0,0,0];if(0!=b){var d=Math.abs(b),e=ProtocolParser.frexp(d),f=e[0];e=e[1];e=e-1+127;c[0]=(b!=d&&128||0)+Math.floor(e/2);f=(2*f-1)*Math.pow(2,7);d=Math.floor(f);f-=d;c[1]=e%2*Math.pow(2,7)+
d;for(e=2;4>e;e++)f*=Math.pow(2,8),d=Math.floor(f),f-=d,c[e]=d}for(e=c.length-1;0<=e;e--)a.writeByte(c[e])},writeDouble:function(a,b){var c=[0,0,0,0,0,0,0,0];if(0!=b){var d=Math.abs(b),e=ProtocolParser.frexp(d),f=e[0];e=e[1];e=e-1+1023;c[0]=(b!=d&&128||0)+Math.floor(e/Math.pow(2,4));f=(2*f-1)*Math.pow(2,4);d=Math.floor(f);f-=d;c[1]=e%Math.pow(2,4)*Math.pow(2,4)+d;for(e=2;8>e;e++)f*=Math.pow(2,8),d=Math.floor(f),f-=d,c[e]=d}for(e=c.length-1;0<=e;e--)a.writeByte(c[e])},writeBytes:function(a,b,c){ProtocolParser.writeUInt32(a,
c);a.writeBytes(b,0,c)},writeString:function(a,b){for(var c=[],d=0;d<b.length;d++)c.push(b.charCodeAt(d));ProtocolParser.writeBytes(a,c,b.length)}};var ObjectPool=function(a,b,c){this.stack=[];this.creator=a;this.refresher=b;this.maxSize=c};ObjectPool.prototype={pop:function(){return 0==this.stack.length?this.creator():this.stack.shift()},push:function(a){a&&!(0<=this.stack.indexOf(a))&&this.stack.length<this.maxSize&&(this.refresher&&this.refresher(a),this.stack.push(a))},dispose:function(){this.stack=[]}};var LogCommand=function(){this.session=this.level=this.msg=this.tag=null};LogCommand.pool=new ObjectPool(function(){return new LogCommand},null,5);LogCommand.prototype={configure:function(a,b,c,d){this.tag=b;this.msg=d;this.level=c;this.session=a;return this},execute:function(){GameSparksRT.shouldLog(this.tag,this.level)&&(this.session.peerId?GameSparksRT.logger(this.session.peerId+" "+this.tag+":"+this.msg):GameSparksRT.logger(" "+this.tag+":"+this.msg));LogCommand.pool.push(this)}};var CustomCommand=function(){this.session=null;this.packetSize=this.limit=this.sender=this.opCode=0;this.data=this.limitedStream=this.ms=null};CustomCommand.pool=new ObjectPool(function(){return new CustomCommand},null,5);
CustomCommand.prototype={configure:function(a,b,c,d,e,f,g){this.ms=PooledObjects.memoryStreamPool.pop();this.packetSize=g;this.opCode=a;this.sender=b;this.data=d;this.session=f;this.limit=e;this.limitedStream=null;if(null!=c){this.limitedStream=PooledObjects.limitedPositionStreamPool.pop();for(a=1;a<=e;a++)b=c.readByte(),this.ms.writeByte(b);this.ms.setPosition(0);this.limitedStream.wrap(this.ms,e)}return this},execute:function(){this.session.onPacket(new RTPacket(this.opCode,this.sender,this.limitedStream,
this.limit,this.data,this.packetSize));PooledObjects.memoryStreamPool.push(this.ms);PooledObjects.limitedPositionStreamPool.push(this.limitedStream);CustomCommand.pool.push(this)}};var ActionCommand=function(){this.action=null};ActionCommand.pool=new ObjectPool(function(){return new ActionCommand},null,5);ActionCommand.prototype={configure:function(a){this.action=a;return this},execute:function(){this.action();ActionCommand.pool.push(this)}};var CommandFactory={getCommand:function(a,b,c,d,e,f,g){var h=null,l=ProtocolParser.readUInt32(d),k=PooledObjects.limitedPositionStreamPool.pop();k.wrap(d,l);a==OpCodes.LOGIN_RESULT?h=LoginResult.deserialize(k,LoginResult.pool.pop()):a==OpCodes.PING_RESULT?h=PingResult.deserialize(k,PingResult.pool.pop()):a==OpCodes.UDP_CONNECT_MESSAGE?h=UDPConnectMessage.deserialize(k,UDPConnectMessage.pool.pop()):a==OpCodes.PLAYER_CONNECT_MESSAGE?h=PlayerConnectMessage.deserialize(k,PlayerConnectMessage.pool.pop()):
a==OpCodes.PLAYER_DISCONNECT_MESSAGE?h=PlayerDisconnectMessage.deserialize(k,PlayerDisconnectMessage.pool.pop()):e.shouldExecute(b,c)&&(h=CustomCommand.pool.pop().configure(a,b,k,f,l,e,g));k.skipToEnd();PooledObjects.limitedPositionStreamPool.push(k);return h}};var AbstractResult=function(){this.abstractResultType=!0;this.session=this.packet=null};AbstractResult.prototype={configure:function(a,b){this.packet=a;this.session=b},executeAsync:function(){return!0}};var LoginResult=function(){AbstractResult.call(this);this.success=!1;this.peerId=this.reconnectToken=null;this.activePeers=[];this.fastPort=null};LoginResult.pool=new ObjectPool(function(){return new LoginResult},function(a){a.activePeers=[];a.fastPort=null;a.reconnectToken=null;a.peerId=null},5);LoginResult.prototype=Object.create(AbstractResult.prototype);
LoginResult.prototype.execute=function(){this.session.connectToken=this.reconnectToken;this.session.peerId=this.peerId;null==this.packet.reliable||1==this.packet.reliable?(null!=this.fastPort&&this.fastPort&&(this.session.fastPort=this.fastPort),this.session.activePeers=this.activePeers.slice(),this.session.setConnectState(GameSparksRT.connectState.RELIABLE_ONLY),this.session.connectFast(),this.session.log("LoginResult",GameSparksRT.logLevel.DEBUG,this.session.peerId+" TCP LoginResult, ActivePeers "+
this.session.activePeers.length)):this.session.setConnectState(GameSparksRT.connectState.RELIABLE_AND_FAST_SEND);LoginResult.pool.push(this)};LoginResult.prototype.executeAsync=function(){return!1};
LoginResult.deserialize=function(a,b){null==b.activePeers&&(b.activePeers=[]);for(;;){var c=a.readByte();if(-1==c)break;var d=!1;8==c?(b.success=ProtocolParser.readBool(a),d=!0):18==c?(b.reconnectToken=ProtocolParser.readString(a),d=!0):24==c?(b.peerId=ProtocolParser.readUInt64(a),d=!0):32==c?(b.activePeers.push(ProtocolParser.readUInt64(a)),d=!0):40==c&&(b.fastPort=ProtocolParser.readUInt64(a),d=!0);if(!d){c=ProtocolParser.readKey(c,a);if(0==c.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),
null;ProtocolParser.skipKey(a,c)}}return b};var PingResult=function(){AbstractResult.call(this)};PingResult.pool=new ObjectPool(function(){return new PingResult},null,5);PingResult.prototype=Object.create(AbstractResult.prototype);PingResult.prototype.execute=function(){this.session.log("PingResult",GameSparksRT.LogLevel.DEBUG,"");PingResult.pool.push(this)};PingResult.prototype.executeAsync=function(){return!1};
PingResult.deserialize=function(a,b){for(;;){var c=a.readByte();if(-1==c)break;c=ProtocolParser.readKey(c,a);if(0==c.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),null;ProtocolParser.skipKey(a,c)}return b};var PlayerConnectMessage=function(){AbstractResult.call(this);this.peerId=0;this.activePeers=[]};PlayerConnectMessage.pool=new ObjectPool(function(){return new PlayerConnectMessage},function(a){a.activePeers=[]},5);PlayerConnectMessage.prototype=Object.create(AbstractResult.prototype);
PlayerConnectMessage.prototype.execute=function(){this.session.activePeers=[];this.session.activePeers=this.activePeers.slice();this.session.log("PlayerConnectMessage",GameSparksRT.logLevel.DEBUG,"PeerId="+this.peerId+", ActivePeers "+this.session.activePeers.length);this.session.onPlayerConnect(this.peerId);PlayerConnectMessage.pool.push(this)};
PlayerConnectMessage.deserialize=function(a,b){null==b.activePeers&&(b.activePeers=[]);for(;;){var c=a.readByte();if(-1==c)break;var d=!1;8==c?(b.peerId=ProtocolParser.readUInt64(a),d=!0):32==c&&(b.activePeers.push(ProtocolParser.readUInt64(a)),d=!0);if(!d){c=ProtocolParser.readKey(c,a);if(0==c.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),null;ProtocolParser.skipKey(a,c)}}return b};var PlayerDisconnectMessage=function(){AbstractResult.call(this);this.peerId=0;this.activePeers=[]};PlayerDisconnectMessage.pool=new ObjectPool(function(){return new PlayerDisconnectMessage},function(a){a.activePeers=[]},5);PlayerDisconnectMessage.prototype=Object.create(AbstractResult.prototype);
PlayerDisconnectMessage.prototype.execute=function(){this.session.activePeers=[];this.session.activePeers=this.activePeers.slice();this.session.log("PlayerDisconnectMessage",GameSparksRT.logLevel.DEBUG,"PeerId="+this.peerId+", ActivePeers "+this.session.activePeers.length);this.session.onPlayerDisconnect(this.peerId);PlayerDisconnectMessage.pool.push(this)};
PlayerDisconnectMessage.deserialize=function(a,b){null==b.activePeers&&(b.activePeers=[]);for(;;){var c=a.readByte();if(-1==c)break;var d=!1;8==c?(b.peerId=ProtocolParser.readUInt64(a),d=!0):32==c&&(b.activePeers.push(ProtocolParser.readUInt64(a)),d=!0);if(!d){c=ProtocolParser.readKey(c,a);if(0==c.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),null;ProtocolParser.skipKey(a,c)}}return b};var UDPConnectMessage=function(){AbstractResult.call(this)};UDPConnectMessage.pool=new ObjectPool(function(){return new UDPConnectMessage},null,5);UDPConnectMessage.prototype=Object.create(AbstractResult.prototype);
UDPConnectMessage.prototype.execute=function(){var a=null!=this.packet.reliable?this.packet.reliable:!1;this.session.log("UDPConnectMessage",GameSparksRT.logLevel.DEBUG,"(UDP) reliable="+a.toString()+", ActivePeers "+this.session.activePeers.length);a?self.session.log("UDPConnectMessage",GameSparksRT.logLevel.DEBUG,"TCP (Unexpected) UDPConnectMessage"):(self.session.setConnectState(GameSparksRT.connectState.RELIABLE_AND_FAST),self.session.sendData(-5,GameSparksRT.deliveryIntent.RELIABLE,null,null));
UDPConnectMessage.pool.push(this)};UDPConnectMessage.prototype.executeAsync=function(){return!1};UDPConnectMessage.deserialize=function(a,b){for(;;){var c=a.readByte();if(-1==c)break;c=ProtocolParser.readKey(c,a);if(0==c.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),null;ProtocolParser.skipKey(a,c)}return b};var RTRequest=function(){this.data=null;this.opCode=0;this.targetPlayers=[];this.intent=GameSparksRT.deliveryIntent.RELIABLE};RTRequest.prototype={toPacket:function(a,b){return null},reset:function(){this.targetPlayers=[]},serialize:function(a){}};var LoginCommand=function(a){RTRequest.call(this);this.opCode=0;this.token=a;this.clientVersion=2};LoginCommand.prototype=Object.create(RTRequest.prototype);
LoginCommand.prototype.toPacket=function(a,b){var c=PooledObjects.packetPool.pop();c.opCode=this.opCode;c.data=this.data;c.session=a;b||this.intent==GameSparksRT.deliveryIntent.RELIABLE||(c.reliable=!1);this.intent==GameSparksRT.deliveryIntent.UNRELIABLE_SEQUENCED&&(c.sequenceNumber=a.nextSequenceNumber());0<this.targetPlayers.length&&(c.targetPlayers=this.targetPlayers);c.request=this;return c};
LoginCommand.prototype.serialize=function(a){null!=this.token&&(a.writeByte(10),ProtocolParser.writeString(a,this.token));null!=this.clientVersion&&(a.writeByte(16),ProtocolParser.writeUInt64(a,this.clientVersion))};var PingCommand=function(a){RTRequest.call(this);this.opCode=-2};PingCommand.prototype=Object.create(RTRequest.prototype);
PingCommand.prototype.toPacket=function(a,b){var c=PooledObjects.packetPool.pop();c.opCode=this.opCode;c.data=this.data;c.session=a;b||this.intent==GameSparksRT.deliveryIntent.RELIABLE||(c.reliable=!1);this.intent==GameSparksRT.deliveryIntent.UNRELIABLE_SEQUENCED&&(c.sequenceNumber=a.nextSequenceNumber());0<this.targetPlayers.length&&(c.targetPlayers=this.targetPlayers);c.request=this;return c};PingCommand.prototype.serialize=function(a){};var CustomRequest=function(){RTRequest.call(this);this.payload=null};CustomRequest.prototype=Object.create(RTRequest.prototype);CustomRequest.prototype.configure=function(a,b,c,d,e){this.opCode=a;this.payload=c;this.intent=b;this.data=d;if(null!=e)for(var f in e)this.targetPlayers.push(e[f])};
CustomRequest.prototype.toPacket=function(a,b){var c=PooledObjects.packetPool.pop();c.opCode=this.opCode;c.data=this.data;c.session=a;b||this.intent==GameSparksRT.deliveryIntent.RELIABLE||(c.reliable=!1);this.intent==GameSparksRT.deliveryIntent.UNRELIABLE_SEQUENCED&&(c.sequenceNumber=a.nextSequenceNumber());0<this.targetPlayers.length&&(c.targetPlayers=this.targetPlayers);c.request=this;return c};CustomRequest.prototype.serialize=function(a){this.payload&&a.writeBytes(this.payload,0,this.payload.length)};
CustomRequest.prototype.reset=function(){this.payload=null;RTRequest.prototype.reset.call(this)};var Packet=function(){this.opCode=0;this.request=this.payload=this.data=this.reliable=this.sender=this.targetPlayers=this.requestId=this.sequenceNumber=null;this.hasPayload=!1;this.session=this.command=null};
Packet.prototype={reset:function(){this.opCode=0;this.request=this.command=this.payload=this.reliable=this.sender=this.targetPlayers=this.requestId=this.sequenceNumber=null;this.hasPayload=!1;this.data=null},toString:function(){return"{OpCode:"+this.opCode+",TargetPlayers:"+this.targetToString()+"}"},targetToString:function(){var a="[";if(null!=this.targetPlayers)for(var b=0;b<this.targetPlayers.length;b++)a=a+this.targetPlayers[b]+" ";return a+"]"},readPayload:function(a,b){this.hasPayload=!0;this.command=
null!=this.sender?CommandFactory.getCommand(this.opCode,this.sender,this.sequenceNumber,a,this.session,this.data,b):CommandFactory.getCommand(this.opCode,0,this.sequenceNumber,a,this.session,this.data,b);return null},writePayload:function(a){if(null!=this.request){var b=PooledObjects.memoryStreamPool.pop();this.request.serialize(b);var c=b.getBuffer();0<b.getPosition()&&(a.writeByte(122),ProtocolParser.writeBytes(a,c,b.getPosition()));PooledObjects.memoryStreamPool.push(b)}else null!=this.payload&&
(a.writeByte(122),ProtocolParser.writeBytes(a,this.payload,this.payload.length))}};
Packet.serialize=function(a,b){a.writeByte(8);ProtocolParser.writeZInt32(a,b.opCode);null!=b.sequenceNumber&&(a.writeByte(16),ProtocolParser.writeUInt64(a,b.sequenceNumber));null!=b.requestId&&(a.writeByte(24),ProtocolParser.writeUInt64(a,b.requestId));if(null!=b.targetPlayers)for(var c=0;c<b.targetPlayers.length;c++)a.writeByte(32),ProtocolParser.writeUInt64(a,b.targetPlayers[c]);null!=b.sender&&(a.writeByte(40),ProtocolParser.writeUInt64(a,b.sender));null!=b.reliable&&(a.writeByte(48),ProtocolParser.writeBool(a,
b.reliable));null!=b.data&&(a.writeByte(114),RTData.writeRTData(a,b.data));b.writePayload(a);return a};Packet.serializeLengthDelimited=function(a,b){var c=PooledObjects.memoryStreamPool.pop();Packet.serialize(c,b);var d=c.getBuffer();ProtocolParser.writeBytes(a,d,c.getPosition());d=c.getPosition();PooledObjects.memoryStreamPool.push(c);return d};
Packet.deserializeLengthDelimited=function(a,b){var c=ProtocolParser.readUInt32(a),d=c;for(c+=a.getPosition();;){if(a.getPosition()>=c)if(a.getPosition()==c)break;else return console.log("WARNING: Read past max limit"),0;var e=a.readByte();if(-1==e)return console.log("WARNING: End of stream"),0;var f=!1;8==e?(b.opCode=ProtocolParser.readZInt32(a),f=!0):16==e?(b.sequenceNumber=ProtocolParser.readUInt64(a),f=!0):24==e?(b.requestId=ProtocolParser.readUInt64(a),f=!0):40==e?(b.sender=ProtocolParser.readUInt64(a),
f=!0):48==e?(b.reliable=ProtocolParser.readBool(a),f=!0):114==e?(null==b.data?b.data=RTData.readRTData(a,b.data):RTData.readRTData(a,b.data),f=!0):122==e&&(b.payload=b.readPayload(a,d),f=!0);if(!f){e=ProtocolParser.readKey(e,a);if(0==e.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),0;ProtocolParser.skipKey(a,e)}}return d};var PooledObjects={};PooledObjects.packetPool=new ObjectPool(function(){return new Packet},function(a){a.reset()},5);PooledObjects.memoryStreamPool=new ObjectPool(function(){return new Stream},function(a){a.setPosition(0)},5);PooledObjects.positionStreamPool={};PooledObjects.limitedPositionStreamPool=new ObjectPool(function(){return new LimitedPositionStream},null,5);PooledObjects.byteBufferPool=new ObjectPool(function(){for(var a=[],b=0;256>b;b++)a.push(0);return a},null,5);
PooledObjects.customRequestPool=new ObjectPool(function(){return new CustomRequest},function(a){a.reset()},5);var RTDataSerializer={};RTDataSerializer.cache=new ObjectPool(function(){return new RTData},function(a){for(var b=0;b<a.data.length;b++)a.data[b].data_val&&a.data[b].data_val.dispose(),a.data[b].reset()},5);RTDataSerializer.get=function(){return RTDataSerializer.cache.pop()};
RTDataSerializer.readRTData=function(a,b){null==b&&(b=RTDataSerializer.cache.pop());var c=ProtocolParser.readUInt32(a);for(c+=a.getPosition();;){if(a.getPosition()>=c)if(a.getPosition()==c)break;else return console.log("WARNING: Read past max limit"),null;var d=a.readByte();if(-1==d)break;d=ProtocolParser.readKey(d,a);d.wireType==Wire.VARINT?b.data[d.field]=RTVal.newLong(ProtocolParser.readZInt64(a)):d.wireType==Wire.FIXED32?b.data[d.field]=RTVal.newFloat(ProtocolParser.readSingle(a)):d.wireType==
Wire.FIXED64?b.data[d.field]=RTVal.newDouble(ProtocolParser.readDouble(a)):d.wireType==Wire.LENGTH_DELIMITED&&(b.data[d.field]=RTVal.deserializeLengthDelimited(a));if(0==d.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),null}return b};
RTDataSerializer.writeRTData=function(a,b){for(var c=PooledObjects.memoryStreamPool.pop(),d=1;d<b.data.length;d++){var e=b.data[d];if(null!=e.long_val)ProtocolParser.writeUInt32(c,d<<3),ProtocolParser.writeZInt64(c,e.long_val);else if(null!=e.float_val)ProtocolParser.writeUInt32(c,d<<3|5),ProtocolParser.writeSingle(c,e.float_val);else if(null!=e.double_val)ProtocolParser.writeUInt32(c,d<<3|1),ProtocolParser.writeDouble(c,e.double_val);else if(e.data_val||e.string_val||e.vec_val)ProtocolParser.writeUInt32(c,
d<<3|2),e.serializeLengthDelimited(c)}d=c.getBuffer();ProtocolParser.writeBytes(a,d,c.getPosition());PooledObjects.memoryStreamPool.push(c)};var RTVector=function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.w=d};RTVector.prototype={};var RTVal=function(){this.vec_val=this.string_val=this.data_val=this.double_val=this.float_val=this.long_val=null};
RTVal.prototype={serializeLengthDelimited:function(a){var b=PooledObjects.memoryStreamPool.pop();if(this.string_val)b.writeByte(10),ProtocolParser.writeString(b,this.string_val);else if(this.data_val)b.writeByte(114),RTData.writeRTData(b,this.data_val);else if(this.vec_val){var c=this.vec_val,d=0;b.writeByte(18);null!=c.x&&(d+=1);null!=c.y&&(d+=1);null!=c.z&&(d+=1);null!=c.w&&(d+=1);ProtocolParser.writeUInt32(b,4*d);for(var e=1;e<=d;e++)1==e?ProtocolParser.writeSingle(b,c.x):2==e?ProtocolParser.writeSingle(b,
c.y):3==e?ProtocolParser.writeSingle(b,c.z):4==e&&ProtocolParser.writeSingle(b,c.w)}c=b.getBuffer();ProtocolParser.writeBytes(a,c,b.getPosition());PooledObjects.memoryStreamPool.push(b)},reset:function(){this.data_val&&this.data_val.dispose();this.vec_val=this.string_val=this.data_val=this.double_val=this.float_val=this.long_val=null},dirty:function(){return null!=this.long_val||null!=this.float_val||null!=this.double_val||this.data_val||this.string_val||this.vec_val?!0:!1},asString:function(){if(null!=
this.long_val)return this.long_val.toString();if(null!=this.float_val)return this.float_val.toString();if(null!=this.double_val)return this.double_val.toString();if(this.data_val)return this.data_val.toString();if(this.string_val)return'"'+this.string_val+'"';if(this.vec_val){var a="|";null!=this.vec_val.x&&(a=a+this.vec_val.x.toString()+"|");null!=this.vec_val.y&&(a=a+this.vec_val.y.toString()+"|");null!=this.vec_val.z&&(a=a+this.vec_val.z.toString()+"|");null!=this.vec_val.w&&(a=a+this.vec_val.w.toString()+
"|");return a}return null}};RTVal.newLong=function(a){var b=new RTVal;b.long_val=a;return b};RTVal.newFloat=function(a){var b=new RTVal;b.float_val=a;return b};RTVal.newDouble=function(a){var b=new RTVal;b.double_val=a;return b};RTVal.newRTData=function(a){var b=new RTVal;b.data_val=a;return b};RTVal.newString=function(a){var b=new RTVal;b.string_val=a;return b};RTVal.newRTVector=function(a){var b=new RTVal;b.vec_val=a;return b};
RTVal.deserializeLengthDelimited=function(a){var b=new RTVal,c=ProtocolParser.readUInt32(a);for(c+=a.getPosition();;){if(a.getPosition()>=c)if(a.getPosition()==c)break;else return console.log("WARNING: Read past max limit"),0;var d=a.readByte();if(-1==d)return console.log("WARNING: End of stream"),0;var e=!1;if(10==d)b.string_val=ProtocolParser.readString(a),e=!0;else if(18==d){e=ProtocolParser.readUInt32(a);e+=a.getPosition();for(var f=new RTVector,g=0;a.getPosition()<e;){var h=ProtocolParser.readSingle(a);
0==g?f.x=h:1==g?f.y=h:2==g?f.z=h:3==g&&(f.w=h);g+=1}b.vec_val=f;if(a.getPosition()!=e)return console.log("WARNING: Read too many bytes in packed data"),null;e=!0}else 114==d&&(null==b.data_val&&(b.data_val=RTDataSerializer.cache.pop()),RTData.readRTData(a,b.data_val),e=!0);if(!e){d=ProtocolParser.readKey(d,a);if(0==d.field)return console.log("WARNING: Invalid field id: 0, something went wrong in the stream"),null;ProtocolParser.skipKey(a,d)}}return b};var RTData=function(){this.data=[];for(var a=0;a<GameSparksRT.MAX_RTDATA_SLOTS;a++)this.data.push(new RTVal)};window.RTData=RTData;RTData.get=function(){return RTDataSerializer.cache.pop()};RTData.readRTData=function(a,b){return RTDataSerializer.readRTData(a,b)};RTData.writeRTData=function(a,b){RTDataSerializer.writeRTData(a,b)};
RTData.prototype={dispose:function(){for(var a=0;a<this.data.length;a++)this.data[a].dirty()&&(this.data[a]=new RTVal);RTDataSerializer.cache.push(this)},getRTVector:function(a){return this.data[a].vec_val},getLong:function(a){return this.data[a].long_val},getFloat:function(a){return this.data[a].float_val},getDouble:function(a){return this.data[a].double_val},getString:function(a){return this.data[a].string_val},getData:function(a){return this.data[a].data_val},setRTVector:function(a,b){this.data[a]=
RTVal.newRTVector(b);return this},setLong:function(a,b){this.data[a]=RTVal.newLong(b);return this},setFloat:function(a,b){this.data[a]=RTVal.newFloat(b);return this},setDouble:function(a,b){this.data[a]=RTVal.newDouble(b);return this},setString:function(a,b){this.data[a]=RTVal.newString(b);return this},setData:function(a,b){this.data[a]=RTVal.newRTData(b);return this},toString:function(){return this.asString()},asString:function(){for(var a=" {",b=0;b<GameSparksRT.MAX_RTDATA_SLOTS;b++){var c=this.data[b].asString();
null!=c&&(a=a+" ["+b.toString()+" "+c+"] ")}return a+"} "}};var RTPacket=function(a,b,c,d,e,f){this.opCode=a;this.sender=b;this.stream=c;this.streamLength=d;this.data=e;this.packetSize=f};RTPacket.prototype={toString:function(){var a="OpCode="+this.opCode+",Sender="+this.sender+",streamExists=";a=null!=this.stream?a+"true,StreamLength="+this.streamLength:a+"false";a+=",Data=";return a=null!=this.data?a+this.data.toString():a+".PacketSize="+this.packetSize}};var RTSessionImpl=function(a,b,c,d){this.connectToken=a;this.fastPort=this.tcpPort=c;this.hostName=b;this.activePeers=[];this.ready=this.running=!1;this.actionQueue=[];this.connectState=GameSparksRT.connectState.DISCONNECTED;this.mustConnnectBy=(new Date).getTime();this.reliableConnection=null;this.sequenceNumber=0;this.peerId=null;this.peerMaxSequenceNumbers=[];this.listener=d};
RTSessionImpl.prototype={start:function(){this.running=!0},stop:function(){this.log("IRTSession",GameSparksRT.logLevel.DEBUG,"Stopped");this.ready=this.running=!1;this.reliableConnection&&this.reliableConnection.stop();this.setConnectState(GameSparksRT.connectState.DISCONNECTED)},update:function(){this.running&&this.checkConnection();for(var a;;)if(a=this.getNextAction())a.execute();else break},getNextAction:function(){return 0<this.actionQueue.length?this.actionQueue.shift():null},submitAction:function(a){this.actionQueue.push(a)},
checkConnection:function(){this.connectState==GameSparksRT.connectState.DISCONNECTED?(this.log("IRTSession",GameSparksRT.logLevel.INFO,"Disconnected, trying to connect"),this.setConnectState(GameSparksRT.connectState.CONNECTING),this.connectReliable()):this.connectState==GameSparksRT.connectState.CONNECTING&&(new Date).getTime()>this.mustConnnectBy&&(this.setConnectState(GameSparksRT.connectState.DISCONNECTED),this.log("IRTSession",GameSparksRT.logLevel.INFO,"Not connected in time, retrying"),this.reliableConnection&&
(this.reliableConnection.stopInternal(),this.reliableConnection=null))},setConnectState:function(a){if(a==GameSparksRT.connectState.RELIABLE_AND_FAST_SEND||a==GameSparksRT.connectState.RELIABLE_AND_FAST)a=GameSparksRT.connectState.RELIABLE_ONLY;if(a!=this.connectState){if(this.connectState<a||a==GameSparksRT.connectState.DISCONNECTED)this.log("IRTSession",GameSparksRT.logLevel.DEBUG,"State Change : from "+this.connectState+" to "+a+", ActivePeers "+this.activePeers.length),this.connectState=a;if(a==
GameSparksRT.connectState.RELIABLE_ONLY)this.onReady(!0)}},connectFast:function(){},connectReliable:function(){this.mustConnnectBy=(new Date).getTime()+1E3*GameSparksRT.TCP_CONNECT_TIMEOUT_SECONDS;this.reliableConnection=new ReliableConnection(this.hostName,this.tcpPort,this);this.reliableConnection.connect()},nextSequenceNumber:function(){var a=this.sequenceNumber;this.sequenceNumber+=1;return a},shouldExecute:function(a,b){if(null==b)return!0;null==this.peerMaxSequenceNumbers[a]&&(this.peerMaxSequenceNumbers[a]=
0);if(this.peerMaxSequenceNumbers[a]>b)return this.log("IRTSession",GameSparksRT.logLevel.DEBUG,"Discarding sequence id "+b+" from peer "+a.toString()),!1;this.peerMaxSequenceNumbers[a]=b;return!0},resetSequenceForPeer:function(a){this.peerMaxSequenceNumbers[a]&&(this.peerMaxSequenceNumbers[a]=0)},onPlayerConnect:function(a){this.resetSequenceForPeer(a);if(this.listener&&this.ready)this.listener.onPlayerConnect(a)},onPlayerDisconnect:function(a){if(this.listener&&this.ready)this.listener.onPlayerDisconnect(a)},
onReady:function(a){if(!this.ready&&a&&(this.sendData(OpCodes.PLAYER_READY_MESSAGE,GameSparksRT.deliveryIntent.RELIABLE,null,null),this.peerId)){var b=!1,c;for(c in this.activePeers)if(this.activePeers[c]==this.peerId){b=!0;break}b||this.activePeers.push(this.peerId)}(this.ready=a)||this.setConnectState(GameSparksRT.connectState.DISCONNECTED);if(this.listener){var d=this.listener;this.submitAction(ActionCommand.pool.pop().configure(function(){d.onReady(a)}))}},onPacket:function(a){if(this.listener)this.listener.onPacket(a);
else throw Error("AccessViolationException");},sendData:function(a,b,c,d,e){return this.sendRTDataAndBytes(a,b,c,d,e)},sendRTData:function(a,b,c,d){return this.sendRTDataAndBytes(a,b,null,c,d)},sendBytes:function(a,b,c,d){return this.sendRTDataAndBytes(a,b,c,null,d)},sendRTDataAndBytes:function(a,b,c,d,e){var f=PooledObjects.customRequestPool.pop();f.configure(a,b,c,d,e);if(this.connectState>=GameSparksRT.connectState.RELIABLE_ONLY)return a=this.reliableConnection.send(f),PooledObjects.customRequestPool.push(f),
a;PooledObjects.customRequestPool.push(f);return 0},log:function(a,b,c){GameSparksRT.shouldLog(a,b)&&this.submitAction(LogCommand.pool.pop().configure(this,a,b,c))}};(function(a,b){window.GameSparksRT=b()})(this,function(a,b){var c=function(){};c.MAX_RTDATA_SLOTS=128;c.TCP_CONNECT_TIMEOUT_SECONDS=5;c.logLevel={};c.logLevel.DEBUG=0;c.logLevel.INFO=1;c.logLevel.WARN=2;c.logLevel.ERROR=3;c.connectState={};c.connectState.DISCONNECTED=0;c.connectState.CONNECTING=1;c.connectState.RELIABLE_ONLY=
2;c.connectState.RELIABLE_AND_FAST_SEND=3;c.connectState.RELIABLE_AND_FAST=4;c.deliveryIntent={};c.deliveryIntent.RELIABLE=0;c.deliveryIntent.UNRELIABLE=1;c.deliveryIntent.UNRELIABLE_SEQUENCED=2;c.currLogLevel=c.logLevel.INFO;c.tagLevels={};c.logger=function(a){console.log(a)};c.getSession=function(a,b,c,g){return new RTSessionImpl(a,b,c,g)};c.setRootLogLevel=function(a){c.currLogLevel=a};c.setLogLevel=function(a,b){c.tagLevels[a]=b};c.shouldLog=function(a,b){for(var d in c.tagLevels){var e=c.tagLevels[d];
if(d==a)return e>=b}return c.currLogLevel<=b};c.prototype={};return c});