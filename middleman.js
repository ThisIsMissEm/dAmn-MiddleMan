/***
 *
 *  MiddleMan
 *
 ***
 *
 *  $Revision$
 *  $Author$
 *  $Date$
 *
***/

//with(unsafeWindow){  //(This returned an error for me anyway, so I commented out for now. Apparently unsafeWindow does not exist?)

// Intro
(function(){

/*===================================================*
 *                                                   *
 *    MiddleMan                                     *
 *                                                   *
**==================================================*/

var MiddleMan = window.MiddleMan = {
    loaded: false,
    debug: false,
    _title: {},
    _topic: {},
    init: function(){
		this.updateMethods();
		this.loaded = true;

		this.appendInlineStyles(  ".dockrocker_MM .popup2_MM{ display:none; width: auto; height: auto; right: 0px; } "
								+ ".dockrocker_MM:hover .popup2_MM{ display:block; }"
								+ ".dockrocker_MM .popup2_MM .f{ text-indent: 0px; padding: 2px 18px; }"
								+ ".dockrocker_MM .popup2_MM .f:hover{ cursor: pointer; background-color: #AFC81C; color: #2D3733 !important; }");
	},

   	extend: function(){
        var source = arguments[0] || {};
        var target = arguments[1] || this;

        for (var property in source){
            target[property] = source[property];
        }
        return target;
    },
    errorMsg:function(ex,fn,args){
   		if(this.debug){
   			alert("MiddleMan Error occurred: "+fn+"("+uneval(args)+")\n"+ex);
   		}
   	},
	insertBefore: function(newElement,main){
		main = (typeof main == "string")?document.getElementById(main):main;
		if (main) {
			main.parentNode.insertBefore(newElement, main);
		}
	},
    objForEach: function(obj,func,arg){
   		for (var o in obj) {
			if (typeof(obj[o]) == "object") {
				func(obj[o],o,arg);
			}
		}
   	},
    // KEEP!!!
    each: function( object, callback, args ) {
		var name, i = 0, length = object.length;

		if ( args ) {
			if ( length == undefined ) {
				for ( name in object ){
					if ( callback.apply( object[ name ], args ) === false )
						break;
					continue;}
			} else
				for ( ; i < length; ){
					if ( callback.apply( object[ i++ ], args ) === false )
						break;
					continue;}

		// A special, fast, case for the most common use of each
		} else {
			if ( length == undefined ) {
				for ( name in object ){
					if ( callback.call( object[ name ], name, object[ name ] ) === false )
						break;
					continue;}
			} else
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ){ continue; }
		}

		return object;
	},



	appendScript: function(elementId, scriptUrl){
    	var scriptObj 	= document.createElement('script');
    	scriptObj.id 	= elementId;
		scriptObj.src 	= scriptUrl;
		document.getElementsByTagName('head')[0].appendChild(scriptObj);
		return scriptObj;
    },
    appendStylesheet: function(elementId, cssUrl){
    	var cssObj 	= document.createElement('link');
		cssObj.href = cssUrl;
		cssObj.id 	= elementId;
		cssObj.rel 	= "stylesheet";
		cssObj.type = "text/css";
		document.getElementsByTagName('head')[0].appendChild(cssObj);
		return cssObj;
    },
    appendInlineStyles: function(styles){
    	cssObj = document.getElementById('MiddleManStyles');
    	if(!cssObj){
			var cssObj 	= document.createElement('style');
			cssObj.id 	= "MiddleManStyles";
			cssObj.type = "text/css";
			document.getElementsByTagName('head')[0].appendChild(cssObj);
			cssObj 		= document.getElementById('MiddleManStyles');
		}
		cssObj.innerHTML += " "+styles;
		return cssObj;
    },
    removeElement: function(elementRef){
    	if("string" == typeof elementRef) elementRef = document.getElementById(elementRef);
    	if(!elementRef) return false;
		try{ elementRef.parentNode.removeChild(elementRef); }catch(ex){ this.errorMsg(ex,"MiddleMan.removeElement",elementRef); }
    },


    argsToString: function(args){
    	return uneval(args);
    },



    Event: {
	  events: {
		// storage var.
	  },
	  trigger: function(klass, name, arg){
		if(this.events[klass]){
		  if(this.events[klass][name]){
			for(var i in this.events[klass][name]){
			  arg = this.events[klass][name][i](arg);
			}
		  }
		}
	  },
	  bind: function(klass, event, name, fn){
		if(!this.events[klass]){
			this.events[klass] = {};
		}
		if(!this.events[klass][event]){
			this.events[klass][event] = {};
		}
		if(!this.events[klass][event][name]){
			this.events[klass][event][name] = fn;
		}
	  },
	  unbind: function(klass, event, name){
		if(this.events[klass]){
		  if(this.events[klass][event]){
			if(this.events[klass][event][name]){
			  delete this.events[klass][event][name];
			}
			if(this.events[klass][event].length == 0){
			  delete this.events[klass][event];
			}
			if(this.events[klass].length == 0){
			  delete this.events[klass];
			}
		  }
		}
	  },
	  change: function(klass, event, name, fn){
		if(this.events[klass] && this.events[klass][event] && this.events[klass][event][name]){
		  this.events[klass][event][name] = fn;
		}else{
		  this.bind(klass, event, name, fn);
		}
	  }

	},

   	Commands:{
   		commands: {},
   		bind: function(cmd, params, fn){
 			params = params ? 1 : 0;
   			cmd = cmd.toLowerCase();

   			this.commands[cmd] = [params,fn];

            MiddleMan.objForEach(dAmnChats, function(chatObj,chatName,arg){
                var params = arg[0];
                var cmd = arg[1];
                chatObj.channels.main.input.cmds[cmd] = [params,'MiddleMan'];
            }, [params,cmd]);
   		},
   		unbind: function(cmd){
   			cmd = cmd.toLowerCase();
   			if(cmd in this.commands){
   				delete this.commands[cmd];

   				MiddleMan.objForEach(dAmnChats, function(chatObj,chatName,cmd){
						delete chatObj.channels.main.input.cmds[cmd];
				}, cmd);
   			}
   		},
   		trigger: function(cmd, args){
   			cmd = cmd.toLowerCase();
   			if(cmd in this.commands){
   				this.commands[cmd][1](args);
   			}
   		},
        change: function(cmd, fn, params){
            if(this.commands[cmd]){
                this.commands[cmd] = [params, fn];
            }else{
                this.bind(cmd, fn, params);
            }
        },
   		forDAmn: function(cmd){
   			var takesParams = this.commands[cmd][0];
   			return [takesParams,"MiddleMan"];
   		}
   	},

    getChannel: function(channel){
    	channel = this.getChannelNs(channel);
    	return dAmnChats[channel];
    },
    getChannelNs: function(channel){
    	if(!channel) return dAmnChatTab_active;
    	var ns = channel.replace("chat:","");
    		ns = ns.replace("#","");
    	return "chat:"+ns;
    },
    getChannelTitle: function(channel){
    	channel = MiddleMan.getChannelNs(channel);
    	if(channel in MiddleMan._title)
    		 return MiddleMan._title[channel];
    	else return MiddleMan.getChannel().title_el.innerHTML;
    },
    getChannelTopic: function(channel){
    	channel = MiddleMan.getChannelNs(channel);
    	if(channel in MiddleMan._topic)
    		 return MiddleMan._topic[channel];
    	else return null;
    },

   	dAmnEvents: {
   		onClear: function(args){
            MiddleMan.Event.trigger("dAmnChat", "clear", '');
        },
        onClose: function(args){
            MiddleMan.Event.trigger("dAmnChat", "close", '');
        },
   		onData: function(args){
            args = MiddleMan.Event.trigger("dAmnChat", "data", args) || args;
            // Further processing:
			switch (args.cmd) {
				case 'join':
					return this.onSelf.join(args) 	|| args;
					break;
				case 'part':
					return this.onSelf.part(args) 	|| args;
					break;
				case 'kicked':
					return this.onSelf.kicked(args) || args;
					break;
				case 'property':
					return this.onProperty(args) 	|| args;
					break;
				case 'recv':
					this.onRecv(args) 				|| args;
					break;
			}
        },
        onDisconnect: function(args){
            MiddleMan.Event.trigger("dAmnChat", "disconnect", 	args);
        },
        onInit: function(args){
            MiddleMan.Event.trigger("dAmnChat", "init", 	args);
        },
        onInputter: function(args){
            MiddleMan.Event.trigger("dAmnChat", "input", 	args);
        },
        onKey: function(args){
            MiddleMan.Event.trigger("dAmnChat", "key", 		args);
        },
        onLoad: function(args){
            MiddleMan.Event.trigger("dAmnChat", "load", 	args);
        },
        onMakeText: function(args){
        	return MiddleMan.Event.trigger("dAmnChat", "maketext", args) || args;
        },
        onProperty: function(args){
            args = MiddleMan.Event.trigger("dAmnChat", "property", args) || args;
            // Further processing:
            switch (args.args.p) {
				case "members":
					return MiddleMan.Event.trigger("dAmnChat_property", "members", 	 	args)	|| args;
					break;
				case "privclasses":
					return MiddleMan.Event.trigger("dAmnChat_property", "privclasses", 	args) 	|| args;
					break;
				case "title":
					MiddleMan._title[args.param] = MiddleMan.parseMsg(args.body);
					return MiddleMan.Event.trigger("dAmnChat_property", "title", 		args)	|| args;
					break;
				case "topic":
					MiddleMan._topic[args.param] = MiddleMan.parseMsg(args.body);
					return MiddleMan.Event.trigger("dAmnChat_property", "topic", 		args)	|| args;
					break;
				default:
                    return args;
			}
        },
        onRecv: function(args){
            args = MiddleMan.Event.trigger("dAmnChat", "recv", args) || args;
            // Further processing:
            var rp = dAmn_ParsePacket(args.body);
			switch (rp.cmd) {
				case "action":
					MiddleMan.Event.trigger("dAmnChat_recv", 	"action", 	args);
					break;
				case "msg":
					MiddleMan.Event.trigger("dAmnChat_recv", 	"msg", 		args);
					break;
				case "part":
					MiddleMan.Event.trigger("dAmnChat_recv", 	"part", 	args);
					break;
				case "kicked":
					MiddleMan.Event.trigger("dAmnChat_recv", 	"kicked", 	args);
					break;
				case "join":
					MiddleMan.Event.trigger("dAmnChat_recv", 	"join", 	args);
					break;
				case "privchg":
					MiddleMan.Event.trigger("dAmnChat_recv", 	"privchg", 	args);
					break;
			}
        },
        onResize: function(args){
            return MiddleMan.Event.trigger("dAmnChat", "resize", args) || args;
        },
        onSelf: {
            join: 	function(args){
                	return MiddleMan.Event.trigger("dAmnChat_self", "join",   args) || args;
            },
            part: 	function(args){
                	return MiddleMan.Event.trigger("dAmnChat_self", "part",   args) || args;
            },
            kicked: function(args){
                	return MiddleMan.Event.trigger("dAmnChat_self", "kicked", args) || args;
            },
            killed: function(args){
                	return MiddleMan.Event.trigger("dAmnChat_self", "killed", args) || args;
            }
        },
        onSend: function(args){
            args = MiddleMan.Event.trigger("dAmnChat", "send", args) || args;
            // Further processing:
            switch(args.cmd){
                case "action":
                    return MiddleMan.Event.trigger("dAmnChat_send", "action", 	 args) || args;
                    break;
                case "msg":
                    return MiddleMan.Event.trigger("dAmnChat_send", "msg", 		 args) || args;
                    break;
                case "npmsg":
                    return MiddleMan.Event.trigger("dAmnChat_send", "npmsg", 	 args) || args;
                    break;
                default:
                    return MiddleMan.Event.trigger("dAmnChat_send", "unhandled", args) || args;
            }
        },
        onShutdown: function(args){
            MiddleMan.Event.trigger("dAmnChat", "shutdown", '');
        },
        onTabActivate: function(args){
        	MiddleMan.Event.trigger("dAmnChat", "tabActivate", args);
        }
	},
   	dAmnSend: {
    	action: function(channel, msg){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "action","main", msg );
    	},
    	admin: function(channel, args){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "admin", "", args );
    	},
    	away: function(channel, msg){
    		// Note: Not currently enabled by dAmn
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "away", "", msg );
    	},
    	back: function(channel, msg){
    		// Note: Not currently enabled by dAmn
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "back", "", msg );
    	},
    	ban: function(channel, user){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "ban", user, "" );
    	},
    	chat: function(user){
    		// Note: Not currently enabled by dAmn
    		dAmn_Join( dAmn_format_pchat_ns(dAmn_Client_Username, user) );
    	},
    	clear: function(channel){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Clear();
    	},
    	demote: function(channel, user, privclass){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send("demote",user,privclass);
    	},
    	join: function(channel){
    		channel = MiddleMan.getChannelNs(channel);
			dAmn_Join( channel );
    	},
    	kick: function(channel, user, reason){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmn_Kick( channel, user, dAmnEscape(reason) );
    	},
    	kill: function(user, conn, reason){
    		dAmn_Kill( user, conn, reason );
    	},
    	msg: function(channel, msg){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "msg","main", msg );
    	},
    	npmsg: function(channel, msg){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "npmsg","main", msg );
    	},
    	part: function(channel){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmn_Part( channel );
    	},
    	promote: function(channel, user, privclass){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send("promote",user,privclass);
    	},
    	title: function(channel, msg){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmn_Set( channel, "title", dAmnEscape(msg) );
    	},
    	topic: function(channel, msg){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmn_Set( channel, "topic", dAmnEscape(msg) );
    	},
    	unban: function(channel, user){
    		channel = MiddleMan.getChannelNs(channel);
    		dAmnChats[channel].Send( "unban", user, "" );
    	},
    	whois: function(user){
    		dAmn_Get( "login:"+user, "info" );
    	}
    },
   	Interface: {
    	chatNotice: function(chan, str, spanClass, timeout){
    		chan 		= MiddleMan.getChannelNs(chan);
    		spanClass 	= spanClass?spanClass:"";
    		dAmn_addTimedDiv( dAmnChats[chan].channels.main.error_el, "damn-error "+spanClass, str, timeout );
    	},
    	closeDialog: function(){
    		if(Modals.stack.length>0) Modals.pop();
    	},
    	openDialog: function(_options){
            var options = MiddleMan.extend(_options, {
                classes: 	""	  ,
                width: 		"auto",
                height: 	"auto",
                autoScroll: true  ,
                innerHTML: 	""
            });

            // close existing..
    		if(Modals.stack.length>0) this.closeDialog();
            if(!options.innerHTML	) return false;

            if(typeof(options.classes) == "array"){
                options.classes = options.classes.join(" ");
            }

    		if("number" == typeof options.width)
                options.width = options.width+"px";
    		if("number" == typeof options.height)
                options.height = options.height+"px";

    		node = Tree.createFragment(
				  '<div style="width:'+options.width+';height:'+options.height+';">'
				+ '<form  class="'+options.classes+'" style="z-index:10;height:100%; width100%;padding:0px;" >'
				+ options.innerHTML
				+ '</form></div>'
			, true);

			Modals.push(node);
            return true;
    	},
    	addDockButton: function(elementId, html, pos, fn){
    		var node 	 = document.createElement('a');
    		node.id 	 = elementId;
    		node.floater = elementId;
    		node.onclick = fn;
    		node.className 	 = "dockrocker dockrocker_MM";
    		node.innerHTML 	 = html;
    		node.style.right = pos+"px";
    		node.style.textIndent = "0px";
    		node.style.paddingLeft = node.style.paddingRight = "12px";

    		document.getElementById('top-deviant').appendChild(node);
    	},
    	addMenu: function(menuId,buttonId,menuContents){
    		var buttonEl 	 = document.getElementById(buttonId);
    		var node 	 	 = document.createElement('div');
    		node.id 	 	 = menuId;
    		node.className 	 = "popup2 popup2-click-menu popup2_MM";

    		var inner		 = document.createElement('div');
    		inner.className  = "pager2 pager-dark";

    		if("object" == typeof menuContents){
				for(var i in menuContents){
					var menuLink 		= document.createElement('a');
					menuLink.innerHTML  = menuContents[i][0];
					menuLink.className  = "f";
					menuLink.onclick 	= menuContents[i][1];
					inner.appendChild(menuLink);
				}
    		}else{
    			inner.innerHTML = menuContents;
    		}

    		node.appendChild(inner);

    		if(buttonEl){
    			buttonEl.appendChild(node);
    			buttonEl.onclick = "";
    		}
    		return node;
    	},
    	setInputText: function(chan, text){
    		chan = MiddleMan.getChannelNs(chan);
    		dAmnChats[chan].channels.main.input.chatinput_el.value = text;
    	}
    },
   	parseMsg: function(msg)
    {
        // bold
			msg = msg.replace(/&b\t/g,	"<b>" );
			msg = msg.replace(/&\/b\t/g,"</b>");
        // italic
			msg = msg.replace(/&i\t/g,	"<i>" );
			msg = msg.replace(/&\/i\t/g,"</i>");
        // underline
			msg = msg.replace(/&u\t/g,	"<u>" );
			msg = msg.replace(/&\/u\t/g,"</u>");
        // strike
			msg = msg.replace(/&s\t/g,	"<s>") ;
			msg = msg.replace(/&\/s\t/g,"</s>");
        // paragraph
			msg = msg.replace(/&p\t/g,	"<p>" );
			msg = msg.replace(/&\/p\t/g,"</p>");
        // break
			msg = msg.replace(/&br\t/g,"<br/>");
        //li
			msg = msg.replace(/&li\t/g,	 "<li>" );
			msg = msg.replace(/&\/li\t/g,"</li>");
        //ul
			msg = msg.replace(/&ul\t/g,	 "<ul>" );
			msg = msg.replace(/&\/ul\t/g,"</ul>");
        //ol
			msg = msg.replace(/&ol\t/g,	 "<ol>" );
			msg = msg.replace(/&\/ol\t/g,"</ol>");
        // subscript
			msg = msg.replace(/&sub\t/g,	"<sub>" );
			msg = msg.replace(/&\/sub\t/g,	"</sub>");
        // superscript
			msg = msg.replace(/&sup\t/g,	"<sup>" );
			msg = msg.replace(/&\/sup\t/g,	"</sup>");
        // code
			msg = msg.replace(/&code\t/g,	"<code>" );
			msg = msg.replace(/&\/code\t/g, "</code>");
        // bcode
			msg = msg.replace(/&bcode\t/g,	"<bcode>" );
			msg = msg.replace(/&\/bcode\t/g,"</bcode>");
		// deviant
			msg = msg.replace(/&dev\t([^\t])\t([^\t]+)\t/g,':dev$2:');
        // link no description
			msg = msg.replace(/&link\t([^\t]+)\t&/g,'$1');
        // link with description
			msg = msg.replace(/&link\t([^\t]+)\t([^\t]+)\t&\t/g,'$1 \($2\)');
        // abbr
			msg = msg.replace(/&abbr\t([^\t]+)\t/g,'<abbr title="$1">');
			msg = msg.replace(/&\/abbr\t/g,"</abbr>");
        // acronym
			msg = msg.replace(/&acro\t([^\t]+)\t/g,'<acronym title="$1">');
			msg = msg.replace(/&\/acro\t/g,"</acronym>");
        // anchor
			msg = msg.replace(/&a\t([^\t]+)\t([^\t]*)\t/g,'<a href="$1" title="$2">');
        // avatar
			msg = msg.replace(/&avatar\t([^\t]+)\t([^\t]+)\t/g,':icon$1:');
        // img
        	msg = msg.replace(/&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t/g,'<image src="$1" />');
			msg = msg.replace(/&\/a\t/g,"</a>");
		// emote
			msg = msg.replace(/&emote\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t/g,'$1');
        // iframe
        	msg = msg.replace(/&iframe\t([^\t]+)\t([^\t]*)\t([^\t]*)\t/g,'<iframe href="$1" height="$2" width="$3" />');
        // thumbnail
			msg = msg.replace(/&thumb\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t/g,':thumb$1:');

        return msg;
    },

    updateMethods: function(){
		dAmnChat_onData_MM 	= dAmnChat_onData;
		dAmnChat_onData 	= function (pkt)
		{
			try{
                pkt = MiddleMan.dAmnEvents.onData(pkt) ? MiddleMan.dAmnEvents.onData(pkt) : pkt;
				this.onData_MM(pkt);
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChat_onData",pkt); }
		};
		dAmnChat_onClose_MM = dAmnChat_onClose;
		dAmnChat_onClose 	= function()
		{
			try{
				MiddleMan.dAmnEvents.onClose();
				this.onClose_MM();
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChat_onClose",''); }
		};
		dAmnChat_onResize_MM = dAmnChat_onResize;
		dAmnChat_onResize 	 = function(real)
		{
			try{
				var _real = MiddleMan.dAmnEvents.onResize(real);
				real=_real?_real:real;
				this.onResize_MM(real);
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChat_onResize",real); }

		};
		dAmnChat_onDisconnect_MM = dAmnChat_onDisconnect;
		dAmnChat_onDisconnect 	 = function(reason)
		{
			try{
				var _reason = MiddleMan.dAmnEvents.onDisconnect(reason);
				reason=_reason?_reason:reason;
				this.onDisconnect_MM(reason);
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChat_onDisconnect",reason); }
		};
		dAmnChat_onShutdown_MM 	= dAmnChat_onShutdown;
		dAmnChat_onShutdown 	= function()
		{
			try{
				MiddleMan.dAmnEvents.onShutdown();
				this.onShutdown_MM();
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChat_onShutdown",pkt); }
		};
		dAmnChat_Send_MM = dAmnChat_Send;
		dAmnChat_Send 	 = function(cmd, channel, str)
		{
			try{
				var args = {"cmd":cmd, "channel":channel, "str":str};
                args = MiddleMan.dAmnEvents.onSend(args);
				this.Send_MM(args.cmd, args.channel, args.str);
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChat_Send",pkt); }
		};

		dAmnChanChat.prototype.makeText_MM 	= dAmnChanChat.prototype.makeText;
		dAmnChanChat.prototype.makeText 	= function( style, from, text, hilite )
		{
			try{
				var args = {"style":style, "from":from, "text":text, "hilite":hilite};
				//	args = MiddleMan.dAmnEvents.onMakeText(this.channel.name,args);

				this.makeText_MM(args.style, args.from, args.text, args.hilite);

			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChanChat.prototype.makeText",args); }
		};

		dAmnChanChat.prototype.Clear_MM = dAmnChanChat.prototype.Clear;
		dAmnChanChat.prototype.Clear 	= function()
		{
			try{
				MiddleMan.dAmnEvents.onClear();
				this.Clear_MM();
			}catch(ex){	MiddleMan.errorMsg(ex,"dAmnChanChat.prototype.Clear",''); }
		};

		dAmnChatTabs_activate_MM = dAmnChatTabs_activate;
		dAmnChatTabs_activate 	 = function( id , real )
		{
			dAmnChatTabs_activate_MM(id, real);
			MiddleMan.dAmnEvents.onTabActivate([id, real]);
		};

		dAmnChatInput_onKey_MM 	= dAmnChatInput_onKey;
		dAmnChatInput_onKey 	= function(e,kc,force)
		{
			var dummy;
			MiddleMan.dAmnEvents.onKey(e,kc,force);

			var el = this.chatinput_el;
			if(kc != 9){
				dAmnChatTabs_activate( this.cr.ns, true );
				delete this.tablist;
				if (kc == 13 && ( force || !this.multiline || e.shiftKey || e.ctrlKey ) && el.value){
					if(e.shiftKey || (!this.multiline && e.ctrlKey)) { dummy = null; }
					else{

						var cmdre = el.value.match( /^\/([a-z]+)([\s\S]*)/m );
						if (!cmdre) { dummy = null; }
						else {
							var cmd  = cmdre[1].toLowerCase();
							var args = null;
							if (cmdre[2]) {
								var tmp = cmdre[2].match(/^\s([\s\S]*)/);
								if( tmp && tmp.length )
									args = tmp[1];
							}

							if (!this.cmds[cmd]) {  dummy = null; }
							else if( this.cmds[cmd][1] == "MiddleMan") {
								// This is needed to store the commands in memory
								if (this.history_pos != -1  && this.history[this.history_pos] == el.value) { // posting from history.. move to the end
									var before = this.history.slice(0,this.history_pos);
									var after  = this.history.slice(this.history_pos+1);
									this.history = before.concat(after).concat( this.history[this.history_pos] );
								} else {
									// add to history -- limit to 300
									this.history = this.history.concat( el.value );
									if( this.history.length > 300 )
										this.history = this.history.slice(1);
								}
								this.history_pos = -1;
								
								if( this.cmds[cmd][0]) {
									if (args)  MiddleMan.Commands.trigger(cmd,args);
								} else {
									MiddleMan.Commands.trigger(cmd,false);
								}
								el.value='';
								el.focus();
							}
						}
					}
				}

            }

			return this.onKey_MM(e,kc,force);
		};

		dAmnChanChat.prototype.Init_MM 	= dAmnChanChat.prototype.Init;
		dAmnChanChat.prototype.Init 	= function( cr, name, parent_el ){
			this.Init_MM( cr, name, parent_el );
			for(var cmd in MiddleMan.Commands.commands){
				this.input.cmds[cmd] = MiddleMan.Commands.forDAmn(cmd);
			}
            setTimeout(function(){
                MiddleMan.dAmnEvents.onInit(cr,name,parent_el);
            }, 10);
		};

		dAmnChat.prototype.Send       			= dAmnChat_Send;
		dAmnChat.prototype.onData       		= dAmnChat_onData;
		dAmnChat.prototype.onClose       		= dAmnChat_onClose;
		dAmnChat.prototype.onResize       		= dAmnChat_onResize;
		dAmnChatInput.prototype.onKey 			= dAmnChatInput_onKey;
		dAmnChat.prototype.onShutdown       	= dAmnChat_onShutdown;
		dAmnChat.prototype.onDisconnect       	= dAmnChat_onDisconnect;
		dAmnChat.prototype.Send_MM    			= dAmnChat_Send_MM;
		dAmnChat.prototype.onData_MM    		= dAmnChat_onData_MM;
		dAmnChat.prototype.onClose_MM    		= dAmnChat_onClose_MM;
		dAmnChat.prototype.onResize_MM    		= dAmnChat_onResize_MM;
		dAmnChatInput.prototype.onKey_MM 		= dAmnChatInput_onKey_MM;
		dAmnChat.prototype.onShutdown_MM    	= dAmnChat_onShutdown_MM;
		dAmnChat.prototype.onDisconnect_MM    	= dAmnChat_onDisconnect_MM;

    }
};
MiddleMan.init();

//Outro
})();

//} // End with(unsafeWindow){...}
