

function _MiddleMan(){
	this.onMMload = onMMload;
	this.Events = new Array();
	this.Channels = new Array();
	this.Interface = new MM_Interface();

	this.init();
}

function MiddleMan_init(){
	this.addEvent("data",false);
	this.addEvent("selfJoin",false);
	this.addEvent("selfPart",false);
	this.addEvent("selfKicked",false);
	this.addEvent("members",false);
	this.addEvent("privclasses",false);
	this.addEvent("message",false);
	this.addEvent("titleChange",false);
	this.addEvent("topicChange",false);
	this.addEvent("userPart",false);
	this.addEvent("userKicked",false);
	this.addEvent("userJoin",false);
	this.addEvent("userPrivChange",false);
	this.addEvent("resize",false);
	this.addEvent("close",false);
	this.addEvent("disconnect",false);
	this.addEvent("shutdown",false);
}

function MiddleMan_addEvent(eventName, preFunc){
	this.Events[eventName] = new MM_Event(eventName, preFunc);
}

function MiddleMan_updateDamn(){
	dAmn_objForEach(dAmnChats,function(chan){
		mainchan = chan.channels.main;

		for(var i in MM.Interface.Input.newCmds){
			mainchan.input.cmds[i.name] = [i.params,i.msg];
		}

		mainchan.onMsg = dAmnChanChat.prototype.onMsg;
		mainchan.onMsg_MM = dAmnChanChat.prototype.onMsg_MM;

		mainchan.input.onKey = dAmnChatInput_onKey;
		mainchan.input.onKey_MM=dAmnChatInput_onKey_MM;

		mainchan.onData = dAmnChat_onData;
		mainchan.onData_MM = dAmnChat_onData_MM;

		mainchan.Send = dAmnChat_Send;
		mainchan.Send_MM = dAmnChat_Send_MM;

		mainchan.FormatMsg = dAmnChanChat.prototype.FormatMsg;
		mainchan.FormatMsg_MM = dAmnChanChat.prototype.FormatMsg_MM;

		dAmnChatTabs_activate_active();
	});
}

function MiddleMan_includeScript(scriptUrl){
	var scriptObj = document.createElement('script');
	scriptObj.src = scriptUrl;
	document.getElementsByTagName('head')[0].appendChild(scriptObj);
	return scriptObj;
}

MiddleMan.prototype.init = MiddleMan_init;
MiddleMan.prototype.addEvent = MiddleMan_addEvent;
MiddleMan.prototype.updateDamn = MiddleMan_updateDamn;
MiddleMan.prototype.includeScript = MiddleMan_includeScript;

  //
 //   MM_Interface Class
//

function MM_Interface(){
	this.dAmn_toolbar = {};
	this.Input = new MM_Input();
}

  //
 //   MM_Input Class
//

function MM_Input(){
	this.newCmds = {};
}

function MM_Input_addCommand(commandName, takesParams, passMsg, cmdFunc){
	takesParams = takesParams?1:0;
	this.newCmds[commandName] = {name:commandName, params:takesParams, msg:passMsg, func:cmdFunc};
}

  //
 //   MM_Event Class
//

function MM_Event(eventName, preFunc){
	this.name = eventName;
	this.preFunc = preFunc?preFunc:function(params){ return params; };
	this.listeners = new Array;
	this.lid = 0;
}

function MM_Event_trigger(params){
	params = this.preFunc(params);
	try{
		for(var listener in this.listeners){
			listener(params);
		}
	}catch(e){
		// No listeners for this event
	}
}

function MM_Event_addListener(listeningFunc){
	this.lid++;
	this.listeners[this.lid] = listeningFunc;
	return this.lid;
}

function MM_Event_removeListener(lid){
	try{
		delete this.listeners[lid];
	}catch(e){
		// No listener with specified id exists
	}
}

MM_Event.prototype.trigger = MM_Event_trigger;
MM_Event.prototype.addListener = MM_Event_addListener;
MM_Event.prototype.removeListener = MM_Event_removeListener;

function xpath(query, parentEl) { // the parentEl will generally be the document element
    return document.evaluate(query, parentEl, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
} // Use the snapshotLength method to access the items in returned array





   //
  //   Alterations to existing
 //	   dAmnchat functions
//

dAmnChat_onResize_MM = dAmnChat_onResize;
dAmnChat_onResize = function ( real )
{
	MM.Events['resize'].trigger(real);
	this.dAmnChat_onResize_MM( real );
}

dAmnChat_onData_MM = dAmnChat_onData;
dAmnChat_onData = function ( pkt )
{
	MM.Events['data'].trigger(pkt);

	if (pkt.param == this.ns) {

		switch (pkt.cmd) {
			case 'join':
				if (pkt.args.e == 'ok') MM.Events['selfJoin'].trigger(pkt);
			break;
			case 'part':
				if (!pkt.args.r && pkt.args.e == 'ok'){
					MM.Events['selfPart'].trigger(pkt);
				}else{
					if (pkt.args.e == 'ok') MM.Events['selfPart'].trigger(pkt);
				}
			break;
			case 'kicked':
				MM.Events['selfKicked'].trigger(pkt);
			break;
			case 'property':
				switch (pkt.args.p) {
					case "members":
						if (this.nstype == 'chat') {
							MM.Events['members'].trigger(pkt);
						}
						break;
					case "privclasses":
						MM.Events['privclasses'].trigger(pkt);
						break;
					case "title":
						MM.Events['titleChange'].trigger(pkt);
						break;
					case "topic":
						MM.Events['topicChange'].trigger(pkt);
						break;
					default:
				}
			break;
			case 'recv':
				var rp = dAmn_ParsePacket( pkt.body );
				switch (rp.cmd) {
					case "action":
						MM.Events['message'].trigger(pkt);
						break;
					case "msg":
						MM.Events['message'].trigger(pkt);
						break;
					case "part":
						if (this.nstype == 'chat') {
							MM.Events['userPart'].trigger(pkt);
						}
						break;
					case "kicked":
						if( this.nstype == 'chat' )
							MM.Events['userKicked'].trigger(pkt);
						break;
					case "join":
						var infopkt = dAmn_ParseArgsNData(rp.body);
						if (this.nstype == 'chat') {
							MM.Events['userJoin'].trigger(pkt);
						}
						break;
					case "privchg":
						MM.Events['userPrivchange'].trigger(pkt);
						break;
				}
			break;

		}
	}

	this.dAmnChat_onData_MM( pkt );
}

dAmnChat_onClose_MM = dAmnChat_onClose;
dAmnChat_onClose = function()
{
	MM.Events['close'].trigger();
	this.dAmnChat_onClose_MM();
}

dAmnChat_onDisconnect_MM = dAmnChat_onDisconnect;
dAmnChat_onDisconnect = function(reason)
{
	MM.Events['disconnect'].trigger(reason);
	this.dAmnChat_onDisconnect_MM(reason);
}

dAmnChat_onShutdown_MM = dAmnChat_onShutdown;
dAmnChat_onShutdown = function()
{
	MM.Events['shutdown'].trigger();
	this.dAmnChat_onShutdown();
}

dAmnChat_Send_MM = dAmnChat_Send;
dAmnChat_Send = function(cmd, channel, str)
{
	MM.Events['send'].trigger(cmd, channel, str);
	this.dAmnChat_Send_MM(cmd, channel, str);
}

dAmnChat.prototype.onDisconnect = dAmnChat_onDisconnect;
dAmnChat.prototype.Send         = dAmnChat_Send;
dAmnChat.prototype.onShutdown   = dAmnChat_onShutdown;
dAmnChat.prototype.onResize     = dAmnChat_onResize;
dAmnChat.prototype.onClose      = dAmnChat_onClose;
dAmnChat.prototype.onData       = dAmnChat_onData;

dAmnChanChat.prototype.Init_MM = dAmnChanChat.prototype.Init;
dAmnChanChat.prototype.Init = function( cr, name, parent_el ){
	 this.Init_MM( cr, name, parent_el );
	 for(var i in MM.Interface.Input.newCmds){
	 	this.input.cmds[i.name] = [i.params,i.msg];
	 }
 }

dAmnChanChat.prototype.makeText_MM = dAmnChanChat.prototype.makeText;
dAmnChanChat.prototype.makeText = function( style, from, text, hilite )
{
	if(MM.Events['makeText'].trigger( style, from, text, hilite ))
		this.makeText_MM( style, from, text, hilite );
}

function dAmnChatInput_onKey(e,kc,force)
{
	var el = this.chatinput_el;
	// hit tab?
	if (kc == 9) {
		if (e.ctrlKey || e.shiftKey) {
			dAmnChatTabs_activateNext();
			return false;
		}

		if (this.tablist) {
			this.tabindex++;
			this.tabindex%=this.tablist.length;
			el.value = el.value.substr( 0, this.tabstart ) + this.tablist[this.tabindex];
		} else {
			this.tabstart   = el.value.lastIndexOf(' ') + 1;
			var tabstr      = el.value.substr( this.tabstart );
			if (tabstr.length) {
				var a;
				// create canidates
				if (tabstr.charAt(0) == '/') { // search cmds
					var trex = RegExp( '^'+tabstr.substr(1)+'\\S*', "i" );
					a = new Array();
					dAmn_objForEach(this.cmds, function(o,cmd) {
						if (-1 != cmd.search( trex )) {
							a = a.concat( '/'+cmd+' ' );
						}
					});

				} else {  // search member names
					a = this.cr.members.MatchMembers( RegExp( '^'+tabstr+'\\S*', "i" ) );
					if (0==this.tabstart) {
						var i = a.length;
						while (i--) {
							a[i]+=': ';
						}
					}
				}
				a.sort();
				if (a.length) {
					// set to the first
					el.value = el.value.substr( 0, this.tabstart ) + a[0];
					if (a.length > 1) {
						this.tablist = a;
						this.tabindex = 0;
					}
				}
			}
		}
		return false;
	}
	return dAmnChatInput_onKey_MM(e,kc,force)?true:false;
}

function dAmnChatInput_onKey(e,kc,force)
    {
        var el = this.chatinput_el;
        // hit tab?
        if (kc == 9) {
            if (e.ctrlKey || e.shiftKey) {
                dAmnChatTabs_activateNext();
                return false;
            }

            if (this.tablist) {
                this.tabindex++;
                this.tabindex%=this.tablist.length;
                el.value = el.value.substr( 0, this.tabstart ) + this.tablist[this.tabindex];
            } else {
                this.tabstart   = el.value.lastIndexOf(' ') + 1;
                var tabstr      = el.value.substr( this.tabstart );
                if (tabstr.length) {
                    var a;
                    // create canidates
                    if (tabstr.charAt(0) == '/') { // search cmds
                        var trex = RegExp( '^'+tabstr.substr(1)+'\\S*', "i" );
                        a = new Array();
                        dAmn_objForEach(this.cmds, function(o,cmd) {
                            if (-1 != cmd.search( trex )) {
                                a = a.concat( '/'+cmd+' ' );
							}
						});

                    } else {  // search member names
                        a = this.cr.members.MatchMembers( RegExp( '^'+tabstr+'\\S*', "i" ) );
                        if (0==this.tabstart) {
                            var i = a.length;
                            while (i--) {
                                a[i]+=': ';
                            }
                        }
                    }
                    a.sort();
                    if (a.length) {
                        // set to the first
                        el.value = el.value.substr( 0, this.tabstart ) + a[0];
                        if (a.length > 1) {
                            this.tablist = a;
                            this.tabindex = 0;
                        }
                    }
                }
            }
            return false;
        } else {
            if (!this.multiline) {
                this.prev_multiline_str = null;
			}

            dAmnChatTabs_activate( this.cr.ns, true );

            // didn't tab? -- clear tablist
            delete this.tablist;

            // hit up-arrow}
            if (!e.shiftKey && kc == 38 && (!this.multiline || e.ctrlKey)) {
                if (this.history.length) {
                    if (this.history_pos == -1) {
                        this.history_tmp = el.value;
                        this.history_pos = this.history.length-1;
                    } else if (this.history_pos) {
                        --this.history_pos;
                    }
                    el.value = this.history[this.history_pos];
                }
                return false;

            // hit down-arrow?
            } else if (!e.shiftKey && kc == 40 && (!this.multiline || e.ctrlKey)) {
                // do nothing if not already scrolled into history
                if( this.history_pos != -1 ){
                    ++this.history_pos;

                    if( this.history_pos == this.history.length )
                        this.history_pos = -1;

                    if( this.history_pos == -1 )
                        el.value = this.history_tmp;
                    else
                        el.value = this.history[this.history_pos];
                }
                return false;

            // hit enter
            } else if (kc == 13 && ( force || !this.multiline || e.shiftKey || e.ctrlKey )) {
                if (el.value) {

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

                    // send non-parsed
                    if (e.shiftKey || (!this.multiline && e.ctrlKey)) {
                        this.cr.Send( 'npmsg','main', el.value );
                    } else {
                        var cmdre = el.value.match( /^\/([a-z]+)([\s\S]*)/m );

                        if (!cmdre) {
                            this.cr.Send( 'msg','main', el.value );
						} else {
                            var cmd  = cmdre[1].toLowerCase();
                            var args = null;
                            if (cmdre[2]) {
                                var tmp = cmdre[2].match(/^\s([\s\S]*)/);
                                if( tmp && tmp.length )
                                    args = tmp[1];
                            }

                            if (!this.cmds[cmd]) {
                                this.cr.channels.main.onErrorEvent('unknown command', cmd );
                            } else if( this.cmds[cmd][0]) {
                                if (!args) {
                                    this.cr.channels.main.onErrorEvent( cmd, 'insufficient parameters' );
                                } else {
                                    // args required
                                    switch (cmd) {

										case 'raw':
											args = args.replace(/\\\\/g,"\0");
											args = args.replace(/\\n/g,"\n");
											args = args.replace(/\0/g,"\\");
											dAmn_Raw( dAmnEscape(args) );
											break;
										case 'note':
											var params = args.match( /^\s*(\S*)\s*$/ );
											if( params )
												window.open( this.cmds[cmd][1]+params[1] );
											else
												this.cr.channels.main.onErrorEvent( 'syntax', "/note username" );
											break;
										case 'chat':
											var params = args.match( /^\s*(\S*)\s*$/ );
											if( params )
												dAmn_Join( dAmn_format_pchat_ns(dAmn_Client_Username, params[1]) );
											else
												this.cr.channels.main.onErrorEvent( 'syntax', "/chat username" );
											break;
										case 'whois':
											var params = args.match( /^\s*(\S*)\s*$/ );
											if( params )
												dAmn_Get( 'login:'+params[1], 'info' );
											else
												this.cr.channels.main.onErrorEvent( 'syntax', "/whois username" );
											break;
										case 'join':
											var params = args.match( /^\s*(\S*)\s*$/ );
											if (params) {
												var room = params[1].match( /^#?(.*)/ );
												dAmn_Join( 'chat:'+room[1] );
											} else {
												this.cr.channels.main.onErrorEvent( 'syntax', "/join #chatroom" );
											}
											break;
										case 'topic':
										case 'title':
											dAmn_Set( this.cr.ns, cmd, dAmnEscape(args) );
											break;
										case 'me':
										case 'say':
											if( args )
												this.cr.Send( this.cmds[cmd][1],'main', args );
											else
												this.cr.Send( 'msg','main', el.value );
											break;
										case 'kick':
											var params = args.match( /^\s*(\S*)\s*(.*)$/ );
											if( params )
												dAmn_Kick( this.cr.ns, params[1], dAmnEscape(params[2]) );
											else
												this.cr.channels.main.onErrorEvent( 'syntax', "/kick username reason" );
											break;
										case 'kill':
											var params = args.match( /^\s*([^ \t:]+):([0-9]+)\s*(.*)$/ );
											if (params) {
												dAmn_Kill( params[1], params[2], params[3] );
											} else {
												params = args.match( /^\s*([^\s:]+)\s*(.*)$/ );
												if (params) {
													dAmn_Kill( params[1], null, dAmnEscape(params[2]) );
												} else {
													this.cr.channels.main.onErrorEvent( 'syntax', "/kill username reason" );
												}
											}
											break;
										case 'ban':
										case 'unban':
											var params = args.match( /^\s*(\S*)\s*$/ );
											if (params) {
												this.cr.Send( this.cmds[cmd][1], params[1], '' );
											} else {
												this.cr.channels.main.onErrorEvent( 'syntax', "/"+cmd+" username" );
											}
											break;
										case 'admin':
											this.cr.Send( 'admin', '', args );
											break;
                                    }
                                }
                            } else {
                                switch (cmd) {
									case 'help':
										window.open( this.cmds[cmd][1] );
										break;
									case 'list':
										dAmn_newRoomClick();
										break;
									case 'clear':
										this.channel.Clear();
										break;
									case 'away':
									case 'back':
										this.cr.Send( this.cmds[cmd][1],'', args );
										break;
									case 'part':
										if (args) {
											var params = args.match( /^\s*(\S*)\s*$/ );
											if (params) {
												var room = params[1].match( /^#?(.*)/ );
												dAmn_Part( 'chat:'+room[1] );
											} else {
												this.cr.channels.main.onErrorEvent( 'syntax', "/part #chatroom" );
											}
										} else {
											dAmn_Part( this.cr.ns );
										}
										break;
									case 'promote':
									case 'demote':
										if (args) {
											var params = args.match( /^\s*(\S*)\s*(\S*)\s*$/ );
											if (params) {
												this.cr.Send( this.cmds[cmd][1], params[1], params[2] );
											} else {
												this.cr.channels.main.onErrorEvent( 'syntax', "/"+cmd+" username privilegeclass" );
											}
										} else {
											this.cr.Send( this.cmds[cmd][1], dAmn_Client_Username, '' );
										}
										break;
                                }
                            }
                        }
                    }
                    el.value='';
                    el.focus();
                }
                return false;
            }
        }

        return true; // default action
    }

    function dAmnChatInput_setFocus(doactivate)
    {
        if( doactivate )
            dAmnChatTabs_activate( this.cr.ns, true );
        this.chatinput_el.focus();
        dAmn_cursorToEnd(this.chatinput_el);
    }

    function dAmnChatInput_appendText(str)
    {
        this.chatinput_el.value+=str;
    }

    dAmnChatInput.prototype.onKey       = dAmnChatInput_onKey;
    dAmnChatInput.prototype.setFocus    = dAmnChatInput_setFocus;
    dAmnChatInput.prototype.SetElement  = dAmnChat_SetElement;
    dAmnChatInput.prototype.toggleInput = dAmnChatInput_toggleInput;
    dAmnChatInput.prototype.appendText  = dAmnChatInput_appendText;
