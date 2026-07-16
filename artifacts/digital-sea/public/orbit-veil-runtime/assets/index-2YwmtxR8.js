(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const u of c.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&s(u)}).observe(document,{childList:!0,subtree:!0});function n(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(o){if(o.ep)return;o.ep=!0;const c=n(o);fetch(o.href,c)}})();var bd={exports:{}},_l={};var Rv;function xb(){if(Rv)return _l;Rv=1;var a=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function n(s,o,c){var u=null;if(c!==void 0&&(u=""+c),o.key!==void 0&&(u=""+o.key),"key"in o){c={};for(var h in o)h!=="key"&&(c[h]=o[h])}else c=o;return o=c.ref,{$$typeof:a,type:s,key:u,ref:o!==void 0?o:null,props:c}}return _l.Fragment=t,_l.jsx=n,_l.jsxs=n,_l}var Cv;function yb(){return Cv||(Cv=1,bd.exports=xb()),bd.exports}var St=yb(),Ed={exports:{}},Me={};var wv;function Sb(){if(wv)return Me;wv=1;var a=Symbol.for("react.transitional.element"),t=Symbol.for("react.portal"),n=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),c=Symbol.for("react.consumer"),u=Symbol.for("react.context"),h=Symbol.for("react.forward_ref"),m=Symbol.for("react.suspense"),d=Symbol.for("react.memo"),g=Symbol.for("react.lazy"),v=Symbol.for("react.activity"),_=Symbol.iterator;function S(F){return F===null||typeof F!="object"?null:(F=_&&F[_]||F["@@iterator"],typeof F=="function"?F:null)}var b={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},R=Object.assign,x={};function y(F,q,vt){this.props=F,this.context=q,this.refs=x,this.updater=vt||b}y.prototype.isReactComponent={},y.prototype.setState=function(F,q){if(typeof F!="object"&&typeof F!="function"&&F!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,F,q,"setState")},y.prototype.forceUpdate=function(F){this.updater.enqueueForceUpdate(this,F,"forceUpdate")};function P(){}P.prototype=y.prototype;function z(F,q,vt){this.props=F,this.context=q,this.refs=x,this.updater=vt||b}var C=z.prototype=new P;C.constructor=z,R(C,y.prototype),C.isPureReactComponent=!0;var L=Array.isArray;function D(){}var B={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function N(F,q,vt){var Ct=vt.ref;return{$$typeof:a,type:F,key:q,ref:Ct!==void 0?Ct:null,props:vt}}function G(F,q){return N(F.type,q,F.props)}function H(F){return typeof F=="object"&&F!==null&&F.$$typeof===a}function W(F){var q={"=":"=0",":":"=2"};return"$"+F.replace(/[=:]/g,function(vt){return q[vt]})}var lt=/\/+/g;function ct(F,q){return typeof F=="object"&&F!==null&&F.key!=null?W(""+F.key):q.toString(36)}function J(F){switch(F.status){case"fulfilled":return F.value;case"rejected":throw F.reason;default:switch(typeof F.status=="string"?F.then(D,D):(F.status="pending",F.then(function(q){F.status==="pending"&&(F.status="fulfilled",F.value=q)},function(q){F.status==="pending"&&(F.status="rejected",F.reason=q)})),F.status){case"fulfilled":return F.value;case"rejected":throw F.reason}}throw F}function I(F,q,vt,Ct,Mt){var K=typeof F;(K==="undefined"||K==="boolean")&&(F=null);var yt=!1;if(F===null)yt=!0;else switch(K){case"bigint":case"string":case"number":yt=!0;break;case"object":switch(F.$$typeof){case a:case t:yt=!0;break;case g:return yt=F._init,I(yt(F._payload),q,vt,Ct,Mt)}}if(yt)return Mt=Mt(F),yt=Ct===""?"."+ct(F,0):Ct,L(Mt)?(vt="",yt!=null&&(vt=yt.replace(lt,"$&/")+"/"),I(Mt,q,vt,"",function(Dt){return Dt})):Mt!=null&&(H(Mt)&&(Mt=G(Mt,vt+(Mt.key==null||F&&F.key===Mt.key?"":(""+Mt.key).replace(lt,"$&/")+"/")+yt)),q.push(Mt)),1;yt=0;var xt=Ct===""?".":Ct+":";if(L(F))for(var Et=0;Et<F.length;Et++)Ct=F[Et],K=xt+ct(Ct,Et),yt+=I(Ct,q,vt,K,Mt);else if(Et=S(F),typeof Et=="function")for(F=Et.call(F),Et=0;!(Ct=F.next()).done;)Ct=Ct.value,K=xt+ct(Ct,Et++),yt+=I(Ct,q,vt,K,Mt);else if(K==="object"){if(typeof F.then=="function")return I(J(F),q,vt,Ct,Mt);throw q=String(F),Error("Objects are not valid as a React child (found: "+(q==="[object Object]"?"object with keys {"+Object.keys(F).join(", ")+"}":q)+"). If you meant to render a collection of children, use an array instead.")}return yt}function V(F,q,vt){if(F==null)return F;var Ct=[],Mt=0;return I(F,Ct,"","",function(K){return q.call(vt,K,Mt++)}),Ct}function $(F){if(F._status===-1){var q=F._result;q=q(),q.then(function(vt){(F._status===0||F._status===-1)&&(F._status=1,F._result=vt)},function(vt){(F._status===0||F._status===-1)&&(F._status=2,F._result=vt)}),F._status===-1&&(F._status=0,F._result=q)}if(F._status===1)return F._result.default;throw F._result}var ft=typeof reportError=="function"?reportError:function(F){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var q=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof F=="object"&&F!==null&&typeof F.message=="string"?String(F.message):String(F),error:F});if(!window.dispatchEvent(q))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",F);return}console.error(F)},bt={map:V,forEach:function(F,q,vt){V(F,function(){q.apply(this,arguments)},vt)},count:function(F){var q=0;return V(F,function(){q++}),q},toArray:function(F){return V(F,function(q){return q})||[]},only:function(F){if(!H(F))throw Error("React.Children.only expected to receive a single React element child.");return F}};return Me.Activity=v,Me.Children=bt,Me.Component=y,Me.Fragment=n,Me.Profiler=o,Me.PureComponent=z,Me.StrictMode=s,Me.Suspense=m,Me.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=B,Me.__COMPILER_RUNTIME={__proto__:null,c:function(F){return B.H.useMemoCache(F)}},Me.cache=function(F){return function(){return F.apply(null,arguments)}},Me.cacheSignal=function(){return null},Me.cloneElement=function(F,q,vt){if(F==null)throw Error("The argument must be a React element, but you passed "+F+".");var Ct=R({},F.props),Mt=F.key;if(q!=null)for(K in q.key!==void 0&&(Mt=""+q.key),q)!T.call(q,K)||K==="key"||K==="__self"||K==="__source"||K==="ref"&&q.ref===void 0||(Ct[K]=q[K]);var K=arguments.length-2;if(K===1)Ct.children=vt;else if(1<K){for(var yt=Array(K),xt=0;xt<K;xt++)yt[xt]=arguments[xt+2];Ct.children=yt}return N(F.type,Mt,Ct)},Me.createContext=function(F){return F={$$typeof:u,_currentValue:F,_currentValue2:F,_threadCount:0,Provider:null,Consumer:null},F.Provider=F,F.Consumer={$$typeof:c,_context:F},F},Me.createElement=function(F,q,vt){var Ct,Mt={},K=null;if(q!=null)for(Ct in q.key!==void 0&&(K=""+q.key),q)T.call(q,Ct)&&Ct!=="key"&&Ct!=="__self"&&Ct!=="__source"&&(Mt[Ct]=q[Ct]);var yt=arguments.length-2;if(yt===1)Mt.children=vt;else if(1<yt){for(var xt=Array(yt),Et=0;Et<yt;Et++)xt[Et]=arguments[Et+2];Mt.children=xt}if(F&&F.defaultProps)for(Ct in yt=F.defaultProps,yt)Mt[Ct]===void 0&&(Mt[Ct]=yt[Ct]);return N(F,K,Mt)},Me.createRef=function(){return{current:null}},Me.forwardRef=function(F){return{$$typeof:h,render:F}},Me.isValidElement=H,Me.lazy=function(F){return{$$typeof:g,_payload:{_status:-1,_result:F},_init:$}},Me.memo=function(F,q){return{$$typeof:d,type:F,compare:q===void 0?null:q}},Me.startTransition=function(F){var q=B.T,vt={};B.T=vt;try{var Ct=F(),Mt=B.S;Mt!==null&&Mt(vt,Ct),typeof Ct=="object"&&Ct!==null&&typeof Ct.then=="function"&&Ct.then(D,ft)}catch(K){ft(K)}finally{q!==null&&vt.types!==null&&(q.types=vt.types),B.T=q}},Me.unstable_useCacheRefresh=function(){return B.H.useCacheRefresh()},Me.use=function(F){return B.H.use(F)},Me.useActionState=function(F,q,vt){return B.H.useActionState(F,q,vt)},Me.useCallback=function(F,q){return B.H.useCallback(F,q)},Me.useContext=function(F){return B.H.useContext(F)},Me.useDebugValue=function(){},Me.useDeferredValue=function(F,q){return B.H.useDeferredValue(F,q)},Me.useEffect=function(F,q){return B.H.useEffect(F,q)},Me.useEffectEvent=function(F){return B.H.useEffectEvent(F)},Me.useId=function(){return B.H.useId()},Me.useImperativeHandle=function(F,q,vt){return B.H.useImperativeHandle(F,q,vt)},Me.useInsertionEffect=function(F,q){return B.H.useInsertionEffect(F,q)},Me.useLayoutEffect=function(F,q){return B.H.useLayoutEffect(F,q)},Me.useMemo=function(F,q){return B.H.useMemo(F,q)},Me.useOptimistic=function(F,q){return B.H.useOptimistic(F,q)},Me.useReducer=function(F,q,vt){return B.H.useReducer(F,q,vt)},Me.useRef=function(F){return B.H.useRef(F)},Me.useState=function(F){return B.H.useState(F)},Me.useSyncExternalStore=function(F,q,vt){return B.H.useSyncExternalStore(F,q,vt)},Me.useTransition=function(){return B.H.useTransition()},Me.version="19.2.3",Me}var Dv;function dm(){return Dv||(Dv=1,Ed.exports=Sb()),Ed.exports}var Z=dm(),Td={exports:{}},vl={},Ad={exports:{}},Rd={};var Uv;function Mb(){return Uv||(Uv=1,(function(a){function t(I,V){var $=I.length;I.push(V);t:for(;0<$;){var ft=$-1>>>1,bt=I[ft];if(0<o(bt,V))I[ft]=V,I[$]=bt,$=ft;else break t}}function n(I){return I.length===0?null:I[0]}function s(I){if(I.length===0)return null;var V=I[0],$=I.pop();if($!==V){I[0]=$;t:for(var ft=0,bt=I.length,F=bt>>>1;ft<F;){var q=2*(ft+1)-1,vt=I[q],Ct=q+1,Mt=I[Ct];if(0>o(vt,$))Ct<bt&&0>o(Mt,vt)?(I[ft]=Mt,I[Ct]=$,ft=Ct):(I[ft]=vt,I[q]=$,ft=q);else if(Ct<bt&&0>o(Mt,$))I[ft]=Mt,I[Ct]=$,ft=Ct;else break t}}return V}function o(I,V){var $=I.sortIndex-V.sortIndex;return $!==0?$:I.id-V.id}if(a.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var c=performance;a.unstable_now=function(){return c.now()}}else{var u=Date,h=u.now();a.unstable_now=function(){return u.now()-h}}var m=[],d=[],g=1,v=null,_=3,S=!1,b=!1,R=!1,x=!1,y=typeof setTimeout=="function"?setTimeout:null,P=typeof clearTimeout=="function"?clearTimeout:null,z=typeof setImmediate<"u"?setImmediate:null;function C(I){for(var V=n(d);V!==null;){if(V.callback===null)s(d);else if(V.startTime<=I)s(d),V.sortIndex=V.expirationTime,t(m,V);else break;V=n(d)}}function L(I){if(R=!1,C(I),!b)if(n(m)!==null)b=!0,D||(D=!0,W());else{var V=n(d);V!==null&&J(L,V.startTime-I)}}var D=!1,B=-1,T=5,N=-1;function G(){return x?!0:!(a.unstable_now()-N<T)}function H(){if(x=!1,D){var I=a.unstable_now();N=I;var V=!0;try{t:{b=!1,R&&(R=!1,P(B),B=-1),S=!0;var $=_;try{e:{for(C(I),v=n(m);v!==null&&!(v.expirationTime>I&&G());){var ft=v.callback;if(typeof ft=="function"){v.callback=null,_=v.priorityLevel;var bt=ft(v.expirationTime<=I);if(I=a.unstable_now(),typeof bt=="function"){v.callback=bt,C(I),V=!0;break e}v===n(m)&&s(m),C(I)}else s(m);v=n(m)}if(v!==null)V=!0;else{var F=n(d);F!==null&&J(L,F.startTime-I),V=!1}}break t}finally{v=null,_=$,S=!1}V=void 0}}finally{V?W():D=!1}}}var W;if(typeof z=="function")W=function(){z(H)};else if(typeof MessageChannel<"u"){var lt=new MessageChannel,ct=lt.port2;lt.port1.onmessage=H,W=function(){ct.postMessage(null)}}else W=function(){y(H,0)};function J(I,V){B=y(function(){I(a.unstable_now())},V)}a.unstable_IdlePriority=5,a.unstable_ImmediatePriority=1,a.unstable_LowPriority=4,a.unstable_NormalPriority=3,a.unstable_Profiling=null,a.unstable_UserBlockingPriority=2,a.unstable_cancelCallback=function(I){I.callback=null},a.unstable_forceFrameRate=function(I){0>I||125<I?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):T=0<I?Math.floor(1e3/I):5},a.unstable_getCurrentPriorityLevel=function(){return _},a.unstable_next=function(I){switch(_){case 1:case 2:case 3:var V=3;break;default:V=_}var $=_;_=V;try{return I()}finally{_=$}},a.unstable_requestPaint=function(){x=!0},a.unstable_runWithPriority=function(I,V){switch(I){case 1:case 2:case 3:case 4:case 5:break;default:I=3}var $=_;_=I;try{return V()}finally{_=$}},a.unstable_scheduleCallback=function(I,V,$){var ft=a.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?ft+$:ft):$=ft,I){case 1:var bt=-1;break;case 2:bt=250;break;case 5:bt=1073741823;break;case 4:bt=1e4;break;default:bt=5e3}return bt=$+bt,I={id:g++,callback:V,priorityLevel:I,startTime:$,expirationTime:bt,sortIndex:-1},$>ft?(I.sortIndex=$,t(d,I),n(m)===null&&I===n(d)&&(R?(P(B),B=-1):R=!0,J(L,$-ft))):(I.sortIndex=bt,t(m,I),b||S||(b=!0,D||(D=!0,W()))),I},a.unstable_shouldYield=G,a.unstable_wrapCallback=function(I){var V=_;return function(){var $=_;_=V;try{return I.apply(this,arguments)}finally{_=$}}}})(Rd)),Rd}var Lv;function bb(){return Lv||(Lv=1,Ad.exports=Mb()),Ad.exports}var Cd={exports:{}},Qn={};var Nv;function Eb(){if(Nv)return Qn;Nv=1;var a=dm();function t(m){var d="https://react.dev/errors/"+m;if(1<arguments.length){d+="?args[]="+encodeURIComponent(arguments[1]);for(var g=2;g<arguments.length;g++)d+="&args[]="+encodeURIComponent(arguments[g])}return"Minified React error #"+m+"; visit "+d+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function n(){}var s={d:{f:n,r:function(){throw Error(t(522))},D:n,C:n,L:n,m:n,X:n,S:n,M:n},p:0,findDOMNode:null},o=Symbol.for("react.portal");function c(m,d,g){var v=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:o,key:v==null?null:""+v,children:m,containerInfo:d,implementation:g}}var u=a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function h(m,d){if(m==="font")return"";if(typeof d=="string")return d==="use-credentials"?d:""}return Qn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=s,Qn.createPortal=function(m,d){var g=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!d||d.nodeType!==1&&d.nodeType!==9&&d.nodeType!==11)throw Error(t(299));return c(m,d,null,g)},Qn.flushSync=function(m){var d=u.T,g=s.p;try{if(u.T=null,s.p=2,m)return m()}finally{u.T=d,s.p=g,s.d.f()}},Qn.preconnect=function(m,d){typeof m=="string"&&(d?(d=d.crossOrigin,d=typeof d=="string"?d==="use-credentials"?d:"":void 0):d=null,s.d.C(m,d))},Qn.prefetchDNS=function(m){typeof m=="string"&&s.d.D(m)},Qn.preinit=function(m,d){if(typeof m=="string"&&d&&typeof d.as=="string"){var g=d.as,v=h(g,d.crossOrigin),_=typeof d.integrity=="string"?d.integrity:void 0,S=typeof d.fetchPriority=="string"?d.fetchPriority:void 0;g==="style"?s.d.S(m,typeof d.precedence=="string"?d.precedence:void 0,{crossOrigin:v,integrity:_,fetchPriority:S}):g==="script"&&s.d.X(m,{crossOrigin:v,integrity:_,fetchPriority:S,nonce:typeof d.nonce=="string"?d.nonce:void 0})}},Qn.preinitModule=function(m,d){if(typeof m=="string")if(typeof d=="object"&&d!==null){if(d.as==null||d.as==="script"){var g=h(d.as,d.crossOrigin);s.d.M(m,{crossOrigin:g,integrity:typeof d.integrity=="string"?d.integrity:void 0,nonce:typeof d.nonce=="string"?d.nonce:void 0})}}else d==null&&s.d.M(m)},Qn.preload=function(m,d){if(typeof m=="string"&&typeof d=="object"&&d!==null&&typeof d.as=="string"){var g=d.as,v=h(g,d.crossOrigin);s.d.L(m,g,{crossOrigin:v,integrity:typeof d.integrity=="string"?d.integrity:void 0,nonce:typeof d.nonce=="string"?d.nonce:void 0,type:typeof d.type=="string"?d.type:void 0,fetchPriority:typeof d.fetchPriority=="string"?d.fetchPriority:void 0,referrerPolicy:typeof d.referrerPolicy=="string"?d.referrerPolicy:void 0,imageSrcSet:typeof d.imageSrcSet=="string"?d.imageSrcSet:void 0,imageSizes:typeof d.imageSizes=="string"?d.imageSizes:void 0,media:typeof d.media=="string"?d.media:void 0})}},Qn.preloadModule=function(m,d){if(typeof m=="string")if(d){var g=h(d.as,d.crossOrigin);s.d.m(m,{as:typeof d.as=="string"&&d.as!=="script"?d.as:void 0,crossOrigin:g,integrity:typeof d.integrity=="string"?d.integrity:void 0})}else s.d.m(m)},Qn.requestFormReset=function(m){s.d.r(m)},Qn.unstable_batchedUpdates=function(m,d){return m(d)},Qn.useFormState=function(m,d,g){return u.H.useFormState(m,d,g)},Qn.useFormStatus=function(){return u.H.useHostTransitionStatus()},Qn.version="19.2.3",Qn}var Pv;function Tb(){if(Pv)return Cd.exports;Pv=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(t){console.error(t)}}return a(),Cd.exports=Eb(),Cd.exports}var Ov;function Ab(){if(Ov)return vl;Ov=1;var a=bb(),t=dm(),n=Tb();function s(e){var i="https://react.dev/errors/"+e;if(1<arguments.length){i+="?args[]="+encodeURIComponent(arguments[1]);for(var r=2;r<arguments.length;r++)i+="&args[]="+encodeURIComponent(arguments[r])}return"Minified React error #"+e+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function o(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function c(e){var i=e,r=e;if(e.alternate)for(;i.return;)i=i.return;else{e=i;do i=e,(i.flags&4098)!==0&&(r=i.return),e=i.return;while(e)}return i.tag===3?r:null}function u(e){if(e.tag===13){var i=e.memoizedState;if(i===null&&(e=e.alternate,e!==null&&(i=e.memoizedState)),i!==null)return i.dehydrated}return null}function h(e){if(e.tag===31){var i=e.memoizedState;if(i===null&&(e=e.alternate,e!==null&&(i=e.memoizedState)),i!==null)return i.dehydrated}return null}function m(e){if(c(e)!==e)throw Error(s(188))}function d(e){var i=e.alternate;if(!i){if(i=c(e),i===null)throw Error(s(188));return i!==e?null:e}for(var r=e,l=i;;){var f=r.return;if(f===null)break;var p=f.alternate;if(p===null){if(l=f.return,l!==null){r=l;continue}break}if(f.child===p.child){for(p=f.child;p;){if(p===r)return m(f),e;if(p===l)return m(f),i;p=p.sibling}throw Error(s(188))}if(r.return!==l.return)r=f,l=p;else{for(var M=!1,U=f.child;U;){if(U===r){M=!0,r=f,l=p;break}if(U===l){M=!0,l=f,r=p;break}U=U.sibling}if(!M){for(U=p.child;U;){if(U===r){M=!0,r=p,l=f;break}if(U===l){M=!0,l=p,r=f;break}U=U.sibling}if(!M)throw Error(s(189))}}if(r.alternate!==l)throw Error(s(190))}if(r.tag!==3)throw Error(s(188));return r.stateNode.current===r?e:i}function g(e){var i=e.tag;if(i===5||i===26||i===27||i===6)return e;for(e=e.child;e!==null;){if(i=g(e),i!==null)return i;e=e.sibling}return null}var v=Object.assign,_=Symbol.for("react.element"),S=Symbol.for("react.transitional.element"),b=Symbol.for("react.portal"),R=Symbol.for("react.fragment"),x=Symbol.for("react.strict_mode"),y=Symbol.for("react.profiler"),P=Symbol.for("react.consumer"),z=Symbol.for("react.context"),C=Symbol.for("react.forward_ref"),L=Symbol.for("react.suspense"),D=Symbol.for("react.suspense_list"),B=Symbol.for("react.memo"),T=Symbol.for("react.lazy"),N=Symbol.for("react.activity"),G=Symbol.for("react.memo_cache_sentinel"),H=Symbol.iterator;function W(e){return e===null||typeof e!="object"?null:(e=H&&e[H]||e["@@iterator"],typeof e=="function"?e:null)}var lt=Symbol.for("react.client.reference");function ct(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===lt?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case R:return"Fragment";case y:return"Profiler";case x:return"StrictMode";case L:return"Suspense";case D:return"SuspenseList";case N:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case b:return"Portal";case z:return e.displayName||"Context";case P:return(e._context.displayName||"Context")+".Consumer";case C:var i=e.render;return e=e.displayName,e||(e=i.displayName||i.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case B:return i=e.displayName||null,i!==null?i:ct(e.type)||"Memo";case T:i=e._payload,e=e._init;try{return ct(e(i))}catch{}}return null}var J=Array.isArray,I=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,V=n.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,$={pending:!1,data:null,method:null,action:null},ft=[],bt=-1;function F(e){return{current:e}}function q(e){0>bt||(e.current=ft[bt],ft[bt]=null,bt--)}function vt(e,i){bt++,ft[bt]=e.current,e.current=i}var Ct=F(null),Mt=F(null),K=F(null),yt=F(null);function xt(e,i){switch(vt(K,i),vt(Mt,e),vt(Ct,null),i.nodeType){case 9:case 11:e=(e=i.documentElement)&&(e=e.namespaceURI)?j_(e):0;break;default:if(e=i.tagName,i=i.namespaceURI)i=j_(i),e=Q_(i,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}q(Ct),vt(Ct,e)}function Et(){q(Ct),q(Mt),q(K)}function Dt(e){e.memoizedState!==null&&vt(yt,e);var i=Ct.current,r=Q_(i,e.type);i!==r&&(vt(Mt,e),vt(Ct,r))}function Ut(e){Mt.current===e&&(q(Ct),q(Mt)),yt.current===e&&(q(yt),dl._currentValue=$)}var Yt,It;function Ht(e){if(Yt===void 0)try{throw Error()}catch(r){var i=r.stack.trim().match(/\n( *(at )?)/);Yt=i&&i[1]||"",It=-1<r.stack.indexOf(`
    at`)?" (<anonymous>)":-1<r.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Yt+e+It}var Wt=!1;function ae(e,i){if(!e||Wt)return"";Wt=!0;var r=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var l={DetermineComponentFrameRoot:function(){try{if(i){var wt=function(){throw Error()};if(Object.defineProperty(wt.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(wt,[])}catch(_t){var dt=_t}Reflect.construct(e,[],wt)}else{try{wt.call()}catch(_t){dt=_t}e.call(wt.prototype)}}else{try{throw Error()}catch(_t){dt=_t}(wt=e())&&typeof wt.catch=="function"&&wt.catch(function(){})}}catch(_t){if(_t&&dt&&typeof _t.stack=="string")return[_t.stack,dt.stack]}return[null,null]}};l.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var f=Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot,"name");f&&f.configurable&&Object.defineProperty(l.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var p=l.DetermineComponentFrameRoot(),M=p[0],U=p[1];if(M&&U){var k=M.split(`
`),ot=U.split(`
`);for(f=l=0;l<k.length&&!k[l].includes("DetermineComponentFrameRoot");)l++;for(;f<ot.length&&!ot[f].includes("DetermineComponentFrameRoot");)f++;if(l===k.length||f===ot.length)for(l=k.length-1,f=ot.length-1;1<=l&&0<=f&&k[l]!==ot[f];)f--;for(;1<=l&&0<=f;l--,f--)if(k[l]!==ot[f]){if(l!==1||f!==1)do if(l--,f--,0>f||k[l]!==ot[f]){var Tt=`
`+k[l].replace(" at new "," at ");return e.displayName&&Tt.includes("<anonymous>")&&(Tt=Tt.replace("<anonymous>",e.displayName)),Tt}while(1<=l&&0<=f);break}}}finally{Wt=!1,Error.prepareStackTrace=r}return(r=e?e.displayName||e.name:"")?Ht(r):""}function oe(e,i){switch(e.tag){case 26:case 27:case 5:return Ht(e.type);case 16:return Ht("Lazy");case 13:return e.child!==i&&i!==null?Ht("Suspense Fallback"):Ht("Suspense");case 19:return Ht("SuspenseList");case 0:case 15:return ae(e.type,!1);case 11:return ae(e.type.render,!1);case 1:return ae(e.type,!0);case 31:return Ht("Activity");default:return""}}function ce(e){try{var i="",r=null;do i+=oe(e,r),r=e,e=e.return;while(e);return i}catch(l){return`
Error generating stack: `+l.message+`
`+l.stack}}var me=Object.prototype.hasOwnProperty,ee=a.unstable_scheduleCallback,le=a.unstable_cancelCallback,_e=a.unstable_shouldYield,X=a.unstable_requestPaint,fe=a.unstable_now,de=a.unstable_getCurrentPriorityLevel,O=a.unstable_ImmediatePriority,E=a.unstable_UserBlockingPriority,Q=a.unstable_NormalPriority,it=a.unstable_LowPriority,mt=a.unstable_IdlePriority,Lt=a.log,A=a.unstable_setDisableYieldValue,ht=null,pt=null;function Ot(e){if(typeof Lt=="function"&&A(e),pt&&typeof pt.setStrictMode=="function")try{pt.setStrictMode(ht,e)}catch{}}var Bt=Math.clz32?Math.clz32:ne,Ft=Math.log,Nt=Math.LN2;function ne(e){return e>>>=0,e===0?32:31-(Ft(e)/Nt|0)|0}var Jt=256,ie=262144,Y=4194304;function Pt(e){var i=e&42;if(i!==0)return i;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function gt(e,i,r){var l=e.pendingLanes;if(l===0)return 0;var f=0,p=e.suspendedLanes,M=e.pingedLanes;e=e.warmLanes;var U=l&134217727;return U!==0?(l=U&~p,l!==0?f=Pt(l):(M&=U,M!==0?f=Pt(M):r||(r=U&~e,r!==0&&(f=Pt(r))))):(U=l&~p,U!==0?f=Pt(U):M!==0?f=Pt(M):r||(r=l&~e,r!==0&&(f=Pt(r)))),f===0?0:i!==0&&i!==f&&(i&p)===0&&(p=f&-f,r=i&-i,p>=r||p===32&&(r&4194048)!==0)?i:f}function zt(e,i){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&i)===0}function Gt(e,i){switch(e){case 1:case 2:case 4:case 8:case 64:return i+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function At(){var e=Y;return Y<<=1,(Y&62914560)===0&&(Y=4194304),e}function qt(e){for(var i=[],r=0;31>r;r++)i.push(e);return i}function Vt(e,i){e.pendingLanes|=i,i!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function te(e,i,r,l,f,p){var M=e.pendingLanes;e.pendingLanes=r,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=r,e.entangledLanes&=r,e.errorRecoveryDisabledLanes&=r,e.shellSuspendCounter=0;var U=e.entanglements,k=e.expirationTimes,ot=e.hiddenUpdates;for(r=M&~r;0<r;){var Tt=31-Bt(r),wt=1<<Tt;U[Tt]=0,k[Tt]=-1;var dt=ot[Tt];if(dt!==null)for(ot[Tt]=null,Tt=0;Tt<dt.length;Tt++){var _t=dt[Tt];_t!==null&&(_t.lane&=-536870913)}r&=~wt}l!==0&&ye(e,l,0),p!==0&&f===0&&e.tag!==0&&(e.suspendedLanes|=p&~(M&~i))}function ye(e,i,r){e.pendingLanes|=i,e.suspendedLanes&=~i;var l=31-Bt(i);e.entangledLanes|=i,e.entanglements[l]=e.entanglements[l]|1073741824|r&261930}function Ze(e,i){var r=e.entangledLanes|=i;for(e=e.entanglements;r;){var l=31-Bt(r),f=1<<l;f&i|e[l]&i&&(e[l]|=i),r&=~f}}function _n(e,i){var r=i&-i;return r=(r&42)!==0?1:Ne(r),(r&(e.suspendedLanes|i))!==0?0:r}function Ne(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Ki(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Li(){var e=V.p;return e!==0?e:(e=window.event,e===void 0?32:yv(e.type))}function Ni(e,i){var r=V.p;try{return V.p=e,i()}finally{V.p=r}}var jn=Math.random().toString(36).slice(2),Ke="__reactFiber$"+jn,$e="__reactProps$"+jn,Ie="__reactContainer$"+jn,Rn="__reactEvents$"+jn,ji="__reactListeners$"+jn,Qi="__reactHandles$"+jn,dn="__reactResources$"+jn,un="__reactMarker$"+jn;function ke(e){delete e[Ke],delete e[$e],delete e[Rn],delete e[ji],delete e[Qi]}function kn(e){var i=e[Ke];if(i)return i;for(var r=e.parentNode;r;){if(i=r[Ie]||r[Ke]){if(r=i.alternate,i.child!==null||r!==null&&r.child!==null)for(e=av(e);e!==null;){if(r=e[Ke])return r;e=av(e)}return i}e=r,r=e.parentNode}return null}function vi(e){if(e=e[Ke]||e[Ie]){var i=e.tag;if(i===5||i===6||i===13||i===31||i===26||i===27||i===3)return e}return null}function Ji(e){var i=e.tag;if(i===5||i===26||i===27||i===6)return e.stateNode;throw Error(s(33))}function Pi(e){var i=e[dn];return i||(i=e[dn]={hoistableStyles:new Map,hoistableScripts:new Map}),i}function pn(e){e[un]=!0}var ca=new Set,w={};function tt(e,i){ut(e,i),ut(e+"Capture",i)}function ut(e,i){for(w[e]=i,e=0;e<i.length;e++)ca.add(i[e])}var at=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),st={},Xt={};function Qt(e){return me.call(Xt,e)?!0:me.call(st,e)?!1:at.test(e)?Xt[e]=!0:(st[e]=!0,!1)}function kt(e,i,r){if(Qt(i))if(r===null)e.removeAttribute(i);else{switch(typeof r){case"undefined":case"function":case"symbol":e.removeAttribute(i);return;case"boolean":var l=i.toLowerCase().slice(0,5);if(l!=="data-"&&l!=="aria-"){e.removeAttribute(i);return}}e.setAttribute(i,""+r)}}function $t(e,i,r){if(r===null)e.removeAttribute(i);else{switch(typeof r){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(i);return}e.setAttribute(i,""+r)}}function Kt(e,i,r,l){if(l===null)e.removeAttribute(r);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(r);return}e.setAttributeNS(i,r,""+l)}}function pe(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Se(e){var i=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function re(e,i,r){var l=Object.getOwnPropertyDescriptor(e.constructor.prototype,i);if(!e.hasOwnProperty(i)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var f=l.get,p=l.set;return Object.defineProperty(e,i,{configurable:!0,get:function(){return f.call(this)},set:function(M){r=""+M,p.call(this,M)}}),Object.defineProperty(e,i,{enumerable:l.enumerable}),{getValue:function(){return r},setValue:function(M){r=""+M},stopTracking:function(){e._valueTracker=null,delete e[i]}}}}function we(e){if(!e._valueTracker){var i=Se(e)?"checked":"value";e._valueTracker=re(e,i,""+e[i])}}function je(e){if(!e)return!1;var i=e._valueTracker;if(!i)return!0;var r=i.getValue(),l="";return e&&(l=Se(e)?e.checked?"true":"false":e.value),e=l,e!==r?(i.setValue(e),!0):!1}function Xe(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var He=/[\n"\\]/g;function We(e){return e.replace(He,function(i){return"\\"+i.charCodeAt(0).toString(16)+" "})}function jt(e,i,r,l,f,p,M,U){e.name="",M!=null&&typeof M!="function"&&typeof M!="symbol"&&typeof M!="boolean"?e.type=M:e.removeAttribute("type"),i!=null?M==="number"?(i===0&&e.value===""||e.value!=i)&&(e.value=""+pe(i)):e.value!==""+pe(i)&&(e.value=""+pe(i)):M!=="submit"&&M!=="reset"||e.removeAttribute("value"),i!=null?Re(e,M,pe(i)):r!=null?Re(e,M,pe(r)):l!=null&&e.removeAttribute("value"),f==null&&p!=null&&(e.defaultChecked=!!p),f!=null&&(e.checked=f&&typeof f!="function"&&typeof f!="symbol"),U!=null&&typeof U!="function"&&typeof U!="symbol"&&typeof U!="boolean"?e.name=""+pe(U):e.removeAttribute("name")}function Hn(e,i,r,l,f,p,M,U){if(p!=null&&typeof p!="function"&&typeof p!="symbol"&&typeof p!="boolean"&&(e.type=p),i!=null||r!=null){if(!(p!=="submit"&&p!=="reset"||i!=null)){we(e);return}r=r!=null?""+pe(r):"",i=i!=null?""+pe(i):r,U||i===e.value||(e.value=i),e.defaultValue=i}l=l??f,l=typeof l!="function"&&typeof l!="symbol"&&!!l,e.checked=U?e.checked:!!l,e.defaultChecked=!!l,M!=null&&typeof M!="function"&&typeof M!="symbol"&&typeof M!="boolean"&&(e.name=M),we(e)}function Re(e,i,r){i==="number"&&Xe(e.ownerDocument)===e||e.defaultValue===""+r||(e.defaultValue=""+r)}function En(e,i,r,l){if(e=e.options,i){i={};for(var f=0;f<r.length;f++)i["$"+r[f]]=!0;for(r=0;r<e.length;r++)f=i.hasOwnProperty("$"+e[r].value),e[r].selected!==f&&(e[r].selected=f),f&&l&&(e[r].defaultSelected=!0)}else{for(r=""+pe(r),i=null,f=0;f<e.length;f++){if(e[f].value===r){e[f].selected=!0,l&&(e[f].defaultSelected=!0);return}i!==null||e[f].disabled||(i=e[f])}i!==null&&(i.selected=!0)}}function ni(e,i,r){if(i!=null&&(i=""+pe(i),i!==e.value&&(e.value=i),r==null)){e.defaultValue!==i&&(e.defaultValue=i);return}e.defaultValue=r!=null?""+pe(r):""}function xi(e,i,r,l){if(i==null){if(l!=null){if(r!=null)throw Error(s(92));if(J(l)){if(1<l.length)throw Error(s(93));l=l[0]}r=l}r==null&&(r=""),i=r}r=pe(i),e.defaultValue=r,l=e.textContent,l===r&&l!==""&&l!==null&&(e.value=l),we(e)}function ii(e,i){if(i){var r=e.firstChild;if(r&&r===e.lastChild&&r.nodeType===3){r.nodeValue=i;return}}e.textContent=i}var qe=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function mn(e,i,r){var l=i.indexOf("--")===0;r==null||typeof r=="boolean"||r===""?l?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="":l?e.setProperty(i,r):typeof r!="number"||r===0||qe.has(i)?i==="float"?e.cssFloat=r:e[i]=(""+r).trim():e[i]=r+"px"}function $i(e,i,r){if(i!=null&&typeof i!="object")throw Error(s(62));if(e=e.style,r!=null){for(var l in r)!r.hasOwnProperty(l)||i!=null&&i.hasOwnProperty(l)||(l.indexOf("--")===0?e.setProperty(l,""):l==="float"?e.cssFloat="":e[l]="");for(var f in i)l=i[f],i.hasOwnProperty(f)&&r[f]!==l&&mn(e,f,l)}else for(var p in i)i.hasOwnProperty(p)&&mn(e,p,i[p])}function Qe(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ua=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),es=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Gs(e){return es.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Ta(){}var yf=null;function Sf(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var vr=null,xr=null;function Km(e){var i=vi(e);if(i&&(e=i.stateNode)){var r=e[$e]||null;t:switch(e=i.stateNode,i.type){case"input":if(jt(e,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name),i=r.name,r.type==="radio"&&i!=null){for(r=e;r.parentNode;)r=r.parentNode;for(r=r.querySelectorAll('input[name="'+We(""+i)+'"][type="radio"]'),i=0;i<r.length;i++){var l=r[i];if(l!==e&&l.form===e.form){var f=l[$e]||null;if(!f)throw Error(s(90));jt(l,f.value,f.defaultValue,f.defaultValue,f.checked,f.defaultChecked,f.type,f.name)}}for(i=0;i<r.length;i++)l=r[i],l.form===e.form&&je(l)}break t;case"textarea":ni(e,r.value,r.defaultValue);break t;case"select":i=r.value,i!=null&&En(e,!!r.multiple,i,!1)}}}var Mf=!1;function jm(e,i,r){if(Mf)return e(i,r);Mf=!0;try{var l=e(i);return l}finally{if(Mf=!1,(vr!==null||xr!==null)&&(Pc(),vr&&(i=vr,e=xr,xr=vr=null,Km(i),e)))for(i=0;i<e.length;i++)Km(e[i])}}function Do(e,i){var r=e.stateNode;if(r===null)return null;var l=r[$e]||null;if(l===null)return null;r=l[i];t:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(e=e.type,l=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!l;break t;default:e=!1}if(e)return null;if(r&&typeof r!="function")throw Error(s(231,i,typeof r));return r}var Aa=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),bf=!1;if(Aa)try{var Uo={};Object.defineProperty(Uo,"passive",{get:function(){bf=!0}}),window.addEventListener("test",Uo,Uo),window.removeEventListener("test",Uo,Uo)}catch{bf=!1}var ns=null,Ef=null,Zl=null;function Qm(){if(Zl)return Zl;var e,i=Ef,r=i.length,l,f="value"in ns?ns.value:ns.textContent,p=f.length;for(e=0;e<r&&i[e]===f[e];e++);var M=r-e;for(l=1;l<=M&&i[r-l]===f[p-l];l++);return Zl=f.slice(e,1<l?1-l:void 0)}function Kl(e){var i=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&i===13&&(e=13)):e=i,e===10&&(e=13),32<=e||e===13?e:0}function jl(){return!0}function Jm(){return!1}function ui(e){function i(r,l,f,p,M){this._reactName=r,this._targetInst=f,this.type=l,this.nativeEvent=p,this.target=M,this.currentTarget=null;for(var U in e)e.hasOwnProperty(U)&&(r=e[U],this[U]=r?r(p):p[U]);return this.isDefaultPrevented=(p.defaultPrevented!=null?p.defaultPrevented:p.returnValue===!1)?jl:Jm,this.isPropagationStopped=Jm,this}return v(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var r=this.nativeEvent;r&&(r.preventDefault?r.preventDefault():typeof r.returnValue!="unknown"&&(r.returnValue=!1),this.isDefaultPrevented=jl)},stopPropagation:function(){var r=this.nativeEvent;r&&(r.stopPropagation?r.stopPropagation():typeof r.cancelBubble!="unknown"&&(r.cancelBubble=!0),this.isPropagationStopped=jl)},persist:function(){},isPersistent:jl}),i}var Vs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ql=ui(Vs),Lo=v({},Vs,{view:0,detail:0}),_S=ui(Lo),Tf,Af,No,Jl=v({},Lo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Cf,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==No&&(No&&e.type==="mousemove"?(Tf=e.screenX-No.screenX,Af=e.screenY-No.screenY):Af=Tf=0,No=e),Tf)},movementY:function(e){return"movementY"in e?e.movementY:Af}}),$m=ui(Jl),vS=v({},Jl,{dataTransfer:0}),xS=ui(vS),yS=v({},Lo,{relatedTarget:0}),Rf=ui(yS),SS=v({},Vs,{animationName:0,elapsedTime:0,pseudoElement:0}),MS=ui(SS),bS=v({},Vs,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),ES=ui(bS),TS=v({},Vs,{data:0}),t0=ui(TS),AS={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},RS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},CS={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function wS(e){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(e):(e=CS[e])?!!i[e]:!1}function Cf(){return wS}var DS=v({},Lo,{key:function(e){if(e.key){var i=AS[e.key]||e.key;if(i!=="Unidentified")return i}return e.type==="keypress"?(e=Kl(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?RS[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Cf,charCode:function(e){return e.type==="keypress"?Kl(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Kl(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),US=ui(DS),LS=v({},Jl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),e0=ui(LS),NS=v({},Lo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Cf}),PS=ui(NS),OS=v({},Vs,{propertyName:0,elapsedTime:0,pseudoElement:0}),zS=ui(OS),FS=v({},Jl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),IS=ui(FS),BS=v({},Vs,{newState:0,oldState:0}),HS=ui(BS),GS=[9,13,27,32],wf=Aa&&"CompositionEvent"in window,Po=null;Aa&&"documentMode"in document&&(Po=document.documentMode);var VS=Aa&&"TextEvent"in window&&!Po,n0=Aa&&(!wf||Po&&8<Po&&11>=Po),i0=" ",a0=!1;function s0(e,i){switch(e){case"keyup":return GS.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function r0(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var yr=!1;function kS(e,i){switch(e){case"compositionend":return r0(i);case"keypress":return i.which!==32?null:(a0=!0,i0);case"textInput":return e=i.data,e===i0&&a0?null:e;default:return null}}function XS(e,i){if(yr)return e==="compositionend"||!wf&&s0(e,i)?(e=Qm(),Zl=Ef=ns=null,yr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return n0&&i.locale!=="ko"?null:i.data;default:return null}}var WS={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function o0(e){var i=e&&e.nodeName&&e.nodeName.toLowerCase();return i==="input"?!!WS[e.type]:i==="textarea"}function l0(e,i,r,l){vr?xr?xr.push(l):xr=[l]:vr=l,i=Gc(i,"onChange"),0<i.length&&(r=new Ql("onChange","change",null,r,l),e.push({event:r,listeners:i}))}var Oo=null,zo=null;function qS(e){X_(e,0)}function $l(e){var i=Ji(e);if(je(i))return e}function c0(e,i){if(e==="change")return i}var u0=!1;if(Aa){var Df;if(Aa){var Uf="oninput"in document;if(!Uf){var f0=document.createElement("div");f0.setAttribute("oninput","return;"),Uf=typeof f0.oninput=="function"}Df=Uf}else Df=!1;u0=Df&&(!document.documentMode||9<document.documentMode)}function h0(){Oo&&(Oo.detachEvent("onpropertychange",d0),zo=Oo=null)}function d0(e){if(e.propertyName==="value"&&$l(zo)){var i=[];l0(i,zo,e,Sf(e)),jm(qS,i)}}function YS(e,i,r){e==="focusin"?(h0(),Oo=i,zo=r,Oo.attachEvent("onpropertychange",d0)):e==="focusout"&&h0()}function ZS(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return $l(zo)}function KS(e,i){if(e==="click")return $l(i)}function jS(e,i){if(e==="input"||e==="change")return $l(i)}function QS(e,i){return e===i&&(e!==0||1/e===1/i)||e!==e&&i!==i}var yi=typeof Object.is=="function"?Object.is:QS;function Fo(e,i){if(yi(e,i))return!0;if(typeof e!="object"||e===null||typeof i!="object"||i===null)return!1;var r=Object.keys(e),l=Object.keys(i);if(r.length!==l.length)return!1;for(l=0;l<r.length;l++){var f=r[l];if(!me.call(i,f)||!yi(e[f],i[f]))return!1}return!0}function p0(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function m0(e,i){var r=p0(e);e=0;for(var l;r;){if(r.nodeType===3){if(l=e+r.textContent.length,e<=i&&l>=i)return{node:r,offset:i-e};e=l}t:{for(;r;){if(r.nextSibling){r=r.nextSibling;break t}r=r.parentNode}r=void 0}r=p0(r)}}function g0(e,i){return e&&i?e===i?!0:e&&e.nodeType===3?!1:i&&i.nodeType===3?g0(e,i.parentNode):"contains"in e?e.contains(i):e.compareDocumentPosition?!!(e.compareDocumentPosition(i)&16):!1:!1}function _0(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var i=Xe(e.document);i instanceof e.HTMLIFrameElement;){try{var r=typeof i.contentWindow.location.href=="string"}catch{r=!1}if(r)e=i.contentWindow;else break;i=Xe(e.document)}return i}function Lf(e){var i=e&&e.nodeName&&e.nodeName.toLowerCase();return i&&(i==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||i==="textarea"||e.contentEditable==="true")}var JS=Aa&&"documentMode"in document&&11>=document.documentMode,Sr=null,Nf=null,Io=null,Pf=!1;function v0(e,i,r){var l=r.window===r?r.document:r.nodeType===9?r:r.ownerDocument;Pf||Sr==null||Sr!==Xe(l)||(l=Sr,"selectionStart"in l&&Lf(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),Io&&Fo(Io,l)||(Io=l,l=Gc(Nf,"onSelect"),0<l.length&&(i=new Ql("onSelect","select",null,i,r),e.push({event:i,listeners:l}),i.target=Sr)))}function ks(e,i){var r={};return r[e.toLowerCase()]=i.toLowerCase(),r["Webkit"+e]="webkit"+i,r["Moz"+e]="moz"+i,r}var Mr={animationend:ks("Animation","AnimationEnd"),animationiteration:ks("Animation","AnimationIteration"),animationstart:ks("Animation","AnimationStart"),transitionrun:ks("Transition","TransitionRun"),transitionstart:ks("Transition","TransitionStart"),transitioncancel:ks("Transition","TransitionCancel"),transitionend:ks("Transition","TransitionEnd")},Of={},x0={};Aa&&(x0=document.createElement("div").style,"AnimationEvent"in window||(delete Mr.animationend.animation,delete Mr.animationiteration.animation,delete Mr.animationstart.animation),"TransitionEvent"in window||delete Mr.transitionend.transition);function Xs(e){if(Of[e])return Of[e];if(!Mr[e])return e;var i=Mr[e],r;for(r in i)if(i.hasOwnProperty(r)&&r in x0)return Of[e]=i[r];return e}var y0=Xs("animationend"),S0=Xs("animationiteration"),M0=Xs("animationstart"),$S=Xs("transitionrun"),tM=Xs("transitionstart"),eM=Xs("transitioncancel"),b0=Xs("transitionend"),E0=new Map,zf="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");zf.push("scrollEnd");function ta(e,i){E0.set(e,i),tt(i,[e])}var tc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var i=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(i))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Oi=[],br=0,Ff=0;function ec(){for(var e=br,i=Ff=br=0;i<e;){var r=Oi[i];Oi[i++]=null;var l=Oi[i];Oi[i++]=null;var f=Oi[i];Oi[i++]=null;var p=Oi[i];if(Oi[i++]=null,l!==null&&f!==null){var M=l.pending;M===null?f.next=f:(f.next=M.next,M.next=f),l.pending=f}p!==0&&T0(r,f,p)}}function nc(e,i,r,l){Oi[br++]=e,Oi[br++]=i,Oi[br++]=r,Oi[br++]=l,Ff|=l,e.lanes|=l,e=e.alternate,e!==null&&(e.lanes|=l)}function If(e,i,r,l){return nc(e,i,r,l),ic(e)}function Ws(e,i){return nc(e,null,null,i),ic(e)}function T0(e,i,r){e.lanes|=r;var l=e.alternate;l!==null&&(l.lanes|=r);for(var f=!1,p=e.return;p!==null;)p.childLanes|=r,l=p.alternate,l!==null&&(l.childLanes|=r),p.tag===22&&(e=p.stateNode,e===null||e._visibility&1||(f=!0)),e=p,p=p.return;return e.tag===3?(p=e.stateNode,f&&i!==null&&(f=31-Bt(r),e=p.hiddenUpdates,l=e[f],l===null?e[f]=[i]:l.push(i),i.lane=r|536870912),p):null}function ic(e){if(50<rl)throw rl=0,Yh=null,Error(s(185));for(var i=e.return;i!==null;)e=i,i=e.return;return e.tag===3?e.stateNode:null}var Er={};function nM(e,i,r,l){this.tag=e,this.key=r,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Si(e,i,r,l){return new nM(e,i,r,l)}function Bf(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Ra(e,i){var r=e.alternate;return r===null?(r=Si(e.tag,i,e.key,e.mode),r.elementType=e.elementType,r.type=e.type,r.stateNode=e.stateNode,r.alternate=e,e.alternate=r):(r.pendingProps=i,r.type=e.type,r.flags=0,r.subtreeFlags=0,r.deletions=null),r.flags=e.flags&65011712,r.childLanes=e.childLanes,r.lanes=e.lanes,r.child=e.child,r.memoizedProps=e.memoizedProps,r.memoizedState=e.memoizedState,r.updateQueue=e.updateQueue,i=e.dependencies,r.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},r.sibling=e.sibling,r.index=e.index,r.ref=e.ref,r.refCleanup=e.refCleanup,r}function A0(e,i){e.flags&=65011714;var r=e.alternate;return r===null?(e.childLanes=0,e.lanes=i,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=r.childLanes,e.lanes=r.lanes,e.child=r.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=r.memoizedProps,e.memoizedState=r.memoizedState,e.updateQueue=r.updateQueue,e.type=r.type,i=r.dependencies,e.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext}),e}function ac(e,i,r,l,f,p){var M=0;if(l=e,typeof e=="function")Bf(e)&&(M=1);else if(typeof e=="string")M=ob(e,r,Ct.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case N:return e=Si(31,r,i,f),e.elementType=N,e.lanes=p,e;case R:return qs(r.children,f,p,i);case x:M=8,f|=24;break;case y:return e=Si(12,r,i,f|2),e.elementType=y,e.lanes=p,e;case L:return e=Si(13,r,i,f),e.elementType=L,e.lanes=p,e;case D:return e=Si(19,r,i,f),e.elementType=D,e.lanes=p,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case z:M=10;break t;case P:M=9;break t;case C:M=11;break t;case B:M=14;break t;case T:M=16,l=null;break t}M=29,r=Error(s(130,e===null?"null":typeof e,"")),l=null}return i=Si(M,r,i,f),i.elementType=e,i.type=l,i.lanes=p,i}function qs(e,i,r,l){return e=Si(7,e,l,i),e.lanes=r,e}function Hf(e,i,r){return e=Si(6,e,null,i),e.lanes=r,e}function R0(e){var i=Si(18,null,null,0);return i.stateNode=e,i}function Gf(e,i,r){return i=Si(4,e.children!==null?e.children:[],e.key,i),i.lanes=r,i.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},i}var C0=new WeakMap;function zi(e,i){if(typeof e=="object"&&e!==null){var r=C0.get(e);return r!==void 0?r:(i={value:e,source:i,stack:ce(i)},C0.set(e,i),i)}return{value:e,source:i,stack:ce(i)}}var Tr=[],Ar=0,sc=null,Bo=0,Fi=[],Ii=0,is=null,fa=1,ha="";function Ca(e,i){Tr[Ar++]=Bo,Tr[Ar++]=sc,sc=e,Bo=i}function w0(e,i,r){Fi[Ii++]=fa,Fi[Ii++]=ha,Fi[Ii++]=is,is=e;var l=fa;e=ha;var f=32-Bt(l)-1;l&=~(1<<f),r+=1;var p=32-Bt(i)+f;if(30<p){var M=f-f%5;p=(l&(1<<M)-1).toString(32),l>>=M,f-=M,fa=1<<32-Bt(i)+f|r<<f|l,ha=p+e}else fa=1<<p|r<<f|l,ha=e}function Vf(e){e.return!==null&&(Ca(e,1),w0(e,1,0))}function kf(e){for(;e===sc;)sc=Tr[--Ar],Tr[Ar]=null,Bo=Tr[--Ar],Tr[Ar]=null;for(;e===is;)is=Fi[--Ii],Fi[Ii]=null,ha=Fi[--Ii],Fi[Ii]=null,fa=Fi[--Ii],Fi[Ii]=null}function D0(e,i){Fi[Ii++]=fa,Fi[Ii++]=ha,Fi[Ii++]=is,fa=i.id,ha=i.overflow,is=e}var Xn=null,fn=null,Fe=!1,as=null,Bi=!1,Xf=Error(s(519));function ss(e){var i=Error(s(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ho(zi(i,e)),Xf}function U0(e){var i=e.stateNode,r=e.type,l=e.memoizedProps;switch(i[Ke]=e,i[$e]=l,r){case"dialog":Ue("cancel",i),Ue("close",i);break;case"iframe":case"object":case"embed":Ue("load",i);break;case"video":case"audio":for(r=0;r<ll.length;r++)Ue(ll[r],i);break;case"source":Ue("error",i);break;case"img":case"image":case"link":Ue("error",i),Ue("load",i);break;case"details":Ue("toggle",i);break;case"input":Ue("invalid",i),Hn(i,l.value,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name,!0);break;case"select":Ue("invalid",i);break;case"textarea":Ue("invalid",i),xi(i,l.value,l.defaultValue,l.children)}r=l.children,typeof r!="string"&&typeof r!="number"&&typeof r!="bigint"||i.textContent===""+r||l.suppressHydrationWarning===!0||Z_(i.textContent,r)?(l.popover!=null&&(Ue("beforetoggle",i),Ue("toggle",i)),l.onScroll!=null&&Ue("scroll",i),l.onScrollEnd!=null&&Ue("scrollend",i),l.onClick!=null&&(i.onclick=Ta),i=!0):i=!1,i||ss(e,!0)}function L0(e){for(Xn=e.return;Xn;)switch(Xn.tag){case 5:case 31:case 13:Bi=!1;return;case 27:case 3:Bi=!0;return;default:Xn=Xn.return}}function Rr(e){if(e!==Xn)return!1;if(!Fe)return L0(e),Fe=!0,!1;var i=e.tag,r;if((r=i!==3&&i!==27)&&((r=i===5)&&(r=e.type,r=!(r!=="form"&&r!=="button")||ld(e.type,e.memoizedProps)),r=!r),r&&fn&&ss(e),L0(e),i===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(317));fn=iv(e)}else if(i===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(317));fn=iv(e)}else i===27?(i=fn,xs(e.type)?(e=dd,dd=null,fn=e):fn=i):fn=Xn?Gi(e.stateNode.nextSibling):null;return!0}function Ys(){fn=Xn=null,Fe=!1}function Wf(){var e=as;return e!==null&&(pi===null?pi=e:pi.push.apply(pi,e),as=null),e}function Ho(e){as===null?as=[e]:as.push(e)}var qf=F(null),Zs=null,wa=null;function rs(e,i,r){vt(qf,i._currentValue),i._currentValue=r}function Da(e){e._currentValue=qf.current,q(qf)}function Yf(e,i,r){for(;e!==null;){var l=e.alternate;if((e.childLanes&i)!==i?(e.childLanes|=i,l!==null&&(l.childLanes|=i)):l!==null&&(l.childLanes&i)!==i&&(l.childLanes|=i),e===r)break;e=e.return}}function Zf(e,i,r,l){var f=e.child;for(f!==null&&(f.return=e);f!==null;){var p=f.dependencies;if(p!==null){var M=f.child;p=p.firstContext;t:for(;p!==null;){var U=p;p=f;for(var k=0;k<i.length;k++)if(U.context===i[k]){p.lanes|=r,U=p.alternate,U!==null&&(U.lanes|=r),Yf(p.return,r,e),l||(M=null);break t}p=U.next}}else if(f.tag===18){if(M=f.return,M===null)throw Error(s(341));M.lanes|=r,p=M.alternate,p!==null&&(p.lanes|=r),Yf(M,r,e),M=null}else M=f.child;if(M!==null)M.return=f;else for(M=f;M!==null;){if(M===e){M=null;break}if(f=M.sibling,f!==null){f.return=M.return,M=f;break}M=M.return}f=M}}function Cr(e,i,r,l){e=null;for(var f=i,p=!1;f!==null;){if(!p){if((f.flags&524288)!==0)p=!0;else if((f.flags&262144)!==0)break}if(f.tag===10){var M=f.alternate;if(M===null)throw Error(s(387));if(M=M.memoizedProps,M!==null){var U=f.type;yi(f.pendingProps.value,M.value)||(e!==null?e.push(U):e=[U])}}else if(f===yt.current){if(M=f.alternate,M===null)throw Error(s(387));M.memoizedState.memoizedState!==f.memoizedState.memoizedState&&(e!==null?e.push(dl):e=[dl])}f=f.return}e!==null&&Zf(i,e,r,l),i.flags|=262144}function rc(e){for(e=e.firstContext;e!==null;){if(!yi(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ks(e){Zs=e,wa=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Wn(e){return N0(Zs,e)}function oc(e,i){return Zs===null&&Ks(e),N0(e,i)}function N0(e,i){var r=i._currentValue;if(i={context:i,memoizedValue:r,next:null},wa===null){if(e===null)throw Error(s(308));wa=i,e.dependencies={lanes:0,firstContext:i},e.flags|=524288}else wa=wa.next=i;return r}var iM=typeof AbortController<"u"?AbortController:function(){var e=[],i=this.signal={aborted:!1,addEventListener:function(r,l){e.push(l)}};this.abort=function(){i.aborted=!0,e.forEach(function(r){return r()})}},aM=a.unstable_scheduleCallback,sM=a.unstable_NormalPriority,Cn={$$typeof:z,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Kf(){return{controller:new iM,data:new Map,refCount:0}}function Go(e){e.refCount--,e.refCount===0&&aM(sM,function(){e.controller.abort()})}var Vo=null,jf=0,wr=0,Dr=null;function rM(e,i){if(Vo===null){var r=Vo=[];jf=0,wr=$h(),Dr={status:"pending",value:void 0,then:function(l){r.push(l)}}}return jf++,i.then(P0,P0),i}function P0(){if(--jf===0&&Vo!==null){Dr!==null&&(Dr.status="fulfilled");var e=Vo;Vo=null,wr=0,Dr=null;for(var i=0;i<e.length;i++)(0,e[i])()}}function oM(e,i){var r=[],l={status:"pending",value:null,reason:null,then:function(f){r.push(f)}};return e.then(function(){l.status="fulfilled",l.value=i;for(var f=0;f<r.length;f++)(0,r[f])(i)},function(f){for(l.status="rejected",l.reason=f,f=0;f<r.length;f++)(0,r[f])(void 0)}),l}var O0=I.S;I.S=function(e,i){v_=fe(),typeof i=="object"&&i!==null&&typeof i.then=="function"&&rM(e,i),O0!==null&&O0(e,i)};var js=F(null);function Qf(){var e=js.current;return e!==null?e:ln.pooledCache}function lc(e,i){i===null?vt(js,js.current):vt(js,i.pool)}function z0(){var e=Qf();return e===null?null:{parent:Cn._currentValue,pool:e}}var Ur=Error(s(460)),Jf=Error(s(474)),cc=Error(s(542)),uc={then:function(){}};function F0(e){return e=e.status,e==="fulfilled"||e==="rejected"}function I0(e,i,r){switch(r=e[r],r===void 0?e.push(i):r!==i&&(i.then(Ta,Ta),i=r),i.status){case"fulfilled":return i.value;case"rejected":throw e=i.reason,H0(e),e;default:if(typeof i.status=="string")i.then(Ta,Ta);else{if(e=ln,e!==null&&100<e.shellSuspendCounter)throw Error(s(482));e=i,e.status="pending",e.then(function(l){if(i.status==="pending"){var f=i;f.status="fulfilled",f.value=l}},function(l){if(i.status==="pending"){var f=i;f.status="rejected",f.reason=l}})}switch(i.status){case"fulfilled":return i.value;case"rejected":throw e=i.reason,H0(e),e}throw Js=i,Ur}}function Qs(e){try{var i=e._init;return i(e._payload)}catch(r){throw r!==null&&typeof r=="object"&&typeof r.then=="function"?(Js=r,Ur):r}}var Js=null;function B0(){if(Js===null)throw Error(s(459));var e=Js;return Js=null,e}function H0(e){if(e===Ur||e===cc)throw Error(s(483))}var Lr=null,ko=0;function fc(e){var i=ko;return ko+=1,Lr===null&&(Lr=[]),I0(Lr,e,i)}function Xo(e,i){i=i.props.ref,e.ref=i!==void 0?i:null}function hc(e,i){throw i.$$typeof===_?Error(s(525)):(e=Object.prototype.toString.call(i),Error(s(31,e==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":e)))}function G0(e){function i(nt,j){if(e){var rt=nt.deletions;rt===null?(nt.deletions=[j],nt.flags|=16):rt.push(j)}}function r(nt,j){if(!e)return null;for(;j!==null;)i(nt,j),j=j.sibling;return null}function l(nt){for(var j=new Map;nt!==null;)nt.key!==null?j.set(nt.key,nt):j.set(nt.index,nt),nt=nt.sibling;return j}function f(nt,j){return nt=Ra(nt,j),nt.index=0,nt.sibling=null,nt}function p(nt,j,rt){return nt.index=rt,e?(rt=nt.alternate,rt!==null?(rt=rt.index,rt<j?(nt.flags|=67108866,j):rt):(nt.flags|=67108866,j)):(nt.flags|=1048576,j)}function M(nt){return e&&nt.alternate===null&&(nt.flags|=67108866),nt}function U(nt,j,rt,Rt){return j===null||j.tag!==6?(j=Hf(rt,nt.mode,Rt),j.return=nt,j):(j=f(j,rt),j.return=nt,j)}function k(nt,j,rt,Rt){var ge=rt.type;return ge===R?Tt(nt,j,rt.props.children,Rt,rt.key):j!==null&&(j.elementType===ge||typeof ge=="object"&&ge!==null&&ge.$$typeof===T&&Qs(ge)===j.type)?(j=f(j,rt.props),Xo(j,rt),j.return=nt,j):(j=ac(rt.type,rt.key,rt.props,null,nt.mode,Rt),Xo(j,rt),j.return=nt,j)}function ot(nt,j,rt,Rt){return j===null||j.tag!==4||j.stateNode.containerInfo!==rt.containerInfo||j.stateNode.implementation!==rt.implementation?(j=Gf(rt,nt.mode,Rt),j.return=nt,j):(j=f(j,rt.children||[]),j.return=nt,j)}function Tt(nt,j,rt,Rt,ge){return j===null||j.tag!==7?(j=qs(rt,nt.mode,Rt,ge),j.return=nt,j):(j=f(j,rt),j.return=nt,j)}function wt(nt,j,rt){if(typeof j=="string"&&j!==""||typeof j=="number"||typeof j=="bigint")return j=Hf(""+j,nt.mode,rt),j.return=nt,j;if(typeof j=="object"&&j!==null){switch(j.$$typeof){case S:return rt=ac(j.type,j.key,j.props,null,nt.mode,rt),Xo(rt,j),rt.return=nt,rt;case b:return j=Gf(j,nt.mode,rt),j.return=nt,j;case T:return j=Qs(j),wt(nt,j,rt)}if(J(j)||W(j))return j=qs(j,nt.mode,rt,null),j.return=nt,j;if(typeof j.then=="function")return wt(nt,fc(j),rt);if(j.$$typeof===z)return wt(nt,oc(nt,j),rt);hc(nt,j)}return null}function dt(nt,j,rt,Rt){var ge=j!==null?j.key:null;if(typeof rt=="string"&&rt!==""||typeof rt=="number"||typeof rt=="bigint")return ge!==null?null:U(nt,j,""+rt,Rt);if(typeof rt=="object"&&rt!==null){switch(rt.$$typeof){case S:return rt.key===ge?k(nt,j,rt,Rt):null;case b:return rt.key===ge?ot(nt,j,rt,Rt):null;case T:return rt=Qs(rt),dt(nt,j,rt,Rt)}if(J(rt)||W(rt))return ge!==null?null:Tt(nt,j,rt,Rt,null);if(typeof rt.then=="function")return dt(nt,j,fc(rt),Rt);if(rt.$$typeof===z)return dt(nt,j,oc(nt,rt),Rt);hc(nt,rt)}return null}function _t(nt,j,rt,Rt,ge){if(typeof Rt=="string"&&Rt!==""||typeof Rt=="number"||typeof Rt=="bigint")return nt=nt.get(rt)||null,U(j,nt,""+Rt,ge);if(typeof Rt=="object"&&Rt!==null){switch(Rt.$$typeof){case S:return nt=nt.get(Rt.key===null?rt:Rt.key)||null,k(j,nt,Rt,ge);case b:return nt=nt.get(Rt.key===null?rt:Rt.key)||null,ot(j,nt,Rt,ge);case T:return Rt=Qs(Rt),_t(nt,j,rt,Rt,ge)}if(J(Rt)||W(Rt))return nt=nt.get(rt)||null,Tt(j,nt,Rt,ge,null);if(typeof Rt.then=="function")return _t(nt,j,rt,fc(Rt),ge);if(Rt.$$typeof===z)return _t(nt,j,rt,oc(j,Rt),ge);hc(j,Rt)}return null}function se(nt,j,rt,Rt){for(var ge=null,Ge=null,ue=j,Te=j=0,Oe=null;ue!==null&&Te<rt.length;Te++){ue.index>Te?(Oe=ue,ue=null):Oe=ue.sibling;var Ve=dt(nt,ue,rt[Te],Rt);if(Ve===null){ue===null&&(ue=Oe);break}e&&ue&&Ve.alternate===null&&i(nt,ue),j=p(Ve,j,Te),Ge===null?ge=Ve:Ge.sibling=Ve,Ge=Ve,ue=Oe}if(Te===rt.length)return r(nt,ue),Fe&&Ca(nt,Te),ge;if(ue===null){for(;Te<rt.length;Te++)ue=wt(nt,rt[Te],Rt),ue!==null&&(j=p(ue,j,Te),Ge===null?ge=ue:Ge.sibling=ue,Ge=ue);return Fe&&Ca(nt,Te),ge}for(ue=l(ue);Te<rt.length;Te++)Oe=_t(ue,nt,Te,rt[Te],Rt),Oe!==null&&(e&&Oe.alternate!==null&&ue.delete(Oe.key===null?Te:Oe.key),j=p(Oe,j,Te),Ge===null?ge=Oe:Ge.sibling=Oe,Ge=Oe);return e&&ue.forEach(function(Es){return i(nt,Es)}),Fe&&Ca(nt,Te),ge}function ve(nt,j,rt,Rt){if(rt==null)throw Error(s(151));for(var ge=null,Ge=null,ue=j,Te=j=0,Oe=null,Ve=rt.next();ue!==null&&!Ve.done;Te++,Ve=rt.next()){ue.index>Te?(Oe=ue,ue=null):Oe=ue.sibling;var Es=dt(nt,ue,Ve.value,Rt);if(Es===null){ue===null&&(ue=Oe);break}e&&ue&&Es.alternate===null&&i(nt,ue),j=p(Es,j,Te),Ge===null?ge=Es:Ge.sibling=Es,Ge=Es,ue=Oe}if(Ve.done)return r(nt,ue),Fe&&Ca(nt,Te),ge;if(ue===null){for(;!Ve.done;Te++,Ve=rt.next())Ve=wt(nt,Ve.value,Rt),Ve!==null&&(j=p(Ve,j,Te),Ge===null?ge=Ve:Ge.sibling=Ve,Ge=Ve);return Fe&&Ca(nt,Te),ge}for(ue=l(ue);!Ve.done;Te++,Ve=rt.next())Ve=_t(ue,nt,Te,Ve.value,Rt),Ve!==null&&(e&&Ve.alternate!==null&&ue.delete(Ve.key===null?Te:Ve.key),j=p(Ve,j,Te),Ge===null?ge=Ve:Ge.sibling=Ve,Ge=Ve);return e&&ue.forEach(function(vb){return i(nt,vb)}),Fe&&Ca(nt,Te),ge}function sn(nt,j,rt,Rt){if(typeof rt=="object"&&rt!==null&&rt.type===R&&rt.key===null&&(rt=rt.props.children),typeof rt=="object"&&rt!==null){switch(rt.$$typeof){case S:t:{for(var ge=rt.key;j!==null;){if(j.key===ge){if(ge=rt.type,ge===R){if(j.tag===7){r(nt,j.sibling),Rt=f(j,rt.props.children),Rt.return=nt,nt=Rt;break t}}else if(j.elementType===ge||typeof ge=="object"&&ge!==null&&ge.$$typeof===T&&Qs(ge)===j.type){r(nt,j.sibling),Rt=f(j,rt.props),Xo(Rt,rt),Rt.return=nt,nt=Rt;break t}r(nt,j);break}else i(nt,j);j=j.sibling}rt.type===R?(Rt=qs(rt.props.children,nt.mode,Rt,rt.key),Rt.return=nt,nt=Rt):(Rt=ac(rt.type,rt.key,rt.props,null,nt.mode,Rt),Xo(Rt,rt),Rt.return=nt,nt=Rt)}return M(nt);case b:t:{for(ge=rt.key;j!==null;){if(j.key===ge)if(j.tag===4&&j.stateNode.containerInfo===rt.containerInfo&&j.stateNode.implementation===rt.implementation){r(nt,j.sibling),Rt=f(j,rt.children||[]),Rt.return=nt,nt=Rt;break t}else{r(nt,j);break}else i(nt,j);j=j.sibling}Rt=Gf(rt,nt.mode,Rt),Rt.return=nt,nt=Rt}return M(nt);case T:return rt=Qs(rt),sn(nt,j,rt,Rt)}if(J(rt))return se(nt,j,rt,Rt);if(W(rt)){if(ge=W(rt),typeof ge!="function")throw Error(s(150));return rt=ge.call(rt),ve(nt,j,rt,Rt)}if(typeof rt.then=="function")return sn(nt,j,fc(rt),Rt);if(rt.$$typeof===z)return sn(nt,j,oc(nt,rt),Rt);hc(nt,rt)}return typeof rt=="string"&&rt!==""||typeof rt=="number"||typeof rt=="bigint"?(rt=""+rt,j!==null&&j.tag===6?(r(nt,j.sibling),Rt=f(j,rt),Rt.return=nt,nt=Rt):(r(nt,j),Rt=Hf(rt,nt.mode,Rt),Rt.return=nt,nt=Rt),M(nt)):r(nt,j)}return function(nt,j,rt,Rt){try{ko=0;var ge=sn(nt,j,rt,Rt);return Lr=null,ge}catch(ue){if(ue===Ur||ue===cc)throw ue;var Ge=Si(29,ue,null,nt.mode);return Ge.lanes=Rt,Ge.return=nt,Ge}}}var $s=G0(!0),V0=G0(!1),os=!1;function $f(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function th(e,i){e=e.updateQueue,i.updateQueue===e&&(i.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ls(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function cs(e,i,r){var l=e.updateQueue;if(l===null)return null;if(l=l.shared,(Ye&2)!==0){var f=l.pending;return f===null?i.next=i:(i.next=f.next,f.next=i),l.pending=i,i=ic(e),T0(e,null,r),i}return nc(e,l,i,r),ic(e)}function Wo(e,i,r){if(i=i.updateQueue,i!==null&&(i=i.shared,(r&4194048)!==0)){var l=i.lanes;l&=e.pendingLanes,r|=l,i.lanes=r,Ze(e,r)}}function eh(e,i){var r=e.updateQueue,l=e.alternate;if(l!==null&&(l=l.updateQueue,r===l)){var f=null,p=null;if(r=r.firstBaseUpdate,r!==null){do{var M={lane:r.lane,tag:r.tag,payload:r.payload,callback:null,next:null};p===null?f=p=M:p=p.next=M,r=r.next}while(r!==null);p===null?f=p=i:p=p.next=i}else f=p=i;r={baseState:l.baseState,firstBaseUpdate:f,lastBaseUpdate:p,shared:l.shared,callbacks:l.callbacks},e.updateQueue=r;return}e=r.lastBaseUpdate,e===null?r.firstBaseUpdate=i:e.next=i,r.lastBaseUpdate=i}var nh=!1;function qo(){if(nh){var e=Dr;if(e!==null)throw e}}function Yo(e,i,r,l){nh=!1;var f=e.updateQueue;os=!1;var p=f.firstBaseUpdate,M=f.lastBaseUpdate,U=f.shared.pending;if(U!==null){f.shared.pending=null;var k=U,ot=k.next;k.next=null,M===null?p=ot:M.next=ot,M=k;var Tt=e.alternate;Tt!==null&&(Tt=Tt.updateQueue,U=Tt.lastBaseUpdate,U!==M&&(U===null?Tt.firstBaseUpdate=ot:U.next=ot,Tt.lastBaseUpdate=k))}if(p!==null){var wt=f.baseState;M=0,Tt=ot=k=null,U=p;do{var dt=U.lane&-536870913,_t=dt!==U.lane;if(_t?(Pe&dt)===dt:(l&dt)===dt){dt!==0&&dt===wr&&(nh=!0),Tt!==null&&(Tt=Tt.next={lane:0,tag:U.tag,payload:U.payload,callback:null,next:null});t:{var se=e,ve=U;dt=i;var sn=r;switch(ve.tag){case 1:if(se=ve.payload,typeof se=="function"){wt=se.call(sn,wt,dt);break t}wt=se;break t;case 3:se.flags=se.flags&-65537|128;case 0:if(se=ve.payload,dt=typeof se=="function"?se.call(sn,wt,dt):se,dt==null)break t;wt=v({},wt,dt);break t;case 2:os=!0}}dt=U.callback,dt!==null&&(e.flags|=64,_t&&(e.flags|=8192),_t=f.callbacks,_t===null?f.callbacks=[dt]:_t.push(dt))}else _t={lane:dt,tag:U.tag,payload:U.payload,callback:U.callback,next:null},Tt===null?(ot=Tt=_t,k=wt):Tt=Tt.next=_t,M|=dt;if(U=U.next,U===null){if(U=f.shared.pending,U===null)break;_t=U,U=_t.next,_t.next=null,f.lastBaseUpdate=_t,f.shared.pending=null}}while(!0);Tt===null&&(k=wt),f.baseState=k,f.firstBaseUpdate=ot,f.lastBaseUpdate=Tt,p===null&&(f.shared.lanes=0),ps|=M,e.lanes=M,e.memoizedState=wt}}function k0(e,i){if(typeof e!="function")throw Error(s(191,e));e.call(i)}function X0(e,i){var r=e.callbacks;if(r!==null)for(e.callbacks=null,e=0;e<r.length;e++)k0(r[e],i)}var Nr=F(null),dc=F(0);function W0(e,i){e=Ba,vt(dc,e),vt(Nr,i),Ba=e|i.baseLanes}function ih(){vt(dc,Ba),vt(Nr,Nr.current)}function ah(){Ba=dc.current,q(Nr),q(dc)}var Mi=F(null),Hi=null;function us(e){var i=e.alternate;vt(Tn,Tn.current&1),vt(Mi,e),Hi===null&&(i===null||Nr.current!==null||i.memoizedState!==null)&&(Hi=e)}function sh(e){vt(Tn,Tn.current),vt(Mi,e),Hi===null&&(Hi=e)}function q0(e){e.tag===22?(vt(Tn,Tn.current),vt(Mi,e),Hi===null&&(Hi=e)):fs()}function fs(){vt(Tn,Tn.current),vt(Mi,Mi.current)}function bi(e){q(Mi),Hi===e&&(Hi=null),q(Tn)}var Tn=F(0);function pc(e){for(var i=e;i!==null;){if(i.tag===13){var r=i.memoizedState;if(r!==null&&(r=r.dehydrated,r===null||fd(r)||hd(r)))return i}else if(i.tag===19&&(i.memoizedProps.revealOrder==="forwards"||i.memoizedProps.revealOrder==="backwards"||i.memoizedProps.revealOrder==="unstable_legacy-backwards"||i.memoizedProps.revealOrder==="together")){if((i.flags&128)!==0)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break;for(;i.sibling===null;){if(i.return===null||i.return===e)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var Ua=0,Ee=null,nn=null,wn=null,mc=!1,Pr=!1,tr=!1,gc=0,Zo=0,Or=null,lM=0;function yn(){throw Error(s(321))}function rh(e,i){if(i===null)return!1;for(var r=0;r<i.length&&r<e.length;r++)if(!yi(e[r],i[r]))return!1;return!0}function oh(e,i,r,l,f,p){return Ua=p,Ee=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,I.H=e===null||e.memoizedState===null?wg:Mh,tr=!1,p=r(l,f),tr=!1,Pr&&(p=Z0(i,r,l,f)),Y0(e),p}function Y0(e){I.H=Qo;var i=nn!==null&&nn.next!==null;if(Ua=0,wn=nn=Ee=null,mc=!1,Zo=0,Or=null,i)throw Error(s(300));e===null||Dn||(e=e.dependencies,e!==null&&rc(e)&&(Dn=!0))}function Z0(e,i,r,l){Ee=e;var f=0;do{if(Pr&&(Or=null),Zo=0,Pr=!1,25<=f)throw Error(s(301));if(f+=1,wn=nn=null,e.updateQueue!=null){var p=e.updateQueue;p.lastEffect=null,p.events=null,p.stores=null,p.memoCache!=null&&(p.memoCache.index=0)}I.H=Dg,p=i(r,l)}while(Pr);return p}function cM(){var e=I.H,i=e.useState()[0];return i=typeof i.then=="function"?Ko(i):i,e=e.useState()[0],(nn!==null?nn.memoizedState:null)!==e&&(Ee.flags|=1024),i}function lh(){var e=gc!==0;return gc=0,e}function ch(e,i,r){i.updateQueue=e.updateQueue,i.flags&=-2053,e.lanes&=~r}function uh(e){if(mc){for(e=e.memoizedState;e!==null;){var i=e.queue;i!==null&&(i.pending=null),e=e.next}mc=!1}Ua=0,wn=nn=Ee=null,Pr=!1,Zo=gc=0,Or=null}function ai(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return wn===null?Ee.memoizedState=wn=e:wn=wn.next=e,wn}function An(){if(nn===null){var e=Ee.alternate;e=e!==null?e.memoizedState:null}else e=nn.next;var i=wn===null?Ee.memoizedState:wn.next;if(i!==null)wn=i,nn=e;else{if(e===null)throw Ee.alternate===null?Error(s(467)):Error(s(310));nn=e,e={memoizedState:nn.memoizedState,baseState:nn.baseState,baseQueue:nn.baseQueue,queue:nn.queue,next:null},wn===null?Ee.memoizedState=wn=e:wn=wn.next=e}return wn}function _c(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ko(e){var i=Zo;return Zo+=1,Or===null&&(Or=[]),e=I0(Or,e,i),i=Ee,(wn===null?i.memoizedState:wn.next)===null&&(i=i.alternate,I.H=i===null||i.memoizedState===null?wg:Mh),e}function vc(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Ko(e);if(e.$$typeof===z)return Wn(e)}throw Error(s(438,String(e)))}function fh(e){var i=null,r=Ee.updateQueue;if(r!==null&&(i=r.memoCache),i==null){var l=Ee.alternate;l!==null&&(l=l.updateQueue,l!==null&&(l=l.memoCache,l!=null&&(i={data:l.data.map(function(f){return f.slice()}),index:0})))}if(i==null&&(i={data:[],index:0}),r===null&&(r=_c(),Ee.updateQueue=r),r.memoCache=i,r=i.data[i.index],r===void 0)for(r=i.data[i.index]=Array(e),l=0;l<e;l++)r[l]=G;return i.index++,r}function La(e,i){return typeof i=="function"?i(e):i}function xc(e){var i=An();return hh(i,nn,e)}function hh(e,i,r){var l=e.queue;if(l===null)throw Error(s(311));l.lastRenderedReducer=r;var f=e.baseQueue,p=l.pending;if(p!==null){if(f!==null){var M=f.next;f.next=p.next,p.next=M}i.baseQueue=f=p,l.pending=null}if(p=e.baseState,f===null)e.memoizedState=p;else{i=f.next;var U=M=null,k=null,ot=i,Tt=!1;do{var wt=ot.lane&-536870913;if(wt!==ot.lane?(Pe&wt)===wt:(Ua&wt)===wt){var dt=ot.revertLane;if(dt===0)k!==null&&(k=k.next={lane:0,revertLane:0,gesture:null,action:ot.action,hasEagerState:ot.hasEagerState,eagerState:ot.eagerState,next:null}),wt===wr&&(Tt=!0);else if((Ua&dt)===dt){ot=ot.next,dt===wr&&(Tt=!0);continue}else wt={lane:0,revertLane:ot.revertLane,gesture:null,action:ot.action,hasEagerState:ot.hasEagerState,eagerState:ot.eagerState,next:null},k===null?(U=k=wt,M=p):k=k.next=wt,Ee.lanes|=dt,ps|=dt;wt=ot.action,tr&&r(p,wt),p=ot.hasEagerState?ot.eagerState:r(p,wt)}else dt={lane:wt,revertLane:ot.revertLane,gesture:ot.gesture,action:ot.action,hasEagerState:ot.hasEagerState,eagerState:ot.eagerState,next:null},k===null?(U=k=dt,M=p):k=k.next=dt,Ee.lanes|=wt,ps|=wt;ot=ot.next}while(ot!==null&&ot!==i);if(k===null?M=p:k.next=U,!yi(p,e.memoizedState)&&(Dn=!0,Tt&&(r=Dr,r!==null)))throw r;e.memoizedState=p,e.baseState=M,e.baseQueue=k,l.lastRenderedState=p}return f===null&&(l.lanes=0),[e.memoizedState,l.dispatch]}function dh(e){var i=An(),r=i.queue;if(r===null)throw Error(s(311));r.lastRenderedReducer=e;var l=r.dispatch,f=r.pending,p=i.memoizedState;if(f!==null){r.pending=null;var M=f=f.next;do p=e(p,M.action),M=M.next;while(M!==f);yi(p,i.memoizedState)||(Dn=!0),i.memoizedState=p,i.baseQueue===null&&(i.baseState=p),r.lastRenderedState=p}return[p,l]}function K0(e,i,r){var l=Ee,f=An(),p=Fe;if(p){if(r===void 0)throw Error(s(407));r=r()}else r=i();var M=!yi((nn||f).memoizedState,r);if(M&&(f.memoizedState=r,Dn=!0),f=f.queue,gh(J0.bind(null,l,f,e),[e]),f.getSnapshot!==i||M||wn!==null&&wn.memoizedState.tag&1){if(l.flags|=2048,zr(9,{destroy:void 0},Q0.bind(null,l,f,r,i),null),ln===null)throw Error(s(349));p||(Ua&127)!==0||j0(l,i,r)}return r}function j0(e,i,r){e.flags|=16384,e={getSnapshot:i,value:r},i=Ee.updateQueue,i===null?(i=_c(),Ee.updateQueue=i,i.stores=[e]):(r=i.stores,r===null?i.stores=[e]:r.push(e))}function Q0(e,i,r,l){i.value=r,i.getSnapshot=l,$0(i)&&tg(e)}function J0(e,i,r){return r(function(){$0(i)&&tg(e)})}function $0(e){var i=e.getSnapshot;e=e.value;try{var r=i();return!yi(e,r)}catch{return!0}}function tg(e){var i=Ws(e,2);i!==null&&mi(i,e,2)}function ph(e){var i=ai();if(typeof e=="function"){var r=e;if(e=r(),tr){Ot(!0);try{r()}finally{Ot(!1)}}}return i.memoizedState=i.baseState=e,i.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:La,lastRenderedState:e},i}function eg(e,i,r,l){return e.baseState=r,hh(e,nn,typeof l=="function"?l:La)}function uM(e,i,r,l,f){if(Mc(e))throw Error(s(485));if(e=i.action,e!==null){var p={payload:f,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(M){p.listeners.push(M)}};I.T!==null?r(!0):p.isTransition=!1,l(p),r=i.pending,r===null?(p.next=i.pending=p,ng(i,p)):(p.next=r.next,i.pending=r.next=p)}}function ng(e,i){var r=i.action,l=i.payload,f=e.state;if(i.isTransition){var p=I.T,M={};I.T=M;try{var U=r(f,l),k=I.S;k!==null&&k(M,U),ig(e,i,U)}catch(ot){mh(e,i,ot)}finally{p!==null&&M.types!==null&&(p.types=M.types),I.T=p}}else try{p=r(f,l),ig(e,i,p)}catch(ot){mh(e,i,ot)}}function ig(e,i,r){r!==null&&typeof r=="object"&&typeof r.then=="function"?r.then(function(l){ag(e,i,l)},function(l){return mh(e,i,l)}):ag(e,i,r)}function ag(e,i,r){i.status="fulfilled",i.value=r,sg(i),e.state=r,i=e.pending,i!==null&&(r=i.next,r===i?e.pending=null:(r=r.next,i.next=r,ng(e,r)))}function mh(e,i,r){var l=e.pending;if(e.pending=null,l!==null){l=l.next;do i.status="rejected",i.reason=r,sg(i),i=i.next;while(i!==l)}e.action=null}function sg(e){e=e.listeners;for(var i=0;i<e.length;i++)(0,e[i])()}function rg(e,i){return i}function og(e,i){if(Fe){var r=ln.formState;if(r!==null){t:{var l=Ee;if(Fe){if(fn){e:{for(var f=fn,p=Bi;f.nodeType!==8;){if(!p){f=null;break e}if(f=Gi(f.nextSibling),f===null){f=null;break e}}p=f.data,f=p==="F!"||p==="F"?f:null}if(f){fn=Gi(f.nextSibling),l=f.data==="F!";break t}}ss(l)}l=!1}l&&(i=r[0])}}return r=ai(),r.memoizedState=r.baseState=i,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:rg,lastRenderedState:i},r.queue=l,r=Ag.bind(null,Ee,l),l.dispatch=r,l=ph(!1),p=Sh.bind(null,Ee,!1,l.queue),l=ai(),f={state:i,dispatch:null,action:e,pending:null},l.queue=f,r=uM.bind(null,Ee,f,p,r),f.dispatch=r,l.memoizedState=e,[i,r,!1]}function lg(e){var i=An();return cg(i,nn,e)}function cg(e,i,r){if(i=hh(e,i,rg)[0],e=xc(La)[0],typeof i=="object"&&i!==null&&typeof i.then=="function")try{var l=Ko(i)}catch(M){throw M===Ur?cc:M}else l=i;i=An();var f=i.queue,p=f.dispatch;return r!==i.memoizedState&&(Ee.flags|=2048,zr(9,{destroy:void 0},fM.bind(null,f,r),null)),[l,p,e]}function fM(e,i){e.action=i}function ug(e){var i=An(),r=nn;if(r!==null)return cg(i,r,e);An(),i=i.memoizedState,r=An();var l=r.queue.dispatch;return r.memoizedState=e,[i,l,!1]}function zr(e,i,r,l){return e={tag:e,create:r,deps:l,inst:i,next:null},i=Ee.updateQueue,i===null&&(i=_c(),Ee.updateQueue=i),r=i.lastEffect,r===null?i.lastEffect=e.next=e:(l=r.next,r.next=e,e.next=l,i.lastEffect=e),e}function fg(){return An().memoizedState}function yc(e,i,r,l){var f=ai();Ee.flags|=e,f.memoizedState=zr(1|i,{destroy:void 0},r,l===void 0?null:l)}function Sc(e,i,r,l){var f=An();l=l===void 0?null:l;var p=f.memoizedState.inst;nn!==null&&l!==null&&rh(l,nn.memoizedState.deps)?f.memoizedState=zr(i,p,r,l):(Ee.flags|=e,f.memoizedState=zr(1|i,p,r,l))}function hg(e,i){yc(8390656,8,e,i)}function gh(e,i){Sc(2048,8,e,i)}function hM(e){Ee.flags|=4;var i=Ee.updateQueue;if(i===null)i=_c(),Ee.updateQueue=i,i.events=[e];else{var r=i.events;r===null?i.events=[e]:r.push(e)}}function dg(e){var i=An().memoizedState;return hM({ref:i,nextImpl:e}),function(){if((Ye&2)!==0)throw Error(s(440));return i.impl.apply(void 0,arguments)}}function pg(e,i){return Sc(4,2,e,i)}function mg(e,i){return Sc(4,4,e,i)}function gg(e,i){if(typeof i=="function"){e=e();var r=i(e);return function(){typeof r=="function"?r():i(null)}}if(i!=null)return e=e(),i.current=e,function(){i.current=null}}function _g(e,i,r){r=r!=null?r.concat([e]):null,Sc(4,4,gg.bind(null,i,e),r)}function _h(){}function vg(e,i){var r=An();i=i===void 0?null:i;var l=r.memoizedState;return i!==null&&rh(i,l[1])?l[0]:(r.memoizedState=[e,i],e)}function xg(e,i){var r=An();i=i===void 0?null:i;var l=r.memoizedState;if(i!==null&&rh(i,l[1]))return l[0];if(l=e(),tr){Ot(!0);try{e()}finally{Ot(!1)}}return r.memoizedState=[l,i],l}function vh(e,i,r){return r===void 0||(Ua&1073741824)!==0&&(Pe&261930)===0?e.memoizedState=i:(e.memoizedState=r,e=y_(),Ee.lanes|=e,ps|=e,r)}function yg(e,i,r,l){return yi(r,i)?r:Nr.current!==null?(e=vh(e,r,l),yi(e,i)||(Dn=!0),e):(Ua&42)===0||(Ua&1073741824)!==0&&(Pe&261930)===0?(Dn=!0,e.memoizedState=r):(e=y_(),Ee.lanes|=e,ps|=e,i)}function Sg(e,i,r,l,f){var p=V.p;V.p=p!==0&&8>p?p:8;var M=I.T,U={};I.T=U,Sh(e,!1,i,r);try{var k=f(),ot=I.S;if(ot!==null&&ot(U,k),k!==null&&typeof k=="object"&&typeof k.then=="function"){var Tt=oM(k,l);jo(e,i,Tt,Ai(e))}else jo(e,i,l,Ai(e))}catch(wt){jo(e,i,{then:function(){},status:"rejected",reason:wt},Ai())}finally{V.p=p,M!==null&&U.types!==null&&(M.types=U.types),I.T=M}}function dM(){}function xh(e,i,r,l){if(e.tag!==5)throw Error(s(476));var f=Mg(e).queue;Sg(e,f,i,$,r===null?dM:function(){return bg(e),r(l)})}function Mg(e){var i=e.memoizedState;if(i!==null)return i;i={memoizedState:$,baseState:$,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:La,lastRenderedState:$},next:null};var r={};return i.next={memoizedState:r,baseState:r,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:La,lastRenderedState:r},next:null},e.memoizedState=i,e=e.alternate,e!==null&&(e.memoizedState=i),i}function bg(e){var i=Mg(e);i.next===null&&(i=e.alternate.memoizedState),jo(e,i.next.queue,{},Ai())}function yh(){return Wn(dl)}function Eg(){return An().memoizedState}function Tg(){return An().memoizedState}function pM(e){for(var i=e.return;i!==null;){switch(i.tag){case 24:case 3:var r=Ai();e=ls(r);var l=cs(i,e,r);l!==null&&(mi(l,i,r),Wo(l,i,r)),i={cache:Kf()},e.payload=i;return}i=i.return}}function mM(e,i,r){var l=Ai();r={lane:l,revertLane:0,gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Mc(e)?Rg(i,r):(r=If(e,i,r,l),r!==null&&(mi(r,e,l),Cg(r,i,l)))}function Ag(e,i,r){var l=Ai();jo(e,i,r,l)}function jo(e,i,r,l){var f={lane:l,revertLane:0,gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null};if(Mc(e))Rg(i,f);else{var p=e.alternate;if(e.lanes===0&&(p===null||p.lanes===0)&&(p=i.lastRenderedReducer,p!==null))try{var M=i.lastRenderedState,U=p(M,r);if(f.hasEagerState=!0,f.eagerState=U,yi(U,M))return nc(e,i,f,0),ln===null&&ec(),!1}catch{}if(r=If(e,i,f,l),r!==null)return mi(r,e,l),Cg(r,i,l),!0}return!1}function Sh(e,i,r,l){if(l={lane:2,revertLane:$h(),gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},Mc(e)){if(i)throw Error(s(479))}else i=If(e,r,l,2),i!==null&&mi(i,e,2)}function Mc(e){var i=e.alternate;return e===Ee||i!==null&&i===Ee}function Rg(e,i){Pr=mc=!0;var r=e.pending;r===null?i.next=i:(i.next=r.next,r.next=i),e.pending=i}function Cg(e,i,r){if((r&4194048)!==0){var l=i.lanes;l&=e.pendingLanes,r|=l,i.lanes=r,Ze(e,r)}}var Qo={readContext:Wn,use:vc,useCallback:yn,useContext:yn,useEffect:yn,useImperativeHandle:yn,useLayoutEffect:yn,useInsertionEffect:yn,useMemo:yn,useReducer:yn,useRef:yn,useState:yn,useDebugValue:yn,useDeferredValue:yn,useTransition:yn,useSyncExternalStore:yn,useId:yn,useHostTransitionStatus:yn,useFormState:yn,useActionState:yn,useOptimistic:yn,useMemoCache:yn,useCacheRefresh:yn};Qo.useEffectEvent=yn;var wg={readContext:Wn,use:vc,useCallback:function(e,i){return ai().memoizedState=[e,i===void 0?null:i],e},useContext:Wn,useEffect:hg,useImperativeHandle:function(e,i,r){r=r!=null?r.concat([e]):null,yc(4194308,4,gg.bind(null,i,e),r)},useLayoutEffect:function(e,i){return yc(4194308,4,e,i)},useInsertionEffect:function(e,i){yc(4,2,e,i)},useMemo:function(e,i){var r=ai();i=i===void 0?null:i;var l=e();if(tr){Ot(!0);try{e()}finally{Ot(!1)}}return r.memoizedState=[l,i],l},useReducer:function(e,i,r){var l=ai();if(r!==void 0){var f=r(i);if(tr){Ot(!0);try{r(i)}finally{Ot(!1)}}}else f=i;return l.memoizedState=l.baseState=f,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:f},l.queue=e,e=e.dispatch=mM.bind(null,Ee,e),[l.memoizedState,e]},useRef:function(e){var i=ai();return e={current:e},i.memoizedState=e},useState:function(e){e=ph(e);var i=e.queue,r=Ag.bind(null,Ee,i);return i.dispatch=r,[e.memoizedState,r]},useDebugValue:_h,useDeferredValue:function(e,i){var r=ai();return vh(r,e,i)},useTransition:function(){var e=ph(!1);return e=Sg.bind(null,Ee,e.queue,!0,!1),ai().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,i,r){var l=Ee,f=ai();if(Fe){if(r===void 0)throw Error(s(407));r=r()}else{if(r=i(),ln===null)throw Error(s(349));(Pe&127)!==0||j0(l,i,r)}f.memoizedState=r;var p={value:r,getSnapshot:i};return f.queue=p,hg(J0.bind(null,l,p,e),[e]),l.flags|=2048,zr(9,{destroy:void 0},Q0.bind(null,l,p,r,i),null),r},useId:function(){var e=ai(),i=ln.identifierPrefix;if(Fe){var r=ha,l=fa;r=(l&~(1<<32-Bt(l)-1)).toString(32)+r,i="_"+i+"R_"+r,r=gc++,0<r&&(i+="H"+r.toString(32)),i+="_"}else r=lM++,i="_"+i+"r_"+r.toString(32)+"_";return e.memoizedState=i},useHostTransitionStatus:yh,useFormState:og,useActionState:og,useOptimistic:function(e){var i=ai();i.memoizedState=i.baseState=e;var r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return i.queue=r,i=Sh.bind(null,Ee,!0,r),r.dispatch=i,[e,i]},useMemoCache:fh,useCacheRefresh:function(){return ai().memoizedState=pM.bind(null,Ee)},useEffectEvent:function(e){var i=ai(),r={impl:e};return i.memoizedState=r,function(){if((Ye&2)!==0)throw Error(s(440));return r.impl.apply(void 0,arguments)}}},Mh={readContext:Wn,use:vc,useCallback:vg,useContext:Wn,useEffect:gh,useImperativeHandle:_g,useInsertionEffect:pg,useLayoutEffect:mg,useMemo:xg,useReducer:xc,useRef:fg,useState:function(){return xc(La)},useDebugValue:_h,useDeferredValue:function(e,i){var r=An();return yg(r,nn.memoizedState,e,i)},useTransition:function(){var e=xc(La)[0],i=An().memoizedState;return[typeof e=="boolean"?e:Ko(e),i]},useSyncExternalStore:K0,useId:Eg,useHostTransitionStatus:yh,useFormState:lg,useActionState:lg,useOptimistic:function(e,i){var r=An();return eg(r,nn,e,i)},useMemoCache:fh,useCacheRefresh:Tg};Mh.useEffectEvent=dg;var Dg={readContext:Wn,use:vc,useCallback:vg,useContext:Wn,useEffect:gh,useImperativeHandle:_g,useInsertionEffect:pg,useLayoutEffect:mg,useMemo:xg,useReducer:dh,useRef:fg,useState:function(){return dh(La)},useDebugValue:_h,useDeferredValue:function(e,i){var r=An();return nn===null?vh(r,e,i):yg(r,nn.memoizedState,e,i)},useTransition:function(){var e=dh(La)[0],i=An().memoizedState;return[typeof e=="boolean"?e:Ko(e),i]},useSyncExternalStore:K0,useId:Eg,useHostTransitionStatus:yh,useFormState:ug,useActionState:ug,useOptimistic:function(e,i){var r=An();return nn!==null?eg(r,nn,e,i):(r.baseState=e,[e,r.queue.dispatch])},useMemoCache:fh,useCacheRefresh:Tg};Dg.useEffectEvent=dg;function bh(e,i,r,l){i=e.memoizedState,r=r(l,i),r=r==null?i:v({},i,r),e.memoizedState=r,e.lanes===0&&(e.updateQueue.baseState=r)}var Eh={enqueueSetState:function(e,i,r){e=e._reactInternals;var l=Ai(),f=ls(l);f.payload=i,r!=null&&(f.callback=r),i=cs(e,f,l),i!==null&&(mi(i,e,l),Wo(i,e,l))},enqueueReplaceState:function(e,i,r){e=e._reactInternals;var l=Ai(),f=ls(l);f.tag=1,f.payload=i,r!=null&&(f.callback=r),i=cs(e,f,l),i!==null&&(mi(i,e,l),Wo(i,e,l))},enqueueForceUpdate:function(e,i){e=e._reactInternals;var r=Ai(),l=ls(r);l.tag=2,i!=null&&(l.callback=i),i=cs(e,l,r),i!==null&&(mi(i,e,r),Wo(i,e,r))}};function Ug(e,i,r,l,f,p,M){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(l,p,M):i.prototype&&i.prototype.isPureReactComponent?!Fo(r,l)||!Fo(f,p):!0}function Lg(e,i,r,l){e=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(r,l),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(r,l),i.state!==e&&Eh.enqueueReplaceState(i,i.state,null)}function er(e,i){var r=i;if("ref"in i){r={};for(var l in i)l!=="ref"&&(r[l]=i[l])}if(e=e.defaultProps){r===i&&(r=v({},r));for(var f in e)r[f]===void 0&&(r[f]=e[f])}return r}function Ng(e){tc(e)}function Pg(e){console.error(e)}function Og(e){tc(e)}function bc(e,i){try{var r=e.onUncaughtError;r(i.value,{componentStack:i.stack})}catch(l){setTimeout(function(){throw l})}}function zg(e,i,r){try{var l=e.onCaughtError;l(r.value,{componentStack:r.stack,errorBoundary:i.tag===1?i.stateNode:null})}catch(f){setTimeout(function(){throw f})}}function Th(e,i,r){return r=ls(r),r.tag=3,r.payload={element:null},r.callback=function(){bc(e,i)},r}function Fg(e){return e=ls(e),e.tag=3,e}function Ig(e,i,r,l){var f=r.type.getDerivedStateFromError;if(typeof f=="function"){var p=l.value;e.payload=function(){return f(p)},e.callback=function(){zg(i,r,l)}}var M=r.stateNode;M!==null&&typeof M.componentDidCatch=="function"&&(e.callback=function(){zg(i,r,l),typeof f!="function"&&(ms===null?ms=new Set([this]):ms.add(this));var U=l.stack;this.componentDidCatch(l.value,{componentStack:U!==null?U:""})})}function gM(e,i,r,l,f){if(r.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){if(i=r.alternate,i!==null&&Cr(i,r,f,!0),r=Mi.current,r!==null){switch(r.tag){case 31:case 13:return Hi===null?Oc():r.alternate===null&&Sn===0&&(Sn=3),r.flags&=-257,r.flags|=65536,r.lanes=f,l===uc?r.flags|=16384:(i=r.updateQueue,i===null?r.updateQueue=new Set([l]):i.add(l),jh(e,l,f)),!1;case 22:return r.flags|=65536,l===uc?r.flags|=16384:(i=r.updateQueue,i===null?(i={transitions:null,markerInstances:null,retryQueue:new Set([l])},r.updateQueue=i):(r=i.retryQueue,r===null?i.retryQueue=new Set([l]):r.add(l)),jh(e,l,f)),!1}throw Error(s(435,r.tag))}return jh(e,l,f),Oc(),!1}if(Fe)return i=Mi.current,i!==null?((i.flags&65536)===0&&(i.flags|=256),i.flags|=65536,i.lanes=f,l!==Xf&&(e=Error(s(422),{cause:l}),Ho(zi(e,r)))):(l!==Xf&&(i=Error(s(423),{cause:l}),Ho(zi(i,r))),e=e.current.alternate,e.flags|=65536,f&=-f,e.lanes|=f,l=zi(l,r),f=Th(e.stateNode,l,f),eh(e,f),Sn!==4&&(Sn=2)),!1;var p=Error(s(520),{cause:l});if(p=zi(p,r),sl===null?sl=[p]:sl.push(p),Sn!==4&&(Sn=2),i===null)return!0;l=zi(l,r),r=i;do{switch(r.tag){case 3:return r.flags|=65536,e=f&-f,r.lanes|=e,e=Th(r.stateNode,l,e),eh(r,e),!1;case 1:if(i=r.type,p=r.stateNode,(r.flags&128)===0&&(typeof i.getDerivedStateFromError=="function"||p!==null&&typeof p.componentDidCatch=="function"&&(ms===null||!ms.has(p))))return r.flags|=65536,f&=-f,r.lanes|=f,f=Fg(f),Ig(f,e,r,l),eh(r,f),!1}r=r.return}while(r!==null);return!1}var Ah=Error(s(461)),Dn=!1;function qn(e,i,r,l){i.child=e===null?V0(i,null,r,l):$s(i,e.child,r,l)}function Bg(e,i,r,l,f){r=r.render;var p=i.ref;if("ref"in l){var M={};for(var U in l)U!=="ref"&&(M[U]=l[U])}else M=l;return Ks(i),l=oh(e,i,r,M,p,f),U=lh(),e!==null&&!Dn?(ch(e,i,f),Na(e,i,f)):(Fe&&U&&Vf(i),i.flags|=1,qn(e,i,l,f),i.child)}function Hg(e,i,r,l,f){if(e===null){var p=r.type;return typeof p=="function"&&!Bf(p)&&p.defaultProps===void 0&&r.compare===null?(i.tag=15,i.type=p,Gg(e,i,p,l,f)):(e=ac(r.type,null,l,i,i.mode,f),e.ref=i.ref,e.return=i,i.child=e)}if(p=e.child,!Ph(e,f)){var M=p.memoizedProps;if(r=r.compare,r=r!==null?r:Fo,r(M,l)&&e.ref===i.ref)return Na(e,i,f)}return i.flags|=1,e=Ra(p,l),e.ref=i.ref,e.return=i,i.child=e}function Gg(e,i,r,l,f){if(e!==null){var p=e.memoizedProps;if(Fo(p,l)&&e.ref===i.ref)if(Dn=!1,i.pendingProps=l=p,Ph(e,f))(e.flags&131072)!==0&&(Dn=!0);else return i.lanes=e.lanes,Na(e,i,f)}return Rh(e,i,r,l,f)}function Vg(e,i,r,l){var f=l.children,p=e!==null?e.memoizedState:null;if(e===null&&i.stateNode===null&&(i.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),l.mode==="hidden"){if((i.flags&128)!==0){if(p=p!==null?p.baseLanes|r:r,e!==null){for(l=i.child=e.child,f=0;l!==null;)f=f|l.lanes|l.childLanes,l=l.sibling;l=f&~p}else l=0,i.child=null;return kg(e,i,p,r,l)}if((r&536870912)!==0)i.memoizedState={baseLanes:0,cachePool:null},e!==null&&lc(i,p!==null?p.cachePool:null),p!==null?W0(i,p):ih(),q0(i);else return l=i.lanes=536870912,kg(e,i,p!==null?p.baseLanes|r:r,r,l)}else p!==null?(lc(i,p.cachePool),W0(i,p),fs(),i.memoizedState=null):(e!==null&&lc(i,null),ih(),fs());return qn(e,i,f,r),i.child}function Jo(e,i){return e!==null&&e.tag===22||i.stateNode!==null||(i.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.sibling}function kg(e,i,r,l,f){var p=Qf();return p=p===null?null:{parent:Cn._currentValue,pool:p},i.memoizedState={baseLanes:r,cachePool:p},e!==null&&lc(i,null),ih(),q0(i),e!==null&&Cr(e,i,l,!0),i.childLanes=f,null}function Ec(e,i){return i=Ac({mode:i.mode,children:i.children},e.mode),i.ref=e.ref,e.child=i,i.return=e,i}function Xg(e,i,r){return $s(i,e.child,null,r),e=Ec(i,i.pendingProps),e.flags|=2,bi(i),i.memoizedState=null,e}function _M(e,i,r){var l=i.pendingProps,f=(i.flags&128)!==0;if(i.flags&=-129,e===null){if(Fe){if(l.mode==="hidden")return e=Ec(i,l),i.lanes=536870912,Jo(null,e);if(sh(i),(e=fn)?(e=nv(e,Bi),e=e!==null&&e.data==="&"?e:null,e!==null&&(i.memoizedState={dehydrated:e,treeContext:is!==null?{id:fa,overflow:ha}:null,retryLane:536870912,hydrationErrors:null},r=R0(e),r.return=i,i.child=r,Xn=i,fn=null)):e=null,e===null)throw ss(i);return i.lanes=536870912,null}return Ec(i,l)}var p=e.memoizedState;if(p!==null){var M=p.dehydrated;if(sh(i),f)if(i.flags&256)i.flags&=-257,i=Xg(e,i,r);else if(i.memoizedState!==null)i.child=e.child,i.flags|=128,i=null;else throw Error(s(558));else if(Dn||Cr(e,i,r,!1),f=(r&e.childLanes)!==0,Dn||f){if(l=ln,l!==null&&(M=_n(l,r),M!==0&&M!==p.retryLane))throw p.retryLane=M,Ws(e,M),mi(l,e,M),Ah;Oc(),i=Xg(e,i,r)}else e=p.treeContext,fn=Gi(M.nextSibling),Xn=i,Fe=!0,as=null,Bi=!1,e!==null&&D0(i,e),i=Ec(i,l),i.flags|=4096;return i}return e=Ra(e.child,{mode:l.mode,children:l.children}),e.ref=i.ref,i.child=e,e.return=i,e}function Tc(e,i){var r=i.ref;if(r===null)e!==null&&e.ref!==null&&(i.flags|=4194816);else{if(typeof r!="function"&&typeof r!="object")throw Error(s(284));(e===null||e.ref!==r)&&(i.flags|=4194816)}}function Rh(e,i,r,l,f){return Ks(i),r=oh(e,i,r,l,void 0,f),l=lh(),e!==null&&!Dn?(ch(e,i,f),Na(e,i,f)):(Fe&&l&&Vf(i),i.flags|=1,qn(e,i,r,f),i.child)}function Wg(e,i,r,l,f,p){return Ks(i),i.updateQueue=null,r=Z0(i,l,r,f),Y0(e),l=lh(),e!==null&&!Dn?(ch(e,i,p),Na(e,i,p)):(Fe&&l&&Vf(i),i.flags|=1,qn(e,i,r,p),i.child)}function qg(e,i,r,l,f){if(Ks(i),i.stateNode===null){var p=Er,M=r.contextType;typeof M=="object"&&M!==null&&(p=Wn(M)),p=new r(l,p),i.memoizedState=p.state!==null&&p.state!==void 0?p.state:null,p.updater=Eh,i.stateNode=p,p._reactInternals=i,p=i.stateNode,p.props=l,p.state=i.memoizedState,p.refs={},$f(i),M=r.contextType,p.context=typeof M=="object"&&M!==null?Wn(M):Er,p.state=i.memoizedState,M=r.getDerivedStateFromProps,typeof M=="function"&&(bh(i,r,M,l),p.state=i.memoizedState),typeof r.getDerivedStateFromProps=="function"||typeof p.getSnapshotBeforeUpdate=="function"||typeof p.UNSAFE_componentWillMount!="function"&&typeof p.componentWillMount!="function"||(M=p.state,typeof p.componentWillMount=="function"&&p.componentWillMount(),typeof p.UNSAFE_componentWillMount=="function"&&p.UNSAFE_componentWillMount(),M!==p.state&&Eh.enqueueReplaceState(p,p.state,null),Yo(i,l,p,f),qo(),p.state=i.memoizedState),typeof p.componentDidMount=="function"&&(i.flags|=4194308),l=!0}else if(e===null){p=i.stateNode;var U=i.memoizedProps,k=er(r,U);p.props=k;var ot=p.context,Tt=r.contextType;M=Er,typeof Tt=="object"&&Tt!==null&&(M=Wn(Tt));var wt=r.getDerivedStateFromProps;Tt=typeof wt=="function"||typeof p.getSnapshotBeforeUpdate=="function",U=i.pendingProps!==U,Tt||typeof p.UNSAFE_componentWillReceiveProps!="function"&&typeof p.componentWillReceiveProps!="function"||(U||ot!==M)&&Lg(i,p,l,M),os=!1;var dt=i.memoizedState;p.state=dt,Yo(i,l,p,f),qo(),ot=i.memoizedState,U||dt!==ot||os?(typeof wt=="function"&&(bh(i,r,wt,l),ot=i.memoizedState),(k=os||Ug(i,r,k,l,dt,ot,M))?(Tt||typeof p.UNSAFE_componentWillMount!="function"&&typeof p.componentWillMount!="function"||(typeof p.componentWillMount=="function"&&p.componentWillMount(),typeof p.UNSAFE_componentWillMount=="function"&&p.UNSAFE_componentWillMount()),typeof p.componentDidMount=="function"&&(i.flags|=4194308)):(typeof p.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=l,i.memoizedState=ot),p.props=l,p.state=ot,p.context=M,l=k):(typeof p.componentDidMount=="function"&&(i.flags|=4194308),l=!1)}else{p=i.stateNode,th(e,i),M=i.memoizedProps,Tt=er(r,M),p.props=Tt,wt=i.pendingProps,dt=p.context,ot=r.contextType,k=Er,typeof ot=="object"&&ot!==null&&(k=Wn(ot)),U=r.getDerivedStateFromProps,(ot=typeof U=="function"||typeof p.getSnapshotBeforeUpdate=="function")||typeof p.UNSAFE_componentWillReceiveProps!="function"&&typeof p.componentWillReceiveProps!="function"||(M!==wt||dt!==k)&&Lg(i,p,l,k),os=!1,dt=i.memoizedState,p.state=dt,Yo(i,l,p,f),qo();var _t=i.memoizedState;M!==wt||dt!==_t||os||e!==null&&e.dependencies!==null&&rc(e.dependencies)?(typeof U=="function"&&(bh(i,r,U,l),_t=i.memoizedState),(Tt=os||Ug(i,r,Tt,l,dt,_t,k)||e!==null&&e.dependencies!==null&&rc(e.dependencies))?(ot||typeof p.UNSAFE_componentWillUpdate!="function"&&typeof p.componentWillUpdate!="function"||(typeof p.componentWillUpdate=="function"&&p.componentWillUpdate(l,_t,k),typeof p.UNSAFE_componentWillUpdate=="function"&&p.UNSAFE_componentWillUpdate(l,_t,k)),typeof p.componentDidUpdate=="function"&&(i.flags|=4),typeof p.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof p.componentDidUpdate!="function"||M===e.memoizedProps&&dt===e.memoizedState||(i.flags|=4),typeof p.getSnapshotBeforeUpdate!="function"||M===e.memoizedProps&&dt===e.memoizedState||(i.flags|=1024),i.memoizedProps=l,i.memoizedState=_t),p.props=l,p.state=_t,p.context=k,l=Tt):(typeof p.componentDidUpdate!="function"||M===e.memoizedProps&&dt===e.memoizedState||(i.flags|=4),typeof p.getSnapshotBeforeUpdate!="function"||M===e.memoizedProps&&dt===e.memoizedState||(i.flags|=1024),l=!1)}return p=l,Tc(e,i),l=(i.flags&128)!==0,p||l?(p=i.stateNode,r=l&&typeof r.getDerivedStateFromError!="function"?null:p.render(),i.flags|=1,e!==null&&l?(i.child=$s(i,e.child,null,f),i.child=$s(i,null,r,f)):qn(e,i,r,f),i.memoizedState=p.state,e=i.child):e=Na(e,i,f),e}function Yg(e,i,r,l){return Ys(),i.flags|=256,qn(e,i,r,l),i.child}var Ch={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function wh(e){return{baseLanes:e,cachePool:z0()}}function Dh(e,i,r){return e=e!==null?e.childLanes&~r:0,i&&(e|=Ti),e}function Zg(e,i,r){var l=i.pendingProps,f=!1,p=(i.flags&128)!==0,M;if((M=p)||(M=e!==null&&e.memoizedState===null?!1:(Tn.current&2)!==0),M&&(f=!0,i.flags&=-129),M=(i.flags&32)!==0,i.flags&=-33,e===null){if(Fe){if(f?us(i):fs(),(e=fn)?(e=nv(e,Bi),e=e!==null&&e.data!=="&"?e:null,e!==null&&(i.memoizedState={dehydrated:e,treeContext:is!==null?{id:fa,overflow:ha}:null,retryLane:536870912,hydrationErrors:null},r=R0(e),r.return=i,i.child=r,Xn=i,fn=null)):e=null,e===null)throw ss(i);return hd(e)?i.lanes=32:i.lanes=536870912,null}var U=l.children;return l=l.fallback,f?(fs(),f=i.mode,U=Ac({mode:"hidden",children:U},f),l=qs(l,f,r,null),U.return=i,l.return=i,U.sibling=l,i.child=U,l=i.child,l.memoizedState=wh(r),l.childLanes=Dh(e,M,r),i.memoizedState=Ch,Jo(null,l)):(us(i),Uh(i,U))}var k=e.memoizedState;if(k!==null&&(U=k.dehydrated,U!==null)){if(p)i.flags&256?(us(i),i.flags&=-257,i=Lh(e,i,r)):i.memoizedState!==null?(fs(),i.child=e.child,i.flags|=128,i=null):(fs(),U=l.fallback,f=i.mode,l=Ac({mode:"visible",children:l.children},f),U=qs(U,f,r,null),U.flags|=2,l.return=i,U.return=i,l.sibling=U,i.child=l,$s(i,e.child,null,r),l=i.child,l.memoizedState=wh(r),l.childLanes=Dh(e,M,r),i.memoizedState=Ch,i=Jo(null,l));else if(us(i),hd(U)){if(M=U.nextSibling&&U.nextSibling.dataset,M)var ot=M.dgst;M=ot,l=Error(s(419)),l.stack="",l.digest=M,Ho({value:l,source:null,stack:null}),i=Lh(e,i,r)}else if(Dn||Cr(e,i,r,!1),M=(r&e.childLanes)!==0,Dn||M){if(M=ln,M!==null&&(l=_n(M,r),l!==0&&l!==k.retryLane))throw k.retryLane=l,Ws(e,l),mi(M,e,l),Ah;fd(U)||Oc(),i=Lh(e,i,r)}else fd(U)?(i.flags|=192,i.child=e.child,i=null):(e=k.treeContext,fn=Gi(U.nextSibling),Xn=i,Fe=!0,as=null,Bi=!1,e!==null&&D0(i,e),i=Uh(i,l.children),i.flags|=4096);return i}return f?(fs(),U=l.fallback,f=i.mode,k=e.child,ot=k.sibling,l=Ra(k,{mode:"hidden",children:l.children}),l.subtreeFlags=k.subtreeFlags&65011712,ot!==null?U=Ra(ot,U):(U=qs(U,f,r,null),U.flags|=2),U.return=i,l.return=i,l.sibling=U,i.child=l,Jo(null,l),l=i.child,U=e.child.memoizedState,U===null?U=wh(r):(f=U.cachePool,f!==null?(k=Cn._currentValue,f=f.parent!==k?{parent:k,pool:k}:f):f=z0(),U={baseLanes:U.baseLanes|r,cachePool:f}),l.memoizedState=U,l.childLanes=Dh(e,M,r),i.memoizedState=Ch,Jo(e.child,l)):(us(i),r=e.child,e=r.sibling,r=Ra(r,{mode:"visible",children:l.children}),r.return=i,r.sibling=null,e!==null&&(M=i.deletions,M===null?(i.deletions=[e],i.flags|=16):M.push(e)),i.child=r,i.memoizedState=null,r)}function Uh(e,i){return i=Ac({mode:"visible",children:i},e.mode),i.return=e,e.child=i}function Ac(e,i){return e=Si(22,e,null,i),e.lanes=0,e}function Lh(e,i,r){return $s(i,e.child,null,r),e=Uh(i,i.pendingProps.children),e.flags|=2,i.memoizedState=null,e}function Kg(e,i,r){e.lanes|=i;var l=e.alternate;l!==null&&(l.lanes|=i),Yf(e.return,i,r)}function Nh(e,i,r,l,f,p){var M=e.memoizedState;M===null?e.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:l,tail:r,tailMode:f,treeForkCount:p}:(M.isBackwards=i,M.rendering=null,M.renderingStartTime=0,M.last=l,M.tail=r,M.tailMode=f,M.treeForkCount=p)}function jg(e,i,r){var l=i.pendingProps,f=l.revealOrder,p=l.tail;l=l.children;var M=Tn.current,U=(M&2)!==0;if(U?(M=M&1|2,i.flags|=128):M&=1,vt(Tn,M),qn(e,i,l,r),l=Fe?Bo:0,!U&&e!==null&&(e.flags&128)!==0)t:for(e=i.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Kg(e,r,i);else if(e.tag===19)Kg(e,r,i);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===i)break t;for(;e.sibling===null;){if(e.return===null||e.return===i)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(f){case"forwards":for(r=i.child,f=null;r!==null;)e=r.alternate,e!==null&&pc(e)===null&&(f=r),r=r.sibling;r=f,r===null?(f=i.child,i.child=null):(f=r.sibling,r.sibling=null),Nh(i,!1,f,r,p,l);break;case"backwards":case"unstable_legacy-backwards":for(r=null,f=i.child,i.child=null;f!==null;){if(e=f.alternate,e!==null&&pc(e)===null){i.child=f;break}e=f.sibling,f.sibling=r,r=f,f=e}Nh(i,!0,r,null,p,l);break;case"together":Nh(i,!1,null,null,void 0,l);break;default:i.memoizedState=null}return i.child}function Na(e,i,r){if(e!==null&&(i.dependencies=e.dependencies),ps|=i.lanes,(r&i.childLanes)===0)if(e!==null){if(Cr(e,i,r,!1),(r&i.childLanes)===0)return null}else return null;if(e!==null&&i.child!==e.child)throw Error(s(153));if(i.child!==null){for(e=i.child,r=Ra(e,e.pendingProps),i.child=r,r.return=i;e.sibling!==null;)e=e.sibling,r=r.sibling=Ra(e,e.pendingProps),r.return=i;r.sibling=null}return i.child}function Ph(e,i){return(e.lanes&i)!==0?!0:(e=e.dependencies,!!(e!==null&&rc(e)))}function vM(e,i,r){switch(i.tag){case 3:xt(i,i.stateNode.containerInfo),rs(i,Cn,e.memoizedState.cache),Ys();break;case 27:case 5:Dt(i);break;case 4:xt(i,i.stateNode.containerInfo);break;case 10:rs(i,i.type,i.memoizedProps.value);break;case 31:if(i.memoizedState!==null)return i.flags|=128,sh(i),null;break;case 13:var l=i.memoizedState;if(l!==null)return l.dehydrated!==null?(us(i),i.flags|=128,null):(r&i.child.childLanes)!==0?Zg(e,i,r):(us(i),e=Na(e,i,r),e!==null?e.sibling:null);us(i);break;case 19:var f=(e.flags&128)!==0;if(l=(r&i.childLanes)!==0,l||(Cr(e,i,r,!1),l=(r&i.childLanes)!==0),f){if(l)return jg(e,i,r);i.flags|=128}if(f=i.memoizedState,f!==null&&(f.rendering=null,f.tail=null,f.lastEffect=null),vt(Tn,Tn.current),l)break;return null;case 22:return i.lanes=0,Vg(e,i,r,i.pendingProps);case 24:rs(i,Cn,e.memoizedState.cache)}return Na(e,i,r)}function Qg(e,i,r){if(e!==null)if(e.memoizedProps!==i.pendingProps)Dn=!0;else{if(!Ph(e,r)&&(i.flags&128)===0)return Dn=!1,vM(e,i,r);Dn=(e.flags&131072)!==0}else Dn=!1,Fe&&(i.flags&1048576)!==0&&w0(i,Bo,i.index);switch(i.lanes=0,i.tag){case 16:t:{var l=i.pendingProps;if(e=Qs(i.elementType),i.type=e,typeof e=="function")Bf(e)?(l=er(e,l),i.tag=1,i=qg(null,i,e,l,r)):(i.tag=0,i=Rh(null,i,e,l,r));else{if(e!=null){var f=e.$$typeof;if(f===C){i.tag=11,i=Bg(null,i,e,l,r);break t}else if(f===B){i.tag=14,i=Hg(null,i,e,l,r);break t}}throw i=ct(e)||e,Error(s(306,i,""))}}return i;case 0:return Rh(e,i,i.type,i.pendingProps,r);case 1:return l=i.type,f=er(l,i.pendingProps),qg(e,i,l,f,r);case 3:t:{if(xt(i,i.stateNode.containerInfo),e===null)throw Error(s(387));l=i.pendingProps;var p=i.memoizedState;f=p.element,th(e,i),Yo(i,l,null,r);var M=i.memoizedState;if(l=M.cache,rs(i,Cn,l),l!==p.cache&&Zf(i,[Cn],r,!0),qo(),l=M.element,p.isDehydrated)if(p={element:l,isDehydrated:!1,cache:M.cache},i.updateQueue.baseState=p,i.memoizedState=p,i.flags&256){i=Yg(e,i,l,r);break t}else if(l!==f){f=zi(Error(s(424)),i),Ho(f),i=Yg(e,i,l,r);break t}else for(e=i.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,fn=Gi(e.firstChild),Xn=i,Fe=!0,as=null,Bi=!0,r=V0(i,null,l,r),i.child=r;r;)r.flags=r.flags&-3|4096,r=r.sibling;else{if(Ys(),l===f){i=Na(e,i,r);break t}qn(e,i,l,r)}i=i.child}return i;case 26:return Tc(e,i),e===null?(r=lv(i.type,null,i.pendingProps,null))?i.memoizedState=r:Fe||(r=i.type,e=i.pendingProps,l=Vc(K.current).createElement(r),l[Ke]=i,l[$e]=e,Yn(l,r,e),pn(l),i.stateNode=l):i.memoizedState=lv(i.type,e.memoizedProps,i.pendingProps,e.memoizedState),null;case 27:return Dt(i),e===null&&Fe&&(l=i.stateNode=sv(i.type,i.pendingProps,K.current),Xn=i,Bi=!0,f=fn,xs(i.type)?(dd=f,fn=Gi(l.firstChild)):fn=f),qn(e,i,i.pendingProps.children,r),Tc(e,i),e===null&&(i.flags|=4194304),i.child;case 5:return e===null&&Fe&&((f=l=fn)&&(l=ZM(l,i.type,i.pendingProps,Bi),l!==null?(i.stateNode=l,Xn=i,fn=Gi(l.firstChild),Bi=!1,f=!0):f=!1),f||ss(i)),Dt(i),f=i.type,p=i.pendingProps,M=e!==null?e.memoizedProps:null,l=p.children,ld(f,p)?l=null:M!==null&&ld(f,M)&&(i.flags|=32),i.memoizedState!==null&&(f=oh(e,i,cM,null,null,r),dl._currentValue=f),Tc(e,i),qn(e,i,l,r),i.child;case 6:return e===null&&Fe&&((e=r=fn)&&(r=KM(r,i.pendingProps,Bi),r!==null?(i.stateNode=r,Xn=i,fn=null,e=!0):e=!1),e||ss(i)),null;case 13:return Zg(e,i,r);case 4:return xt(i,i.stateNode.containerInfo),l=i.pendingProps,e===null?i.child=$s(i,null,l,r):qn(e,i,l,r),i.child;case 11:return Bg(e,i,i.type,i.pendingProps,r);case 7:return qn(e,i,i.pendingProps,r),i.child;case 8:return qn(e,i,i.pendingProps.children,r),i.child;case 12:return qn(e,i,i.pendingProps.children,r),i.child;case 10:return l=i.pendingProps,rs(i,i.type,l.value),qn(e,i,l.children,r),i.child;case 9:return f=i.type._context,l=i.pendingProps.children,Ks(i),f=Wn(f),l=l(f),i.flags|=1,qn(e,i,l,r),i.child;case 14:return Hg(e,i,i.type,i.pendingProps,r);case 15:return Gg(e,i,i.type,i.pendingProps,r);case 19:return jg(e,i,r);case 31:return _M(e,i,r);case 22:return Vg(e,i,r,i.pendingProps);case 24:return Ks(i),l=Wn(Cn),e===null?(f=Qf(),f===null&&(f=ln,p=Kf(),f.pooledCache=p,p.refCount++,p!==null&&(f.pooledCacheLanes|=r),f=p),i.memoizedState={parent:l,cache:f},$f(i),rs(i,Cn,f)):((e.lanes&r)!==0&&(th(e,i),Yo(i,null,null,r),qo()),f=e.memoizedState,p=i.memoizedState,f.parent!==l?(f={parent:l,cache:l},i.memoizedState=f,i.lanes===0&&(i.memoizedState=i.updateQueue.baseState=f),rs(i,Cn,l)):(l=p.cache,rs(i,Cn,l),l!==f.cache&&Zf(i,[Cn],r,!0))),qn(e,i,i.pendingProps.children,r),i.child;case 29:throw i.pendingProps}throw Error(s(156,i.tag))}function Pa(e){e.flags|=4}function Oh(e,i,r,l,f){if((i=(e.mode&32)!==0)&&(i=!1),i){if(e.flags|=16777216,(f&335544128)===f)if(e.stateNode.complete)e.flags|=8192;else if(E_())e.flags|=8192;else throw Js=uc,Jf}else e.flags&=-16777217}function Jg(e,i){if(i.type!=="stylesheet"||(i.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!dv(i))if(E_())e.flags|=8192;else throw Js=uc,Jf}function Rc(e,i){i!==null&&(e.flags|=4),e.flags&16384&&(i=e.tag!==22?At():536870912,e.lanes|=i,Hr|=i)}function $o(e,i){if(!Fe)switch(e.tailMode){case"hidden":i=e.tail;for(var r=null;i!==null;)i.alternate!==null&&(r=i),i=i.sibling;r===null?e.tail=null:r.sibling=null;break;case"collapsed":r=e.tail;for(var l=null;r!==null;)r.alternate!==null&&(l=r),r=r.sibling;l===null?i||e.tail===null?e.tail=null:e.tail.sibling=null:l.sibling=null}}function hn(e){var i=e.alternate!==null&&e.alternate.child===e.child,r=0,l=0;if(i)for(var f=e.child;f!==null;)r|=f.lanes|f.childLanes,l|=f.subtreeFlags&65011712,l|=f.flags&65011712,f.return=e,f=f.sibling;else for(f=e.child;f!==null;)r|=f.lanes|f.childLanes,l|=f.subtreeFlags,l|=f.flags,f.return=e,f=f.sibling;return e.subtreeFlags|=l,e.childLanes=r,i}function xM(e,i,r){var l=i.pendingProps;switch(kf(i),i.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return hn(i),null;case 1:return hn(i),null;case 3:return r=i.stateNode,l=null,e!==null&&(l=e.memoizedState.cache),i.memoizedState.cache!==l&&(i.flags|=2048),Da(Cn),Et(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Rr(i)?Pa(i):e===null||e.memoizedState.isDehydrated&&(i.flags&256)===0||(i.flags|=1024,Wf())),hn(i),null;case 26:var f=i.type,p=i.memoizedState;return e===null?(Pa(i),p!==null?(hn(i),Jg(i,p)):(hn(i),Oh(i,f,null,l,r))):p?p!==e.memoizedState?(Pa(i),hn(i),Jg(i,p)):(hn(i),i.flags&=-16777217):(e=e.memoizedProps,e!==l&&Pa(i),hn(i),Oh(i,f,e,l,r)),null;case 27:if(Ut(i),r=K.current,f=i.type,e!==null&&i.stateNode!=null)e.memoizedProps!==l&&Pa(i);else{if(!l){if(i.stateNode===null)throw Error(s(166));return hn(i),null}e=Ct.current,Rr(i)?U0(i):(e=sv(f,l,r),i.stateNode=e,Pa(i))}return hn(i),null;case 5:if(Ut(i),f=i.type,e!==null&&i.stateNode!=null)e.memoizedProps!==l&&Pa(i);else{if(!l){if(i.stateNode===null)throw Error(s(166));return hn(i),null}if(p=Ct.current,Rr(i))U0(i);else{var M=Vc(K.current);switch(p){case 1:p=M.createElementNS("http://www.w3.org/2000/svg",f);break;case 2:p=M.createElementNS("http://www.w3.org/1998/Math/MathML",f);break;default:switch(f){case"svg":p=M.createElementNS("http://www.w3.org/2000/svg",f);break;case"math":p=M.createElementNS("http://www.w3.org/1998/Math/MathML",f);break;case"script":p=M.createElement("div"),p.innerHTML="<script><\/script>",p=p.removeChild(p.firstChild);break;case"select":p=typeof l.is=="string"?M.createElement("select",{is:l.is}):M.createElement("select"),l.multiple?p.multiple=!0:l.size&&(p.size=l.size);break;default:p=typeof l.is=="string"?M.createElement(f,{is:l.is}):M.createElement(f)}}p[Ke]=i,p[$e]=l;t:for(M=i.child;M!==null;){if(M.tag===5||M.tag===6)p.appendChild(M.stateNode);else if(M.tag!==4&&M.tag!==27&&M.child!==null){M.child.return=M,M=M.child;continue}if(M===i)break t;for(;M.sibling===null;){if(M.return===null||M.return===i)break t;M=M.return}M.sibling.return=M.return,M=M.sibling}i.stateNode=p;t:switch(Yn(p,f,l),f){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break t;case"img":l=!0;break t;default:l=!1}l&&Pa(i)}}return hn(i),Oh(i,i.type,e===null?null:e.memoizedProps,i.pendingProps,r),null;case 6:if(e&&i.stateNode!=null)e.memoizedProps!==l&&Pa(i);else{if(typeof l!="string"&&i.stateNode===null)throw Error(s(166));if(e=K.current,Rr(i)){if(e=i.stateNode,r=i.memoizedProps,l=null,f=Xn,f!==null)switch(f.tag){case 27:case 5:l=f.memoizedProps}e[Ke]=i,e=!!(e.nodeValue===r||l!==null&&l.suppressHydrationWarning===!0||Z_(e.nodeValue,r)),e||ss(i,!0)}else e=Vc(e).createTextNode(l),e[Ke]=i,i.stateNode=e}return hn(i),null;case 31:if(r=i.memoizedState,e===null||e.memoizedState!==null){if(l=Rr(i),r!==null){if(e===null){if(!l)throw Error(s(318));if(e=i.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(557));e[Ke]=i}else Ys(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;hn(i),e=!1}else r=Wf(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),e=!0;if(!e)return i.flags&256?(bi(i),i):(bi(i),null);if((i.flags&128)!==0)throw Error(s(558))}return hn(i),null;case 13:if(l=i.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(f=Rr(i),l!==null&&l.dehydrated!==null){if(e===null){if(!f)throw Error(s(318));if(f=i.memoizedState,f=f!==null?f.dehydrated:null,!f)throw Error(s(317));f[Ke]=i}else Ys(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;hn(i),f=!1}else f=Wf(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=f),f=!0;if(!f)return i.flags&256?(bi(i),i):(bi(i),null)}return bi(i),(i.flags&128)!==0?(i.lanes=r,i):(r=l!==null,e=e!==null&&e.memoizedState!==null,r&&(l=i.child,f=null,l.alternate!==null&&l.alternate.memoizedState!==null&&l.alternate.memoizedState.cachePool!==null&&(f=l.alternate.memoizedState.cachePool.pool),p=null,l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(p=l.memoizedState.cachePool.pool),p!==f&&(l.flags|=2048)),r!==e&&r&&(i.child.flags|=8192),Rc(i,i.updateQueue),hn(i),null);case 4:return Et(),e===null&&id(i.stateNode.containerInfo),hn(i),null;case 10:return Da(i.type),hn(i),null;case 19:if(q(Tn),l=i.memoizedState,l===null)return hn(i),null;if(f=(i.flags&128)!==0,p=l.rendering,p===null)if(f)$o(l,!1);else{if(Sn!==0||e!==null&&(e.flags&128)!==0)for(e=i.child;e!==null;){if(p=pc(e),p!==null){for(i.flags|=128,$o(l,!1),e=p.updateQueue,i.updateQueue=e,Rc(i,e),i.subtreeFlags=0,e=r,r=i.child;r!==null;)A0(r,e),r=r.sibling;return vt(Tn,Tn.current&1|2),Fe&&Ca(i,l.treeForkCount),i.child}e=e.sibling}l.tail!==null&&fe()>Lc&&(i.flags|=128,f=!0,$o(l,!1),i.lanes=4194304)}else{if(!f)if(e=pc(p),e!==null){if(i.flags|=128,f=!0,e=e.updateQueue,i.updateQueue=e,Rc(i,e),$o(l,!0),l.tail===null&&l.tailMode==="hidden"&&!p.alternate&&!Fe)return hn(i),null}else 2*fe()-l.renderingStartTime>Lc&&r!==536870912&&(i.flags|=128,f=!0,$o(l,!1),i.lanes=4194304);l.isBackwards?(p.sibling=i.child,i.child=p):(e=l.last,e!==null?e.sibling=p:i.child=p,l.last=p)}return l.tail!==null?(e=l.tail,l.rendering=e,l.tail=e.sibling,l.renderingStartTime=fe(),e.sibling=null,r=Tn.current,vt(Tn,f?r&1|2:r&1),Fe&&Ca(i,l.treeForkCount),e):(hn(i),null);case 22:case 23:return bi(i),ah(),l=i.memoizedState!==null,e!==null?e.memoizedState!==null!==l&&(i.flags|=8192):l&&(i.flags|=8192),l?(r&536870912)!==0&&(i.flags&128)===0&&(hn(i),i.subtreeFlags&6&&(i.flags|=8192)):hn(i),r=i.updateQueue,r!==null&&Rc(i,r.retryQueue),r=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(r=e.memoizedState.cachePool.pool),l=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(l=i.memoizedState.cachePool.pool),l!==r&&(i.flags|=2048),e!==null&&q(js),null;case 24:return r=null,e!==null&&(r=e.memoizedState.cache),i.memoizedState.cache!==r&&(i.flags|=2048),Da(Cn),hn(i),null;case 25:return null;case 30:return null}throw Error(s(156,i.tag))}function yM(e,i){switch(kf(i),i.tag){case 1:return e=i.flags,e&65536?(i.flags=e&-65537|128,i):null;case 3:return Da(Cn),Et(),e=i.flags,(e&65536)!==0&&(e&128)===0?(i.flags=e&-65537|128,i):null;case 26:case 27:case 5:return Ut(i),null;case 31:if(i.memoizedState!==null){if(bi(i),i.alternate===null)throw Error(s(340));Ys()}return e=i.flags,e&65536?(i.flags=e&-65537|128,i):null;case 13:if(bi(i),e=i.memoizedState,e!==null&&e.dehydrated!==null){if(i.alternate===null)throw Error(s(340));Ys()}return e=i.flags,e&65536?(i.flags=e&-65537|128,i):null;case 19:return q(Tn),null;case 4:return Et(),null;case 10:return Da(i.type),null;case 22:case 23:return bi(i),ah(),e!==null&&q(js),e=i.flags,e&65536?(i.flags=e&-65537|128,i):null;case 24:return Da(Cn),null;case 25:return null;default:return null}}function $g(e,i){switch(kf(i),i.tag){case 3:Da(Cn),Et();break;case 26:case 27:case 5:Ut(i);break;case 4:Et();break;case 31:i.memoizedState!==null&&bi(i);break;case 13:bi(i);break;case 19:q(Tn);break;case 10:Da(i.type);break;case 22:case 23:bi(i),ah(),e!==null&&q(js);break;case 24:Da(Cn)}}function tl(e,i){try{var r=i.updateQueue,l=r!==null?r.lastEffect:null;if(l!==null){var f=l.next;r=f;do{if((r.tag&e)===e){l=void 0;var p=r.create,M=r.inst;l=p(),M.destroy=l}r=r.next}while(r!==f)}}catch(U){en(i,i.return,U)}}function hs(e,i,r){try{var l=i.updateQueue,f=l!==null?l.lastEffect:null;if(f!==null){var p=f.next;l=p;do{if((l.tag&e)===e){var M=l.inst,U=M.destroy;if(U!==void 0){M.destroy=void 0,f=i;var k=r,ot=U;try{ot()}catch(Tt){en(f,k,Tt)}}}l=l.next}while(l!==p)}}catch(Tt){en(i,i.return,Tt)}}function t_(e){var i=e.updateQueue;if(i!==null){var r=e.stateNode;try{X0(i,r)}catch(l){en(e,e.return,l)}}}function e_(e,i,r){r.props=er(e.type,e.memoizedProps),r.state=e.memoizedState;try{r.componentWillUnmount()}catch(l){en(e,i,l)}}function el(e,i){try{var r=e.ref;if(r!==null){switch(e.tag){case 26:case 27:case 5:var l=e.stateNode;break;case 30:l=e.stateNode;break;default:l=e.stateNode}typeof r=="function"?e.refCleanup=r(l):r.current=l}}catch(f){en(e,i,f)}}function da(e,i){var r=e.ref,l=e.refCleanup;if(r!==null)if(typeof l=="function")try{l()}catch(f){en(e,i,f)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof r=="function")try{r(null)}catch(f){en(e,i,f)}else r.current=null}function n_(e){var i=e.type,r=e.memoizedProps,l=e.stateNode;try{t:switch(i){case"button":case"input":case"select":case"textarea":r.autoFocus&&l.focus();break t;case"img":r.src?l.src=r.src:r.srcSet&&(l.srcset=r.srcSet)}}catch(f){en(e,e.return,f)}}function zh(e,i,r){try{var l=e.stateNode;VM(l,e.type,r,i),l[$e]=i}catch(f){en(e,e.return,f)}}function i_(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&xs(e.type)||e.tag===4}function Fh(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||i_(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&xs(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Ih(e,i,r){var l=e.tag;if(l===5||l===6)e=e.stateNode,i?(r.nodeType===9?r.body:r.nodeName==="HTML"?r.ownerDocument.body:r).insertBefore(e,i):(i=r.nodeType===9?r.body:r.nodeName==="HTML"?r.ownerDocument.body:r,i.appendChild(e),r=r._reactRootContainer,r!=null||i.onclick!==null||(i.onclick=Ta));else if(l!==4&&(l===27&&xs(e.type)&&(r=e.stateNode,i=null),e=e.child,e!==null))for(Ih(e,i,r),e=e.sibling;e!==null;)Ih(e,i,r),e=e.sibling}function Cc(e,i,r){var l=e.tag;if(l===5||l===6)e=e.stateNode,i?r.insertBefore(e,i):r.appendChild(e);else if(l!==4&&(l===27&&xs(e.type)&&(r=e.stateNode),e=e.child,e!==null))for(Cc(e,i,r),e=e.sibling;e!==null;)Cc(e,i,r),e=e.sibling}function a_(e){var i=e.stateNode,r=e.memoizedProps;try{for(var l=e.type,f=i.attributes;f.length;)i.removeAttributeNode(f[0]);Yn(i,l,r),i[Ke]=e,i[$e]=r}catch(p){en(e,e.return,p)}}var Oa=!1,Un=!1,Bh=!1,s_=typeof WeakSet=="function"?WeakSet:Set,Gn=null;function SM(e,i){if(e=e.containerInfo,rd=Kc,e=_0(e),Lf(e)){if("selectionStart"in e)var r={start:e.selectionStart,end:e.selectionEnd};else t:{r=(r=e.ownerDocument)&&r.defaultView||window;var l=r.getSelection&&r.getSelection();if(l&&l.rangeCount!==0){r=l.anchorNode;var f=l.anchorOffset,p=l.focusNode;l=l.focusOffset;try{r.nodeType,p.nodeType}catch{r=null;break t}var M=0,U=-1,k=-1,ot=0,Tt=0,wt=e,dt=null;e:for(;;){for(var _t;wt!==r||f!==0&&wt.nodeType!==3||(U=M+f),wt!==p||l!==0&&wt.nodeType!==3||(k=M+l),wt.nodeType===3&&(M+=wt.nodeValue.length),(_t=wt.firstChild)!==null;)dt=wt,wt=_t;for(;;){if(wt===e)break e;if(dt===r&&++ot===f&&(U=M),dt===p&&++Tt===l&&(k=M),(_t=wt.nextSibling)!==null)break;wt=dt,dt=wt.parentNode}wt=_t}r=U===-1||k===-1?null:{start:U,end:k}}else r=null}r=r||{start:0,end:0}}else r=null;for(od={focusedElem:e,selectionRange:r},Kc=!1,Gn=i;Gn!==null;)if(i=Gn,e=i.child,(i.subtreeFlags&1028)!==0&&e!==null)e.return=i,Gn=e;else for(;Gn!==null;){switch(i=Gn,p=i.alternate,e=i.flags,i.tag){case 0:if((e&4)!==0&&(e=i.updateQueue,e=e!==null?e.events:null,e!==null))for(r=0;r<e.length;r++)f=e[r],f.ref.impl=f.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&p!==null){e=void 0,r=i,f=p.memoizedProps,p=p.memoizedState,l=r.stateNode;try{var se=er(r.type,f);e=l.getSnapshotBeforeUpdate(se,p),l.__reactInternalSnapshotBeforeUpdate=e}catch(ve){en(r,r.return,ve)}}break;case 3:if((e&1024)!==0){if(e=i.stateNode.containerInfo,r=e.nodeType,r===9)ud(e);else if(r===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":ud(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(s(163))}if(e=i.sibling,e!==null){e.return=i.return,Gn=e;break}Gn=i.return}}function r_(e,i,r){var l=r.flags;switch(r.tag){case 0:case 11:case 15:Fa(e,r),l&4&&tl(5,r);break;case 1:if(Fa(e,r),l&4)if(e=r.stateNode,i===null)try{e.componentDidMount()}catch(M){en(r,r.return,M)}else{var f=er(r.type,i.memoizedProps);i=i.memoizedState;try{e.componentDidUpdate(f,i,e.__reactInternalSnapshotBeforeUpdate)}catch(M){en(r,r.return,M)}}l&64&&t_(r),l&512&&el(r,r.return);break;case 3:if(Fa(e,r),l&64&&(e=r.updateQueue,e!==null)){if(i=null,r.child!==null)switch(r.child.tag){case 27:case 5:i=r.child.stateNode;break;case 1:i=r.child.stateNode}try{X0(e,i)}catch(M){en(r,r.return,M)}}break;case 27:i===null&&l&4&&a_(r);case 26:case 5:Fa(e,r),i===null&&l&4&&n_(r),l&512&&el(r,r.return);break;case 12:Fa(e,r);break;case 31:Fa(e,r),l&4&&c_(e,r);break;case 13:Fa(e,r),l&4&&u_(e,r),l&64&&(e=r.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(r=DM.bind(null,r),jM(e,r))));break;case 22:if(l=r.memoizedState!==null||Oa,!l){i=i!==null&&i.memoizedState!==null||Un,f=Oa;var p=Un;Oa=l,(Un=i)&&!p?Ia(e,r,(r.subtreeFlags&8772)!==0):Fa(e,r),Oa=f,Un=p}break;case 30:break;default:Fa(e,r)}}function o_(e){var i=e.alternate;i!==null&&(e.alternate=null,o_(i)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(i=e.stateNode,i!==null&&ke(i)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var gn=null,fi=!1;function za(e,i,r){for(r=r.child;r!==null;)l_(e,i,r),r=r.sibling}function l_(e,i,r){if(pt&&typeof pt.onCommitFiberUnmount=="function")try{pt.onCommitFiberUnmount(ht,r)}catch{}switch(r.tag){case 26:Un||da(r,i),za(e,i,r),r.memoizedState?r.memoizedState.count--:r.stateNode&&(r=r.stateNode,r.parentNode.removeChild(r));break;case 27:Un||da(r,i);var l=gn,f=fi;xs(r.type)&&(gn=r.stateNode,fi=!1),za(e,i,r),ul(r.stateNode),gn=l,fi=f;break;case 5:Un||da(r,i);case 6:if(l=gn,f=fi,gn=null,za(e,i,r),gn=l,fi=f,gn!==null)if(fi)try{(gn.nodeType===9?gn.body:gn.nodeName==="HTML"?gn.ownerDocument.body:gn).removeChild(r.stateNode)}catch(p){en(r,i,p)}else try{gn.removeChild(r.stateNode)}catch(p){en(r,i,p)}break;case 18:gn!==null&&(fi?(e=gn,tv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,r.stateNode),Zr(e)):tv(gn,r.stateNode));break;case 4:l=gn,f=fi,gn=r.stateNode.containerInfo,fi=!0,za(e,i,r),gn=l,fi=f;break;case 0:case 11:case 14:case 15:hs(2,r,i),Un||hs(4,r,i),za(e,i,r);break;case 1:Un||(da(r,i),l=r.stateNode,typeof l.componentWillUnmount=="function"&&e_(r,i,l)),za(e,i,r);break;case 21:za(e,i,r);break;case 22:Un=(l=Un)||r.memoizedState!==null,za(e,i,r),Un=l;break;default:za(e,i,r)}}function c_(e,i){if(i.memoizedState===null&&(e=i.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Zr(e)}catch(r){en(i,i.return,r)}}}function u_(e,i){if(i.memoizedState===null&&(e=i.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Zr(e)}catch(r){en(i,i.return,r)}}function MM(e){switch(e.tag){case 31:case 13:case 19:var i=e.stateNode;return i===null&&(i=e.stateNode=new s_),i;case 22:return e=e.stateNode,i=e._retryCache,i===null&&(i=e._retryCache=new s_),i;default:throw Error(s(435,e.tag))}}function wc(e,i){var r=MM(e);i.forEach(function(l){if(!r.has(l)){r.add(l);var f=UM.bind(null,e,l);l.then(f,f)}})}function hi(e,i){var r=i.deletions;if(r!==null)for(var l=0;l<r.length;l++){var f=r[l],p=e,M=i,U=M;t:for(;U!==null;){switch(U.tag){case 27:if(xs(U.type)){gn=U.stateNode,fi=!1;break t}break;case 5:gn=U.stateNode,fi=!1;break t;case 3:case 4:gn=U.stateNode.containerInfo,fi=!0;break t}U=U.return}if(gn===null)throw Error(s(160));l_(p,M,f),gn=null,fi=!1,p=f.alternate,p!==null&&(p.return=null),f.return=null}if(i.subtreeFlags&13886)for(i=i.child;i!==null;)f_(i,e),i=i.sibling}var ea=null;function f_(e,i){var r=e.alternate,l=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:hi(i,e),di(e),l&4&&(hs(3,e,e.return),tl(3,e),hs(5,e,e.return));break;case 1:hi(i,e),di(e),l&512&&(Un||r===null||da(r,r.return)),l&64&&Oa&&(e=e.updateQueue,e!==null&&(l=e.callbacks,l!==null&&(r=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=r===null?l:r.concat(l))));break;case 26:var f=ea;if(hi(i,e),di(e),l&512&&(Un||r===null||da(r,r.return)),l&4){var p=r!==null?r.memoizedState:null;if(l=e.memoizedState,r===null)if(l===null)if(e.stateNode===null){t:{l=e.type,r=e.memoizedProps,f=f.ownerDocument||f;e:switch(l){case"title":p=f.getElementsByTagName("title")[0],(!p||p[un]||p[Ke]||p.namespaceURI==="http://www.w3.org/2000/svg"||p.hasAttribute("itemprop"))&&(p=f.createElement(l),f.head.insertBefore(p,f.querySelector("head > title"))),Yn(p,l,r),p[Ke]=e,pn(p),l=p;break t;case"link":var M=fv("link","href",f).get(l+(r.href||""));if(M){for(var U=0;U<M.length;U++)if(p=M[U],p.getAttribute("href")===(r.href==null||r.href===""?null:r.href)&&p.getAttribute("rel")===(r.rel==null?null:r.rel)&&p.getAttribute("title")===(r.title==null?null:r.title)&&p.getAttribute("crossorigin")===(r.crossOrigin==null?null:r.crossOrigin)){M.splice(U,1);break e}}p=f.createElement(l),Yn(p,l,r),f.head.appendChild(p);break;case"meta":if(M=fv("meta","content",f).get(l+(r.content||""))){for(U=0;U<M.length;U++)if(p=M[U],p.getAttribute("content")===(r.content==null?null:""+r.content)&&p.getAttribute("name")===(r.name==null?null:r.name)&&p.getAttribute("property")===(r.property==null?null:r.property)&&p.getAttribute("http-equiv")===(r.httpEquiv==null?null:r.httpEquiv)&&p.getAttribute("charset")===(r.charSet==null?null:r.charSet)){M.splice(U,1);break e}}p=f.createElement(l),Yn(p,l,r),f.head.appendChild(p);break;default:throw Error(s(468,l))}p[Ke]=e,pn(p),l=p}e.stateNode=l}else hv(f,e.type,e.stateNode);else e.stateNode=uv(f,l,e.memoizedProps);else p!==l?(p===null?r.stateNode!==null&&(r=r.stateNode,r.parentNode.removeChild(r)):p.count--,l===null?hv(f,e.type,e.stateNode):uv(f,l,e.memoizedProps)):l===null&&e.stateNode!==null&&zh(e,e.memoizedProps,r.memoizedProps)}break;case 27:hi(i,e),di(e),l&512&&(Un||r===null||da(r,r.return)),r!==null&&l&4&&zh(e,e.memoizedProps,r.memoizedProps);break;case 5:if(hi(i,e),di(e),l&512&&(Un||r===null||da(r,r.return)),e.flags&32){f=e.stateNode;try{ii(f,"")}catch(se){en(e,e.return,se)}}l&4&&e.stateNode!=null&&(f=e.memoizedProps,zh(e,f,r!==null?r.memoizedProps:f)),l&1024&&(Bh=!0);break;case 6:if(hi(i,e),di(e),l&4){if(e.stateNode===null)throw Error(s(162));l=e.memoizedProps,r=e.stateNode;try{r.nodeValue=l}catch(se){en(e,e.return,se)}}break;case 3:if(Wc=null,f=ea,ea=kc(i.containerInfo),hi(i,e),ea=f,di(e),l&4&&r!==null&&r.memoizedState.isDehydrated)try{Zr(i.containerInfo)}catch(se){en(e,e.return,se)}Bh&&(Bh=!1,h_(e));break;case 4:l=ea,ea=kc(e.stateNode.containerInfo),hi(i,e),di(e),ea=l;break;case 12:hi(i,e),di(e);break;case 31:hi(i,e),di(e),l&4&&(l=e.updateQueue,l!==null&&(e.updateQueue=null,wc(e,l)));break;case 13:hi(i,e),di(e),e.child.flags&8192&&e.memoizedState!==null!=(r!==null&&r.memoizedState!==null)&&(Uc=fe()),l&4&&(l=e.updateQueue,l!==null&&(e.updateQueue=null,wc(e,l)));break;case 22:f=e.memoizedState!==null;var k=r!==null&&r.memoizedState!==null,ot=Oa,Tt=Un;if(Oa=ot||f,Un=Tt||k,hi(i,e),Un=Tt,Oa=ot,di(e),l&8192)t:for(i=e.stateNode,i._visibility=f?i._visibility&-2:i._visibility|1,f&&(r===null||k||Oa||Un||nr(e)),r=null,i=e;;){if(i.tag===5||i.tag===26){if(r===null){k=r=i;try{if(p=k.stateNode,f)M=p.style,typeof M.setProperty=="function"?M.setProperty("display","none","important"):M.display="none";else{U=k.stateNode;var wt=k.memoizedProps.style,dt=wt!=null&&wt.hasOwnProperty("display")?wt.display:null;U.style.display=dt==null||typeof dt=="boolean"?"":(""+dt).trim()}}catch(se){en(k,k.return,se)}}}else if(i.tag===6){if(r===null){k=i;try{k.stateNode.nodeValue=f?"":k.memoizedProps}catch(se){en(k,k.return,se)}}}else if(i.tag===18){if(r===null){k=i;try{var _t=k.stateNode;f?ev(_t,!0):ev(k.stateNode,!1)}catch(se){en(k,k.return,se)}}}else if((i.tag!==22&&i.tag!==23||i.memoizedState===null||i===e)&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break t;for(;i.sibling===null;){if(i.return===null||i.return===e)break t;r===i&&(r=null),i=i.return}r===i&&(r=null),i.sibling.return=i.return,i=i.sibling}l&4&&(l=e.updateQueue,l!==null&&(r=l.retryQueue,r!==null&&(l.retryQueue=null,wc(e,r))));break;case 19:hi(i,e),di(e),l&4&&(l=e.updateQueue,l!==null&&(e.updateQueue=null,wc(e,l)));break;case 30:break;case 21:break;default:hi(i,e),di(e)}}function di(e){var i=e.flags;if(i&2){try{for(var r,l=e.return;l!==null;){if(i_(l)){r=l;break}l=l.return}if(r==null)throw Error(s(160));switch(r.tag){case 27:var f=r.stateNode,p=Fh(e);Cc(e,p,f);break;case 5:var M=r.stateNode;r.flags&32&&(ii(M,""),r.flags&=-33);var U=Fh(e);Cc(e,U,M);break;case 3:case 4:var k=r.stateNode.containerInfo,ot=Fh(e);Ih(e,ot,k);break;default:throw Error(s(161))}}catch(Tt){en(e,e.return,Tt)}e.flags&=-3}i&4096&&(e.flags&=-4097)}function h_(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var i=e;h_(i),i.tag===5&&i.flags&1024&&i.stateNode.reset(),e=e.sibling}}function Fa(e,i){if(i.subtreeFlags&8772)for(i=i.child;i!==null;)r_(e,i.alternate,i),i=i.sibling}function nr(e){for(e=e.child;e!==null;){var i=e;switch(i.tag){case 0:case 11:case 14:case 15:hs(4,i,i.return),nr(i);break;case 1:da(i,i.return);var r=i.stateNode;typeof r.componentWillUnmount=="function"&&e_(i,i.return,r),nr(i);break;case 27:ul(i.stateNode);case 26:case 5:da(i,i.return),nr(i);break;case 22:i.memoizedState===null&&nr(i);break;case 30:nr(i);break;default:nr(i)}e=e.sibling}}function Ia(e,i,r){for(r=r&&(i.subtreeFlags&8772)!==0,i=i.child;i!==null;){var l=i.alternate,f=e,p=i,M=p.flags;switch(p.tag){case 0:case 11:case 15:Ia(f,p,r),tl(4,p);break;case 1:if(Ia(f,p,r),l=p,f=l.stateNode,typeof f.componentDidMount=="function")try{f.componentDidMount()}catch(ot){en(l,l.return,ot)}if(l=p,f=l.updateQueue,f!==null){var U=l.stateNode;try{var k=f.shared.hiddenCallbacks;if(k!==null)for(f.shared.hiddenCallbacks=null,f=0;f<k.length;f++)k0(k[f],U)}catch(ot){en(l,l.return,ot)}}r&&M&64&&t_(p),el(p,p.return);break;case 27:a_(p);case 26:case 5:Ia(f,p,r),r&&l===null&&M&4&&n_(p),el(p,p.return);break;case 12:Ia(f,p,r);break;case 31:Ia(f,p,r),r&&M&4&&c_(f,p);break;case 13:Ia(f,p,r),r&&M&4&&u_(f,p);break;case 22:p.memoizedState===null&&Ia(f,p,r),el(p,p.return);break;case 30:break;default:Ia(f,p,r)}i=i.sibling}}function Hh(e,i){var r=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(r=e.memoizedState.cachePool.pool),e=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(e=i.memoizedState.cachePool.pool),e!==r&&(e!=null&&e.refCount++,r!=null&&Go(r))}function Gh(e,i){e=null,i.alternate!==null&&(e=i.alternate.memoizedState.cache),i=i.memoizedState.cache,i!==e&&(i.refCount++,e!=null&&Go(e))}function na(e,i,r,l){if(i.subtreeFlags&10256)for(i=i.child;i!==null;)d_(e,i,r,l),i=i.sibling}function d_(e,i,r,l){var f=i.flags;switch(i.tag){case 0:case 11:case 15:na(e,i,r,l),f&2048&&tl(9,i);break;case 1:na(e,i,r,l);break;case 3:na(e,i,r,l),f&2048&&(e=null,i.alternate!==null&&(e=i.alternate.memoizedState.cache),i=i.memoizedState.cache,i!==e&&(i.refCount++,e!=null&&Go(e)));break;case 12:if(f&2048){na(e,i,r,l),e=i.stateNode;try{var p=i.memoizedProps,M=p.id,U=p.onPostCommit;typeof U=="function"&&U(M,i.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(k){en(i,i.return,k)}}else na(e,i,r,l);break;case 31:na(e,i,r,l);break;case 13:na(e,i,r,l);break;case 23:break;case 22:p=i.stateNode,M=i.alternate,i.memoizedState!==null?p._visibility&2?na(e,i,r,l):nl(e,i):p._visibility&2?na(e,i,r,l):(p._visibility|=2,Fr(e,i,r,l,(i.subtreeFlags&10256)!==0||!1)),f&2048&&Hh(M,i);break;case 24:na(e,i,r,l),f&2048&&Gh(i.alternate,i);break;default:na(e,i,r,l)}}function Fr(e,i,r,l,f){for(f=f&&((i.subtreeFlags&10256)!==0||!1),i=i.child;i!==null;){var p=e,M=i,U=r,k=l,ot=M.flags;switch(M.tag){case 0:case 11:case 15:Fr(p,M,U,k,f),tl(8,M);break;case 23:break;case 22:var Tt=M.stateNode;M.memoizedState!==null?Tt._visibility&2?Fr(p,M,U,k,f):nl(p,M):(Tt._visibility|=2,Fr(p,M,U,k,f)),f&&ot&2048&&Hh(M.alternate,M);break;case 24:Fr(p,M,U,k,f),f&&ot&2048&&Gh(M.alternate,M);break;default:Fr(p,M,U,k,f)}i=i.sibling}}function nl(e,i){if(i.subtreeFlags&10256)for(i=i.child;i!==null;){var r=e,l=i,f=l.flags;switch(l.tag){case 22:nl(r,l),f&2048&&Hh(l.alternate,l);break;case 24:nl(r,l),f&2048&&Gh(l.alternate,l);break;default:nl(r,l)}i=i.sibling}}var il=8192;function Ir(e,i,r){if(e.subtreeFlags&il)for(e=e.child;e!==null;)p_(e,i,r),e=e.sibling}function p_(e,i,r){switch(e.tag){case 26:Ir(e,i,r),e.flags&il&&e.memoizedState!==null&&lb(r,ea,e.memoizedState,e.memoizedProps);break;case 5:Ir(e,i,r);break;case 3:case 4:var l=ea;ea=kc(e.stateNode.containerInfo),Ir(e,i,r),ea=l;break;case 22:e.memoizedState===null&&(l=e.alternate,l!==null&&l.memoizedState!==null?(l=il,il=16777216,Ir(e,i,r),il=l):Ir(e,i,r));break;default:Ir(e,i,r)}}function m_(e){var i=e.alternate;if(i!==null&&(e=i.child,e!==null)){i.child=null;do i=e.sibling,e.sibling=null,e=i;while(e!==null)}}function al(e){var i=e.deletions;if((e.flags&16)!==0){if(i!==null)for(var r=0;r<i.length;r++){var l=i[r];Gn=l,__(l,e)}m_(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)g_(e),e=e.sibling}function g_(e){switch(e.tag){case 0:case 11:case 15:al(e),e.flags&2048&&hs(9,e,e.return);break;case 3:al(e);break;case 12:al(e);break;case 22:var i=e.stateNode;e.memoizedState!==null&&i._visibility&2&&(e.return===null||e.return.tag!==13)?(i._visibility&=-3,Dc(e)):al(e);break;default:al(e)}}function Dc(e){var i=e.deletions;if((e.flags&16)!==0){if(i!==null)for(var r=0;r<i.length;r++){var l=i[r];Gn=l,__(l,e)}m_(e)}for(e=e.child;e!==null;){switch(i=e,i.tag){case 0:case 11:case 15:hs(8,i,i.return),Dc(i);break;case 22:r=i.stateNode,r._visibility&2&&(r._visibility&=-3,Dc(i));break;default:Dc(i)}e=e.sibling}}function __(e,i){for(;Gn!==null;){var r=Gn;switch(r.tag){case 0:case 11:case 15:hs(8,r,i);break;case 23:case 22:if(r.memoizedState!==null&&r.memoizedState.cachePool!==null){var l=r.memoizedState.cachePool.pool;l!=null&&l.refCount++}break;case 24:Go(r.memoizedState.cache)}if(l=r.child,l!==null)l.return=r,Gn=l;else t:for(r=e;Gn!==null;){l=Gn;var f=l.sibling,p=l.return;if(o_(l),l===r){Gn=null;break t}if(f!==null){f.return=p,Gn=f;break t}Gn=p}}}var bM={getCacheForType:function(e){var i=Wn(Cn),r=i.data.get(e);return r===void 0&&(r=e(),i.data.set(e,r)),r},cacheSignal:function(){return Wn(Cn).controller.signal}},EM=typeof WeakMap=="function"?WeakMap:Map,Ye=0,ln=null,De=null,Pe=0,tn=0,Ei=null,ds=!1,Br=!1,Vh=!1,Ba=0,Sn=0,ps=0,ir=0,kh=0,Ti=0,Hr=0,sl=null,pi=null,Xh=!1,Uc=0,v_=0,Lc=1/0,Nc=null,ms=null,Nn=0,gs=null,Gr=null,Ha=0,Wh=0,qh=null,x_=null,rl=0,Yh=null;function Ai(){return(Ye&2)!==0&&Pe!==0?Pe&-Pe:I.T!==null?$h():Li()}function y_(){if(Ti===0)if((Pe&536870912)===0||Fe){var e=ie;ie<<=1,(ie&3932160)===0&&(ie=262144),Ti=e}else Ti=536870912;return e=Mi.current,e!==null&&(e.flags|=32),Ti}function mi(e,i,r){(e===ln&&(tn===2||tn===9)||e.cancelPendingCommit!==null)&&(Vr(e,0),_s(e,Pe,Ti,!1)),Vt(e,r),((Ye&2)===0||e!==ln)&&(e===ln&&((Ye&2)===0&&(ir|=r),Sn===4&&_s(e,Pe,Ti,!1)),pa(e))}function S_(e,i,r){if((Ye&6)!==0)throw Error(s(327));var l=!r&&(i&127)===0&&(i&e.expiredLanes)===0||zt(e,i),f=l?RM(e,i):Kh(e,i,!0),p=l;do{if(f===0){Br&&!l&&_s(e,i,0,!1);break}else{if(r=e.current.alternate,p&&!TM(r)){f=Kh(e,i,!1),p=!1;continue}if(f===2){if(p=i,e.errorRecoveryDisabledLanes&p)var M=0;else M=e.pendingLanes&-536870913,M=M!==0?M:M&536870912?536870912:0;if(M!==0){i=M;t:{var U=e;f=sl;var k=U.current.memoizedState.isDehydrated;if(k&&(Vr(U,M).flags|=256),M=Kh(U,M,!1),M!==2){if(Vh&&!k){U.errorRecoveryDisabledLanes|=p,ir|=p,f=4;break t}p=pi,pi=f,p!==null&&(pi===null?pi=p:pi.push.apply(pi,p))}f=M}if(p=!1,f!==2)continue}}if(f===1){Vr(e,0),_s(e,i,0,!0);break}t:{switch(l=e,p=f,p){case 0:case 1:throw Error(s(345));case 4:if((i&4194048)!==i)break;case 6:_s(l,i,Ti,!ds);break t;case 2:pi=null;break;case 3:case 5:break;default:throw Error(s(329))}if((i&62914560)===i&&(f=Uc+300-fe(),10<f)){if(_s(l,i,Ti,!ds),gt(l,0,!0)!==0)break t;Ha=i,l.timeoutHandle=J_(M_.bind(null,l,r,pi,Nc,Xh,i,Ti,ir,Hr,ds,p,"Throttled",-0,0),f);break t}M_(l,r,pi,Nc,Xh,i,Ti,ir,Hr,ds,p,null,-0,0)}}break}while(!0);pa(e)}function M_(e,i,r,l,f,p,M,U,k,ot,Tt,wt,dt,_t){if(e.timeoutHandle=-1,wt=i.subtreeFlags,wt&8192||(wt&16785408)===16785408){wt={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Ta},p_(i,p,wt);var se=(p&62914560)===p?Uc-fe():(p&4194048)===p?v_-fe():0;if(se=cb(wt,se),se!==null){Ha=p,e.cancelPendingCommit=se(D_.bind(null,e,i,p,r,l,f,M,U,k,Tt,wt,null,dt,_t)),_s(e,p,M,!ot);return}}D_(e,i,p,r,l,f,M,U,k)}function TM(e){for(var i=e;;){var r=i.tag;if((r===0||r===11||r===15)&&i.flags&16384&&(r=i.updateQueue,r!==null&&(r=r.stores,r!==null)))for(var l=0;l<r.length;l++){var f=r[l],p=f.getSnapshot;f=f.value;try{if(!yi(p(),f))return!1}catch{return!1}}if(r=i.child,i.subtreeFlags&16384&&r!==null)r.return=i,i=r;else{if(i===e)break;for(;i.sibling===null;){if(i.return===null||i.return===e)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function _s(e,i,r,l){i&=~kh,i&=~ir,e.suspendedLanes|=i,e.pingedLanes&=~i,l&&(e.warmLanes|=i),l=e.expirationTimes;for(var f=i;0<f;){var p=31-Bt(f),M=1<<p;l[p]=-1,f&=~M}r!==0&&ye(e,r,i)}function Pc(){return(Ye&6)===0?(ol(0),!1):!0}function Zh(){if(De!==null){if(tn===0)var e=De.return;else e=De,wa=Zs=null,uh(e),Lr=null,ko=0,e=De;for(;e!==null;)$g(e.alternate,e),e=e.return;De=null}}function Vr(e,i){var r=e.timeoutHandle;r!==-1&&(e.timeoutHandle=-1,WM(r)),r=e.cancelPendingCommit,r!==null&&(e.cancelPendingCommit=null,r()),Ha=0,Zh(),ln=e,De=r=Ra(e.current,null),Pe=i,tn=0,Ei=null,ds=!1,Br=zt(e,i),Vh=!1,Hr=Ti=kh=ir=ps=Sn=0,pi=sl=null,Xh=!1,(i&8)!==0&&(i|=i&32);var l=e.entangledLanes;if(l!==0)for(e=e.entanglements,l&=i;0<l;){var f=31-Bt(l),p=1<<f;i|=e[f],l&=~p}return Ba=i,ec(),r}function b_(e,i){Ee=null,I.H=Qo,i===Ur||i===cc?(i=B0(),tn=3):i===Jf?(i=B0(),tn=4):tn=i===Ah?8:i!==null&&typeof i=="object"&&typeof i.then=="function"?6:1,Ei=i,De===null&&(Sn=1,bc(e,zi(i,e.current)))}function E_(){var e=Mi.current;return e===null?!0:(Pe&4194048)===Pe?Hi===null:(Pe&62914560)===Pe||(Pe&536870912)!==0?e===Hi:!1}function T_(){var e=I.H;return I.H=Qo,e===null?Qo:e}function A_(){var e=I.A;return I.A=bM,e}function Oc(){Sn=4,ds||(Pe&4194048)!==Pe&&Mi.current!==null||(Br=!0),(ps&134217727)===0&&(ir&134217727)===0||ln===null||_s(ln,Pe,Ti,!1)}function Kh(e,i,r){var l=Ye;Ye|=2;var f=T_(),p=A_();(ln!==e||Pe!==i)&&(Nc=null,Vr(e,i)),i=!1;var M=Sn;t:do try{if(tn!==0&&De!==null){var U=De,k=Ei;switch(tn){case 8:Zh(),M=6;break t;case 3:case 2:case 9:case 6:Mi.current===null&&(i=!0);var ot=tn;if(tn=0,Ei=null,kr(e,U,k,ot),r&&Br){M=0;break t}break;default:ot=tn,tn=0,Ei=null,kr(e,U,k,ot)}}AM(),M=Sn;break}catch(Tt){b_(e,Tt)}while(!0);return i&&e.shellSuspendCounter++,wa=Zs=null,Ye=l,I.H=f,I.A=p,De===null&&(ln=null,Pe=0,ec()),M}function AM(){for(;De!==null;)R_(De)}function RM(e,i){var r=Ye;Ye|=2;var l=T_(),f=A_();ln!==e||Pe!==i?(Nc=null,Lc=fe()+500,Vr(e,i)):Br=zt(e,i);t:do try{if(tn!==0&&De!==null){i=De;var p=Ei;e:switch(tn){case 1:tn=0,Ei=null,kr(e,i,p,1);break;case 2:case 9:if(F0(p)){tn=0,Ei=null,C_(i);break}i=function(){tn!==2&&tn!==9||ln!==e||(tn=7),pa(e)},p.then(i,i);break t;case 3:tn=7;break t;case 4:tn=5;break t;case 7:F0(p)?(tn=0,Ei=null,C_(i)):(tn=0,Ei=null,kr(e,i,p,7));break;case 5:var M=null;switch(De.tag){case 26:M=De.memoizedState;case 5:case 27:var U=De;if(M?dv(M):U.stateNode.complete){tn=0,Ei=null;var k=U.sibling;if(k!==null)De=k;else{var ot=U.return;ot!==null?(De=ot,zc(ot)):De=null}break e}}tn=0,Ei=null,kr(e,i,p,5);break;case 6:tn=0,Ei=null,kr(e,i,p,6);break;case 8:Zh(),Sn=6;break t;default:throw Error(s(462))}}CM();break}catch(Tt){b_(e,Tt)}while(!0);return wa=Zs=null,I.H=l,I.A=f,Ye=r,De!==null?0:(ln=null,Pe=0,ec(),Sn)}function CM(){for(;De!==null&&!_e();)R_(De)}function R_(e){var i=Qg(e.alternate,e,Ba);e.memoizedProps=e.pendingProps,i===null?zc(e):De=i}function C_(e){var i=e,r=i.alternate;switch(i.tag){case 15:case 0:i=Wg(r,i,i.pendingProps,i.type,void 0,Pe);break;case 11:i=Wg(r,i,i.pendingProps,i.type.render,i.ref,Pe);break;case 5:uh(i);default:$g(r,i),i=De=A0(i,Ba),i=Qg(r,i,Ba)}e.memoizedProps=e.pendingProps,i===null?zc(e):De=i}function kr(e,i,r,l){wa=Zs=null,uh(i),Lr=null,ko=0;var f=i.return;try{if(gM(e,f,i,r,Pe)){Sn=1,bc(e,zi(r,e.current)),De=null;return}}catch(p){if(f!==null)throw De=f,p;Sn=1,bc(e,zi(r,e.current)),De=null;return}i.flags&32768?(Fe||l===1?e=!0:Br||(Pe&536870912)!==0?e=!1:(ds=e=!0,(l===2||l===9||l===3||l===6)&&(l=Mi.current,l!==null&&l.tag===13&&(l.flags|=16384))),w_(i,e)):zc(i)}function zc(e){var i=e;do{if((i.flags&32768)!==0){w_(i,ds);return}e=i.return;var r=xM(i.alternate,i,Ba);if(r!==null){De=r;return}if(i=i.sibling,i!==null){De=i;return}De=i=e}while(i!==null);Sn===0&&(Sn=5)}function w_(e,i){do{var r=yM(e.alternate,e);if(r!==null){r.flags&=32767,De=r;return}if(r=e.return,r!==null&&(r.flags|=32768,r.subtreeFlags=0,r.deletions=null),!i&&(e=e.sibling,e!==null)){De=e;return}De=e=r}while(e!==null);Sn=6,De=null}function D_(e,i,r,l,f,p,M,U,k){e.cancelPendingCommit=null;do Fc();while(Nn!==0);if((Ye&6)!==0)throw Error(s(327));if(i!==null){if(i===e.current)throw Error(s(177));if(p=i.lanes|i.childLanes,p|=Ff,te(e,r,p,M,U,k),e===ln&&(De=ln=null,Pe=0),Gr=i,gs=e,Ha=r,Wh=p,qh=f,x_=l,(i.subtreeFlags&10256)!==0||(i.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,LM(Q,function(){return O_(),null})):(e.callbackNode=null,e.callbackPriority=0),l=(i.flags&13878)!==0,(i.subtreeFlags&13878)!==0||l){l=I.T,I.T=null,f=V.p,V.p=2,M=Ye,Ye|=4;try{SM(e,i,r)}finally{Ye=M,V.p=f,I.T=l}}Nn=1,U_(),L_(),N_()}}function U_(){if(Nn===1){Nn=0;var e=gs,i=Gr,r=(i.flags&13878)!==0;if((i.subtreeFlags&13878)!==0||r){r=I.T,I.T=null;var l=V.p;V.p=2;var f=Ye;Ye|=4;try{f_(i,e);var p=od,M=_0(e.containerInfo),U=p.focusedElem,k=p.selectionRange;if(M!==U&&U&&U.ownerDocument&&g0(U.ownerDocument.documentElement,U)){if(k!==null&&Lf(U)){var ot=k.start,Tt=k.end;if(Tt===void 0&&(Tt=ot),"selectionStart"in U)U.selectionStart=ot,U.selectionEnd=Math.min(Tt,U.value.length);else{var wt=U.ownerDocument||document,dt=wt&&wt.defaultView||window;if(dt.getSelection){var _t=dt.getSelection(),se=U.textContent.length,ve=Math.min(k.start,se),sn=k.end===void 0?ve:Math.min(k.end,se);!_t.extend&&ve>sn&&(M=sn,sn=ve,ve=M);var nt=m0(U,ve),j=m0(U,sn);if(nt&&j&&(_t.rangeCount!==1||_t.anchorNode!==nt.node||_t.anchorOffset!==nt.offset||_t.focusNode!==j.node||_t.focusOffset!==j.offset)){var rt=wt.createRange();rt.setStart(nt.node,nt.offset),_t.removeAllRanges(),ve>sn?(_t.addRange(rt),_t.extend(j.node,j.offset)):(rt.setEnd(j.node,j.offset),_t.addRange(rt))}}}}for(wt=[],_t=U;_t=_t.parentNode;)_t.nodeType===1&&wt.push({element:_t,left:_t.scrollLeft,top:_t.scrollTop});for(typeof U.focus=="function"&&U.focus(),U=0;U<wt.length;U++){var Rt=wt[U];Rt.element.scrollLeft=Rt.left,Rt.element.scrollTop=Rt.top}}Kc=!!rd,od=rd=null}finally{Ye=f,V.p=l,I.T=r}}e.current=i,Nn=2}}function L_(){if(Nn===2){Nn=0;var e=gs,i=Gr,r=(i.flags&8772)!==0;if((i.subtreeFlags&8772)!==0||r){r=I.T,I.T=null;var l=V.p;V.p=2;var f=Ye;Ye|=4;try{r_(e,i.alternate,i)}finally{Ye=f,V.p=l,I.T=r}}Nn=3}}function N_(){if(Nn===4||Nn===3){Nn=0,X();var e=gs,i=Gr,r=Ha,l=x_;(i.subtreeFlags&10256)!==0||(i.flags&10256)!==0?Nn=5:(Nn=0,Gr=gs=null,P_(e,e.pendingLanes));var f=e.pendingLanes;if(f===0&&(ms=null),Ki(r),i=i.stateNode,pt&&typeof pt.onCommitFiberRoot=="function")try{pt.onCommitFiberRoot(ht,i,void 0,(i.current.flags&128)===128)}catch{}if(l!==null){i=I.T,f=V.p,V.p=2,I.T=null;try{for(var p=e.onRecoverableError,M=0;M<l.length;M++){var U=l[M];p(U.value,{componentStack:U.stack})}}finally{I.T=i,V.p=f}}(Ha&3)!==0&&Fc(),pa(e),f=e.pendingLanes,(r&261930)!==0&&(f&42)!==0?e===Yh?rl++:(rl=0,Yh=e):rl=0,ol(0)}}function P_(e,i){(e.pooledCacheLanes&=i)===0&&(i=e.pooledCache,i!=null&&(e.pooledCache=null,Go(i)))}function Fc(){return U_(),L_(),N_(),O_()}function O_(){if(Nn!==5)return!1;var e=gs,i=Wh;Wh=0;var r=Ki(Ha),l=I.T,f=V.p;try{V.p=32>r?32:r,I.T=null,r=qh,qh=null;var p=gs,M=Ha;if(Nn=0,Gr=gs=null,Ha=0,(Ye&6)!==0)throw Error(s(331));var U=Ye;if(Ye|=4,g_(p.current),d_(p,p.current,M,r),Ye=U,ol(0,!1),pt&&typeof pt.onPostCommitFiberRoot=="function")try{pt.onPostCommitFiberRoot(ht,p)}catch{}return!0}finally{V.p=f,I.T=l,P_(e,i)}}function z_(e,i,r){i=zi(r,i),i=Th(e.stateNode,i,2),e=cs(e,i,2),e!==null&&(Vt(e,2),pa(e))}function en(e,i,r){if(e.tag===3)z_(e,e,r);else for(;i!==null;){if(i.tag===3){z_(i,e,r);break}else if(i.tag===1){var l=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(ms===null||!ms.has(l))){e=zi(r,e),r=Fg(2),l=cs(i,r,2),l!==null&&(Ig(r,l,i,e),Vt(l,2),pa(l));break}}i=i.return}}function jh(e,i,r){var l=e.pingCache;if(l===null){l=e.pingCache=new EM;var f=new Set;l.set(i,f)}else f=l.get(i),f===void 0&&(f=new Set,l.set(i,f));f.has(r)||(Vh=!0,f.add(r),e=wM.bind(null,e,i,r),i.then(e,e))}function wM(e,i,r){var l=e.pingCache;l!==null&&l.delete(i),e.pingedLanes|=e.suspendedLanes&r,e.warmLanes&=~r,ln===e&&(Pe&r)===r&&(Sn===4||Sn===3&&(Pe&62914560)===Pe&&300>fe()-Uc?(Ye&2)===0&&Vr(e,0):kh|=r,Hr===Pe&&(Hr=0)),pa(e)}function F_(e,i){i===0&&(i=At()),e=Ws(e,i),e!==null&&(Vt(e,i),pa(e))}function DM(e){var i=e.memoizedState,r=0;i!==null&&(r=i.retryLane),F_(e,r)}function UM(e,i){var r=0;switch(e.tag){case 31:case 13:var l=e.stateNode,f=e.memoizedState;f!==null&&(r=f.retryLane);break;case 19:l=e.stateNode;break;case 22:l=e.stateNode._retryCache;break;default:throw Error(s(314))}l!==null&&l.delete(i),F_(e,r)}function LM(e,i){return ee(e,i)}var Ic=null,Xr=null,Qh=!1,Bc=!1,Jh=!1,vs=0;function pa(e){e!==Xr&&e.next===null&&(Xr===null?Ic=Xr=e:Xr=Xr.next=e),Bc=!0,Qh||(Qh=!0,PM())}function ol(e,i){if(!Jh&&Bc){Jh=!0;do for(var r=!1,l=Ic;l!==null;){if(e!==0){var f=l.pendingLanes;if(f===0)var p=0;else{var M=l.suspendedLanes,U=l.pingedLanes;p=(1<<31-Bt(42|e)+1)-1,p&=f&~(M&~U),p=p&201326741?p&201326741|1:p?p|2:0}p!==0&&(r=!0,G_(l,p))}else p=Pe,p=gt(l,l===ln?p:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),(p&3)===0||zt(l,p)||(r=!0,G_(l,p));l=l.next}while(r);Jh=!1}}function NM(){I_()}function I_(){Bc=Qh=!1;var e=0;vs!==0&&XM()&&(e=vs);for(var i=fe(),r=null,l=Ic;l!==null;){var f=l.next,p=B_(l,i);p===0?(l.next=null,r===null?Ic=f:r.next=f,f===null&&(Xr=r)):(r=l,(e!==0||(p&3)!==0)&&(Bc=!0)),l=f}Nn!==0&&Nn!==5||ol(e),vs!==0&&(vs=0)}function B_(e,i){for(var r=e.suspendedLanes,l=e.pingedLanes,f=e.expirationTimes,p=e.pendingLanes&-62914561;0<p;){var M=31-Bt(p),U=1<<M,k=f[M];k===-1?((U&r)===0||(U&l)!==0)&&(f[M]=Gt(U,i)):k<=i&&(e.expiredLanes|=U),p&=~U}if(i=ln,r=Pe,r=gt(e,e===i?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),l=e.callbackNode,r===0||e===i&&(tn===2||tn===9)||e.cancelPendingCommit!==null)return l!==null&&l!==null&&le(l),e.callbackNode=null,e.callbackPriority=0;if((r&3)===0||zt(e,r)){if(i=r&-r,i===e.callbackPriority)return i;switch(l!==null&&le(l),Ki(r)){case 2:case 8:r=E;break;case 32:r=Q;break;case 268435456:r=mt;break;default:r=Q}return l=H_.bind(null,e),r=ee(r,l),e.callbackPriority=i,e.callbackNode=r,i}return l!==null&&l!==null&&le(l),e.callbackPriority=2,e.callbackNode=null,2}function H_(e,i){if(Nn!==0&&Nn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var r=e.callbackNode;if(Fc()&&e.callbackNode!==r)return null;var l=Pe;return l=gt(e,e===ln?l:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),l===0?null:(S_(e,l,i),B_(e,fe()),e.callbackNode!=null&&e.callbackNode===r?H_.bind(null,e):null)}function G_(e,i){if(Fc())return null;S_(e,i,!0)}function PM(){qM(function(){(Ye&6)!==0?ee(O,NM):I_()})}function $h(){if(vs===0){var e=wr;e===0&&(e=Jt,Jt<<=1,(Jt&261888)===0&&(Jt=256)),vs=e}return vs}function V_(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Gs(""+e)}function k_(e,i){var r=i.ownerDocument.createElement("input");return r.name=i.name,r.value=i.value,e.id&&r.setAttribute("form",e.id),i.parentNode.insertBefore(r,i),e=new FormData(e),r.parentNode.removeChild(r),e}function OM(e,i,r,l,f){if(i==="submit"&&r&&r.stateNode===f){var p=V_((f[$e]||null).action),M=l.submitter;M&&(i=(i=M[$e]||null)?V_(i.formAction):M.getAttribute("formAction"),i!==null&&(p=i,M=null));var U=new Ql("action","action",null,l,f);e.push({event:U,listeners:[{instance:null,listener:function(){if(l.defaultPrevented){if(vs!==0){var k=M?k_(f,M):new FormData(f);xh(r,{pending:!0,data:k,method:f.method,action:p},null,k)}}else typeof p=="function"&&(U.preventDefault(),k=M?k_(f,M):new FormData(f),xh(r,{pending:!0,data:k,method:f.method,action:p},p,k))},currentTarget:f}]})}}for(var td=0;td<zf.length;td++){var ed=zf[td],zM=ed.toLowerCase(),FM=ed[0].toUpperCase()+ed.slice(1);ta(zM,"on"+FM)}ta(y0,"onAnimationEnd"),ta(S0,"onAnimationIteration"),ta(M0,"onAnimationStart"),ta("dblclick","onDoubleClick"),ta("focusin","onFocus"),ta("focusout","onBlur"),ta($S,"onTransitionRun"),ta(tM,"onTransitionStart"),ta(eM,"onTransitionCancel"),ta(b0,"onTransitionEnd"),ut("onMouseEnter",["mouseout","mouseover"]),ut("onMouseLeave",["mouseout","mouseover"]),ut("onPointerEnter",["pointerout","pointerover"]),ut("onPointerLeave",["pointerout","pointerover"]),tt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),tt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),tt("onBeforeInput",["compositionend","keypress","textInput","paste"]),tt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),tt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),tt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ll="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),IM=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ll));function X_(e,i){i=(i&4)!==0;for(var r=0;r<e.length;r++){var l=e[r],f=l.event;l=l.listeners;t:{var p=void 0;if(i)for(var M=l.length-1;0<=M;M--){var U=l[M],k=U.instance,ot=U.currentTarget;if(U=U.listener,k!==p&&f.isPropagationStopped())break t;p=U,f.currentTarget=ot;try{p(f)}catch(Tt){tc(Tt)}f.currentTarget=null,p=k}else for(M=0;M<l.length;M++){if(U=l[M],k=U.instance,ot=U.currentTarget,U=U.listener,k!==p&&f.isPropagationStopped())break t;p=U,f.currentTarget=ot;try{p(f)}catch(Tt){tc(Tt)}f.currentTarget=null,p=k}}}}function Ue(e,i){var r=i[Rn];r===void 0&&(r=i[Rn]=new Set);var l=e+"__bubble";r.has(l)||(W_(i,e,2,!1),r.add(l))}function nd(e,i,r){var l=0;i&&(l|=4),W_(r,e,l,i)}var Hc="_reactListening"+Math.random().toString(36).slice(2);function id(e){if(!e[Hc]){e[Hc]=!0,ca.forEach(function(r){r!=="selectionchange"&&(IM.has(r)||nd(r,!1,e),nd(r,!0,e))});var i=e.nodeType===9?e:e.ownerDocument;i===null||i[Hc]||(i[Hc]=!0,nd("selectionchange",!1,i))}}function W_(e,i,r,l){switch(yv(i)){case 2:var f=hb;break;case 8:f=db;break;default:f=vd}r=f.bind(null,i,r,e),f=void 0,!bf||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(f=!0),l?f!==void 0?e.addEventListener(i,r,{capture:!0,passive:f}):e.addEventListener(i,r,!0):f!==void 0?e.addEventListener(i,r,{passive:f}):e.addEventListener(i,r,!1)}function ad(e,i,r,l,f){var p=l;if((i&1)===0&&(i&2)===0&&l!==null)t:for(;;){if(l===null)return;var M=l.tag;if(M===3||M===4){var U=l.stateNode.containerInfo;if(U===f)break;if(M===4)for(M=l.return;M!==null;){var k=M.tag;if((k===3||k===4)&&M.stateNode.containerInfo===f)return;M=M.return}for(;U!==null;){if(M=kn(U),M===null)return;if(k=M.tag,k===5||k===6||k===26||k===27){l=p=M;continue t}U=U.parentNode}}l=l.return}jm(function(){var ot=p,Tt=Sf(r),wt=[];t:{var dt=E0.get(e);if(dt!==void 0){var _t=Ql,se=e;switch(e){case"keypress":if(Kl(r)===0)break t;case"keydown":case"keyup":_t=US;break;case"focusin":se="focus",_t=Rf;break;case"focusout":se="blur",_t=Rf;break;case"beforeblur":case"afterblur":_t=Rf;break;case"click":if(r.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":_t=$m;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":_t=xS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":_t=PS;break;case y0:case S0:case M0:_t=MS;break;case b0:_t=zS;break;case"scroll":case"scrollend":_t=_S;break;case"wheel":_t=IS;break;case"copy":case"cut":case"paste":_t=ES;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":_t=e0;break;case"toggle":case"beforetoggle":_t=HS}var ve=(i&4)!==0,sn=!ve&&(e==="scroll"||e==="scrollend"),nt=ve?dt!==null?dt+"Capture":null:dt;ve=[];for(var j=ot,rt;j!==null;){var Rt=j;if(rt=Rt.stateNode,Rt=Rt.tag,Rt!==5&&Rt!==26&&Rt!==27||rt===null||nt===null||(Rt=Do(j,nt),Rt!=null&&ve.push(cl(j,Rt,rt))),sn)break;j=j.return}0<ve.length&&(dt=new _t(dt,se,null,r,Tt),wt.push({event:dt,listeners:ve}))}}if((i&7)===0){t:{if(dt=e==="mouseover"||e==="pointerover",_t=e==="mouseout"||e==="pointerout",dt&&r!==yf&&(se=r.relatedTarget||r.fromElement)&&(kn(se)||se[Ie]))break t;if((_t||dt)&&(dt=Tt.window===Tt?Tt:(dt=Tt.ownerDocument)?dt.defaultView||dt.parentWindow:window,_t?(se=r.relatedTarget||r.toElement,_t=ot,se=se?kn(se):null,se!==null&&(sn=c(se),ve=se.tag,se!==sn||ve!==5&&ve!==27&&ve!==6)&&(se=null)):(_t=null,se=ot),_t!==se)){if(ve=$m,Rt="onMouseLeave",nt="onMouseEnter",j="mouse",(e==="pointerout"||e==="pointerover")&&(ve=e0,Rt="onPointerLeave",nt="onPointerEnter",j="pointer"),sn=_t==null?dt:Ji(_t),rt=se==null?dt:Ji(se),dt=new ve(Rt,j+"leave",_t,r,Tt),dt.target=sn,dt.relatedTarget=rt,Rt=null,kn(Tt)===ot&&(ve=new ve(nt,j+"enter",se,r,Tt),ve.target=rt,ve.relatedTarget=sn,Rt=ve),sn=Rt,_t&&se)e:{for(ve=BM,nt=_t,j=se,rt=0,Rt=nt;Rt;Rt=ve(Rt))rt++;Rt=0;for(var ge=j;ge;ge=ve(ge))Rt++;for(;0<rt-Rt;)nt=ve(nt),rt--;for(;0<Rt-rt;)j=ve(j),Rt--;for(;rt--;){if(nt===j||j!==null&&nt===j.alternate){ve=nt;break e}nt=ve(nt),j=ve(j)}ve=null}else ve=null;_t!==null&&q_(wt,dt,_t,ve,!1),se!==null&&sn!==null&&q_(wt,sn,se,ve,!0)}}t:{if(dt=ot?Ji(ot):window,_t=dt.nodeName&&dt.nodeName.toLowerCase(),_t==="select"||_t==="input"&&dt.type==="file")var Ge=c0;else if(o0(dt))if(u0)Ge=jS;else{Ge=ZS;var ue=YS}else _t=dt.nodeName,!_t||_t.toLowerCase()!=="input"||dt.type!=="checkbox"&&dt.type!=="radio"?ot&&Qe(ot.elementType)&&(Ge=c0):Ge=KS;if(Ge&&(Ge=Ge(e,ot))){l0(wt,Ge,r,Tt);break t}ue&&ue(e,dt,ot),e==="focusout"&&ot&&dt.type==="number"&&ot.memoizedProps.value!=null&&Re(dt,"number",dt.value)}switch(ue=ot?Ji(ot):window,e){case"focusin":(o0(ue)||ue.contentEditable==="true")&&(Sr=ue,Nf=ot,Io=null);break;case"focusout":Io=Nf=Sr=null;break;case"mousedown":Pf=!0;break;case"contextmenu":case"mouseup":case"dragend":Pf=!1,v0(wt,r,Tt);break;case"selectionchange":if(JS)break;case"keydown":case"keyup":v0(wt,r,Tt)}var Te;if(wf)t:{switch(e){case"compositionstart":var Oe="onCompositionStart";break t;case"compositionend":Oe="onCompositionEnd";break t;case"compositionupdate":Oe="onCompositionUpdate";break t}Oe=void 0}else yr?s0(e,r)&&(Oe="onCompositionEnd"):e==="keydown"&&r.keyCode===229&&(Oe="onCompositionStart");Oe&&(n0&&r.locale!=="ko"&&(yr||Oe!=="onCompositionStart"?Oe==="onCompositionEnd"&&yr&&(Te=Qm()):(ns=Tt,Ef="value"in ns?ns.value:ns.textContent,yr=!0)),ue=Gc(ot,Oe),0<ue.length&&(Oe=new t0(Oe,e,null,r,Tt),wt.push({event:Oe,listeners:ue}),Te?Oe.data=Te:(Te=r0(r),Te!==null&&(Oe.data=Te)))),(Te=VS?kS(e,r):XS(e,r))&&(Oe=Gc(ot,"onBeforeInput"),0<Oe.length&&(ue=new t0("onBeforeInput","beforeinput",null,r,Tt),wt.push({event:ue,listeners:Oe}),ue.data=Te)),OM(wt,e,ot,r,Tt)}X_(wt,i)})}function cl(e,i,r){return{instance:e,listener:i,currentTarget:r}}function Gc(e,i){for(var r=i+"Capture",l=[];e!==null;){var f=e,p=f.stateNode;if(f=f.tag,f!==5&&f!==26&&f!==27||p===null||(f=Do(e,r),f!=null&&l.unshift(cl(e,f,p)),f=Do(e,i),f!=null&&l.push(cl(e,f,p))),e.tag===3)return l;e=e.return}return[]}function BM(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function q_(e,i,r,l,f){for(var p=i._reactName,M=[];r!==null&&r!==l;){var U=r,k=U.alternate,ot=U.stateNode;if(U=U.tag,k!==null&&k===l)break;U!==5&&U!==26&&U!==27||ot===null||(k=ot,f?(ot=Do(r,p),ot!=null&&M.unshift(cl(r,ot,k))):f||(ot=Do(r,p),ot!=null&&M.push(cl(r,ot,k)))),r=r.return}M.length!==0&&e.push({event:i,listeners:M})}var HM=/\r\n?/g,GM=/\u0000|\uFFFD/g;function Y_(e){return(typeof e=="string"?e:""+e).replace(HM,`
`).replace(GM,"")}function Z_(e,i){return i=Y_(i),Y_(e)===i}function an(e,i,r,l,f,p){switch(r){case"children":typeof l=="string"?i==="body"||i==="textarea"&&l===""||ii(e,l):(typeof l=="number"||typeof l=="bigint")&&i!=="body"&&ii(e,""+l);break;case"className":$t(e,"class",l);break;case"tabIndex":$t(e,"tabindex",l);break;case"dir":case"role":case"viewBox":case"width":case"height":$t(e,r,l);break;case"style":$i(e,l,p);break;case"data":if(i!=="object"){$t(e,"data",l);break}case"src":case"href":if(l===""&&(i!=="a"||r!=="href")){e.removeAttribute(r);break}if(l==null||typeof l=="function"||typeof l=="symbol"||typeof l=="boolean"){e.removeAttribute(r);break}l=Gs(""+l),e.setAttribute(r,l);break;case"action":case"formAction":if(typeof l=="function"){e.setAttribute(r,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof p=="function"&&(r==="formAction"?(i!=="input"&&an(e,i,"name",f.name,f,null),an(e,i,"formEncType",f.formEncType,f,null),an(e,i,"formMethod",f.formMethod,f,null),an(e,i,"formTarget",f.formTarget,f,null)):(an(e,i,"encType",f.encType,f,null),an(e,i,"method",f.method,f,null),an(e,i,"target",f.target,f,null)));if(l==null||typeof l=="symbol"||typeof l=="boolean"){e.removeAttribute(r);break}l=Gs(""+l),e.setAttribute(r,l);break;case"onClick":l!=null&&(e.onclick=Ta);break;case"onScroll":l!=null&&Ue("scroll",e);break;case"onScrollEnd":l!=null&&Ue("scrollend",e);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(s(61));if(r=l.__html,r!=null){if(f.children!=null)throw Error(s(60));e.innerHTML=r}}break;case"multiple":e.multiple=l&&typeof l!="function"&&typeof l!="symbol";break;case"muted":e.muted=l&&typeof l!="function"&&typeof l!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(l==null||typeof l=="function"||typeof l=="boolean"||typeof l=="symbol"){e.removeAttribute("xlink:href");break}r=Gs(""+l),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",r);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":l!=null&&typeof l!="function"&&typeof l!="symbol"?e.setAttribute(r,""+l):e.removeAttribute(r);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":l&&typeof l!="function"&&typeof l!="symbol"?e.setAttribute(r,""):e.removeAttribute(r);break;case"capture":case"download":l===!0?e.setAttribute(r,""):l!==!1&&l!=null&&typeof l!="function"&&typeof l!="symbol"?e.setAttribute(r,l):e.removeAttribute(r);break;case"cols":case"rows":case"size":case"span":l!=null&&typeof l!="function"&&typeof l!="symbol"&&!isNaN(l)&&1<=l?e.setAttribute(r,l):e.removeAttribute(r);break;case"rowSpan":case"start":l==null||typeof l=="function"||typeof l=="symbol"||isNaN(l)?e.removeAttribute(r):e.setAttribute(r,l);break;case"popover":Ue("beforetoggle",e),Ue("toggle",e),kt(e,"popover",l);break;case"xlinkActuate":Kt(e,"http://www.w3.org/1999/xlink","xlink:actuate",l);break;case"xlinkArcrole":Kt(e,"http://www.w3.org/1999/xlink","xlink:arcrole",l);break;case"xlinkRole":Kt(e,"http://www.w3.org/1999/xlink","xlink:role",l);break;case"xlinkShow":Kt(e,"http://www.w3.org/1999/xlink","xlink:show",l);break;case"xlinkTitle":Kt(e,"http://www.w3.org/1999/xlink","xlink:title",l);break;case"xlinkType":Kt(e,"http://www.w3.org/1999/xlink","xlink:type",l);break;case"xmlBase":Kt(e,"http://www.w3.org/XML/1998/namespace","xml:base",l);break;case"xmlLang":Kt(e,"http://www.w3.org/XML/1998/namespace","xml:lang",l);break;case"xmlSpace":Kt(e,"http://www.w3.org/XML/1998/namespace","xml:space",l);break;case"is":kt(e,"is",l);break;case"innerText":case"textContent":break;default:(!(2<r.length)||r[0]!=="o"&&r[0]!=="O"||r[1]!=="n"&&r[1]!=="N")&&(r=ua.get(r)||r,kt(e,r,l))}}function sd(e,i,r,l,f,p){switch(r){case"style":$i(e,l,p);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(s(61));if(r=l.__html,r!=null){if(f.children!=null)throw Error(s(60));e.innerHTML=r}}break;case"children":typeof l=="string"?ii(e,l):(typeof l=="number"||typeof l=="bigint")&&ii(e,""+l);break;case"onScroll":l!=null&&Ue("scroll",e);break;case"onScrollEnd":l!=null&&Ue("scrollend",e);break;case"onClick":l!=null&&(e.onclick=Ta);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!w.hasOwnProperty(r))t:{if(r[0]==="o"&&r[1]==="n"&&(f=r.endsWith("Capture"),i=r.slice(2,f?r.length-7:void 0),p=e[$e]||null,p=p!=null?p[r]:null,typeof p=="function"&&e.removeEventListener(i,p,f),typeof l=="function")){typeof p!="function"&&p!==null&&(r in e?e[r]=null:e.hasAttribute(r)&&e.removeAttribute(r)),e.addEventListener(i,l,f);break t}r in e?e[r]=l:l===!0?e.setAttribute(r,""):kt(e,r,l)}}}function Yn(e,i,r){switch(i){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Ue("error",e),Ue("load",e);var l=!1,f=!1,p;for(p in r)if(r.hasOwnProperty(p)){var M=r[p];if(M!=null)switch(p){case"src":l=!0;break;case"srcSet":f=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(s(137,i));default:an(e,i,p,M,r,null)}}f&&an(e,i,"srcSet",r.srcSet,r,null),l&&an(e,i,"src",r.src,r,null);return;case"input":Ue("invalid",e);var U=p=M=f=null,k=null,ot=null;for(l in r)if(r.hasOwnProperty(l)){var Tt=r[l];if(Tt!=null)switch(l){case"name":f=Tt;break;case"type":M=Tt;break;case"checked":k=Tt;break;case"defaultChecked":ot=Tt;break;case"value":p=Tt;break;case"defaultValue":U=Tt;break;case"children":case"dangerouslySetInnerHTML":if(Tt!=null)throw Error(s(137,i));break;default:an(e,i,l,Tt,r,null)}}Hn(e,p,U,k,ot,M,f,!1);return;case"select":Ue("invalid",e),l=M=p=null;for(f in r)if(r.hasOwnProperty(f)&&(U=r[f],U!=null))switch(f){case"value":p=U;break;case"defaultValue":M=U;break;case"multiple":l=U;default:an(e,i,f,U,r,null)}i=p,r=M,e.multiple=!!l,i!=null?En(e,!!l,i,!1):r!=null&&En(e,!!l,r,!0);return;case"textarea":Ue("invalid",e),p=f=l=null;for(M in r)if(r.hasOwnProperty(M)&&(U=r[M],U!=null))switch(M){case"value":l=U;break;case"defaultValue":f=U;break;case"children":p=U;break;case"dangerouslySetInnerHTML":if(U!=null)throw Error(s(91));break;default:an(e,i,M,U,r,null)}xi(e,l,f,p);return;case"option":for(k in r)r.hasOwnProperty(k)&&(l=r[k],l!=null)&&(k==="selected"?e.selected=l&&typeof l!="function"&&typeof l!="symbol":an(e,i,k,l,r,null));return;case"dialog":Ue("beforetoggle",e),Ue("toggle",e),Ue("cancel",e),Ue("close",e);break;case"iframe":case"object":Ue("load",e);break;case"video":case"audio":for(l=0;l<ll.length;l++)Ue(ll[l],e);break;case"image":Ue("error",e),Ue("load",e);break;case"details":Ue("toggle",e);break;case"embed":case"source":case"link":Ue("error",e),Ue("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(ot in r)if(r.hasOwnProperty(ot)&&(l=r[ot],l!=null))switch(ot){case"children":case"dangerouslySetInnerHTML":throw Error(s(137,i));default:an(e,i,ot,l,r,null)}return;default:if(Qe(i)){for(Tt in r)r.hasOwnProperty(Tt)&&(l=r[Tt],l!==void 0&&sd(e,i,Tt,l,r,void 0));return}}for(U in r)r.hasOwnProperty(U)&&(l=r[U],l!=null&&an(e,i,U,l,r,null))}function VM(e,i,r,l){switch(i){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var f=null,p=null,M=null,U=null,k=null,ot=null,Tt=null;for(_t in r){var wt=r[_t];if(r.hasOwnProperty(_t)&&wt!=null)switch(_t){case"checked":break;case"value":break;case"defaultValue":k=wt;default:l.hasOwnProperty(_t)||an(e,i,_t,null,l,wt)}}for(var dt in l){var _t=l[dt];if(wt=r[dt],l.hasOwnProperty(dt)&&(_t!=null||wt!=null))switch(dt){case"type":p=_t;break;case"name":f=_t;break;case"checked":ot=_t;break;case"defaultChecked":Tt=_t;break;case"value":M=_t;break;case"defaultValue":U=_t;break;case"children":case"dangerouslySetInnerHTML":if(_t!=null)throw Error(s(137,i));break;default:_t!==wt&&an(e,i,dt,_t,l,wt)}}jt(e,M,U,k,ot,Tt,p,f);return;case"select":_t=M=U=dt=null;for(p in r)if(k=r[p],r.hasOwnProperty(p)&&k!=null)switch(p){case"value":break;case"multiple":_t=k;default:l.hasOwnProperty(p)||an(e,i,p,null,l,k)}for(f in l)if(p=l[f],k=r[f],l.hasOwnProperty(f)&&(p!=null||k!=null))switch(f){case"value":dt=p;break;case"defaultValue":U=p;break;case"multiple":M=p;default:p!==k&&an(e,i,f,p,l,k)}i=U,r=M,l=_t,dt!=null?En(e,!!r,dt,!1):!!l!=!!r&&(i!=null?En(e,!!r,i,!0):En(e,!!r,r?[]:"",!1));return;case"textarea":_t=dt=null;for(U in r)if(f=r[U],r.hasOwnProperty(U)&&f!=null&&!l.hasOwnProperty(U))switch(U){case"value":break;case"children":break;default:an(e,i,U,null,l,f)}for(M in l)if(f=l[M],p=r[M],l.hasOwnProperty(M)&&(f!=null||p!=null))switch(M){case"value":dt=f;break;case"defaultValue":_t=f;break;case"children":break;case"dangerouslySetInnerHTML":if(f!=null)throw Error(s(91));break;default:f!==p&&an(e,i,M,f,l,p)}ni(e,dt,_t);return;case"option":for(var se in r)dt=r[se],r.hasOwnProperty(se)&&dt!=null&&!l.hasOwnProperty(se)&&(se==="selected"?e.selected=!1:an(e,i,se,null,l,dt));for(k in l)dt=l[k],_t=r[k],l.hasOwnProperty(k)&&dt!==_t&&(dt!=null||_t!=null)&&(k==="selected"?e.selected=dt&&typeof dt!="function"&&typeof dt!="symbol":an(e,i,k,dt,l,_t));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var ve in r)dt=r[ve],r.hasOwnProperty(ve)&&dt!=null&&!l.hasOwnProperty(ve)&&an(e,i,ve,null,l,dt);for(ot in l)if(dt=l[ot],_t=r[ot],l.hasOwnProperty(ot)&&dt!==_t&&(dt!=null||_t!=null))switch(ot){case"children":case"dangerouslySetInnerHTML":if(dt!=null)throw Error(s(137,i));break;default:an(e,i,ot,dt,l,_t)}return;default:if(Qe(i)){for(var sn in r)dt=r[sn],r.hasOwnProperty(sn)&&dt!==void 0&&!l.hasOwnProperty(sn)&&sd(e,i,sn,void 0,l,dt);for(Tt in l)dt=l[Tt],_t=r[Tt],!l.hasOwnProperty(Tt)||dt===_t||dt===void 0&&_t===void 0||sd(e,i,Tt,dt,l,_t);return}}for(var nt in r)dt=r[nt],r.hasOwnProperty(nt)&&dt!=null&&!l.hasOwnProperty(nt)&&an(e,i,nt,null,l,dt);for(wt in l)dt=l[wt],_t=r[wt],!l.hasOwnProperty(wt)||dt===_t||dt==null&&_t==null||an(e,i,wt,dt,l,_t)}function K_(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function kM(){if(typeof performance.getEntriesByType=="function"){for(var e=0,i=0,r=performance.getEntriesByType("resource"),l=0;l<r.length;l++){var f=r[l],p=f.transferSize,M=f.initiatorType,U=f.duration;if(p&&U&&K_(M)){for(M=0,U=f.responseEnd,l+=1;l<r.length;l++){var k=r[l],ot=k.startTime;if(ot>U)break;var Tt=k.transferSize,wt=k.initiatorType;Tt&&K_(wt)&&(k=k.responseEnd,M+=Tt*(k<U?1:(U-ot)/(k-ot)))}if(--l,i+=8*(p+M)/(f.duration/1e3),e++,10<e)break}}if(0<e)return i/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var rd=null,od=null;function Vc(e){return e.nodeType===9?e:e.ownerDocument}function j_(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Q_(e,i){if(e===0)switch(i){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&i==="foreignObject"?0:e}function ld(e,i){return e==="textarea"||e==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.children=="bigint"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var cd=null;function XM(){var e=window.event;return e&&e.type==="popstate"?e===cd?!1:(cd=e,!0):(cd=null,!1)}var J_=typeof setTimeout=="function"?setTimeout:void 0,WM=typeof clearTimeout=="function"?clearTimeout:void 0,$_=typeof Promise=="function"?Promise:void 0,qM=typeof queueMicrotask=="function"?queueMicrotask:typeof $_<"u"?function(e){return $_.resolve(null).then(e).catch(YM)}:J_;function YM(e){setTimeout(function(){throw e})}function xs(e){return e==="head"}function tv(e,i){var r=i,l=0;do{var f=r.nextSibling;if(e.removeChild(r),f&&f.nodeType===8)if(r=f.data,r==="/$"||r==="/&"){if(l===0){e.removeChild(f),Zr(i);return}l--}else if(r==="$"||r==="$?"||r==="$~"||r==="$!"||r==="&")l++;else if(r==="html")ul(e.ownerDocument.documentElement);else if(r==="head"){r=e.ownerDocument.head,ul(r);for(var p=r.firstChild;p;){var M=p.nextSibling,U=p.nodeName;p[un]||U==="SCRIPT"||U==="STYLE"||U==="LINK"&&p.rel.toLowerCase()==="stylesheet"||r.removeChild(p),p=M}}else r==="body"&&ul(e.ownerDocument.body);r=f}while(r);Zr(i)}function ev(e,i){var r=e;e=0;do{var l=r.nextSibling;if(r.nodeType===1?i?(r._stashedDisplay=r.style.display,r.style.display="none"):(r.style.display=r._stashedDisplay||"",r.getAttribute("style")===""&&r.removeAttribute("style")):r.nodeType===3&&(i?(r._stashedText=r.nodeValue,r.nodeValue=""):r.nodeValue=r._stashedText||""),l&&l.nodeType===8)if(r=l.data,r==="/$"){if(e===0)break;e--}else r!=="$"&&r!=="$?"&&r!=="$~"&&r!=="$!"||e++;r=l}while(r)}function ud(e){var i=e.firstChild;for(i&&i.nodeType===10&&(i=i.nextSibling);i;){var r=i;switch(i=i.nextSibling,r.nodeName){case"HTML":case"HEAD":case"BODY":ud(r),ke(r);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(r.rel.toLowerCase()==="stylesheet")continue}e.removeChild(r)}}function ZM(e,i,r,l){for(;e.nodeType===1;){var f=r;if(e.nodeName.toLowerCase()!==i.toLowerCase()){if(!l&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(l){if(!e[un])switch(i){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(p=e.getAttribute("rel"),p==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(p!==f.rel||e.getAttribute("href")!==(f.href==null||f.href===""?null:f.href)||e.getAttribute("crossorigin")!==(f.crossOrigin==null?null:f.crossOrigin)||e.getAttribute("title")!==(f.title==null?null:f.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(p=e.getAttribute("src"),(p!==(f.src==null?null:f.src)||e.getAttribute("type")!==(f.type==null?null:f.type)||e.getAttribute("crossorigin")!==(f.crossOrigin==null?null:f.crossOrigin))&&p&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(i==="input"&&e.type==="hidden"){var p=f.name==null?null:""+f.name;if(f.type==="hidden"&&e.getAttribute("name")===p)return e}else return e;if(e=Gi(e.nextSibling),e===null)break}return null}function KM(e,i,r){if(i==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!r||(e=Gi(e.nextSibling),e===null))return null;return e}function nv(e,i){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!i||(e=Gi(e.nextSibling),e===null))return null;return e}function fd(e){return e.data==="$?"||e.data==="$~"}function hd(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function jM(e,i){var r=e.ownerDocument;if(e.data==="$~")e._reactRetry=i;else if(e.data!=="$?"||r.readyState!=="loading")i();else{var l=function(){i(),r.removeEventListener("DOMContentLoaded",l)};r.addEventListener("DOMContentLoaded",l),e._reactRetry=l}}function Gi(e){for(;e!=null;e=e.nextSibling){var i=e.nodeType;if(i===1||i===3)break;if(i===8){if(i=e.data,i==="$"||i==="$!"||i==="$?"||i==="$~"||i==="&"||i==="F!"||i==="F")break;if(i==="/$"||i==="/&")return null}}return e}var dd=null;function iv(e){e=e.nextSibling;for(var i=0;e;){if(e.nodeType===8){var r=e.data;if(r==="/$"||r==="/&"){if(i===0)return Gi(e.nextSibling);i--}else r!=="$"&&r!=="$!"&&r!=="$?"&&r!=="$~"&&r!=="&"||i++}e=e.nextSibling}return null}function av(e){e=e.previousSibling;for(var i=0;e;){if(e.nodeType===8){var r=e.data;if(r==="$"||r==="$!"||r==="$?"||r==="$~"||r==="&"){if(i===0)return e;i--}else r!=="/$"&&r!=="/&"||i++}e=e.previousSibling}return null}function sv(e,i,r){switch(i=Vc(r),e){case"html":if(e=i.documentElement,!e)throw Error(s(452));return e;case"head":if(e=i.head,!e)throw Error(s(453));return e;case"body":if(e=i.body,!e)throw Error(s(454));return e;default:throw Error(s(451))}}function ul(e){for(var i=e.attributes;i.length;)e.removeAttributeNode(i[0]);ke(e)}var Vi=new Map,rv=new Set;function kc(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Ga=V.d;V.d={f:QM,r:JM,D:$M,C:tb,L:eb,m:nb,X:ab,S:ib,M:sb};function QM(){var e=Ga.f(),i=Pc();return e||i}function JM(e){var i=vi(e);i!==null&&i.tag===5&&i.type==="form"?bg(i):Ga.r(e)}var Wr=typeof document>"u"?null:document;function ov(e,i,r){var l=Wr;if(l&&typeof i=="string"&&i){var f=We(i);f='link[rel="'+e+'"][href="'+f+'"]',typeof r=="string"&&(f+='[crossorigin="'+r+'"]'),rv.has(f)||(rv.add(f),e={rel:e,crossOrigin:r,href:i},l.querySelector(f)===null&&(i=l.createElement("link"),Yn(i,"link",e),pn(i),l.head.appendChild(i)))}}function $M(e){Ga.D(e),ov("dns-prefetch",e,null)}function tb(e,i){Ga.C(e,i),ov("preconnect",e,i)}function eb(e,i,r){Ga.L(e,i,r);var l=Wr;if(l&&e&&i){var f='link[rel="preload"][as="'+We(i)+'"]';i==="image"&&r&&r.imageSrcSet?(f+='[imagesrcset="'+We(r.imageSrcSet)+'"]',typeof r.imageSizes=="string"&&(f+='[imagesizes="'+We(r.imageSizes)+'"]')):f+='[href="'+We(e)+'"]';var p=f;switch(i){case"style":p=qr(e);break;case"script":p=Yr(e)}Vi.has(p)||(e=v({rel:"preload",href:i==="image"&&r&&r.imageSrcSet?void 0:e,as:i},r),Vi.set(p,e),l.querySelector(f)!==null||i==="style"&&l.querySelector(fl(p))||i==="script"&&l.querySelector(hl(p))||(i=l.createElement("link"),Yn(i,"link",e),pn(i),l.head.appendChild(i)))}}function nb(e,i){Ga.m(e,i);var r=Wr;if(r&&e){var l=i&&typeof i.as=="string"?i.as:"script",f='link[rel="modulepreload"][as="'+We(l)+'"][href="'+We(e)+'"]',p=f;switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":p=Yr(e)}if(!Vi.has(p)&&(e=v({rel:"modulepreload",href:e},i),Vi.set(p,e),r.querySelector(f)===null)){switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(r.querySelector(hl(p)))return}l=r.createElement("link"),Yn(l,"link",e),pn(l),r.head.appendChild(l)}}}function ib(e,i,r){Ga.S(e,i,r);var l=Wr;if(l&&e){var f=Pi(l).hoistableStyles,p=qr(e);i=i||"default";var M=f.get(p);if(!M){var U={loading:0,preload:null};if(M=l.querySelector(fl(p)))U.loading=5;else{e=v({rel:"stylesheet",href:e,"data-precedence":i},r),(r=Vi.get(p))&&pd(e,r);var k=M=l.createElement("link");pn(k),Yn(k,"link",e),k._p=new Promise(function(ot,Tt){k.onload=ot,k.onerror=Tt}),k.addEventListener("load",function(){U.loading|=1}),k.addEventListener("error",function(){U.loading|=2}),U.loading|=4,Xc(M,i,l)}M={type:"stylesheet",instance:M,count:1,state:U},f.set(p,M)}}}function ab(e,i){Ga.X(e,i);var r=Wr;if(r&&e){var l=Pi(r).hoistableScripts,f=Yr(e),p=l.get(f);p||(p=r.querySelector(hl(f)),p||(e=v({src:e,async:!0},i),(i=Vi.get(f))&&md(e,i),p=r.createElement("script"),pn(p),Yn(p,"link",e),r.head.appendChild(p)),p={type:"script",instance:p,count:1,state:null},l.set(f,p))}}function sb(e,i){Ga.M(e,i);var r=Wr;if(r&&e){var l=Pi(r).hoistableScripts,f=Yr(e),p=l.get(f);p||(p=r.querySelector(hl(f)),p||(e=v({src:e,async:!0,type:"module"},i),(i=Vi.get(f))&&md(e,i),p=r.createElement("script"),pn(p),Yn(p,"link",e),r.head.appendChild(p)),p={type:"script",instance:p,count:1,state:null},l.set(f,p))}}function lv(e,i,r,l){var f=(f=K.current)?kc(f):null;if(!f)throw Error(s(446));switch(e){case"meta":case"title":return null;case"style":return typeof r.precedence=="string"&&typeof r.href=="string"?(i=qr(r.href),r=Pi(f).hoistableStyles,l=r.get(i),l||(l={type:"style",instance:null,count:0,state:null},r.set(i,l)),l):{type:"void",instance:null,count:0,state:null};case"link":if(r.rel==="stylesheet"&&typeof r.href=="string"&&typeof r.precedence=="string"){e=qr(r.href);var p=Pi(f).hoistableStyles,M=p.get(e);if(M||(f=f.ownerDocument||f,M={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},p.set(e,M),(p=f.querySelector(fl(e)))&&!p._p&&(M.instance=p,M.state.loading=5),Vi.has(e)||(r={rel:"preload",as:"style",href:r.href,crossOrigin:r.crossOrigin,integrity:r.integrity,media:r.media,hrefLang:r.hrefLang,referrerPolicy:r.referrerPolicy},Vi.set(e,r),p||rb(f,e,r,M.state))),i&&l===null)throw Error(s(528,""));return M}if(i&&l!==null)throw Error(s(529,""));return null;case"script":return i=r.async,r=r.src,typeof r=="string"&&i&&typeof i!="function"&&typeof i!="symbol"?(i=Yr(r),r=Pi(f).hoistableScripts,l=r.get(i),l||(l={type:"script",instance:null,count:0,state:null},r.set(i,l)),l):{type:"void",instance:null,count:0,state:null};default:throw Error(s(444,e))}}function qr(e){return'href="'+We(e)+'"'}function fl(e){return'link[rel="stylesheet"]['+e+"]"}function cv(e){return v({},e,{"data-precedence":e.precedence,precedence:null})}function rb(e,i,r,l){e.querySelector('link[rel="preload"][as="style"]['+i+"]")?l.loading=1:(i=e.createElement("link"),l.preload=i,i.addEventListener("load",function(){return l.loading|=1}),i.addEventListener("error",function(){return l.loading|=2}),Yn(i,"link",r),pn(i),e.head.appendChild(i))}function Yr(e){return'[src="'+We(e)+'"]'}function hl(e){return"script[async]"+e}function uv(e,i,r){if(i.count++,i.instance===null)switch(i.type){case"style":var l=e.querySelector('style[data-href~="'+We(r.href)+'"]');if(l)return i.instance=l,pn(l),l;var f=v({},r,{"data-href":r.href,"data-precedence":r.precedence,href:null,precedence:null});return l=(e.ownerDocument||e).createElement("style"),pn(l),Yn(l,"style",f),Xc(l,r.precedence,e),i.instance=l;case"stylesheet":f=qr(r.href);var p=e.querySelector(fl(f));if(p)return i.state.loading|=4,i.instance=p,pn(p),p;l=cv(r),(f=Vi.get(f))&&pd(l,f),p=(e.ownerDocument||e).createElement("link"),pn(p);var M=p;return M._p=new Promise(function(U,k){M.onload=U,M.onerror=k}),Yn(p,"link",l),i.state.loading|=4,Xc(p,r.precedence,e),i.instance=p;case"script":return p=Yr(r.src),(f=e.querySelector(hl(p)))?(i.instance=f,pn(f),f):(l=r,(f=Vi.get(p))&&(l=v({},r),md(l,f)),e=e.ownerDocument||e,f=e.createElement("script"),pn(f),Yn(f,"link",l),e.head.appendChild(f),i.instance=f);case"void":return null;default:throw Error(s(443,i.type))}else i.type==="stylesheet"&&(i.state.loading&4)===0&&(l=i.instance,i.state.loading|=4,Xc(l,r.precedence,e));return i.instance}function Xc(e,i,r){for(var l=r.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),f=l.length?l[l.length-1]:null,p=f,M=0;M<l.length;M++){var U=l[M];if(U.dataset.precedence===i)p=U;else if(p!==f)break}p?p.parentNode.insertBefore(e,p.nextSibling):(i=r.nodeType===9?r.head:r,i.insertBefore(e,i.firstChild))}function pd(e,i){e.crossOrigin==null&&(e.crossOrigin=i.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=i.referrerPolicy),e.title==null&&(e.title=i.title)}function md(e,i){e.crossOrigin==null&&(e.crossOrigin=i.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=i.referrerPolicy),e.integrity==null&&(e.integrity=i.integrity)}var Wc=null;function fv(e,i,r){if(Wc===null){var l=new Map,f=Wc=new Map;f.set(r,l)}else f=Wc,l=f.get(r),l||(l=new Map,f.set(r,l));if(l.has(e))return l;for(l.set(e,null),r=r.getElementsByTagName(e),f=0;f<r.length;f++){var p=r[f];if(!(p[un]||p[Ke]||e==="link"&&p.getAttribute("rel")==="stylesheet")&&p.namespaceURI!=="http://www.w3.org/2000/svg"){var M=p.getAttribute(i)||"";M=e+M;var U=l.get(M);U?U.push(p):l.set(M,[p])}}return l}function hv(e,i,r){e=e.ownerDocument||e,e.head.insertBefore(r,i==="title"?e.querySelector("head > title"):null)}function ob(e,i,r){if(r===1||i.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof i.precedence!="string"||typeof i.href!="string"||i.href==="")break;return!0;case"link":if(typeof i.rel!="string"||typeof i.href!="string"||i.href===""||i.onLoad||i.onError)break;return i.rel==="stylesheet"?(e=i.disabled,typeof i.precedence=="string"&&e==null):!0;case"script":if(i.async&&typeof i.async!="function"&&typeof i.async!="symbol"&&!i.onLoad&&!i.onError&&i.src&&typeof i.src=="string")return!0}return!1}function dv(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function lb(e,i,r,l){if(r.type==="stylesheet"&&(typeof l.media!="string"||matchMedia(l.media).matches!==!1)&&(r.state.loading&4)===0){if(r.instance===null){var f=qr(l.href),p=i.querySelector(fl(f));if(p){i=p._p,i!==null&&typeof i=="object"&&typeof i.then=="function"&&(e.count++,e=qc.bind(e),i.then(e,e)),r.state.loading|=4,r.instance=p,pn(p);return}p=i.ownerDocument||i,l=cv(l),(f=Vi.get(f))&&pd(l,f),p=p.createElement("link"),pn(p);var M=p;M._p=new Promise(function(U,k){M.onload=U,M.onerror=k}),Yn(p,"link",l),r.instance=p}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(r,i),(i=r.state.preload)&&(r.state.loading&3)===0&&(e.count++,r=qc.bind(e),i.addEventListener("load",r),i.addEventListener("error",r))}}var gd=0;function cb(e,i){return e.stylesheets&&e.count===0&&Zc(e,e.stylesheets),0<e.count||0<e.imgCount?function(r){var l=setTimeout(function(){if(e.stylesheets&&Zc(e,e.stylesheets),e.unsuspend){var p=e.unsuspend;e.unsuspend=null,p()}},6e4+i);0<e.imgBytes&&gd===0&&(gd=62500*kM());var f=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Zc(e,e.stylesheets),e.unsuspend)){var p=e.unsuspend;e.unsuspend=null,p()}},(e.imgBytes>gd?50:800)+i);return e.unsuspend=r,function(){e.unsuspend=null,clearTimeout(l),clearTimeout(f)}}:null}function qc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Zc(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yc=null;function Zc(e,i){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yc=new Map,i.forEach(ub,e),Yc=null,qc.call(e))}function ub(e,i){if(!(i.state.loading&4)){var r=Yc.get(e);if(r)var l=r.get(null);else{r=new Map,Yc.set(e,r);for(var f=e.querySelectorAll("link[data-precedence],style[data-precedence]"),p=0;p<f.length;p++){var M=f[p];(M.nodeName==="LINK"||M.getAttribute("media")!=="not all")&&(r.set(M.dataset.precedence,M),l=M)}l&&r.set(null,l)}f=i.instance,M=f.getAttribute("data-precedence"),p=r.get(M)||l,p===l&&r.set(null,f),r.set(M,f),this.count++,l=qc.bind(this),f.addEventListener("load",l),f.addEventListener("error",l),p?p.parentNode.insertBefore(f,p.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(f,e.firstChild)),i.state.loading|=4}}var dl={$$typeof:z,Provider:null,Consumer:null,_currentValue:$,_currentValue2:$,_threadCount:0};function fb(e,i,r,l,f,p,M,U,k){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=qt(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=qt(0),this.hiddenUpdates=qt(null),this.identifierPrefix=l,this.onUncaughtError=f,this.onCaughtError=p,this.onRecoverableError=M,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=k,this.incompleteTransitions=new Map}function pv(e,i,r,l,f,p,M,U,k,ot,Tt,wt){return e=new fb(e,i,r,M,k,ot,Tt,wt,U),i=1,p===!0&&(i|=24),p=Si(3,null,null,i),e.current=p,p.stateNode=e,i=Kf(),i.refCount++,e.pooledCache=i,i.refCount++,p.memoizedState={element:l,isDehydrated:r,cache:i},$f(p),e}function mv(e){return e?(e=Er,e):Er}function gv(e,i,r,l,f,p){f=mv(f),l.context===null?l.context=f:l.pendingContext=f,l=ls(i),l.payload={element:r},p=p===void 0?null:p,p!==null&&(l.callback=p),r=cs(e,l,i),r!==null&&(mi(r,e,i),Wo(r,e,i))}function _v(e,i){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var r=e.retryLane;e.retryLane=r!==0&&r<i?r:i}}function _d(e,i){_v(e,i),(e=e.alternate)&&_v(e,i)}function vv(e){if(e.tag===13||e.tag===31){var i=Ws(e,67108864);i!==null&&mi(i,e,67108864),_d(e,67108864)}}function xv(e){if(e.tag===13||e.tag===31){var i=Ai();i=Ne(i);var r=Ws(e,i);r!==null&&mi(r,e,i),_d(e,i)}}var Kc=!0;function hb(e,i,r,l){var f=I.T;I.T=null;var p=V.p;try{V.p=2,vd(e,i,r,l)}finally{V.p=p,I.T=f}}function db(e,i,r,l){var f=I.T;I.T=null;var p=V.p;try{V.p=8,vd(e,i,r,l)}finally{V.p=p,I.T=f}}function vd(e,i,r,l){if(Kc){var f=xd(l);if(f===null)ad(e,i,l,jc,r),Sv(e,l);else if(mb(f,e,i,r,l))l.stopPropagation();else if(Sv(e,l),i&4&&-1<pb.indexOf(e)){for(;f!==null;){var p=vi(f);if(p!==null)switch(p.tag){case 3:if(p=p.stateNode,p.current.memoizedState.isDehydrated){var M=Pt(p.pendingLanes);if(M!==0){var U=p;for(U.pendingLanes|=2,U.entangledLanes|=2;M;){var k=1<<31-Bt(M);U.entanglements[1]|=k,M&=~k}pa(p),(Ye&6)===0&&(Lc=fe()+500,ol(0))}}break;case 31:case 13:U=Ws(p,2),U!==null&&mi(U,p,2),Pc(),_d(p,2)}if(p=xd(l),p===null&&ad(e,i,l,jc,r),p===f)break;f=p}f!==null&&l.stopPropagation()}else ad(e,i,l,null,r)}}function xd(e){return e=Sf(e),yd(e)}var jc=null;function yd(e){if(jc=null,e=kn(e),e!==null){var i=c(e);if(i===null)e=null;else{var r=i.tag;if(r===13){if(e=u(i),e!==null)return e;e=null}else if(r===31){if(e=h(i),e!==null)return e;e=null}else if(r===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;e=null}else i!==e&&(e=null)}}return jc=e,null}function yv(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(de()){case O:return 2;case E:return 8;case Q:case it:return 32;case mt:return 268435456;default:return 32}default:return 32}}var Sd=!1,ys=null,Ss=null,Ms=null,pl=new Map,ml=new Map,bs=[],pb="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Sv(e,i){switch(e){case"focusin":case"focusout":ys=null;break;case"dragenter":case"dragleave":Ss=null;break;case"mouseover":case"mouseout":Ms=null;break;case"pointerover":case"pointerout":pl.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":ml.delete(i.pointerId)}}function gl(e,i,r,l,f,p){return e===null||e.nativeEvent!==p?(e={blockedOn:i,domEventName:r,eventSystemFlags:l,nativeEvent:p,targetContainers:[f]},i!==null&&(i=vi(i),i!==null&&vv(i)),e):(e.eventSystemFlags|=l,i=e.targetContainers,f!==null&&i.indexOf(f)===-1&&i.push(f),e)}function mb(e,i,r,l,f){switch(i){case"focusin":return ys=gl(ys,e,i,r,l,f),!0;case"dragenter":return Ss=gl(Ss,e,i,r,l,f),!0;case"mouseover":return Ms=gl(Ms,e,i,r,l,f),!0;case"pointerover":var p=f.pointerId;return pl.set(p,gl(pl.get(p)||null,e,i,r,l,f)),!0;case"gotpointercapture":return p=f.pointerId,ml.set(p,gl(ml.get(p)||null,e,i,r,l,f)),!0}return!1}function Mv(e){var i=kn(e.target);if(i!==null){var r=c(i);if(r!==null){if(i=r.tag,i===13){if(i=u(r),i!==null){e.blockedOn=i,Ni(e.priority,function(){xv(r)});return}}else if(i===31){if(i=h(r),i!==null){e.blockedOn=i,Ni(e.priority,function(){xv(r)});return}}else if(i===3&&r.stateNode.current.memoizedState.isDehydrated){e.blockedOn=r.tag===3?r.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Qc(e){if(e.blockedOn!==null)return!1;for(var i=e.targetContainers;0<i.length;){var r=xd(e.nativeEvent);if(r===null){r=e.nativeEvent;var l=new r.constructor(r.type,r);yf=l,r.target.dispatchEvent(l),yf=null}else return i=vi(r),i!==null&&vv(i),e.blockedOn=r,!1;i.shift()}return!0}function bv(e,i,r){Qc(e)&&r.delete(i)}function gb(){Sd=!1,ys!==null&&Qc(ys)&&(ys=null),Ss!==null&&Qc(Ss)&&(Ss=null),Ms!==null&&Qc(Ms)&&(Ms=null),pl.forEach(bv),ml.forEach(bv)}function Jc(e,i){e.blockedOn===i&&(e.blockedOn=null,Sd||(Sd=!0,a.unstable_scheduleCallback(a.unstable_NormalPriority,gb)))}var $c=null;function Ev(e){$c!==e&&($c=e,a.unstable_scheduleCallback(a.unstable_NormalPriority,function(){$c===e&&($c=null);for(var i=0;i<e.length;i+=3){var r=e[i],l=e[i+1],f=e[i+2];if(typeof l!="function"){if(yd(l||r)===null)continue;break}var p=vi(r);p!==null&&(e.splice(i,3),i-=3,xh(p,{pending:!0,data:f,method:r.method,action:l},l,f))}}))}function Zr(e){function i(k){return Jc(k,e)}ys!==null&&Jc(ys,e),Ss!==null&&Jc(Ss,e),Ms!==null&&Jc(Ms,e),pl.forEach(i),ml.forEach(i);for(var r=0;r<bs.length;r++){var l=bs[r];l.blockedOn===e&&(l.blockedOn=null)}for(;0<bs.length&&(r=bs[0],r.blockedOn===null);)Mv(r),r.blockedOn===null&&bs.shift();if(r=(e.ownerDocument||e).$$reactFormReplay,r!=null)for(l=0;l<r.length;l+=3){var f=r[l],p=r[l+1],M=f[$e]||null;if(typeof p=="function")M||Ev(r);else if(M){var U=null;if(p&&p.hasAttribute("formAction")){if(f=p,M=p[$e]||null)U=M.formAction;else if(yd(f)!==null)continue}else U=M.action;typeof U=="function"?r[l+1]=U:(r.splice(l,3),l-=3),Ev(r)}}}function Tv(){function e(p){p.canIntercept&&p.info==="react-transition"&&p.intercept({handler:function(){return new Promise(function(M){return f=M})},focusReset:"manual",scroll:"manual"})}function i(){f!==null&&(f(),f=null),l||setTimeout(r,20)}function r(){if(!l&&!navigation.transition){var p=navigation.currentEntry;p&&p.url!=null&&navigation.navigate(p.url,{state:p.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var l=!1,f=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",i),navigation.addEventListener("navigateerror",i),setTimeout(r,100),function(){l=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",i),navigation.removeEventListener("navigateerror",i),f!==null&&(f(),f=null)}}}function Md(e){this._internalRoot=e}tu.prototype.render=Md.prototype.render=function(e){var i=this._internalRoot;if(i===null)throw Error(s(409));var r=i.current,l=Ai();gv(r,l,e,i,null,null)},tu.prototype.unmount=Md.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var i=e.containerInfo;gv(e.current,2,null,e,null,null),Pc(),i[Ie]=null}};function tu(e){this._internalRoot=e}tu.prototype.unstable_scheduleHydration=function(e){if(e){var i=Li();e={blockedOn:null,target:e,priority:i};for(var r=0;r<bs.length&&i!==0&&i<bs[r].priority;r++);bs.splice(r,0,e),r===0&&Mv(e)}};var Av=t.version;if(Av!=="19.2.3")throw Error(s(527,Av,"19.2.3"));V.findDOMNode=function(e){var i=e._reactInternals;if(i===void 0)throw typeof e.render=="function"?Error(s(188)):(e=Object.keys(e).join(","),Error(s(268,e)));return e=d(i),e=e!==null?g(e):null,e=e===null?null:e.stateNode,e};var _b={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:I,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var eu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!eu.isDisabled&&eu.supportsFiber)try{ht=eu.inject(_b),pt=eu}catch{}}return vl.createRoot=function(e,i){if(!o(e))throw Error(s(299));var r=!1,l="",f=Ng,p=Pg,M=Og;return i!=null&&(i.unstable_strictMode===!0&&(r=!0),i.identifierPrefix!==void 0&&(l=i.identifierPrefix),i.onUncaughtError!==void 0&&(f=i.onUncaughtError),i.onCaughtError!==void 0&&(p=i.onCaughtError),i.onRecoverableError!==void 0&&(M=i.onRecoverableError)),i=pv(e,1,!1,null,null,r,l,null,f,p,M,Tv),e[Ie]=i.current,id(e),new Md(i)},vl.hydrateRoot=function(e,i,r){if(!o(e))throw Error(s(299));var l=!1,f="",p=Ng,M=Pg,U=Og,k=null;return r!=null&&(r.unstable_strictMode===!0&&(l=!0),r.identifierPrefix!==void 0&&(f=r.identifierPrefix),r.onUncaughtError!==void 0&&(p=r.onUncaughtError),r.onCaughtError!==void 0&&(M=r.onCaughtError),r.onRecoverableError!==void 0&&(U=r.onRecoverableError),r.formState!==void 0&&(k=r.formState)),i=pv(e,1,!0,i,r??null,l,f,k,p,M,U,Tv),i.context=mv(null),r=i.current,l=Ai(),l=Ne(l),f=ls(l),f.callback=null,cs(r,f,l),r=l,i.current.lanes=r,Vt(i,r),pa(i),e[Ie]=i.current,id(e),new tu(i)},vl.version="19.2.3",vl}var zv;function Rb(){if(zv)return Td.exports;zv=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(t){console.error(t)}}return a(),Td.exports=Ab(),Td.exports}var Cb=Rb();var pm=/^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i,sy=/^[\\/]{2}/;function wb(a,t){return t+a.replace(/\\/g,"/")}var Fv="popstate";function Iv(a){return typeof a=="object"&&a!=null&&"pathname"in a&&"search"in a&&"hash"in a&&"state"in a&&"key"in a}function Db(a={}){function t(s,o){let c=o.state?.masked,{pathname:u,search:h,hash:m}=c||s.location;return xp("",{pathname:u,search:h,hash:m},o.state&&o.state.usr||null,o.state&&o.state.key||"default",c?{pathname:s.location.pathname,search:s.location.search,hash:s.location.hash}:void 0)}function n(s,o){return typeof o=="string"?o:zl(o)}return Lb(t,n,null,a)}function vn(a,t){if(a===!1||a===null||typeof a>"u")throw new Error(t)}function ba(a,t){if(!a){typeof console<"u"&&console.warn(t);try{throw new Error(t)}catch{}}}function Ub(){return Math.random().toString(36).substring(2,10)}function Bv(a,t){return{usr:a.state,key:a.key,idx:t,masked:a.mask?{pathname:a.pathname,search:a.search,hash:a.hash}:void 0}}function xp(a,t,n=null,s,o){return{pathname:typeof a=="string"?a:a.pathname,search:"",hash:"",...typeof t=="string"?Ao(t):t,state:n,key:t&&t.key||s||Ub(),mask:o}}function zl({pathname:a="/",search:t="",hash:n=""}){return t&&t!=="?"&&(a+=t.charAt(0)==="?"?t:"?"+t),n&&n!=="#"&&(a+=n.charAt(0)==="#"?n:"#"+n),a}function Ao(a){let t={};if(a){let n=a.indexOf("#");n>=0&&(t.hash=a.substring(n),a=a.substring(0,n));let s=a.indexOf("?");s>=0&&(t.search=a.substring(s),a=a.substring(0,s)),a&&(t.pathname=a)}return t}function Lb(a,t,n,s={}){let{window:o=document.defaultView,v5Compat:c=!1}=s,u=o.history,h="POP",m=null,d=g();d==null&&(d=0,u.replaceState({...u.state,idx:d},""));function g(){return(u.state||{idx:null}).idx}function v(){h="POP";let x=g(),y=x==null?null:x-d;d=x,m&&m({action:h,location:R.location,delta:y})}function _(x,y){h="PUSH";let P=Iv(x)?x:xp(R.location,x,y);d=g()+1;let z=Bv(P,d),C=R.createHref(P.mask||P);try{u.pushState(z,"",C)}catch(L){if(L instanceof DOMException&&L.name==="DataCloneError")throw L;o.location.assign(C)}c&&m&&m({action:h,location:R.location,delta:1})}function S(x,y){h="REPLACE";let P=Iv(x)?x:xp(R.location,x,y);d=g();let z=Bv(P,d),C=R.createHref(P.mask||P);u.replaceState(z,"",C),c&&m&&m({action:h,location:R.location,delta:0})}function b(x){return Nb(o,x)}let R={get action(){return h},get location(){return a(o,u)},listen(x){if(m)throw new Error("A history only accepts one active listener");return o.addEventListener(Fv,v),m=x,()=>{o.removeEventListener(Fv,v),m=null}},createHref(x){return t(o,x)},createURL:b,encodeLocation(x){let y=b(x);return{pathname:y.pathname,search:y.search,hash:y.hash}},push:_,replace:S,go(x){return u.go(x)}};return R}function Nb(a,t,n=!1){let s="http://localhost";a&&(s=a.location.origin!=="null"?a.location.origin:a.location.href),vn(s,"No window.location.(origin|href) available to create URL");let o=typeof t=="string"?t:zl(t);return o=o.replace(/ $/,"%20"),!n&&sy.test(o)&&(o=s+o),new URL(o,s)}function ry(a,t,n="/"){return Pb(a,t,n,!1)}function Pb(a,t,n,s,o){let c=typeof t=="string"?Ao(t):t,u=Qa(c.pathname||"/",n);if(u==null)return null;let h=Ob(a),m=null,d=qb(u);for(let g=0;m==null&&g<h.length;++g)m=Wb(h[g],d,s);return m}function Ob(a){let t=oy(a);return zb(t),t}function oy(a,t=[],n=[],s="",o=!1){let c=(u,h,m=o,d)=>{let g={relativePath:d===void 0?u.path||"":d,caseSensitive:u.caseSensitive===!0,childrenIndex:h,route:u};if(g.relativePath.startsWith("/")){if(!g.relativePath.startsWith(s)&&m)return;vn(g.relativePath.startsWith(s),`Absolute route path "${g.relativePath}" nested under path "${s}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),g.relativePath=g.relativePath.slice(s.length)}let v=la([s,g.relativePath]),_=n.concat(g);u.children&&u.children.length>0&&(vn(u.index!==!0,`Index routes must not have child routes. Please remove all child routes from route path "${v}".`),oy(u.children,t,_,v,m)),!(u.path==null&&!u.index)&&t.push({path:v,score:kb(v,u.index),routesMeta:_.map((S,b)=>{let[R,x]=uy(S.relativePath,S.caseSensitive,b===_.length-1);return{...S,matcher:R,compiledParams:x}})})};return a.forEach((u,h)=>{if(u.path===""||!u.path?.includes("?"))c(u,h);else for(let m of ly(u.path))c(u,h,!0,m)}),t}function ly(a){let t=a.split("/");if(t.length===0)return[];let[n,...s]=t,o=n.endsWith("?"),c=n.replace(/\?$/,"");if(s.length===0)return o?[c,""]:[c];let u=ly(s.join("/")),h=[];return h.push(...u.map(m=>m===""?c:[c,m].join("/"))),o&&h.push(...u),h.map(m=>a.startsWith("/")&&m===""?"/":m)}function zb(a){a.sort((t,n)=>t.score!==n.score?n.score-t.score:Xb(t.routesMeta.map(s=>s.childrenIndex),n.routesMeta.map(s=>s.childrenIndex)))}var Fb=/^:[\w-]+$/,Ib=3,Bb=2,Hb=1,Gb=10,Vb=-2,Hv=a=>a==="*";function kb(a,t){let n=a.split("/"),s=n.length;return n.some(Hv)&&(s+=Vb),t&&(s+=Bb),n.filter(o=>!Hv(o)).reduce((o,c)=>o+(Fb.test(c)?Ib:c===""?Hb:Gb),s)}function Xb(a,t){return a.length===t.length&&a.slice(0,-1).every((s,o)=>s===t[o])?a[a.length-1]-t[t.length-1]:0}function Wb(a,t,n=!1){let{routesMeta:s}=a,o={},c="/",u=[];for(let h=0;h<s.length;++h){let m=s[h],d=h===s.length-1,g=c==="/"?t:t.slice(c.length)||"/",v={path:m.relativePath,caseSensitive:m.caseSensitive,end:d},_=m.matcher&&m.compiledParams?cy(v,g,m.matcher,m.compiledParams):ju(v,g),S=m.route;if(!_&&d&&n&&!s[s.length-1].route.index&&(_=ju({path:m.relativePath,caseSensitive:m.caseSensitive,end:!1},g)),!_)return null;Object.assign(o,_.params),u.push({params:o,pathname:la([c,_.pathname]),pathnameBase:Kb(la([c,_.pathnameBase])),route:S}),_.pathnameBase!=="/"&&(c=la([c,_.pathnameBase]))}return u}function ju(a,t){typeof a=="string"&&(a={path:a,caseSensitive:!1,end:!0});let[n,s]=uy(a.path,a.caseSensitive,a.end);return cy(a,t,n,s)}function cy(a,t,n,s){let o=t.match(n);if(!o)return null;let c=o[0],u=c.replace(/(.)\/+$/,"$1"),h=o.slice(1);return{params:s.reduce((d,{paramName:g,isOptional:v},_)=>{if(g==="*"){let b=h[_]||"";u=c.slice(0,c.length-b.length).replace(/(.)\/+$/,"$1")}const S=h[_];return v&&!S?d[g]=void 0:d[g]=(S||"").replace(/%2F/g,"/"),d},{}),pathname:c,pathnameBase:u,pattern:a}}function uy(a,t=!1,n=!0){ba(a==="*"||!a.endsWith("*")||a.endsWith("/*"),`Route path "${a}" will be treated as if it were "${a.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${a.replace(/\*$/,"/*")}".`);let s=[],o="^"+a.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(u,h,m,d,g)=>{if(s.push({paramName:h,isOptional:m!=null}),m){let v=g.charAt(d+u.length);return v&&v!=="/"?"/([^\\/]*)":"(?:/([^\\/]*))?"}return"/([^\\/]+)"}).replace(/\/([\w-]+)\?(\/|$)/g,"(/$1)?$2");return a.endsWith("*")?(s.push({paramName:"*"}),o+=a==="*"||a==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):n?o+="\\/*$":a!==""&&a!=="/"&&(o+="(?:(?=\\/|$))"),[new RegExp(o,t?void 0:"i"),s]}function qb(a){try{return a.split("/").map(t=>decodeURIComponent(t).replace(/\//g,"%2F")).join("/")}catch(t){return ba(!1,`The URL path "${a}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${t}).`),a}}function Qa(a,t){if(t==="/")return a;if(!a.toLowerCase().startsWith(t.toLowerCase()))return null;let n=t.endsWith("/")?t.length-1:t.length,s=a.charAt(n);return s&&s!=="/"?null:a.slice(n)||"/"}function Yb(a,t="/"){let{pathname:n,search:s="",hash:o=""}=typeof a=="string"?Ao(a):a,c;return n?(n=hy(n),n.startsWith("/")?c=Gv(n.substring(1),"/"):c=Gv(n,t)):c=t,{pathname:c,search:jb(s),hash:Qb(o)}}function Gv(a,t){let n=Qu(t).split("/");return a.split("/").forEach(o=>{o===".."?n.length>1&&n.pop():o!=="."&&n.push(o)}),n.length>1?n.join("/"):"/"}function wd(a,t,n,s){return`Cannot include a '${a}' character in a manually specified \`to.${t}\` field [${JSON.stringify(s)}].  Please separate it out to the \`to.${n}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`}function Zb(a){return a.filter((t,n)=>n===0||t.route.path&&t.route.path.length>0)}function fy(a){let t=Zb(a);return t.map((n,s)=>s===t.length-1?n.pathname:n.pathnameBase)}function mm(a,t,n,s=!1){let o;typeof a=="string"?o=Ao(a):(o={...a},vn(!o.pathname||!o.pathname.includes("?"),wd("?","pathname","search",o)),vn(!o.pathname||!o.pathname.includes("#"),wd("#","pathname","hash",o)),vn(!o.search||!o.search.includes("#"),wd("#","search","hash",o)));let c=a===""||o.pathname==="",u=c?"/":o.pathname,h;if(u==null)h=n;else{let v=t.length-1;if(!s&&u.startsWith("..")){let _=u.split("/");for(;_[0]==="..";)_.shift(),v-=1;o.pathname=_.join("/")}h=v>=0?t[v]:"/"}let m=Yb(o,h),d=u&&u!=="/"&&u.endsWith("/"),g=(c||u===".")&&n.endsWith("/");return!m.pathname.endsWith("/")&&(d||g)&&(m.pathname+="/"),m}var hy=a=>a.replace(/[\\/]{2,}/g,"/"),la=a=>hy(a.join("/")),Qu=a=>a.replace(/\/+$/,""),Kb=a=>Qu(a).replace(/^\/*/,"/"),jb=a=>!a||a==="?"?"":a.startsWith("?")?a:"?"+a,Qb=a=>!a||a==="#"?"":a.startsWith("#")?a:"#"+a,Jb=class{constructor(a,t,n,s=!1){this.status=a,this.statusText=t||"",this.internal=s,n instanceof Error?(this.data=n.toString(),this.error=n):this.data=n}};function $b(a){return a!=null&&typeof a.status=="number"&&typeof a.statusText=="string"&&typeof a.internal=="boolean"&&"data"in a}function t1(a){let t=a.map(n=>n.route.path).filter(Boolean);return la(t)||"/"}var dy=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";function py(a,t){let n=a;if(typeof n!="string"||!pm.test(n))return{absoluteURL:void 0,isExternal:!1,to:n};let s=n,o=!1;if(dy)try{let c=new URL(window.location.href),u=sy.test(n)?new URL(wb(n,c.protocol)):new URL(n),h=Qa(u.pathname,t);u.origin===c.origin&&h!=null?n=h+u.search+u.hash:o=!0}catch{ba(!1,`<Link to="${n}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)}return{absoluteURL:s,isExternal:o,to:n}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");var my=["POST","PUT","PATCH","DELETE"];new Set(my);var e1=["GET",...my];new Set(e1);var n1=["about:","blob:","chrome:","chrome-untrusted:","content:","data:","devtools:","file:","filesystem:","javascript:"];function i1(a){try{return n1.includes(new URL(a).protocol)}catch{return!1}}var Ro=Z.createContext(null);Ro.displayName="DataRouter";var uf=Z.createContext(null);uf.displayName="DataRouterState";var gy=Z.createContext(!1);function a1(){return Z.useContext(gy)}var _y=Z.createContext({isTransitioning:!1});_y.displayName="ViewTransition";var s1=Z.createContext(new Map);s1.displayName="Fetchers";var r1=Z.createContext(null);r1.displayName="Await";var Zi=Z.createContext(null);Zi.displayName="Navigation";var Vl=Z.createContext(null);Vl.displayName="Location";var $a=Z.createContext({outlet:null,matches:[],isDataRoute:!1});$a.displayName="Route";var gm=Z.createContext(null);gm.displayName="RouteError";var vy="REACT_ROUTER_ERROR",o1="REDIRECT",l1="ROUTE_ERROR_RESPONSE";function c1(a){if(a.startsWith(`${vy}:${o1}:{`))try{let t=JSON.parse(a.slice(28));if(typeof t=="object"&&t&&typeof t.status=="number"&&typeof t.statusText=="string"&&typeof t.location=="string"&&typeof t.reloadDocument=="boolean"&&typeof t.replace=="boolean")return t}catch{}}function u1(a){if(a.startsWith(`${vy}:${l1}:{`))try{let t=JSON.parse(a.slice(40));if(typeof t=="object"&&t&&typeof t.status=="number"&&typeof t.statusText=="string")return new Jb(t.status,t.statusText,t.data)}catch{}}function f1(a,{relative:t}={}){vn(kl(),"useHref() may be used only in the context of a <Router> component.");let{basename:n,navigator:s}=Z.useContext(Zi),{hash:o,pathname:c,search:u}=Xl(a,{relative:t}),h=c;return n!=="/"&&(h=c==="/"?n:la([n,c])),s.createHref({pathname:h,search:u,hash:o})}function kl(){return Z.useContext(Vl)!=null}function ts(){return vn(kl(),"useLocation() may be used only in the context of a <Router> component."),Z.useContext(Vl).location}var xy="You should call navigate() in a React.useEffect(), not when your component is first rendered.";function yy(a){Z.useContext(Zi).static||Z.useLayoutEffect(a)}function h1(){let{isDataRoute:a}=Z.useContext($a);return a?T1():d1()}function d1(){vn(kl(),"useNavigate() may be used only in the context of a <Router> component.");let a=Z.useContext(Ro),{basename:t,navigator:n}=Z.useContext(Zi),{matches:s}=Z.useContext($a),{pathname:o}=ts(),c=JSON.stringify(fy(s)),u=Z.useRef(!1);return yy(()=>{u.current=!0}),Z.useCallback((m,d={})=>{if(ba(u.current,xy),!u.current)return;if(typeof m=="number"){n.go(m);return}let g=mm(m,JSON.parse(c),o,d.relative==="path");a==null&&t!=="/"&&(g.pathname=g.pathname==="/"?t:la([t,g.pathname])),(d.replace?n.replace:n.push)(g,d.state,d)},[t,n,c,o,a])}Z.createContext(null);function Xl(a,{relative:t}={}){let{matches:n}=Z.useContext($a),{pathname:s}=ts(),o=JSON.stringify(fy(n));return Z.useMemo(()=>mm(a,JSON.parse(o),s,t==="path"),[a,o,s,t])}function p1(a,t){return Sy(a,t)}function Sy(a,t,n){vn(kl(),"useRoutes() may be used only in the context of a <Router> component.");let{navigator:s}=Z.useContext(Zi),{matches:o}=Z.useContext($a),c=o[o.length-1],u=c?c.params:{},h=c?c.pathname:"/",m=c?c.pathnameBase:"/",d=c&&c.route;{let x=d&&d.path||"";by(h,!d||x.endsWith("*")||x.endsWith("*?"),`You rendered descendant <Routes> (or called \`useRoutes()\`) at "${h}" (under <Route path="${x}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${x}"> to <Route path="${x==="/"?"*":`${x}/*`}">.`)}let g=ts(),v;if(t){let x=typeof t=="string"?Ao(t):t;vn(m==="/"||x.pathname?.startsWith(m),`When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${m}" but pathname "${x.pathname}" was given in the \`location\` prop.`),v=x}else v=g;let _=v.pathname||"/",S=_;if(m!=="/"){let x=m.replace(/^\//,"").split("/");S="/"+_.replace(/^\//,"").split("/").slice(x.length).join("/")}let b=n&&n.state.matches.length?n.state.matches.map(x=>Object.assign(x,{route:n.manifest[x.route.id]||x.route})):ry(a,{pathname:S});ba(d||b!=null,`No routes matched location "${v.pathname}${v.search}${v.hash}" `),ba(b==null||b[b.length-1].route.element!==void 0||b[b.length-1].route.Component!==void 0||b[b.length-1].route.lazy!==void 0,`Matched leaf route at location "${v.pathname}${v.search}${v.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);let R=x1(b&&b.map(x=>Object.assign({},x,{params:Object.assign({},u,x.params),pathname:la([m,s.encodeLocation?s.encodeLocation(x.pathname.replace(/%/g,"%25").replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:x.pathname]),pathnameBase:x.pathnameBase==="/"?m:la([m,s.encodeLocation?s.encodeLocation(x.pathnameBase.replace(/%/g,"%25").replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:x.pathnameBase])})),o,n);return t&&R?Z.createElement(Vl.Provider,{value:{location:{pathname:"/",search:"",hash:"",state:null,key:"default",mask:void 0,...v},navigationType:"POP"}},R):R}function m1(){let a=E1(),t=$b(a)?`${a.status} ${a.statusText}`:a instanceof Error?a.message:JSON.stringify(a),n=a instanceof Error?a.stack:null,s="rgba(200,200,200, 0.5)",o={padding:"0.5rem",backgroundColor:s},c={padding:"2px 4px",backgroundColor:s},u=null;return console.error("Error handled by React Router default ErrorBoundary:",a),u=Z.createElement(Z.Fragment,null,Z.createElement("p",null,"💿 Hey developer 👋"),Z.createElement("p",null,"You can provide a way better UX than this when your app throws errors by providing your own ",Z.createElement("code",{style:c},"ErrorBoundary")," or"," ",Z.createElement("code",{style:c},"errorElement")," prop on your route.")),Z.createElement(Z.Fragment,null,Z.createElement("h2",null,"Unexpected Application Error!"),Z.createElement("h3",{style:{fontStyle:"italic"}},t),n?Z.createElement("pre",{style:o},n):null,u)}var g1=Z.createElement(m1,null),My=class extends Z.Component{constructor(a){super(a),this.state={location:a.location,revalidation:a.revalidation,error:a.error}}static getDerivedStateFromError(a){return{error:a}}static getDerivedStateFromProps(a,t){return t.location!==a.location||t.revalidation!=="idle"&&a.revalidation==="idle"?{error:a.error,location:a.location,revalidation:a.revalidation}:{error:a.error!==void 0?a.error:t.error,location:t.location,revalidation:a.revalidation||t.revalidation}}componentDidCatch(a,t){this.props.onError?this.props.onError(a,t):console.error("React Router caught the following error during render",a)}render(){let a=this.state.error;if(this.context&&typeof a=="object"&&a&&"digest"in a&&typeof a.digest=="string"){const n=u1(a.digest);n&&(a=n)}let t=a!==void 0?Z.createElement($a.Provider,{value:this.props.routeContext},Z.createElement(gm.Provider,{value:a,children:this.props.component})):this.props.children;return this.context?Z.createElement(_1,{error:a},t):t}};My.contextType=gy;var Dd=new WeakMap;function _1({children:a,error:t}){let{basename:n}=Z.useContext(Zi);if(typeof t=="object"&&t&&"digest"in t&&typeof t.digest=="string"){let s=c1(t.digest);if(s){let o=Dd.get(t);if(o)throw o;let c=py(s.location,n),u=c.absoluteURL||c.to;if(i1(u))throw new Error("Invalid redirect location");if(dy&&!Dd.get(t))if(c.isExternal||s.reloadDocument)window.location.href=u;else{const h=Promise.resolve().then(()=>window.__reactRouterDataRouter.navigate(c.to,{replace:s.replace}));throw Dd.set(t,h),h}return Z.createElement("meta",{httpEquiv:"refresh",content:`0;url=${u}`})}}return a}function v1({routeContext:a,match:t,children:n}){let s=Z.useContext(Ro);return s&&s.static&&s.staticContext&&(t.route.errorElement||t.route.ErrorBoundary)&&(s.staticContext._deepestRenderedBoundaryId=t.route.id),Z.createElement($a.Provider,{value:a},n)}function x1(a,t=[],n){let s=n?.state;if(a==null){if(!s)return null;if(s.errors)a=s.matches;else if(t.length===0&&!s.initialized&&s.matches.length>0)a=s.matches;else return null}let o=a,c=s?.errors;if(c!=null){let g=o.findIndex(v=>v.route.id&&c?.[v.route.id]!==void 0);vn(g>=0,`Could not find a matching route for errors on route IDs: ${Object.keys(c).join(",")}`),o=o.slice(0,Math.min(o.length,g+1))}let u=!1,h=-1;if(n&&s){u=s.renderFallback;for(let g=0;g<o.length;g++){let v=o[g];if((v.route.HydrateFallback||v.route.hydrateFallbackElement)&&(h=g),v.route.id){let{loaderData:_,errors:S}=s,b=v.route.loader&&!_.hasOwnProperty(v.route.id)&&(!S||S[v.route.id]===void 0);if(v.route.lazy||b){n.isStatic&&(u=!0),h>=0?o=o.slice(0,h+1):o=[o[0]];break}}}}let m=n?.onError,d=s&&m?(g,v)=>{m(g,{location:s.location,params:s.matches?.[0]?.params??{},pattern:t1(s.matches),errorInfo:v})}:void 0;return o.reduceRight((g,v,_)=>{let S,b=!1,R=null,x=null;s&&(S=c&&v.route.id?c[v.route.id]:void 0,R=v.route.errorElement||g1,u&&(h<0&&_===0?(by("route-fallback",!1,"No `HydrateFallback` element provided to render during initial hydration"),b=!0,x=null):h===_&&(b=!0,x=v.route.hydrateFallbackElement||null)));let y=t.concat(o.slice(0,_+1)),P=()=>{let z;return S?z=R:b?z=x:v.route.Component?z=Z.createElement(v.route.Component,null):v.route.element?z=v.route.element:z=g,Z.createElement(v1,{match:v,routeContext:{outlet:g,matches:y,isDataRoute:s!=null},children:z})};return s&&(v.route.ErrorBoundary||v.route.errorElement||_===0)?Z.createElement(My,{location:s.location,revalidation:s.revalidation,component:R,error:S,children:P(),routeContext:{outlet:null,matches:y,isDataRoute:!0},onError:d}):P()},null)}function _m(a){return`${a} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function y1(a){let t=Z.useContext(Ro);return vn(t,_m(a)),t}function S1(a){let t=Z.useContext(uf);return vn(t,_m(a)),t}function M1(a){let t=Z.useContext($a);return vn(t,_m(a)),t}function vm(a){let t=M1(a),n=t.matches[t.matches.length-1];return vn(n.route.id,`${a} can only be used on routes that contain a unique "id"`),n.route.id}function b1(){return vm("useRouteId")}function E1(){let a=Z.useContext(gm),t=S1("useRouteError"),n=vm("useRouteError");return a!==void 0?a:t.errors?.[n]}function T1(){let{router:a}=y1("useNavigate"),t=vm("useNavigate"),n=Z.useRef(!1);return yy(()=>{n.current=!0}),Z.useCallback(async(o,c={})=>{ba(n.current,xy),n.current&&(typeof o=="number"?await a.navigate(o):await a.navigate(o,{fromRouteId:t,...c}))},[a,t])}var Vv={};function by(a,t,n){!t&&!Vv[a]&&(Vv[a]=!0,ba(!1,n))}Z.memo(A1);function A1({routes:a,manifest:t,future:n,state:s,isStatic:o,onError:c}){return Sy(a,void 0,{manifest:t,state:s,isStatic:o,onError:c})}function Ey(a){vn(!1,"A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.")}function R1({basename:a="/",children:t=null,location:n,navigationType:s="POP",navigator:o,static:c=!1,useTransitions:u}){vn(!kl(),"You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");let h=a.replace(/^\/*/,"/"),m=Z.useMemo(()=>({basename:h,navigator:o,static:c,useTransitions:u,future:{}}),[h,o,c,u]);typeof n=="string"&&(n=Ao(n));let{pathname:d="/",search:g="",hash:v="",state:_=null,key:S="default",mask:b}=n,R=Z.useMemo(()=>{let x=Qa(d,h);return x==null?null:{location:{pathname:x,search:g,hash:v,state:_,key:S,mask:b},navigationType:s}},[h,d,g,v,_,S,s,b]);return ba(R!=null,`<Router basename="${h}"> is not able to match the URL "${d}${g}${v}" because it does not start with the basename, so the <Router> won't render anything.`),R==null?null:Z.createElement(Zi.Provider,{value:m},Z.createElement(Vl.Provider,{children:t,value:R}))}function C1({children:a,location:t}){return p1(yp(a),t)}function yp(a,t=[]){let n=[];return Z.Children.forEach(a,(s,o)=>{if(!Z.isValidElement(s))return;let c=[...t,o];if(s.type===Z.Fragment){n.push.apply(n,yp(s.props.children,c));return}vn(s.type===Ey,`[${typeof s.type=="string"?s.type:s.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`),vn(!s.props.index||!s.props.children,"An index route cannot have child routes.");let u={id:s.props.id||c.join("-"),caseSensitive:s.props.caseSensitive,element:s.props.element,Component:s.props.Component,index:s.props.index,path:s.props.path,middleware:s.props.middleware,loader:s.props.loader,action:s.props.action,hydrateFallbackElement:s.props.hydrateFallbackElement,HydrateFallback:s.props.HydrateFallback,errorElement:s.props.errorElement,ErrorBoundary:s.props.ErrorBoundary,hasErrorBoundary:s.props.hasErrorBoundary===!0||s.props.ErrorBoundary!=null||s.props.errorElement!=null,shouldRevalidate:s.props.shouldRevalidate,handle:s.props.handle,lazy:s.props.lazy};s.props.children&&(u.children=yp(s.props.children,c)),n.push(u)}),n}var Iu="get",Bu="application/x-www-form-urlencoded";function ff(a){return typeof HTMLElement<"u"&&a instanceof HTMLElement}function w1(a){return ff(a)&&a.tagName.toLowerCase()==="button"}function D1(a){return ff(a)&&a.tagName.toLowerCase()==="form"}function U1(a){return ff(a)&&a.tagName.toLowerCase()==="input"}function L1(a){return!!(a.metaKey||a.altKey||a.ctrlKey||a.shiftKey)}function N1(a,t){return a.button===0&&(!t||t==="_self")&&!L1(a)}var nu=null;function P1(){if(nu===null)try{new FormData(document.createElement("form"),0),nu=!1}catch{nu=!0}return nu}var O1=new Set(["application/x-www-form-urlencoded","multipart/form-data","text/plain"]);function Ud(a){return a!=null&&!O1.has(a)?(ba(!1,`"${a}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Bu}"`),null):a}function z1(a,t){let n,s,o,c,u;if(D1(a)){let h=a.getAttribute("action");s=h?Qa(h,t):null,n=a.getAttribute("method")||Iu,o=Ud(a.getAttribute("enctype"))||Bu,c=new FormData(a)}else if(w1(a)||U1(a)&&(a.type==="submit"||a.type==="image")){let h=a.form;if(h==null)throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');let m=a.getAttribute("formaction")||h.getAttribute("action");if(s=m?Qa(m,t):null,n=a.getAttribute("formmethod")||h.getAttribute("method")||Iu,o=Ud(a.getAttribute("formenctype"))||Ud(h.getAttribute("enctype"))||Bu,c=new FormData(h,a),!P1()){let{name:d,type:g,value:v}=a;if(g==="image"){let _=d?`${d}.`:"";c.append(`${_}x`,"0"),c.append(`${_}y`,"0")}else d&&c.append(d,v)}}else{if(ff(a))throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');n=Iu,s=null,o=Bu,u=a}return c&&o==="text/plain"&&(u=c,c=void 0),{action:s,method:n.toLowerCase(),encType:o,formData:c,body:u}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");function xm(a,t){if(a===!1||a===null||typeof a>"u")throw new Error(t)}function Ty(a,t,n,s){let o=typeof a=="string"?new URL(a,typeof window>"u"?"server://singlefetch/":window.location.origin):a;return n?o.pathname.endsWith("/")?o.pathname=`${o.pathname}_.${s}`:o.pathname=`${o.pathname}.${s}`:o.pathname==="/"?o.pathname=`_root.${s}`:t&&Qa(o.pathname,t)==="/"?o.pathname=`${Qu(t)}/_root.${s}`:o.pathname=`${Qu(o.pathname)}.${s}`,o}async function F1(a,t){if(a.id in t)return t[a.id];try{let n=await import(a.module);return t[a.id]=n,n}catch(n){return console.error(`Error loading route module \`${a.module}\`, reloading page...`),console.error(n),window.__reactRouterContext&&window.__reactRouterContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function I1(a){return a==null?!1:a.href==null?a.rel==="preload"&&typeof a.imageSrcSet=="string"&&typeof a.imageSizes=="string":typeof a.rel=="string"&&typeof a.href=="string"}async function B1(a,t,n){let s=await Promise.all(a.map(async o=>{let c=t.routes[o.route.id];if(c){let u=await F1(c,n);return u.links?u.links():[]}return[]}));return k1(s.flat(1).filter(I1).filter(o=>o.rel==="stylesheet"||o.rel==="preload").map(o=>o.rel==="stylesheet"?{...o,rel:"prefetch",as:"style"}:{...o,rel:"prefetch"}))}function kv(a,t,n,s,o,c){let u=(m,d)=>n[d]?m.route.id!==n[d].route.id:!0,h=(m,d)=>n[d].pathname!==m.pathname||n[d].route.path?.endsWith("*")&&n[d].params["*"]!==m.params["*"];return c==="assets"?t.filter((m,d)=>u(m,d)||h(m,d)):c==="data"?t.filter((m,d)=>{let g=s.routes[m.route.id];if(!g||!g.hasLoader)return!1;if(u(m,d)||h(m,d))return!0;if(m.route.shouldRevalidate){let v=m.route.shouldRevalidate({currentUrl:new URL(o.pathname+o.search+o.hash,window.origin),currentParams:n[0]?.params||{},nextUrl:new URL(a,window.origin),nextParams:m.params,defaultShouldRevalidate:!0});if(typeof v=="boolean")return v}return!0}):[]}function H1(a,t,{includeHydrateFallback:n}={}){return G1(a.map(s=>{let o=t.routes[s.route.id];if(!o)return[];let c=[o.module];return o.clientActionModule&&(c=c.concat(o.clientActionModule)),o.clientLoaderModule&&(c=c.concat(o.clientLoaderModule)),n&&o.hydrateFallbackModule&&(c=c.concat(o.hydrateFallbackModule)),o.imports&&(c=c.concat(o.imports)),c}).flat(1))}function G1(a){return[...new Set(a)]}function V1(a){let t={},n=Object.keys(a).sort();for(let s of n)t[s]=a[s];return t}function k1(a,t){let n=new Set;return new Set(t),a.reduce((s,o)=>{let c=JSON.stringify(V1(o));return n.has(c)||(n.add(c),s.push({key:c,link:o})),s},[])}function ym(){let a=Z.useContext(Ro);return xm(a,"You must render this element inside a <DataRouterContext.Provider> element"),a}function X1(){let a=Z.useContext(uf);return xm(a,"You must render this element inside a <DataRouterStateContext.Provider> element"),a}var Sm=Z.createContext(void 0);Sm.displayName="FrameworkContext";function hf(){let a=Z.useContext(Sm);return xm(a,"You must render this element inside a <HydratedRouter> element"),a}function W1(a,t){let n=Z.useContext(Sm),[s,o]=Z.useState(!1),[c,u]=Z.useState(!1),{onFocus:h,onBlur:m,onMouseEnter:d,onMouseLeave:g,onTouchStart:v}=t,_=Z.useRef(null);Z.useEffect(()=>{if(a==="render"&&u(!0),a==="viewport"){let R=y=>{y.forEach(P=>{u(P.isIntersecting)})},x=new IntersectionObserver(R,{threshold:.5});return _.current&&x.observe(_.current),()=>{x.disconnect()}}},[a]),Z.useEffect(()=>{if(s){let R=setTimeout(()=>{u(!0)},100);return()=>{clearTimeout(R)}}},[s]);let S=()=>{o(!0)},b=()=>{o(!1),u(!1)};return n?a!=="intent"?[c,_,{}]:[c,_,{onFocus:xl(h,S),onBlur:xl(m,b),onMouseEnter:xl(d,S),onMouseLeave:xl(g,b),onTouchStart:xl(v,S)}]:[!1,_,{}]}function xl(a,t){return n=>{a&&a(n),n.defaultPrevented||t(n)}}function q1({page:a,...t}){let n=a1(),{nonce:s}=hf(),{router:o}=ym(),c=Z.useMemo(()=>ry(o.routes,a,o.basename),[o.routes,a,o.basename]);return c?(t.nonce==null&&s&&(t={...t,nonce:s}),n?Z.createElement(Z1,{page:a,matches:c,...t}):Z.createElement(K1,{page:a,matches:c,...t})):null}function Y1(a){let{manifest:t,routeModules:n}=hf(),[s,o]=Z.useState([]);return Z.useEffect(()=>{let c=!1;return B1(a,t,n).then(u=>{c||o(u)}),()=>{c=!0}},[a,t,n]),s}function Z1({page:a,matches:t,...n}){let s=ts(),{future:o}=hf(),{basename:c}=ym(),u=Z.useMemo(()=>{if(a===s.pathname+s.search+s.hash)return[];let h=Ty(a,c,o.v8_trailingSlashAwareDataRequests,"rsc"),m=!1,d=[];for(let g of t)typeof g.route.shouldRevalidate=="function"?m=!0:d.push(g.route.id);return m&&d.length>0&&h.searchParams.set("_routes",d.join(",")),[h.pathname+h.search]},[c,o.v8_trailingSlashAwareDataRequests,a,s,t]);return Z.createElement(Z.Fragment,null,u.map(h=>Z.createElement("link",{key:h,rel:"prefetch",as:"fetch",href:h,...n})))}function K1({page:a,matches:t,...n}){let s=ts(),{future:o,manifest:c,routeModules:u}=hf(),{basename:h}=ym(),{loaderData:m,matches:d}=X1(),g=Z.useMemo(()=>kv(a,t,d,c,s,"data"),[a,t,d,c,s]),v=Z.useMemo(()=>kv(a,t,d,c,s,"assets"),[a,t,d,c,s]),_=Z.useMemo(()=>{if(a===s.pathname+s.search+s.hash)return[];let R=new Set,x=!1;if(t.forEach(P=>{let z=c.routes[P.route.id];!z||!z.hasLoader||(!g.some(C=>C.route.id===P.route.id)&&P.route.id in m&&u[P.route.id]?.shouldRevalidate||z.hasClientLoader?x=!0:R.add(P.route.id))}),R.size===0)return[];let y=Ty(a,h,o.v8_trailingSlashAwareDataRequests,"data");return x&&R.size>0&&y.searchParams.set("_routes",t.filter(P=>R.has(P.route.id)).map(P=>P.route.id).join(",")),[y.pathname+y.search]},[h,o.v8_trailingSlashAwareDataRequests,m,s,c,g,t,a,u]),S=Z.useMemo(()=>H1(v,c),[v,c]),b=Y1(v);return Z.createElement(Z.Fragment,null,_.map(R=>Z.createElement("link",{key:R,rel:"prefetch",as:"fetch",href:R,...n})),S.map(R=>Z.createElement("link",{key:R,rel:"modulepreload",href:R,...n})),b.map(({key:R,link:x})=>Z.createElement("link",{key:R,nonce:n.nonce,...x,crossOrigin:x.crossOrigin??n.crossOrigin})))}function j1(...a){return t=>{a.forEach(n=>{typeof n=="function"?n(t):n!=null&&(n.current=t)})}}var Q1=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";try{Q1&&(window.__reactRouterVersion="7.18.1")}catch{}function J1({basename:a,children:t,useTransitions:n,window:s}){let o=Z.useRef();o.current==null&&(o.current=Db({window:s,v5Compat:!0}));let c=o.current,[u,h]=Z.useState({action:c.action,location:c.location}),m=Z.useCallback(d=>{n===!1?h(d):Z.startTransition(()=>h(d))},[n]);return Z.useLayoutEffect(()=>c.listen(m),[c,m]),Z.createElement(R1,{basename:a,children:t,location:u.location,navigationType:u.action,navigator:c,useTransitions:n})}var Ay=Z.forwardRef(function({onClick:t,discover:n="render",prefetch:s="none",relative:o,reloadDocument:c,replace:u,mask:h,state:m,target:d,to:g,preventScrollReset:v,viewTransition:_,defaultShouldRevalidate:S,...b},R){let{basename:x,navigator:y,useTransitions:P}=Z.useContext(Zi),z=typeof g=="string"&&pm.test(g),C=py(g,x);g=C.to;let L=f1(g,{relative:o}),D=ts(),B=null;if(h){let J=mm(h,[],D.mask?D.mask.pathname:"/",!0);x!=="/"&&(J.pathname=J.pathname==="/"?x:la([x,J.pathname])),B=y.createHref(J)}let[T,N,G]=W1(s,b),H=nE(g,{replace:u,mask:h,state:m,target:d,preventScrollReset:v,relative:o,viewTransition:_,defaultShouldRevalidate:S,useTransitions:P});function W(J){t&&t(J),J.defaultPrevented||H(J)}let lt=!(C.isExternal||c),ct=Z.createElement("a",{...b,...G,href:(lt?B:void 0)||C.absoluteURL||L,onClick:lt?W:t,ref:j1(R,N),target:d,"data-discover":!z&&n==="render"?"true":void 0});return T&&!z?Z.createElement(Z.Fragment,null,ct,Z.createElement(q1,{page:L})):ct});Ay.displayName="Link";var $1=Z.forwardRef(function({"aria-current":t="page",caseSensitive:n=!1,className:s="",end:o=!1,style:c,to:u,viewTransition:h,children:m,...d},g){let v=Xl(u,{relative:d.relative}),_=ts(),S=Z.useContext(uf),{navigator:b,basename:R}=Z.useContext(Zi),x=S!=null&&oE(v)&&h===!0,y=b.encodeLocation?b.encodeLocation(v).pathname:v.pathname,P=_.pathname,z=S&&S.navigation&&S.navigation.location?S.navigation.location.pathname:null;n||(P=P.toLowerCase(),z=z?z.toLowerCase():null,y=y.toLowerCase()),z&&R&&(z=Qa(z,R)||z);const C=y!=="/"&&y.endsWith("/")?y.length-1:y.length;let L=P===y||!o&&P.startsWith(y)&&P.charAt(C)==="/",D=z!=null&&(z===y||!o&&z.startsWith(y)&&z.charAt(y.length)==="/"),B={isActive:L,isPending:D,isTransitioning:x},T=L?t:void 0,N;typeof s=="function"?N=s(B):N=[s,L?"active":null,D?"pending":null,x?"transitioning":null].filter(Boolean).join(" ");let G=typeof c=="function"?c(B):c;return Z.createElement(Ay,{...d,"aria-current":T,className:N,ref:g,style:G,to:u,viewTransition:h},typeof m=="function"?m(B):m)});$1.displayName="NavLink";var tE=Z.forwardRef(({discover:a="render",fetcherKey:t,navigate:n,reloadDocument:s,replace:o,state:c,method:u=Iu,action:h,onSubmit:m,relative:d,preventScrollReset:g,viewTransition:v,defaultShouldRevalidate:_,...S},b)=>{let{useTransitions:R}=Z.useContext(Zi),x=sE(),y=rE(h,{relative:d}),P=u.toLowerCase()==="get"?"get":"post",z=typeof h=="string"&&pm.test(h),C=L=>{if(m&&m(L),L.defaultPrevented)return;L.preventDefault();let D=L.nativeEvent.submitter,B=D?.getAttribute("formmethod")||u,T=()=>x(D||L.currentTarget,{fetcherKey:t,method:B,navigate:n,replace:o,state:c,relative:d,preventScrollReset:g,viewTransition:v,defaultShouldRevalidate:_});R&&n!==!1?Z.startTransition(()=>T()):T()};return Z.createElement("form",{ref:b,method:P,action:y,onSubmit:s?m:C,...S,"data-discover":!z&&a==="render"?"true":void 0})});tE.displayName="Form";function eE(a){return`${a} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function Ry(a){let t=Z.useContext(Ro);return vn(t,eE(a)),t}function nE(a,{target:t,replace:n,mask:s,state:o,preventScrollReset:c,relative:u,viewTransition:h,defaultShouldRevalidate:m,useTransitions:d}={}){let g=h1(),v=ts(),_=Xl(a,{relative:u});return Z.useCallback(S=>{if(N1(S,t)){S.preventDefault();let b=n!==void 0?n:zl(v)===zl(_),R=()=>g(a,{replace:b,mask:s,state:o,preventScrollReset:c,relative:u,viewTransition:h,defaultShouldRevalidate:m});d?Z.startTransition(()=>R()):R()}},[v,g,_,n,s,o,t,a,c,u,h,m,d])}var iE=0,aE=()=>`__${String(++iE)}__`;function sE(){let{router:a}=Ry("useSubmit"),{basename:t}=Z.useContext(Zi),n=b1(),s=a.fetch,o=a.navigate;return Z.useCallback(async(c,u={})=>{let{action:h,method:m,encType:d,formData:g,body:v}=z1(c,t);if(u.navigate===!1){let _=u.fetcherKey||aE();await s(_,n,u.action||h,{defaultShouldRevalidate:u.defaultShouldRevalidate,preventScrollReset:u.preventScrollReset,formData:g,body:v,formMethod:u.method||m,formEncType:u.encType||d,flushSync:u.flushSync})}else await o(u.action||h,{defaultShouldRevalidate:u.defaultShouldRevalidate,preventScrollReset:u.preventScrollReset,formData:g,body:v,formMethod:u.method||m,formEncType:u.encType||d,replace:u.replace,state:u.state,fromRouteId:n,flushSync:u.flushSync,viewTransition:u.viewTransition})},[s,o,t,n])}function rE(a,{relative:t}={}){let{basename:n}=Z.useContext(Zi),s=Z.useContext($a);vn(s,"useFormAction must be used inside a RouteContext");let[o]=s.matches.slice(-1),c={...Xl(a||".",{relative:t})},u=ts();if(a==null){c.search=u.search;let h=new URLSearchParams(c.search),m=h.getAll("index");if(m.some(g=>g==="")){h.delete("index"),m.filter(v=>v).forEach(v=>h.append("index",v));let g=h.toString();c.search=g?`?${g}`:""}}return(!a||a===".")&&o.route.index&&(c.search=c.search?c.search.replace(/^\?/,"?index&"):"?index"),n!=="/"&&(c.pathname=c.pathname==="/"?n:la([n,c.pathname])),zl(c)}function oE(a,{relative:t}={}){let n=Z.useContext(_y);vn(n!=null,"`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");let{basename:s}=Ry("useViewTransitionState"),o=Xl(a,{relative:t});if(!n.isTransitioning)return!1;let c=Qa(n.currentLocation.pathname,s)||n.currentLocation.pathname,u=Qa(n.nextLocation.pathname,s)||n.nextLocation.pathname;return ju(o.pathname,u)!=null||ju(o.pathname,c)!=null}const Fn=Math.PI,cn=Fn*2,Os=Fn/180,lE=180/Fn,cE=1440,uE=398600.8,wi=6378.135,Za=60/Math.sqrt(wi*wi*wi/uE),Ld=wi*Za/60,fE=1/Za,ur=.001082616,hE=-253881e-11,dE=-165597e-11,fr=hE/ur,Fl=2/3,Nd=1440/(2*Fn);function pE(a,t){const n=[31,a%4===0?29:28,31,30,31,30,31,31,30,31,30,31],s=Math.floor(t);let o=1,c=0;for(;s>c+n[o-1]&&o<12;)c+=n[o-1],o+=1;const u=o,h=s-c;let m=(t-s)*24;const d=Math.floor(m);m=(m-d)*60;const g=Math.floor(m),v=(m-g)*60;return{mon:u,day:h,hr:d,minute:g,sec:v}}function Xv(a,t,n,s,o,c,u=0){return 367*a-Math.floor(7*(a+Math.floor((t+9)/12))*.25)+Math.floor(275*t/9)+n+17210135e-1+((u/6e4+c/60+o)/60+s)/24}function df(a,t,n,s,o,c,u=0){if(a instanceof Date){const h=a;return Xv(h.getUTCFullYear(),h.getUTCMonth()+1,h.getUTCDate(),h.getUTCHours(),h.getUTCMinutes(),h.getUTCSeconds(),h.getUTCMilliseconds())}return Xv(a,t,n,s,o,c,u)}function Cy(a,t){const{e3:n,ee2:s,peo:o,pgho:c,pho:u,pinco:h,plo:m,se2:d,se3:g,sgh2:v,sgh3:_,sgh4:S,sh2:b,sh3:R,si2:x,si3:y,sl2:P,sl3:z,sl4:C,t:L,xgh2:D,xgh3:B,xgh4:T,xh2:N,xh3:G,xi2:H,xi3:W,xl2:lt,xl3:ct,xl4:J,zmol:I,zmos:V}=a,{init:$,opsmode:ft}=t;let{ep:bt,inclp:F,nodep:q,argpp:vt,mp:Ct}=t,Mt,K,yt,xt,Et,Dt,Ut,Yt,It,Ht,Wt,ae,oe,ce,me,ee,le,_e,X,fe,de;const O=119459e-10,E=.01675,Q=.00015835218,it=.0549;de=V+O*L,$==="y"&&(de=V),fe=de+2*E*Math.sin(de),le=Math.sin(fe),Ht=.5*le*le-.25,Wt=-.5*le*Math.cos(fe);const mt=d*Ht+g*Wt,Lt=x*Ht+y*Wt,A=P*Ht+z*Wt+C*le,ht=v*Ht+_*Wt+S*le,pt=b*Ht+R*Wt;de=I+Q*L,$==="y"&&(de=I),fe=de+2*it*Math.sin(de),le=Math.sin(fe),Ht=.5*le*le-.25,Wt=-.5*le*Math.cos(fe);const Ot=s*Ht+n*Wt,Bt=H*Ht+W*Wt,Ft=lt*Ht+ct*Wt+J*le,Nt=D*Ht+B*Wt+T*le,ne=N*Ht+G*Wt;return ae=mt+Ot,me=Lt+Bt,ee=A+Ft,oe=ht+Nt,ce=pt+ne,$==="n"&&(ae-=o,me-=h,ee-=m,oe-=c,ce-=u,F+=me,bt+=ae,xt=Math.sin(F),yt=Math.cos(F),F>=.2?(ce/=xt,oe-=yt*ce,vt+=oe,q+=ce,Ct+=ee):(Dt=Math.sin(q),Et=Math.cos(q),Mt=xt*Dt,K=xt*Et,Ut=ce*Et+me*yt*Dt,Yt=-ce*Dt+me*yt*Et,Mt+=Ut,K+=Yt,q%=cn,q<0&&ft==="a"&&(q+=cn),_e=Ct+vt+yt*q,It=ee+oe-me*q*xt,_e+=It,X=q,q=Math.atan2(Mt,K),q<0&&ft==="a"&&(q+=cn),Math.abs(X-q)>Fn&&(q<X?q+=cn:q-=cn),Ct+=ee,vt=_e-Ct-yt*q)),{ep:bt,inclp:F,nodep:q,argpp:vt,mp:Ct}}function mE(a){const{epoch:t,ep:n,argpp:s,tc:o,inclp:c,nodep:u,np:h}=a;let m,d,g,v,_,S,b,R,x,y,P,z,C,L,D,B,T,N,G,H,W,lt,ct,J,I,V,$,ft,bt,F,q,vt,Ct,Mt,K,yt,xt,Et,Dt,Ut,Yt,It,Ht,Wt,ae,oe,ce,me,ee,le,_e,X,fe,de,O,E,Q,it,mt,Lt,A,ht,pt;const Ot=.01675,Bt=.0549,Ft=29864797e-13,Nt=47968065e-14,ne=.39785416,Jt=.91744867,ie=.1945905,Y=-.98088458,Pt=h,gt=n,zt=Math.sin(u),Gt=Math.cos(u),At=Math.sin(s),qt=Math.cos(s),Vt=Math.sin(c),te=Math.cos(c),ye=gt*gt,Ze=1-ye,_n=Math.sqrt(Ze),Ne=0,Ki=0,Li=0,Ni=0,jn=0,Ke=t+18261.5+o/1440,$e=(4.523602-.00092422029*Ke)%cn,Ie=Math.sin($e),Rn=Math.cos($e),ji=.91375164-.03568096*Rn,Qi=Math.sqrt(1-ji*ji),dn=.089683511*Ie/Qi,un=Math.sqrt(1-dn*dn),ke=5.8351514+.001944368*Ke;let kn=.39785416*Ie/Qi;const vi=un*Rn+.91744867*dn*Ie;kn=Math.atan2(kn,vi),kn+=ke-$e;const Ji=Math.cos(kn),Pi=Math.sin(kn);H=ie,W=Y,J=Jt,I=ne,lt=Gt,ct=zt,P=Ft;const pn=1/Pt;let ca=0;for(;ca<2;)ca+=1,m=H*lt+W*J*ct,g=-W*lt+H*J*ct,b=-H*ct+W*J*lt,R=W*I,x=W*ct+H*J*lt,y=H*I,d=te*b+Vt*R,v=te*x+Vt*y,_=-Vt*b+te*R,S=-Vt*x+te*y,z=m*qt+d*At,C=g*qt+v*At,L=-m*At+d*qt,D=-g*At+v*qt,B=_*At,T=S*At,N=_*qt,G=S*qt,A=12*z*z-3*L*L,ht=24*z*C-6*L*D,pt=12*C*C-3*D*D,X=3*(m*m+d*d)+A*ye,fe=6*(m*g+d*v)+ht*ye,de=3*(g*g+v*v)+pt*ye,O=-6*m*_+ye*(-24*z*N-6*L*B),E=-6*(m*S+g*_)+ye*(-24*(C*N+z*G)+-6*(L*T+D*B)),Q=-6*g*S+ye*(-24*C*G-6*D*T),it=6*d*_+ye*(24*z*B-6*L*N),mt=6*(v*_+d*S)+ye*(24*(C*B+z*T)-6*(D*N+L*G)),Lt=6*v*S+ye*(24*C*T-6*D*G),X=X+X+Ze*A,fe=fe+fe+Ze*ht,de=de+de+Ze*pt,ce=P*pn,oe=-.5*ce/_n,me=ce*_n,ae=-15*gt*me,ee=z*L+C*D,le=C*L+z*D,_e=C*D-z*L,ca===1&&(V=ae,$=oe,ft=ce,bt=me,F=ee,q=le,vt=_e,Ct=X,Mt=fe,K=de,yt=O,xt=E,Et=Q,Dt=it,Ut=mt,Yt=Lt,It=A,Ht=ht,Wt=pt,H=Ji,W=Pi,J=ji,I=Qi,lt=un*Gt+dn*zt,ct=zt*un-Gt*dn,P=Nt);const w=(4.7199672+(.2299715*Ke-ke))%cn,tt=(6.2565837+.017201977*Ke)%cn,ut=2*V*q,at=2*V*vt,st=2*$*xt,Xt=2*$*(Et-yt),Qt=-2*ft*Mt,kt=-2*ft*(K-Ct),$t=-2*ft*(-21-9*ye)*Ot,Kt=2*bt*Ht,pe=2*bt*(Wt-It),Se=-18*bt*Ot,re=-2*$*Ut,we=-2*$*(Yt-Dt),je=2*ae*le,Xe=2*ae*_e,He=2*oe*E,We=2*oe*(Q-O),jt=-2*ce*fe,Hn=-2*ce*(de-X),Re=-2*ce*(-21-9*ye)*Bt,En=2*me*ht,ni=2*me*(pt-A),xi=-18*me*Bt,ii=-2*oe*mt,qe=-2*oe*(Lt-it);return{snodm:zt,cnodm:Gt,sinim:Vt,cosim:te,sinomm:At,cosomm:qt,day:Ke,e3:Xe,ee2:je,em:gt,emsq:ye,gam:ke,peo:Ne,pgho:Ni,pho:jn,pinco:Ki,plo:Li,rtemsq:_n,se2:ut,se3:at,sgh2:Kt,sgh3:pe,sgh4:Se,sh2:re,sh3:we,si2:st,si3:Xt,sl2:Qt,sl3:kt,sl4:$t,s1:ae,s2:oe,s3:ce,s4:me,s5:ee,s6:le,s7:_e,ss1:V,ss2:$,ss3:ft,ss4:bt,ss5:F,ss6:q,ss7:vt,sz1:Ct,sz2:Mt,sz3:K,sz11:yt,sz12:xt,sz13:Et,sz21:Dt,sz22:Ut,sz23:Yt,sz31:It,sz32:Ht,sz33:Wt,xgh2:En,xgh3:ni,xgh4:xi,xh2:ii,xh3:qe,xi2:He,xi3:We,xl2:jt,xl3:Hn,xl4:Re,nm:Pt,z1:X,z2:fe,z3:de,z11:O,z12:E,z13:Q,z21:it,z22:mt,z23:Lt,z31:A,z32:ht,z33:pt,zmol:w,zmos:tt}}function gE(a){const{cosim:t,argpo:n,s1:s,s2:o,s3:c,s4:u,s5:h,sinim:m,ss1:d,ss2:g,ss3:v,ss4:_,ss5:S,sz1:b,sz3:R,sz11:x,sz13:y,sz21:P,sz23:z,sz31:C,sz33:L,t:D,tc:B,gsto:T,mo:N,mdot:G,no:H,nodeo:W,nodedot:lt,xpidot:ct,z1:J,z3:I,z11:V,z13:$,z21:ft,z23:bt,z31:F,z33:q,ecco:vt,eccsq:Ct}=a;let{emsq:Mt,em:K,argpm:yt,inclm:xt,mm:Et,nm:Dt,nodem:Ut,irez:Yt,atime:It,d2201:Ht,d2211:Wt,d3210:ae,d3222:oe,d4410:ce,d4422:me,d5220:ee,d5232:le,d5421:_e,d5433:X,dedt:fe,didt:de,dmdt:O,dnodt:E,domdt:Q,del1:it,del2:mt,del3:Lt,xfact:A,xlamo:ht,xli:pt,xni:Ot}=a,Bt,Ft,Nt,ne,Jt,ie,Y,Pt,gt,zt,Gt,At,qt,Vt,te,ye,Ze,_n,Ne,Ki,Li,Ni,jn,Ke,$e,Ie,Rn,ji,Qi,dn,un,ke;const kn=17891679e-13,vi=21460748e-13,Ji=22123015e-14,Pi=17891679e-13,pn=73636953e-16,ca=21765803e-16,w=.0043752690880113,tt=37393792e-14,ut=11428639e-14,at=.00015835218,st=119459e-10;Yt=0,Dt<.0052359877&&Dt>.0034906585&&(Yt=1),Dt>=.00826&&Dt<=.00924&&K>=.5&&(Yt=2);const Xt=d*st*S,Qt=g*st*(x+y),kt=-st*v*(b+R-14-6*Mt),$t=_*st*(C+L-6);let Kt=-st*g*(P+z);(xt<.052359877||xt>Fn-.052359877)&&(Kt=0),m!==0&&(Kt/=m);const pe=$t-t*Kt;fe=Xt+s*at*h,de=Qt+o*at*(V+$),O=kt-at*c*(J+I-14-6*Mt);const Se=u*at*(F+q-6);let re=-at*o*(ft+bt);(xt<.052359877||xt>Fn-.052359877)&&(re=0),Q=pe+Se,E=Kt,m!==0&&(Q-=t/m*re,E+=re/m);const we=0,je=(T+B*w)%cn;if(K+=fe*D,xt+=de*D,yt+=Q*D,Ut+=E*D,Et+=O*D,Yt!==0){if(dn=(Dt/Za)**Fl,Yt===2){un=t*t;const Xe=K;K=vt;const He=Mt;Mt=Ct,ke=K*Mt,Vt=-.306-(K-.64)*.44,K<=.65?(te=3.616-13.247*K+16.29*Mt,Ze=-19.302+117.39*K-228.419*Mt+156.591*ke,_n=-18.9068+109.7927*K-214.6334*Mt+146.5816*ke,Ne=-41.122+242.694*K-471.094*Mt+313.953*ke,Ki=-146.407+841.88*K-1629.014*Mt+1083.435*ke,Li=-532.114+3017.977*K-5740.032*Mt+3708.276*ke):(te=-72.099+331.819*K-508.738*Mt+266.724*ke,Ze=-346.844+1582.851*K-2415.925*Mt+1246.113*ke,_n=-342.585+1554.908*K-2366.899*Mt+1215.972*ke,Ne=-1052.797+4758.686*K-7193.992*Mt+3651.957*ke,Ki=-3581.69+16178.11*K-24462.77*Mt+12422.52*ke,K>.715?Li=-5149.66+29936.92*K-54087.36*Mt+31324.56*ke:Li=1464.74-4664.75*K+3763.64*Mt),K<.7?(Ke=-919.2277+4988.61*K-9064.77*Mt+5542.21*ke,Ni=-822.71072+4568.6173*K-8491.4146*Mt+5337.524*ke,jn=-853.666+4690.25*K-8624.77*Mt+5341.4*ke):(Ke=-37995.78+161616.52*K-229838.2*Mt+109377.94*ke,Ni=-51752.104+218913.95*K-309468.16*Mt+146349.42*ke,jn=-40023.88+170470.89*K-242699.48*Mt+115605.82*ke),$e=m*m,Bt=.75*(1+2*t+un),Ft=1.5*$e,ne=1.875*m*(1-2*t-3*un),Jt=-1.875*m*(1+2*t-3*un),Y=35*$e*Bt,Pt=39.375*$e*$e,gt=9.84375*m*($e*(1-2*t-5*un)+.33333333*(-2+4*t+6*un)),zt=m*(4.92187512*$e*(-2-4*t+10*un)+6.56250012*(1+2*t-3*un)),Gt=29.53125*m*(2-8*t+un*(-12+8*t+10*un)),At=29.53125*m*(-2-8*t+un*(12+8*t-10*un)),ji=Dt*Dt,Qi=dn*dn,Rn=3*ji*Qi,Ie=Rn*Pi,Ht=Ie*Bt*Vt,Wt=Ie*Ft*te,Rn*=dn,Ie=Rn*tt,ae=Ie*ne*Ze,oe=Ie*Jt*_n,Rn*=dn,Ie=2*Rn*pn,ce=Ie*Y*Ne,me=Ie*Pt*Ki,Rn*=dn,Ie=Rn*ut,ee=Ie*gt*Li,le=Ie*zt*jn,Ie=2*Rn*ca,_e=Ie*Gt*Ni,X=Ie*At*Ke,ht=(N+W+W-(je+je))%cn,A=G+O+2*(lt+E-w)-H,K=Xe,Mt=He}Yt===1&&(qt=1+Mt*(-2.5+.8125*Mt),Ze=1+2*Mt,ye=1+Mt*(-6+6.60937*Mt),Bt=.75*(1+t)*(1+t),Nt=.9375*m*m*(1+3*t)-.75*(1+t),ie=1+t,ie*=1.875*ie*ie,it=3*Dt*Dt*dn*dn,mt=2*it*Bt*qt*kn,Lt=3*it*ie*ye*Ji*dn,it=it*Nt*Ze*vi*dn,ht=(N+W+n-je)%cn,A=G+ct+O+Q+E-(H+w)),pt=ht,Ot=H,It=0,Dt=H+we}return{em:K,argpm:yt,inclm:xt,mm:Et,nm:Dt,nodem:Ut,irez:Yt,atime:It,d2201:Ht,d2211:Wt,d3210:ae,d3222:oe,d4410:ce,d4422:me,d5220:ee,d5232:le,d5421:_e,d5433:X,dedt:fe,didt:de,dmdt:O,dndt:we,dnodt:E,domdt:Q,del1:it,del2:mt,del3:Lt,xfact:A,xlamo:ht,xli:pt,xni:Ot}}function Wv(a){const t=(a-2451545)/36525;let n=-62e-7*t*t*t+.093104*t*t+(876600*3600+8640184812866e-6)*t+67310.54841;return n=n*Os/240%cn,n<0&&(n+=cn),n}function pf(a,t,n,s,o,c,u){return a instanceof Date?Wv(df(a)):Wv(a)}function _E(a){const{ecco:t,epoch:n,inclo:s,opsmode:o}=a;let{no:c}=a;const u=t*t,h=1-u,m=Math.sqrt(h),d=Math.cos(s),g=d*d,v=(Za/c)**Fl,_=.75*ur*(3*g-1)/(m*h);let S=_/(v*v);const b=v*(1-S*S-S*(1/3+134*S*S/81));S=_/(b*b),c/=1+S;const R=(Za/c)**Fl,x=Math.sin(s),y=R*h,P=1-5*g,z=-P-g-g,C=1/R,L=y*y,D=R*(1-t),B="n";let T;if(o==="a"){const N=n-7305,G=Math.floor(N+1e-8),H=N-G,W=.017202791694070362,lt=1.7321343856509375,ct=5075514194322695e-30,J=W+cn;T=(lt+W*G+J*H+N*N*ct)%cn,T<0&&(T+=cn)}else T=pf(n+24332815e-1);return{no:c,method:B,ainv:C,ao:R,con41:z,con42:P,cosio:d,cosio2:g,eccsq:u,omeosq:h,posq:L,rp:D,rteosq:m,sinio:x,gsto:T}}function vE(a){const{irez:t,d2201:n,d2211:s,d3210:o,d3222:c,d4410:u,d4422:h,d5220:m,d5232:d,d5421:g,d5433:v,dedt:_,del1:S,del2:b,del3:R,didt:x,dmdt:y,dnodt:P,domdt:z,argpo:C,argpdot:L,t:D,tc:B,gsto:T,xfact:N,xlamo:G,no:H}=a;let{atime:W,em:lt,argpm:ct,inclm:J,xli:I,mm:V,xni:$,nodem:ft,nm:bt}=a;const F=.13130908,q=2.8843198,vt=.37448087,Ct=5.7686396,Mt=.95240898,K=1.8014998,yt=1.050833,xt=4.4108898,Et=.0043752690880113,Dt=720,Ut=-720,Yt=259200;let It,Ht,Wt,ae,oe,ce,me,ee,le=0,_e=0;const X=(T+B*Et)%cn;if(lt+=_*D,J+=x*D,ct+=z*D,ft+=P*D,V+=y*D,t!==0){(W===0||D*W<=0||Math.abs(D)<Math.abs(W))&&(W=0,$=H,I=G),D>0?It=Dt:It=Ut;let fe=381;for(;fe===381;)t!==2?(me=S*Math.sin(I-F)+b*Math.sin(2*(I-q))+R*Math.sin(3*(I-vt)),oe=$+N,ce=S*Math.cos(I-F)+2*b*Math.cos(2*(I-q))+3*R*Math.cos(3*(I-vt)),ce*=oe):(ee=C+L*W,Wt=ee+ee,Ht=I+I,me=n*Math.sin(Wt+I-Ct)+s*Math.sin(I-Ct)+o*Math.sin(ee+I-Mt)+c*Math.sin(-ee+I-Mt)+u*Math.sin(Wt+Ht-K)+h*Math.sin(Ht-K)+m*Math.sin(ee+I-yt)+d*Math.sin(-ee+I-yt)+g*Math.sin(ee+Ht-xt)+v*Math.sin(-ee+Ht-xt),oe=$+N,ce=n*Math.cos(Wt+I-Ct)+s*Math.cos(I-Ct)+o*Math.cos(ee+I-Mt)+c*Math.cos(-ee+I-Mt)+m*Math.cos(ee+I-yt)+d*Math.cos(-ee+I-yt)+2*(u*Math.cos(Wt+Ht-K)+h*Math.cos(Ht-K)+g*Math.cos(ee+Ht-xt)+v*Math.cos(-ee+Ht-xt)),ce*=oe),Math.abs(D-W)>=Dt?fe=381:(_e=D-W,fe=0),fe===381&&(I+=oe*It+me*Yt,$+=me*It+ce*Yt,W+=It);bt=$+me*_e+ce*_e*_e*.5,ae=I+oe*_e+me*_e*_e*.5,t!==1?(V=ae-2*ft+2*X,le=bt-H):(V=ae-ft-ct+X,le=bt-H),bt=H+le}return{atime:W,em:lt,argpm:ct,inclm:J,xli:I,mm:V,xni:$,nodem:ft,dndt:le,nm:bt}}var Us;(function(a){a[a.None=0]="None",a[a.MeanEccentricityOutOfRange=1]="MeanEccentricityOutOfRange",a[a.MeanMotionBelowZero=2]="MeanMotionBelowZero",a[a.PerturbedEccentricityOutOfRange=3]="PerturbedEccentricityOutOfRange",a[a.SemiLatusRectumBelowZero=4]="SemiLatusRectumBelowZero",a[a.Decayed=6]="Decayed"})(Us||(Us={}));function wy(a,t){let n,s,o,c,u,h,m,d,g,v,_,S,b,R,x,y,P,z,C,L,D,B,T,N,G,H,W;a.t=t,a.error=Us.None;const ct=a.mo+a.mdot*a.t,J=a.argpo+a.argpdot*a.t,I=a.nodeo+a.nodedot*a.t;g=J,D=ct;const V=a.t*a.t;if(T=I+a.nodecf*V,P=1-a.cc1*a.t,z=a.bstar*a.cc4*a.t,C=a.t2cof*V,a.isimp!==1){m=a.omgcof*a.t;const gt=1+a.eta*Math.cos(ct);h=a.xmcof*(gt*gt*gt-a.delmo),y=m+h,D=ct+y,g=J-y,S=V*a.t,b=S*a.t,P=P-a.d2*V-a.d3*S-a.d4*b,z+=a.bstar*a.cc5*(Math.sin(D)-a.sinmao),C=C+a.t3cof*S+b*(a.t4cof+a.t*a.t5cof)}B=a.no;let $=a.ecco;if(L=a.inclo,a.method==="d"){R=a.t;const gt={irez:a.irez,d2201:a.d2201,d2211:a.d2211,d3210:a.d3210,d3222:a.d3222,d4410:a.d4410,d4422:a.d4422,d5220:a.d5220,d5232:a.d5232,d5421:a.d5421,d5433:a.d5433,dedt:a.dedt,del1:a.del1,del2:a.del2,del3:a.del3,didt:a.didt,dmdt:a.dmdt,dnodt:a.dnodt,domdt:a.domdt,argpo:a.argpo,argpdot:a.argpdot,t:a.t,tc:R,gsto:a.gsto,xfact:a.xfact,xlamo:a.xlamo,no:a.no,atime:a.atime,em:$,argpm:g,inclm:L,xli:a.xli,mm:D,xni:a.xni,nodem:T,nm:B};({em:$,argpm:g,inclm:L,mm:D,nodem:T,nm:B}=vE(gt))}if(B<=0)return a.error=Us.MeanMotionBelowZero,null;const ft=(Za/B)**Fl*P*P;if(B=Za/ft**1.5,$-=z,$>=1||$<-.001)return a.error=Us.MeanEccentricityOutOfRange,null;$<1e-6&&($=1e-6),D+=a.no*C,G=D+g+T,T%=cn,g%=cn,G%=cn,D=(G-g-T)%cn;const bt={am:ft,em:$,im:L,Om:T,om:g,mm:D,nm:B},F=Math.sin(L),q=Math.cos(L);let vt=$;if(N=L,v=g,W=T,H=D,c=F,o=q,a.method==="d"){const gt={inclo:a.inclo,init:"n",ep:vt,inclp:N,nodep:W,argpp:v,mp:H,opsmode:a.operationmode},zt=Cy(a,gt);if({ep:vt,nodep:W,argpp:v,mp:H}=zt,N=zt.inclp,N<0&&(N=-N,W+=Fn,v-=Fn),vt<0||vt>1)return a.error=Us.PerturbedEccentricityOutOfRange,null}a.method==="d"&&(c=Math.sin(N),o=Math.cos(N),a.aycof=-.5*fr*c,Math.abs(o+1)>15e-13?a.xlcof=-.25*fr*c*(3+5*o)/(1+o):a.xlcof=-.25*fr*c*(3+5*o)/15e-13);const Ct=vt*Math.cos(v);y=1/(ft*(1-vt*vt));const Mt=vt*Math.sin(v)+y*a.aycof,yt=(H+v+W+y*a.xlcof*Ct-W)%cn;d=yt,x=9999.9;let xt=1;for(;Math.abs(x)>=1e-12&&xt<=10;)s=Math.sin(d),n=Math.cos(d),x=1-n*Ct-s*Mt,x=(yt-Mt*n+Ct*s-d)/x,Math.abs(x)>=.95&&(x>0?x=.95:x=-.95),d+=x,xt+=1;const Et=Ct*n+Mt*s,Dt=Ct*s-Mt*n,Ut=Ct*Ct+Mt*Mt,Yt=ft*(1-Ut);if(Yt<0)return a.error=Us.SemiLatusRectumBelowZero,null;const It=ft*(1-Et),Ht=Math.sqrt(ft)*Dt/It,Wt=Math.sqrt(Yt)/It,ae=Math.sqrt(1-Ut);y=Dt/(1+ae);const oe=ft/It*(s-Mt-Ct*y),ce=ft/It*(n-Ct+Mt*y);_=Math.atan2(oe,ce);const me=(ce+ce)*oe,ee=1-2*oe*oe;y=1/Yt;const le=.5*ur*y,_e=le*y;a.method==="d"&&(u=o*o,a.con41=3*u-1,a.x1mth2=1-u,a.x7thm1=7*u-1);const X=It*(1-1.5*_e*ae*a.con41)+.5*le*a.x1mth2*ee;if(X<1)return a.error=Us.Decayed,null;_-=.25*_e*a.x7thm1*me;const fe=W+1.5*_e*o*me,de=N+1.5*_e*o*c*ee,O=Ht-B*le*a.x1mth2*me/Za,E=Wt+B*le*(a.x1mth2*ee+1.5*a.con41)/Za,Q=Math.sin(_),it=Math.cos(_),mt=Math.sin(fe),Lt=Math.cos(fe),A=Math.sin(de),ht=Math.cos(de),pt=-mt*ht,Ot=Lt*ht,Bt=pt*Q+Lt*it,Ft=Ot*Q+mt*it,Nt=A*Q,ne=pt*it-Lt*Q,Jt=Ot*it-mt*Q,ie=A*it,Y={x:X*Bt*wi,y:X*Ft*wi,z:X*Nt*wi},Pt={x:(O*Bt+E*ne)*Ld,y:(O*Ft+E*Jt)*Ld,z:(O*Nt+E*ie)*Ld};return{position:Y,velocity:Pt,meanElements:bt}}function xE(a,t){const{opsmode:n,epoch:s,xbstar:o,xecco:c,xargpo:u,xinclo:h,xmo:m,xno:d,xnodeo:g}=t;let v,_,S,b,R,x,y,P,z,C,L,D,B,T,N,G,H,W,lt,ct,J,I,V,$,ft,bt,F,q,vt,Ct,Mt,K,yt,xt,Et,Dt,Ut,Yt,It,Ht,Wt,ae,oe,ce,me,ee,le,_e,X,fe,de,O,E,Q,it,mt;const Lt=15e-13,A=a;A.isimp=0,A.method="n",A.aycof=0,A.con41=0,A.cc1=0,A.cc4=0,A.cc5=0,A.d2=0,A.d3=0,A.d4=0,A.delmo=0,A.eta=0,A.argpdot=0,A.omgcof=0,A.sinmao=0,A.t=0,A.t2cof=0,A.t3cof=0,A.t4cof=0,A.t5cof=0,A.x1mth2=0,A.x7thm1=0,A.mdot=0,A.nodedot=0,A.xlcof=0,A.xmcof=0,A.nodecf=0,A.irez=0,A.d2201=0,A.d2211=0,A.d3210=0,A.d3222=0,A.d4410=0,A.d4422=0,A.d5220=0,A.d5232=0,A.d5421=0,A.d5433=0,A.dedt=0,A.del1=0,A.del2=0,A.del3=0,A.didt=0,A.dmdt=0,A.dnodt=0,A.domdt=0,A.e3=0,A.ee2=0,A.peo=0,A.pgho=0,A.pho=0,A.pinco=0,A.plo=0,A.se2=0,A.se3=0,A.sgh2=0,A.sgh3=0,A.sgh4=0,A.sh2=0,A.sh3=0,A.si2=0,A.si3=0,A.sl2=0,A.sl3=0,A.sl4=0,A.gsto=0,A.xfact=0,A.xgh2=0,A.xgh3=0,A.xgh4=0,A.xh2=0,A.xh3=0,A.xi2=0,A.xi3=0,A.xl2=0,A.xl3=0,A.xl4=0,A.xlamo=0,A.zmol=0,A.zmos=0,A.atime=0,A.xli=0,A.xni=0,A.bstar=o,A.ecco=c,A.argpo=u,A.inclo=h,A.mo=m,A.no=d,A.nodeo=g,A.operationmode=n;const ht=78/wi+1,pt=42/wi,Ot=pt*pt*pt*pt;A.init="y",A.t=0;const Bt={ecco:A.ecco,epoch:s,inclo:A.inclo,no:A.no,method:A.method,opsmode:A.operationmode},Ft=_E(Bt),{ao:Nt,con42:ne,cosio:Jt,cosio2:ie,eccsq:Y,omeosq:Pt,posq:gt,rp:zt,rteosq:Gt,sinio:At}=Ft;if(A.no=Ft.no,A.con41=Ft.con41,A.gsto=Ft.gsto,A.a=(A.no*fE)**(-2/3),A.alta=A.a*(1+A.ecco)-1,A.altp=A.a*(1-A.ecco)-1,A.error=0,Pt>=0||A.no>=0){if(A.isimp=0,zt<220/wi+1&&(A.isimp=1),F=ht,J=Ot,W=(zt-1)*wi,W<156){F=W-78,W<98&&(F=20);const Vt=(120-F)/wi;J=Vt*Vt*Vt*Vt,F=F/wi+1}lt=1/gt,ee=1/(Nt-F),A.eta=Nt*A.ecco*ee,D=A.eta*A.eta,L=A.ecco*A.eta,ct=Math.abs(1-D),x=J*ee**4,y=x/ct**3.5,b=y*A.no*(Nt*(1+1.5*D+L*(4+D))+.375*ur*ee/ct*A.con41*(8+3*D*(8+D))),A.cc1=A.bstar*b,R=0,A.ecco>1e-4&&(R=-2*x*ee*fr*A.no*At/A.ecco),A.x1mth2=1-ie,A.cc4=2*A.no*y*Nt*Pt*(A.eta*(2+.5*D)+A.ecco*(.5+2*D)-ur*ee/(Nt*ct)*(-3*A.con41*(1-2*L+D*(1.5-.5*L))+.75*A.x1mth2*(2*D-L*(1+D))*Math.cos(2*A.argpo))),A.cc5=2*y*Nt*Pt*(1+2.75*(D+L)+L*D),P=ie*ie,oe=1.5*ur*lt*A.no,ce=.5*oe*ur*lt,me=-.46875*dE*lt*lt*A.no,A.mdot=A.no+.5*oe*Gt*A.con41+.0625*ce*Gt*(13-78*ie+137*P),A.argpdot=-.5*oe*ne+.0625*ce*(7-114*ie+395*P)+me*(3-36*ie+49*P),_e=-oe*Jt,A.nodedot=_e+(.5*ce*(4-19*ie)+2*me*(3-7*ie))*Jt,le=A.argpdot+A.nodedot,A.omgcof=A.bstar*R*Math.cos(A.argpo),A.xmcof=0,A.ecco>1e-4&&(A.xmcof=-Fl*x*A.bstar/L),A.nodecf=3.5*Pt*_e*A.cc1,A.t2cof=1.5*A.cc1,Math.abs(Jt+1)>15e-13?A.xlcof=-.25*fr*At*(3+5*Jt)/(1+Jt):A.xlcof=-.25*fr*At*(3+5*Jt)/Lt,A.aycof=-.5*fr*At;const qt=1+A.eta*Math.cos(A.mo);if(A.delmo=qt*qt*qt,A.sinmao=Math.sin(A.mo),A.x7thm1=7*ie-1,2*Fn/A.no>=225){A.method="d",A.isimp=1,Wt=0,N=A.inclo;const Vt={epoch:s,ep:A.ecco,argpp:A.argpo,tc:Wt,inclp:A.inclo,nodep:A.nodeo,np:A.no,e3:A.e3,ee2:A.ee2,peo:A.peo,pgho:A.pgho,pho:A.pho,pinco:A.pinco,plo:A.plo,se2:A.se2,se3:A.se3,sgh2:A.sgh2,sgh3:A.sgh3,sgh4:A.sgh4,sh2:A.sh2,sh3:A.sh3,si2:A.si2,si3:A.si3,sl2:A.sl2,sl3:A.sl3,sl4:A.sl4,xgh2:A.xgh2,xgh3:A.xgh3,xgh4:A.xgh4,xh2:A.xh2,xh3:A.xh3,xi2:A.xi2,xi3:A.xi3,xl2:A.xl2,xl3:A.xl3,xl4:A.xl4,zmol:A.zmol,zmos:A.zmos},te=mE(Vt);A.e3=te.e3,A.ee2=te.ee2,A.peo=te.peo,A.pgho=te.pgho,A.pho=te.pho,A.pinco=te.pinco,A.plo=te.plo,A.se2=te.se2,A.se3=te.se3,A.sgh2=te.sgh2,A.sgh3=te.sgh3,A.sgh4=te.sgh4,A.sh2=te.sh2,A.sh3=te.sh3,A.si2=te.si2,A.si3=te.si3,A.sl2=te.sl2,A.sl3=te.sl3,A.sl4=te.sl4,{sinim:_,cosim:v,em:z,emsq:C,s1:I,s2:V,s3:$,s4:ft,s5:bt,ss1:q,ss2:vt,ss3:Ct,ss4:Mt,ss5:K,sz1:yt,sz3:xt,sz11:Et,sz13:Dt,sz21:Ut,sz23:Yt,sz31:It,sz33:Ht}=te,A.xgh2=te.xgh2,A.xgh3=te.xgh3,A.xgh4=te.xgh4,A.xh2=te.xh2,A.xh3=te.xh3,A.xi2=te.xi2,A.xi3=te.xi3,A.xl2=te.xl2,A.xl3=te.xl3,A.xl4=te.xl4,A.zmol=te.zmol,A.zmos=te.zmos,{nm:H,z1:X,z3:fe,z11:de,z13:O,z21:E,z23:Q,z31:it,z33:mt}=te;const ye={init:A.init,ep:A.ecco,inclp:A.inclo,nodep:A.nodeo,argpp:A.argpo,mp:A.mo,opsmode:A.operationmode},Ze=Cy(A,ye);A.ecco=Ze.ep,A.inclo=Ze.inclp,A.nodeo=Ze.nodep,A.argpo=Ze.argpp,A.mo=Ze.mp,B=0,T=0,G=0;const _n={cosim:v,emsq:C,argpo:A.argpo,s1:I,s2:V,s3:$,s4:ft,s5:bt,sinim:_,ss1:q,ss2:vt,ss3:Ct,ss4:Mt,ss5:K,sz1:yt,sz3:xt,sz11:Et,sz13:Dt,sz21:Ut,sz23:Yt,sz31:It,sz33:Ht,t:A.t,tc:Wt,gsto:A.gsto,mo:A.mo,mdot:A.mdot,no:A.no,nodeo:A.nodeo,nodedot:A.nodedot,xpidot:le,z1:X,z3:fe,z11:de,z13:O,z21:E,z23:Q,z31:it,z33:mt,ecco:A.ecco,eccsq:Y,em:z,argpm:B,inclm:N,mm:G,nm:H,nodem:T,irez:A.irez,atime:A.atime,d2201:A.d2201,d2211:A.d2211,d3210:A.d3210,d3222:A.d3222,d4410:A.d4410,d4422:A.d4422,d5220:A.d5220,d5232:A.d5232,d5421:A.d5421,d5433:A.d5433,dedt:A.dedt,didt:A.didt,dmdt:A.dmdt,dnodt:A.dnodt,domdt:A.domdt,del1:A.del1,del2:A.del2,del3:A.del3,xfact:A.xfact,xlamo:A.xlamo,xli:A.xli,xni:A.xni},Ne=gE(_n);A.irez=Ne.irez,A.atime=Ne.atime,A.d2201=Ne.d2201,A.d2211=Ne.d2211,A.d3210=Ne.d3210,A.d3222=Ne.d3222,A.d4410=Ne.d4410,A.d4422=Ne.d4422,A.d5220=Ne.d5220,A.d5232=Ne.d5232,A.d5421=Ne.d5421,A.d5433=Ne.d5433,A.dedt=Ne.dedt,A.didt=Ne.didt,A.dmdt=Ne.dmdt,A.dnodt=Ne.dnodt,A.domdt=Ne.domdt,A.del1=Ne.del1,A.del2=Ne.del2,A.del3=Ne.del3,A.xfact=Ne.xfact,A.xlamo=Ne.xlamo,A.xli=Ne.xli,A.xni=Ne.xni}A.isimp!==1&&(S=A.cc1*A.cc1,A.d2=4*Nt*ee*S,ae=A.d2*ee*A.cc1/3,A.d3=(17*Nt+F)*ae,A.d4=.5*ae*Nt*ee*(221*Nt+31*F)*A.cc1,A.t3cof=A.d2+2*S,A.t4cof=.25*(3*A.d3+A.cc1*(12*A.d2+10*S)),A.t5cof=.2*(3*A.d4+12*A.cc1*A.d3+6*A.d2*A.d2+15*S*(2*A.d2+S)))}wy(A,0),A.init="n"}function Dy(a,t){const o=a.substring(2,7),c=parseInt(a.substring(18,20),10),u=parseFloat(a.substring(20,32));let h=parseFloat(a.substring(33,43)),m=parseFloat(`${a.substring(44,45)}.${a.substring(45,50)}E${a.substring(50,52)}`);const d=parseFloat(`${a.substring(53,54)}.${a.substring(54,59)}E${a.substring(59,61)}`),g=parseFloat(t.substring(8,16))*Os,v=parseFloat(t.substring(17,25))*Os,_=parseFloat(`.${t.substring(26,33).replace(/\s/g,"0")}`),S=parseFloat(t.substring(34,42))*Os,b=parseFloat(t.substring(43,51))*Os,R=parseFloat(t.substring(52,63))/Nd;h/=Nd*1440,m/=Nd*1440*1440;const x=c<57?c+2e3:c+1900,y=pE(x,u),{mon:P,day:z,hr:C,minute:L,sec:D}=y,B=df(x,P,z,C,L,D),T={error:0,satnum:o,epochyr:c,epochdays:u,ndot:h,nddot:m,bstar:d,inclo:g,nodeo:v,ecco:_,argpo:S,mo:b,no:R,jdsatepoch:B};return xE(T,{opsmode:"i",satn:T.satnum,epoch:T.jdsatepoch-24332815e-1,xbstar:T.bstar,xecco:T.ecco,xargpo:T.argpo,xinclo:T.inclo,xmo:T.mo,xno:T.no,xnodeo:T.nodeo}),T}function Hu(a,...t){const s=(df(...t)-a.jdsatepoch)*cE;return wy(a,s)}function Uy(a){return a*lE}function Ly(a){if(a<-Fn/2||a>Fn/2)throw new RangeError("Latitude radians must be in range [-pi/2; pi/2].");return Uy(a)}function Ny(a){if(a<-Fn||a>Fn)throw new RangeError("Longitude radians must be in range [-pi; pi].");return Uy(a)}function Py(a,t){const s=6356.7523142,o=Math.sqrt(a.x*a.x+a.y*a.y),c=(6378.137-s)/6378.137,u=2*c-c*c,h=((Math.atan2(a.y,a.x)-t+Fn)%cn+cn)%cn-Fn,m=20;let d=0,g=Math.atan2(a.z,Math.sqrt(a.x*a.x+a.y*a.y)),v;for(;d++<m;)v=1/Math.sqrt(1-u*(Math.sin(g)*Math.sin(g))),g=Math.atan2(a.z+6378.137*v*u*Math.sin(g),o);const _=o/Math.cos(g)-6378.137*v;return{longitude:h,latitude:g,height:_}}function yE(a){const t=(a-2451545)/36525,n=(280.46+36000.77*t)%360;let s=(357.5277233+35999.05034*t*Os)%cn;s<0&&(s+=cn);const o=(n+1.914666471*Math.sin(s)+.019994643*Math.sin(2*s))%360*Os,c=(23.439291-.0130042*t)*Os,u=1.000140612-.016708617*Math.cos(s)-139589e-9*Math.cos(2*s),h={x:u*Math.cos(o),y:u*Math.cos(c)*Math.sin(o),z:u*Math.sin(c)*Math.sin(o)},m=Math.atan(Math.cos(c)*Math.tan(o));let d=m;Math.abs(o-d)>Fn*.5&&(d+=.5*Fn*Math.round((o-m)/(.5*Fn)));const g=Math.asin(Math.sin(c)*Math.sin(o));return{rsun:h,rtasc:d,decl:g}}const Mm="185",go={ROTATE:0,DOLLY:1,PAN:2},mo={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},SE=0,qv=1,ME=2,Gu=1,bE=2,Pl=3,Is=0,li=1,Ya=2,Sa=0,_o=1,Ns=2,Yv=3,Zv=4,EE=5,lr=100,TE=101,AE=102,RE=103,CE=104,wE=200,DE=201,UE=202,LE=203,Sp=204,Mp=205,NE=206,PE=207,OE=208,zE=209,FE=210,IE=211,BE=212,HE=213,GE=214,bp=0,Ep=1,Tp=2,yo=3,Ap=4,Rp=5,Cp=6,wp=7,Oy=0,VE=1,kE=2,Ma=0,bm=1,Em=2,Tm=3,Am=4,Rm=5,Cm=6,wm=7,zy=300,pr=301,So=302,Pd=303,Od=304,mf=306,Dp=1e3,Ka=1001,Up=1002,Zn=1003,XE=1004,iu=1005,ti=1006,zd=1007,hr=1008,qi=1009,Fy=1010,Iy=1011,Il=1012,Dm=1013,Ea=1014,xa=1015,Di=1016,Um=1017,Lm=1018,Bl=1020,By=35902,Hy=35899,Gy=1021,Vy=1022,oa=1023,Ja=1026,dr=1027,ky=1028,Nm=1029,mr=1030,Pm=1031,Om=1033,Vu=33776,ku=33777,Xu=33778,Wu=33779,Lp=35840,Np=35841,Pp=35842,Op=35843,zp=36196,Fp=37492,Ip=37496,Bp=37488,Hp=37489,Ju=37490,Gp=37491,Vp=37808,kp=37809,Xp=37810,Wp=37811,qp=37812,Yp=37813,Zp=37814,Kp=37815,jp=37816,Qp=37817,Jp=37818,$p=37819,tm=37820,em=37821,nm=36492,im=36494,am=36495,sm=36283,rm=36284,$u=36285,om=36286,WE=3200,Kv=0,qE=1,Ps="",oi="srgb",tf="srgb-linear",ef="linear",Je="srgb",Kr=7680,jv=519,YE=512,ZE=513,KE=514,zm=515,jE=516,QE=517,Fm=518,JE=519,lm=35044,Qv="300 es",ya=2e3,nf=2001;function $E(a){for(let t=a.length-1;t>=0;--t)if(a[t]>=65535)return!0;return!1}function Hl(a){return document.createElementNS("http://www.w3.org/1999/xhtml",a)}function tT(){const a=Hl("canvas");return a.style.display="block",a}const Jv={};function af(...a){const t="THREE."+a.shift();console.log(t,...a)}function Xy(a){const t=a[0];if(typeof t=="string"&&t.startsWith("TSL:")){const n=a[1];n&&n.isStackTrace?a[0]+=" "+n.getLocation():a[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return a}function xe(...a){a=Xy(a);const t="THREE."+a.shift();{const n=a[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...a)}}function Be(...a){a=Xy(a);const t="THREE."+a.shift();{const n=a[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...a)}}function vo(...a){const t=a.join(" ");t in Jv||(Jv[t]=!0,xe(...a))}function eT(a,t,n){return new Promise(function(s,o){function c(){switch(a.clientWaitSync(t,a.SYNC_FLUSH_COMMANDS_BIT,0)){case a.WAIT_FAILED:o();break;case a.TIMEOUT_EXPIRED:setTimeout(c,n);break;default:s()}}setTimeout(c,n)})}const nT={[bp]:Ep,[Tp]:Cp,[Ap]:wp,[yo]:Rp,[Ep]:bp,[Cp]:Tp,[wp]:Ap,[Rp]:yo};class Hs{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[t]===void 0&&(s[t]=[]),s[t].indexOf(n)===-1&&s[t].push(n)}hasEventListener(t,n){const s=this._listeners;return s===void 0?!1:s[t]!==void 0&&s[t].indexOf(n)!==-1}removeEventListener(t,n){const s=this._listeners;if(s===void 0)return;const o=s[t];if(o!==void 0){const c=o.indexOf(n);c!==-1&&o.splice(c,1)}}dispatchEvent(t){const n=this._listeners;if(n===void 0)return;const s=n[t.type];if(s!==void 0){t.target=this;const o=s.slice(0);for(let c=0,u=o.length;c<u;c++)o[c].call(this,t);t.target=null}}}const Jn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qu=Math.PI/180,cm=180/Math.PI;function Fs(){const a=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(Jn[a&255]+Jn[a>>8&255]+Jn[a>>16&255]+Jn[a>>24&255]+"-"+Jn[t&255]+Jn[t>>8&255]+"-"+Jn[t>>16&15|64]+Jn[t>>24&255]+"-"+Jn[n&63|128]+Jn[n>>8&255]+"-"+Jn[n>>16&255]+Jn[n>>24&255]+Jn[s&255]+Jn[s>>8&255]+Jn[s>>16&255]+Jn[s>>24&255]).toLowerCase()}function Le(a,t,n){return Math.max(t,Math.min(n,a))}function iT(a,t){return(a%t+t)%t}function Fd(a,t,n){return(1-n)*a+n*t}function va(a,t){switch(t.constructor){case Float32Array:return a;case Uint32Array:return a/4294967295;case Uint16Array:return a/65535;case Uint8Array:return a/255;case Int32Array:return Math.max(a/2147483647,-1);case Int16Array:return Math.max(a/32767,-1);case Int8Array:return Math.max(a/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function rn(a,t){switch(t.constructor){case Float32Array:return a;case Uint32Array:return Math.round(a*4294967295);case Uint16Array:return Math.round(a*65535);case Uint8Array:return Math.round(a*255);case Int32Array:return Math.round(a*2147483647);case Int16Array:return Math.round(a*32767);case Int8Array:return Math.round(a*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const aT={DEG2RAD:qu},Xm=class Xm{constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const n=this.x,s=this.y,o=t.elements;return this.x=o[0]*n+o[3]*s+o[6],this.y=o[1]*n+o[4]*s+o[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=Le(this.x,t.x,n.x),this.y=Le(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=Le(this.x,t,n),this.y=Le(this.y,t,n),this}clampLength(t,n){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Le(s,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;const s=this.dot(t)/n;return Math.acos(Le(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const n=this.x-t.x,s=this.y-t.y;return n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,s){return this.x=t.x+(n.x-t.x)*s,this.y=t.y+(n.y-t.y)*s,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){const s=Math.cos(n),o=Math.sin(n),c=this.x-t.x,u=this.y-t.y;return this.x=c*s-u*o+t.x,this.y=c*o+u*s+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Xm.prototype.isVector2=!0;let he=Xm;class Bs{constructor(t=0,n=0,s=0,o=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=s,this._w=o}static slerpFlat(t,n,s,o,c,u,h){let m=s[o+0],d=s[o+1],g=s[o+2],v=s[o+3],_=c[u+0],S=c[u+1],b=c[u+2],R=c[u+3];if(v!==R||m!==_||d!==S||g!==b){let x=m*_+d*S+g*b+v*R;x<0&&(_=-_,S=-S,b=-b,R=-R,x=-x);let y=1-h;if(x<.9995){const P=Math.acos(x),z=Math.sin(P);y=Math.sin(y*P)/z,h=Math.sin(h*P)/z,m=m*y+_*h,d=d*y+S*h,g=g*y+b*h,v=v*y+R*h}else{m=m*y+_*h,d=d*y+S*h,g=g*y+b*h,v=v*y+R*h;const P=1/Math.sqrt(m*m+d*d+g*g+v*v);m*=P,d*=P,g*=P,v*=P}}t[n]=m,t[n+1]=d,t[n+2]=g,t[n+3]=v}static multiplyQuaternionsFlat(t,n,s,o,c,u){const h=s[o],m=s[o+1],d=s[o+2],g=s[o+3],v=c[u],_=c[u+1],S=c[u+2],b=c[u+3];return t[n]=h*b+g*v+m*S-d*_,t[n+1]=m*b+g*_+d*v-h*S,t[n+2]=d*b+g*S+h*_-m*v,t[n+3]=g*b-h*v-m*_-d*S,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,s,o){return this._x=t,this._y=n,this._z=s,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){const s=t._x,o=t._y,c=t._z,u=t._order,h=Math.cos,m=Math.sin,d=h(s/2),g=h(o/2),v=h(c/2),_=m(s/2),S=m(o/2),b=m(c/2);switch(u){case"XYZ":this._x=_*g*v+d*S*b,this._y=d*S*v-_*g*b,this._z=d*g*b+_*S*v,this._w=d*g*v-_*S*b;break;case"YXZ":this._x=_*g*v+d*S*b,this._y=d*S*v-_*g*b,this._z=d*g*b-_*S*v,this._w=d*g*v+_*S*b;break;case"ZXY":this._x=_*g*v-d*S*b,this._y=d*S*v+_*g*b,this._z=d*g*b+_*S*v,this._w=d*g*v-_*S*b;break;case"ZYX":this._x=_*g*v-d*S*b,this._y=d*S*v+_*g*b,this._z=d*g*b-_*S*v,this._w=d*g*v+_*S*b;break;case"YZX":this._x=_*g*v+d*S*b,this._y=d*S*v+_*g*b,this._z=d*g*b-_*S*v,this._w=d*g*v-_*S*b;break;case"XZY":this._x=_*g*v-d*S*b,this._y=d*S*v-_*g*b,this._z=d*g*b+_*S*v,this._w=d*g*v+_*S*b;break;default:xe("Quaternion: .setFromEuler() encountered an unknown order: "+u)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){const s=n/2,o=Math.sin(s);return this._x=t.x*o,this._y=t.y*o,this._z=t.z*o,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(t){const n=t.elements,s=n[0],o=n[4],c=n[8],u=n[1],h=n[5],m=n[9],d=n[2],g=n[6],v=n[10],_=s+h+v;if(_>0){const S=.5/Math.sqrt(_+1);this._w=.25/S,this._x=(g-m)*S,this._y=(c-d)*S,this._z=(u-o)*S}else if(s>h&&s>v){const S=2*Math.sqrt(1+s-h-v);this._w=(g-m)/S,this._x=.25*S,this._y=(o+u)/S,this._z=(c+d)/S}else if(h>v){const S=2*Math.sqrt(1+h-s-v);this._w=(c-d)/S,this._x=(o+u)/S,this._y=.25*S,this._z=(m+g)/S}else{const S=2*Math.sqrt(1+v-s-h);this._w=(u-o)/S,this._x=(c+d)/S,this._y=(m+g)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let s=t.dot(n)+1;return s<1e-8?(s=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=s):(this._x=0,this._y=-t.z,this._z=t.y,this._w=s)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=s),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Le(this.dot(t),-1,1)))}rotateTowards(t,n){const s=this.angleTo(t);if(s===0)return this;const o=Math.min(1,n/s);return this.slerp(t,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){const s=t._x,o=t._y,c=t._z,u=t._w,h=n._x,m=n._y,d=n._z,g=n._w;return this._x=s*g+u*h+o*d-c*m,this._y=o*g+u*m+c*h-s*d,this._z=c*g+u*d+s*m-o*h,this._w=u*g-s*h-o*m-c*d,this._onChangeCallback(),this}slerp(t,n){let s=t._x,o=t._y,c=t._z,u=t._w,h=this.dot(t);h<0&&(s=-s,o=-o,c=-c,u=-u,h=-h);let m=1-n;if(h<.9995){const d=Math.acos(h),g=Math.sin(d);m=Math.sin(m*d)/g,n=Math.sin(n*d)/g,this._x=this._x*m+s*n,this._y=this._y*m+o*n,this._z=this._z*m+c*n,this._w=this._w*m+u*n,this._onChangeCallback()}else this._x=this._x*m+s*n,this._y=this._y*m+o*n,this._z=this._z*m+c*n,this._w=this._w*m+u*n,this.normalize();return this}slerpQuaternions(t,n,s){return this.copy(t).slerp(n,s)}random(){const t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),s=Math.random(),o=Math.sqrt(1-s),c=Math.sqrt(s);return this.set(o*Math.sin(t),o*Math.cos(t),c*Math.sin(n),c*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Wm=class Wm{constructor(t=0,n=0,s=0){this.x=t,this.y=n,this.z=s}set(t,n,s){return s===void 0&&(s=this.z),this.x=t,this.y=n,this.z=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion($v.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion($v.setFromAxisAngle(t,n))}applyMatrix3(t){const n=this.x,s=this.y,o=this.z,c=t.elements;return this.x=c[0]*n+c[3]*s+c[6]*o,this.y=c[1]*n+c[4]*s+c[7]*o,this.z=c[2]*n+c[5]*s+c[8]*o,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const n=this.x,s=this.y,o=this.z,c=t.elements,u=1/(c[3]*n+c[7]*s+c[11]*o+c[15]);return this.x=(c[0]*n+c[4]*s+c[8]*o+c[12])*u,this.y=(c[1]*n+c[5]*s+c[9]*o+c[13])*u,this.z=(c[2]*n+c[6]*s+c[10]*o+c[14])*u,this}applyQuaternion(t){const n=this.x,s=this.y,o=this.z,c=t.x,u=t.y,h=t.z,m=t.w,d=2*(u*o-h*s),g=2*(h*n-c*o),v=2*(c*s-u*n);return this.x=n+m*d+u*v-h*g,this.y=s+m*g+h*d-c*v,this.z=o+m*v+c*g-u*d,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const n=this.x,s=this.y,o=this.z,c=t.elements;return this.x=c[0]*n+c[4]*s+c[8]*o,this.y=c[1]*n+c[5]*s+c[9]*o,this.z=c[2]*n+c[6]*s+c[10]*o,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=Le(this.x,t.x,n.x),this.y=Le(this.y,t.y,n.y),this.z=Le(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=Le(this.x,t,n),this.y=Le(this.y,t,n),this.z=Le(this.z,t,n),this}clampLength(t,n){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Le(s,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,s){return this.x=t.x+(n.x-t.x)*s,this.y=t.y+(n.y-t.y)*s,this.z=t.z+(n.z-t.z)*s,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){const s=t.x,o=t.y,c=t.z,u=n.x,h=n.y,m=n.z;return this.x=o*m-c*h,this.y=c*u-s*m,this.z=s*h-o*u,this}projectOnVector(t){const n=t.lengthSq();if(n===0)return this.set(0,0,0);const s=t.dot(this)/n;return this.copy(t).multiplyScalar(s)}projectOnPlane(t){return Id.copy(this).projectOnVector(t),this.sub(Id)}reflect(t){return this.sub(Id.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;const s=this.dot(t)/n;return Math.acos(Le(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const n=this.x-t.x,s=this.y-t.y,o=this.z-t.z;return n*n+s*s+o*o}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,s){const o=Math.sin(n)*t;return this.x=o*Math.sin(s),this.y=Math.cos(n)*t,this.z=o*Math.cos(s),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,s){return this.x=t*Math.sin(n),this.y=s,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){const n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){const n=this.setFromMatrixColumn(t,0).length(),s=this.setFromMatrixColumn(t,1).length(),o=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=s,this.z=o,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,n=Math.random()*2-1,s=Math.sqrt(1-n*n);return this.x=s*Math.cos(t),this.y=n,this.z=s*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Wm.prototype.isVector3=!0;let et=Wm;const Id=new et,$v=new Bs,qm=class qm{constructor(t,n,s,o,c,u,h,m,d){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,s,o,c,u,h,m,d)}set(t,n,s,o,c,u,h,m,d){const g=this.elements;return g[0]=t,g[1]=o,g[2]=h,g[3]=n,g[4]=c,g[5]=m,g[6]=s,g[7]=u,g[8]=d,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const n=this.elements,s=t.elements;return n[0]=s[0],n[1]=s[1],n[2]=s[2],n[3]=s[3],n[4]=s[4],n[5]=s[5],n[6]=s[6],n[7]=s[7],n[8]=s[8],this}extractBasis(t,n,s){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const s=t.elements,o=n.elements,c=this.elements,u=s[0],h=s[3],m=s[6],d=s[1],g=s[4],v=s[7],_=s[2],S=s[5],b=s[8],R=o[0],x=o[3],y=o[6],P=o[1],z=o[4],C=o[7],L=o[2],D=o[5],B=o[8];return c[0]=u*R+h*P+m*L,c[3]=u*x+h*z+m*D,c[6]=u*y+h*C+m*B,c[1]=d*R+g*P+v*L,c[4]=d*x+g*z+v*D,c[7]=d*y+g*C+v*B,c[2]=_*R+S*P+b*L,c[5]=_*x+S*z+b*D,c[8]=_*y+S*C+b*B,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){const t=this.elements,n=t[0],s=t[1],o=t[2],c=t[3],u=t[4],h=t[5],m=t[6],d=t[7],g=t[8];return n*u*g-n*h*d-s*c*g+s*h*m+o*c*d-o*u*m}invert(){const t=this.elements,n=t[0],s=t[1],o=t[2],c=t[3],u=t[4],h=t[5],m=t[6],d=t[7],g=t[8],v=g*u-h*d,_=h*m-g*c,S=d*c-u*m,b=n*v+s*_+o*S;if(b===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/b;return t[0]=v*R,t[1]=(o*d-g*s)*R,t[2]=(h*s-o*u)*R,t[3]=_*R,t[4]=(g*n-o*m)*R,t[5]=(o*c-h*n)*R,t[6]=S*R,t[7]=(s*m-d*n)*R,t[8]=(u*n-s*c)*R,this}transpose(){let t;const n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,s,o,c,u,h){const m=Math.cos(c),d=Math.sin(c);return this.set(s*m,s*d,-s*(m*u+d*h)+u+t,-o*d,o*m,-o*(-d*u+m*h)+h+n,0,0,1),this}scale(t,n){return vo("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Bd.makeScale(t,n)),this}rotate(t){return vo("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Bd.makeRotation(-t)),this}translate(t,n){return vo("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Bd.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){const n=Math.cos(t),s=Math.sin(t);return this.set(n,-s,0,s,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){const n=this.elements,s=t.elements;for(let o=0;o<9;o++)if(n[o]!==s[o])return!1;return!0}fromArray(t,n=0){for(let s=0;s<9;s++)this.elements[s]=t[s+n];return this}toArray(t=[],n=0){const s=this.elements;return t[n]=s[0],t[n+1]=s[1],t[n+2]=s[2],t[n+3]=s[3],t[n+4]=s[4],t[n+5]=s[5],t[n+6]=s[6],t[n+7]=s[7],t[n+8]=s[8],t}clone(){return new this.constructor().fromArray(this.elements)}};qm.prototype.isMatrix3=!0;let be=qm;const Bd=new be,tx=new be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ex=new be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function sT(){const a={enabled:!0,workingColorSpace:tf,spaces:{},convert:function(o,c,u){return this.enabled===!1||c===u||!c||!u||(this.spaces[c].transfer===Je&&(o.r=ja(o.r),o.g=ja(o.g),o.b=ja(o.b)),this.spaces[c].primaries!==this.spaces[u].primaries&&(o.applyMatrix3(this.spaces[c].toXYZ),o.applyMatrix3(this.spaces[u].fromXYZ)),this.spaces[u].transfer===Je&&(o.r=xo(o.r),o.g=xo(o.g),o.b=xo(o.b))),o},workingToColorSpace:function(o,c){return this.convert(o,this.workingColorSpace,c)},colorSpaceToWorking:function(o,c){return this.convert(o,c,this.workingColorSpace)},getPrimaries:function(o){return this.spaces[o].primaries},getTransfer:function(o){return o===Ps?ef:this.spaces[o].transfer},getToneMappingMode:function(o){return this.spaces[o].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(o,c=this.workingColorSpace){return o.fromArray(this.spaces[c].luminanceCoefficients)},define:function(o){Object.assign(this.spaces,o)},_getMatrix:function(o,c,u){return o.copy(this.spaces[c].toXYZ).multiply(this.spaces[u].fromXYZ)},_getDrawingBufferColorSpace:function(o){return this.spaces[o].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(o=this.workingColorSpace){return this.spaces[o].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(o,c){return vo("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),a.workingToColorSpace(o,c)},toWorkingColorSpace:function(o,c){return vo("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),a.colorSpaceToWorking(o,c)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],s=[.3127,.329];return a.define({[tf]:{primaries:t,whitePoint:s,transfer:ef,toXYZ:tx,fromXYZ:ex,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:oi},outputColorSpaceConfig:{drawingBufferColorSpace:oi}},[oi]:{primaries:t,whitePoint:s,transfer:Je,toXYZ:tx,fromXYZ:ex,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:oi}}}),a}const ze=sT();function ja(a){return a<.04045?a*.0773993808:Math.pow(a*.9478672986+.0521327014,2.4)}function xo(a){return a<.0031308?a*12.92:1.055*Math.pow(a,.41666)-.055}let jr;class rT{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let s;if(t instanceof HTMLCanvasElement)s=t;else{jr===void 0&&(jr=Hl("canvas")),jr.width=t.width,jr.height=t.height;const o=jr.getContext("2d");t instanceof ImageData?o.putImageData(t,0,0):o.drawImage(t,0,0,t.width,t.height),s=jr}return s.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const n=Hl("canvas");n.width=t.width,n.height=t.height;const s=n.getContext("2d");s.drawImage(t,0,0,t.width,t.height);const o=s.getImageData(0,0,t.width,t.height),c=o.data;for(let u=0;u<c.length;u++)c[u]=ja(c[u]/255)*255;return s.putImageData(o,0,0),n}else if(t.data){const n=t.data.slice(0);for(let s=0;s<n.length;s++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[s]=Math.floor(ja(n[s]/255)*255):n[s]=ja(n[s]);return{data:n,width:t.width,height:t.height}}else return xe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let oT=0;class Im{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:oT++}),this.uuid=Fs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const s={uuid:this.uuid,url:""},o=this.data;if(o!==null){let c;if(Array.isArray(o)){c=[];for(let u=0,h=o.length;u<h;u++)o[u].isDataTexture?c.push(Hd(o[u].image)):c.push(Hd(o[u]))}else c=Hd(o);s.url=c}return n||(t.images[this.uuid]=s),s}}function Hd(a){return typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&a instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&a instanceof ImageBitmap?rT.getDataURL(a):a.data?{data:Array.from(a.data),width:a.width,height:a.height,type:a.data.constructor.name}:(xe("Texture: Unable to serialize Texture."),{})}let lT=0;const Gd=new et;class Kn extends Hs{constructor(t=Kn.DEFAULT_IMAGE,n=Kn.DEFAULT_MAPPING,s=Ka,o=Ka,c=ti,u=hr,h=oa,m=qi,d=Kn.DEFAULT_ANISOTROPY,g=Ps){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lT++}),this.uuid=Fs(),this.name="",this.source=new Im(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=s,this.wrapT=o,this.magFilter=c,this.minFilter=u,this.anisotropy=d,this.format=h,this.internalFormat=null,this.type=m,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=g,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Gd).x}get height(){return this.source.getSize(Gd).y}get depth(){return this.source.getSize(Gd).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const n in t){const s=t[n];if(s===void 0){xe(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}const o=this[n];if(o===void 0){xe(`Texture.setValues(): property '${n}' does not exist.`);continue}o&&s&&o.isVector2&&s.isVector2||o&&s&&o.isVector3&&s.isVector3||o&&s&&o.isMatrix3&&s.isMatrix3?o.copy(s):this[n]=s}}toJSON(t){const n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const s={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),n||(t.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==zy)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Dp:t.x=t.x-Math.floor(t.x);break;case Ka:t.x=t.x<0?0:1;break;case Up:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Dp:t.y=t.y-Math.floor(t.y);break;case Ka:t.y=t.y<0?0:1;break;case Up:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Kn.DEFAULT_IMAGE=null;Kn.DEFAULT_MAPPING=zy;Kn.DEFAULT_ANISOTROPY=1;const Ym=class Ym{constructor(t=0,n=0,s=0,o=1){this.x=t,this.y=n,this.z=s,this.w=o}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,s,o){return this.x=t,this.y=n,this.z=s,this.w=o,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const n=this.x,s=this.y,o=this.z,c=this.w,u=t.elements;return this.x=u[0]*n+u[4]*s+u[8]*o+u[12]*c,this.y=u[1]*n+u[5]*s+u[9]*o+u[13]*c,this.z=u[2]*n+u[6]*s+u[10]*o+u[14]*c,this.w=u[3]*n+u[7]*s+u[11]*o+u[15]*c,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,s,o,c;const m=t.elements,d=m[0],g=m[4],v=m[8],_=m[1],S=m[5],b=m[9],R=m[2],x=m[6],y=m[10];if(Math.abs(g-_)<.01&&Math.abs(v-R)<.01&&Math.abs(b-x)<.01){if(Math.abs(g+_)<.1&&Math.abs(v+R)<.1&&Math.abs(b+x)<.1&&Math.abs(d+S+y-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const z=(d+1)/2,C=(S+1)/2,L=(y+1)/2,D=(g+_)/4,B=(v+R)/4,T=(b+x)/4;return z>C&&z>L?z<.01?(s=0,o=.707106781,c=.707106781):(s=Math.sqrt(z),o=D/s,c=B/s):C>L?C<.01?(s=.707106781,o=0,c=.707106781):(o=Math.sqrt(C),s=D/o,c=T/o):L<.01?(s=.707106781,o=.707106781,c=0):(c=Math.sqrt(L),s=B/c,o=T/c),this.set(s,o,c,n),this}let P=Math.sqrt((x-b)*(x-b)+(v-R)*(v-R)+(_-g)*(_-g));return Math.abs(P)<.001&&(P=1),this.x=(x-b)/P,this.y=(v-R)/P,this.z=(_-g)/P,this.w=Math.acos((d+S+y-1)/2),this}setFromMatrixPosition(t){const n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=Le(this.x,t.x,n.x),this.y=Le(this.y,t.y,n.y),this.z=Le(this.z,t.z,n.z),this.w=Le(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=Le(this.x,t,n),this.y=Le(this.y,t,n),this.z=Le(this.z,t,n),this.w=Le(this.w,t,n),this}clampLength(t,n){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Le(s,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,s){return this.x=t.x+(n.x-t.x)*s,this.y=t.y+(n.y-t.y)*s,this.z=t.z+(n.z-t.z)*s,this.w=t.w+(n.w-t.w)*s,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ym.prototype.isVector4=!0;let bn=Ym;class cT extends Hs{constructor(t=1,n=1,s={}){super(),s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ti,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},s),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=s.depth,this.scissor=new bn(0,0,t,n),this.scissorTest=!1,this.viewport=new bn(0,0,t,n),this.textures=[];const o={width:t,height:n,depth:s.depth},c=new Kn(o),u=s.count;for(let h=0;h<u;h++)this.textures[h]=c.clone(),this.textures[h].isRenderTargetTexture=!0,this.textures[h].renderTarget=this;this._setTextureOptions(s),this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.resolveDepthBuffer=s.resolveDepthBuffer,this.resolveStencilBuffer=s.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=s.depthTexture,this.samples=s.samples,this.multiview=s.multiview,this.useArrayDepthTexture=s.useArrayDepthTexture}_setTextureOptions(t={}){const n={minFilter:ti,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let s=0;s<this.textures.length;s++)this.textures[s].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,s=1){if(this.width!==t||this.height!==n||this.depth!==s){this.width=t,this.height=n,this.depth=s;for(let o=0,c=this.textures.length;o<c;o++)this.textures[o].image.width=t,this.textures[o].image.height=n,this.textures[o].image.depth=s,this.textures[o].isData3DTexture!==!0&&(this.textures[o].isArrayTexture=this.textures[o].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;const o=Object.assign({},t.textures[n].image);this.textures[n].source=new Im(o)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class _i extends cT{constructor(t=1,n=1,s={}){super(t,n,s),this.isWebGLRenderTarget=!0}}class Wy extends Kn{constructor(t=null,n=1,s=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:s,depth:o},this.magFilter=Zn,this.minFilter=Zn,this.wrapR=Ka,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class uT extends Kn{constructor(t=null,n=1,s=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:s,depth:o},this.magFilter=Zn,this.minFilter=Zn,this.wrapR=Ka,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const cf=class cf{constructor(t,n,s,o,c,u,h,m,d,g,v,_,S,b,R,x){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,s,o,c,u,h,m,d,g,v,_,S,b,R,x)}set(t,n,s,o,c,u,h,m,d,g,v,_,S,b,R,x){const y=this.elements;return y[0]=t,y[4]=n,y[8]=s,y[12]=o,y[1]=c,y[5]=u,y[9]=h,y[13]=m,y[2]=d,y[6]=g,y[10]=v,y[14]=_,y[3]=S,y[7]=b,y[11]=R,y[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new cf().fromArray(this.elements)}copy(t){const n=this.elements,s=t.elements;return n[0]=s[0],n[1]=s[1],n[2]=s[2],n[3]=s[3],n[4]=s[4],n[5]=s[5],n[6]=s[6],n[7]=s[7],n[8]=s[8],n[9]=s[9],n[10]=s[10],n[11]=s[11],n[12]=s[12],n[13]=s[13],n[14]=s[14],n[15]=s[15],this}copyPosition(t){const n=this.elements,s=t.elements;return n[12]=s[12],n[13]=s[13],n[14]=s[14],this}setFromMatrix3(t){const n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,s){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),s.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this)}makeBasis(t,n,s){return this.set(t.x,n.x,s.x,0,t.y,n.y,s.y,0,t.z,n.z,s.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const n=this.elements,s=t.elements,o=1/Qr.setFromMatrixColumn(t,0).length(),c=1/Qr.setFromMatrixColumn(t,1).length(),u=1/Qr.setFromMatrixColumn(t,2).length();return n[0]=s[0]*o,n[1]=s[1]*o,n[2]=s[2]*o,n[3]=0,n[4]=s[4]*c,n[5]=s[5]*c,n[6]=s[6]*c,n[7]=0,n[8]=s[8]*u,n[9]=s[9]*u,n[10]=s[10]*u,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){const n=this.elements,s=t.x,o=t.y,c=t.z,u=Math.cos(s),h=Math.sin(s),m=Math.cos(o),d=Math.sin(o),g=Math.cos(c),v=Math.sin(c);if(t.order==="XYZ"){const _=u*g,S=u*v,b=h*g,R=h*v;n[0]=m*g,n[4]=-m*v,n[8]=d,n[1]=S+b*d,n[5]=_-R*d,n[9]=-h*m,n[2]=R-_*d,n[6]=b+S*d,n[10]=u*m}else if(t.order==="YXZ"){const _=m*g,S=m*v,b=d*g,R=d*v;n[0]=_+R*h,n[4]=b*h-S,n[8]=u*d,n[1]=u*v,n[5]=u*g,n[9]=-h,n[2]=S*h-b,n[6]=R+_*h,n[10]=u*m}else if(t.order==="ZXY"){const _=m*g,S=m*v,b=d*g,R=d*v;n[0]=_-R*h,n[4]=-u*v,n[8]=b+S*h,n[1]=S+b*h,n[5]=u*g,n[9]=R-_*h,n[2]=-u*d,n[6]=h,n[10]=u*m}else if(t.order==="ZYX"){const _=u*g,S=u*v,b=h*g,R=h*v;n[0]=m*g,n[4]=b*d-S,n[8]=_*d+R,n[1]=m*v,n[5]=R*d+_,n[9]=S*d-b,n[2]=-d,n[6]=h*m,n[10]=u*m}else if(t.order==="YZX"){const _=u*m,S=u*d,b=h*m,R=h*d;n[0]=m*g,n[4]=R-_*v,n[8]=b*v+S,n[1]=v,n[5]=u*g,n[9]=-h*g,n[2]=-d*g,n[6]=S*v+b,n[10]=_-R*v}else if(t.order==="XZY"){const _=u*m,S=u*d,b=h*m,R=h*d;n[0]=m*g,n[4]=-v,n[8]=d*g,n[1]=_*v+R,n[5]=u*g,n[9]=S*v-b,n[2]=b*v-S,n[6]=h*g,n[10]=R*v+_}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(fT,t,hT)}lookAt(t,n,s){const o=this.elements;return Ri.subVectors(t,n),Ri.lengthSq()===0&&(Ri.z=1),Ri.normalize(),Ts.crossVectors(s,Ri),Ts.lengthSq()===0&&(Math.abs(s.z)===1?Ri.x+=1e-4:Ri.z+=1e-4,Ri.normalize(),Ts.crossVectors(s,Ri)),Ts.normalize(),au.crossVectors(Ri,Ts),o[0]=Ts.x,o[4]=au.x,o[8]=Ri.x,o[1]=Ts.y,o[5]=au.y,o[9]=Ri.y,o[2]=Ts.z,o[6]=au.z,o[10]=Ri.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const s=t.elements,o=n.elements,c=this.elements,u=s[0],h=s[4],m=s[8],d=s[12],g=s[1],v=s[5],_=s[9],S=s[13],b=s[2],R=s[6],x=s[10],y=s[14],P=s[3],z=s[7],C=s[11],L=s[15],D=o[0],B=o[4],T=o[8],N=o[12],G=o[1],H=o[5],W=o[9],lt=o[13],ct=o[2],J=o[6],I=o[10],V=o[14],$=o[3],ft=o[7],bt=o[11],F=o[15];return c[0]=u*D+h*G+m*ct+d*$,c[4]=u*B+h*H+m*J+d*ft,c[8]=u*T+h*W+m*I+d*bt,c[12]=u*N+h*lt+m*V+d*F,c[1]=g*D+v*G+_*ct+S*$,c[5]=g*B+v*H+_*J+S*ft,c[9]=g*T+v*W+_*I+S*bt,c[13]=g*N+v*lt+_*V+S*F,c[2]=b*D+R*G+x*ct+y*$,c[6]=b*B+R*H+x*J+y*ft,c[10]=b*T+R*W+x*I+y*bt,c[14]=b*N+R*lt+x*V+y*F,c[3]=P*D+z*G+C*ct+L*$,c[7]=P*B+z*H+C*J+L*ft,c[11]=P*T+z*W+C*I+L*bt,c[15]=P*N+z*lt+C*V+L*F,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){const t=this.elements,n=t[0],s=t[4],o=t[8],c=t[12],u=t[1],h=t[5],m=t[9],d=t[13],g=t[2],v=t[6],_=t[10],S=t[14],b=t[3],R=t[7],x=t[11],y=t[15],P=m*S-d*_,z=h*S-d*v,C=h*_-m*v,L=u*S-d*g,D=u*_-m*g,B=u*v-h*g;return n*(R*P-x*z+y*C)-s*(b*P-x*L+y*D)+o*(b*z-R*L+y*B)-c*(b*C-R*D+x*B)}determinantAffine(){const t=this.elements,n=t[0],s=t[4],o=t[8],c=t[1],u=t[5],h=t[9],m=t[2],d=t[6],g=t[10];return n*(u*g-h*d)-s*(c*g-h*m)+o*(c*d-u*m)}transpose(){const t=this.elements;let n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,s){const o=this.elements;return t.isVector3?(o[12]=t.x,o[13]=t.y,o[14]=t.z):(o[12]=t,o[13]=n,o[14]=s),this}invert(){const t=this.elements,n=t[0],s=t[1],o=t[2],c=t[3],u=t[4],h=t[5],m=t[6],d=t[7],g=t[8],v=t[9],_=t[10],S=t[11],b=t[12],R=t[13],x=t[14],y=t[15],P=n*h-s*u,z=n*m-o*u,C=n*d-c*u,L=s*m-o*h,D=s*d-c*h,B=o*d-c*m,T=g*R-v*b,N=g*x-_*b,G=g*y-S*b,H=v*x-_*R,W=v*y-S*R,lt=_*y-S*x,ct=P*lt-z*W+C*H+L*G-D*N+B*T;if(ct===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const J=1/ct;return t[0]=(h*lt-m*W+d*H)*J,t[1]=(o*W-s*lt-c*H)*J,t[2]=(R*B-x*D+y*L)*J,t[3]=(_*D-v*B-S*L)*J,t[4]=(m*G-u*lt-d*N)*J,t[5]=(n*lt-o*G+c*N)*J,t[6]=(x*C-b*B-y*z)*J,t[7]=(g*B-_*C+S*z)*J,t[8]=(u*W-h*G+d*T)*J,t[9]=(s*G-n*W-c*T)*J,t[10]=(b*D-R*C+y*P)*J,t[11]=(v*C-g*D-S*P)*J,t[12]=(h*N-u*H-m*T)*J,t[13]=(n*H-s*N+o*T)*J,t[14]=(R*z-b*L-x*P)*J,t[15]=(g*L-v*z+_*P)*J,this}scale(t){const n=this.elements,s=t.x,o=t.y,c=t.z;return n[0]*=s,n[4]*=o,n[8]*=c,n[1]*=s,n[5]*=o,n[9]*=c,n[2]*=s,n[6]*=o,n[10]*=c,n[3]*=s,n[7]*=o,n[11]*=c,this}getMaxScaleOnAxis(){const t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],s=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],o=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,s,o))}makeTranslation(t,n,s){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,s,0,0,0,1),this}makeRotationX(t){const n=Math.cos(t),s=Math.sin(t);return this.set(1,0,0,0,0,n,-s,0,0,s,n,0,0,0,0,1),this}makeRotationY(t){const n=Math.cos(t),s=Math.sin(t);return this.set(n,0,s,0,0,1,0,0,-s,0,n,0,0,0,0,1),this}makeRotationZ(t){const n=Math.cos(t),s=Math.sin(t);return this.set(n,-s,0,0,s,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){const s=Math.cos(n),o=Math.sin(n),c=1-s,u=t.x,h=t.y,m=t.z,d=c*u,g=c*h;return this.set(d*u+s,d*h-o*m,d*m+o*h,0,d*h+o*m,g*h+s,g*m-o*u,0,d*m-o*h,g*m+o*u,c*m*m+s,0,0,0,0,1),this}makeScale(t,n,s){return this.set(t,0,0,0,0,n,0,0,0,0,s,0,0,0,0,1),this}makeShear(t,n,s,o,c,u){return this.set(1,s,c,0,t,1,u,0,n,o,1,0,0,0,0,1),this}compose(t,n,s){const o=this.elements,c=n._x,u=n._y,h=n._z,m=n._w,d=c+c,g=u+u,v=h+h,_=c*d,S=c*g,b=c*v,R=u*g,x=u*v,y=h*v,P=m*d,z=m*g,C=m*v,L=s.x,D=s.y,B=s.z;return o[0]=(1-(R+y))*L,o[1]=(S+C)*L,o[2]=(b-z)*L,o[3]=0,o[4]=(S-C)*D,o[5]=(1-(_+y))*D,o[6]=(x+P)*D,o[7]=0,o[8]=(b+z)*B,o[9]=(x-P)*B,o[10]=(1-(_+R))*B,o[11]=0,o[12]=t.x,o[13]=t.y,o[14]=t.z,o[15]=1,this}decompose(t,n,s){const o=this.elements;t.x=o[12],t.y=o[13],t.z=o[14];const c=this.determinantAffine();if(c===0)return s.set(1,1,1),n.identity(),this;let u=Qr.set(o[0],o[1],o[2]).length();const h=Qr.set(o[4],o[5],o[6]).length(),m=Qr.set(o[8],o[9],o[10]).length();c<0&&(u=-u),ia.copy(this);const d=1/u,g=1/h,v=1/m;return ia.elements[0]*=d,ia.elements[1]*=d,ia.elements[2]*=d,ia.elements[4]*=g,ia.elements[5]*=g,ia.elements[6]*=g,ia.elements[8]*=v,ia.elements[9]*=v,ia.elements[10]*=v,n.setFromRotationMatrix(ia),s.x=u,s.y=h,s.z=m,this}makePerspective(t,n,s,o,c,u,h=ya,m=!1){const d=this.elements,g=2*c/(n-t),v=2*c/(s-o),_=(n+t)/(n-t),S=(s+o)/(s-o);let b,R;if(m)b=c/(u-c),R=u*c/(u-c);else if(h===ya)b=-(u+c)/(u-c),R=-2*u*c/(u-c);else if(h===nf)b=-u/(u-c),R=-u*c/(u-c);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+h);return d[0]=g,d[4]=0,d[8]=_,d[12]=0,d[1]=0,d[5]=v,d[9]=S,d[13]=0,d[2]=0,d[6]=0,d[10]=b,d[14]=R,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(t,n,s,o,c,u,h=ya,m=!1){const d=this.elements,g=2/(n-t),v=2/(s-o),_=-(n+t)/(n-t),S=-(s+o)/(s-o);let b,R;if(m)b=1/(u-c),R=u/(u-c);else if(h===ya)b=-2/(u-c),R=-(u+c)/(u-c);else if(h===nf)b=-1/(u-c),R=-c/(u-c);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+h);return d[0]=g,d[4]=0,d[8]=0,d[12]=_,d[1]=0,d[5]=v,d[9]=0,d[13]=S,d[2]=0,d[6]=0,d[10]=b,d[14]=R,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(t){const n=this.elements,s=t.elements;for(let o=0;o<16;o++)if(n[o]!==s[o])return!1;return!0}fromArray(t,n=0){for(let s=0;s<16;s++)this.elements[s]=t[s+n];return this}toArray(t=[],n=0){const s=this.elements;return t[n]=s[0],t[n+1]=s[1],t[n+2]=s[2],t[n+3]=s[3],t[n+4]=s[4],t[n+5]=s[5],t[n+6]=s[6],t[n+7]=s[7],t[n+8]=s[8],t[n+9]=s[9],t[n+10]=s[10],t[n+11]=s[11],t[n+12]=s[12],t[n+13]=s[13],t[n+14]=s[14],t[n+15]=s[15],t}};cf.prototype.isMatrix4=!0;let xn=cf;const Qr=new et,ia=new xn,fT=new et(0,0,0),hT=new et(1,1,1),Ts=new et,au=new et,Ri=new et,nx=new xn,ix=new Bs;class gr{constructor(t=0,n=0,s=0,o=gr.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=s,this._order=o}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,s,o=this._order){return this._x=t,this._y=n,this._z=s,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,s=!0){const o=t.elements,c=o[0],u=o[4],h=o[8],m=o[1],d=o[5],g=o[9],v=o[2],_=o[6],S=o[10];switch(n){case"XYZ":this._y=Math.asin(Le(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-g,S),this._z=Math.atan2(-u,c)):(this._x=Math.atan2(_,d),this._z=0);break;case"YXZ":this._x=Math.asin(-Le(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(h,S),this._z=Math.atan2(m,d)):(this._y=Math.atan2(-v,c),this._z=0);break;case"ZXY":this._x=Math.asin(Le(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(-v,S),this._z=Math.atan2(-u,d)):(this._y=0,this._z=Math.atan2(m,c));break;case"ZYX":this._y=Math.asin(-Le(v,-1,1)),Math.abs(v)<.9999999?(this._x=Math.atan2(_,S),this._z=Math.atan2(m,c)):(this._x=0,this._z=Math.atan2(-u,d));break;case"YZX":this._z=Math.asin(Le(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(-g,d),this._y=Math.atan2(-v,c)):(this._x=0,this._y=Math.atan2(h,S));break;case"XZY":this._z=Math.asin(-Le(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(_,d),this._y=Math.atan2(h,c)):(this._x=Math.atan2(-g,S),this._y=0);break;default:xe("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,s===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,s){return nx.makeRotationFromQuaternion(t),this.setFromRotationMatrix(nx,n,s)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return ix.setFromEuler(this),this.setFromQuaternion(ix,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}gr.DEFAULT_ORDER="XYZ";class qy{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let dT=0;const ax=new et,Jr=new Bs,Va=new xn,su=new et,yl=new et,pT=new et,mT=new Bs,sx=new et(1,0,0),rx=new et(0,1,0),ox=new et(0,0,1),lx={type:"added"},gT={type:"removed"},$r={type:"childadded",child:null},Vd={type:"childremoved",child:null};class ei extends Hs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dT++}),this.uuid=Fs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ei.DEFAULT_UP.clone();const t=new et,n=new gr,s=new Bs,o=new et(1,1,1);function c(){s.setFromEuler(n,!1)}function u(){n.setFromQuaternion(s,void 0,!1)}n._onChange(c),s._onChange(u),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new xn},normalMatrix:{value:new be}}),this.matrix=new xn,this.matrixWorld=new xn,this.matrixAutoUpdate=ei.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ei.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qy,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return Jr.setFromAxisAngle(t,n),this.quaternion.multiply(Jr),this}rotateOnWorldAxis(t,n){return Jr.setFromAxisAngle(t,n),this.quaternion.premultiply(Jr),this}rotateX(t){return this.rotateOnAxis(sx,t)}rotateY(t){return this.rotateOnAxis(rx,t)}rotateZ(t){return this.rotateOnAxis(ox,t)}translateOnAxis(t,n){return ax.copy(t).applyQuaternion(this.quaternion),this.position.add(ax.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(sx,t)}translateY(t){return this.translateOnAxis(rx,t)}translateZ(t){return this.translateOnAxis(ox,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Va.copy(this.matrixWorld).invert())}lookAt(t,n,s){t.isVector3?su.copy(t):su.set(t,n,s);const o=this.parent;this.updateWorldMatrix(!0,!1),yl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Va.lookAt(yl,su,this.up):Va.lookAt(su,yl,this.up),this.quaternion.setFromRotationMatrix(Va),o&&(Va.extractRotation(o.matrixWorld),Jr.setFromRotationMatrix(Va),this.quaternion.premultiply(Jr.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Be("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(lx),$r.child=t,this.dispatchEvent($r),$r.child=null):Be("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(gT),Vd.child=t,this.dispatchEvent(Vd),Vd.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Va.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Va.multiply(t.parent.matrixWorld)),t.applyMatrix4(Va),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(lx),$r.child=t,this.dispatchEvent($r),$r.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let s=0,o=this.children.length;s<o;s++){const u=this.children[s].getObjectByProperty(t,n);if(u!==void 0)return u}}getObjectsByProperty(t,n,s=[]){this[t]===n&&s.push(this);const o=this.children;for(let c=0,u=o.length;c<u;c++)o[c].getObjectsByProperty(t,n,s);return s}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yl,t,pT),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yl,mT,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(t){t(this);const n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].traverseVisible(t)}traverseAncestors(t){const n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const n=t.x,s=t.y,o=t.z,c=this.matrix.elements;c[12]+=n-c[0]*n-c[4]*s-c[8]*o,c[13]+=s-c[1]*n-c[5]*s-c[9]*o,c[14]+=o-c[2]*n-c[6]*s-c[10]*o}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].updateMatrixWorld(t)}updateWorldMatrix(t,n,s=!1){const o=this.parent;if(t===!0&&o!==null&&o.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||s)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,s=!0),n===!0){const c=this.children;for(let u=0,h=c.length;u<h;u++)c[u].updateWorldMatrix(!1,!0,s)}}toJSON(t){const n=t===void 0||typeof t=="string",s={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),this.static!==!1&&(o.static=this.static),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.pivot!==null&&(o.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(o.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(o.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.geometryInfo=this._geometryInfo.map(h=>({...h,boundingBox:h.boundingBox?h.boundingBox.toJSON():void 0,boundingSphere:h.boundingSphere?h.boundingSphere.toJSON():void 0})),o.instanceInfo=this._instanceInfo.map(h=>({...h})),o.availableInstanceIds=this._availableInstanceIds.slice(),o.availableGeometryIds=this._availableGeometryIds.slice(),o.nextIndexStart=this._nextIndexStart,o.nextVertexStart=this._nextVertexStart,o.geometryCount=this._geometryCount,o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.matricesTexture=this._matricesTexture.toJSON(t),o.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(o.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(o.boundingBox=this.boundingBox.toJSON()));function c(h,m){return h[m.uuid]===void 0&&(h[m.uuid]=m.toJSON(t)),m.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=c(t.geometries,this.geometry);const h=this.geometry.parameters;if(h!==void 0&&h.shapes!==void 0){const m=h.shapes;if(Array.isArray(m))for(let d=0,g=m.length;d<g;d++){const v=m[d];c(t.shapes,v)}else c(t.shapes,m)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(c(t.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const h=[];for(let m=0,d=this.material.length;m<d;m++)h.push(c(t.materials,this.material[m]));o.material=h}else o.material=c(t.materials,this.material);if(this.children.length>0){o.children=[];for(let h=0;h<this.children.length;h++)o.children.push(this.children[h].toJSON(t).object)}if(this.animations.length>0){o.animations=[];for(let h=0;h<this.animations.length;h++){const m=this.animations[h];o.animations.push(c(t.animations,m))}}if(n){const h=u(t.geometries),m=u(t.materials),d=u(t.textures),g=u(t.images),v=u(t.shapes),_=u(t.skeletons),S=u(t.animations),b=u(t.nodes);h.length>0&&(s.geometries=h),m.length>0&&(s.materials=m),d.length>0&&(s.textures=d),g.length>0&&(s.images=g),v.length>0&&(s.shapes=v),_.length>0&&(s.skeletons=_),S.length>0&&(s.animations=S),b.length>0&&(s.nodes=b)}return s.object=o,s;function u(h){const m=[];for(const d in h){const g=h[d];delete g.metadata,m.push(g)}return m}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let s=0;s<t.children.length;s++){const o=t.children[s];this.add(o.clone())}return this}}ei.DEFAULT_UP=new et(0,1,0);ei.DEFAULT_MATRIX_AUTO_UPDATE=!0;ei.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ru extends ei{constructor(){super(),this.isGroup=!0,this.type="Group"}}const _T={type:"move"};class kd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ru,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ru,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new et,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new et),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ru,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new et,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new et,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const n=this._hand;if(n)for(const s of t.hand.values())this._getHandJoint(n,s)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,s){let o=null,c=null,u=null;const h=this._targetRay,m=this._grip,d=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(d&&t.hand){u=!0;for(const R of t.hand.values()){const x=n.getJointPose(R,s),y=this._getHandJoint(d,R);x!==null&&(y.matrix.fromArray(x.transform.matrix),y.matrix.decompose(y.position,y.rotation,y.scale),y.matrixWorldNeedsUpdate=!0,y.jointRadius=x.radius),y.visible=x!==null}const g=d.joints["index-finger-tip"],v=d.joints["thumb-tip"],_=g.position.distanceTo(v.position),S=.02,b=.005;d.inputState.pinching&&_>S+b?(d.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!d.inputState.pinching&&_<=S-b&&(d.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else m!==null&&t.gripSpace&&(c=n.getPose(t.gripSpace,s),c!==null&&(m.matrix.fromArray(c.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,c.linearVelocity?(m.hasLinearVelocity=!0,m.linearVelocity.copy(c.linearVelocity)):m.hasLinearVelocity=!1,c.angularVelocity?(m.hasAngularVelocity=!0,m.angularVelocity.copy(c.angularVelocity)):m.hasAngularVelocity=!1,m.eventsEnabled&&m.dispatchEvent({type:"gripUpdated",data:t,target:this})));h!==null&&(o=n.getPose(t.targetRaySpace,s),o===null&&c!==null&&(o=c),o!==null&&(h.matrix.fromArray(o.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,o.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(o.linearVelocity)):h.hasLinearVelocity=!1,o.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(o.angularVelocity)):h.hasAngularVelocity=!1,this.dispatchEvent(_T)))}return h!==null&&(h.visible=o!==null),m!==null&&(m.visible=c!==null),d!==null&&(d.visible=u!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){const s=new ru;s.matrixAutoUpdate=!1,s.visible=!1,t.joints[n.jointName]=s,t.add(s)}return t.joints[n.jointName]}}const Yy={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},As={h:0,s:0,l:0},ou={h:0,s:0,l:0};function Xd(a,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?a+(t-a)*6*n:n<1/2?t:n<2/3?a+(t-a)*6*(2/3-n):a}class Ce{constructor(t,n,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,s)}set(t,n,s){if(n===void 0&&s===void 0){const o=t;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(t,n,s);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=oi){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ze.colorSpaceToWorking(this,n),this}setRGB(t,n,s,o=ze.workingColorSpace){return this.r=t,this.g=n,this.b=s,ze.colorSpaceToWorking(this,o),this}setHSL(t,n,s,o=ze.workingColorSpace){if(t=iT(t,1),n=Le(n,0,1),s=Le(s,0,1),n===0)this.r=this.g=this.b=s;else{const c=s<=.5?s*(1+n):s+n-s*n,u=2*s-c;this.r=Xd(u,c,t+1/3),this.g=Xd(u,c,t),this.b=Xd(u,c,t-1/3)}return ze.colorSpaceToWorking(this,o),this}setStyle(t,n=oi){function s(c){c!==void 0&&parseFloat(c)<1&&xe("Color: Alpha component of "+t+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(t)){let c;const u=o[1],h=o[2];switch(u){case"rgb":case"rgba":if(c=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return s(c[4]),this.setRGB(Math.min(255,parseInt(c[1],10))/255,Math.min(255,parseInt(c[2],10))/255,Math.min(255,parseInt(c[3],10))/255,n);if(c=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return s(c[4]),this.setRGB(Math.min(100,parseInt(c[1],10))/100,Math.min(100,parseInt(c[2],10))/100,Math.min(100,parseInt(c[3],10))/100,n);break;case"hsl":case"hsla":if(c=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return s(c[4]),this.setHSL(parseFloat(c[1])/360,parseFloat(c[2])/100,parseFloat(c[3])/100,n);break;default:xe("Color: Unknown color model "+t)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(t)){const c=o[1],u=c.length;if(u===3)return this.setRGB(parseInt(c.charAt(0),16)/15,parseInt(c.charAt(1),16)/15,parseInt(c.charAt(2),16)/15,n);if(u===6)return this.setHex(parseInt(c,16),n);xe("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=oi){const s=Yy[t.toLowerCase()];return s!==void 0?this.setHex(s,n):xe("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ja(t.r),this.g=ja(t.g),this.b=ja(t.b),this}copyLinearToSRGB(t){return this.r=xo(t.r),this.g=xo(t.g),this.b=xo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=oi){return ze.workingToColorSpace($n.copy(this),t),Math.round(Le($n.r*255,0,255))*65536+Math.round(Le($n.g*255,0,255))*256+Math.round(Le($n.b*255,0,255))}getHexString(t=oi){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=ze.workingColorSpace){ze.workingToColorSpace($n.copy(this),n);const s=$n.r,o=$n.g,c=$n.b,u=Math.max(s,o,c),h=Math.min(s,o,c);let m,d;const g=(h+u)/2;if(h===u)m=0,d=0;else{const v=u-h;switch(d=g<=.5?v/(u+h):v/(2-u-h),u){case s:m=(o-c)/v+(o<c?6:0);break;case o:m=(c-s)/v+2;break;case c:m=(s-o)/v+4;break}m/=6}return t.h=m,t.s=d,t.l=g,t}getRGB(t,n=ze.workingColorSpace){return ze.workingToColorSpace($n.copy(this),n),t.r=$n.r,t.g=$n.g,t.b=$n.b,t}getStyle(t=oi){ze.workingToColorSpace($n.copy(this),t);const n=$n.r,s=$n.g,o=$n.b;return t!==oi?`color(${t} ${n.toFixed(3)} ${s.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(s*255)},${Math.round(o*255)})`}offsetHSL(t,n,s){return this.getHSL(As),this.setHSL(As.h+t,As.s+n,As.l+s)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,s){return this.r=t.r+(n.r-t.r)*s,this.g=t.g+(n.g-t.g)*s,this.b=t.b+(n.b-t.b)*s,this}lerpHSL(t,n){this.getHSL(As),t.getHSL(ou);const s=Fd(As.h,ou.h,n),o=Fd(As.s,ou.s,n),c=Fd(As.l,ou.l,n);return this.setHSL(s,o,c),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const n=this.r,s=this.g,o=this.b,c=t.elements;return this.r=c[0]*n+c[3]*s+c[6]*o,this.g=c[1]*n+c[4]*s+c[7]*o,this.b=c[2]*n+c[5]*s+c[8]*o,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const $n=new Ce;Ce.NAMES=Yy;class vT extends ei{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gr,this.environmentIntensity=1,this.environmentRotation=new gr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}const aa=new et,ka=new et,Wd=new et,Xa=new et,to=new et,eo=new et,cx=new et,qd=new et,Yd=new et,Zd=new et,Kd=new bn,jd=new bn,Qd=new bn;class Yi{constructor(t=new et,n=new et,s=new et){this.a=t,this.b=n,this.c=s}static getNormal(t,n,s,o){o.subVectors(s,n),aa.subVectors(t,n),o.cross(aa);const c=o.lengthSq();return c>0?o.multiplyScalar(1/Math.sqrt(c)):o.set(0,0,0)}static getBarycoord(t,n,s,o,c){aa.subVectors(o,n),ka.subVectors(s,n),Wd.subVectors(t,n);const u=aa.dot(aa),h=aa.dot(ka),m=aa.dot(Wd),d=ka.dot(ka),g=ka.dot(Wd),v=u*d-h*h;if(v===0)return c.set(0,0,0),null;const _=1/v,S=(d*m-h*g)*_,b=(u*g-h*m)*_;return c.set(1-S-b,b,S)}static containsPoint(t,n,s,o){return this.getBarycoord(t,n,s,o,Xa)===null?!1:Xa.x>=0&&Xa.y>=0&&Xa.x+Xa.y<=1}static getInterpolation(t,n,s,o,c,u,h,m){return this.getBarycoord(t,n,s,o,Xa)===null?(m.x=0,m.y=0,"z"in m&&(m.z=0),"w"in m&&(m.w=0),null):(m.setScalar(0),m.addScaledVector(c,Xa.x),m.addScaledVector(u,Xa.y),m.addScaledVector(h,Xa.z),m)}static getInterpolatedAttribute(t,n,s,o,c,u){return Kd.setScalar(0),jd.setScalar(0),Qd.setScalar(0),Kd.fromBufferAttribute(t,n),jd.fromBufferAttribute(t,s),Qd.fromBufferAttribute(t,o),u.setScalar(0),u.addScaledVector(Kd,c.x),u.addScaledVector(jd,c.y),u.addScaledVector(Qd,c.z),u}static isFrontFacing(t,n,s,o){return aa.subVectors(s,n),ka.subVectors(t,n),aa.cross(ka).dot(o)<0}set(t,n,s){return this.a.copy(t),this.b.copy(n),this.c.copy(s),this}setFromPointsAndIndices(t,n,s,o){return this.a.copy(t[n]),this.b.copy(t[s]),this.c.copy(t[o]),this}setFromAttributeAndIndices(t,n,s,o){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,s),this.c.fromBufferAttribute(t,o),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return aa.subVectors(this.c,this.b),ka.subVectors(this.a,this.b),aa.cross(ka).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Yi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return Yi.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,s,o,c){return Yi.getInterpolation(t,this.a,this.b,this.c,n,s,o,c)}containsPoint(t){return Yi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Yi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){const s=this.a,o=this.b,c=this.c;let u,h;to.subVectors(o,s),eo.subVectors(c,s),qd.subVectors(t,s);const m=to.dot(qd),d=eo.dot(qd);if(m<=0&&d<=0)return n.copy(s);Yd.subVectors(t,o);const g=to.dot(Yd),v=eo.dot(Yd);if(g>=0&&v<=g)return n.copy(o);const _=m*v-g*d;if(_<=0&&m>=0&&g<=0)return u=m/(m-g),n.copy(s).addScaledVector(to,u);Zd.subVectors(t,c);const S=to.dot(Zd),b=eo.dot(Zd);if(b>=0&&S<=b)return n.copy(c);const R=S*d-m*b;if(R<=0&&d>=0&&b<=0)return h=d/(d-b),n.copy(s).addScaledVector(eo,h);const x=g*b-S*v;if(x<=0&&v-g>=0&&S-b>=0)return cx.subVectors(c,o),h=(v-g)/(v-g+(S-b)),n.copy(o).addScaledVector(cx,h);const y=1/(x+R+_);return u=R*y,h=_*y,n.copy(s).addScaledVector(to,u).addScaledVector(eo,h)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class Wl{constructor(t=new et(1/0,1/0,1/0),n=new et(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,s=t.length;n<s;n+=3)this.expandByPoint(sa.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,s=t.count;n<s;n++)this.expandByPoint(sa.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,s=t.length;n<s;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){const s=sa.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(s),this.max.copy(t).add(s),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);const s=t.geometry;if(s!==void 0){const c=s.getAttribute("position");if(n===!0&&c!==void 0&&t.isInstancedMesh!==!0)for(let u=0,h=c.count;u<h;u++)t.isMesh===!0?t.getVertexPosition(u,sa):sa.fromBufferAttribute(c,u),sa.applyMatrix4(t.matrixWorld),this.expandByPoint(sa);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),lu.copy(t.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),lu.copy(s.boundingBox)),lu.applyMatrix4(t.matrixWorld),this.union(lu)}const o=t.children;for(let c=0,u=o.length;c<u;c++)this.expandByObject(o[c],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,sa),sa.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,s;return t.normal.x>0?(n=t.normal.x*this.min.x,s=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,s=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,s+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,s+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,s+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,s+=t.normal.z*this.min.z),n<=-t.constant&&s>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Sl),cu.subVectors(this.max,Sl),no.subVectors(t.a,Sl),io.subVectors(t.b,Sl),ao.subVectors(t.c,Sl),Rs.subVectors(io,no),Cs.subVectors(ao,io),ar.subVectors(no,ao);let n=[0,-Rs.z,Rs.y,0,-Cs.z,Cs.y,0,-ar.z,ar.y,Rs.z,0,-Rs.x,Cs.z,0,-Cs.x,ar.z,0,-ar.x,-Rs.y,Rs.x,0,-Cs.y,Cs.x,0,-ar.y,ar.x,0];return!Jd(n,no,io,ao,cu)||(n=[1,0,0,0,1,0,0,0,1],!Jd(n,no,io,ao,cu))?!1:(uu.crossVectors(Rs,Cs),n=[uu.x,uu.y,uu.z],Jd(n,no,io,ao,cu))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,sa).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(sa).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Wa[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Wa[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Wa[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Wa[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Wa[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Wa[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Wa[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Wa[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Wa),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const Wa=[new et,new et,new et,new et,new et,new et,new et,new et],sa=new et,lu=new Wl,no=new et,io=new et,ao=new et,Rs=new et,Cs=new et,ar=new et,Sl=new et,cu=new et,uu=new et,sr=new et;function Jd(a,t,n,s,o){for(let c=0,u=a.length-3;c<=u;c+=3){sr.fromArray(a,c);const h=o.x*Math.abs(sr.x)+o.y*Math.abs(sr.y)+o.z*Math.abs(sr.z),m=t.dot(sr),d=n.dot(sr),g=s.dot(sr);if(Math.max(-Math.max(m,d,g),Math.min(m,d,g))>h)return!1}return!0}const Ln=new et,fu=new he;let xT=0;class Mn extends Hs{constructor(t,n,s=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:xT++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=s,this.usage=lm,this.updateRanges=[],this.gpuType=xa,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,s){t*=this.itemSize,s*=n.itemSize;for(let o=0,c=this.itemSize;o<c;o++)this.array[t+o]=n.array[s+o];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,s=this.count;n<s;n++)fu.fromBufferAttribute(this,n),fu.applyMatrix3(t),this.setXY(n,fu.x,fu.y);else if(this.itemSize===3)for(let n=0,s=this.count;n<s;n++)Ln.fromBufferAttribute(this,n),Ln.applyMatrix3(t),this.setXYZ(n,Ln.x,Ln.y,Ln.z);return this}applyMatrix4(t){for(let n=0,s=this.count;n<s;n++)Ln.fromBufferAttribute(this,n),Ln.applyMatrix4(t),this.setXYZ(n,Ln.x,Ln.y,Ln.z);return this}applyNormalMatrix(t){for(let n=0,s=this.count;n<s;n++)Ln.fromBufferAttribute(this,n),Ln.applyNormalMatrix(t),this.setXYZ(n,Ln.x,Ln.y,Ln.z);return this}transformDirection(t){for(let n=0,s=this.count;n<s;n++)Ln.fromBufferAttribute(this,n),Ln.transformDirection(t),this.setXYZ(n,Ln.x,Ln.y,Ln.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let s=this.array[t*this.itemSize+n];return this.normalized&&(s=va(s,this.array)),s}setComponent(t,n,s){return this.normalized&&(s=rn(s,this.array)),this.array[t*this.itemSize+n]=s,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=va(n,this.array)),n}setX(t,n){return this.normalized&&(n=rn(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=va(n,this.array)),n}setY(t,n){return this.normalized&&(n=rn(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=va(n,this.array)),n}setZ(t,n){return this.normalized&&(n=rn(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=va(n,this.array)),n}setW(t,n){return this.normalized&&(n=rn(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,s){return t*=this.itemSize,this.normalized&&(n=rn(n,this.array),s=rn(s,this.array)),this.array[t+0]=n,this.array[t+1]=s,this}setXYZ(t,n,s,o){return t*=this.itemSize,this.normalized&&(n=rn(n,this.array),s=rn(s,this.array),o=rn(o,this.array)),this.array[t+0]=n,this.array[t+1]=s,this.array[t+2]=o,this}setXYZW(t,n,s,o,c){return t*=this.itemSize,this.normalized&&(n=rn(n,this.array),s=rn(s,this.array),o=rn(o,this.array),c=rn(c,this.array)),this.array[t+0]=n,this.array[t+1]=s,this.array[t+2]=o,this.array[t+3]=c,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==lm&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}}class Zy extends Mn{constructor(t,n,s){super(new Uint16Array(t),n,s)}}class Ky extends Mn{constructor(t,n,s){super(new Uint32Array(t),n,s)}}class ci extends Mn{constructor(t,n,s){super(new Float32Array(t),n,s)}}const yT=new Wl,Ml=new et,$d=new et;class ql{constructor(t=new et,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){const s=this.center;n!==void 0?s.copy(n):yT.setFromPoints(t).getCenter(s);let o=0;for(let c=0,u=t.length;c<u;c++)o=Math.max(o,s.distanceToSquared(t[c]));return this.radius=Math.sqrt(o),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){const s=this.center.distanceToSquared(t);return n.copy(t),s>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ml.subVectors(t,this.center);const n=Ml.lengthSq();if(n>this.radius*this.radius){const s=Math.sqrt(n),o=(s-this.radius)*.5;this.center.addScaledVector(Ml,o/s),this.radius+=o}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):($d.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ml.copy(t.center).add($d)),this.expandByPoint(Ml.copy(t.center).sub($d))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let ST=0;const ki=new xn,tp=new ei,so=new et,Ci=new Wl,bl=new Wl,Vn=new et;class On extends Hs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ST++}),this.uuid=Fs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new($E(t)?Ky:Zy)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,s=0){this.groups.push({start:t,count:n,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const c=new be().getNormalMatrix(t);s.applyNormalMatrix(c),s.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(t),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ki.makeRotationFromQuaternion(t),this.applyMatrix4(ki),this}rotateX(t){return ki.makeRotationX(t),this.applyMatrix4(ki),this}rotateY(t){return ki.makeRotationY(t),this.applyMatrix4(ki),this}rotateZ(t){return ki.makeRotationZ(t),this.applyMatrix4(ki),this}translate(t,n,s){return ki.makeTranslation(t,n,s),this.applyMatrix4(ki),this}scale(t,n,s){return ki.makeScale(t,n,s),this.applyMatrix4(ki),this}lookAt(t){return tp.lookAt(t),tp.updateMatrix(),this.applyMatrix4(tp.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(so).negate(),this.translate(so.x,so.y,so.z),this}setFromPoints(t){const n=this.getAttribute("position");if(n===void 0){const s=[];for(let o=0,c=t.length;o<c;o++){const u=t[o];s.push(u.x,u.y,u.z||0)}this.setAttribute("position",new ci(s,3))}else{const s=Math.min(t.length,n.count);for(let o=0;o<s;o++){const c=t[o];n.setXYZ(o,c.x,c.y,c.z||0)}t.length>n.count&&xe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wl);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Be("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new et(-1/0,-1/0,-1/0),new et(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let s=0,o=n.length;s<o;s++){const c=n[s];Ci.setFromBufferAttribute(c),this.morphTargetsRelative?(Vn.addVectors(this.boundingBox.min,Ci.min),this.boundingBox.expandByPoint(Vn),Vn.addVectors(this.boundingBox.max,Ci.max),this.boundingBox.expandByPoint(Vn)):(this.boundingBox.expandByPoint(Ci.min),this.boundingBox.expandByPoint(Ci.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Be('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ql);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Be("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new et,1/0);return}if(t){const s=this.boundingSphere.center;if(Ci.setFromBufferAttribute(t),n)for(let c=0,u=n.length;c<u;c++){const h=n[c];bl.setFromBufferAttribute(h),this.morphTargetsRelative?(Vn.addVectors(Ci.min,bl.min),Ci.expandByPoint(Vn),Vn.addVectors(Ci.max,bl.max),Ci.expandByPoint(Vn)):(Ci.expandByPoint(bl.min),Ci.expandByPoint(bl.max))}Ci.getCenter(s);let o=0;for(let c=0,u=t.count;c<u;c++)Vn.fromBufferAttribute(t,c),o=Math.max(o,s.distanceToSquared(Vn));if(n)for(let c=0,u=n.length;c<u;c++){const h=n[c],m=this.morphTargetsRelative;for(let d=0,g=h.count;d<g;d++)Vn.fromBufferAttribute(h,d),m&&(so.fromBufferAttribute(t,d),Vn.add(so)),o=Math.max(o,s.distanceToSquared(Vn))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&Be('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Be("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=n.position,o=n.normal,c=n.uv;let u=this.getAttribute("tangent");(u===void 0||u.count!==s.count)&&(u=new Mn(new Float32Array(4*s.count),4),this.setAttribute("tangent",u));const h=[],m=[];for(let T=0;T<s.count;T++)h[T]=new et,m[T]=new et;const d=new et,g=new et,v=new et,_=new he,S=new he,b=new he,R=new et,x=new et;function y(T,N,G){d.fromBufferAttribute(s,T),g.fromBufferAttribute(s,N),v.fromBufferAttribute(s,G),_.fromBufferAttribute(c,T),S.fromBufferAttribute(c,N),b.fromBufferAttribute(c,G),g.sub(d),v.sub(d),S.sub(_),b.sub(_);const H=1/(S.x*b.y-b.x*S.y);isFinite(H)&&(R.copy(g).multiplyScalar(b.y).addScaledVector(v,-S.y).multiplyScalar(H),x.copy(v).multiplyScalar(S.x).addScaledVector(g,-b.x).multiplyScalar(H),h[T].add(R),h[N].add(R),h[G].add(R),m[T].add(x),m[N].add(x),m[G].add(x))}let P=this.groups;P.length===0&&(P=[{start:0,count:t.count}]);for(let T=0,N=P.length;T<N;++T){const G=P[T],H=G.start,W=G.count;for(let lt=H,ct=H+W;lt<ct;lt+=3)y(t.getX(lt+0),t.getX(lt+1),t.getX(lt+2))}const z=new et,C=new et,L=new et,D=new et;function B(T){L.fromBufferAttribute(o,T),D.copy(L);const N=h[T];z.copy(N),z.sub(L.multiplyScalar(L.dot(N))).normalize(),C.crossVectors(D,N);const H=C.dot(m[T])<0?-1:1;u.setXYZW(T,z.x,z.y,z.z,H)}for(let T=0,N=P.length;T<N;++T){const G=P[T],H=G.start,W=G.count;for(let lt=H,ct=H+W;lt<ct;lt+=3)B(t.getX(lt+0)),B(t.getX(lt+1)),B(t.getX(lt+2))}this._transformed=!0}computeVertexNormals(){const t=this.index,n=this.getAttribute("position");if(n!==void 0){let s=this.getAttribute("normal");if(s===void 0||s.count!==n.count)s=new Mn(new Float32Array(n.count*3),3),this.setAttribute("normal",s);else for(let _=0,S=s.count;_<S;_++)s.setXYZ(_,0,0,0);const o=new et,c=new et,u=new et,h=new et,m=new et,d=new et,g=new et,v=new et;if(t)for(let _=0,S=t.count;_<S;_+=3){const b=t.getX(_+0),R=t.getX(_+1),x=t.getX(_+2);o.fromBufferAttribute(n,b),c.fromBufferAttribute(n,R),u.fromBufferAttribute(n,x),g.subVectors(u,c),v.subVectors(o,c),g.cross(v),h.fromBufferAttribute(s,b),m.fromBufferAttribute(s,R),d.fromBufferAttribute(s,x),h.add(g),m.add(g),d.add(g),s.setXYZ(b,h.x,h.y,h.z),s.setXYZ(R,m.x,m.y,m.z),s.setXYZ(x,d.x,d.y,d.z)}else for(let _=0,S=n.count;_<S;_+=3)o.fromBufferAttribute(n,_+0),c.fromBufferAttribute(n,_+1),u.fromBufferAttribute(n,_+2),g.subVectors(u,c),v.subVectors(o,c),g.cross(v),s.setXYZ(_+0,g.x,g.y,g.z),s.setXYZ(_+1,g.x,g.y,g.z),s.setXYZ(_+2,g.x,g.y,g.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let n=0,s=t.count;n<s;n++)Vn.fromBufferAttribute(t,n),Vn.normalize(),t.setXYZ(n,Vn.x,Vn.y,Vn.z)}toNonIndexed(){function t(h,m){const d=h.array,g=h.itemSize,v=h.normalized,_=new d.constructor(m.length*g);let S=0,b=0;for(let R=0,x=m.length;R<x;R++){h.isInterleavedBufferAttribute?S=m[R]*h.data.stride+h.offset:S=m[R]*g;for(let y=0;y<g;y++)_[b++]=d[S++]}return new Mn(_,g,v)}if(this.index===null)return xe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new On,s=this.index.array,o=this.attributes;for(const h in o){const m=o[h],d=t(m,s);n.setAttribute(h,d)}const c=this.morphAttributes;for(const h in c){const m=[],d=c[h];for(let g=0,v=d.length;g<v;g++){const _=d[g],S=t(_,s);m.push(S)}n.morphAttributes[h]=m}n.morphTargetsRelative=this.morphTargetsRelative;const u=this.groups;for(let h=0,m=u.length;h<m;h++){const d=u[h];n.addGroup(d.start,d.count,d.materialIndex)}return n}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const m=this.parameters;for(const d in m)m[d]!==void 0&&(t[d]=m[d]);return t}t.data={attributes:{}};const n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const s=this.attributes;for(const m in s){const d=s[m];t.data.attributes[m]=d.toJSON(t.data)}const o={};let c=!1;for(const m in this.morphAttributes){const d=this.morphAttributes[m],g=[];for(let v=0,_=d.length;v<_;v++){const S=d[v];g.push(S.toJSON(t.data))}g.length>0&&(o[m]=g,c=!0)}c&&(t.data.morphAttributes=o,t.data.morphTargetsRelative=this.morphTargetsRelative);const u=this.groups;u.length>0&&(t.data.groups=JSON.parse(JSON.stringify(u)));const h=this.boundingSphere;return h!==null&&(t.data.boundingSphere=h.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=t.name;const s=t.index;s!==null&&this.setIndex(s.clone());const o=t.attributes;for(const d in o){const g=o[d];this.setAttribute(d,g.clone(n))}const c=t.morphAttributes;for(const d in c){const g=[],v=c[d];for(let _=0,S=v.length;_<S;_++)g.push(v[_].clone(n));this.morphAttributes[d]=g}this.morphTargetsRelative=t.morphTargetsRelative;const u=t.groups;for(let d=0,g=u.length;d<g;d++){const v=u[d];this.addGroup(v.start,v.count,v.materialIndex)}const h=t.boundingBox;h!==null&&(this.boundingBox=h.clone());const m=t.boundingSphere;return m!==null&&(this.boundingSphere=m.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class MT{constructor(t,n){this.isInterleavedBuffer=!0,this.array=t,this.stride=n,this.count=t!==void 0?t.length/n:0,this.usage=lm,this.updateRanges=[],this.version=0,this.uuid=Fs()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,n,s){t*=this.stride,s*=n.stride;for(let o=0,c=this.stride;o<c;o++)this.array[t+o]=n.array[s+o];return this}set(t,n=0){return this.array.set(t,n),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const n=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const si=new et;class sf{constructor(t,n,s,o=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=n,this.offset=s,this.normalized=o}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let n=0,s=this.data.count;n<s;n++)si.fromBufferAttribute(this,n),si.applyMatrix4(t),this.setXYZ(n,si.x,si.y,si.z);return this}applyNormalMatrix(t){for(let n=0,s=this.count;n<s;n++)si.fromBufferAttribute(this,n),si.applyNormalMatrix(t),this.setXYZ(n,si.x,si.y,si.z);return this}transformDirection(t){for(let n=0,s=this.count;n<s;n++)si.fromBufferAttribute(this,n),si.transformDirection(t),this.setXYZ(n,si.x,si.y,si.z);return this}getComponent(t,n){let s=this.array[t*this.data.stride+this.offset+n];return this.normalized&&(s=va(s,this.array)),s}setComponent(t,n,s){return this.normalized&&(s=rn(s,this.array)),this.data.array[t*this.data.stride+this.offset+n]=s,this}setX(t,n){return this.normalized&&(n=rn(n,this.array)),this.data.array[t*this.data.stride+this.offset]=n,this}setY(t,n){return this.normalized&&(n=rn(n,this.array)),this.data.array[t*this.data.stride+this.offset+1]=n,this}setZ(t,n){return this.normalized&&(n=rn(n,this.array)),this.data.array[t*this.data.stride+this.offset+2]=n,this}setW(t,n){return this.normalized&&(n=rn(n,this.array)),this.data.array[t*this.data.stride+this.offset+3]=n,this}getX(t){let n=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(n=va(n,this.array)),n}getY(t){let n=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(n=va(n,this.array)),n}getZ(t){let n=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(n=va(n,this.array)),n}getW(t){let n=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(n=va(n,this.array)),n}setXY(t,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(n=rn(n,this.array),s=rn(s,this.array)),this.data.array[t+0]=n,this.data.array[t+1]=s,this}setXYZ(t,n,s,o){return t=t*this.data.stride+this.offset,this.normalized&&(n=rn(n,this.array),s=rn(s,this.array),o=rn(o,this.array)),this.data.array[t+0]=n,this.data.array[t+1]=s,this.data.array[t+2]=o,this}setXYZW(t,n,s,o,c){return t=t*this.data.stride+this.offset,this.normalized&&(n=rn(n,this.array),s=rn(s,this.array),o=rn(o,this.array),c=rn(c,this.array)),this.data.array[t+0]=n,this.data.array[t+1]=s,this.data.array[t+2]=o,this.data.array[t+3]=c,this}clone(t){if(t===void 0){af("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const n=[];for(let s=0;s<this.count;s++){const o=s*this.data.stride+this.offset;for(let c=0;c<this.itemSize;c++)n.push(this.data.array[o+c])}return new Mn(new this.array.constructor(n),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new sf(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){af("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const n=[];for(let s=0;s<this.count;s++){const o=s*this.data.stride+this.offset;for(let c=0;c<this.itemSize;c++)n.push(this.data.array[o+c])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let bT=0;class _r extends Hs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:bT++}),this.uuid=Fs(),this.name="",this.type="Material",this.blending=_o,this.side=Is,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Sp,this.blendDst=Mp,this.blendEquation=lr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=yo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jv,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Kr,this.stencilZFail=Kr,this.stencilZPass=Kr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const n in t){const s=t[n];if(s===void 0){xe(`Material: parameter '${n}' has value of undefined.`);continue}const o=this[n];if(o===void 0){xe(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(s):o&&o.isVector2&&s&&s.isVector2||o&&o.isEuler&&s&&s.isEuler||o&&o.isVector3&&s&&s.isVector3?o.copy(s):this[n]=s}}toJSON(t){const n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});const s={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(s.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(s.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(t).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(t).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(t).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(t).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(t).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.shadowSide!==null&&(s.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),this.blending!==_o&&(s.blending=this.blending),this.side!==Is&&(s.side=this.side),this.vertexColors===!0&&(s.vertexColors=!0),this.opacity<1&&(s.opacity=this.opacity),this.transparent===!0&&(s.transparent=!0),this.blendSrc!==Sp&&(s.blendSrc=this.blendSrc),this.blendDst!==Mp&&(s.blendDst=this.blendDst),this.blendEquation!==lr&&(s.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(s.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(s.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(s.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(s.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(s.blendAlpha=this.blendAlpha),this.depthFunc!==yo&&(s.depthFunc=this.depthFunc),this.depthTest===!1&&(s.depthTest=this.depthTest),this.depthWrite===!1&&(s.depthWrite=this.depthWrite),this.colorWrite===!1&&(s.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(s.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jv&&(s.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(s.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(s.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Kr&&(s.stencilFail=this.stencilFail),this.stencilZFail!==Kr&&(s.stencilZFail=this.stencilZFail),this.stencilZPass!==Kr&&(s.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(s.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(s.rotation=this.rotation),this.polygonOffset===!0&&(s.polygonOffset=!0),this.polygonOffsetFactor!==0&&(s.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(s.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(s.linewidth=this.linewidth),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.dithering===!0&&(s.dithering=!0),this.alphaTest>0&&(s.alphaTest=this.alphaTest),this.alphaHash===!0&&(s.alphaHash=!0),this.alphaToCoverage===!0&&(s.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(s.premultipliedAlpha=!0),this.forceSinglePass===!0&&(s.forceSinglePass=!0),this.allowOverride===!1&&(s.allowOverride=!1),this.wireframe===!0&&(s.wireframe=!0),this.wireframeLinewidth>1&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(s.flatShading=!0),this.visible===!1&&(s.visible=!1),this.toneMapped===!1&&(s.toneMapped=!1),this.fog===!1&&(s.fog=!1),Object.keys(this.userData).length>0&&(s.userData=this.userData);function o(c){const u=[];for(const h in c){const m=c[h];delete m.metadata,u.push(m)}return u}if(n){const c=o(t.textures),u=o(t.images);c.length>0&&(s.textures=c),u.length>0&&(s.images=u)}return s}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ce().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let s=t.normalScale;Array.isArray(s)===!1&&(s=[s,s]),this.normalScale=new he().fromArray(s)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new he().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const n=t.clippingPlanes;let s=null;if(n!==null){const o=n.length;s=new Array(o);for(let c=0;c!==o;++c)s[c]=n[c].clone()}return this.clippingPlanes=s,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class jy extends _r{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let ro;const El=new et,oo=new et,lo=new et,co=new he,Tl=new he,Qy=new xn,hu=new et,Al=new et,du=new et,ux=new he,ep=new he,fx=new he;class hx extends ei{constructor(t=new jy){if(super(),this.isSprite=!0,this.type="Sprite",ro===void 0){ro=new On;const n=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),s=new MT(n,5);ro.setIndex([0,1,2,0,2,3]),ro.setAttribute("position",new sf(s,3,0,!1)),ro.setAttribute("uv",new sf(s,2,3,!1))}this.geometry=ro,this.material=t,this.center=new he(.5,.5),this.count=1}raycast(t,n){t.camera===null&&Be('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),oo.setFromMatrixScale(this.matrixWorld),Qy.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),lo.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&oo.multiplyScalar(-lo.z);const s=this.material.rotation;let o,c;s!==0&&(c=Math.cos(s),o=Math.sin(s));const u=this.center;pu(hu.set(-.5,-.5,0),lo,u,oo,o,c),pu(Al.set(.5,-.5,0),lo,u,oo,o,c),pu(du.set(.5,.5,0),lo,u,oo,o,c),ux.set(0,0),ep.set(1,0),fx.set(1,1);let h=t.ray.intersectTriangle(hu,Al,du,!1,El);if(h===null&&(pu(Al.set(-.5,.5,0),lo,u,oo,o,c),ep.set(0,1),h=t.ray.intersectTriangle(hu,du,Al,!1,El),h===null))return;const m=t.ray.origin.distanceTo(El);m<t.near||m>t.far||n.push({distance:m,point:El.clone(),uv:Yi.getInterpolation(El,hu,Al,du,ux,ep,fx,new he),face:null,object:this})}copy(t,n){return super.copy(t,n),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function pu(a,t,n,s,o,c){co.subVectors(a,n).addScalar(.5).multiply(s),o!==void 0?(Tl.x=c*co.x-o*co.y,Tl.y=o*co.x+c*co.y):Tl.copy(co),a.copy(t),a.x+=Tl.x,a.y+=Tl.y,a.applyMatrix4(Qy)}const qa=new et,np=new et,mu=new et,ws=new et,ip=new et,gu=new et,ap=new et;class gf{constructor(t=new et,n=new et(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,qa)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);const s=n.dot(this.direction);return s<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const n=qa.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(qa.copy(this.origin).addScaledVector(this.direction,n),qa.distanceToSquared(t))}distanceSqToSegment(t,n,s,o){np.copy(t).add(n).multiplyScalar(.5),mu.copy(n).sub(t).normalize(),ws.copy(this.origin).sub(np);const c=t.distanceTo(n)*.5,u=-this.direction.dot(mu),h=ws.dot(this.direction),m=-ws.dot(mu),d=ws.lengthSq(),g=Math.abs(1-u*u);let v,_,S,b;if(g>0)if(v=u*m-h,_=u*h-m,b=c*g,v>=0)if(_>=-b)if(_<=b){const R=1/g;v*=R,_*=R,S=v*(v+u*_+2*h)+_*(u*v+_+2*m)+d}else _=c,v=Math.max(0,-(u*_+h)),S=-v*v+_*(_+2*m)+d;else _=-c,v=Math.max(0,-(u*_+h)),S=-v*v+_*(_+2*m)+d;else _<=-b?(v=Math.max(0,-(-u*c+h)),_=v>0?-c:Math.min(Math.max(-c,-m),c),S=-v*v+_*(_+2*m)+d):_<=b?(v=0,_=Math.min(Math.max(-c,-m),c),S=_*(_+2*m)+d):(v=Math.max(0,-(u*c+h)),_=v>0?c:Math.min(Math.max(-c,-m),c),S=-v*v+_*(_+2*m)+d);else _=u>0?-c:c,v=Math.max(0,-(u*_+h)),S=-v*v+_*(_+2*m)+d;return s&&s.copy(this.origin).addScaledVector(this.direction,v),o&&o.copy(np).addScaledVector(mu,_),S}intersectSphere(t,n){qa.subVectors(t.center,this.origin);const s=qa.dot(this.direction),o=qa.dot(qa)-s*s,c=t.radius*t.radius;if(o>c)return null;const u=Math.sqrt(c-o),h=s-u,m=s+u;return m<0?null:h<0?this.at(m,n):this.at(h,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(t.normal)+t.constant)/n;return s>=0?s:null}intersectPlane(t,n){const s=this.distanceToPlane(t);return s===null?null:this.at(s,n)}intersectsPlane(t){const n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let s,o,c,u,h,m;const d=1/this.direction.x,g=1/this.direction.y,v=1/this.direction.z,_=this.origin;return d>=0?(s=(t.min.x-_.x)*d,o=(t.max.x-_.x)*d):(s=(t.max.x-_.x)*d,o=(t.min.x-_.x)*d),g>=0?(c=(t.min.y-_.y)*g,u=(t.max.y-_.y)*g):(c=(t.max.y-_.y)*g,u=(t.min.y-_.y)*g),s>u||c>o||((c>s||isNaN(s))&&(s=c),(u<o||isNaN(o))&&(o=u),v>=0?(h=(t.min.z-_.z)*v,m=(t.max.z-_.z)*v):(h=(t.max.z-_.z)*v,m=(t.min.z-_.z)*v),s>m||h>o)||((h>s||s!==s)&&(s=h),(m<o||o!==o)&&(o=m),o<0)?null:this.at(s>=0?s:o,n)}intersectsBox(t){return this.intersectBox(t,qa)!==null}intersectTriangle(t,n,s,o,c){ip.subVectors(n,t),gu.subVectors(s,t),ap.crossVectors(ip,gu);let u=this.direction.dot(ap),h;if(u>0){if(o)return null;h=1}else if(u<0)h=-1,u=-u;else return null;ws.subVectors(this.origin,t);const m=h*this.direction.dot(gu.crossVectors(ws,gu));if(m<0)return null;const d=h*this.direction.dot(ip.cross(ws));if(d<0||m+d>u)return null;const g=-h*ws.dot(ap);return g<0?null:this.at(g/u,c)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Bm extends _r{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gr,this.combine=Oy,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const dx=new xn,rr=new gf,_u=new ql,px=new et,vu=new et,xu=new et,yu=new et,sp=new et,Su=new et,mx=new et,Mu=new et;class Ui extends ei{constructor(t=new On,n=new Bm){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,s=Object.keys(n);if(s.length>0){const o=n[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,u=o.length;c<u;c++){const h=o[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}getVertexPosition(t,n){const s=this.geometry,o=s.attributes.position,c=s.morphAttributes.position,u=s.morphTargetsRelative;n.fromBufferAttribute(o,t);const h=this.morphTargetInfluences;if(c&&h){Su.set(0,0,0);for(let m=0,d=c.length;m<d;m++){const g=h[m],v=c[m];g!==0&&(sp.fromBufferAttribute(v,t),u?Su.addScaledVector(sp,g):Su.addScaledVector(sp.sub(n),g))}n.add(Su)}return n}raycast(t,n){const s=this.geometry,o=this.material,c=this.matrixWorld;o!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),_u.copy(s.boundingSphere),_u.applyMatrix4(c),rr.copy(t.ray).recast(t.near),!(_u.containsPoint(rr.origin)===!1&&(rr.intersectSphere(_u,px)===null||rr.origin.distanceToSquared(px)>(t.far-t.near)**2))&&(dx.copy(c).invert(),rr.copy(t.ray).applyMatrix4(dx),!(s.boundingBox!==null&&rr.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(t,n,rr)))}_computeIntersections(t,n,s){let o;const c=this.geometry,u=this.material,h=c.index,m=c.attributes.position,d=c.attributes.uv,g=c.attributes.uv1,v=c.attributes.normal,_=c.groups,S=c.drawRange;if(h!==null)if(Array.isArray(u))for(let b=0,R=_.length;b<R;b++){const x=_[b],y=u[x.materialIndex],P=Math.max(x.start,S.start),z=Math.min(h.count,Math.min(x.start+x.count,S.start+S.count));for(let C=P,L=z;C<L;C+=3){const D=h.getX(C),B=h.getX(C+1),T=h.getX(C+2);o=bu(this,y,t,s,d,g,v,D,B,T),o&&(o.faceIndex=Math.floor(C/3),o.face.materialIndex=x.materialIndex,n.push(o))}}else{const b=Math.max(0,S.start),R=Math.min(h.count,S.start+S.count);for(let x=b,y=R;x<y;x+=3){const P=h.getX(x),z=h.getX(x+1),C=h.getX(x+2);o=bu(this,u,t,s,d,g,v,P,z,C),o&&(o.faceIndex=Math.floor(x/3),n.push(o))}}else if(m!==void 0)if(Array.isArray(u))for(let b=0,R=_.length;b<R;b++){const x=_[b],y=u[x.materialIndex],P=Math.max(x.start,S.start),z=Math.min(m.count,Math.min(x.start+x.count,S.start+S.count));for(let C=P,L=z;C<L;C+=3){const D=C,B=C+1,T=C+2;o=bu(this,y,t,s,d,g,v,D,B,T),o&&(o.faceIndex=Math.floor(C/3),o.face.materialIndex=x.materialIndex,n.push(o))}}else{const b=Math.max(0,S.start),R=Math.min(m.count,S.start+S.count);for(let x=b,y=R;x<y;x+=3){const P=x,z=x+1,C=x+2;o=bu(this,u,t,s,d,g,v,P,z,C),o&&(o.faceIndex=Math.floor(x/3),n.push(o))}}}}function ET(a,t,n,s,o,c,u,h){let m;if(t.side===li?m=s.intersectTriangle(u,c,o,!0,h):m=s.intersectTriangle(o,c,u,t.side===Is,h),m===null)return null;Mu.copy(h),Mu.applyMatrix4(a.matrixWorld);const d=n.ray.origin.distanceTo(Mu);return d<n.near||d>n.far?null:{distance:d,point:Mu.clone(),object:a}}function bu(a,t,n,s,o,c,u,h,m,d){a.getVertexPosition(h,vu),a.getVertexPosition(m,xu),a.getVertexPosition(d,yu);const g=ET(a,t,n,s,vu,xu,yu,mx);if(g){const v=new et;Yi.getBarycoord(mx,vu,xu,yu,v),o&&(g.uv=Yi.getInterpolatedAttribute(o,h,m,d,v,new he)),c&&(g.uv1=Yi.getInterpolatedAttribute(c,h,m,d,v,new he)),u&&(g.normal=Yi.getInterpolatedAttribute(u,h,m,d,v,new et),g.normal.dot(s.direction)>0&&g.normal.multiplyScalar(-1));const _={a:h,b:m,c:d,normal:new et,materialIndex:0};Yi.getNormal(vu,xu,yu,_.normal),g.face=_,g.barycoord=v}return g}class TT extends Kn{constructor(t=null,n=1,s=1,o,c,u,h,m,d=Zn,g=Zn,v,_){super(null,u,h,m,d,g,o,c,v,_),this.isDataTexture=!0,this.image={data:t,width:n,height:s},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const rp=new et,AT=new et,RT=new be;class Ls{constructor(t=new et(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,s,o){return this.normal.set(t,n,s),this.constant=o,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,s){const o=rp.subVectors(s,n).cross(AT.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(o,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,s=!0){const o=t.delta(rp),c=this.normal.dot(o);if(c===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;const u=-(t.start.dot(this.normal)+this.constant)/c;return s===!0&&(u<0||u>1)?null:n.copy(t.start).addScaledVector(o,u)}intersectsLine(t){const n=this.distanceToPoint(t.start),s=this.distanceToPoint(t.end);return n<0&&s>0||s<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){const s=n||RT.getNormalMatrix(t),o=this.coplanarPoint(rp).applyMatrix4(t),c=this.normal.applyMatrix3(s).normalize();return this.constant=-o.dot(c),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const or=new ql,CT=new he(.5,.5),Eu=new et;class Jy{constructor(t=new Ls,n=new Ls,s=new Ls,o=new Ls,c=new Ls,u=new Ls){this.planes=[t,n,s,o,c,u]}set(t,n,s,o,c,u){const h=this.planes;return h[0].copy(t),h[1].copy(n),h[2].copy(s),h[3].copy(o),h[4].copy(c),h[5].copy(u),this}copy(t){const n=this.planes;for(let s=0;s<6;s++)n[s].copy(t.planes[s]);return this}setFromProjectionMatrix(t,n=ya,s=!1){const o=this.planes,c=t.elements,u=c[0],h=c[1],m=c[2],d=c[3],g=c[4],v=c[5],_=c[6],S=c[7],b=c[8],R=c[9],x=c[10],y=c[11],P=c[12],z=c[13],C=c[14],L=c[15];if(o[0].setComponents(d-u,S-g,y-b,L-P).normalize(),o[1].setComponents(d+u,S+g,y+b,L+P).normalize(),o[2].setComponents(d+h,S+v,y+R,L+z).normalize(),o[3].setComponents(d-h,S-v,y-R,L-z).normalize(),s)o[4].setComponents(m,_,x,C).normalize(),o[5].setComponents(d-m,S-_,y-x,L-C).normalize();else if(o[4].setComponents(d-m,S-_,y-x,L-C).normalize(),n===ya)o[5].setComponents(d+m,S+_,y+x,L+C).normalize();else if(n===nf)o[5].setComponents(m,_,x,C).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),or.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),or.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(or)}intersectsSprite(t){or.center.set(0,0,0);const n=CT.distanceTo(t.center);return or.radius=.7071067811865476+n,or.applyMatrix4(t.matrixWorld),this.intersectsSphere(or)}intersectsSphere(t){const n=this.planes,s=t.center,o=-t.radius;for(let c=0;c<6;c++)if(n[c].distanceToPoint(s)<o)return!1;return!0}intersectsBox(t){const n=this.planes;for(let s=0;s<6;s++){const o=n[s];if(Eu.x=o.normal.x>0?t.max.x:t.min.x,Eu.y=o.normal.y>0?t.max.y:t.min.y,Eu.z=o.normal.z>0?t.max.z:t.min.z,o.distanceToPoint(Eu)<0)return!1}return!0}containsPoint(t){const n=this.planes;for(let s=0;s<6;s++)if(n[s].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Yu extends _r{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const rf=new et,of=new et,gx=new xn,Rl=new gf,Tu=new ql,op=new et,_x=new et;class Au extends ei{constructor(t=new On,n=new Yu){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const n=t.attributes.position,s=[0];for(let o=1,c=n.count;o<c;o++)rf.fromBufferAttribute(n,o-1),of.fromBufferAttribute(n,o),s[o]=s[o-1],s[o]+=rf.distanceTo(of);t.setAttribute("lineDistance",new ci(s,1))}else xe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,n){const s=this.geometry,o=this.matrixWorld,c=t.params.Line.threshold,u=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),Tu.copy(s.boundingSphere),Tu.applyMatrix4(o),Tu.radius+=c,t.ray.intersectsSphere(Tu)===!1)return;gx.copy(o).invert(),Rl.copy(t.ray).applyMatrix4(gx);const h=c/((this.scale.x+this.scale.y+this.scale.z)/3),m=h*h,d=this.isLineSegments?2:1,g=s.index,_=s.attributes.position;if(g!==null){const S=Math.max(0,u.start),b=Math.min(g.count,u.start+u.count);for(let R=S,x=b-1;R<x;R+=d){const y=g.getX(R),P=g.getX(R+1),z=Ru(this,t,Rl,m,y,P,R);z&&n.push(z)}if(this.isLineLoop){const R=g.getX(b-1),x=g.getX(S),y=Ru(this,t,Rl,m,R,x,b-1);y&&n.push(y)}}else{const S=Math.max(0,u.start),b=Math.min(_.count,u.start+u.count);for(let R=S,x=b-1;R<x;R+=d){const y=Ru(this,t,Rl,m,R,R+1,R);y&&n.push(y)}if(this.isLineLoop){const R=Ru(this,t,Rl,m,b-1,S,b-1);R&&n.push(R)}}}updateMorphTargets(){const n=this.geometry.morphAttributes,s=Object.keys(n);if(s.length>0){const o=n[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,u=o.length;c<u;c++){const h=o[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}}function Ru(a,t,n,s,o,c,u){const h=a.geometry.attributes.position;if(rf.fromBufferAttribute(h,o),of.fromBufferAttribute(h,c),n.distanceSqToSegment(rf,of,op,_x)>s)return;op.applyMatrix4(a.matrixWorld);const d=t.ray.origin.distanceTo(op);if(!(d<t.near||d>t.far))return{distance:d,point:_x.clone().applyMatrix4(a.matrixWorld),index:u,face:null,faceIndex:null,barycoord:null,object:a}}class $y extends _r{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const vx=new xn,um=new gf,Cu=new ql,wu=new et;class lp extends ei{constructor(t=new On,n=new $y){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,n){const s=this.geometry,o=this.matrixWorld,c=t.params.Points.threshold,u=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),Cu.copy(s.boundingSphere),Cu.applyMatrix4(o),Cu.radius+=c,t.ray.intersectsSphere(Cu)===!1)return;vx.copy(o).invert(),um.copy(t.ray).applyMatrix4(vx);const h=c/((this.scale.x+this.scale.y+this.scale.z)/3),m=h*h,d=s.index,v=s.attributes.position;if(d!==null){const _=Math.max(0,u.start),S=Math.min(d.count,u.start+u.count);for(let b=_,R=S;b<R;b++){const x=d.getX(b);wu.fromBufferAttribute(v,x),xx(wu,x,m,o,t,n,this)}}else{const _=Math.max(0,u.start),S=Math.min(v.count,u.start+u.count);for(let b=_,R=S;b<R;b++)wu.fromBufferAttribute(v,b),xx(wu,b,m,o,t,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,s=Object.keys(n);if(s.length>0){const o=n[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,u=o.length;c<u;c++){const h=o[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}}function xx(a,t,n,s,o,c,u){const h=um.distanceSqToPoint(a);if(h<n){const m=new et;um.closestPointToPoint(a,m),m.applyMatrix4(s);const d=o.ray.origin.distanceTo(m);if(d<o.near||d>o.far)return;c.push({distance:d,distanceToRay:Math.sqrt(h),point:m,index:t,face:null,faceIndex:null,barycoord:null,object:u})}}class tS extends Kn{constructor(t=[],n=pr,s,o,c,u,h,m,d,g){super(t,n,s,o,c,u,h,m,d,g),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class wT extends Kn{constructor(t,n,s,o,c,u,h,m,d){super(t,n,s,o,c,u,h,m,d),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Mo extends Kn{constructor(t,n,s=Ea,o,c,u,h=Zn,m=Zn,d,g=Ja,v=1){if(g!==Ja&&g!==dr)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const _={width:t,height:n,depth:v};super(_,o,c,u,h,m,g,s,d),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Im(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const n=super.toJSON(t);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}class DT extends Mo{constructor(t,n=Ea,s=pr,o,c,u=Zn,h=Zn,m,d=Ja){const g={width:t,height:t,depth:1},v=[g,g,g,g,g,g];super(t,t,n,s,o,c,u,h,m,d),this.image=v,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class eS extends Kn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Yl extends On{constructor(t=1,n=1,s=1,o=1,c=1,u=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:s,widthSegments:o,heightSegments:c,depthSegments:u};const h=this;o=Math.floor(o),c=Math.floor(c),u=Math.floor(u);const m=[],d=[],g=[],v=[];let _=0,S=0;b("z","y","x",-1,-1,s,n,t,u,c,0),b("z","y","x",1,-1,s,n,-t,u,c,1),b("x","z","y",1,1,t,s,n,o,u,2),b("x","z","y",1,-1,t,s,-n,o,u,3),b("x","y","z",1,-1,t,n,s,o,c,4),b("x","y","z",-1,-1,t,n,-s,o,c,5),this.setIndex(m),this.setAttribute("position",new ci(d,3)),this.setAttribute("normal",new ci(g,3)),this.setAttribute("uv",new ci(v,2));function b(R,x,y,P,z,C,L,D,B,T,N){const G=C/B,H=L/T,W=C/2,lt=L/2,ct=D/2,J=B+1,I=T+1;let V=0,$=0;const ft=new et;for(let bt=0;bt<I;bt++){const F=bt*H-lt;for(let q=0;q<J;q++){const vt=q*G-W;ft[R]=vt*P,ft[x]=F*z,ft[y]=ct,d.push(ft.x,ft.y,ft.z),ft[R]=0,ft[x]=0,ft[y]=D>0?1:-1,g.push(ft.x,ft.y,ft.z),v.push(q/B),v.push(1-bt/T),V+=1}}for(let bt=0;bt<T;bt++)for(let F=0;F<B;F++){const q=_+F+J*bt,vt=_+F+J*(bt+1),Ct=_+(F+1)+J*(bt+1),Mt=_+(F+1)+J*bt;m.push(q,vt,Mt),m.push(vt,Ct,Mt),$+=6}h.addGroup(S,$,N),S+=$,_+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yl(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class _f extends On{constructor(t=1,n=1,s=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:s,heightSegments:o};const c=t/2,u=n/2,h=Math.floor(s),m=Math.floor(o),d=h+1,g=m+1,v=t/h,_=n/m,S=[],b=[],R=[],x=[];for(let y=0;y<g;y++){const P=y*_-u;for(let z=0;z<d;z++){const C=z*v-c;b.push(C,-P,0),R.push(0,0,1),x.push(z/h),x.push(1-y/m)}}for(let y=0;y<m;y++)for(let P=0;P<h;P++){const z=P+d*y,C=P+d*(y+1),L=P+1+d*(y+1),D=P+1+d*y;S.push(z,C,D),S.push(C,L,D)}this.setIndex(S),this.setAttribute("position",new ci(b,3)),this.setAttribute("normal",new ci(R,3)),this.setAttribute("uv",new ci(x,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new _f(t.width,t.height,t.widthSegments,t.heightSegments)}}class lf extends On{constructor(t=1,n=32,s=16,o=0,c=Math.PI*2,u=0,h=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:n,heightSegments:s,phiStart:o,phiLength:c,thetaStart:u,thetaLength:h},n=Math.max(3,Math.floor(n)),s=Math.max(2,Math.floor(s));const m=Math.min(u+h,Math.PI);let d=0;const g=[],v=new et,_=new et,S=[],b=[],R=[],x=[];for(let y=0;y<=s;y++){const P=[],z=y/s,C=u+z*h,L=t*Math.cos(C),D=Math.sqrt(t*t-L*L);let B=0;y===0&&u===0?B=.5/n:y===s&&m===Math.PI&&(B=-.5/n);for(let T=0;T<=n;T++){const N=T/n,G=o+N*c;v.x=-D*Math.cos(G),v.y=L,v.z=D*Math.sin(G),b.push(v.x,v.y,v.z),_.copy(v).normalize(),R.push(_.x,_.y,_.z),x.push(N+B,1-z),P.push(d++)}g.push(P)}for(let y=0;y<s;y++)for(let P=0;P<n;P++){const z=g[y][P+1],C=g[y][P],L=g[y+1][P],D=g[y+1][P+1];(y!==0||u>0)&&S.push(z,C,D),(y!==s-1||m<Math.PI)&&S.push(C,L,D)}this.setIndex(S),this.setAttribute("position",new ci(b,3)),this.setAttribute("normal",new ci(R,3)),this.setAttribute("uv",new ci(x,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new lf(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}function bo(a){const t={};for(const n in a){t[n]={};for(const s in a[n]){const o=a[n][s];if(yx(o))o.isRenderTargetTexture?(xe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][s]=null):t[n][s]=o.clone();else if(Array.isArray(o))if(yx(o[0])){const c=[];for(let u=0,h=o.length;u<h;u++)c[u]=o[u].clone();t[n][s]=c}else t[n][s]=o.slice();else t[n][s]=o}}return t}function ri(a){const t={};for(let n=0;n<a.length;n++){const s=bo(a[n]);for(const o in s)t[o]=s[o]}return t}function yx(a){return a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)}function UT(a){const t=[];for(let n=0;n<a.length;n++)t.push(a[n].clone());return t}function nS(a){const t=a.getRenderTarget();return t===null?a.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ze.workingColorSpace}const Gl={clone:bo,merge:ri};var LT=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,NT=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zn extends _r{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=LT,this.fragmentShader=NT,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=bo(t.uniforms),this.uniformsGroups=UT(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(const o in this.uniforms){const u=this.uniforms[o].value;u&&u.isTexture?n.uniforms[o]={type:"t",value:u.toJSON(t).uuid}:u&&u.isColor?n.uniforms[o]={type:"c",value:u.getHex()}:u&&u.isVector2?n.uniforms[o]={type:"v2",value:u.toArray()}:u&&u.isVector3?n.uniforms[o]={type:"v3",value:u.toArray()}:u&&u.isVector4?n.uniforms[o]={type:"v4",value:u.toArray()}:u&&u.isMatrix3?n.uniforms[o]={type:"m3",value:u.toArray()}:u&&u.isMatrix4?n.uniforms[o]={type:"m4",value:u.toArray()}:n.uniforms[o]={value:u}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const s={};for(const o in this.extensions)this.extensions[o]===!0&&(s[o]=!0);return Object.keys(s).length>0&&(n.extensions=s),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(const s in t.uniforms){const o=t.uniforms[s];switch(this.uniforms[s]={},o.type){case"t":this.uniforms[s].value=n[o.value]||null;break;case"c":this.uniforms[s].value=new Ce().setHex(o.value);break;case"v2":this.uniforms[s].value=new he().fromArray(o.value);break;case"v3":this.uniforms[s].value=new et().fromArray(o.value);break;case"v4":this.uniforms[s].value=new bn().fromArray(o.value);break;case"m3":this.uniforms[s].value=new be().fromArray(o.value);break;case"m4":this.uniforms[s].value=new xn().fromArray(o.value);break;default:this.uniforms[s].value=o.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const s in t.extensions)this.extensions[s]=t.extensions[s];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class iS extends zn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class PT extends _r{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=WE,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class OT extends _r{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const cp={enabled:!1,files:{},add:function(a,t){this.enabled!==!1&&(Sx(a)||(this.files[a]=t))},get:function(a){if(this.enabled!==!1&&!Sx(a))return this.files[a]},remove:function(a){delete this.files[a]},clear:function(){this.files={}}};function Sx(a){try{const t=a.slice(a.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}class zT{constructor(t,n,s){const o=this;let c=!1,u=0,h=0,m;const d=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=s,this._abortController=null,this.itemStart=function(g){h++,c===!1&&o.onStart!==void 0&&o.onStart(g,u,h),c=!0},this.itemEnd=function(g){u++,o.onProgress!==void 0&&o.onProgress(g,u,h),u===h&&(c=!1,o.onLoad!==void 0&&o.onLoad())},this.itemError=function(g){o.onError!==void 0&&o.onError(g)},this.resolveURL=function(g){return g=g.normalize("NFC"),m?m(g):g},this.setURLModifier=function(g){return m=g,this},this.addHandler=function(g,v){return d.push(g,v),this},this.removeHandler=function(g){const v=d.indexOf(g);return v!==-1&&d.splice(v,2),this},this.getHandler=function(g){for(let v=0,_=d.length;v<_;v+=2){const S=d[v],b=d[v+1];if(S.global&&(S.lastIndex=0),S.test(g))return b}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const FT=new zT;class Hm{constructor(t){this.manager=t!==void 0?t:FT,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){const s=this;return new Promise(function(o,c){s.load(t,o,n,c)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}}Hm.DEFAULT_MATERIAL_NAME="__DEFAULT";const uo=new WeakMap;class IT extends Hm{constructor(t){super(t)}load(t,n,s,o){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const c=this,u=cp.get(`image:${t}`);if(u!==void 0){if(u.complete===!0)c.manager.itemStart(t),setTimeout(function(){n&&n(u),c.manager.itemEnd(t)},0);else{let v=uo.get(u);v===void 0&&(v=[],uo.set(u,v)),v.push({onLoad:n,onError:o})}return u}const h=Hl("img");function m(){g(),n&&n(this);const v=uo.get(this)||[];for(let _=0;_<v.length;_++){const S=v[_];S.onLoad&&S.onLoad(this)}uo.delete(this),c.manager.itemEnd(t)}function d(v){g(),o&&o(v),cp.remove(`image:${t}`);const _=uo.get(this)||[];for(let S=0;S<_.length;S++){const b=_[S];b.onError&&b.onError(v)}uo.delete(this),c.manager.itemError(t),c.manager.itemEnd(t)}function g(){h.removeEventListener("load",m,!1),h.removeEventListener("error",d,!1)}return h.addEventListener("load",m,!1),h.addEventListener("error",d,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(h.crossOrigin=this.crossOrigin),cp.add(`image:${t}`,h),c.manager.itemStart(t),h.src=t,h}}class BT extends Hm{constructor(t){super(t)}load(t,n,s,o){const c=new Kn,u=new IT(this.manager);return u.setCrossOrigin(this.crossOrigin),u.setPath(this.path),u.load(t,function(h){c.image=h,c.needsUpdate=!0,n!==void 0&&n(c)},s,o),c}}const Du=new et,Uu=new Bs,ma=new et;class aS extends ei{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new xn,this.projectionMatrix=new xn,this.projectionMatrixInverse=new xn,this.coordinateSystem=ya,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Du,Uu,ma),ma.x===1&&ma.y===1&&ma.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Du,Uu,ma.set(1,1,1)).invert()}updateWorldMatrix(t,n,s=!1){super.updateWorldMatrix(t,n,s),this.matrixWorld.decompose(Du,Uu,ma),ma.x===1&&ma.y===1&&ma.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Du,Uu,ma.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ds=new et,Mx=new he,bx=new he;class Wi extends aS{constructor(t=50,n=1,s=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=s,this.far=o,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const n=.5*this.getFilmHeight()/t;this.fov=cm*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(qu*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return cm*2*Math.atan(Math.tan(qu*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,s){Ds.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ds.x,Ds.y).multiplyScalar(-t/Ds.z),Ds.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(Ds.x,Ds.y).multiplyScalar(-t/Ds.z)}getViewSize(t,n){return this.getViewBounds(t,Mx,bx),n.subVectors(bx,Mx)}setViewOffset(t,n,s,o,c,u){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=s,this.view.offsetY=o,this.view.width=c,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let n=t*Math.tan(qu*.5*this.fov)/this.zoom,s=2*n,o=this.aspect*s,c=-.5*o;const u=this.view;if(this.view!==null&&this.view.enabled){const m=u.fullWidth,d=u.fullHeight;c+=u.offsetX*o/m,n-=u.offsetY*s/d,o*=u.width/m,s*=u.height/d}const h=this.filmOffset;h!==0&&(c+=t*h/this.getFilmWidth()),this.projectionMatrix.makePerspective(c,c+o,n,n-s,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}class Gm extends aS{constructor(t=-1,n=1,s=1,o=-1,c=.1,u=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=s,this.bottom=o,this.near=c,this.far=u,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,s,o,c,u){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=s,this.view.offsetY=o,this.view.width=c,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let c=s-t,u=s+t,h=o+n,m=o-n;if(this.view!==null&&this.view.enabled){const d=(this.right-this.left)/this.view.fullWidth/this.zoom,g=(this.top-this.bottom)/this.view.fullHeight/this.zoom;c+=d*this.view.offsetX,u=c+d*this.view.width,h-=g*this.view.offsetY,m=h-g*this.view.height}this.projectionMatrix.makeOrthographic(c,u,h,m,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const fo=-90,ho=1;class HT extends ei{constructor(t,n,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new Wi(fo,ho,t,n);o.layers=this.layers,this.add(o);const c=new Wi(fo,ho,t,n);c.layers=this.layers,this.add(c);const u=new Wi(fo,ho,t,n);u.layers=this.layers,this.add(u);const h=new Wi(fo,ho,t,n);h.layers=this.layers,this.add(h);const m=new Wi(fo,ho,t,n);m.layers=this.layers,this.add(m);const d=new Wi(fo,ho,t,n);d.layers=this.layers,this.add(d)}updateCoordinateSystem(){const t=this.coordinateSystem,n=this.children.concat(),[s,o,c,u,h,m]=n;for(const d of n)this.remove(d);if(t===ya)s.up.set(0,1,0),s.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),c.up.set(0,0,-1),c.lookAt(0,1,0),u.up.set(0,0,1),u.lookAt(0,-1,0),h.up.set(0,1,0),h.lookAt(0,0,1),m.up.set(0,1,0),m.lookAt(0,0,-1);else if(t===nf)s.up.set(0,-1,0),s.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),c.up.set(0,0,1),c.lookAt(0,1,0),u.up.set(0,0,-1),u.lookAt(0,-1,0),h.up.set(0,-1,0),h.lookAt(0,0,1),m.up.set(0,-1,0),m.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const d of n)this.add(d),d.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:o}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[c,u,h,m,d,g]=this.children,v=t.getRenderTarget(),_=t.getActiveCubeFace(),S=t.getActiveMipmapLevel(),b=t.xr.enabled;t.xr.enabled=!1;const R=s.texture.generateMipmaps;s.texture.generateMipmaps=!1;let x=!1;t.isWebGLRenderer===!0?x=t.state.buffers.depth.getReversed():x=t.reversedDepthBuffer,t.setRenderTarget(s,0,o),x&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),t.setRenderTarget(s,1,o),x&&t.autoClear===!1&&t.clearDepth(),t.render(n,u),t.setRenderTarget(s,2,o),x&&t.autoClear===!1&&t.clearDepth(),t.render(n,h),t.setRenderTarget(s,3,o),x&&t.autoClear===!1&&t.clearDepth(),t.render(n,m),t.setRenderTarget(s,4,o),x&&t.autoClear===!1&&t.clearDepth(),t.render(n,d),s.texture.generateMipmaps=R,t.setRenderTarget(s,5,o),x&&t.autoClear===!1&&t.clearDepth(),t.render(n,g),t.setRenderTarget(v,_,S),t.xr.enabled=b,s.texture.needsPMREMUpdate=!0}}class GT extends Wi{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}class VT{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=kT.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function kT(){this._document.hidden===!1&&this.reset()}class Ex{constructor(t=1,n=0,s=0){this.radius=t,this.phi=n,this.theta=s}set(t,n,s){return this.radius=t,this.phi=n,this.theta=s,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Le(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,n,s){return this.radius=Math.sqrt(t*t+n*n+s*s),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,s),this.phi=Math.acos(Le(n/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Zm=class Zm{constructor(t,n,s,o){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,s,o)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let s=0;s<4;s++)this.elements[s]=t[s+n];return this}set(t,n,s,o){const c=this.elements;return c[0]=t,c[2]=n,c[1]=s,c[3]=o,this}};Zm.prototype.isMatrix2=!0;let Tx=Zm;class XT extends Hs{constructor(t,n=null){super(),this.object=t,this.domElement=n,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){xe("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function Ax(a,t,n,s){const o=WT(s);switch(n){case Gy:return a*t;case ky:return a*t/o.components*o.byteLength;case Nm:return a*t/o.components*o.byteLength;case mr:return a*t*2/o.components*o.byteLength;case Pm:return a*t*2/o.components*o.byteLength;case Vy:return a*t*3/o.components*o.byteLength;case oa:return a*t*4/o.components*o.byteLength;case Om:return a*t*4/o.components*o.byteLength;case Vu:case ku:return Math.floor((a+3)/4)*Math.floor((t+3)/4)*8;case Xu:case Wu:return Math.floor((a+3)/4)*Math.floor((t+3)/4)*16;case Np:case Op:return Math.max(a,16)*Math.max(t,8)/4;case Lp:case Pp:return Math.max(a,8)*Math.max(t,8)/2;case zp:case Fp:case Bp:case Hp:return Math.floor((a+3)/4)*Math.floor((t+3)/4)*8;case Ip:case Ju:case Gp:return Math.floor((a+3)/4)*Math.floor((t+3)/4)*16;case Vp:return Math.floor((a+3)/4)*Math.floor((t+3)/4)*16;case kp:return Math.floor((a+4)/5)*Math.floor((t+3)/4)*16;case Xp:return Math.floor((a+4)/5)*Math.floor((t+4)/5)*16;case Wp:return Math.floor((a+5)/6)*Math.floor((t+4)/5)*16;case qp:return Math.floor((a+5)/6)*Math.floor((t+5)/6)*16;case Yp:return Math.floor((a+7)/8)*Math.floor((t+4)/5)*16;case Zp:return Math.floor((a+7)/8)*Math.floor((t+5)/6)*16;case Kp:return Math.floor((a+7)/8)*Math.floor((t+7)/8)*16;case jp:return Math.floor((a+9)/10)*Math.floor((t+4)/5)*16;case Qp:return Math.floor((a+9)/10)*Math.floor((t+5)/6)*16;case Jp:return Math.floor((a+9)/10)*Math.floor((t+7)/8)*16;case $p:return Math.floor((a+9)/10)*Math.floor((t+9)/10)*16;case tm:return Math.floor((a+11)/12)*Math.floor((t+9)/10)*16;case em:return Math.floor((a+11)/12)*Math.floor((t+11)/12)*16;case nm:case im:case am:return Math.ceil(a/4)*Math.ceil(t/4)*16;case sm:case rm:return Math.ceil(a/4)*Math.ceil(t/4)*8;case $u:case om:return Math.ceil(a/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function WT(a){switch(a){case qi:case Fy:return{byteLength:1,components:1};case Il:case Iy:case Di:return{byteLength:2,components:1};case Um:case Lm:return{byteLength:2,components:4};case Ea:case Dm:case xa:return{byteLength:4,components:1};case By:case Hy:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${a}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Mm}}));typeof window<"u"&&(window.__THREE__?xe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Mm);function sS(){let a=null,t=!1,n=null,s=null;function o(c,u){n(c,u),s=a.requestAnimationFrame(o)}return{start:function(){t!==!0&&n!==null&&a!==null&&(s=a.requestAnimationFrame(o),t=!0)},stop:function(){a!==null&&a.cancelAnimationFrame(s),t=!1},setAnimationLoop:function(c){n=c},setContext:function(c){a=c}}}function qT(a){const t=new WeakMap;function n(h,m){const d=h.array,g=h.usage,v=d.byteLength,_=a.createBuffer();a.bindBuffer(m,_),a.bufferData(m,d,g),h.onUploadCallback();let S;if(d instanceof Float32Array)S=a.FLOAT;else if(typeof Float16Array<"u"&&d instanceof Float16Array)S=a.HALF_FLOAT;else if(d instanceof Uint16Array)h.isFloat16BufferAttribute?S=a.HALF_FLOAT:S=a.UNSIGNED_SHORT;else if(d instanceof Int16Array)S=a.SHORT;else if(d instanceof Uint32Array)S=a.UNSIGNED_INT;else if(d instanceof Int32Array)S=a.INT;else if(d instanceof Int8Array)S=a.BYTE;else if(d instanceof Uint8Array)S=a.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)S=a.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:_,type:S,bytesPerElement:d.BYTES_PER_ELEMENT,version:h.version,size:v}}function s(h,m,d){const g=m.array,v=m.updateRanges;if(a.bindBuffer(d,h),v.length===0)a.bufferSubData(d,0,g);else{v.sort((S,b)=>S.start-b.start);let _=0;for(let S=1;S<v.length;S++){const b=v[_],R=v[S];R.start<=b.start+b.count+1?b.count=Math.max(b.count,R.start+R.count-b.start):(++_,v[_]=R)}v.length=_+1;for(let S=0,b=v.length;S<b;S++){const R=v[S];a.bufferSubData(d,R.start*g.BYTES_PER_ELEMENT,g,R.start,R.count)}m.clearUpdateRanges()}m.onUploadCallback()}function o(h){return h.isInterleavedBufferAttribute&&(h=h.data),t.get(h)}function c(h){h.isInterleavedBufferAttribute&&(h=h.data);const m=t.get(h);m&&(a.deleteBuffer(m.buffer),t.delete(h))}function u(h,m){if(h.isInterleavedBufferAttribute&&(h=h.data),h.isGLBufferAttribute){const g=t.get(h);(!g||g.version<h.version)&&t.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}const d=t.get(h);if(d===void 0)t.set(h,n(h,m));else if(d.version<h.version){if(d.size!==h.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(d.buffer,h,m),d.version=h.version}}return{get:o,remove:c,update:u}}var YT=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ZT=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,KT=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,jT=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,QT=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,JT=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$T=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tA=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,eA=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,nA=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,iA=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,aA=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,sA=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,rA=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,oA=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,lA=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,cA=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,uA=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,fA=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,dA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,pA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,mA=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,gA=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,_A=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,vA=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,xA=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yA=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,SA=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,MA=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,bA="gl_FragColor = linearToOutputTexel( gl_FragColor );",EA=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,TA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,AA=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,RA=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,CA=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,DA=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,UA=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,LA=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,NA=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,PA=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,OA=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zA=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,FA=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,IA=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,BA=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,HA=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,GA=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,VA=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,kA=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,XA=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,WA=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,qA=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,YA=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,ZA=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,KA=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,jA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,QA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,JA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$A=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,t2=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,e2=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,n2=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,i2=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,a2=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,s2=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,r2=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,o2=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,l2=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,c2=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,u2=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,f2=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,h2=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,d2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,p2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,m2=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,g2=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,_2=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,v2=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,x2=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,y2=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,S2=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,M2=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,b2=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,E2=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,T2=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,A2=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,R2=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,C2=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,w2=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,D2=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,U2=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,L2=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,N2=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,P2=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,O2=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,z2=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,F2=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,I2=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,B2=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,H2=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,G2=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,V2=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,k2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,X2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,W2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,q2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Y2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Z2=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,K2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,j2=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Q2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,J2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,t3=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,e3=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,n3=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,i3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,a3=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,s3=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,r3=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,o3=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,l3=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c3=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u3=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f3=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,h3=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d3=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,p3=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,m3=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,g3=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_3=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,v3=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x3=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,y3=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S3=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,M3=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,b3=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,E3=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,T3=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,A3=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ae={alphahash_fragment:YT,alphahash_pars_fragment:ZT,alphamap_fragment:KT,alphamap_pars_fragment:jT,alphatest_fragment:QT,alphatest_pars_fragment:JT,aomap_fragment:$T,aomap_pars_fragment:tA,batching_pars_vertex:eA,batching_vertex:nA,begin_vertex:iA,beginnormal_vertex:aA,bsdfs:sA,iridescence_fragment:rA,bumpmap_pars_fragment:oA,clipping_planes_fragment:lA,clipping_planes_pars_fragment:cA,clipping_planes_pars_vertex:uA,clipping_planes_vertex:fA,color_fragment:hA,color_pars_fragment:dA,color_pars_vertex:pA,color_vertex:mA,common:gA,cube_uv_reflection_fragment:_A,defaultnormal_vertex:vA,displacementmap_pars_vertex:xA,displacementmap_vertex:yA,emissivemap_fragment:SA,emissivemap_pars_fragment:MA,colorspace_fragment:bA,colorspace_pars_fragment:EA,envmap_fragment:TA,envmap_common_pars_fragment:AA,envmap_pars_fragment:RA,envmap_pars_vertex:CA,envmap_physical_pars_fragment:BA,envmap_vertex:wA,fog_vertex:DA,fog_pars_vertex:UA,fog_fragment:LA,fog_pars_fragment:NA,gradientmap_pars_fragment:PA,lightmap_pars_fragment:OA,lights_lambert_fragment:zA,lights_lambert_pars_fragment:FA,lights_pars_begin:IA,lights_toon_fragment:HA,lights_toon_pars_fragment:GA,lights_phong_fragment:VA,lights_phong_pars_fragment:kA,lights_physical_fragment:XA,lights_physical_pars_fragment:WA,lights_fragment_begin:qA,lights_fragment_maps:YA,lights_fragment_end:ZA,lightprobes_pars_fragment:KA,logdepthbuf_fragment:jA,logdepthbuf_pars_fragment:QA,logdepthbuf_pars_vertex:JA,logdepthbuf_vertex:$A,map_fragment:t2,map_pars_fragment:e2,map_particle_fragment:n2,map_particle_pars_fragment:i2,metalnessmap_fragment:a2,metalnessmap_pars_fragment:s2,morphinstance_vertex:r2,morphcolor_vertex:o2,morphnormal_vertex:l2,morphtarget_pars_vertex:c2,morphtarget_vertex:u2,normal_fragment_begin:f2,normal_fragment_maps:h2,normal_pars_fragment:d2,normal_pars_vertex:p2,normal_vertex:m2,normalmap_pars_fragment:g2,clearcoat_normal_fragment_begin:_2,clearcoat_normal_fragment_maps:v2,clearcoat_pars_fragment:x2,iridescence_pars_fragment:y2,opaque_fragment:S2,packing:M2,premultiplied_alpha_fragment:b2,project_vertex:E2,dithering_fragment:T2,dithering_pars_fragment:A2,roughnessmap_fragment:R2,roughnessmap_pars_fragment:C2,shadowmap_pars_fragment:w2,shadowmap_pars_vertex:D2,shadowmap_vertex:U2,shadowmask_pars_fragment:L2,skinbase_vertex:N2,skinning_pars_vertex:P2,skinning_vertex:O2,skinnormal_vertex:z2,specularmap_fragment:F2,specularmap_pars_fragment:I2,tonemapping_fragment:B2,tonemapping_pars_fragment:H2,transmission_fragment:G2,transmission_pars_fragment:V2,uv_pars_fragment:k2,uv_pars_vertex:X2,uv_vertex:W2,worldpos_vertex:q2,background_vert:Y2,background_frag:Z2,backgroundCube_vert:K2,backgroundCube_frag:j2,cube_vert:Q2,cube_frag:J2,depth_vert:$2,depth_frag:t3,distance_vert:e3,distance_frag:n3,equirect_vert:i3,equirect_frag:a3,linedashed_vert:s3,linedashed_frag:r3,meshbasic_vert:o3,meshbasic_frag:l3,meshlambert_vert:c3,meshlambert_frag:u3,meshmatcap_vert:f3,meshmatcap_frag:h3,meshnormal_vert:d3,meshnormal_frag:p3,meshphong_vert:m3,meshphong_frag:g3,meshphysical_vert:_3,meshphysical_frag:v3,meshtoon_vert:x3,meshtoon_frag:y3,points_vert:S3,points_frag:M3,shadow_vert:b3,shadow_frag:E3,sprite_vert:T3,sprite_frag:A3},Zt={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new be},alphaMap:{value:null},alphaMapTransform:{value:new be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new be}},envmap:{envMap:{value:null},envMapRotation:{value:new be},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new be},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new et},probesMax:{value:new et},probesResolution:{value:new et}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new be},alphaTest:{value:0},uvTransform:{value:new be}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new be},alphaMap:{value:null},alphaMapTransform:{value:new be},alphaTest:{value:0}}},_a={basic:{uniforms:ri([Zt.common,Zt.specularmap,Zt.envmap,Zt.aomap,Zt.lightmap,Zt.fog]),vertexShader:Ae.meshbasic_vert,fragmentShader:Ae.meshbasic_frag},lambert:{uniforms:ri([Zt.common,Zt.specularmap,Zt.envmap,Zt.aomap,Zt.lightmap,Zt.emissivemap,Zt.bumpmap,Zt.normalmap,Zt.displacementmap,Zt.fog,Zt.lights,{emissive:{value:new Ce(0)},envMapIntensity:{value:1}}]),vertexShader:Ae.meshlambert_vert,fragmentShader:Ae.meshlambert_frag},phong:{uniforms:ri([Zt.common,Zt.specularmap,Zt.envmap,Zt.aomap,Zt.lightmap,Zt.emissivemap,Zt.bumpmap,Zt.normalmap,Zt.displacementmap,Zt.fog,Zt.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ae.meshphong_vert,fragmentShader:Ae.meshphong_frag},standard:{uniforms:ri([Zt.common,Zt.envmap,Zt.aomap,Zt.lightmap,Zt.emissivemap,Zt.bumpmap,Zt.normalmap,Zt.displacementmap,Zt.roughnessmap,Zt.metalnessmap,Zt.fog,Zt.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ae.meshphysical_vert,fragmentShader:Ae.meshphysical_frag},toon:{uniforms:ri([Zt.common,Zt.aomap,Zt.lightmap,Zt.emissivemap,Zt.bumpmap,Zt.normalmap,Zt.displacementmap,Zt.gradientmap,Zt.fog,Zt.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Ae.meshtoon_vert,fragmentShader:Ae.meshtoon_frag},matcap:{uniforms:ri([Zt.common,Zt.bumpmap,Zt.normalmap,Zt.displacementmap,Zt.fog,{matcap:{value:null}}]),vertexShader:Ae.meshmatcap_vert,fragmentShader:Ae.meshmatcap_frag},points:{uniforms:ri([Zt.points,Zt.fog]),vertexShader:Ae.points_vert,fragmentShader:Ae.points_frag},dashed:{uniforms:ri([Zt.common,Zt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ae.linedashed_vert,fragmentShader:Ae.linedashed_frag},depth:{uniforms:ri([Zt.common,Zt.displacementmap]),vertexShader:Ae.depth_vert,fragmentShader:Ae.depth_frag},normal:{uniforms:ri([Zt.common,Zt.bumpmap,Zt.normalmap,Zt.displacementmap,{opacity:{value:1}}]),vertexShader:Ae.meshnormal_vert,fragmentShader:Ae.meshnormal_frag},sprite:{uniforms:ri([Zt.sprite,Zt.fog]),vertexShader:Ae.sprite_vert,fragmentShader:Ae.sprite_frag},background:{uniforms:{uvTransform:{value:new be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ae.background_vert,fragmentShader:Ae.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new be}},vertexShader:Ae.backgroundCube_vert,fragmentShader:Ae.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ae.cube_vert,fragmentShader:Ae.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ae.equirect_vert,fragmentShader:Ae.equirect_frag},distance:{uniforms:ri([Zt.common,Zt.displacementmap,{referencePosition:{value:new et},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ae.distance_vert,fragmentShader:Ae.distance_frag},shadow:{uniforms:ri([Zt.lights,Zt.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Ae.shadow_vert,fragmentShader:Ae.shadow_frag}};_a.physical={uniforms:ri([_a.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new be},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new be},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new be},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new be},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new be},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new be}}]),vertexShader:Ae.meshphysical_vert,fragmentShader:Ae.meshphysical_frag};const Lu={r:0,b:0,g:0},R3=new xn,rS=new be;rS.set(-1,0,0,0,1,0,0,0,1);function C3(a,t,n,s,o,c){const u=new Ce(0);let h=o===!0?0:1,m,d,g=null,v=0,_=null;function S(P){let z=P.isScene===!0?P.background:null;if(z&&z.isTexture){const C=P.backgroundBlurriness>0;z=t.get(z,C)}return z}function b(P){let z=!1;const C=S(P);C===null?x(u,h):C&&C.isColor&&(x(C,1),z=!0);const L=a.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,c):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,c),(a.autoClear||z)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),a.clear(a.autoClearColor,a.autoClearDepth,a.autoClearStencil))}function R(P,z){const C=S(z);C&&(C.isCubeTexture||C.mapping===mf)?(d===void 0&&(d=new Ui(new Yl(1,1,1),new zn({name:"BackgroundCubeMaterial",uniforms:bo(_a.backgroundCube.uniforms),vertexShader:_a.backgroundCube.vertexShader,fragmentShader:_a.backgroundCube.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(L,D,B){this.matrixWorld.copyPosition(B.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(d)),d.material.uniforms.envMap.value=C,d.material.uniforms.backgroundBlurriness.value=z.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=z.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(R3.makeRotationFromEuler(z.backgroundRotation)).transpose(),C.isCubeTexture&&C.isRenderTargetTexture===!1&&d.material.uniforms.backgroundRotation.value.premultiply(rS),d.material.toneMapped=ze.getTransfer(C.colorSpace)!==Je,(g!==C||v!==C.version||_!==a.toneMapping)&&(d.material.needsUpdate=!0,g=C,v=C.version,_=a.toneMapping),d.layers.enableAll(),P.unshift(d,d.geometry,d.material,0,0,null)):C&&C.isTexture&&(m===void 0&&(m=new Ui(new _f(2,2),new zn({name:"BackgroundMaterial",uniforms:bo(_a.background.uniforms),vertexShader:_a.background.vertexShader,fragmentShader:_a.background.fragmentShader,side:Is,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(m)),m.material.uniforms.t2D.value=C,m.material.uniforms.backgroundIntensity.value=z.backgroundIntensity,m.material.toneMapped=ze.getTransfer(C.colorSpace)!==Je,C.matrixAutoUpdate===!0&&C.updateMatrix(),m.material.uniforms.uvTransform.value.copy(C.matrix),(g!==C||v!==C.version||_!==a.toneMapping)&&(m.material.needsUpdate=!0,g=C,v=C.version,_=a.toneMapping),m.layers.enableAll(),P.unshift(m,m.geometry,m.material,0,0,null))}function x(P,z){P.getRGB(Lu,nS(a)),n.buffers.color.setClear(Lu.r,Lu.g,Lu.b,z,c)}function y(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return u},setClearColor:function(P,z=1){u.set(P),h=z,x(u,h)},getClearAlpha:function(){return h},setClearAlpha:function(P){h=P,x(u,h)},render:b,addToRenderList:R,dispose:y}}function w3(a,t){const n=a.getParameter(a.MAX_VERTEX_ATTRIBS),s={},o=_(null);let c=o,u=!1;function h(H,W,lt,ct,J){let I=!1;const V=v(H,ct,lt,W);c!==V&&(c=V,d(c.object)),I=S(H,ct,lt,J),I&&b(H,ct,lt,J),J!==null&&t.update(J,a.ELEMENT_ARRAY_BUFFER),(I||u)&&(u=!1,C(H,W,lt,ct),J!==null&&a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,t.get(J).buffer))}function m(){return a.createVertexArray()}function d(H){return a.bindVertexArray(H)}function g(H){return a.deleteVertexArray(H)}function v(H,W,lt,ct){const J=ct.wireframe===!0;let I=s[W.id];I===void 0&&(I={},s[W.id]=I);const V=H.isInstancedMesh===!0?H.id:0;let $=I[V];$===void 0&&($={},I[V]=$);let ft=$[lt.id];ft===void 0&&(ft={},$[lt.id]=ft);let bt=ft[J];return bt===void 0&&(bt=_(m()),ft[J]=bt),bt}function _(H){const W=[],lt=[],ct=[];for(let J=0;J<n;J++)W[J]=0,lt[J]=0,ct[J]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:lt,attributeDivisors:ct,object:H,attributes:{},index:null}}function S(H,W,lt,ct){const J=c.attributes,I=W.attributes;let V=0;const $=lt.getAttributes();for(const ft in $)if($[ft].location>=0){const F=J[ft];let q=I[ft];if(q===void 0&&(ft==="instanceMatrix"&&H.instanceMatrix&&(q=H.instanceMatrix),ft==="instanceColor"&&H.instanceColor&&(q=H.instanceColor)),F===void 0||F.attribute!==q||q&&F.data!==q.data)return!0;V++}return c.attributesNum!==V||c.index!==ct}function b(H,W,lt,ct){const J={},I=W.attributes;let V=0;const $=lt.getAttributes();for(const ft in $)if($[ft].location>=0){let F=I[ft];F===void 0&&(ft==="instanceMatrix"&&H.instanceMatrix&&(F=H.instanceMatrix),ft==="instanceColor"&&H.instanceColor&&(F=H.instanceColor));const q={};q.attribute=F,F&&F.data&&(q.data=F.data),J[ft]=q,V++}c.attributes=J,c.attributesNum=V,c.index=ct}function R(){const H=c.newAttributes;for(let W=0,lt=H.length;W<lt;W++)H[W]=0}function x(H){y(H,0)}function y(H,W){const lt=c.newAttributes,ct=c.enabledAttributes,J=c.attributeDivisors;lt[H]=1,ct[H]===0&&(a.enableVertexAttribArray(H),ct[H]=1),J[H]!==W&&(a.vertexAttribDivisor(H,W),J[H]=W)}function P(){const H=c.newAttributes,W=c.enabledAttributes;for(let lt=0,ct=W.length;lt<ct;lt++)W[lt]!==H[lt]&&(a.disableVertexAttribArray(lt),W[lt]=0)}function z(H,W,lt,ct,J,I,V){V===!0?a.vertexAttribIPointer(H,W,lt,J,I):a.vertexAttribPointer(H,W,lt,ct,J,I)}function C(H,W,lt,ct){R();const J=ct.attributes,I=lt.getAttributes(),V=W.defaultAttributeValues;for(const $ in I){const ft=I[$];if(ft.location>=0){let bt=J[$];if(bt===void 0&&($==="instanceMatrix"&&H.instanceMatrix&&(bt=H.instanceMatrix),$==="instanceColor"&&H.instanceColor&&(bt=H.instanceColor)),bt!==void 0){const F=bt.normalized,q=bt.itemSize,vt=t.get(bt);if(vt===void 0)continue;const Ct=vt.buffer,Mt=vt.type,K=vt.bytesPerElement,yt=Mt===a.INT||Mt===a.UNSIGNED_INT||bt.gpuType===Dm;if(bt.isInterleavedBufferAttribute){const xt=bt.data,Et=xt.stride,Dt=bt.offset;if(xt.isInstancedInterleavedBuffer){for(let Ut=0;Ut<ft.locationSize;Ut++)y(ft.location+Ut,xt.meshPerAttribute);H.isInstancedMesh!==!0&&ct._maxInstanceCount===void 0&&(ct._maxInstanceCount=xt.meshPerAttribute*xt.count)}else for(let Ut=0;Ut<ft.locationSize;Ut++)x(ft.location+Ut);a.bindBuffer(a.ARRAY_BUFFER,Ct);for(let Ut=0;Ut<ft.locationSize;Ut++)z(ft.location+Ut,q/ft.locationSize,Mt,F,Et*K,(Dt+q/ft.locationSize*Ut)*K,yt)}else{if(bt.isInstancedBufferAttribute){for(let xt=0;xt<ft.locationSize;xt++)y(ft.location+xt,bt.meshPerAttribute);H.isInstancedMesh!==!0&&ct._maxInstanceCount===void 0&&(ct._maxInstanceCount=bt.meshPerAttribute*bt.count)}else for(let xt=0;xt<ft.locationSize;xt++)x(ft.location+xt);a.bindBuffer(a.ARRAY_BUFFER,Ct);for(let xt=0;xt<ft.locationSize;xt++)z(ft.location+xt,q/ft.locationSize,Mt,F,q*K,q/ft.locationSize*xt*K,yt)}}else if(V!==void 0){const F=V[$];if(F!==void 0)switch(F.length){case 2:a.vertexAttrib2fv(ft.location,F);break;case 3:a.vertexAttrib3fv(ft.location,F);break;case 4:a.vertexAttrib4fv(ft.location,F);break;default:a.vertexAttrib1fv(ft.location,F)}}}}P()}function L(){N();for(const H in s){const W=s[H];for(const lt in W){const ct=W[lt];for(const J in ct){const I=ct[J];for(const V in I)g(I[V].object),delete I[V];delete ct[J]}}delete s[H]}}function D(H){if(s[H.id]===void 0)return;const W=s[H.id];for(const lt in W){const ct=W[lt];for(const J in ct){const I=ct[J];for(const V in I)g(I[V].object),delete I[V];delete ct[J]}}delete s[H.id]}function B(H){for(const W in s){const lt=s[W];for(const ct in lt){const J=lt[ct];if(J[H.id]===void 0)continue;const I=J[H.id];for(const V in I)g(I[V].object),delete I[V];delete J[H.id]}}}function T(H){for(const W in s){const lt=s[W],ct=H.isInstancedMesh===!0?H.id:0,J=lt[ct];if(J!==void 0){for(const I in J){const V=J[I];for(const $ in V)g(V[$].object),delete V[$];delete J[I]}delete lt[ct],Object.keys(lt).length===0&&delete s[W]}}}function N(){G(),u=!0,c!==o&&(c=o,d(c.object))}function G(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:h,reset:N,resetDefaultState:G,dispose:L,releaseStatesOfGeometry:D,releaseStatesOfObject:T,releaseStatesOfProgram:B,initAttributes:R,enableAttribute:x,disableUnusedAttributes:P}}function D3(a,t,n){let s;function o(m){s=m}function c(m,d){a.drawArrays(s,m,d),n.update(d,s,1)}function u(m,d,g){g!==0&&(a.drawArraysInstanced(s,m,d,g),n.update(d,s,g))}function h(m,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,m,0,d,0,g);let _=0;for(let S=0;S<g;S++)_+=d[S];n.update(_,s,1)}this.setMode=o,this.render=c,this.renderInstances=u,this.renderMultiDraw=h}function U3(a,t,n,s){let o;function c(){if(o!==void 0)return o;if(t.has("EXT_texture_filter_anisotropic")===!0){const B=t.get("EXT_texture_filter_anisotropic");o=a.getParameter(B.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function u(B){return!(B!==oa&&s.convert(B)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_FORMAT))}function h(B){const T=B===Di&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(B!==qi&&s.convert(B)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_TYPE)&&B!==xa&&!T)}function m(B){if(B==="highp"){if(a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision>0)return"highp";B="mediump"}return B==="mediump"&&a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let d=n.precision!==void 0?n.precision:"highp";const g=m(d);g!==d&&(xe("WebGLRenderer:",d,"not supported, using",g,"instead."),d=g);const v=n.logarithmicDepthBuffer===!0,_=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&_===!1&&xe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const S=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),b=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=a.getParameter(a.MAX_TEXTURE_SIZE),x=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE),y=a.getParameter(a.MAX_VERTEX_ATTRIBS),P=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),z=a.getParameter(a.MAX_VARYING_VECTORS),C=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),L=a.getParameter(a.MAX_SAMPLES),D=a.getParameter(a.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:m,textureFormatReadable:u,textureTypeReadable:h,precision:d,logarithmicDepthBuffer:v,reversedDepthBuffer:_,maxTextures:S,maxVertexTextures:b,maxTextureSize:R,maxCubemapSize:x,maxAttributes:y,maxVertexUniforms:P,maxVaryings:z,maxFragmentUniforms:C,maxSamples:L,samples:D}}function L3(a){const t=this;let n=null,s=0,o=!1,c=!1;const u=new Ls,h=new be,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(v,_){const S=v.length!==0||_||s!==0||o;return o=_,s=v.length,S},this.beginShadows=function(){c=!0,g(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(v,_){n=g(v,_,0)},this.setState=function(v,_,S){const b=v.clippingPlanes,R=v.clipIntersection,x=v.clipShadows,y=a.get(v);if(!o||b===null||b.length===0||c&&!x)c?g(null):d();else{const P=c?0:s,z=P*4;let C=y.clippingState||null;m.value=C,C=g(b,_,z,S);for(let L=0;L!==z;++L)C[L]=n[L];y.clippingState=C,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=P}};function d(){m.value!==n&&(m.value=n,m.needsUpdate=s>0),t.numPlanes=s,t.numIntersection=0}function g(v,_,S,b){const R=v!==null?v.length:0;let x=null;if(R!==0){if(x=m.value,b!==!0||x===null){const y=S+R*4,P=_.matrixWorldInverse;h.getNormalMatrix(P),(x===null||x.length<y)&&(x=new Float32Array(y));for(let z=0,C=S;z!==R;++z,C+=4)u.copy(v[z]).applyMatrix4(P,h),u.normal.toArray(x,C),x[C+3]=u.constant}m.value=x,m.needsUpdate=!0}return t.numPlanes=R,t.numIntersection=0,x}}const zs=4,Rx=[.125,.215,.35,.446,.526,.582],cr=20,N3=256,Cl=new Gm,Cx=new Ce;let up=null,fp=0,hp=0,dp=!1;const P3=new et;class wx{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,s=.1,o=100,c={}){const{size:u=256,position:h=P3}=c;up=this._renderer.getRenderTarget(),fp=this._renderer.getActiveCubeFace(),hp=this._renderer.getActiveMipmapLevel(),dp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(u);const m=this._allocateTargets();return m.depthBuffer=!0,this._sceneToCubeUV(t,s,o,m,h),n>0&&this._blur(m,0,0,n),this._applyPMREM(m),this._cleanup(m),m}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Lx(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ux(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(up,fp,hp),this._renderer.xr.enabled=dp,t.scissorTest=!1,po(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===pr||t.mapping===So?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),up=this._renderer.getRenderTarget(),fp=this._renderer.getActiveCubeFace(),hp=this._renderer.getActiveMipmapLevel(),dp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const s=n||this._allocateTargets();return this._textureToCubeUV(t,s),this._applyPMREM(s),this._cleanup(s),s}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,s={magFilter:ti,minFilter:ti,generateMipmaps:!1,type:Di,format:oa,colorSpace:tf,depthBuffer:!1},o=Dx(t,n,s);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dx(t,n,s);const{_lodMax:c}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=O3(c)),this._blurMaterial=F3(c,t,n),this._ggxMaterial=z3(c,t,n)}return o}_compileMaterial(t){const n=new Ui(new On,t);this._renderer.compile(n,Cl)}_sceneToCubeUV(t,n,s,o,c){const m=new Wi(90,1,n,s),d=[1,-1,1,1,1,1],g=[1,1,1,-1,-1,-1],v=this._renderer,_=v.autoClear,S=v.toneMapping;v.getClearColor(Cx),v.toneMapping=Ma,v.autoClear=!1,v.state.buffers.depth.getReversed()&&(v.setRenderTarget(o),v.clearDepth(),v.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ui(new Yl,new Bm({name:"PMREM.Background",side:li,depthWrite:!1,depthTest:!1})));const R=this._backgroundBox,x=R.material;let y=!1;const P=t.background;P?P.isColor&&(x.color.copy(P),t.background=null,y=!0):(x.color.copy(Cx),y=!0);for(let z=0;z<6;z++){const C=z%3;C===0?(m.up.set(0,d[z],0),m.position.set(c.x,c.y,c.z),m.lookAt(c.x+g[z],c.y,c.z)):C===1?(m.up.set(0,0,d[z]),m.position.set(c.x,c.y,c.z),m.lookAt(c.x,c.y+g[z],c.z)):(m.up.set(0,d[z],0),m.position.set(c.x,c.y,c.z),m.lookAt(c.x,c.y,c.z+g[z]));const L=this._cubeSize;po(o,C*L,z>2?L:0,L,L),v.setRenderTarget(o),y&&v.render(R,m),v.render(t,m)}v.toneMapping=S,v.autoClear=_,t.background=P}_textureToCubeUV(t,n){const s=this._renderer,o=t.mapping===pr||t.mapping===So;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=Lx()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ux());const c=o?this._cubemapMaterial:this._equirectMaterial,u=this._lodMeshes[0];u.material=c;const h=c.uniforms;h.envMap.value=t;const m=this._cubeSize;po(n,0,0,3*m,2*m),s.setRenderTarget(n),s.render(u,Cl)}_applyPMREM(t){const n=this._renderer,s=n.autoClear;n.autoClear=!1;const o=this._lodMeshes.length;for(let c=1;c<o;c++)this._applyGGXFilter(t,c-1,c);n.autoClear=s}_applyGGXFilter(t,n,s){const o=this._renderer,c=this._pingPongRenderTarget,u=this._ggxMaterial,h=this._lodMeshes[s];h.material=u;const m=u.uniforms,d=s/(this._lodMeshes.length-1),g=n/(this._lodMeshes.length-1),v=Math.sqrt(d*d-g*g),_=0+d*1.25,S=v*_,{_lodMax:b}=this,R=this._sizeLods[s],x=3*R*(s>b-zs?s-b+zs:0),y=4*(this._cubeSize-R);m.envMap.value=t.texture,m.roughness.value=S,m.mipInt.value=b-n,po(c,x,y,3*R,2*R),o.setRenderTarget(c),o.render(h,Cl),m.envMap.value=c.texture,m.roughness.value=0,m.mipInt.value=b-s,po(t,x,y,3*R,2*R),o.setRenderTarget(t),o.render(h,Cl)}_blur(t,n,s,o,c){const u=this._pingPongRenderTarget;this._halfBlur(t,u,n,s,o,"latitudinal",c),this._halfBlur(u,t,s,s,o,"longitudinal",c)}_halfBlur(t,n,s,o,c,u,h){const m=this._renderer,d=this._blurMaterial;u!=="latitudinal"&&u!=="longitudinal"&&Be("blur direction must be either latitudinal or longitudinal!");const g=3,v=this._lodMeshes[o];v.material=d;const _=d.uniforms,S=this._sizeLods[s]-1,b=isFinite(c)?Math.PI/(2*S):2*Math.PI/(2*cr-1),R=c/b,x=isFinite(c)?1+Math.floor(g*R):cr;x>cr&&xe(`sigmaRadians, ${c}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${cr}`);const y=[];let P=0;for(let B=0;B<cr;++B){const T=B/R,N=Math.exp(-T*T/2);y.push(N),B===0?P+=N:B<x&&(P+=2*N)}for(let B=0;B<y.length;B++)y[B]=y[B]/P;_.envMap.value=t.texture,_.samples.value=x,_.weights.value=y,_.latitudinal.value=u==="latitudinal",h&&(_.poleAxis.value=h);const{_lodMax:z}=this;_.dTheta.value=b,_.mipInt.value=z-s;const C=this._sizeLods[o],L=3*C*(o>z-zs?o-z+zs:0),D=4*(this._cubeSize-C);po(n,L,D,3*C,2*C),m.setRenderTarget(n),m.render(v,Cl)}}function O3(a){const t=[],n=[],s=[];let o=a;const c=a-zs+1+Rx.length;for(let u=0;u<c;u++){const h=Math.pow(2,o);t.push(h);let m=1/h;u>a-zs?m=Rx[u-a+zs-1]:u===0&&(m=0),n.push(m);const d=1/(h-2),g=-d,v=1+d,_=[g,g,v,g,v,v,g,g,v,v,g,v],S=6,b=6,R=3,x=2,y=1,P=new Float32Array(R*b*S),z=new Float32Array(x*b*S),C=new Float32Array(y*b*S);for(let D=0;D<S;D++){const B=D%3*2/3-1,T=D>2?0:-1,N=[B,T,0,B+2/3,T,0,B+2/3,T+1,0,B,T,0,B+2/3,T+1,0,B,T+1,0];P.set(N,R*b*D),z.set(_,x*b*D);const G=[D,D,D,D,D,D];C.set(G,y*b*D)}const L=new On;L.setAttribute("position",new Mn(P,R)),L.setAttribute("uv",new Mn(z,x)),L.setAttribute("faceIndex",new Mn(C,y)),s.push(new Ui(L,null)),o>zs&&o--}return{lodMeshes:s,sizeLods:t,sigmas:n}}function Dx(a,t,n){const s=new _i(a,t,n);return s.texture.mapping=mf,s.texture.name="PMREM.cubeUv",s.scissorTest=!0,s}function po(a,t,n,s,o){a.viewport.set(t,n,s,o),a.scissor.set(t,n,s,o)}function z3(a,t,n){return new zn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:N3,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vf(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Sa,depthTest:!1,depthWrite:!1})}function F3(a,t,n){const s=new Float32Array(cr),o=new et(0,1,0);return new zn({name:"SphericalGaussianBlur",defines:{n:cr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:s},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:vf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Sa,depthTest:!1,depthWrite:!1})}function Ux(){return new zn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:vf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Sa,depthTest:!1,depthWrite:!1})}function Lx(){return new zn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sa,depthTest:!1,depthWrite:!1})}function vf(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class oS extends _i{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;const s={width:t,height:t,depth:1},o=[s,s,s,s,s,s];this.texture=new tS(o),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},o=new Yl(5,5,5),c=new zn({name:"CubemapFromEquirect",uniforms:bo(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:li,blending:Sa});c.uniforms.tEquirect.value=n;const u=new Ui(o,c),h=n.minFilter;return n.minFilter===hr&&(n.minFilter=ti),new HT(1,10,this).update(t,u),n.minFilter=h,u.geometry.dispose(),u.material.dispose(),this}clear(t,n=!0,s=!0,o=!0){const c=t.getRenderTarget();for(let u=0;u<6;u++)t.setRenderTarget(this,u),t.clear(n,s,o);t.setRenderTarget(c)}}function I3(a){let t=new WeakMap,n=new WeakMap,s=null;function o(_,S=!1){return _==null?null:S?u(_):c(_)}function c(_){if(_&&_.isTexture){const S=_.mapping;if(S===Pd||S===Od)if(t.has(_)){const b=t.get(_).texture;return h(b,_.mapping)}else{const b=_.image;if(b&&b.height>0){const R=new oS(b.height);return R.fromEquirectangularTexture(a,_),t.set(_,R),_.addEventListener("dispose",d),h(R.texture,_.mapping)}else return null}}return _}function u(_){if(_&&_.isTexture){const S=_.mapping,b=S===Pd||S===Od,R=S===pr||S===So;if(b||R){let x=n.get(_);const y=x!==void 0?x.texture.pmremVersion:0;if(_.isRenderTargetTexture&&_.pmremVersion!==y)return s===null&&(s=new wx(a)),x=b?s.fromEquirectangular(_,x):s.fromCubemap(_,x),x.texture.pmremVersion=_.pmremVersion,n.set(_,x),x.texture;if(x!==void 0)return x.texture;{const P=_.image;return b&&P&&P.height>0||R&&P&&m(P)?(s===null&&(s=new wx(a)),x=b?s.fromEquirectangular(_):s.fromCubemap(_),x.texture.pmremVersion=_.pmremVersion,n.set(_,x),_.addEventListener("dispose",g),x.texture):null}}}return _}function h(_,S){return S===Pd?_.mapping=pr:S===Od&&(_.mapping=So),_}function m(_){let S=0;const b=6;for(let R=0;R<b;R++)_[R]!==void 0&&S++;return S===b}function d(_){const S=_.target;S.removeEventListener("dispose",d);const b=t.get(S);b!==void 0&&(t.delete(S),b.dispose())}function g(_){const S=_.target;S.removeEventListener("dispose",g);const b=n.get(S);b!==void 0&&(n.delete(S),b.dispose())}function v(){t=new WeakMap,n=new WeakMap,s!==null&&(s.dispose(),s=null)}return{get:o,dispose:v}}function B3(a){const t={};function n(s){if(t[s]!==void 0)return t[s];const o=a.getExtension(s);return t[s]=o,o}return{has:function(s){return n(s)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(s){const o=n(s);return o===null&&vo("WebGLRenderer: "+s+" extension not supported."),o}}}function H3(a,t,n,s){const o={},c=new WeakMap;function u(v){const _=v.target;_.index!==null&&t.remove(_.index);for(const b in _.attributes)t.remove(_.attributes[b]);_.removeEventListener("dispose",u),delete o[_.id];const S=c.get(_);S&&(t.remove(S),c.delete(_)),s.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,n.memory.geometries--}function h(v,_){return o[_.id]===!0||(_.addEventListener("dispose",u),o[_.id]=!0,n.memory.geometries++),_}function m(v){const _=v.attributes;for(const S in _)t.update(_[S],a.ARRAY_BUFFER)}function d(v){const _=[],S=v.index,b=v.attributes.position;let R=0;if(b===void 0)return;if(S!==null){const P=S.array;R=S.version;for(let z=0,C=P.length;z<C;z+=3){const L=P[z+0],D=P[z+1],B=P[z+2];_.push(L,D,D,B,B,L)}}else{const P=b.array;R=b.version;for(let z=0,C=P.length/3-1;z<C;z+=3){const L=z+0,D=z+1,B=z+2;_.push(L,D,D,B,B,L)}}const x=new(b.count>=65535?Ky:Zy)(_,1);x.version=R;const y=c.get(v);y&&t.remove(y),c.set(v,x)}function g(v){const _=c.get(v);if(_){const S=v.index;S!==null&&_.version<S.version&&d(v)}else d(v);return c.get(v)}return{get:h,update:m,getWireframeAttribute:g}}function G3(a,t,n){let s;function o(v){s=v}let c,u;function h(v){c=v.type,u=v.bytesPerElement}function m(v,_){a.drawElements(s,_,c,v*u),n.update(_,s,1)}function d(v,_,S){S!==0&&(a.drawElementsInstanced(s,_,c,v*u,S),n.update(_,s,S))}function g(v,_,S){if(S===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,_,0,c,v,0,S);let R=0;for(let x=0;x<S;x++)R+=_[x];n.update(R,s,1)}this.setMode=o,this.setIndex=h,this.render=m,this.renderInstances=d,this.renderMultiDraw=g}function V3(a){const t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function s(c,u,h){switch(n.calls++,u){case a.TRIANGLES:n.triangles+=h*(c/3);break;case a.LINES:n.lines+=h*(c/2);break;case a.LINE_STRIP:n.lines+=h*(c-1);break;case a.LINE_LOOP:n.lines+=h*c;break;case a.POINTS:n.points+=h*c;break;default:Be("WebGLInfo: Unknown draw mode:",u);break}}function o(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:o,update:s}}function k3(a,t,n){const s=new WeakMap,o=new bn;function c(u,h,m){const d=u.morphTargetInfluences,g=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,v=g!==void 0?g.length:0;let _=s.get(h);if(_===void 0||_.count!==v){let N=function(){B.dispose(),s.delete(h),h.removeEventListener("dispose",N)};_!==void 0&&_.texture.dispose();const S=h.morphAttributes.position!==void 0,b=h.morphAttributes.normal!==void 0,R=h.morphAttributes.color!==void 0,x=h.morphAttributes.position||[],y=h.morphAttributes.normal||[],P=h.morphAttributes.color||[];let z=0;S===!0&&(z=1),b===!0&&(z=2),R===!0&&(z=3);let C=h.attributes.position.count*z,L=1;C>t.maxTextureSize&&(L=Math.ceil(C/t.maxTextureSize),C=t.maxTextureSize);const D=new Float32Array(C*L*4*v),B=new Wy(D,C,L,v);B.type=xa,B.needsUpdate=!0;const T=z*4;for(let G=0;G<v;G++){const H=x[G],W=y[G],lt=P[G],ct=C*L*4*G;for(let J=0;J<H.count;J++){const I=J*T;S===!0&&(o.fromBufferAttribute(H,J),D[ct+I+0]=o.x,D[ct+I+1]=o.y,D[ct+I+2]=o.z,D[ct+I+3]=0),b===!0&&(o.fromBufferAttribute(W,J),D[ct+I+4]=o.x,D[ct+I+5]=o.y,D[ct+I+6]=o.z,D[ct+I+7]=0),R===!0&&(o.fromBufferAttribute(lt,J),D[ct+I+8]=o.x,D[ct+I+9]=o.y,D[ct+I+10]=o.z,D[ct+I+11]=lt.itemSize===4?o.w:1)}}_={count:v,texture:B,size:new he(C,L)},s.set(h,_),h.addEventListener("dispose",N)}if(u.isInstancedMesh===!0&&u.morphTexture!==null)m.getUniforms().setValue(a,"morphTexture",u.morphTexture,n);else{let S=0;for(let R=0;R<d.length;R++)S+=d[R];const b=h.morphTargetsRelative?1:1-S;m.getUniforms().setValue(a,"morphTargetBaseInfluence",b),m.getUniforms().setValue(a,"morphTargetInfluences",d)}m.getUniforms().setValue(a,"morphTargetsTexture",_.texture,n),m.getUniforms().setValue(a,"morphTargetsTextureSize",_.size)}return{update:c}}function X3(a,t,n,s,o){let c=new WeakMap;function u(d){const g=o.render.frame,v=d.geometry,_=t.get(d,v);if(c.get(_)!==g&&(t.update(_),c.set(_,g)),d.isInstancedMesh&&(d.hasEventListener("dispose",m)===!1&&d.addEventListener("dispose",m),c.get(d)!==g&&(n.update(d.instanceMatrix,a.ARRAY_BUFFER),d.instanceColor!==null&&n.update(d.instanceColor,a.ARRAY_BUFFER),c.set(d,g))),d.isSkinnedMesh){const S=d.skeleton;c.get(S)!==g&&(S.update(),c.set(S,g))}return _}function h(){c=new WeakMap}function m(d){const g=d.target;g.removeEventListener("dispose",m),s.releaseStatesOfObject(g),n.remove(g.instanceMatrix),g.instanceColor!==null&&n.remove(g.instanceColor)}return{update:u,dispose:h}}const W3={[bm]:"LINEAR_TONE_MAPPING",[Em]:"REINHARD_TONE_MAPPING",[Tm]:"CINEON_TONE_MAPPING",[Am]:"ACES_FILMIC_TONE_MAPPING",[Cm]:"AGX_TONE_MAPPING",[wm]:"NEUTRAL_TONE_MAPPING",[Rm]:"CUSTOM_TONE_MAPPING"};function q3(a,t,n,s,o,c){const u=new _i(t,n,{type:a,depthBuffer:o,stencilBuffer:c,samples:s?4:0,depthTexture:o?new Mo(t,n):void 0}),h=new _i(t,n,{type:Di,depthBuffer:!1,stencilBuffer:!1}),m=new On;m.setAttribute("position",new ci([-1,3,0,-1,-1,0,3,-1,0],3)),m.setAttribute("uv",new ci([0,2,0,0,2,0],2));const d=new iS({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),g=new Ui(m,d),v=new Gm(-1,1,1,-1,0,1);let _=null,S=null,b=!1,R,x=null,y=[],P=!1;this.setSize=function(z,C){u.setSize(z,C),h.setSize(z,C);for(let L=0;L<y.length;L++){const D=y[L];D.setSize&&D.setSize(z,C)}},this.setEffects=function(z){y=z,P=y.length>0&&y[0].isRenderPass===!0;const C=u.width,L=u.height;for(let D=0;D<y.length;D++){const B=y[D];B.setSize&&B.setSize(C,L)}},this.begin=function(z,C){if(b||z.toneMapping===Ma&&y.length===0)return!1;if(x=C,C!==null){const L=C.width,D=C.height;(u.width!==L||u.height!==D)&&this.setSize(L,D)}return P===!1&&z.setRenderTarget(u),R=z.toneMapping,z.toneMapping=Ma,!0},this.hasRenderPass=function(){return P},this.end=function(z,C){z.toneMapping=R,b=!0;let L=u,D=h;for(let B=0;B<y.length;B++){const T=y[B];if(T.enabled!==!1&&(T.render(z,D,L,C),T.needsSwap!==!1)){const N=L;L=D,D=N}}if(_!==z.outputColorSpace||S!==z.toneMapping){_=z.outputColorSpace,S=z.toneMapping,d.defines={},ze.getTransfer(_)===Je&&(d.defines.SRGB_TRANSFER="");const B=W3[S];B&&(d.defines[B]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=L.texture,z.setRenderTarget(x),z.render(g,v),x=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){u.depthTexture&&u.depthTexture.dispose(),u.dispose(),h.dispose(),m.dispose(),d.dispose()}}const lS=new Kn,fm=new Mo(1,1),cS=new Wy,uS=new uT,fS=new tS,Nx=[],Px=[],Ox=new Float32Array(16),zx=new Float32Array(9),Fx=new Float32Array(4);function Co(a,t,n){const s=a[0];if(s<=0||s>0)return a;const o=t*n;let c=Nx[o];if(c===void 0&&(c=new Float32Array(o),Nx[o]=c),t!==0){s.toArray(c,0);for(let u=1,h=0;u!==t;++u)h+=n,a[u].toArray(c,h)}return c}function In(a,t){if(a.length!==t.length)return!1;for(let n=0,s=a.length;n<s;n++)if(a[n]!==t[n])return!1;return!0}function Bn(a,t){for(let n=0,s=t.length;n<s;n++)a[n]=t[n]}function xf(a,t){let n=Px[t];n===void 0&&(n=new Int32Array(t),Px[t]=n);for(let s=0;s!==t;++s)n[s]=a.allocateTextureUnit();return n}function Y3(a,t){const n=this.cache;n[0]!==t&&(a.uniform1f(this.addr,t),n[0]=t)}function Z3(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(a.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(In(n,t))return;a.uniform2fv(this.addr,t),Bn(n,t)}}function K3(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(a.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(a.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(In(n,t))return;a.uniform3fv(this.addr,t),Bn(n,t)}}function j3(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(a.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(In(n,t))return;a.uniform4fv(this.addr,t),Bn(n,t)}}function Q3(a,t){const n=this.cache,s=t.elements;if(s===void 0){if(In(n,t))return;a.uniformMatrix2fv(this.addr,!1,t),Bn(n,t)}else{if(In(n,s))return;Fx.set(s),a.uniformMatrix2fv(this.addr,!1,Fx),Bn(n,s)}}function J3(a,t){const n=this.cache,s=t.elements;if(s===void 0){if(In(n,t))return;a.uniformMatrix3fv(this.addr,!1,t),Bn(n,t)}else{if(In(n,s))return;zx.set(s),a.uniformMatrix3fv(this.addr,!1,zx),Bn(n,s)}}function $3(a,t){const n=this.cache,s=t.elements;if(s===void 0){if(In(n,t))return;a.uniformMatrix4fv(this.addr,!1,t),Bn(n,t)}else{if(In(n,s))return;Ox.set(s),a.uniformMatrix4fv(this.addr,!1,Ox),Bn(n,s)}}function tR(a,t){const n=this.cache;n[0]!==t&&(a.uniform1i(this.addr,t),n[0]=t)}function eR(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(a.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(In(n,t))return;a.uniform2iv(this.addr,t),Bn(n,t)}}function nR(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(a.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(In(n,t))return;a.uniform3iv(this.addr,t),Bn(n,t)}}function iR(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(a.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(In(n,t))return;a.uniform4iv(this.addr,t),Bn(n,t)}}function aR(a,t){const n=this.cache;n[0]!==t&&(a.uniform1ui(this.addr,t),n[0]=t)}function sR(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(a.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(In(n,t))return;a.uniform2uiv(this.addr,t),Bn(n,t)}}function rR(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(a.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(In(n,t))return;a.uniform3uiv(this.addr,t),Bn(n,t)}}function oR(a,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(a.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(In(n,t))return;a.uniform4uiv(this.addr,t),Bn(n,t)}}function lR(a,t,n){const s=this.cache,o=n.allocateTextureUnit();s[0]!==o&&(a.uniform1i(this.addr,o),s[0]=o);let c;this.type===a.SAMPLER_2D_SHADOW?(fm.compareFunction=n.isReversedDepthBuffer()?Fm:zm,c=fm):c=lS,n.setTexture2D(t||c,o)}function cR(a,t,n){const s=this.cache,o=n.allocateTextureUnit();s[0]!==o&&(a.uniform1i(this.addr,o),s[0]=o),n.setTexture3D(t||uS,o)}function uR(a,t,n){const s=this.cache,o=n.allocateTextureUnit();s[0]!==o&&(a.uniform1i(this.addr,o),s[0]=o),n.setTextureCube(t||fS,o)}function fR(a,t,n){const s=this.cache,o=n.allocateTextureUnit();s[0]!==o&&(a.uniform1i(this.addr,o),s[0]=o),n.setTexture2DArray(t||cS,o)}function hR(a){switch(a){case 5126:return Y3;case 35664:return Z3;case 35665:return K3;case 35666:return j3;case 35674:return Q3;case 35675:return J3;case 35676:return $3;case 5124:case 35670:return tR;case 35667:case 35671:return eR;case 35668:case 35672:return nR;case 35669:case 35673:return iR;case 5125:return aR;case 36294:return sR;case 36295:return rR;case 36296:return oR;case 35678:case 36198:case 36298:case 36306:case 35682:return lR;case 35679:case 36299:case 36307:return cR;case 35680:case 36300:case 36308:case 36293:return uR;case 36289:case 36303:case 36311:case 36292:return fR}}function dR(a,t){a.uniform1fv(this.addr,t)}function pR(a,t){const n=Co(t,this.size,2);a.uniform2fv(this.addr,n)}function mR(a,t){const n=Co(t,this.size,3);a.uniform3fv(this.addr,n)}function gR(a,t){const n=Co(t,this.size,4);a.uniform4fv(this.addr,n)}function _R(a,t){const n=Co(t,this.size,4);a.uniformMatrix2fv(this.addr,!1,n)}function vR(a,t){const n=Co(t,this.size,9);a.uniformMatrix3fv(this.addr,!1,n)}function xR(a,t){const n=Co(t,this.size,16);a.uniformMatrix4fv(this.addr,!1,n)}function yR(a,t){a.uniform1iv(this.addr,t)}function SR(a,t){a.uniform2iv(this.addr,t)}function MR(a,t){a.uniform3iv(this.addr,t)}function bR(a,t){a.uniform4iv(this.addr,t)}function ER(a,t){a.uniform1uiv(this.addr,t)}function TR(a,t){a.uniform2uiv(this.addr,t)}function AR(a,t){a.uniform3uiv(this.addr,t)}function RR(a,t){a.uniform4uiv(this.addr,t)}function CR(a,t,n){const s=this.cache,o=t.length,c=xf(n,o);In(s,c)||(a.uniform1iv(this.addr,c),Bn(s,c));let u;this.type===a.SAMPLER_2D_SHADOW?u=fm:u=lS;for(let h=0;h!==o;++h)n.setTexture2D(t[h]||u,c[h])}function wR(a,t,n){const s=this.cache,o=t.length,c=xf(n,o);In(s,c)||(a.uniform1iv(this.addr,c),Bn(s,c));for(let u=0;u!==o;++u)n.setTexture3D(t[u]||uS,c[u])}function DR(a,t,n){const s=this.cache,o=t.length,c=xf(n,o);In(s,c)||(a.uniform1iv(this.addr,c),Bn(s,c));for(let u=0;u!==o;++u)n.setTextureCube(t[u]||fS,c[u])}function UR(a,t,n){const s=this.cache,o=t.length,c=xf(n,o);In(s,c)||(a.uniform1iv(this.addr,c),Bn(s,c));for(let u=0;u!==o;++u)n.setTexture2DArray(t[u]||cS,c[u])}function LR(a){switch(a){case 5126:return dR;case 35664:return pR;case 35665:return mR;case 35666:return gR;case 35674:return _R;case 35675:return vR;case 35676:return xR;case 5124:case 35670:return yR;case 35667:case 35671:return SR;case 35668:case 35672:return MR;case 35669:case 35673:return bR;case 5125:return ER;case 36294:return TR;case 36295:return AR;case 36296:return RR;case 35678:case 36198:case 36298:case 36306:case 35682:return CR;case 35679:case 36299:case 36307:return wR;case 35680:case 36300:case 36308:case 36293:return DR;case 36289:case 36303:case 36311:case 36292:return UR}}class NR{constructor(t,n,s){this.id=t,this.addr=s,this.cache=[],this.type=n.type,this.setValue=hR(n.type)}}class PR{constructor(t,n,s){this.id=t,this.addr=s,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=LR(n.type)}}class OR{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,s){const o=this.seq;for(let c=0,u=o.length;c!==u;++c){const h=o[c];h.setValue(t,n[h.id],s)}}}const pp=/(\w+)(\])?(\[|\.)?/g;function Ix(a,t){a.seq.push(t),a.map[t.id]=t}function zR(a,t,n){const s=a.name,o=s.length;for(pp.lastIndex=0;;){const c=pp.exec(s),u=pp.lastIndex;let h=c[1];const m=c[2]==="]",d=c[3];if(m&&(h=h|0),d===void 0||d==="["&&u+2===o){Ix(n,d===void 0?new NR(h,a,t):new PR(h,a,t));break}else{let v=n.map[h];v===void 0&&(v=new OR(h),Ix(n,v)),n=v}}}class Zu{constructor(t,n){this.seq=[],this.map={};const s=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let u=0;u<s;++u){const h=t.getActiveUniform(n,u),m=t.getUniformLocation(n,h.name);zR(h,m,this)}const o=[],c=[];for(const u of this.seq)u.type===t.SAMPLER_2D_SHADOW||u.type===t.SAMPLER_CUBE_SHADOW||u.type===t.SAMPLER_2D_ARRAY_SHADOW?o.push(u):c.push(u);o.length>0&&(this.seq=o.concat(c))}setValue(t,n,s,o){const c=this.map[n];c!==void 0&&c.setValue(t,s,o)}setOptional(t,n,s){const o=n[s];o!==void 0&&this.setValue(t,s,o)}static upload(t,n,s,o){for(let c=0,u=n.length;c!==u;++c){const h=n[c],m=s[h.id];m.needsUpdate!==!1&&h.setValue(t,m.value,o)}}static seqWithValue(t,n){const s=[];for(let o=0,c=t.length;o!==c;++o){const u=t[o];u.id in n&&s.push(u)}return s}}function Bx(a,t,n){const s=a.createShader(t);return a.shaderSource(s,n),a.compileShader(s),s}const FR=37297;let IR=0;function BR(a,t){const n=a.split(`
`),s=[],o=Math.max(t-6,0),c=Math.min(t+6,n.length);for(let u=o;u<c;u++){const h=u+1;s.push(`${h===t?">":" "} ${h}: ${n[u]}`)}return s.join(`
`)}const Hx=new be;function HR(a){ze._getMatrix(Hx,ze.workingColorSpace,a);const t=`mat3( ${Hx.elements.map(n=>n.toFixed(4))} )`;switch(ze.getTransfer(a)){case ef:return[t,"LinearTransferOETF"];case Je:return[t,"sRGBTransferOETF"];default:return xe("WebGLProgram: Unsupported color space: ",a),[t,"LinearTransferOETF"]}}function Gx(a,t,n){const s=a.getShaderParameter(t,a.COMPILE_STATUS),c=(a.getShaderInfoLog(t)||"").trim();if(s&&c==="")return"";const u=/ERROR: 0:(\d+)/.exec(c);if(u){const h=parseInt(u[1]);return n.toUpperCase()+`

`+c+`

`+BR(a.getShaderSource(t),h)}else return c}function GR(a,t){const n=HR(t);return[`vec4 ${a}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}const VR={[bm]:"Linear",[Em]:"Reinhard",[Tm]:"Cineon",[Am]:"ACESFilmic",[Cm]:"AgX",[wm]:"Neutral",[Rm]:"Custom"};function kR(a,t){const n=VR[t];return n===void 0?(xe("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+a+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+a+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const Nu=new et;function XR(){ze.getLuminanceCoefficients(Nu);const a=Nu.x.toFixed(4),t=Nu.y.toFixed(4),n=Nu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${a}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function WR(a){return[a.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",a.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ol).join(`
`)}function qR(a){const t=[];for(const n in a){const s=a[n];s!==!1&&t.push("#define "+n+" "+s)}return t.join(`
`)}function YR(a,t){const n={},s=a.getProgramParameter(t,a.ACTIVE_ATTRIBUTES);for(let o=0;o<s;o++){const c=a.getActiveAttrib(t,o),u=c.name;let h=1;c.type===a.FLOAT_MAT2&&(h=2),c.type===a.FLOAT_MAT3&&(h=3),c.type===a.FLOAT_MAT4&&(h=4),n[u]={type:c.type,location:a.getAttribLocation(t,u),locationSize:h}}return n}function Ol(a){return a!==""}function Vx(a,t){const n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return a.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function kx(a,t){return a.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const ZR=/^[ \t]*#include +<([\w\d./]+)>/gm;function hm(a){return a.replace(ZR,jR)}const KR=new Map;function jR(a,t){let n=Ae[t];if(n===void 0){const s=KR.get(t);if(s!==void 0)n=Ae[s],xe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,s);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return hm(n)}const QR=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xx(a){return a.replace(QR,JR)}function JR(a,t,n,s){let o="";for(let c=parseInt(t);c<parseInt(n);c++)o+=s.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return o}function Wx(a){let t=`precision ${a.precision} float;
	precision ${a.precision} int;
	precision ${a.precision} sampler2D;
	precision ${a.precision} samplerCube;
	precision ${a.precision} sampler3D;
	precision ${a.precision} sampler2DArray;
	precision ${a.precision} sampler2DShadow;
	precision ${a.precision} samplerCubeShadow;
	precision ${a.precision} sampler2DArrayShadow;
	precision ${a.precision} isampler2D;
	precision ${a.precision} isampler3D;
	precision ${a.precision} isamplerCube;
	precision ${a.precision} isampler2DArray;
	precision ${a.precision} usampler2D;
	precision ${a.precision} usampler3D;
	precision ${a.precision} usamplerCube;
	precision ${a.precision} usampler2DArray;
	`;return a.precision==="highp"?t+=`
#define HIGH_PRECISION`:a.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:a.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}const $R={[Gu]:"SHADOWMAP_TYPE_PCF",[Pl]:"SHADOWMAP_TYPE_VSM"};function tC(a){return $R[a.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const eC={[pr]:"ENVMAP_TYPE_CUBE",[So]:"ENVMAP_TYPE_CUBE",[mf]:"ENVMAP_TYPE_CUBE_UV"};function nC(a){return a.envMap===!1?"ENVMAP_TYPE_CUBE":eC[a.envMapMode]||"ENVMAP_TYPE_CUBE"}const iC={[So]:"ENVMAP_MODE_REFRACTION"};function aC(a){return a.envMap===!1?"ENVMAP_MODE_REFLECTION":iC[a.envMapMode]||"ENVMAP_MODE_REFLECTION"}const sC={[Oy]:"ENVMAP_BLENDING_MULTIPLY",[VE]:"ENVMAP_BLENDING_MIX",[kE]:"ENVMAP_BLENDING_ADD"};function rC(a){return a.envMap===!1?"ENVMAP_BLENDING_NONE":sC[a.combine]||"ENVMAP_BLENDING_NONE"}function oC(a){const t=a.envMapCubeUVHeight;if(t===null)return null;const n=Math.log2(t)-2,s=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:s,maxMip:n}}function lC(a,t,n,s){const o=a.getContext(),c=n.defines;let u=n.vertexShader,h=n.fragmentShader;const m=tC(n),d=nC(n),g=aC(n),v=rC(n),_=oC(n),S=WR(n),b=qR(c),R=o.createProgram();let x,y,P=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(x=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,b].filter(Ol).join(`
`),x.length>0&&(x+=`
`),y=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,b].filter(Ol).join(`
`),y.length>0&&(y+=`
`)):(x=[Wx(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,b,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+g:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+m:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ol).join(`
`),y=[Wx(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,b,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+d:"",n.envMap?"#define "+g:"",n.envMap?"#define "+v:"",_?"#define CUBEUV_TEXEL_WIDTH "+_.texelWidth:"",_?"#define CUBEUV_TEXEL_HEIGHT "+_.texelHeight:"",_?"#define CUBEUV_MAX_MIP "+_.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+m:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ma?"#define TONE_MAPPING":"",n.toneMapping!==Ma?Ae.tonemapping_pars_fragment:"",n.toneMapping!==Ma?kR("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Ae.colorspace_pars_fragment,GR("linearToOutputTexel",n.outputColorSpace),XR(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Ol).join(`
`)),u=hm(u),u=Vx(u,n),u=kx(u,n),h=hm(h),h=Vx(h,n),h=kx(h,n),u=Xx(u),h=Xx(h),n.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,x=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,y=["#define varying in",n.glslVersion===Qv?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Qv?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);const z=P+x+u,C=P+y+h,L=Bx(o,o.VERTEX_SHADER,z),D=Bx(o,o.FRAGMENT_SHADER,C);o.attachShader(R,L),o.attachShader(R,D),n.index0AttributeName!==void 0?o.bindAttribLocation(R,0,n.index0AttributeName):n.hasPositionAttribute===!0&&o.bindAttribLocation(R,0,"position"),o.linkProgram(R);function B(H){if(a.debug.checkShaderErrors){const W=o.getProgramInfoLog(R)||"",lt=o.getShaderInfoLog(L)||"",ct=o.getShaderInfoLog(D)||"",J=W.trim(),I=lt.trim(),V=ct.trim();let $=!0,ft=!0;if(o.getProgramParameter(R,o.LINK_STATUS)===!1)if($=!1,typeof a.debug.onShaderError=="function")a.debug.onShaderError(o,R,L,D);else{const bt=Gx(o,L,"vertex"),F=Gx(o,D,"fragment");Be("WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(R,o.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+J+`
`+bt+`
`+F)}else J!==""?xe("WebGLProgram: Program Info Log:",J):(I===""||V==="")&&(ft=!1);ft&&(H.diagnostics={runnable:$,programLog:J,vertexShader:{log:I,prefix:x},fragmentShader:{log:V,prefix:y}})}o.deleteShader(L),o.deleteShader(D),T=new Zu(o,R),N=YR(o,R)}let T;this.getUniforms=function(){return T===void 0&&B(this),T};let N;this.getAttributes=function(){return N===void 0&&B(this),N};let G=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return G===!1&&(G=o.getProgramParameter(R,FR)),G},this.destroy=function(){s.releaseStatesOfProgram(this),o.deleteProgram(R),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=IR++,this.cacheKey=t,this.usedTimes=1,this.program=R,this.vertexShader=L,this.fragmentShader=D,this}let cC=0;class uC{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,s){const o=this._getShaderCacheForMaterial(t);return o.has(n)===!1&&(o.add(n),n.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(t){const n=this.materialCache.get(t);for(const s of n)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const n=this.materialCache;let s=n.get(t);return s===void 0&&(s=new Set,n.set(t,s)),s}_getShaderStage(t){const n=this.shaderCache;let s=n.get(t);return s===void 0&&(s=new fC(t),n.set(t,s)),s}}class fC{constructor(t){this.id=cC++,this.code=t,this.usedTimes=0}}function hC(a){return a===mr||a===Ju||a===$u}function dC(a,t,n,s,o,c){const u=new qy,h=new uC,m=new Set,d=[],g=new Map,v=s.logarithmicDepthBuffer;let _=s.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function b(T){return m.add(T),T===0?"uv":`uv${T}`}function R(T,N,G,H,W,lt){const ct=H.fog,J=W.geometry,I=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?H.environment:null,V=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap,$=t.get(T.envMap||I,V),ft=$&&$.mapping===mf?$.image.height:null,bt=S[T.type];T.precision!==null&&(_=s.getMaxPrecision(T.precision),_!==T.precision&&xe("WebGLProgram.getParameters:",T.precision,"not supported, using",_,"instead."));const F=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,q=F!==void 0?F.length:0;let vt=0;J.morphAttributes.position!==void 0&&(vt=1),J.morphAttributes.normal!==void 0&&(vt=2),J.morphAttributes.color!==void 0&&(vt=3);let Ct,Mt,K,yt;if(bt){const Vt=_a[bt];Ct=Vt.vertexShader,Mt=Vt.fragmentShader}else{Ct=T.vertexShader,Mt=T.fragmentShader;const Vt=h.getVertexShaderStage(T),te=h.getFragmentShaderStage(T);h.update(T,Vt,te),K=Vt.id,yt=te.id}const xt=a.getRenderTarget(),Et=a.state.buffers.depth.getReversed(),Dt=W.isInstancedMesh===!0,Ut=W.isBatchedMesh===!0,Yt=!!T.map,It=!!T.matcap,Ht=!!$,Wt=!!T.aoMap,ae=!!T.lightMap,oe=!!T.bumpMap&&T.wireframe===!1,ce=!!T.normalMap,me=!!T.displacementMap,ee=!!T.emissiveMap,le=!!T.metalnessMap,_e=!!T.roughnessMap,X=T.anisotropy>0,fe=T.clearcoat>0,de=T.dispersion>0,O=T.iridescence>0,E=T.sheen>0,Q=T.transmission>0,it=X&&!!T.anisotropyMap,mt=fe&&!!T.clearcoatMap,Lt=fe&&!!T.clearcoatNormalMap,A=fe&&!!T.clearcoatRoughnessMap,ht=O&&!!T.iridescenceMap,pt=O&&!!T.iridescenceThicknessMap,Ot=E&&!!T.sheenColorMap,Bt=E&&!!T.sheenRoughnessMap,Ft=!!T.specularMap,Nt=!!T.specularColorMap,ne=!!T.specularIntensityMap,Jt=Q&&!!T.transmissionMap,ie=Q&&!!T.thicknessMap,Y=!!T.gradientMap,Pt=!!T.alphaMap,gt=T.alphaTest>0,zt=!!T.alphaHash,Gt=!!T.extensions;let At=Ma;T.toneMapped&&(xt===null||xt.isXRRenderTarget===!0)&&(At=a.toneMapping);const qt={shaderID:bt,shaderType:T.type,shaderName:T.name,vertexShader:Ct,fragmentShader:Mt,defines:T.defines,customVertexShaderID:K,customFragmentShaderID:yt,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:_,batching:Ut,batchingColor:Ut&&W._colorsTexture!==null,instancing:Dt,instancingColor:Dt&&W.instanceColor!==null,instancingMorph:Dt&&W.morphTexture!==null,outputColorSpace:xt===null?a.outputColorSpace:xt.isXRRenderTarget===!0?xt.texture.colorSpace:ze.workingColorSpace,alphaToCoverage:!!T.alphaToCoverage,map:Yt,matcap:It,envMap:Ht,envMapMode:Ht&&$.mapping,envMapCubeUVHeight:ft,aoMap:Wt,lightMap:ae,bumpMap:oe,normalMap:ce,displacementMap:me,emissiveMap:ee,normalMapObjectSpace:ce&&T.normalMapType===qE,normalMapTangentSpace:ce&&T.normalMapType===Kv,packedNormalMap:ce&&T.normalMapType===Kv&&hC(T.normalMap.format),metalnessMap:le,roughnessMap:_e,anisotropy:X,anisotropyMap:it,clearcoat:fe,clearcoatMap:mt,clearcoatNormalMap:Lt,clearcoatRoughnessMap:A,dispersion:de,iridescence:O,iridescenceMap:ht,iridescenceThicknessMap:pt,sheen:E,sheenColorMap:Ot,sheenRoughnessMap:Bt,specularMap:Ft,specularColorMap:Nt,specularIntensityMap:ne,transmission:Q,transmissionMap:Jt,thicknessMap:ie,gradientMap:Y,opaque:T.transparent===!1&&T.blending===_o&&T.alphaToCoverage===!1,alphaMap:Pt,alphaTest:gt,alphaHash:zt,combine:T.combine,mapUv:Yt&&b(T.map.channel),aoMapUv:Wt&&b(T.aoMap.channel),lightMapUv:ae&&b(T.lightMap.channel),bumpMapUv:oe&&b(T.bumpMap.channel),normalMapUv:ce&&b(T.normalMap.channel),displacementMapUv:me&&b(T.displacementMap.channel),emissiveMapUv:ee&&b(T.emissiveMap.channel),metalnessMapUv:le&&b(T.metalnessMap.channel),roughnessMapUv:_e&&b(T.roughnessMap.channel),anisotropyMapUv:it&&b(T.anisotropyMap.channel),clearcoatMapUv:mt&&b(T.clearcoatMap.channel),clearcoatNormalMapUv:Lt&&b(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:A&&b(T.clearcoatRoughnessMap.channel),iridescenceMapUv:ht&&b(T.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&b(T.iridescenceThicknessMap.channel),sheenColorMapUv:Ot&&b(T.sheenColorMap.channel),sheenRoughnessMapUv:Bt&&b(T.sheenRoughnessMap.channel),specularMapUv:Ft&&b(T.specularMap.channel),specularColorMapUv:Nt&&b(T.specularColorMap.channel),specularIntensityMapUv:ne&&b(T.specularIntensityMap.channel),transmissionMapUv:Jt&&b(T.transmissionMap.channel),thicknessMapUv:ie&&b(T.thicknessMap.channel),alphaMapUv:Pt&&b(T.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(ce||X),vertexNormals:!!J.attributes.normal,vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!J.attributes.uv&&(Yt||Pt),fog:!!ct,useFog:T.fog===!0,fogExp2:!!ct&&ct.isFogExp2,flatShading:T.wireframe===!1&&(T.flatShading===!0||J.attributes.normal===void 0&&ce===!1&&(T.isMeshLambertMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isMeshPhysicalMaterial)),sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:v,reversedDepthBuffer:Et,skinning:W.isSkinnedMesh===!0,hasPositionAttribute:J.attributes.position!==void 0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:q,morphTextureStride:vt,numDirLights:N.directional.length,numPointLights:N.point.length,numSpotLights:N.spot.length,numSpotLightMaps:N.spotLightMap.length,numRectAreaLights:N.rectArea.length,numHemiLights:N.hemi.length,numDirLightShadows:N.directionalShadowMap.length,numPointLightShadows:N.pointShadowMap.length,numSpotLightShadows:N.spotShadowMap.length,numSpotLightShadowsWithMaps:N.numSpotLightShadowsWithMaps,numLightProbes:N.numLightProbes,numLightProbeGrids:lt.length,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:T.dithering,shadowMapEnabled:a.shadowMap.enabled&&G.length>0,shadowMapType:a.shadowMap.type,toneMapping:At,decodeVideoTexture:Yt&&T.map.isVideoTexture===!0&&ze.getTransfer(T.map.colorSpace)===Je,decodeVideoTextureEmissive:ee&&T.emissiveMap.isVideoTexture===!0&&ze.getTransfer(T.emissiveMap.colorSpace)===Je,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Ya,flipSided:T.side===li,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Gt&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Gt&&T.extensions.multiDraw===!0||Ut)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return qt.vertexUv1s=m.has(1),qt.vertexUv2s=m.has(2),qt.vertexUv3s=m.has(3),m.clear(),qt}function x(T){const N=[];if(T.shaderID?N.push(T.shaderID):(N.push(T.customVertexShaderID),N.push(T.customFragmentShaderID)),T.defines!==void 0)for(const G in T.defines)N.push(G),N.push(T.defines[G]);return T.isRawShaderMaterial===!1&&(y(N,T),P(N,T),N.push(a.outputColorSpace)),N.push(T.customProgramCacheKey),N.join()}function y(T,N){T.push(N.precision),T.push(N.outputColorSpace),T.push(N.envMapMode),T.push(N.envMapCubeUVHeight),T.push(N.mapUv),T.push(N.alphaMapUv),T.push(N.lightMapUv),T.push(N.aoMapUv),T.push(N.bumpMapUv),T.push(N.normalMapUv),T.push(N.displacementMapUv),T.push(N.emissiveMapUv),T.push(N.metalnessMapUv),T.push(N.roughnessMapUv),T.push(N.anisotropyMapUv),T.push(N.clearcoatMapUv),T.push(N.clearcoatNormalMapUv),T.push(N.clearcoatRoughnessMapUv),T.push(N.iridescenceMapUv),T.push(N.iridescenceThicknessMapUv),T.push(N.sheenColorMapUv),T.push(N.sheenRoughnessMapUv),T.push(N.specularMapUv),T.push(N.specularColorMapUv),T.push(N.specularIntensityMapUv),T.push(N.transmissionMapUv),T.push(N.thicknessMapUv),T.push(N.combine),T.push(N.fogExp2),T.push(N.sizeAttenuation),T.push(N.morphTargetsCount),T.push(N.morphAttributeCount),T.push(N.numDirLights),T.push(N.numPointLights),T.push(N.numSpotLights),T.push(N.numSpotLightMaps),T.push(N.numHemiLights),T.push(N.numRectAreaLights),T.push(N.numDirLightShadows),T.push(N.numPointLightShadows),T.push(N.numSpotLightShadows),T.push(N.numSpotLightShadowsWithMaps),T.push(N.numLightProbes),T.push(N.shadowMapType),T.push(N.toneMapping),T.push(N.numClippingPlanes),T.push(N.numClipIntersection),T.push(N.depthPacking)}function P(T,N){u.disableAll(),N.instancing&&u.enable(0),N.instancingColor&&u.enable(1),N.instancingMorph&&u.enable(2),N.matcap&&u.enable(3),N.envMap&&u.enable(4),N.normalMapObjectSpace&&u.enable(5),N.normalMapTangentSpace&&u.enable(6),N.clearcoat&&u.enable(7),N.iridescence&&u.enable(8),N.alphaTest&&u.enable(9),N.vertexColors&&u.enable(10),N.vertexAlphas&&u.enable(11),N.vertexUv1s&&u.enable(12),N.vertexUv2s&&u.enable(13),N.vertexUv3s&&u.enable(14),N.vertexTangents&&u.enable(15),N.anisotropy&&u.enable(16),N.alphaHash&&u.enable(17),N.batching&&u.enable(18),N.dispersion&&u.enable(19),N.batchingColor&&u.enable(20),N.gradientMap&&u.enable(21),N.packedNormalMap&&u.enable(22),N.vertexNormals&&u.enable(23),T.push(u.mask),u.disableAll(),N.fog&&u.enable(0),N.useFog&&u.enable(1),N.flatShading&&u.enable(2),N.logarithmicDepthBuffer&&u.enable(3),N.reversedDepthBuffer&&u.enable(4),N.skinning&&u.enable(5),N.morphTargets&&u.enable(6),N.morphNormals&&u.enable(7),N.morphColors&&u.enable(8),N.premultipliedAlpha&&u.enable(9),N.shadowMapEnabled&&u.enable(10),N.doubleSided&&u.enable(11),N.flipSided&&u.enable(12),N.useDepthPacking&&u.enable(13),N.dithering&&u.enable(14),N.transmission&&u.enable(15),N.sheen&&u.enable(16),N.opaque&&u.enable(17),N.pointsUvs&&u.enable(18),N.decodeVideoTexture&&u.enable(19),N.decodeVideoTextureEmissive&&u.enable(20),N.alphaToCoverage&&u.enable(21),N.numLightProbeGrids>0&&u.enable(22),N.hasPositionAttribute&&u.enable(23),T.push(u.mask)}function z(T){const N=S[T.type];let G;if(N){const H=_a[N];G=Gl.clone(H.uniforms)}else G=T.uniforms;return G}function C(T,N){let G=g.get(N);return G!==void 0?++G.usedTimes:(G=new lC(a,N,T,o),d.push(G),g.set(N,G)),G}function L(T){if(--T.usedTimes===0){const N=d.indexOf(T);d[N]=d[d.length-1],d.pop(),g.delete(T.cacheKey),T.destroy()}}function D(T){h.remove(T)}function B(){h.dispose()}return{getParameters:R,getProgramCacheKey:x,getUniforms:z,acquireProgram:C,releaseProgram:L,releaseShaderCache:D,programs:d,dispose:B}}function pC(){let a=new WeakMap;function t(u){return a.has(u)}function n(u){let h=a.get(u);return h===void 0&&(h={},a.set(u,h)),h}function s(u){a.delete(u)}function o(u,h,m){a.get(u)[h]=m}function c(){a=new WeakMap}return{has:t,get:n,remove:s,update:o,dispose:c}}function mC(a,t){return a.groupOrder!==t.groupOrder?a.groupOrder-t.groupOrder:a.renderOrder!==t.renderOrder?a.renderOrder-t.renderOrder:a.material.id!==t.material.id?a.material.id-t.material.id:a.materialVariant!==t.materialVariant?a.materialVariant-t.materialVariant:a.z!==t.z?a.z-t.z:a.id-t.id}function qx(a,t){return a.groupOrder!==t.groupOrder?a.groupOrder-t.groupOrder:a.renderOrder!==t.renderOrder?a.renderOrder-t.renderOrder:a.z!==t.z?t.z-a.z:a.id-t.id}function Yx(){const a=[];let t=0;const n=[],s=[],o=[];function c(){t=0,n.length=0,s.length=0,o.length=0}function u(_){let S=0;return _.isInstancedMesh&&(S+=2),_.isSkinnedMesh&&(S+=1),S}function h(_,S,b,R,x,y){let P=a[t];return P===void 0?(P={id:_.id,object:_,geometry:S,material:b,materialVariant:u(_),groupOrder:R,renderOrder:_.renderOrder,z:x,group:y},a[t]=P):(P.id=_.id,P.object=_,P.geometry=S,P.material=b,P.materialVariant=u(_),P.groupOrder=R,P.renderOrder=_.renderOrder,P.z=x,P.group=y),t++,P}function m(_,S,b,R,x,y){const P=h(_,S,b,R,x,y);b.transmission>0?s.push(P):b.transparent===!0?o.push(P):n.push(P)}function d(_,S,b,R,x,y){const P=h(_,S,b,R,x,y);b.transmission>0?s.unshift(P):b.transparent===!0?o.unshift(P):n.unshift(P)}function g(_,S,b){n.length>1&&n.sort(_||mC),s.length>1&&s.sort(S||qx),o.length>1&&o.sort(S||qx),b&&(n.reverse(),s.reverse(),o.reverse())}function v(){for(let _=t,S=a.length;_<S;_++){const b=a[_];if(b.id===null)break;b.id=null,b.object=null,b.geometry=null,b.material=null,b.group=null}}return{opaque:n,transmissive:s,transparent:o,init:c,push:m,unshift:d,finish:v,sort:g}}function gC(){let a=new WeakMap;function t(s,o){const c=a.get(s);let u;return c===void 0?(u=new Yx,a.set(s,[u])):o>=c.length?(u=new Yx,c.push(u)):u=c[o],u}function n(){a=new WeakMap}return{get:t,dispose:n}}function _C(){const a={};return{get:function(t){if(a[t.id]!==void 0)return a[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new et,color:new Ce};break;case"SpotLight":n={position:new et,direction:new et,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new et,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":n={direction:new et,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":n={color:new Ce,position:new et,halfWidth:new et,halfHeight:new et};break}return a[t.id]=n,n}}}function vC(){const a={};return{get:function(t){if(a[t.id]!==void 0)return a[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return a[t.id]=n,n}}}let xC=0;function yC(a,t){return(t.castShadow?2:0)-(a.castShadow?2:0)+(t.map?1:0)-(a.map?1:0)}function SC(a){const t=new _C,n=vC(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let d=0;d<9;d++)s.probe.push(new et);const o=new et,c=new xn,u=new xn;function h(d){let g=0,v=0,_=0;for(let N=0;N<9;N++)s.probe[N].set(0,0,0);let S=0,b=0,R=0,x=0,y=0,P=0,z=0,C=0,L=0,D=0,B=0;d.sort(yC);for(let N=0,G=d.length;N<G;N++){const H=d[N],W=H.color,lt=H.intensity,ct=H.distance;let J=null;if(H.shadow&&H.shadow.map&&(H.shadow.map.texture.format===mr?J=H.shadow.map.texture:J=H.shadow.map.depthTexture||H.shadow.map.texture),H.isAmbientLight)g+=W.r*lt,v+=W.g*lt,_+=W.b*lt;else if(H.isLightProbe){for(let I=0;I<9;I++)s.probe[I].addScaledVector(H.sh.coefficients[I],lt);B++}else if(H.isDirectionalLight){const I=t.get(H);if(I.color.copy(H.color).multiplyScalar(H.intensity),H.castShadow){const V=H.shadow,$=n.get(H);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,s.directionalShadow[S]=$,s.directionalShadowMap[S]=J,s.directionalShadowMatrix[S]=H.shadow.matrix,P++}s.directional[S]=I,S++}else if(H.isSpotLight){const I=t.get(H);I.position.setFromMatrixPosition(H.matrixWorld),I.color.copy(W).multiplyScalar(lt),I.distance=ct,I.coneCos=Math.cos(H.angle),I.penumbraCos=Math.cos(H.angle*(1-H.penumbra)),I.decay=H.decay,s.spot[R]=I;const V=H.shadow;if(H.map&&(s.spotLightMap[L]=H.map,L++,V.updateMatrices(H),H.castShadow&&D++),s.spotLightMatrix[R]=V.matrix,H.castShadow){const $=n.get(H);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,s.spotShadow[R]=$,s.spotShadowMap[R]=J,C++}R++}else if(H.isRectAreaLight){const I=t.get(H);I.color.copy(W).multiplyScalar(lt),I.halfWidth.set(H.width*.5,0,0),I.halfHeight.set(0,H.height*.5,0),s.rectArea[x]=I,x++}else if(H.isPointLight){const I=t.get(H);if(I.color.copy(H.color).multiplyScalar(H.intensity),I.distance=H.distance,I.decay=H.decay,H.castShadow){const V=H.shadow,$=n.get(H);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,$.shadowCameraNear=V.camera.near,$.shadowCameraFar=V.camera.far,s.pointShadow[b]=$,s.pointShadowMap[b]=J,s.pointShadowMatrix[b]=H.shadow.matrix,z++}s.point[b]=I,b++}else if(H.isHemisphereLight){const I=t.get(H);I.skyColor.copy(H.color).multiplyScalar(lt),I.groundColor.copy(H.groundColor).multiplyScalar(lt),s.hemi[y]=I,y++}}x>0&&(a.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=Zt.LTC_FLOAT_1,s.rectAreaLTC2=Zt.LTC_FLOAT_2):(s.rectAreaLTC1=Zt.LTC_HALF_1,s.rectAreaLTC2=Zt.LTC_HALF_2)),s.ambient[0]=g,s.ambient[1]=v,s.ambient[2]=_;const T=s.hash;(T.directionalLength!==S||T.pointLength!==b||T.spotLength!==R||T.rectAreaLength!==x||T.hemiLength!==y||T.numDirectionalShadows!==P||T.numPointShadows!==z||T.numSpotShadows!==C||T.numSpotMaps!==L||T.numLightProbes!==B)&&(s.directional.length=S,s.spot.length=R,s.rectArea.length=x,s.point.length=b,s.hemi.length=y,s.directionalShadow.length=P,s.directionalShadowMap.length=P,s.pointShadow.length=z,s.pointShadowMap.length=z,s.spotShadow.length=C,s.spotShadowMap.length=C,s.directionalShadowMatrix.length=P,s.pointShadowMatrix.length=z,s.spotLightMatrix.length=C+L-D,s.spotLightMap.length=L,s.numSpotLightShadowsWithMaps=D,s.numLightProbes=B,T.directionalLength=S,T.pointLength=b,T.spotLength=R,T.rectAreaLength=x,T.hemiLength=y,T.numDirectionalShadows=P,T.numPointShadows=z,T.numSpotShadows=C,T.numSpotMaps=L,T.numLightProbes=B,s.version=xC++)}function m(d,g){let v=0,_=0,S=0,b=0,R=0;const x=g.matrixWorldInverse;for(let y=0,P=d.length;y<P;y++){const z=d[y];if(z.isDirectionalLight){const C=s.directional[v];C.direction.setFromMatrixPosition(z.matrixWorld),o.setFromMatrixPosition(z.target.matrixWorld),C.direction.sub(o),C.direction.transformDirection(x),v++}else if(z.isSpotLight){const C=s.spot[S];C.position.setFromMatrixPosition(z.matrixWorld),C.position.applyMatrix4(x),C.direction.setFromMatrixPosition(z.matrixWorld),o.setFromMatrixPosition(z.target.matrixWorld),C.direction.sub(o),C.direction.transformDirection(x),S++}else if(z.isRectAreaLight){const C=s.rectArea[b];C.position.setFromMatrixPosition(z.matrixWorld),C.position.applyMatrix4(x),u.identity(),c.copy(z.matrixWorld),c.premultiply(x),u.extractRotation(c),C.halfWidth.set(z.width*.5,0,0),C.halfHeight.set(0,z.height*.5,0),C.halfWidth.applyMatrix4(u),C.halfHeight.applyMatrix4(u),b++}else if(z.isPointLight){const C=s.point[_];C.position.setFromMatrixPosition(z.matrixWorld),C.position.applyMatrix4(x),_++}else if(z.isHemisphereLight){const C=s.hemi[R];C.direction.setFromMatrixPosition(z.matrixWorld),C.direction.transformDirection(x),R++}}}return{setup:h,setupView:m,state:s}}function Zx(a){const t=new SC(a),n=[],s=[],o=[];function c(_){v.camera=_,n.length=0,s.length=0,o.length=0}function u(_){n.push(_)}function h(_){s.push(_)}function m(_){o.push(_)}function d(){t.setup(n)}function g(_){t.setupView(n,_)}const v={lightsArray:n,shadowsArray:s,lightProbeGridArray:o,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:c,state:v,setupLights:d,setupLightsView:g,pushLight:u,pushShadow:h,pushLightProbeGrid:m}}function MC(a){let t=new WeakMap;function n(o,c=0){const u=t.get(o);let h;return u===void 0?(h=new Zx(a),t.set(o,[h])):c>=u.length?(h=new Zx(a),u.push(h)):h=u[c],h}function s(){t=new WeakMap}return{get:n,dispose:s}}const bC=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,EC=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,TC=[new et(1,0,0),new et(-1,0,0),new et(0,1,0),new et(0,-1,0),new et(0,0,1),new et(0,0,-1)],AC=[new et(0,-1,0),new et(0,-1,0),new et(0,0,1),new et(0,0,-1),new et(0,-1,0),new et(0,-1,0)],Kx=new xn,wl=new et,mp=new et;function RC(a,t,n){let s=new Jy;const o=new he,c=new he,u=new bn,h=new PT,m=new OT,d={},g=n.maxTextureSize,v={[Is]:li,[li]:Is,[Ya]:Ya},_=new zn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:bC,fragmentShader:EC}),S=_.clone();S.defines.HORIZONTAL_PASS=1;const b=new On;b.setAttribute("position",new Mn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new Ui(b,_),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gu;let y=this.type;this.render=function(D,B,T){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||D.length===0)return;this.type===bE&&(xe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Gu);const N=a.getRenderTarget(),G=a.getActiveCubeFace(),H=a.getActiveMipmapLevel(),W=a.state;W.setBlending(Sa),W.buffers.depth.getReversed()===!0?W.buffers.color.setClear(0,0,0,0):W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);const lt=y!==this.type;lt&&B.traverse(function(ct){ct.material&&(Array.isArray(ct.material)?ct.material.forEach(J=>J.needsUpdate=!0):ct.material.needsUpdate=!0)});for(let ct=0,J=D.length;ct<J;ct++){const I=D[ct],V=I.shadow;if(V===void 0){xe("WebGLShadowMap:",I,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;o.copy(V.mapSize);const $=V.getFrameExtents();o.multiply($),c.copy(V.mapSize),(o.x>g||o.y>g)&&(o.x>g&&(c.x=Math.floor(g/$.x),o.x=c.x*$.x,V.mapSize.x=c.x),o.y>g&&(c.y=Math.floor(g/$.y),o.y=c.y*$.y,V.mapSize.y=c.y));const ft=a.state.buffers.depth.getReversed();if(V.camera._reversedDepth=ft,V.map===null||lt===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Pl){if(I.isPointLight){xe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new _i(o.x,o.y,{format:mr,type:Di,minFilter:ti,magFilter:ti,generateMipmaps:!1}),V.map.texture.name=I.name+".shadowMap",V.map.depthTexture=new Mo(o.x,o.y,xa),V.map.depthTexture.name=I.name+".shadowMapDepth",V.map.depthTexture.format=Ja,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Zn,V.map.depthTexture.magFilter=Zn}else I.isPointLight?(V.map=new oS(o.x),V.map.depthTexture=new DT(o.x,Ea)):(V.map=new _i(o.x,o.y),V.map.depthTexture=new Mo(o.x,o.y,Ea)),V.map.depthTexture.name=I.name+".shadowMap",V.map.depthTexture.format=Ja,this.type===Gu?(V.map.depthTexture.compareFunction=ft?Fm:zm,V.map.depthTexture.minFilter=ti,V.map.depthTexture.magFilter=ti):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Zn,V.map.depthTexture.magFilter=Zn);V.camera.updateProjectionMatrix()}const bt=V.map.isWebGLCubeRenderTarget?6:1;for(let F=0;F<bt;F++){if(V.map.isWebGLCubeRenderTarget)a.setRenderTarget(V.map,F),a.clear();else{F===0&&(a.setRenderTarget(V.map),a.clear());const q=V.getViewport(F);u.set(c.x*q.x,c.y*q.y,c.x*q.z,c.y*q.w),W.viewport(u)}if(I.isPointLight){const q=V.camera,vt=V.matrix,Ct=I.distance||q.far;Ct!==q.far&&(q.far=Ct,q.updateProjectionMatrix()),wl.setFromMatrixPosition(I.matrixWorld),q.position.copy(wl),mp.copy(q.position),mp.add(TC[F]),q.up.copy(AC[F]),q.lookAt(mp),q.updateMatrixWorld(),vt.makeTranslation(-wl.x,-wl.y,-wl.z),Kx.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Kx,q.coordinateSystem,q.reversedDepth)}else V.updateMatrices(I);s=V.getFrustum(),C(B,T,V.camera,I,this.type)}V.isPointLightShadow!==!0&&this.type===Pl&&P(V,T),V.needsUpdate=!1}y=this.type,x.needsUpdate=!1,a.setRenderTarget(N,G,H)};function P(D,B){const T=t.update(R);_.defines.VSM_SAMPLES!==D.blurSamples&&(_.defines.VSM_SAMPLES=D.blurSamples,S.defines.VSM_SAMPLES=D.blurSamples,_.needsUpdate=!0,S.needsUpdate=!0),D.mapPass===null&&(D.mapPass=new _i(o.x,o.y,{format:mr,type:Di})),_.uniforms.shadow_pass.value=D.map.depthTexture,_.uniforms.resolution.value=D.mapSize,_.uniforms.radius.value=D.radius,a.setRenderTarget(D.mapPass),a.clear(),a.renderBufferDirect(B,null,T,_,R,null),S.uniforms.shadow_pass.value=D.mapPass.texture,S.uniforms.resolution.value=D.mapSize,S.uniforms.radius.value=D.radius,a.setRenderTarget(D.map),a.clear(),a.renderBufferDirect(B,null,T,S,R,null)}function z(D,B,T,N){let G=null;const H=T.isPointLight===!0?D.customDistanceMaterial:D.customDepthMaterial;if(H!==void 0)G=H;else if(G=T.isPointLight===!0?m:h,a.localClippingEnabled&&B.clipShadows===!0&&Array.isArray(B.clippingPlanes)&&B.clippingPlanes.length!==0||B.displacementMap&&B.displacementScale!==0||B.alphaMap&&B.alphaTest>0||B.map&&B.alphaTest>0||B.alphaToCoverage===!0){const W=G.uuid,lt=B.uuid;let ct=d[W];ct===void 0&&(ct={},d[W]=ct);let J=ct[lt];J===void 0&&(J=G.clone(),ct[lt]=J,B.addEventListener("dispose",L)),G=J}if(G.visible=B.visible,G.wireframe=B.wireframe,N===Pl?G.side=B.shadowSide!==null?B.shadowSide:B.side:G.side=B.shadowSide!==null?B.shadowSide:v[B.side],G.alphaMap=B.alphaMap,G.alphaTest=B.alphaToCoverage===!0?.5:B.alphaTest,G.map=B.map,G.clipShadows=B.clipShadows,G.clippingPlanes=B.clippingPlanes,G.clipIntersection=B.clipIntersection,G.displacementMap=B.displacementMap,G.displacementScale=B.displacementScale,G.displacementBias=B.displacementBias,G.wireframeLinewidth=B.wireframeLinewidth,G.linewidth=B.linewidth,T.isPointLight===!0&&G.isMeshDistanceMaterial===!0){const W=a.properties.get(G);W.light=T}return G}function C(D,B,T,N,G){if(D.visible===!1)return;if(D.layers.test(B.layers)&&(D.isMesh||D.isLine||D.isPoints)&&(D.castShadow||D.receiveShadow&&G===Pl)&&(!D.frustumCulled||s.intersectsObject(D))){D.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,D.matrixWorld);const lt=t.update(D),ct=D.material;if(Array.isArray(ct)){const J=lt.groups;for(let I=0,V=J.length;I<V;I++){const $=J[I],ft=ct[$.materialIndex];if(ft&&ft.visible){const bt=z(D,ft,N,G);D.onBeforeShadow(a,D,B,T,lt,bt,$),a.renderBufferDirect(T,null,lt,bt,D,$),D.onAfterShadow(a,D,B,T,lt,bt,$)}}}else if(ct.visible){const J=z(D,ct,N,G);D.onBeforeShadow(a,D,B,T,lt,J,null),a.renderBufferDirect(T,null,lt,J,D,null),D.onAfterShadow(a,D,B,T,lt,J,null)}}const W=D.children;for(let lt=0,ct=W.length;lt<ct;lt++)C(W[lt],B,T,N,G)}function L(D){D.target.removeEventListener("dispose",L);for(const T in d){const N=d[T],G=D.target.uuid;G in N&&(N[G].dispose(),delete N[G])}}}function CC(a,t){function n(){let Y=!1;const Pt=new bn;let gt=null;const zt=new bn(0,0,0,0);return{setMask:function(Gt){gt!==Gt&&!Y&&(a.colorMask(Gt,Gt,Gt,Gt),gt=Gt)},setLocked:function(Gt){Y=Gt},setClear:function(Gt,At,qt,Vt,te){te===!0&&(Gt*=Vt,At*=Vt,qt*=Vt),Pt.set(Gt,At,qt,Vt),zt.equals(Pt)===!1&&(a.clearColor(Gt,At,qt,Vt),zt.copy(Pt))},reset:function(){Y=!1,gt=null,zt.set(-1,0,0,0)}}}function s(){let Y=!1,Pt=!1,gt=null,zt=null,Gt=null;return{setReversed:function(At){if(Pt!==At){const qt=t.get("EXT_clip_control");At?qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.ZERO_TO_ONE_EXT):qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.NEGATIVE_ONE_TO_ONE_EXT),Pt=At;const Vt=Gt;Gt=null,this.setClear(Vt)}},getReversed:function(){return Pt},setTest:function(At){At?xt(a.DEPTH_TEST):Et(a.DEPTH_TEST)},setMask:function(At){gt!==At&&!Y&&(a.depthMask(At),gt=At)},setFunc:function(At){if(Pt&&(At=nT[At]),zt!==At){switch(At){case bp:a.depthFunc(a.NEVER);break;case Ep:a.depthFunc(a.ALWAYS);break;case Tp:a.depthFunc(a.LESS);break;case yo:a.depthFunc(a.LEQUAL);break;case Ap:a.depthFunc(a.EQUAL);break;case Rp:a.depthFunc(a.GEQUAL);break;case Cp:a.depthFunc(a.GREATER);break;case wp:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}zt=At}},setLocked:function(At){Y=At},setClear:function(At){Gt!==At&&(Gt=At,Pt&&(At=1-At),a.clearDepth(At))},reset:function(){Y=!1,gt=null,zt=null,Gt=null,Pt=!1}}}function o(){let Y=!1,Pt=null,gt=null,zt=null,Gt=null,At=null,qt=null,Vt=null,te=null;return{setTest:function(ye){Y||(ye?xt(a.STENCIL_TEST):Et(a.STENCIL_TEST))},setMask:function(ye){Pt!==ye&&!Y&&(a.stencilMask(ye),Pt=ye)},setFunc:function(ye,Ze,_n){(gt!==ye||zt!==Ze||Gt!==_n)&&(a.stencilFunc(ye,Ze,_n),gt=ye,zt=Ze,Gt=_n)},setOp:function(ye,Ze,_n){(At!==ye||qt!==Ze||Vt!==_n)&&(a.stencilOp(ye,Ze,_n),At=ye,qt=Ze,Vt=_n)},setLocked:function(ye){Y=ye},setClear:function(ye){te!==ye&&(a.clearStencil(ye),te=ye)},reset:function(){Y=!1,Pt=null,gt=null,zt=null,Gt=null,At=null,qt=null,Vt=null,te=null}}}const c=new n,u=new s,h=new o,m=new WeakMap,d=new WeakMap;let g={},v={},_={},S=new WeakMap,b=[],R=null,x=!1,y=null,P=null,z=null,C=null,L=null,D=null,B=null,T=new Ce(0,0,0),N=0,G=!1,H=null,W=null,lt=null,ct=null,J=null;const I=a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,$=0;const ft=a.getParameter(a.VERSION);ft.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(ft)[1]),V=$>=1):ft.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(ft)[1]),V=$>=2);let bt=null,F={};const q=a.getParameter(a.SCISSOR_BOX),vt=a.getParameter(a.VIEWPORT),Ct=new bn().fromArray(q),Mt=new bn().fromArray(vt);function K(Y,Pt,gt,zt){const Gt=new Uint8Array(4),At=a.createTexture();a.bindTexture(Y,At),a.texParameteri(Y,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(Y,a.TEXTURE_MAG_FILTER,a.NEAREST);for(let qt=0;qt<gt;qt++)Y===a.TEXTURE_3D||Y===a.TEXTURE_2D_ARRAY?a.texImage3D(Pt,0,a.RGBA,1,1,zt,0,a.RGBA,a.UNSIGNED_BYTE,Gt):a.texImage2D(Pt+qt,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,Gt);return At}const yt={};yt[a.TEXTURE_2D]=K(a.TEXTURE_2D,a.TEXTURE_2D,1),yt[a.TEXTURE_CUBE_MAP]=K(a.TEXTURE_CUBE_MAP,a.TEXTURE_CUBE_MAP_POSITIVE_X,6),yt[a.TEXTURE_2D_ARRAY]=K(a.TEXTURE_2D_ARRAY,a.TEXTURE_2D_ARRAY,1,1),yt[a.TEXTURE_3D]=K(a.TEXTURE_3D,a.TEXTURE_3D,1,1),c.setClear(0,0,0,1),u.setClear(1),h.setClear(0),xt(a.DEPTH_TEST),u.setFunc(yo),oe(!1),ce(qv),xt(a.CULL_FACE),Wt(Sa);function xt(Y){g[Y]!==!0&&(a.enable(Y),g[Y]=!0)}function Et(Y){g[Y]!==!1&&(a.disable(Y),g[Y]=!1)}function Dt(Y,Pt){return _[Y]!==Pt?(a.bindFramebuffer(Y,Pt),_[Y]=Pt,Y===a.DRAW_FRAMEBUFFER&&(_[a.FRAMEBUFFER]=Pt),Y===a.FRAMEBUFFER&&(_[a.DRAW_FRAMEBUFFER]=Pt),!0):!1}function Ut(Y,Pt){let gt=b,zt=!1;if(Y){gt=S.get(Pt),gt===void 0&&(gt=[],S.set(Pt,gt));const Gt=Y.textures;if(gt.length!==Gt.length||gt[0]!==a.COLOR_ATTACHMENT0){for(let At=0,qt=Gt.length;At<qt;At++)gt[At]=a.COLOR_ATTACHMENT0+At;gt.length=Gt.length,zt=!0}}else gt[0]!==a.BACK&&(gt[0]=a.BACK,zt=!0);zt&&a.drawBuffers(gt)}function Yt(Y){return R!==Y?(a.useProgram(Y),R=Y,!0):!1}const It={[lr]:a.FUNC_ADD,[TE]:a.FUNC_SUBTRACT,[AE]:a.FUNC_REVERSE_SUBTRACT};It[RE]=a.MIN,It[CE]=a.MAX;const Ht={[wE]:a.ZERO,[DE]:a.ONE,[UE]:a.SRC_COLOR,[Sp]:a.SRC_ALPHA,[FE]:a.SRC_ALPHA_SATURATE,[OE]:a.DST_COLOR,[NE]:a.DST_ALPHA,[LE]:a.ONE_MINUS_SRC_COLOR,[Mp]:a.ONE_MINUS_SRC_ALPHA,[zE]:a.ONE_MINUS_DST_COLOR,[PE]:a.ONE_MINUS_DST_ALPHA,[IE]:a.CONSTANT_COLOR,[BE]:a.ONE_MINUS_CONSTANT_COLOR,[HE]:a.CONSTANT_ALPHA,[GE]:a.ONE_MINUS_CONSTANT_ALPHA};function Wt(Y,Pt,gt,zt,Gt,At,qt,Vt,te,ye){if(Y===Sa){x===!0&&(Et(a.BLEND),x=!1);return}if(x===!1&&(xt(a.BLEND),x=!0),Y!==EE){if(Y!==y||ye!==G){if((P!==lr||L!==lr)&&(a.blendEquation(a.FUNC_ADD),P=lr,L=lr),ye)switch(Y){case _o:a.blendFuncSeparate(a.ONE,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case Ns:a.blendFunc(a.ONE,a.ONE);break;case Yv:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case Zv:a.blendFuncSeparate(a.DST_COLOR,a.ONE_MINUS_SRC_ALPHA,a.ZERO,a.ONE);break;default:Be("WebGLState: Invalid blending: ",Y);break}else switch(Y){case _o:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case Ns:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE,a.ONE,a.ONE);break;case Yv:Be("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Zv:Be("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Be("WebGLState: Invalid blending: ",Y);break}z=null,C=null,D=null,B=null,T.set(0,0,0),N=0,y=Y,G=ye}return}Gt=Gt||Pt,At=At||gt,qt=qt||zt,(Pt!==P||Gt!==L)&&(a.blendEquationSeparate(It[Pt],It[Gt]),P=Pt,L=Gt),(gt!==z||zt!==C||At!==D||qt!==B)&&(a.blendFuncSeparate(Ht[gt],Ht[zt],Ht[At],Ht[qt]),z=gt,C=zt,D=At,B=qt),(Vt.equals(T)===!1||te!==N)&&(a.blendColor(Vt.r,Vt.g,Vt.b,te),T.copy(Vt),N=te),y=Y,G=!1}function ae(Y,Pt){Y.side===Ya?Et(a.CULL_FACE):xt(a.CULL_FACE);let gt=Y.side===li;Pt&&(gt=!gt),oe(gt),Y.blending===_o&&Y.transparent===!1?Wt(Sa):Wt(Y.blending,Y.blendEquation,Y.blendSrc,Y.blendDst,Y.blendEquationAlpha,Y.blendSrcAlpha,Y.blendDstAlpha,Y.blendColor,Y.blendAlpha,Y.premultipliedAlpha),u.setFunc(Y.depthFunc),u.setTest(Y.depthTest),u.setMask(Y.depthWrite),c.setMask(Y.colorWrite);const zt=Y.stencilWrite;h.setTest(zt),zt&&(h.setMask(Y.stencilWriteMask),h.setFunc(Y.stencilFunc,Y.stencilRef,Y.stencilFuncMask),h.setOp(Y.stencilFail,Y.stencilZFail,Y.stencilZPass)),ee(Y.polygonOffset,Y.polygonOffsetFactor,Y.polygonOffsetUnits),Y.alphaToCoverage===!0?xt(a.SAMPLE_ALPHA_TO_COVERAGE):Et(a.SAMPLE_ALPHA_TO_COVERAGE)}function oe(Y){H!==Y&&(Y?a.frontFace(a.CW):a.frontFace(a.CCW),H=Y)}function ce(Y){Y!==SE?(xt(a.CULL_FACE),Y!==W&&(Y===qv?a.cullFace(a.BACK):Y===ME?a.cullFace(a.FRONT):a.cullFace(a.FRONT_AND_BACK))):Et(a.CULL_FACE),W=Y}function me(Y){Y!==lt&&(V&&a.lineWidth(Y),lt=Y)}function ee(Y,Pt,gt){Y?(xt(a.POLYGON_OFFSET_FILL),(ct!==Pt||J!==gt)&&(ct=Pt,J=gt,u.getReversed()&&(Pt=-Pt),a.polygonOffset(Pt,gt))):Et(a.POLYGON_OFFSET_FILL)}function le(Y){Y?xt(a.SCISSOR_TEST):Et(a.SCISSOR_TEST)}function _e(Y){Y===void 0&&(Y=a.TEXTURE0+I-1),bt!==Y&&(a.activeTexture(Y),bt=Y)}function X(Y,Pt,gt){gt===void 0&&(bt===null?gt=a.TEXTURE0+I-1:gt=bt);let zt=F[gt];zt===void 0&&(zt={type:void 0,texture:void 0},F[gt]=zt),(zt.type!==Y||zt.texture!==Pt)&&(bt!==gt&&(a.activeTexture(gt),bt=gt),a.bindTexture(Y,Pt||yt[Y]),zt.type=Y,zt.texture=Pt)}function fe(){const Y=F[bt];Y!==void 0&&Y.type!==void 0&&(a.bindTexture(Y.type,null),Y.type=void 0,Y.texture=void 0)}function de(){try{a.compressedTexImage2D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function O(){try{a.compressedTexImage3D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function E(){try{a.texSubImage2D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function Q(){try{a.texSubImage3D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function it(){try{a.compressedTexSubImage2D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function mt(){try{a.compressedTexSubImage3D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function Lt(){try{a.texStorage2D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function A(){try{a.texStorage3D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function ht(){try{a.texImage2D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function pt(){try{a.texImage3D(...arguments)}catch(Y){Be("WebGLState:",Y)}}function Ot(Y){return v[Y]!==void 0?v[Y]:a.getParameter(Y)}function Bt(Y,Pt){v[Y]!==Pt&&(a.pixelStorei(Y,Pt),v[Y]=Pt)}function Ft(Y){Ct.equals(Y)===!1&&(a.scissor(Y.x,Y.y,Y.z,Y.w),Ct.copy(Y))}function Nt(Y){Mt.equals(Y)===!1&&(a.viewport(Y.x,Y.y,Y.z,Y.w),Mt.copy(Y))}function ne(Y,Pt){let gt=d.get(Pt);gt===void 0&&(gt=new WeakMap,d.set(Pt,gt));let zt=gt.get(Y);zt===void 0&&(zt=a.getUniformBlockIndex(Pt,Y.name),gt.set(Y,zt))}function Jt(Y,Pt){const zt=d.get(Pt).get(Y);m.get(Pt)!==zt&&(a.uniformBlockBinding(Pt,zt,Y.__bindingPointIndex),m.set(Pt,zt))}function ie(){a.disable(a.BLEND),a.disable(a.CULL_FACE),a.disable(a.DEPTH_TEST),a.disable(a.POLYGON_OFFSET_FILL),a.disable(a.SCISSOR_TEST),a.disable(a.STENCIL_TEST),a.disable(a.SAMPLE_ALPHA_TO_COVERAGE),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ZERO),a.blendFuncSeparate(a.ONE,a.ZERO,a.ONE,a.ZERO),a.blendColor(0,0,0,0),a.colorMask(!0,!0,!0,!0),a.clearColor(0,0,0,0),a.depthMask(!0),a.depthFunc(a.LESS),u.setReversed(!1),a.clearDepth(1),a.stencilMask(4294967295),a.stencilFunc(a.ALWAYS,0,4294967295),a.stencilOp(a.KEEP,a.KEEP,a.KEEP),a.clearStencil(0),a.cullFace(a.BACK),a.frontFace(a.CCW),a.polygonOffset(0,0),a.activeTexture(a.TEXTURE0),a.bindFramebuffer(a.FRAMEBUFFER,null),a.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),a.bindFramebuffer(a.READ_FRAMEBUFFER,null),a.useProgram(null),a.lineWidth(1),a.scissor(0,0,a.canvas.width,a.canvas.height),a.viewport(0,0,a.canvas.width,a.canvas.height),a.pixelStorei(a.PACK_ALIGNMENT,4),a.pixelStorei(a.UNPACK_ALIGNMENT,4),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!1),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,a.BROWSER_DEFAULT_WEBGL),a.pixelStorei(a.PACK_ROW_LENGTH,0),a.pixelStorei(a.PACK_SKIP_PIXELS,0),a.pixelStorei(a.PACK_SKIP_ROWS,0),a.pixelStorei(a.UNPACK_ROW_LENGTH,0),a.pixelStorei(a.UNPACK_IMAGE_HEIGHT,0),a.pixelStorei(a.UNPACK_SKIP_PIXELS,0),a.pixelStorei(a.UNPACK_SKIP_ROWS,0),a.pixelStorei(a.UNPACK_SKIP_IMAGES,0),g={},v={},bt=null,F={},_={},S=new WeakMap,b=[],R=null,x=!1,y=null,P=null,z=null,C=null,L=null,D=null,B=null,T=new Ce(0,0,0),N=0,G=!1,H=null,W=null,lt=null,ct=null,J=null,Ct.set(0,0,a.canvas.width,a.canvas.height),Mt.set(0,0,a.canvas.width,a.canvas.height),c.reset(),u.reset(),h.reset()}return{buffers:{color:c,depth:u,stencil:h},enable:xt,disable:Et,bindFramebuffer:Dt,drawBuffers:Ut,useProgram:Yt,setBlending:Wt,setMaterial:ae,setFlipSided:oe,setCullFace:ce,setLineWidth:me,setPolygonOffset:ee,setScissorTest:le,activeTexture:_e,bindTexture:X,unbindTexture:fe,compressedTexImage2D:de,compressedTexImage3D:O,texImage2D:ht,texImage3D:pt,pixelStorei:Bt,getParameter:Ot,updateUBOMapping:ne,uniformBlockBinding:Jt,texStorage2D:Lt,texStorage3D:A,texSubImage2D:E,texSubImage3D:Q,compressedTexSubImage2D:it,compressedTexSubImage3D:mt,scissor:Ft,viewport:Nt,reset:ie}}function wC(a,t,n,s,o,c,u){const h=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),d=new he,g=new WeakMap,v=new Set;let _;const S=new WeakMap;let b=!1;try{b=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function R(O,E){return b?new OffscreenCanvas(O,E):Hl("canvas")}function x(O,E,Q){let it=1;const mt=de(O);if((mt.width>Q||mt.height>Q)&&(it=Q/Math.max(mt.width,mt.height)),it<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){const Lt=Math.floor(it*mt.width),A=Math.floor(it*mt.height);_===void 0&&(_=R(Lt,A));const ht=E?R(Lt,A):_;return ht.width=Lt,ht.height=A,ht.getContext("2d").drawImage(O,0,0,Lt,A),xe("WebGLRenderer: Texture has been resized from ("+mt.width+"x"+mt.height+") to ("+Lt+"x"+A+")."),ht}else return"data"in O&&xe("WebGLRenderer: Image in DataTexture is too big ("+mt.width+"x"+mt.height+")."),O;return O}function y(O){return O.generateMipmaps}function P(O){a.generateMipmap(O)}function z(O){return O.isWebGLCubeRenderTarget?a.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?a.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?a.TEXTURE_2D_ARRAY:a.TEXTURE_2D}function C(O,E,Q,it,mt,Lt=!1){if(O!==null){if(a[O]!==void 0)return a[O];xe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let A;it&&(A=t.get("EXT_texture_norm16"),A||xe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ht=E;if(E===a.RED&&(Q===a.FLOAT&&(ht=a.R32F),Q===a.HALF_FLOAT&&(ht=a.R16F),Q===a.UNSIGNED_BYTE&&(ht=a.R8),Q===a.UNSIGNED_SHORT&&A&&(ht=A.R16_EXT),Q===a.SHORT&&A&&(ht=A.R16_SNORM_EXT)),E===a.RED_INTEGER&&(Q===a.UNSIGNED_BYTE&&(ht=a.R8UI),Q===a.UNSIGNED_SHORT&&(ht=a.R16UI),Q===a.UNSIGNED_INT&&(ht=a.R32UI),Q===a.BYTE&&(ht=a.R8I),Q===a.SHORT&&(ht=a.R16I),Q===a.INT&&(ht=a.R32I)),E===a.RG&&(Q===a.FLOAT&&(ht=a.RG32F),Q===a.HALF_FLOAT&&(ht=a.RG16F),Q===a.UNSIGNED_BYTE&&(ht=a.RG8),Q===a.UNSIGNED_SHORT&&A&&(ht=A.RG16_EXT),Q===a.SHORT&&A&&(ht=A.RG16_SNORM_EXT)),E===a.RG_INTEGER&&(Q===a.UNSIGNED_BYTE&&(ht=a.RG8UI),Q===a.UNSIGNED_SHORT&&(ht=a.RG16UI),Q===a.UNSIGNED_INT&&(ht=a.RG32UI),Q===a.BYTE&&(ht=a.RG8I),Q===a.SHORT&&(ht=a.RG16I),Q===a.INT&&(ht=a.RG32I)),E===a.RGB_INTEGER&&(Q===a.UNSIGNED_BYTE&&(ht=a.RGB8UI),Q===a.UNSIGNED_SHORT&&(ht=a.RGB16UI),Q===a.UNSIGNED_INT&&(ht=a.RGB32UI),Q===a.BYTE&&(ht=a.RGB8I),Q===a.SHORT&&(ht=a.RGB16I),Q===a.INT&&(ht=a.RGB32I)),E===a.RGBA_INTEGER&&(Q===a.UNSIGNED_BYTE&&(ht=a.RGBA8UI),Q===a.UNSIGNED_SHORT&&(ht=a.RGBA16UI),Q===a.UNSIGNED_INT&&(ht=a.RGBA32UI),Q===a.BYTE&&(ht=a.RGBA8I),Q===a.SHORT&&(ht=a.RGBA16I),Q===a.INT&&(ht=a.RGBA32I)),E===a.RGB&&(Q===a.UNSIGNED_SHORT&&A&&(ht=A.RGB16_EXT),Q===a.SHORT&&A&&(ht=A.RGB16_SNORM_EXT),Q===a.UNSIGNED_INT_5_9_9_9_REV&&(ht=a.RGB9_E5),Q===a.UNSIGNED_INT_10F_11F_11F_REV&&(ht=a.R11F_G11F_B10F)),E===a.RGBA){const pt=Lt?ef:ze.getTransfer(mt);Q===a.FLOAT&&(ht=a.RGBA32F),Q===a.HALF_FLOAT&&(ht=a.RGBA16F),Q===a.UNSIGNED_BYTE&&(ht=pt===Je?a.SRGB8_ALPHA8:a.RGBA8),Q===a.UNSIGNED_SHORT&&A&&(ht=A.RGBA16_EXT),Q===a.SHORT&&A&&(ht=A.RGBA16_SNORM_EXT),Q===a.UNSIGNED_SHORT_4_4_4_4&&(ht=a.RGBA4),Q===a.UNSIGNED_SHORT_5_5_5_1&&(ht=a.RGB5_A1)}return(ht===a.R16F||ht===a.R32F||ht===a.RG16F||ht===a.RG32F||ht===a.RGBA16F||ht===a.RGBA32F)&&t.get("EXT_color_buffer_float"),ht}function L(O,E){let Q;return O?E===null||E===Ea||E===Bl?Q=a.DEPTH24_STENCIL8:E===xa?Q=a.DEPTH32F_STENCIL8:E===Il&&(Q=a.DEPTH24_STENCIL8,xe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===Ea||E===Bl?Q=a.DEPTH_COMPONENT24:E===xa?Q=a.DEPTH_COMPONENT32F:E===Il&&(Q=a.DEPTH_COMPONENT16),Q}function D(O,E){return y(O)===!0||O.isFramebufferTexture&&O.minFilter!==Zn&&O.minFilter!==ti?Math.log2(Math.max(E.width,E.height))+1:O.mipmaps!==void 0&&O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?E.mipmaps.length:1}function B(O){const E=O.target;E.removeEventListener("dispose",B),N(E),E.isVideoTexture&&g.delete(E),E.isHTMLTexture&&v.delete(E)}function T(O){const E=O.target;E.removeEventListener("dispose",T),H(E)}function N(O){const E=s.get(O);if(E.__webglInit===void 0)return;const Q=O.source,it=S.get(Q);if(it){const mt=it[E.__cacheKey];mt.usedTimes--,mt.usedTimes===0&&G(O),Object.keys(it).length===0&&S.delete(Q)}s.remove(O)}function G(O){const E=s.get(O);a.deleteTexture(E.__webglTexture);const Q=O.source,it=S.get(Q);delete it[E.__cacheKey],u.memory.textures--}function H(O){const E=s.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),s.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let it=0;it<6;it++){if(Array.isArray(E.__webglFramebuffer[it]))for(let mt=0;mt<E.__webglFramebuffer[it].length;mt++)a.deleteFramebuffer(E.__webglFramebuffer[it][mt]);else a.deleteFramebuffer(E.__webglFramebuffer[it]);E.__webglDepthbuffer&&a.deleteRenderbuffer(E.__webglDepthbuffer[it])}else{if(Array.isArray(E.__webglFramebuffer))for(let it=0;it<E.__webglFramebuffer.length;it++)a.deleteFramebuffer(E.__webglFramebuffer[it]);else a.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&a.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&a.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let it=0;it<E.__webglColorRenderbuffer.length;it++)E.__webglColorRenderbuffer[it]&&a.deleteRenderbuffer(E.__webglColorRenderbuffer[it]);E.__webglDepthRenderbuffer&&a.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const Q=O.textures;for(let it=0,mt=Q.length;it<mt;it++){const Lt=s.get(Q[it]);Lt.__webglTexture&&(a.deleteTexture(Lt.__webglTexture),u.memory.textures--),s.remove(Q[it])}s.remove(O)}let W=0;function lt(){W=0}function ct(){return W}function J(O){W=O}function I(){const O=W;return O>=o.maxTextures&&xe("WebGLTextures: Trying to use "+O+" texture units while this GPU supports only "+o.maxTextures),W+=1,O}function V(O){const E=[];return E.push(O.wrapS),E.push(O.wrapT),E.push(O.wrapR||0),E.push(O.magFilter),E.push(O.minFilter),E.push(O.anisotropy),E.push(O.internalFormat),E.push(O.format),E.push(O.type),E.push(O.generateMipmaps),E.push(O.premultiplyAlpha),E.push(O.flipY),E.push(O.unpackAlignment),E.push(O.colorSpace),E.join()}function $(O,E){const Q=s.get(O);if(O.isVideoTexture&&X(O),O.isRenderTargetTexture===!1&&O.isExternalTexture!==!0&&O.version>0&&Q.__version!==O.version){const it=O.image;if(it===null)xe("WebGLRenderer: Texture marked for update but no image data found.");else if(it.complete===!1)xe("WebGLRenderer: Texture marked for update but image is incomplete");else{Et(Q,O,E);return}}else O.isExternalTexture&&(Q.__webglTexture=O.sourceTexture?O.sourceTexture:null);n.bindTexture(a.TEXTURE_2D,Q.__webglTexture,a.TEXTURE0+E)}function ft(O,E){const Q=s.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Q.__version!==O.version){Et(Q,O,E);return}else O.isExternalTexture&&(Q.__webglTexture=O.sourceTexture?O.sourceTexture:null);n.bindTexture(a.TEXTURE_2D_ARRAY,Q.__webglTexture,a.TEXTURE0+E)}function bt(O,E){const Q=s.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Q.__version!==O.version){Et(Q,O,E);return}n.bindTexture(a.TEXTURE_3D,Q.__webglTexture,a.TEXTURE0+E)}function F(O,E){const Q=s.get(O);if(O.isCubeDepthTexture!==!0&&O.version>0&&Q.__version!==O.version){Dt(Q,O,E);return}n.bindTexture(a.TEXTURE_CUBE_MAP,Q.__webglTexture,a.TEXTURE0+E)}const q={[Dp]:a.REPEAT,[Ka]:a.CLAMP_TO_EDGE,[Up]:a.MIRRORED_REPEAT},vt={[Zn]:a.NEAREST,[XE]:a.NEAREST_MIPMAP_NEAREST,[iu]:a.NEAREST_MIPMAP_LINEAR,[ti]:a.LINEAR,[zd]:a.LINEAR_MIPMAP_NEAREST,[hr]:a.LINEAR_MIPMAP_LINEAR},Ct={[YE]:a.NEVER,[JE]:a.ALWAYS,[ZE]:a.LESS,[zm]:a.LEQUAL,[KE]:a.EQUAL,[Fm]:a.GEQUAL,[jE]:a.GREATER,[QE]:a.NOTEQUAL};function Mt(O,E){if(E.type===xa&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===ti||E.magFilter===zd||E.magFilter===iu||E.magFilter===hr||E.minFilter===ti||E.minFilter===zd||E.minFilter===iu||E.minFilter===hr)&&xe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),a.texParameteri(O,a.TEXTURE_WRAP_S,q[E.wrapS]),a.texParameteri(O,a.TEXTURE_WRAP_T,q[E.wrapT]),(O===a.TEXTURE_3D||O===a.TEXTURE_2D_ARRAY)&&a.texParameteri(O,a.TEXTURE_WRAP_R,q[E.wrapR]),a.texParameteri(O,a.TEXTURE_MAG_FILTER,vt[E.magFilter]),a.texParameteri(O,a.TEXTURE_MIN_FILTER,vt[E.minFilter]),E.compareFunction&&(a.texParameteri(O,a.TEXTURE_COMPARE_MODE,a.COMPARE_REF_TO_TEXTURE),a.texParameteri(O,a.TEXTURE_COMPARE_FUNC,Ct[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===Zn||E.minFilter!==iu&&E.minFilter!==hr||E.type===xa&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||s.get(E).__currentAnisotropy){const Q=t.get("EXT_texture_filter_anisotropic");a.texParameterf(O,Q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,o.getMaxAnisotropy())),s.get(E).__currentAnisotropy=E.anisotropy}}}function K(O,E){let Q=!1;O.__webglInit===void 0&&(O.__webglInit=!0,E.addEventListener("dispose",B));const it=E.source;let mt=S.get(it);mt===void 0&&(mt={},S.set(it,mt));const Lt=V(E);if(Lt!==O.__cacheKey){mt[Lt]===void 0&&(mt[Lt]={texture:a.createTexture(),usedTimes:0},u.memory.textures++,Q=!0),mt[Lt].usedTimes++;const A=mt[O.__cacheKey];A!==void 0&&(mt[O.__cacheKey].usedTimes--,A.usedTimes===0&&G(E)),O.__cacheKey=Lt,O.__webglTexture=mt[Lt].texture}return Q}function yt(O,E,Q){return Math.floor(Math.floor(O/Q)/E)}function xt(O,E,Q,it){const Lt=O.updateRanges;if(Lt.length===0)n.texSubImage2D(a.TEXTURE_2D,0,0,0,E.width,E.height,Q,it,E.data);else{Lt.sort((Bt,Ft)=>Bt.start-Ft.start);let A=0;for(let Bt=1;Bt<Lt.length;Bt++){const Ft=Lt[A],Nt=Lt[Bt],ne=Ft.start+Ft.count,Jt=yt(Nt.start,E.width,4),ie=yt(Ft.start,E.width,4);Nt.start<=ne+1&&Jt===ie&&yt(Nt.start+Nt.count-1,E.width,4)===Jt?Ft.count=Math.max(Ft.count,Nt.start+Nt.count-Ft.start):(++A,Lt[A]=Nt)}Lt.length=A+1;const ht=n.getParameter(a.UNPACK_ROW_LENGTH),pt=n.getParameter(a.UNPACK_SKIP_PIXELS),Ot=n.getParameter(a.UNPACK_SKIP_ROWS);n.pixelStorei(a.UNPACK_ROW_LENGTH,E.width);for(let Bt=0,Ft=Lt.length;Bt<Ft;Bt++){const Nt=Lt[Bt],ne=Math.floor(Nt.start/4),Jt=Math.ceil(Nt.count/4),ie=ne%E.width,Y=Math.floor(ne/E.width),Pt=Jt,gt=1;n.pixelStorei(a.UNPACK_SKIP_PIXELS,ie),n.pixelStorei(a.UNPACK_SKIP_ROWS,Y),n.texSubImage2D(a.TEXTURE_2D,0,ie,Y,Pt,gt,Q,it,E.data)}O.clearUpdateRanges(),n.pixelStorei(a.UNPACK_ROW_LENGTH,ht),n.pixelStorei(a.UNPACK_SKIP_PIXELS,pt),n.pixelStorei(a.UNPACK_SKIP_ROWS,Ot)}}function Et(O,E,Q){let it=a.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(it=a.TEXTURE_2D_ARRAY),E.isData3DTexture&&(it=a.TEXTURE_3D);const mt=K(O,E),Lt=E.source;n.bindTexture(it,O.__webglTexture,a.TEXTURE0+Q);const A=s.get(Lt);if(Lt.version!==A.__version||mt===!0){if(n.activeTexture(a.TEXTURE0+Q),(typeof ImageBitmap<"u"&&E.image instanceof ImageBitmap)===!1){const gt=ze.getPrimaries(ze.workingColorSpace),zt=E.colorSpace===Ps?null:ze.getPrimaries(E.colorSpace),Gt=E.colorSpace===Ps||gt===zt?a.NONE:a.BROWSER_DEFAULT_WEBGL;n.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,E.flipY),n.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),n.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,Gt)}n.pixelStorei(a.UNPACK_ALIGNMENT,E.unpackAlignment);let pt=x(E.image,!1,o.maxTextureSize);pt=fe(E,pt);const Ot=c.convert(E.format,E.colorSpace),Bt=c.convert(E.type);let Ft=C(E.internalFormat,Ot,Bt,E.normalized,E.colorSpace,E.isVideoTexture);Mt(it,E);let Nt;const ne=E.mipmaps,Jt=E.isVideoTexture!==!0,ie=A.__version===void 0||mt===!0,Y=Lt.dataReady,Pt=D(E,pt);if(E.isDepthTexture)Ft=L(E.format===dr,E.type),ie&&(Jt?n.texStorage2D(a.TEXTURE_2D,1,Ft,pt.width,pt.height):n.texImage2D(a.TEXTURE_2D,0,Ft,pt.width,pt.height,0,Ot,Bt,null));else if(E.isDataTexture)if(ne.length>0){Jt&&ie&&n.texStorage2D(a.TEXTURE_2D,Pt,Ft,ne[0].width,ne[0].height);for(let gt=0,zt=ne.length;gt<zt;gt++)Nt=ne[gt],Jt?Y&&n.texSubImage2D(a.TEXTURE_2D,gt,0,0,Nt.width,Nt.height,Ot,Bt,Nt.data):n.texImage2D(a.TEXTURE_2D,gt,Ft,Nt.width,Nt.height,0,Ot,Bt,Nt.data);E.generateMipmaps=!1}else Jt?(ie&&n.texStorage2D(a.TEXTURE_2D,Pt,Ft,pt.width,pt.height),Y&&xt(E,pt,Ot,Bt)):n.texImage2D(a.TEXTURE_2D,0,Ft,pt.width,pt.height,0,Ot,Bt,pt.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Jt&&ie&&n.texStorage3D(a.TEXTURE_2D_ARRAY,Pt,Ft,ne[0].width,ne[0].height,pt.depth);for(let gt=0,zt=ne.length;gt<zt;gt++)if(Nt=ne[gt],E.format!==oa)if(Ot!==null)if(Jt){if(Y)if(E.layerUpdates.size>0){const Gt=Ax(Nt.width,Nt.height,E.format,E.type);for(const At of E.layerUpdates){const qt=Nt.data.subarray(At*Gt/Nt.data.BYTES_PER_ELEMENT,(At+1)*Gt/Nt.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,gt,0,0,At,Nt.width,Nt.height,1,Ot,qt)}E.clearLayerUpdates()}else n.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,gt,0,0,0,Nt.width,Nt.height,pt.depth,Ot,Nt.data)}else n.compressedTexImage3D(a.TEXTURE_2D_ARRAY,gt,Ft,Nt.width,Nt.height,pt.depth,0,Nt.data,0,0);else xe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Jt?Y&&n.texSubImage3D(a.TEXTURE_2D_ARRAY,gt,0,0,0,Nt.width,Nt.height,pt.depth,Ot,Bt,Nt.data):n.texImage3D(a.TEXTURE_2D_ARRAY,gt,Ft,Nt.width,Nt.height,pt.depth,0,Ot,Bt,Nt.data)}else{Jt&&ie&&n.texStorage2D(a.TEXTURE_2D,Pt,Ft,ne[0].width,ne[0].height);for(let gt=0,zt=ne.length;gt<zt;gt++)Nt=ne[gt],E.format!==oa?Ot!==null?Jt?Y&&n.compressedTexSubImage2D(a.TEXTURE_2D,gt,0,0,Nt.width,Nt.height,Ot,Nt.data):n.compressedTexImage2D(a.TEXTURE_2D,gt,Ft,Nt.width,Nt.height,0,Nt.data):xe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Jt?Y&&n.texSubImage2D(a.TEXTURE_2D,gt,0,0,Nt.width,Nt.height,Ot,Bt,Nt.data):n.texImage2D(a.TEXTURE_2D,gt,Ft,Nt.width,Nt.height,0,Ot,Bt,Nt.data)}else if(E.isDataArrayTexture)if(Jt){if(ie&&n.texStorage3D(a.TEXTURE_2D_ARRAY,Pt,Ft,pt.width,pt.height,pt.depth),Y)if(E.layerUpdates.size>0){const gt=Ax(pt.width,pt.height,E.format,E.type);for(const zt of E.layerUpdates){const Gt=pt.data.subarray(zt*gt/pt.data.BYTES_PER_ELEMENT,(zt+1)*gt/pt.data.BYTES_PER_ELEMENT);n.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,zt,pt.width,pt.height,1,Ot,Bt,Gt)}E.clearLayerUpdates()}else n.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,0,pt.width,pt.height,pt.depth,Ot,Bt,pt.data)}else n.texImage3D(a.TEXTURE_2D_ARRAY,0,Ft,pt.width,pt.height,pt.depth,0,Ot,Bt,pt.data);else if(E.isData3DTexture)Jt?(ie&&n.texStorage3D(a.TEXTURE_3D,Pt,Ft,pt.width,pt.height,pt.depth),Y&&n.texSubImage3D(a.TEXTURE_3D,0,0,0,0,pt.width,pt.height,pt.depth,Ot,Bt,pt.data)):n.texImage3D(a.TEXTURE_3D,0,Ft,pt.width,pt.height,pt.depth,0,Ot,Bt,pt.data);else if(E.isFramebufferTexture){if(ie)if(Jt)n.texStorage2D(a.TEXTURE_2D,Pt,Ft,pt.width,pt.height);else{let gt=pt.width,zt=pt.height;for(let Gt=0;Gt<Pt;Gt++)n.texImage2D(a.TEXTURE_2D,Gt,Ft,gt,zt,0,Ot,Bt,null),gt>>=1,zt>>=1}}else if(E.isHTMLTexture){if("texElementImage2D"in a){const gt=a.canvas;if(gt.hasAttribute("layoutsubtree")||gt.setAttribute("layoutsubtree","true"),pt.parentNode!==gt){gt.appendChild(pt),v.add(E),gt.onpaint=zt=>{const Gt=zt.changedElements;for(const At of v)Gt.includes(At.image)&&(At.needsUpdate=!0)},gt.requestPaint();return}if(a.texElementImage2D.length===3)a.texElementImage2D(a.TEXTURE_2D,a.RGBA8,pt);else{const Gt=a.RGBA,At=a.RGBA,qt=a.UNSIGNED_BYTE;a.texElementImage2D(a.TEXTURE_2D,0,Gt,At,qt,pt)}a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE)}}else if(ne.length>0){if(Jt&&ie){const gt=de(ne[0]);n.texStorage2D(a.TEXTURE_2D,Pt,Ft,gt.width,gt.height)}for(let gt=0,zt=ne.length;gt<zt;gt++)Nt=ne[gt],Jt?Y&&n.texSubImage2D(a.TEXTURE_2D,gt,0,0,Ot,Bt,Nt):n.texImage2D(a.TEXTURE_2D,gt,Ft,Ot,Bt,Nt);E.generateMipmaps=!1}else if(Jt){if(ie){const gt=de(pt);n.texStorage2D(a.TEXTURE_2D,Pt,Ft,gt.width,gt.height)}Y&&n.texSubImage2D(a.TEXTURE_2D,0,0,0,Ot,Bt,pt)}else n.texImage2D(a.TEXTURE_2D,0,Ft,Ot,Bt,pt);y(E)&&P(it),A.__version=Lt.version,E.onUpdate&&E.onUpdate(E)}O.__version=E.version}function Dt(O,E,Q){if(E.image.length!==6)return;const it=K(O,E),mt=E.source;n.bindTexture(a.TEXTURE_CUBE_MAP,O.__webglTexture,a.TEXTURE0+Q);const Lt=s.get(mt);if(mt.version!==Lt.__version||it===!0){n.activeTexture(a.TEXTURE0+Q);const A=ze.getPrimaries(ze.workingColorSpace),ht=E.colorSpace===Ps?null:ze.getPrimaries(E.colorSpace),pt=E.colorSpace===Ps||A===ht?a.NONE:a.BROWSER_DEFAULT_WEBGL;n.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,E.flipY),n.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),n.pixelStorei(a.UNPACK_ALIGNMENT,E.unpackAlignment),n.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);const Ot=E.isCompressedTexture||E.image[0].isCompressedTexture,Bt=E.image[0]&&E.image[0].isDataTexture,Ft=[];for(let At=0;At<6;At++)!Ot&&!Bt?Ft[At]=x(E.image[At],!0,o.maxCubemapSize):Ft[At]=Bt?E.image[At].image:E.image[At],Ft[At]=fe(E,Ft[At]);const Nt=Ft[0],ne=c.convert(E.format,E.colorSpace),Jt=c.convert(E.type),ie=C(E.internalFormat,ne,Jt,E.normalized,E.colorSpace),Y=E.isVideoTexture!==!0,Pt=Lt.__version===void 0||it===!0,gt=mt.dataReady;let zt=D(E,Nt);Mt(a.TEXTURE_CUBE_MAP,E);let Gt;if(Ot){Y&&Pt&&n.texStorage2D(a.TEXTURE_CUBE_MAP,zt,ie,Nt.width,Nt.height);for(let At=0;At<6;At++){Gt=Ft[At].mipmaps;for(let qt=0;qt<Gt.length;qt++){const Vt=Gt[qt];E.format!==oa?ne!==null?Y?gt&&n.compressedTexSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt,0,0,Vt.width,Vt.height,ne,Vt.data):n.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt,ie,Vt.width,Vt.height,0,Vt.data):xe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Y?gt&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt,0,0,Vt.width,Vt.height,ne,Jt,Vt.data):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt,ie,Vt.width,Vt.height,0,ne,Jt,Vt.data)}}}else{if(Gt=E.mipmaps,Y&&Pt){Gt.length>0&&zt++;const At=de(Ft[0]);n.texStorage2D(a.TEXTURE_CUBE_MAP,zt,ie,At.width,At.height)}for(let At=0;At<6;At++)if(Bt){Y?gt&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,0,0,Ft[At].width,Ft[At].height,ne,Jt,Ft[At].data):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,ie,Ft[At].width,Ft[At].height,0,ne,Jt,Ft[At].data);for(let qt=0;qt<Gt.length;qt++){const te=Gt[qt].image[At].image;Y?gt&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt+1,0,0,te.width,te.height,ne,Jt,te.data):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt+1,ie,te.width,te.height,0,ne,Jt,te.data)}}else{Y?gt&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,0,0,ne,Jt,Ft[At]):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,ie,ne,Jt,Ft[At]);for(let qt=0;qt<Gt.length;qt++){const Vt=Gt[qt];Y?gt&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt+1,0,0,ne,Jt,Vt.image[At]):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+At,qt+1,ie,ne,Jt,Vt.image[At])}}}y(E)&&P(a.TEXTURE_CUBE_MAP),Lt.__version=mt.version,E.onUpdate&&E.onUpdate(E)}O.__version=E.version}function Ut(O,E,Q,it,mt,Lt){const A=c.convert(Q.format,Q.colorSpace),ht=c.convert(Q.type),pt=C(Q.internalFormat,A,ht,Q.normalized,Q.colorSpace),Ot=s.get(E),Bt=s.get(Q);if(Bt.__renderTarget=E,!Ot.__hasExternalTextures){const Ft=Math.max(1,E.width>>Lt),Nt=Math.max(1,E.height>>Lt);mt===a.TEXTURE_3D||mt===a.TEXTURE_2D_ARRAY?n.texImage3D(mt,Lt,pt,Ft,Nt,E.depth,0,A,ht,null):n.texImage2D(mt,Lt,pt,Ft,Nt,0,A,ht,null)}n.bindFramebuffer(a.FRAMEBUFFER,O),_e(E)?h.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,it,mt,Bt.__webglTexture,0,le(E)):(mt===a.TEXTURE_2D||mt>=a.TEXTURE_CUBE_MAP_POSITIVE_X&&mt<=a.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&a.framebufferTexture2D(a.FRAMEBUFFER,it,mt,Bt.__webglTexture,Lt),n.bindFramebuffer(a.FRAMEBUFFER,null)}function Yt(O,E,Q){if(a.bindRenderbuffer(a.RENDERBUFFER,O),E.depthBuffer){const it=E.depthTexture,mt=it&&it.isDepthTexture?it.type:null,Lt=L(E.stencilBuffer,mt),A=E.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;_e(E)?h.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,le(E),Lt,E.width,E.height):Q?a.renderbufferStorageMultisample(a.RENDERBUFFER,le(E),Lt,E.width,E.height):a.renderbufferStorage(a.RENDERBUFFER,Lt,E.width,E.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,A,a.RENDERBUFFER,O)}else{const it=E.textures;for(let mt=0;mt<it.length;mt++){const Lt=it[mt],A=c.convert(Lt.format,Lt.colorSpace),ht=c.convert(Lt.type),pt=C(Lt.internalFormat,A,ht,Lt.normalized,Lt.colorSpace);_e(E)?h.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,le(E),pt,E.width,E.height):Q?a.renderbufferStorageMultisample(a.RENDERBUFFER,le(E),pt,E.width,E.height):a.renderbufferStorage(a.RENDERBUFFER,pt,E.width,E.height)}}a.bindRenderbuffer(a.RENDERBUFFER,null)}function It(O,E,Q){const it=E.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(a.FRAMEBUFFER,O),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const mt=s.get(E.depthTexture);if(mt.__renderTarget=E,(!mt.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),it){if(mt.__webglInit===void 0&&(mt.__webglInit=!0,E.depthTexture.addEventListener("dispose",B)),mt.__webglTexture===void 0){mt.__webglTexture=a.createTexture(),n.bindTexture(a.TEXTURE_CUBE_MAP,mt.__webglTexture),Mt(a.TEXTURE_CUBE_MAP,E.depthTexture);const Ot=c.convert(E.depthTexture.format),Bt=c.convert(E.depthTexture.type);let Ft;E.depthTexture.format===Ja?Ft=a.DEPTH_COMPONENT24:E.depthTexture.format===dr&&(Ft=a.DEPTH24_STENCIL8);for(let Nt=0;Nt<6;Nt++)a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+Nt,0,Ft,E.width,E.height,0,Ot,Bt,null)}}else $(E.depthTexture,0);const Lt=mt.__webglTexture,A=le(E),ht=it?a.TEXTURE_CUBE_MAP_POSITIVE_X+Q:a.TEXTURE_2D,pt=E.depthTexture.format===dr?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;if(E.depthTexture.format===Ja)_e(E)?h.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,pt,ht,Lt,0,A):a.framebufferTexture2D(a.FRAMEBUFFER,pt,ht,Lt,0);else if(E.depthTexture.format===dr)_e(E)?h.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,pt,ht,Lt,0,A):a.framebufferTexture2D(a.FRAMEBUFFER,pt,ht,Lt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ht(O){const E=s.get(O),Q=O.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==O.depthTexture){const it=O.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),it){const mt=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,it.removeEventListener("dispose",mt)};it.addEventListener("dispose",mt),E.__depthDisposeCallback=mt}E.__boundDepthTexture=it}if(O.depthTexture&&!E.__autoAllocateDepthBuffer)if(Q)for(let it=0;it<6;it++)It(E.__webglFramebuffer[it],O,it);else{const it=O.texture.mipmaps;it&&it.length>0?It(E.__webglFramebuffer[0],O,0):It(E.__webglFramebuffer,O,0)}else if(Q){E.__webglDepthbuffer=[];for(let it=0;it<6;it++)if(n.bindFramebuffer(a.FRAMEBUFFER,E.__webglFramebuffer[it]),E.__webglDepthbuffer[it]===void 0)E.__webglDepthbuffer[it]=a.createRenderbuffer(),Yt(E.__webglDepthbuffer[it],O,!1);else{const mt=O.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Lt=E.__webglDepthbuffer[it];a.bindRenderbuffer(a.RENDERBUFFER,Lt),a.framebufferRenderbuffer(a.FRAMEBUFFER,mt,a.RENDERBUFFER,Lt)}}else{const it=O.texture.mipmaps;if(it&&it.length>0?n.bindFramebuffer(a.FRAMEBUFFER,E.__webglFramebuffer[0]):n.bindFramebuffer(a.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=a.createRenderbuffer(),Yt(E.__webglDepthbuffer,O,!1);else{const mt=O.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Lt=E.__webglDepthbuffer;a.bindRenderbuffer(a.RENDERBUFFER,Lt),a.framebufferRenderbuffer(a.FRAMEBUFFER,mt,a.RENDERBUFFER,Lt)}}n.bindFramebuffer(a.FRAMEBUFFER,null)}function Wt(O,E,Q){const it=s.get(O);E!==void 0&&Ut(it.__webglFramebuffer,O,O.texture,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,0),Q!==void 0&&Ht(O)}function ae(O){const E=O.texture,Q=s.get(O),it=s.get(E);O.addEventListener("dispose",T);const mt=O.textures,Lt=O.isWebGLCubeRenderTarget===!0,A=mt.length>1;if(A||(it.__webglTexture===void 0&&(it.__webglTexture=a.createTexture()),it.__version=E.version,u.memory.textures++),Lt){Q.__webglFramebuffer=[];for(let ht=0;ht<6;ht++)if(E.mipmaps&&E.mipmaps.length>0){Q.__webglFramebuffer[ht]=[];for(let pt=0;pt<E.mipmaps.length;pt++)Q.__webglFramebuffer[ht][pt]=a.createFramebuffer()}else Q.__webglFramebuffer[ht]=a.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){Q.__webglFramebuffer=[];for(let ht=0;ht<E.mipmaps.length;ht++)Q.__webglFramebuffer[ht]=a.createFramebuffer()}else Q.__webglFramebuffer=a.createFramebuffer();if(A)for(let ht=0,pt=mt.length;ht<pt;ht++){const Ot=s.get(mt[ht]);Ot.__webglTexture===void 0&&(Ot.__webglTexture=a.createTexture(),u.memory.textures++)}if(O.samples>0&&_e(O)===!1){Q.__webglMultisampledFramebuffer=a.createFramebuffer(),Q.__webglColorRenderbuffer=[],n.bindFramebuffer(a.FRAMEBUFFER,Q.__webglMultisampledFramebuffer);for(let ht=0;ht<mt.length;ht++){const pt=mt[ht];Q.__webglColorRenderbuffer[ht]=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,Q.__webglColorRenderbuffer[ht]);const Ot=c.convert(pt.format,pt.colorSpace),Bt=c.convert(pt.type),Ft=C(pt.internalFormat,Ot,Bt,pt.normalized,pt.colorSpace,O.isXRRenderTarget===!0),Nt=le(O);a.renderbufferStorageMultisample(a.RENDERBUFFER,Nt,Ft,O.width,O.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+ht,a.RENDERBUFFER,Q.__webglColorRenderbuffer[ht])}a.bindRenderbuffer(a.RENDERBUFFER,null),O.depthBuffer&&(Q.__webglDepthRenderbuffer=a.createRenderbuffer(),Yt(Q.__webglDepthRenderbuffer,O,!0)),n.bindFramebuffer(a.FRAMEBUFFER,null)}}if(Lt){n.bindTexture(a.TEXTURE_CUBE_MAP,it.__webglTexture),Mt(a.TEXTURE_CUBE_MAP,E);for(let ht=0;ht<6;ht++)if(E.mipmaps&&E.mipmaps.length>0)for(let pt=0;pt<E.mipmaps.length;pt++)Ut(Q.__webglFramebuffer[ht][pt],O,E,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+ht,pt);else Ut(Q.__webglFramebuffer[ht],O,E,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0);y(E)&&P(a.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(A){for(let ht=0,pt=mt.length;ht<pt;ht++){const Ot=mt[ht],Bt=s.get(Ot);let Ft=a.TEXTURE_2D;(O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(Ft=O.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),n.bindTexture(Ft,Bt.__webglTexture),Mt(Ft,Ot),Ut(Q.__webglFramebuffer,O,Ot,a.COLOR_ATTACHMENT0+ht,Ft,0),y(Ot)&&P(Ft)}n.unbindTexture()}else{let ht=a.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(ht=O.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),n.bindTexture(ht,it.__webglTexture),Mt(ht,E),E.mipmaps&&E.mipmaps.length>0)for(let pt=0;pt<E.mipmaps.length;pt++)Ut(Q.__webglFramebuffer[pt],O,E,a.COLOR_ATTACHMENT0,ht,pt);else Ut(Q.__webglFramebuffer,O,E,a.COLOR_ATTACHMENT0,ht,0);y(E)&&P(ht),n.unbindTexture()}O.depthBuffer&&Ht(O)}function oe(O){const E=O.textures;for(let Q=0,it=E.length;Q<it;Q++){const mt=E[Q];if(y(mt)){const Lt=z(O),A=s.get(mt).__webglTexture;n.bindTexture(Lt,A),P(Lt),n.unbindTexture()}}}const ce=[],me=[];function ee(O){if(O.samples>0){if(_e(O)===!1){const E=O.textures,Q=O.width,it=O.height;let mt=a.COLOR_BUFFER_BIT;const Lt=O.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,A=s.get(O),ht=E.length>1;if(ht)for(let Ot=0;Ot<E.length;Ot++)n.bindFramebuffer(a.FRAMEBUFFER,A.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Ot,a.RENDERBUFFER,null),n.bindFramebuffer(a.FRAMEBUFFER,A.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+Ot,a.TEXTURE_2D,null,0);n.bindFramebuffer(a.READ_FRAMEBUFFER,A.__webglMultisampledFramebuffer);const pt=O.texture.mipmaps;pt&&pt.length>0?n.bindFramebuffer(a.DRAW_FRAMEBUFFER,A.__webglFramebuffer[0]):n.bindFramebuffer(a.DRAW_FRAMEBUFFER,A.__webglFramebuffer);for(let Ot=0;Ot<E.length;Ot++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(mt|=a.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(mt|=a.STENCIL_BUFFER_BIT)),ht){a.framebufferRenderbuffer(a.READ_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.RENDERBUFFER,A.__webglColorRenderbuffer[Ot]);const Bt=s.get(E[Ot]).__webglTexture;a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,Bt,0)}a.blitFramebuffer(0,0,Q,it,0,0,Q,it,mt,a.NEAREST),m===!0&&(ce.length=0,me.length=0,ce.push(a.COLOR_ATTACHMENT0+Ot),O.depthBuffer&&O.resolveDepthBuffer===!1&&(ce.push(Lt),me.push(Lt),a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,me)),a.invalidateFramebuffer(a.READ_FRAMEBUFFER,ce))}if(n.bindFramebuffer(a.READ_FRAMEBUFFER,null),n.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),ht)for(let Ot=0;Ot<E.length;Ot++){n.bindFramebuffer(a.FRAMEBUFFER,A.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Ot,a.RENDERBUFFER,A.__webglColorRenderbuffer[Ot]);const Bt=s.get(E[Ot]).__webglTexture;n.bindFramebuffer(a.FRAMEBUFFER,A.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+Ot,a.TEXTURE_2D,Bt,0)}n.bindFramebuffer(a.DRAW_FRAMEBUFFER,A.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.resolveDepthBuffer===!1&&m){const E=O.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,[E])}}}function le(O){return Math.min(o.maxSamples,O.samples)}function _e(O){const E=s.get(O);return O.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function X(O){const E=u.render.frame;g.get(O)!==E&&(g.set(O,E),O.update())}function fe(O,E){const Q=O.colorSpace,it=O.format,mt=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||Q!==tf&&Q!==Ps&&(ze.getTransfer(Q)===Je?(it!==oa||mt!==qi)&&xe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Be("WebGLTextures: Unsupported texture color space:",Q)),E}function de(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(d.width=O.naturalWidth||O.width,d.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(d.width=O.displayWidth,d.height=O.displayHeight):(d.width=O.width,d.height=O.height),d}this.allocateTextureUnit=I,this.resetTextureUnits=lt,this.getTextureUnits=ct,this.setTextureUnits=J,this.setTexture2D=$,this.setTexture2DArray=ft,this.setTexture3D=bt,this.setTextureCube=F,this.rebindTextures=Wt,this.setupRenderTarget=ae,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=ee,this.setupDepthRenderbuffer=Ht,this.setupFrameBufferTexture=Ut,this.useMultisampledRTT=_e,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function DC(a,t){function n(s,o=Ps){let c;const u=ze.getTransfer(o);if(s===qi)return a.UNSIGNED_BYTE;if(s===Um)return a.UNSIGNED_SHORT_4_4_4_4;if(s===Lm)return a.UNSIGNED_SHORT_5_5_5_1;if(s===By)return a.UNSIGNED_INT_5_9_9_9_REV;if(s===Hy)return a.UNSIGNED_INT_10F_11F_11F_REV;if(s===Fy)return a.BYTE;if(s===Iy)return a.SHORT;if(s===Il)return a.UNSIGNED_SHORT;if(s===Dm)return a.INT;if(s===Ea)return a.UNSIGNED_INT;if(s===xa)return a.FLOAT;if(s===Di)return a.HALF_FLOAT;if(s===Gy)return a.ALPHA;if(s===Vy)return a.RGB;if(s===oa)return a.RGBA;if(s===Ja)return a.DEPTH_COMPONENT;if(s===dr)return a.DEPTH_STENCIL;if(s===ky)return a.RED;if(s===Nm)return a.RED_INTEGER;if(s===mr)return a.RG;if(s===Pm)return a.RG_INTEGER;if(s===Om)return a.RGBA_INTEGER;if(s===Vu||s===ku||s===Xu||s===Wu)if(u===Je)if(c=t.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(s===Vu)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===ku)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Xu)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Wu)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=t.get("WEBGL_compressed_texture_s3tc"),c!==null){if(s===Vu)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===ku)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Xu)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Wu)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Lp||s===Np||s===Pp||s===Op)if(c=t.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(s===Lp)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Np)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Pp)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Op)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===zp||s===Fp||s===Ip||s===Bp||s===Hp||s===Ju||s===Gp)if(c=t.get("WEBGL_compressed_texture_etc"),c!==null){if(s===zp||s===Fp)return u===Je?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(s===Ip)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC;if(s===Bp)return c.COMPRESSED_R11_EAC;if(s===Hp)return c.COMPRESSED_SIGNED_R11_EAC;if(s===Ju)return c.COMPRESSED_RG11_EAC;if(s===Gp)return c.COMPRESSED_SIGNED_RG11_EAC}else return null;if(s===Vp||s===kp||s===Xp||s===Wp||s===qp||s===Yp||s===Zp||s===Kp||s===jp||s===Qp||s===Jp||s===$p||s===tm||s===em)if(c=t.get("WEBGL_compressed_texture_astc"),c!==null){if(s===Vp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===kp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Xp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Wp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===qp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Yp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Zp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Kp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===jp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Qp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Jp)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===$p)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===tm)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===em)return u===Je?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===nm||s===im||s===am)if(c=t.get("EXT_texture_compression_bptc"),c!==null){if(s===nm)return u===Je?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===im)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===am)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===sm||s===rm||s===$u||s===om)if(c=t.get("EXT_texture_compression_rgtc"),c!==null){if(s===sm)return c.COMPRESSED_RED_RGTC1_EXT;if(s===rm)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===$u)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===om)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Bl?a.UNSIGNED_INT_24_8:a[s]!==void 0?a[s]:null}return{convert:n}}const UC=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,LC=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class NC{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){const s=new eS(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const n=t.cameras[0].viewport,s=new zn({vertexShader:UC,fragmentShader:LC,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Ui(new _f(20,20),s)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class PC extends Hs{constructor(t,n){super();const s=this;let o=null,c=1,u=null,h="local-floor",m=1,d=null,g=null,v=null,_=null,S=null,b=null;const R=typeof XRWebGLBinding<"u",x=new NC,y={},P=n.getContextAttributes();let z=null,C=null;const L=[],D=[],B=new he;let T=null;const N=new Wi;N.viewport=new bn;const G=new Wi;G.viewport=new bn;const H=[N,G],W=new GT;let lt=null,ct=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let yt=L[K];return yt===void 0&&(yt=new kd,L[K]=yt),yt.getTargetRaySpace()},this.getControllerGrip=function(K){let yt=L[K];return yt===void 0&&(yt=new kd,L[K]=yt),yt.getGripSpace()},this.getHand=function(K){let yt=L[K];return yt===void 0&&(yt=new kd,L[K]=yt),yt.getHandSpace()};function J(K){const yt=D.indexOf(K.inputSource);if(yt===-1)return;const xt=L[yt];xt!==void 0&&(xt.update(K.inputSource,K.frame,d||u),xt.dispatchEvent({type:K.type,data:K.inputSource}))}function I(){o.removeEventListener("select",J),o.removeEventListener("selectstart",J),o.removeEventListener("selectend",J),o.removeEventListener("squeeze",J),o.removeEventListener("squeezestart",J),o.removeEventListener("squeezeend",J),o.removeEventListener("end",I),o.removeEventListener("inputsourceschange",V);for(let K=0;K<L.length;K++){const yt=D[K];yt!==null&&(D[K]=null,L[K].disconnect(yt))}lt=null,ct=null,x.reset();for(const K in y)delete y[K];t.setRenderTarget(z),S=null,_=null,v=null,o=null,C=null,Mt.stop(),s.isPresenting=!1,t.setPixelRatio(T),t.setSize(B.width,B.height,!1),s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){c=K,s.isPresenting===!0&&xe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){h=K,s.isPresenting===!0&&xe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return d||u},this.setReferenceSpace=function(K){d=K},this.getBaseLayer=function(){return _!==null?_:S},this.getBinding=function(){return v===null&&R&&(v=new XRWebGLBinding(o,n)),v},this.getFrame=function(){return b},this.getSession=function(){return o},this.setSession=async function(K){if(o=K,o!==null){if(z=t.getRenderTarget(),o.addEventListener("select",J),o.addEventListener("selectstart",J),o.addEventListener("selectend",J),o.addEventListener("squeeze",J),o.addEventListener("squeezestart",J),o.addEventListener("squeezeend",J),o.addEventListener("end",I),o.addEventListener("inputsourceschange",V),P.xrCompatible!==!0&&await n.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(B),R&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,Et=null,Dt=null;P.depth&&(Dt=P.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,xt=P.stencil?dr:Ja,Et=P.stencil?Bl:Ea);const Ut={colorFormat:n.RGBA8,depthFormat:Dt,scaleFactor:c};v=this.getBinding(),_=v.createProjectionLayer(Ut),o.updateRenderState({layers:[_]}),t.setPixelRatio(1),t.setSize(_.textureWidth,_.textureHeight,!1),C=new _i(_.textureWidth,_.textureHeight,{format:oa,type:qi,depthTexture:new Mo(_.textureWidth,_.textureHeight,Et,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:P.stencil,colorSpace:t.outputColorSpace,samples:P.antialias?4:0,resolveDepthBuffer:_.ignoreDepthValues===!1,resolveStencilBuffer:_.ignoreDepthValues===!1})}else{const xt={antialias:P.antialias,alpha:!0,depth:P.depth,stencil:P.stencil,framebufferScaleFactor:c};S=new XRWebGLLayer(o,n,xt),o.updateRenderState({baseLayer:S}),t.setPixelRatio(1),t.setSize(S.framebufferWidth,S.framebufferHeight,!1),C=new _i(S.framebufferWidth,S.framebufferHeight,{format:oa,type:qi,colorSpace:t.outputColorSpace,stencilBuffer:P.stencil,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(m),d=null,u=await o.requestReferenceSpace(h),Mt.setContext(o),Mt.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function V(K){for(let yt=0;yt<K.removed.length;yt++){const xt=K.removed[yt],Et=D.indexOf(xt);Et>=0&&(D[Et]=null,L[Et].disconnect(xt))}for(let yt=0;yt<K.added.length;yt++){const xt=K.added[yt];let Et=D.indexOf(xt);if(Et===-1){for(let Ut=0;Ut<L.length;Ut++)if(Ut>=D.length){D.push(xt),Et=Ut;break}else if(D[Ut]===null){D[Ut]=xt,Et=Ut;break}if(Et===-1)break}const Dt=L[Et];Dt&&Dt.connect(xt)}}const $=new et,ft=new et;function bt(K,yt,xt){$.setFromMatrixPosition(yt.matrixWorld),ft.setFromMatrixPosition(xt.matrixWorld);const Et=$.distanceTo(ft),Dt=yt.projectionMatrix.elements,Ut=xt.projectionMatrix.elements,Yt=Dt[14]/(Dt[10]-1),It=Dt[14]/(Dt[10]+1),Ht=(Dt[9]+1)/Dt[5],Wt=(Dt[9]-1)/Dt[5],ae=(Dt[8]-1)/Dt[0],oe=(Ut[8]+1)/Ut[0],ce=Yt*ae,me=Yt*oe,ee=Et/(-ae+oe),le=ee*-ae;if(yt.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(le),K.translateZ(ee),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Dt[10]===-1)K.projectionMatrix.copy(yt.projectionMatrix),K.projectionMatrixInverse.copy(yt.projectionMatrixInverse);else{const _e=Yt+ee,X=It+ee,fe=ce-le,de=me+(Et-le),O=Ht*It/X*_e,E=Wt*It/X*_e;K.projectionMatrix.makePerspective(fe,de,O,E,_e,X),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function F(K,yt){yt===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(yt.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(o===null)return;let yt=K.near,xt=K.far;x.texture!==null&&(x.depthNear>0&&(yt=x.depthNear),x.depthFar>0&&(xt=x.depthFar)),W.near=G.near=N.near=yt,W.far=G.far=N.far=xt,(lt!==W.near||ct!==W.far)&&(o.updateRenderState({depthNear:W.near,depthFar:W.far}),lt=W.near,ct=W.far),W.layers.mask=K.layers.mask|6,N.layers.mask=W.layers.mask&-5,G.layers.mask=W.layers.mask&-3;const Et=K.parent,Dt=W.cameras;F(W,Et);for(let Ut=0;Ut<Dt.length;Ut++)F(Dt[Ut],Et);Dt.length===2?bt(W,N,G):W.projectionMatrix.copy(N.projectionMatrix),q(K,W,Et)};function q(K,yt,xt){xt===null?K.matrix.copy(yt.matrixWorld):(K.matrix.copy(xt.matrixWorld),K.matrix.invert(),K.matrix.multiply(yt.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(yt.projectionMatrix),K.projectionMatrixInverse.copy(yt.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=cm*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(_===null&&S===null))return m},this.setFoveation=function(K){m=K,_!==null&&(_.fixedFoveation=K),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=K)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(W)},this.getCameraTexture=function(K){return y[K]};let vt=null;function Ct(K,yt){if(g=yt.getViewerPose(d||u),b=yt,g!==null){const xt=g.views;S!==null&&(t.setRenderTargetFramebuffer(C,S.framebuffer),t.setRenderTarget(C));let Et=!1;xt.length!==W.cameras.length&&(W.cameras.length=0,Et=!0);for(let It=0;It<xt.length;It++){const Ht=xt[It];let Wt=null;if(S!==null)Wt=S.getViewport(Ht);else{const oe=v.getViewSubImage(_,Ht);Wt=oe.viewport,It===0&&(t.setRenderTargetTextures(C,oe.colorTexture,oe.depthStencilTexture),t.setRenderTarget(C))}let ae=H[It];ae===void 0&&(ae=new Wi,ae.layers.enable(It),ae.viewport=new bn,H[It]=ae),ae.matrix.fromArray(Ht.transform.matrix),ae.matrix.decompose(ae.position,ae.quaternion,ae.scale),ae.projectionMatrix.fromArray(Ht.projectionMatrix),ae.projectionMatrixInverse.copy(ae.projectionMatrix).invert(),ae.viewport.set(Wt.x,Wt.y,Wt.width,Wt.height),It===0&&(W.matrix.copy(ae.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Et===!0&&W.cameras.push(ae)}const Dt=o.enabledFeatures;if(Dt&&Dt.includes("depth-sensing")&&o.depthUsage=="gpu-optimized"&&R){v=s.getBinding();const It=v.getDepthInformation(xt[0]);It&&It.isValid&&It.texture&&x.init(It,o.renderState)}if(Dt&&Dt.includes("camera-access")&&R){t.state.unbindTexture(),v=s.getBinding();for(let It=0;It<xt.length;It++){const Ht=xt[It].camera;if(Ht){let Wt=y[Ht];Wt||(Wt=new eS,y[Ht]=Wt);const ae=v.getCameraImage(Ht);Wt.sourceTexture=ae}}}}for(let xt=0;xt<L.length;xt++){const Et=D[xt],Dt=L[xt];Et!==null&&Dt!==void 0&&Dt.update(Et,yt,d||u)}vt&&vt(K,yt),yt.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:yt}),b=null}const Mt=new sS;Mt.setAnimationLoop(Ct),this.setAnimationLoop=function(K){vt=K},this.dispose=function(){}}}const OC=new xn,hS=new be;hS.set(-1,0,0,0,1,0,0,0,1);function zC(a,t){function n(x,y){x.matrixAutoUpdate===!0&&x.updateMatrix(),y.value.copy(x.matrix)}function s(x,y){y.color.getRGB(x.fogColor.value,nS(a)),y.isFog?(x.fogNear.value=y.near,x.fogFar.value=y.far):y.isFogExp2&&(x.fogDensity.value=y.density)}function o(x,y,P,z,C){y.isNodeMaterial?y.uniformsNeedUpdate=!1:y.isMeshBasicMaterial?c(x,y):y.isMeshLambertMaterial?(c(x,y),y.envMap&&(x.envMapIntensity.value=y.envMapIntensity)):y.isMeshToonMaterial?(c(x,y),v(x,y)):y.isMeshPhongMaterial?(c(x,y),g(x,y),y.envMap&&(x.envMapIntensity.value=y.envMapIntensity)):y.isMeshStandardMaterial?(c(x,y),_(x,y),y.isMeshPhysicalMaterial&&S(x,y,C)):y.isMeshMatcapMaterial?(c(x,y),b(x,y)):y.isMeshDepthMaterial?c(x,y):y.isMeshDistanceMaterial?(c(x,y),R(x,y)):y.isMeshNormalMaterial?c(x,y):y.isLineBasicMaterial?(u(x,y),y.isLineDashedMaterial&&h(x,y)):y.isPointsMaterial?m(x,y,P,z):y.isSpriteMaterial?d(x,y):y.isShadowMaterial?(x.color.value.copy(y.color),x.opacity.value=y.opacity):y.isShaderMaterial&&(y.uniformsNeedUpdate=!1)}function c(x,y){x.opacity.value=y.opacity,y.color&&x.diffuse.value.copy(y.color),y.emissive&&x.emissive.value.copy(y.emissive).multiplyScalar(y.emissiveIntensity),y.map&&(x.map.value=y.map,n(y.map,x.mapTransform)),y.alphaMap&&(x.alphaMap.value=y.alphaMap,n(y.alphaMap,x.alphaMapTransform)),y.bumpMap&&(x.bumpMap.value=y.bumpMap,n(y.bumpMap,x.bumpMapTransform),x.bumpScale.value=y.bumpScale,y.side===li&&(x.bumpScale.value*=-1)),y.normalMap&&(x.normalMap.value=y.normalMap,n(y.normalMap,x.normalMapTransform),x.normalScale.value.copy(y.normalScale),y.side===li&&x.normalScale.value.negate()),y.displacementMap&&(x.displacementMap.value=y.displacementMap,n(y.displacementMap,x.displacementMapTransform),x.displacementScale.value=y.displacementScale,x.displacementBias.value=y.displacementBias),y.emissiveMap&&(x.emissiveMap.value=y.emissiveMap,n(y.emissiveMap,x.emissiveMapTransform)),y.specularMap&&(x.specularMap.value=y.specularMap,n(y.specularMap,x.specularMapTransform)),y.alphaTest>0&&(x.alphaTest.value=y.alphaTest);const P=t.get(y),z=P.envMap,C=P.envMapRotation;z&&(x.envMap.value=z,x.envMapRotation.value.setFromMatrix4(OC.makeRotationFromEuler(C)).transpose(),z.isCubeTexture&&z.isRenderTargetTexture===!1&&x.envMapRotation.value.premultiply(hS),x.reflectivity.value=y.reflectivity,x.ior.value=y.ior,x.refractionRatio.value=y.refractionRatio),y.lightMap&&(x.lightMap.value=y.lightMap,x.lightMapIntensity.value=y.lightMapIntensity,n(y.lightMap,x.lightMapTransform)),y.aoMap&&(x.aoMap.value=y.aoMap,x.aoMapIntensity.value=y.aoMapIntensity,n(y.aoMap,x.aoMapTransform))}function u(x,y){x.diffuse.value.copy(y.color),x.opacity.value=y.opacity,y.map&&(x.map.value=y.map,n(y.map,x.mapTransform))}function h(x,y){x.dashSize.value=y.dashSize,x.totalSize.value=y.dashSize+y.gapSize,x.scale.value=y.scale}function m(x,y,P,z){x.diffuse.value.copy(y.color),x.opacity.value=y.opacity,x.size.value=y.size*P,x.scale.value=z*.5,y.map&&(x.map.value=y.map,n(y.map,x.uvTransform)),y.alphaMap&&(x.alphaMap.value=y.alphaMap,n(y.alphaMap,x.alphaMapTransform)),y.alphaTest>0&&(x.alphaTest.value=y.alphaTest)}function d(x,y){x.diffuse.value.copy(y.color),x.opacity.value=y.opacity,x.rotation.value=y.rotation,y.map&&(x.map.value=y.map,n(y.map,x.mapTransform)),y.alphaMap&&(x.alphaMap.value=y.alphaMap,n(y.alphaMap,x.alphaMapTransform)),y.alphaTest>0&&(x.alphaTest.value=y.alphaTest)}function g(x,y){x.specular.value.copy(y.specular),x.shininess.value=Math.max(y.shininess,1e-4)}function v(x,y){y.gradientMap&&(x.gradientMap.value=y.gradientMap)}function _(x,y){x.metalness.value=y.metalness,y.metalnessMap&&(x.metalnessMap.value=y.metalnessMap,n(y.metalnessMap,x.metalnessMapTransform)),x.roughness.value=y.roughness,y.roughnessMap&&(x.roughnessMap.value=y.roughnessMap,n(y.roughnessMap,x.roughnessMapTransform)),y.envMap&&(x.envMapIntensity.value=y.envMapIntensity)}function S(x,y,P){x.ior.value=y.ior,y.sheen>0&&(x.sheenColor.value.copy(y.sheenColor).multiplyScalar(y.sheen),x.sheenRoughness.value=y.sheenRoughness,y.sheenColorMap&&(x.sheenColorMap.value=y.sheenColorMap,n(y.sheenColorMap,x.sheenColorMapTransform)),y.sheenRoughnessMap&&(x.sheenRoughnessMap.value=y.sheenRoughnessMap,n(y.sheenRoughnessMap,x.sheenRoughnessMapTransform))),y.clearcoat>0&&(x.clearcoat.value=y.clearcoat,x.clearcoatRoughness.value=y.clearcoatRoughness,y.clearcoatMap&&(x.clearcoatMap.value=y.clearcoatMap,n(y.clearcoatMap,x.clearcoatMapTransform)),y.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=y.clearcoatRoughnessMap,n(y.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),y.clearcoatNormalMap&&(x.clearcoatNormalMap.value=y.clearcoatNormalMap,n(y.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(y.clearcoatNormalScale),y.side===li&&x.clearcoatNormalScale.value.negate())),y.dispersion>0&&(x.dispersion.value=y.dispersion),y.iridescence>0&&(x.iridescence.value=y.iridescence,x.iridescenceIOR.value=y.iridescenceIOR,x.iridescenceThicknessMinimum.value=y.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=y.iridescenceThicknessRange[1],y.iridescenceMap&&(x.iridescenceMap.value=y.iridescenceMap,n(y.iridescenceMap,x.iridescenceMapTransform)),y.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=y.iridescenceThicknessMap,n(y.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),y.transmission>0&&(x.transmission.value=y.transmission,x.transmissionSamplerMap.value=P.texture,x.transmissionSamplerSize.value.set(P.width,P.height),y.transmissionMap&&(x.transmissionMap.value=y.transmissionMap,n(y.transmissionMap,x.transmissionMapTransform)),x.thickness.value=y.thickness,y.thicknessMap&&(x.thicknessMap.value=y.thicknessMap,n(y.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=y.attenuationDistance,x.attenuationColor.value.copy(y.attenuationColor)),y.anisotropy>0&&(x.anisotropyVector.value.set(y.anisotropy*Math.cos(y.anisotropyRotation),y.anisotropy*Math.sin(y.anisotropyRotation)),y.anisotropyMap&&(x.anisotropyMap.value=y.anisotropyMap,n(y.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=y.specularIntensity,x.specularColor.value.copy(y.specularColor),y.specularColorMap&&(x.specularColorMap.value=y.specularColorMap,n(y.specularColorMap,x.specularColorMapTransform)),y.specularIntensityMap&&(x.specularIntensityMap.value=y.specularIntensityMap,n(y.specularIntensityMap,x.specularIntensityMapTransform))}function b(x,y){y.matcap&&(x.matcap.value=y.matcap)}function R(x,y){const P=t.get(y).light;x.referencePosition.value.setFromMatrixPosition(P.matrixWorld),x.nearDistance.value=P.shadow.camera.near,x.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:o}}function FC(a,t,n,s){let o={},c={},u=[];const h=a.getParameter(a.MAX_UNIFORM_BUFFER_BINDINGS);function m(C,L){const D=L.program;s.uniformBlockBinding(C,D)}function d(C,L){let D=o[C.id];D===void 0&&(x(C),D=g(C),o[C.id]=D,C.addEventListener("dispose",P));const B=L.program;s.updateUBOMapping(C,B);const T=t.render.frame;c[C.id]!==T&&(_(C),c[C.id]=T)}function g(C){const L=v();C.__bindingPointIndex=L;const D=a.createBuffer(),B=C.__size,T=C.usage;return a.bindBuffer(a.UNIFORM_BUFFER,D),a.bufferData(a.UNIFORM_BUFFER,B,T),a.bindBuffer(a.UNIFORM_BUFFER,null),a.bindBufferBase(a.UNIFORM_BUFFER,L,D),D}function v(){for(let C=0;C<h;C++)if(u.indexOf(C)===-1)return u.push(C),C;return Be("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function _(C){const L=o[C.id],D=C.uniforms,B=C.__cache;a.bindBuffer(a.UNIFORM_BUFFER,L);for(let T=0,N=D.length;T<N;T++){const G=D[T];if(Array.isArray(G))for(let H=0,W=G.length;H<W;H++)S(G[H],T,H,B);else S(G,T,0,B)}a.bindBuffer(a.UNIFORM_BUFFER,null)}function S(C,L,D,B){if(R(C,L,D,B)===!0){const T=C.__offset,N=C.value;if(Array.isArray(N)){let G=0;for(let H=0;H<N.length;H++){const W=N[H],lt=y(W);b(W,C.__data,G),typeof W!="number"&&typeof W!="boolean"&&!W.isMatrix3&&!ArrayBuffer.isView(W)&&(G+=lt.storage/Float32Array.BYTES_PER_ELEMENT)}}else b(N,C.__data,0);a.bufferSubData(a.UNIFORM_BUFFER,T,C.__data)}}function b(C,L,D){typeof C=="number"||typeof C=="boolean"?L[0]=C:C.isMatrix3?(L[0]=C.elements[0],L[1]=C.elements[1],L[2]=C.elements[2],L[3]=0,L[4]=C.elements[3],L[5]=C.elements[4],L[6]=C.elements[5],L[7]=0,L[8]=C.elements[6],L[9]=C.elements[7],L[10]=C.elements[8],L[11]=0):ArrayBuffer.isView(C)?L.set(new C.constructor(C.buffer,C.byteOffset,L.length)):C.toArray(L,D)}function R(C,L,D,B){const T=C.value,N=L+"_"+D;if(B[N]===void 0)return typeof T=="number"||typeof T=="boolean"?B[N]=T:ArrayBuffer.isView(T)?B[N]=T.slice():B[N]=T.clone(),!0;{const G=B[N];if(typeof T=="number"||typeof T=="boolean"){if(G!==T)return B[N]=T,!0}else{if(ArrayBuffer.isView(T))return!0;if(G.equals(T)===!1)return G.copy(T),!0}}return!1}function x(C){const L=C.uniforms;let D=0;const B=16;for(let N=0,G=L.length;N<G;N++){const H=Array.isArray(L[N])?L[N]:[L[N]];for(let W=0,lt=H.length;W<lt;W++){const ct=H[W],J=Array.isArray(ct.value)?ct.value:[ct.value];for(let I=0,V=J.length;I<V;I++){const $=J[I],ft=y($),bt=D%B,F=bt%ft.boundary,q=bt+F;D+=F,q!==0&&B-q<ft.storage&&(D+=B-q),ct.__data=new Float32Array(ft.storage/Float32Array.BYTES_PER_ELEMENT),ct.__offset=D,D+=ft.storage}}}const T=D%B;return T>0&&(D+=B-T),C.__size=D,C.__cache={},this}function y(C){const L={boundary:0,storage:0};return typeof C=="number"||typeof C=="boolean"?(L.boundary=4,L.storage=4):C.isVector2?(L.boundary=8,L.storage=8):C.isVector3||C.isColor?(L.boundary=16,L.storage=12):C.isVector4?(L.boundary=16,L.storage=16):C.isMatrix3?(L.boundary=48,L.storage=48):C.isMatrix4?(L.boundary=64,L.storage=64):C.isTexture?xe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(C)?(L.boundary=16,L.storage=C.byteLength):xe("WebGLRenderer: Unsupported uniform value type.",C),L}function P(C){const L=C.target;L.removeEventListener("dispose",P);const D=u.indexOf(L.__bindingPointIndex);u.splice(D,1),a.deleteBuffer(o[L.id]),delete o[L.id],delete c[L.id]}function z(){for(const C in o)a.deleteBuffer(o[C]);u=[],o={},c={}}return{bind:m,update:d,dispose:z}}const IC=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let ga=null;function BC(){return ga===null&&(ga=new TT(IC,16,16,mr,Di),ga.name="DFG_LUT",ga.minFilter=ti,ga.magFilter=ti,ga.wrapS=Ka,ga.wrapT=Ka,ga.generateMipmaps=!1,ga.needsUpdate=!0),ga}class HC{constructor(t={}){const{canvas:n=tT(),context:s=null,depth:o=!0,stencil:c=!1,alpha:u=!1,antialias:h=!1,premultipliedAlpha:m=!0,preserveDrawingBuffer:d=!1,powerPreference:g="default",failIfMajorPerformanceCaveat:v=!1,reversedDepthBuffer:_=!1,outputBufferType:S=qi}=t;this.isWebGLRenderer=!0;let b;if(s!==null){if(typeof WebGLRenderingContext<"u"&&s instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");b=s.getContextAttributes().alpha}else b=u;const R=S,x=new Set([Om,Pm,Nm]),y=new Set([qi,Ea,Il,Bl,Um,Lm]),P=new Uint32Array(4),z=new Int32Array(4),C=new et;let L=null,D=null;const B=[],T=[];let N=null;this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ma,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const G=this;let H=!1,W=null,lt=null,ct=null,J=null;this._outputColorSpace=oi;let I=0,V=0,$=null,ft=-1,bt=null;const F=new bn,q=new bn;let vt=null;const Ct=new Ce(0);let Mt=0,K=n.width,yt=n.height,xt=1,Et=null,Dt=null;const Ut=new bn(0,0,K,yt),Yt=new bn(0,0,K,yt);let It=!1;const Ht=new Jy;let Wt=!1,ae=!1;const oe=new xn,ce=new et,me=new bn,ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let le=!1;function _e(){return $===null?xt:1}let X=s;function fe(w,tt){return n.getContext(w,tt)}try{const w={alpha:!0,depth:o,stencil:c,antialias:h,premultipliedAlpha:m,preserveDrawingBuffer:d,powerPreference:g,failIfMajorPerformanceCaveat:v};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Mm}`),n.addEventListener("webglcontextlost",te,!1),n.addEventListener("webglcontextrestored",ye,!1),n.addEventListener("webglcontextcreationerror",Ze,!1),X===null){const tt="webgl2";if(X=fe(tt,w),X===null)throw fe(tt)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(w){throw Be("WebGLRenderer: "+w.message),w}let de,O,E,Q,it,mt,Lt,A,ht,pt,Ot,Bt,Ft,Nt,ne,Jt,ie,Y,Pt,gt,zt,Gt,At;function qt(){de=new B3(X),de.init(),zt=new DC(X,de),O=new U3(X,de,t,zt),E=new CC(X,de),O.reversedDepthBuffer&&_&&E.buffers.depth.setReversed(!0),lt=X.createFramebuffer(),ct=X.createFramebuffer(),J=X.createFramebuffer(),Q=new V3(X),it=new pC,mt=new wC(X,de,E,it,O,zt,Q),Lt=new I3(G),A=new qT(X),Gt=new w3(X,A),ht=new H3(X,A,Q,Gt),pt=new X3(X,ht,A,Gt,Q),Y=new k3(X,O,mt),ne=new L3(it),Ot=new dC(G,Lt,de,O,Gt,ne),Bt=new zC(G,it),Ft=new gC,Nt=new MC(de),ie=new C3(G,Lt,E,pt,b,m),Jt=new RC(G,pt,O),At=new FC(X,Q,O,E),Pt=new D3(X,de,Q),gt=new G3(X,de,Q),Q.programs=Ot.programs,G.capabilities=O,G.extensions=de,G.properties=it,G.renderLists=Ft,G.shadowMap=Jt,G.state=E,G.info=Q}qt(),R!==qi&&(N=new q3(R,n.width,n.height,h,o,c));const Vt=new PC(G,X);this.xr=Vt,this.getContext=function(){return X},this.getContextAttributes=function(){return X.getContextAttributes()},this.forceContextLoss=function(){const w=de.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=de.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return xt},this.setPixelRatio=function(w){w!==void 0&&(xt=w,this.setSize(K,yt,!1))},this.getSize=function(w){return w.set(K,yt)},this.setSize=function(w,tt,ut=!0){if(Vt.isPresenting){xe("WebGLRenderer: Can't change size while VR device is presenting.");return}K=w,yt=tt,n.width=Math.floor(w*xt),n.height=Math.floor(tt*xt),ut===!0&&(n.style.width=w+"px",n.style.height=tt+"px"),N!==null&&N.setSize(n.width,n.height),this.setViewport(0,0,w,tt)},this.getDrawingBufferSize=function(w){return w.set(K*xt,yt*xt).floor()},this.setDrawingBufferSize=function(w,tt,ut){K=w,yt=tt,xt=ut,n.width=Math.floor(w*ut),n.height=Math.floor(tt*ut),this.setViewport(0,0,w,tt)},this.setEffects=function(w){if(R===qi){Be("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let tt=0;tt<w.length;tt++)if(w[tt].isOutputPass===!0){xe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}N.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(F)},this.getViewport=function(w){return w.copy(Ut)},this.setViewport=function(w,tt,ut,at){w.isVector4?Ut.set(w.x,w.y,w.z,w.w):Ut.set(w,tt,ut,at),E.viewport(F.copy(Ut).multiplyScalar(xt).round())},this.getScissor=function(w){return w.copy(Yt)},this.setScissor=function(w,tt,ut,at){w.isVector4?Yt.set(w.x,w.y,w.z,w.w):Yt.set(w,tt,ut,at),E.scissor(q.copy(Yt).multiplyScalar(xt).round())},this.getScissorTest=function(){return It},this.setScissorTest=function(w){E.setScissorTest(It=w)},this.setOpaqueSort=function(w){Et=w},this.setTransparentSort=function(w){Dt=w},this.getClearColor=function(w){return w.copy(ie.getClearColor())},this.setClearColor=function(){ie.setClearColor(...arguments)},this.getClearAlpha=function(){return ie.getClearAlpha()},this.setClearAlpha=function(){ie.setClearAlpha(...arguments)},this.clear=function(w=!0,tt=!0,ut=!0){let at=0;if(w){let st=!1;if($!==null){const Xt=$.texture.format;st=x.has(Xt)}if(st){const Xt=$.texture.type,Qt=y.has(Xt),kt=ie.getClearColor(),$t=ie.getClearAlpha(),Kt=kt.r,pe=kt.g,Se=kt.b;Qt?(P[0]=Kt,P[1]=pe,P[2]=Se,P[3]=$t,X.clearBufferuiv(X.COLOR,0,P)):(z[0]=Kt,z[1]=pe,z[2]=Se,z[3]=$t,X.clearBufferiv(X.COLOR,0,z))}else at|=X.COLOR_BUFFER_BIT}tt&&(at|=X.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),ut&&(at|=X.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),at!==0&&X.clear(at)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),W=w},this.dispose=function(){n.removeEventListener("webglcontextlost",te,!1),n.removeEventListener("webglcontextrestored",ye,!1),n.removeEventListener("webglcontextcreationerror",Ze,!1),ie.dispose(),Ft.dispose(),Nt.dispose(),it.dispose(),Lt.dispose(),pt.dispose(),Gt.dispose(),At.dispose(),Ot.dispose(),Vt.dispose(),Vt.removeEventListener("sessionstart",Ke),Vt.removeEventListener("sessionend",$e),Ie.stop()};function te(w){w.preventDefault(),af("WebGLRenderer: Context Lost."),H=!0}function ye(){af("WebGLRenderer: Context Restored."),H=!1;const w=Q.autoReset,tt=Jt.enabled,ut=Jt.autoUpdate,at=Jt.needsUpdate,st=Jt.type;qt(),Q.autoReset=w,Jt.enabled=tt,Jt.autoUpdate=ut,Jt.needsUpdate=at,Jt.type=st}function Ze(w){Be("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function _n(w){const tt=w.target;tt.removeEventListener("dispose",_n),Ne(tt)}function Ne(w){Ki(w),it.remove(w)}function Ki(w){const tt=it.get(w).programs;tt!==void 0&&(tt.forEach(function(ut){Ot.releaseProgram(ut)}),w.isShaderMaterial&&Ot.releaseShaderCache(w))}this.renderBufferDirect=function(w,tt,ut,at,st,Xt){tt===null&&(tt=ee);const Qt=st.isMesh&&st.matrixWorld.determinantAffine()<0,kt=Pi(w,tt,ut,at,st);E.setMaterial(at,Qt);let $t=ut.index,Kt=1;if(at.wireframe===!0){if($t=ht.getWireframeAttribute(ut),$t===void 0)return;Kt=2}const pe=ut.drawRange,Se=ut.attributes.position;let re=pe.start*Kt,we=(pe.start+pe.count)*Kt;Xt!==null&&(re=Math.max(re,Xt.start*Kt),we=Math.min(we,(Xt.start+Xt.count)*Kt)),$t!==null?(re=Math.max(re,0),we=Math.min(we,$t.count)):Se!=null&&(re=Math.max(re,0),we=Math.min(we,Se.count));const je=we-re;if(je<0||je===1/0)return;Gt.setup(st,at,kt,ut,$t);let Xe,He=Pt;if($t!==null&&(Xe=A.get($t),He=gt,He.setIndex(Xe)),st.isMesh)at.wireframe===!0?(E.setLineWidth(at.wireframeLinewidth*_e()),He.setMode(X.LINES)):He.setMode(X.TRIANGLES);else if(st.isLine){let We=at.linewidth;We===void 0&&(We=1),E.setLineWidth(We*_e()),st.isLineSegments?He.setMode(X.LINES):st.isLineLoop?He.setMode(X.LINE_LOOP):He.setMode(X.LINE_STRIP)}else st.isPoints?He.setMode(X.POINTS):st.isSprite&&He.setMode(X.TRIANGLES);if(st.isBatchedMesh)if(de.get("WEBGL_multi_draw"))He.renderMultiDraw(st._multiDrawStarts,st._multiDrawCounts,st._multiDrawCount);else{const We=st._multiDrawStarts,jt=st._multiDrawCounts,Hn=st._multiDrawCount,Re=$t?A.get($t).bytesPerElement:1,En=it.get(at).currentProgram.getUniforms();for(let ni=0;ni<Hn;ni++)En.setValue(X,"_gl_DrawID",ni),He.render(We[ni]/Re,jt[ni])}else if(st.isInstancedMesh)He.renderInstances(re,je,st.count);else if(ut.isInstancedBufferGeometry){const We=ut._maxInstanceCount!==void 0?ut._maxInstanceCount:1/0,jt=Math.min(ut.instanceCount,We);He.renderInstances(re,je,jt)}else He.render(re,je)};function Li(w,tt,ut){w.transparent===!0&&w.side===Ya&&w.forceSinglePass===!1?(w.side=li,w.needsUpdate=!0,ke(w,tt,ut),w.side=Is,w.needsUpdate=!0,ke(w,tt,ut),w.side=Ya):ke(w,tt,ut)}this.compile=function(w,tt,ut=null){ut===null&&(ut=w),D=Nt.get(ut),D.init(tt),T.push(D),ut.traverseVisible(function(st){st.isLight&&st.layers.test(tt.layers)&&(D.pushLight(st),st.castShadow&&D.pushShadow(st))}),w!==ut&&w.traverseVisible(function(st){st.isLight&&st.layers.test(tt.layers)&&(D.pushLight(st),st.castShadow&&D.pushShadow(st))}),D.setupLights();const at=new Set;return w.traverse(function(st){if(!(st.isMesh||st.isPoints||st.isLine||st.isSprite))return;const Xt=st.material;if(Xt)if(Array.isArray(Xt))for(let Qt=0;Qt<Xt.length;Qt++){const kt=Xt[Qt];Li(kt,ut,st),at.add(kt)}else Li(Xt,ut,st),at.add(Xt)}),D=T.pop(),at},this.compileAsync=function(w,tt,ut=null){const at=this.compile(w,tt,ut);return new Promise(st=>{function Xt(){if(at.forEach(function(Qt){it.get(Qt).currentProgram.isReady()&&at.delete(Qt)}),at.size===0){st(w);return}setTimeout(Xt,10)}de.get("KHR_parallel_shader_compile")!==null?Xt():setTimeout(Xt,10)})};let Ni=null;function jn(w){Ni&&Ni(w)}function Ke(){Ie.stop()}function $e(){Ie.start()}const Ie=new sS;Ie.setAnimationLoop(jn),typeof self<"u"&&Ie.setContext(self),this.setAnimationLoop=function(w){Ni=w,Vt.setAnimationLoop(w),w===null?Ie.stop():Ie.start()},Vt.addEventListener("sessionstart",Ke),Vt.addEventListener("sessionend",$e),this.render=function(w,tt){if(tt!==void 0&&tt.isCamera!==!0){Be("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;W!==null&&W.renderStart(w,tt);const ut=Vt.enabled===!0&&Vt.isPresenting===!0,at=N!==null&&($===null||ut)&&N.begin(G,$);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),tt.parent===null&&tt.matrixWorldAutoUpdate===!0&&tt.updateMatrixWorld(),Vt.enabled===!0&&Vt.isPresenting===!0&&(N===null||N.isCompositing()===!1)&&(Vt.cameraAutoUpdate===!0&&Vt.updateCamera(tt),tt=Vt.getCamera()),w.isScene===!0&&w.onBeforeRender(G,w,tt,$),D=Nt.get(w,T.length),D.init(tt),D.state.textureUnits=mt.getTextureUnits(),T.push(D),oe.multiplyMatrices(tt.projectionMatrix,tt.matrixWorldInverse),Ht.setFromProjectionMatrix(oe,ya,tt.reversedDepth),ae=this.localClippingEnabled,Wt=ne.init(this.clippingPlanes,ae),L=Ft.get(w,B.length),L.init(),B.push(L),Vt.enabled===!0&&Vt.isPresenting===!0){const Qt=G.xr.getDepthSensingMesh();Qt!==null&&Rn(Qt,tt,-1/0,G.sortObjects)}Rn(w,tt,0,G.sortObjects),L.finish(),G.sortObjects===!0&&L.sort(Et,Dt,tt.reversedDepth),le=Vt.enabled===!1||Vt.isPresenting===!1||Vt.hasDepthSensing()===!1,le&&ie.addToRenderList(L,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Wt===!0&&ne.beginShadows();const st=D.state.shadowsArray;if(Jt.render(st,w,tt),Wt===!0&&ne.endShadows(),(at&&N.hasRenderPass())===!1){const Qt=L.opaque,kt=L.transmissive;if(D.setupLights(),tt.isArrayCamera){const $t=tt.cameras;if(kt.length>0)for(let Kt=0,pe=$t.length;Kt<pe;Kt++){const Se=$t[Kt];Qi(Qt,kt,w,Se)}le&&ie.render(w);for(let Kt=0,pe=$t.length;Kt<pe;Kt++){const Se=$t[Kt];ji(L,w,Se,Se.viewport)}}else kt.length>0&&Qi(Qt,kt,w,tt),le&&ie.render(w),ji(L,w,tt)}$!==null&&V===0&&(mt.updateMultisampleRenderTarget($),mt.updateRenderTargetMipmap($)),at&&N.end(G),w.isScene===!0&&w.onAfterRender(G,w,tt),Gt.resetDefaultState(),ft=-1,bt=null,T.pop(),T.length>0?(D=T[T.length-1],mt.setTextureUnits(D.state.textureUnits),Wt===!0&&ne.setGlobalState(G.clippingPlanes,D.state.camera)):D=null,B.pop(),B.length>0?L=B[B.length-1]:L=null,W!==null&&W.renderEnd()};function Rn(w,tt,ut,at){if(w.visible===!1)return;if(w.layers.test(tt.layers)){if(w.isGroup)ut=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(tt);else if(w.isLightProbeGrid)D.pushLightProbeGrid(w);else if(w.isLight)D.pushLight(w),w.castShadow&&D.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||Ht.intersectsSprite(w)){at&&me.setFromMatrixPosition(w.matrixWorld).applyMatrix4(oe);const Qt=pt.update(w),kt=w.material;kt.visible&&L.push(w,Qt,kt,ut,me.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||Ht.intersectsObject(w))){const Qt=pt.update(w),kt=w.material;if(at&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),me.copy(w.boundingSphere.center)):(Qt.boundingSphere===null&&Qt.computeBoundingSphere(),me.copy(Qt.boundingSphere.center)),me.applyMatrix4(w.matrixWorld).applyMatrix4(oe)),Array.isArray(kt)){const $t=Qt.groups;for(let Kt=0,pe=$t.length;Kt<pe;Kt++){const Se=$t[Kt],re=kt[Se.materialIndex];re&&re.visible&&L.push(w,Qt,re,ut,me.z,Se)}}else kt.visible&&L.push(w,Qt,kt,ut,me.z,null)}}const Xt=w.children;for(let Qt=0,kt=Xt.length;Qt<kt;Qt++)Rn(Xt[Qt],tt,ut,at)}function ji(w,tt,ut,at){const{opaque:st,transmissive:Xt,transparent:Qt}=w;D.setupLightsView(ut),Wt===!0&&ne.setGlobalState(G.clippingPlanes,ut),at&&E.viewport(F.copy(at)),st.length>0&&dn(st,tt,ut),Xt.length>0&&dn(Xt,tt,ut),Qt.length>0&&dn(Qt,tt,ut),E.buffers.depth.setTest(!0),E.buffers.depth.setMask(!0),E.buffers.color.setMask(!0),E.setPolygonOffset(!1)}function Qi(w,tt,ut,at){if((ut.isScene===!0?ut.overrideMaterial:null)!==null)return;if(D.state.transmissionRenderTarget[at.id]===void 0){const re=de.has("EXT_color_buffer_half_float")||de.has("EXT_color_buffer_float");D.state.transmissionRenderTarget[at.id]=new _i(1,1,{generateMipmaps:!0,type:re?Di:qi,minFilter:hr,samples:Math.max(4,O.samples),stencilBuffer:c,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ze.workingColorSpace})}const Xt=D.state.transmissionRenderTarget[at.id],Qt=at.viewport||F;Xt.setSize(Qt.z*G.transmissionResolutionScale,Qt.w*G.transmissionResolutionScale);const kt=G.getRenderTarget(),$t=G.getActiveCubeFace(),Kt=G.getActiveMipmapLevel();G.setRenderTarget(Xt),G.getClearColor(Ct),Mt=G.getClearAlpha(),Mt<1&&G.setClearColor(16777215,.5),G.clear(),le&&ie.render(ut);const pe=G.toneMapping;G.toneMapping=Ma;const Se=at.viewport;if(at.viewport!==void 0&&(at.viewport=void 0),D.setupLightsView(at),Wt===!0&&ne.setGlobalState(G.clippingPlanes,at),dn(w,ut,at),mt.updateMultisampleRenderTarget(Xt),mt.updateRenderTargetMipmap(Xt),de.has("WEBGL_multisampled_render_to_texture")===!1){let re=!1;for(let we=0,je=tt.length;we<je;we++){const Xe=tt[we],{object:He,geometry:We,material:jt,group:Hn}=Xe;if(jt.side===Ya&&He.layers.test(at.layers)){const Re=jt.side;jt.side=li,jt.needsUpdate=!0,un(He,ut,at,We,jt,Hn),jt.side=Re,jt.needsUpdate=!0,re=!0}}re===!0&&(mt.updateMultisampleRenderTarget(Xt),mt.updateRenderTargetMipmap(Xt))}G.setRenderTarget(kt,$t,Kt),G.setClearColor(Ct,Mt),Se!==void 0&&(at.viewport=Se),G.toneMapping=pe}function dn(w,tt,ut){const at=tt.isScene===!0?tt.overrideMaterial:null;for(let st=0,Xt=w.length;st<Xt;st++){const Qt=w[st],{object:kt,geometry:$t,group:Kt}=Qt;let pe=Qt.material;pe.allowOverride===!0&&at!==null&&(pe=at),kt.layers.test(ut.layers)&&un(kt,tt,ut,$t,pe,Kt)}}function un(w,tt,ut,at,st,Xt){w.onBeforeRender(G,tt,ut,at,st,Xt),w.modelViewMatrix.multiplyMatrices(ut.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),st.onBeforeRender(G,tt,ut,at,w,Xt),st.transparent===!0&&st.side===Ya&&st.forceSinglePass===!1?(st.side=li,st.needsUpdate=!0,G.renderBufferDirect(ut,tt,at,st,w,Xt),st.side=Is,st.needsUpdate=!0,G.renderBufferDirect(ut,tt,at,st,w,Xt),st.side=Ya):G.renderBufferDirect(ut,tt,at,st,w,Xt),w.onAfterRender(G,tt,ut,at,st,Xt)}function ke(w,tt,ut){tt.isScene!==!0&&(tt=ee);const at=it.get(w),st=D.state.lights,Xt=D.state.shadowsArray,Qt=st.state.version,kt=Ot.getParameters(w,st.state,Xt,tt,ut,D.state.lightProbeGridArray),$t=Ot.getProgramCacheKey(kt);let Kt=at.programs;at.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?tt.environment:null,at.fog=tt.fog;const pe=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;at.envMap=Lt.get(w.envMap||at.environment,pe),at.envMapRotation=at.environment!==null&&w.envMap===null?tt.environmentRotation:w.envMapRotation,Kt===void 0&&(w.addEventListener("dispose",_n),Kt=new Map,at.programs=Kt);let Se=Kt.get($t);if(Se!==void 0){if(at.currentProgram===Se&&at.lightsStateVersion===Qt)return vi(w,kt),Se}else kt.uniforms=Ot.getUniforms(w),W!==null&&w.isNodeMaterial&&W.build(w,ut,kt),w.onBeforeCompile(kt,G),Se=Ot.acquireProgram(kt,$t),Kt.set($t,Se),at.uniforms=kt.uniforms;const re=at.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(re.clippingPlanes=ne.uniform),vi(w,kt),at.needsLights=ca(w),at.lightsStateVersion=Qt,at.needsLights&&(re.ambientLightColor.value=st.state.ambient,re.lightProbe.value=st.state.probe,re.directionalLights.value=st.state.directional,re.directionalLightShadows.value=st.state.directionalShadow,re.spotLights.value=st.state.spot,re.spotLightShadows.value=st.state.spotShadow,re.rectAreaLights.value=st.state.rectArea,re.ltc_1.value=st.state.rectAreaLTC1,re.ltc_2.value=st.state.rectAreaLTC2,re.pointLights.value=st.state.point,re.pointLightShadows.value=st.state.pointShadow,re.hemisphereLights.value=st.state.hemi,re.directionalShadowMatrix.value=st.state.directionalShadowMatrix,re.spotLightMatrix.value=st.state.spotLightMatrix,re.spotLightMap.value=st.state.spotLightMap,re.pointShadowMatrix.value=st.state.pointShadowMatrix),at.lightProbeGrid=D.state.lightProbeGridArray.length>0,at.currentProgram=Se,at.uniformsList=null,Se}function kn(w){if(w.uniformsList===null){const tt=w.currentProgram.getUniforms();w.uniformsList=Zu.seqWithValue(tt.seq,w.uniforms)}return w.uniformsList}function vi(w,tt){const ut=it.get(w);ut.outputColorSpace=tt.outputColorSpace,ut.batching=tt.batching,ut.batchingColor=tt.batchingColor,ut.instancing=tt.instancing,ut.instancingColor=tt.instancingColor,ut.instancingMorph=tt.instancingMorph,ut.skinning=tt.skinning,ut.morphTargets=tt.morphTargets,ut.morphNormals=tt.morphNormals,ut.morphColors=tt.morphColors,ut.morphTargetsCount=tt.morphTargetsCount,ut.numClippingPlanes=tt.numClippingPlanes,ut.numIntersection=tt.numClipIntersection,ut.vertexAlphas=tt.vertexAlphas,ut.vertexTangents=tt.vertexTangents,ut.toneMapping=tt.toneMapping}function Ji(w,tt){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;C.setFromMatrixPosition(tt.matrixWorld);for(let ut=0,at=w.length;ut<at;ut++){const st=w[ut];if(st.texture!==null&&st.boundingBox.containsPoint(C))return st}return null}function Pi(w,tt,ut,at,st){tt.isScene!==!0&&(tt=ee),mt.resetTextureUnits();const Xt=tt.fog,Qt=at.isMeshStandardMaterial||at.isMeshLambertMaterial||at.isMeshPhongMaterial?tt.environment:null,kt=$===null?G.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:ze.workingColorSpace,$t=at.isMeshStandardMaterial||at.isMeshLambertMaterial&&!at.envMap||at.isMeshPhongMaterial&&!at.envMap,Kt=Lt.get(at.envMap||Qt,$t),pe=at.vertexColors===!0&&!!ut.attributes.color&&ut.attributes.color.itemSize===4,Se=!!ut.attributes.tangent&&(!!at.normalMap||at.anisotropy>0),re=!!ut.morphAttributes.position,we=!!ut.morphAttributes.normal,je=!!ut.morphAttributes.color;let Xe=Ma;at.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(Xe=G.toneMapping);const He=ut.morphAttributes.position||ut.morphAttributes.normal||ut.morphAttributes.color,We=He!==void 0?He.length:0,jt=it.get(at),Hn=D.state.lights;if(Wt===!0&&(ae===!0||w!==bt)){const Qe=w===bt&&at.id===ft;ne.setState(at,w,Qe)}let Re=!1;at.version===jt.__version?(jt.needsLights&&jt.lightsStateVersion!==Hn.state.version||jt.outputColorSpace!==kt||st.isBatchedMesh&&jt.batching===!1||!st.isBatchedMesh&&jt.batching===!0||st.isBatchedMesh&&jt.batchingColor===!0&&st.colorTexture===null||st.isBatchedMesh&&jt.batchingColor===!1&&st.colorTexture!==null||st.isInstancedMesh&&jt.instancing===!1||!st.isInstancedMesh&&jt.instancing===!0||st.isSkinnedMesh&&jt.skinning===!1||!st.isSkinnedMesh&&jt.skinning===!0||st.isInstancedMesh&&jt.instancingColor===!0&&st.instanceColor===null||st.isInstancedMesh&&jt.instancingColor===!1&&st.instanceColor!==null||st.isInstancedMesh&&jt.instancingMorph===!0&&st.morphTexture===null||st.isInstancedMesh&&jt.instancingMorph===!1&&st.morphTexture!==null||jt.envMap!==Kt||at.fog===!0&&jt.fog!==Xt||jt.numClippingPlanes!==void 0&&(jt.numClippingPlanes!==ne.numPlanes||jt.numIntersection!==ne.numIntersection)||jt.vertexAlphas!==pe||jt.vertexTangents!==Se||jt.morphTargets!==re||jt.morphNormals!==we||jt.morphColors!==je||jt.toneMapping!==Xe||jt.morphTargetsCount!==We||!!jt.lightProbeGrid!=D.state.lightProbeGridArray.length>0)&&(Re=!0):(Re=!0,jt.__version=at.version);let En=jt.currentProgram;Re===!0&&(En=ke(at,tt,st),W&&at.isNodeMaterial&&W.onUpdateProgram(at,En,jt));let ni=!1,xi=!1,ii=!1;const qe=En.getUniforms(),mn=jt.uniforms;if(E.useProgram(En.program)&&(ni=!0,xi=!0,ii=!0),at.id!==ft&&(ft=at.id,xi=!0),jt.needsLights){const Qe=Ji(D.state.lightProbeGridArray,st);jt.lightProbeGrid!==Qe&&(jt.lightProbeGrid=Qe,xi=!0)}if(ni||bt!==w){E.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),qe.setValue(X,"projectionMatrix",w.projectionMatrix),qe.setValue(X,"viewMatrix",w.matrixWorldInverse);const ua=qe.map.cameraPosition;ua!==void 0&&ua.setValue(X,ce.setFromMatrixPosition(w.matrixWorld)),O.logarithmicDepthBuffer&&qe.setValue(X,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(at.isMeshPhongMaterial||at.isMeshToonMaterial||at.isMeshLambertMaterial||at.isMeshBasicMaterial||at.isMeshStandardMaterial||at.isShaderMaterial)&&qe.setValue(X,"isOrthographic",w.isOrthographicCamera===!0),bt!==w&&(bt=w,xi=!0,ii=!0)}if(jt.needsLights&&(Hn.state.directionalShadowMap.length>0&&qe.setValue(X,"directionalShadowMap",Hn.state.directionalShadowMap,mt),Hn.state.spotShadowMap.length>0&&qe.setValue(X,"spotShadowMap",Hn.state.spotShadowMap,mt),Hn.state.pointShadowMap.length>0&&qe.setValue(X,"pointShadowMap",Hn.state.pointShadowMap,mt)),st.isSkinnedMesh){qe.setOptional(X,st,"bindMatrix"),qe.setOptional(X,st,"bindMatrixInverse");const Qe=st.skeleton;Qe&&(Qe.boneTexture===null&&Qe.computeBoneTexture(),qe.setValue(X,"boneTexture",Qe.boneTexture,mt))}st.isBatchedMesh&&(qe.setOptional(X,st,"batchingTexture"),qe.setValue(X,"batchingTexture",st._matricesTexture,mt),qe.setOptional(X,st,"batchingIdTexture"),qe.setValue(X,"batchingIdTexture",st._indirectTexture,mt),qe.setOptional(X,st,"batchingColorTexture"),st._colorsTexture!==null&&qe.setValue(X,"batchingColorTexture",st._colorsTexture,mt));const $i=ut.morphAttributes;if(($i.position!==void 0||$i.normal!==void 0||$i.color!==void 0)&&Y.update(st,ut,En),(xi||jt.receiveShadow!==st.receiveShadow)&&(jt.receiveShadow=st.receiveShadow,qe.setValue(X,"receiveShadow",st.receiveShadow)),(at.isMeshStandardMaterial||at.isMeshLambertMaterial||at.isMeshPhongMaterial)&&at.envMap===null&&tt.environment!==null&&(mn.envMapIntensity.value=tt.environmentIntensity),mn.dfgLUT!==void 0&&(mn.dfgLUT.value=BC()),xi){if(qe.setValue(X,"toneMappingExposure",G.toneMappingExposure),jt.needsLights&&pn(mn,ii),Xt&&at.fog===!0&&Bt.refreshFogUniforms(mn,Xt),Bt.refreshMaterialUniforms(mn,at,xt,yt,D.state.transmissionRenderTarget[w.id]),jt.needsLights&&jt.lightProbeGrid){const Qe=jt.lightProbeGrid;mn.probesSH.value=Qe.texture,mn.probesMin.value.copy(Qe.boundingBox.min),mn.probesMax.value.copy(Qe.boundingBox.max),mn.probesResolution.value.copy(Qe.resolution)}Zu.upload(X,kn(jt),mn,mt)}if(at.isShaderMaterial&&at.uniformsNeedUpdate===!0&&(Zu.upload(X,kn(jt),mn,mt),at.uniformsNeedUpdate=!1),at.isSpriteMaterial&&qe.setValue(X,"center",st.center),qe.setValue(X,"modelViewMatrix",st.modelViewMatrix),qe.setValue(X,"normalMatrix",st.normalMatrix),qe.setValue(X,"modelMatrix",st.matrixWorld),at.uniformsGroups!==void 0){const Qe=at.uniformsGroups;for(let ua=0,es=Qe.length;ua<es;ua++){const Gs=Qe[ua];At.update(Gs,En),At.bind(Gs,En)}}return En}function pn(w,tt){w.ambientLightColor.needsUpdate=tt,w.lightProbe.needsUpdate=tt,w.directionalLights.needsUpdate=tt,w.directionalLightShadows.needsUpdate=tt,w.pointLights.needsUpdate=tt,w.pointLightShadows.needsUpdate=tt,w.spotLights.needsUpdate=tt,w.spotLightShadows.needsUpdate=tt,w.rectAreaLights.needsUpdate=tt,w.hemisphereLights.needsUpdate=tt}function ca(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(w,tt,ut){const at=it.get(w);at.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,at.__autoAllocateDepthBuffer===!1&&(at.__useRenderToTexture=!1),it.get(w.texture).__webglTexture=tt,it.get(w.depthTexture).__webglTexture=at.__autoAllocateDepthBuffer?void 0:ut,at.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,tt){const ut=it.get(w);ut.__webglFramebuffer=tt,ut.__useDefaultFramebuffer=tt===void 0},this.setRenderTarget=function(w,tt=0,ut=0){$=w,I=tt,V=ut;let at=null,st=!1,Xt=!1;if(w){const kt=it.get(w);if(kt.__useDefaultFramebuffer!==void 0){E.bindFramebuffer(X.FRAMEBUFFER,kt.__webglFramebuffer),F.copy(w.viewport),q.copy(w.scissor),vt=w.scissorTest,E.viewport(F),E.scissor(q),E.setScissorTest(vt),ft=-1;return}else if(kt.__webglFramebuffer===void 0)mt.setupRenderTarget(w);else if(kt.__hasExternalTextures)mt.rebindTextures(w,it.get(w.texture).__webglTexture,it.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const pe=w.depthTexture;if(kt.__boundDepthTexture!==pe){if(pe!==null&&it.has(pe)&&(w.width!==pe.image.width||w.height!==pe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");mt.setupDepthRenderbuffer(w)}}const $t=w.texture;($t.isData3DTexture||$t.isDataArrayTexture||$t.isCompressedArrayTexture)&&(Xt=!0);const Kt=it.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Kt[tt])?at=Kt[tt][ut]:at=Kt[tt],st=!0):w.samples>0&&mt.useMultisampledRTT(w)===!1?at=it.get(w).__webglMultisampledFramebuffer:Array.isArray(Kt)?at=Kt[ut]:at=Kt,F.copy(w.viewport),q.copy(w.scissor),vt=w.scissorTest}else F.copy(Ut).multiplyScalar(xt).floor(),q.copy(Yt).multiplyScalar(xt).floor(),vt=It;if(ut!==0&&(at=lt),E.bindFramebuffer(X.FRAMEBUFFER,at)&&E.drawBuffers(w,at),E.viewport(F),E.scissor(q),E.setScissorTest(vt),st){const kt=it.get(w.texture);X.framebufferTexture2D(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_CUBE_MAP_POSITIVE_X+tt,kt.__webglTexture,ut)}else if(Xt){const kt=tt;for(let $t=0;$t<w.textures.length;$t++){const Kt=it.get(w.textures[$t]);X.framebufferTextureLayer(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0+$t,Kt.__webglTexture,ut,kt)}}else if(w!==null&&ut!==0){const kt=it.get(w.texture);X.framebufferTexture2D(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,kt.__webglTexture,ut)}ft=-1},this.readRenderTargetPixels=function(w,tt,ut,at,st,Xt,Qt,kt=0){if(!(w&&w.isWebGLRenderTarget)){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let $t=it.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Qt!==void 0&&($t=$t[Qt]),$t){E.bindFramebuffer(X.FRAMEBUFFER,$t);try{const Kt=w.textures[kt],pe=Kt.format,Se=Kt.type;if(w.textures.length>1&&X.readBuffer(X.COLOR_ATTACHMENT0+kt),!O.textureFormatReadable(pe)){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!O.textureTypeReadable(Se)){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}tt>=0&&tt<=w.width-at&&ut>=0&&ut<=w.height-st&&X.readPixels(tt,ut,at,st,zt.convert(pe),zt.convert(Se),Xt)}finally{const Kt=$!==null?it.get($).__webglFramebuffer:null;E.bindFramebuffer(X.FRAMEBUFFER,Kt)}}},this.readRenderTargetPixelsAsync=async function(w,tt,ut,at,st,Xt,Qt,kt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let $t=it.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Qt!==void 0&&($t=$t[Qt]),$t)if(tt>=0&&tt<=w.width-at&&ut>=0&&ut<=w.height-st){E.bindFramebuffer(X.FRAMEBUFFER,$t);const Kt=w.textures[kt],pe=Kt.format,Se=Kt.type;if(w.textures.length>1&&X.readBuffer(X.COLOR_ATTACHMENT0+kt),!O.textureFormatReadable(pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!O.textureTypeReadable(Se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const re=X.createBuffer();X.bindBuffer(X.PIXEL_PACK_BUFFER,re),X.bufferData(X.PIXEL_PACK_BUFFER,Xt.byteLength,X.STREAM_READ),X.readPixels(tt,ut,at,st,zt.convert(pe),zt.convert(Se),0);const we=$!==null?it.get($).__webglFramebuffer:null;E.bindFramebuffer(X.FRAMEBUFFER,we);const je=X.fenceSync(X.SYNC_GPU_COMMANDS_COMPLETE,0);return X.flush(),await eT(X,je,4),X.bindBuffer(X.PIXEL_PACK_BUFFER,re),X.getBufferSubData(X.PIXEL_PACK_BUFFER,0,Xt),X.deleteBuffer(re),X.deleteSync(je),Xt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,tt=null,ut=0){const at=Math.pow(2,-ut),st=Math.floor(w.image.width*at),Xt=Math.floor(w.image.height*at),Qt=tt!==null?tt.x:0,kt=tt!==null?tt.y:0;mt.setTexture2D(w,0),X.copyTexSubImage2D(X.TEXTURE_2D,ut,0,0,Qt,kt,st,Xt),E.unbindTexture()},this.copyTextureToTexture=function(w,tt,ut=null,at=null,st=0,Xt=0){let Qt,kt,$t,Kt,pe,Se,re,we,je;const Xe=w.isCompressedTexture?w.mipmaps[Xt]:w.image;if(ut!==null)Qt=ut.max.x-ut.min.x,kt=ut.max.y-ut.min.y,$t=ut.isBox3?ut.max.z-ut.min.z:1,Kt=ut.min.x,pe=ut.min.y,Se=ut.isBox3?ut.min.z:0;else{const mn=Math.pow(2,-st);Qt=Math.floor(Xe.width*mn),kt=Math.floor(Xe.height*mn),w.isDataArrayTexture?$t=Xe.depth:w.isData3DTexture?$t=Math.floor(Xe.depth*mn):$t=1,Kt=0,pe=0,Se=0}at!==null?(re=at.x,we=at.y,je=at.z):(re=0,we=0,je=0);const He=zt.convert(tt.format),We=zt.convert(tt.type);let jt;tt.isData3DTexture?(mt.setTexture3D(tt,0),jt=X.TEXTURE_3D):tt.isDataArrayTexture||tt.isCompressedArrayTexture?(mt.setTexture2DArray(tt,0),jt=X.TEXTURE_2D_ARRAY):(mt.setTexture2D(tt,0),jt=X.TEXTURE_2D),E.activeTexture(X.TEXTURE0),E.pixelStorei(X.UNPACK_FLIP_Y_WEBGL,tt.flipY),E.pixelStorei(X.UNPACK_PREMULTIPLY_ALPHA_WEBGL,tt.premultiplyAlpha),E.pixelStorei(X.UNPACK_ALIGNMENT,tt.unpackAlignment);const Hn=E.getParameter(X.UNPACK_ROW_LENGTH),Re=E.getParameter(X.UNPACK_IMAGE_HEIGHT),En=E.getParameter(X.UNPACK_SKIP_PIXELS),ni=E.getParameter(X.UNPACK_SKIP_ROWS),xi=E.getParameter(X.UNPACK_SKIP_IMAGES);E.pixelStorei(X.UNPACK_ROW_LENGTH,Xe.width),E.pixelStorei(X.UNPACK_IMAGE_HEIGHT,Xe.height),E.pixelStorei(X.UNPACK_SKIP_PIXELS,Kt),E.pixelStorei(X.UNPACK_SKIP_ROWS,pe),E.pixelStorei(X.UNPACK_SKIP_IMAGES,Se);const ii=w.isDataArrayTexture||w.isData3DTexture,qe=tt.isDataArrayTexture||tt.isData3DTexture;if(w.isDepthTexture){const mn=it.get(w),$i=it.get(tt),Qe=it.get(mn.__renderTarget),ua=it.get($i.__renderTarget);E.bindFramebuffer(X.READ_FRAMEBUFFER,Qe.__webglFramebuffer),E.bindFramebuffer(X.DRAW_FRAMEBUFFER,ua.__webglFramebuffer);for(let es=0;es<$t;es++)ii&&(X.framebufferTextureLayer(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,it.get(w).__webglTexture,st,Se+es),X.framebufferTextureLayer(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,it.get(tt).__webglTexture,Xt,je+es)),X.blitFramebuffer(Kt,pe,Qt,kt,re,we,Qt,kt,X.DEPTH_BUFFER_BIT,X.NEAREST);E.bindFramebuffer(X.READ_FRAMEBUFFER,null),E.bindFramebuffer(X.DRAW_FRAMEBUFFER,null)}else if(st!==0||w.isRenderTargetTexture||it.has(w)){const mn=it.get(w),$i=it.get(tt);E.bindFramebuffer(X.READ_FRAMEBUFFER,ct),E.bindFramebuffer(X.DRAW_FRAMEBUFFER,J);for(let Qe=0;Qe<$t;Qe++)ii?X.framebufferTextureLayer(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,mn.__webglTexture,st,Se+Qe):X.framebufferTexture2D(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,mn.__webglTexture,st),qe?X.framebufferTextureLayer(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,$i.__webglTexture,Xt,je+Qe):X.framebufferTexture2D(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,$i.__webglTexture,Xt),st!==0?X.blitFramebuffer(Kt,pe,Qt,kt,re,we,Qt,kt,X.COLOR_BUFFER_BIT,X.NEAREST):qe?X.copyTexSubImage3D(jt,Xt,re,we,je+Qe,Kt,pe,Qt,kt):X.copyTexSubImage2D(jt,Xt,re,we,Kt,pe,Qt,kt);E.bindFramebuffer(X.READ_FRAMEBUFFER,null),E.bindFramebuffer(X.DRAW_FRAMEBUFFER,null)}else qe?w.isDataTexture||w.isData3DTexture?X.texSubImage3D(jt,Xt,re,we,je,Qt,kt,$t,He,We,Xe.data):tt.isCompressedArrayTexture?X.compressedTexSubImage3D(jt,Xt,re,we,je,Qt,kt,$t,He,Xe.data):X.texSubImage3D(jt,Xt,re,we,je,Qt,kt,$t,He,We,Xe):w.isDataTexture?X.texSubImage2D(X.TEXTURE_2D,Xt,re,we,Qt,kt,He,We,Xe.data):w.isCompressedTexture?X.compressedTexSubImage2D(X.TEXTURE_2D,Xt,re,we,Xe.width,Xe.height,He,Xe.data):X.texSubImage2D(X.TEXTURE_2D,Xt,re,we,Qt,kt,He,We,Xe);E.pixelStorei(X.UNPACK_ROW_LENGTH,Hn),E.pixelStorei(X.UNPACK_IMAGE_HEIGHT,Re),E.pixelStorei(X.UNPACK_SKIP_PIXELS,En),E.pixelStorei(X.UNPACK_SKIP_ROWS,ni),E.pixelStorei(X.UNPACK_SKIP_IMAGES,xi),Xt===0&&tt.generateMipmaps&&X.generateMipmap(jt),E.unbindTexture()},this.initRenderTarget=function(w){it.get(w).__webglFramebuffer===void 0&&mt.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?mt.setTextureCube(w,0):w.isData3DTexture?mt.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?mt.setTexture2DArray(w,0):mt.setTexture2D(w,0),E.unbindTexture()},this.resetState=function(){I=0,V=0,$=null,E.reset(),Gt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ya}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const n=this.getContext();n.drawingBufferColorSpace=ze._getDrawingBufferColorSpace(t),n.unpackColorSpace=ze._getUnpackColorSpace()}}const jx={type:"change"},Vm={type:"start"},dS={type:"end"},Pu=new gf,Qx=new Ls,GC=Math.cos(70*aT.DEG2RAD),Pn=new et,gi=2*Math.PI,on={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},gp=1e-6;class VC extends XT{constructor(t,n=null){super(t,n),this.state=on.NONE,this.target=new et,this.cursor=new et,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:go.ROTATE,MIDDLE:go.DOLLY,RIGHT:go.PAN},this.touches={ONE:mo.ROTATE,TWO:mo.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new et,this._lastQuaternion=new Bs,this._lastTargetPosition=new et,this._quat=new Bs().setFromUnitVectors(t.up,new et(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ex,this._sphericalDelta=new Ex,this._scale=1,this._panOffset=new et,this._rotateStart=new he,this._rotateEnd=new he,this._rotateDelta=new he,this._panStart=new he,this._panEnd=new he,this._panDelta=new he,this._dollyStart=new he,this._dollyEnd=new he,this._dollyDelta=new he,this._dollyDirection=new et,this._mouse=new he,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=XC.bind(this),this._onPointerDown=kC.bind(this),this._onPointerUp=WC.bind(this),this._onContextMenu=JC.bind(this),this._onMouseWheel=ZC.bind(this),this._onKeyDown=KC.bind(this),this._onTouchStart=jC.bind(this),this._onTouchMove=QC.bind(this),this._onMouseDown=qC.bind(this),this._onMouseMove=YC.bind(this),this._interceptControlDown=$C.bind(this),this._interceptControlUp=tw.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(jx),this.update(),this.state=on.NONE}pan(t,n){this._pan(t,n),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const n=this.object.position;Pn.copy(n).sub(this.target),Pn.applyQuaternion(this._quat),this._spherical.setFromVector3(Pn),this.autoRotate&&this.state===on.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let s=this.minAzimuthAngle,o=this.maxAzimuthAngle;isFinite(s)&&isFinite(o)&&(s<-Math.PI?s+=gi:s>Math.PI&&(s-=gi),o<-Math.PI?o+=gi:o>Math.PI&&(o-=gi),s<=o?this._spherical.theta=Math.max(s,Math.min(o,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(s+o)/2?Math.max(s,this._spherical.theta):Math.min(o,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let c=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const u=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),c=u!=this._spherical.radius}if(Pn.setFromSpherical(this._spherical),Pn.applyQuaternion(this._quatInverse),n.copy(this.target).add(Pn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let u=null;if(this.object.isPerspectiveCamera){const h=Pn.length();u=this._clampDistance(h*this._scale);const m=h-u;this.object.position.addScaledVector(this._dollyDirection,m),this.object.updateMatrixWorld(),c=!!m}else if(this.object.isOrthographicCamera){const h=new et(this._mouse.x,this._mouse.y,0);h.unproject(this.object);const m=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),c=m!==this.object.zoom;const d=new et(this._mouse.x,this._mouse.y,0);d.unproject(this.object),this.object.position.sub(d).add(h),this.object.updateMatrixWorld(),u=Pn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;u!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(u).add(this.object.position):(Pu.origin.copy(this.object.position),Pu.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Pu.direction))<GC?this.object.lookAt(this.target):(Qx.setFromNormalAndCoplanarPoint(this.object.up,this.target),Pu.intersectPlane(Qx,this.target))))}else if(this.object.isOrthographicCamera){const u=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),u!==this.object.zoom&&(this.object.updateProjectionMatrix(),c=!0)}return this._scale=1,this._performCursorZoom=!1,c||this._lastPosition.distanceToSquared(this.object.position)>gp||8*(1-this._lastQuaternion.dot(this.object.quaternion))>gp||this._lastTargetPosition.distanceToSquared(this.target)>gp?(this.dispatchEvent(jx),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?gi/60*this.autoRotateSpeed*t:gi/60/60*this.autoRotateSpeed}_getZoomScale(t){const n=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*n)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,n){Pn.setFromMatrixColumn(n,0),Pn.multiplyScalar(-t),this._panOffset.add(Pn)}_panUp(t,n){this.screenSpacePanning===!0?Pn.setFromMatrixColumn(n,1):(Pn.setFromMatrixColumn(n,0),Pn.crossVectors(this.object.up,Pn)),Pn.multiplyScalar(t),this._panOffset.add(Pn)}_pan(t,n){const s=this.domElement;if(this.object.isPerspectiveCamera){const o=this.object.position;Pn.copy(o).sub(this.target);let c=Pn.length();c*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*c/s.clientHeight,this.object.matrix),this._panUp(2*n*c/s.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/s.clientWidth,this.object.matrix),this._panUp(n*(this.object.top-this.object.bottom)/this.object.zoom/s.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,n){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const s=this.domElement.getBoundingClientRect(),o=t-s.left,c=n-s.top,u=s.width,h=s.height;this._mouse.x=o/u*2-1,this._mouse.y=-(c/h)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const n=this.domElement;this._rotateLeft(gi*this._rotateDelta.x/n.clientHeight),this._rotateUp(gi*this._rotateDelta.y/n.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let n=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(gi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),n=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-gi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),n=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(gi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),n=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-gi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),n=!0;break}n&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),o=.5*(t.pageY+n.y);this._rotateStart.set(s,o)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),o=.5*(t.pageY+n.y);this._panStart.set(s,o)}}_handleTouchStartDolly(t){const n=this._getSecondPointerPosition(t),s=t.pageX-n.x,o=t.pageY-n.y,c=Math.sqrt(s*s+o*o);this._dollyStart.set(0,c)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const s=this._getSecondPointerPosition(t),o=.5*(t.pageX+s.x),c=.5*(t.pageY+s.y);this._rotateEnd.set(o,c)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const n=this.domElement;this._rotateLeft(gi*this._rotateDelta.x/n.clientHeight),this._rotateUp(gi*this._rotateDelta.y/n.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),o=.5*(t.pageY+n.y);this._panEnd.set(s,o)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const n=this._getSecondPointerPosition(t),s=t.pageX-n.x,o=t.pageY-n.y,c=Math.sqrt(s*s+o*o);this._dollyEnd.set(0,c),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const u=(t.pageX+n.x)*.5,h=(t.pageY+n.y)*.5;this._updateZoomParameters(u,h)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let n=0;n<this._pointers.length;n++)if(this._pointers[n]==t.pointerId){this._pointers.splice(n,1);return}}_isTrackingPointer(t){for(let n=0;n<this._pointers.length;n++)if(this._pointers[n]==t.pointerId)return!0;return!1}_trackPointer(t){let n=this._pointerPositions[t.pointerId];n===void 0&&(n=new he,this._pointerPositions[t.pointerId]=n),n.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const n=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[n]}_customWheelEvent(t){const n=t.deltaMode,s={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(n){case 1:s.deltaY*=16;break;case 2:s.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(s.deltaY*=10),s}}function kC(a){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(a.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(a)&&(this._addPointer(a),a.pointerType==="touch"?this._onTouchStart(a):this._onMouseDown(a),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function XC(a){this.enabled!==!1&&(a.pointerType==="touch"?this._onTouchMove(a):this._onMouseMove(a))}function WC(a){switch(this._removePointer(a),this._pointers.length){case 0:this.domElement.releasePointerCapture(a.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(dS),this.state=on.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y});break}}function qC(a){let t;switch(a.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case go.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(a),this.state=on.DOLLY;break;case go.ROTATE:if(a.ctrlKey||a.metaKey||a.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(a),this.state=on.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(a),this.state=on.ROTATE}break;case go.PAN:if(a.ctrlKey||a.metaKey||a.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(a),this.state=on.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(a),this.state=on.PAN}break;default:this.state=on.NONE}this.state!==on.NONE&&this.dispatchEvent(Vm)}function YC(a){switch(this.state){case on.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(a);break;case on.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(a);break;case on.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(a);break}}function ZC(a){this.enabled===!1||this.enableZoom===!1||this.state!==on.NONE||(a.preventDefault(),this.dispatchEvent(Vm),this._handleMouseWheel(this._customWheelEvent(a)),this.dispatchEvent(dS))}function KC(a){this.enabled!==!1&&this._handleKeyDown(a)}function jC(a){switch(this._trackPointer(a),this._pointers.length){case 1:switch(this.touches.ONE){case mo.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(a),this.state=on.TOUCH_ROTATE;break;case mo.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(a),this.state=on.TOUCH_PAN;break;default:this.state=on.NONE}break;case 2:switch(this.touches.TWO){case mo.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(a),this.state=on.TOUCH_DOLLY_PAN;break;case mo.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(a),this.state=on.TOUCH_DOLLY_ROTATE;break;default:this.state=on.NONE}break;default:this.state=on.NONE}this.state!==on.NONE&&this.dispatchEvent(Vm)}function QC(a){switch(this._trackPointer(a),this.state){case on.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(a),this.update();break;case on.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(a),this.update();break;case on.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(a),this.update();break;case on.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(a),this.update();break;default:this.state=on.NONE}}function JC(a){this.enabled!==!1&&a.preventDefault()}function $C(a){a.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function tw(a){a.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const Ku={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class wo{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const ew=new Gm(-1,1,1,-1,0,1);class nw extends On{constructor(){super(),this.setAttribute("position",new ci([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ci([0,2,0,0,2,0],2))}}const iw=new nw;class km{constructor(t){this._mesh=new Ui(iw,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,ew)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class aw extends wo{constructor(t,n="tDiffuse"){super(),this.textureID=n,this.uniforms=null,this.material=null,t instanceof zn?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Gl.clone(t.uniforms),this.material=new zn({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new km(this.material)}render(t,n,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(n),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Jx extends wo{constructor(t,n){super(),this.scene=t,this.camera=n,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,n,s){const o=t.getContext(),c=t.state;c.buffers.color.setMask(!1),c.buffers.depth.setMask(!1),c.buffers.color.setLocked(!0),c.buffers.depth.setLocked(!0);let u,h;this.inverse?(u=0,h=1):(u=1,h=0),c.buffers.stencil.setTest(!0),c.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),c.buffers.stencil.setFunc(o.ALWAYS,u,4294967295),c.buffers.stencil.setClear(h),c.buffers.stencil.setLocked(!0),t.setRenderTarget(s),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),c.buffers.color.setLocked(!1),c.buffers.depth.setLocked(!1),c.buffers.color.setMask(!0),c.buffers.depth.setMask(!0),c.buffers.stencil.setLocked(!1),c.buffers.stencil.setFunc(o.EQUAL,1,4294967295),c.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),c.buffers.stencil.setLocked(!0)}}class sw extends wo{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class rw{constructor(t,n){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),n===void 0){const s=t.getSize(new he);this._width=s.width,this._height=s.height,n=new _i(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Di}),n.texture.name="EffectComposer.rt1"}else this._width=n.width,this._height=n.height;this.renderTarget1=n,this.renderTarget2=n.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new aw(Ku),this.copyPass.material.blending=Sa,this.timer=new VT}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,n){this.passes.splice(n,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const n=this.passes.indexOf(t);n!==-1&&this.passes.splice(n,1)}isLastEnabledPass(t){for(let n=t+1;n<this.passes.length;n++)if(this.passes[n].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());const n=this.renderer.getRenderTarget();let s=!1;for(let o=0,c=this.passes.length;o<c;o++){const u=this.passes[o];if(u.enabled!==!1){if(u.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),u.render(this.renderer,this.writeBuffer,this.readBuffer,t,s),u.needsSwap){if(s){const h=this.renderer.getContext(),m=this.renderer.state.buffers.stencil;m.setFunc(h.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),m.setFunc(h.EQUAL,1,4294967295)}this.swapBuffers()}Jx!==void 0&&(u instanceof Jx?s=!0:u instanceof sw&&(s=!1))}}this.renderer.setRenderTarget(n)}reset(t){if(t===void 0){const n=this.renderer.getSize(new he);this._pixelRatio=this.renderer.getPixelRatio(),this._width=n.width,this._height=n.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,n){this._width=t,this._height=n;const s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let c=0;c<this.passes.length;c++)this.passes[c].setSize(s,o)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class ow extends wo{constructor(t,n,s=null,o=null,c=null){super(),this.scene=t,this.camera=n,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=c,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ce}render(t,n,s){const o=t.autoClear;t.autoClear=!1;let c,u;this.overrideMaterial!==null&&(u=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(c=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(c),this.overrideMaterial!==null&&(this.scene.overrideMaterial=u),t.autoClear=o}}const lw={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ce(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Eo extends wo{constructor(t,n=1,s,o){super(),this.strength=n,this.radius=s,this.threshold=o,this.resolution=t!==void 0?new he(t.x,t.y):new he(256,256),this.clearColor=new Ce(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let c=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);this.renderTargetBright=new _i(c,u,{type:Di}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let g=0;g<this.nMips;g++){const v=new _i(c,u,{type:Di});v.texture.name="UnrealBloomPass.h"+g,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);const _=new _i(c,u,{type:Di});_.texture.name="UnrealBloomPass.v"+g,_.texture.generateMipmaps=!1,this.renderTargetsVertical.push(_),c=Math.round(c/2),u=Math.round(u/2)}const h=lw;this.highPassUniforms=Gl.clone(h.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new zn({uniforms:this.highPassUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader}),this.separableBlurMaterials=[];const m=[6,10,14,18,22];c=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);for(let g=0;g<this.nMips;g++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(m[g])),this.separableBlurMaterials[g].uniforms.invSize.value=new he(1/c,1/u),c=Math.round(c/2),u=Math.round(u/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=n,this.compositeMaterial.uniforms.bloomRadius.value=.1;const d=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=d,this.bloomTintColors=[new et(1,1,1),new et(1,1,1),new et(1,1,1),new et(1,1,1),new et(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Gl.clone(Ku.uniforms),this.blendMaterial=new zn({uniforms:this.copyUniforms,vertexShader:Ku.vertexShader,fragmentShader:Ku.fragmentShader,premultipliedAlpha:!0,blending:Ns,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ce,this._oldClearAlpha=1,this._basic=new Bm,this._fsQuad=new km(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,n){let s=Math.round(t/2),o=Math.round(n/2);this.renderTargetBright.setSize(s,o);for(let c=0;c<this.nMips;c++)this.renderTargetsHorizontal[c].setSize(s,o),this.renderTargetsVertical[c].setSize(s,o),this.separableBlurMaterials[c].uniforms.invSize.value=new he(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(t,n,s,o,c){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();const u=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),c&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let h=this.renderTargetBright;for(let m=0;m<this.nMips;m++)this._fsQuad.material=this.separableBlurMaterials[m],this.separableBlurMaterials[m].uniforms.colorTexture.value=h.texture,this.separableBlurMaterials[m].uniforms.direction.value=Eo.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[m]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[m].uniforms.colorTexture.value=this.renderTargetsHorizontal[m].texture,this.separableBlurMaterials[m].uniforms.direction.value=Eo.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[m]),t.clear(),this._fsQuad.render(t),h=this.renderTargetsVertical[m];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,c&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(s),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=u}_getSeparableBlurMaterial(t){const n=[],s=t/3;for(let o=0;o<t;o++)n.push(.39894*Math.exp(-.5*o*o/(s*s))/s);return new zn({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new he(.5,.5)},direction:{value:new he(.5,.5)},gaussianCoefficients:{value:n}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(t){return new zn({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}Eo.BlurDirectionX=new he(1,0);Eo.BlurDirectionY=new he(0,1);const Ou={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class cw extends wo{constructor(){super(),this.isOutputPass=!0,this.uniforms=Gl.clone(Ou.uniforms),this.material=new iS({name:Ou.name,uniforms:this.uniforms,vertexShader:Ou.vertexShader,fragmentShader:Ou.fragmentShader}),this._fsQuad=new km(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,n,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ze.getTransfer(this._outputColorSpace)===Je&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===bm?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Em?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Tm?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Am?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Cm?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===wm?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Rm&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(n),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const uw=`
attribute vec3 aV0;
attribute vec3 aP1;
attribute vec3 aV1;
attribute vec3 aColor;
attribute float aSize;
uniform float uS;    // seconds since t0 (CPU float64 -> float32)
uniform float uDur;  // interval duration in seconds
uniform float uScale;
uniform float uPixelRatio;
varying vec3 vColor;
void main() {
  float s = clamp(uS / uDur, 0.0, 1.0);
  float s2 = s * s;
  float s3 = s2 * s;
  float h00 = 2.0 * s3 - 3.0 * s2 + 1.0;
  float h10 = s3 - 2.0 * s2 + s;
  float h01 = -2.0 * s3 + 3.0 * s2;
  float h11 = s3 - s2;
  vec3 p = h00 * position + h10 * uDur * aV0 + h01 * aP1 + h11 * uDur * aV1;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float ps = aSize * uScale * uPixelRatio * (3.1 / -mv.z);
  gl_PointSize = clamp(ps, 1.0, 48.0);
}
`,fw=`
varying vec3 vColor;
uniform float uIntensity;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.30, 0.10, d);
  float halo = smoothstep(0.5, 0.12, d) * 0.5;
  vec3 col = vColor * (0.5 + uIntensity * core);
  gl_FragColor = vec4(col, max(halo, core));
}
`,hw=`
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,dw=`
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec3 uSunDir;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 n = normalize(vNormalW);
  float sd = dot(n, uSunDir);
  float dayMix = smoothstep(-0.05, 0.15, sd);
  vec3 dayT = texture2D(uDay, vUv).rgb;
  float luma = dot(dayT, vec3(0.299, 0.587, 0.114));
  dayT = clamp(mix(vec3(luma), dayT, 1.28), 0.0, 1.0); // livelier oceans
  vec3 nightT = texture2D(uNight, vUv).rgb;
  float lit = clamp(sd * 1.1, 0.0, 1.0);
  vec3 col = dayT * lit * 0.78 + dayT * 0.02;
  col += nightT * (1.0 - dayMix) * 0.85;
  vec3 v = normalize(cameraPosition - vPosW);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.5);
  col += vec3(0.20, 0.40, 0.72) * rim * (0.15 + 0.85 * dayMix) * 0.4;
  gl_FragColor = vec4(col, 1.0);
}
`,pw=`
varying vec3 vN;
void main() {
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,mw=`
varying vec3 vN;
void main() {
  float intensity = pow(max(0.60 - dot(normalize(vN), vec3(0.0, 0.0, 1.0)), 0.0), 4.5);
  gl_FragColor = vec4(0.30, 0.55, 1.05, 1.0) * intensity * 1.6;
}
`,zu=96,Fu=96,$x=1;function gw(){const a=document.createElement("canvas");a.width=a.height=96;const t=a.getContext("2d");t.strokeStyle="#ffffff",t.lineWidth=7,t.beginPath(),t.arc(48,48,32,0,Math.PI*2),t.stroke();const n=new wT(a);return n.colorSpace=oi,n}class _w{container;cb;renderer;scene=new vT;camera;controls;composer;bloom;earth;earthMat;groups=[];replacement=null;desiredVisible=[];qualityCap=1.5;appliedW=0;appliedH=0;appliedDpr=0;resizeObserver=null;raf=0;hidden=!1;contextLost=!1;t0=0;t1=1;selected=null;hoverIdx=null;marker;orbitPast;orbitFuture;pastGeo;futureGeo;footLine;footGeo;showOrbit=!0;showFoot=!0;follow=!1;lastOrbitReal=0;lastOrbitSim=-1e15;lastFootReal=0;disposed=!1;tmpV=new et;tmpV2=new et;downPos={x:0,y:0};lastHoverCheck=0;frameTimes=[];dprReduced=!1;lastFrameT=0;fpsCount=0;fpsWindowStart=0;constructor(t,n){this.container=t,this.cb=n,this.renderer=new HC({antialias:!0,alpha:!1,powerPreference:"high-performance"}),this.renderer.setClearColor(263690,1),t.appendChild(this.renderer.domElement);const s=Math.max(1,t.clientWidth),o=Math.max(1,t.clientHeight);this.camera=new Wi(42,s/o,.05,400),this.camera.up.set(0,0,1),this.camera.position.set(1,-2.75,1.35),this.applyViewOffset(),this.controls=new VC(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.minDistance=1.35,this.controls.maxDistance=30,this.controls.autoRotate=!0,this.controls.autoRotateSpeed=.25;const c=new BT,u=c.load("./textures/earth-day.jpg"),h=c.load("./textures/earth-night.jpg");u.colorSpace=oi,h.colorSpace=oi,u.anisotropy=4,h.anisotropy=4;const m=new lf(1,96,96);m.rotateX(Math.PI/2),this.earthMat=new zn({uniforms:{uDay:{value:u},uNight:{value:h},uSunDir:{value:new et(1,0,0)}},vertexShader:hw,fragmentShader:dw}),this.earth=new Ui(m,this.earthMat),this.scene.add(this.earth);const d=new Ui(new lf(1.09,64,64),new zn({vertexShader:pw,fragmentShader:mw,blending:Ns,side:li,transparent:!0,depthWrite:!1}));this.scene.add(d),this.scene.add(this.makeStars()),this.marker=new hx(new jy({map:gw(),color:16777215,transparent:!0,depthWrite:!1})),this.marker.scale.setScalar(.05),this.marker.visible=!1,this.scene.add(this.marker),this.pastGeo=new On,this.pastGeo.setAttribute("position",new Mn(new Float32Array(zu*3),3)),this.pastGeo.setDrawRange(0,0),this.orbitPast=new Au(this.pastGeo,new Yu({color:16739179,transparent:!0,opacity:.75,blending:Ns,depthWrite:!1})),this.orbitPast.frustumCulled=!1,this.scene.add(this.orbitPast),this.futureGeo=new On,this.futureGeo.setAttribute("position",new Mn(new Float32Array(zu*3),3)),this.futureGeo.setDrawRange(0,0),this.orbitFuture=new Au(this.futureGeo,new Yu({color:6534143,transparent:!0,opacity:.8,blending:Ns,depthWrite:!1})),this.orbitFuture.frustumCulled=!1,this.scene.add(this.orbitFuture),this.footGeo=new On,this.footGeo.setAttribute("position",new Mn(new Float32Array((Fu+1)*3),3)),this.footGeo.setDrawRange(0,0),this.footLine=new Au(this.footGeo,new Yu({color:10475775,transparent:!0,opacity:.5,blending:Ns,depthWrite:!1,depthTest:!0})),this.footLine.frustumCulled=!1,this.scene.add(this.footLine),this.composer=new rw(this.renderer),this.composer.addPass(new ow(this.scene,this.camera)),this.bloom=new Eo(new he(s,o),.55,.35,1),this.composer.addPass(this.bloom),this.composer.addPass(new cw),this.applySize();const g=this.renderer.domElement;g.addEventListener("pointerdown",this.onPointerDown),g.addEventListener("pointerup",this.onPointerUp),g.addEventListener("pointermove",this.onPointerMove),g.addEventListener("webglcontextlost",this.onContextLost,!1),g.addEventListener("webglcontextrestored",this.onContextRestored,!1),this.resizeObserver=new ResizeObserver(()=>this.applySize()),this.resizeObserver.observe(t),document.addEventListener("visibilitychange",this.onVisibility),this.loop()}makeStars(){const n=new Float32Array(4200),s=new Float32Array(1400*3);for(let h=0;h<1400;h++){let m=Math.random()*2-1,d=Math.random()*2-1,g=Math.random()*2-1;const v=Math.sqrt(m*m+d*d+g*g)||1,_=60+Math.random()*120;m=m/v*_,d=d/v*_,g=g/v*_,n.set([m,d,g],h*3);const S=.2+Math.random()*.45;s.set([S,S,Math.min(.8,S+.1)],h*3)}const o=new On;o.setAttribute("position",new Mn(n,3)),o.setAttribute("color",new Mn(s,3));const c=new $y({size:1,sizeAttenuation:!1,vertexColors:!0,transparent:!0,opacity:.45,depthWrite:!1}),u=new lp(o,c);return u.frustumCulled=!1,u}applyViewOffset(){const t=Math.max(1,this.container.clientWidth),n=Math.max(1,this.container.clientHeight);t>=1024&&t>n?this.camera.setViewOffset(t,n,-Math.round(t*.09),-Math.round(n*.05),t,n):this.camera.clearViewOffset()}computeDpr(t,n){const s=Math.sqrt(5e6/(t*n));return Math.max(.5,Math.min(window.devicePixelRatio||1,this.qualityCap,s))}applySize=()=>{const t=Math.max(1,this.container.clientWidth),n=Math.max(1,this.container.clientHeight),s=this.computeDpr(t,n);if(!(t===this.appliedW&&n===this.appliedH&&s===this.appliedDpr)){this.appliedW=t,this.appliedH=n,this.appliedDpr=s,this.camera.aspect=t/n,this.applyViewOffset(),this.camera.updateProjectionMatrix(),this.renderer.setPixelRatio(s),this.renderer.setSize(t,n),this.composer.setPixelRatio(s),this.composer.setSize(t,n);for(const o of this.groups)o.mat.uniforms.uPixelRatio.value=s;if(this.replacement)for(const o of this.replacement)o.mat.uniforms.uPixelRatio.value=s}};newestGroups(){return this.replacement??this.groups}disposeGroups(t){for(const n of t)this.scene.remove(n.points),n.points.geometry.dispose(),n.mat.dispose()}buildSatellites(t){this.replacement&&(this.disposeGroups(this.replacement),this.replacement=null);const n=[];let s=0;for(const o of t){const c=Math.max(o.count,1),u=new On,h=new Float32Array(c*3),m=new Float32Array(c*3),d=new Float32Array(c*3),g=new Float32Array(c*3),v=new Float32Array(c*3),_=new Float32Array(c),S=new Ce(o.color);for(let x=0;x<c;x++)v.set([S.r,S.g,S.b],x*3),_[x]=o.size;u.setAttribute("position",new Mn(h,3)),u.setAttribute("aV0",new Mn(m,3)),u.setAttribute("aP1",new Mn(d,3)),u.setAttribute("aV1",new Mn(g,3)),u.setAttribute("aColor",new Mn(v,3)),u.setAttribute("aSize",new Mn(_,1));const b=new zn({vertexShader:uw,fragmentShader:fw,uniforms:{uS:{value:0},uDur:{value:1},uScale:{value:1},uPixelRatio:{value:this.appliedDpr||1},uIntensity:{value:2.1}},transparent:!0,blending:Ns,depthWrite:!1,depthTest:!0}),R=new lp(u,b);R.frustumCulled=!1,R.visible=!1,this.scene.add(R),n.push({points:R,mat:b,offset:s,count:o.count,p0:h,v0:m,p1:d,v1:g,sizes:_}),s+=o.count}this.replacement=n}revealReplacement(){if(!this.replacement)return;const t=this.groups;this.groups=this.replacement,this.replacement=null;for(let n=0;n<this.groups.length;n++)this.groups[n].points.visible=this.desiredVisible[n]!==!1;this.disposeGroups(t)}setGroupVisible(t,n){this.desiredVisible[t]=n,this.groups[t]&&!this.replacement&&(this.groups[t].points.visible=n)}updateInterval(t,n,s,o,c,u){for(const h of this.newestGroups()){const m=h.offset*3,d=h.count*3;h.p0.set(s.subarray(m,m+d)),h.v0.set(o.subarray(m,m+d)),h.p1.set(c.subarray(m,m+d)),h.v1.set(u.subarray(m,m+d));const g=h.points.geometry.attributes;g.position.needsUpdate=!0,g.aV0.needsUpdate=!0,g.aP1.needsUpdate=!0,g.aV1.needsUpdate=!0,h.mat.uniforms.uDur.value=Math.max((n-t)/1e3,.001)}this.t0=t/1e3,this.t1=n/1e3}setShowOrbit(t){this.showOrbit=t,this.orbitPast.visible=t&&this.selected!==null,this.orbitFuture.visible=t&&this.selected!==null,this.lastOrbitSim=-1e15}setShowFootprint(t){this.showFoot=t,this.footLine.visible=t&&this.selected!==null}setFollow(t){this.follow=t}setSelected(t,n){this.selected=t,this.marker.visible=t!==null,n&&this.marker.material.color.set(n),this.orbitPast.visible=t!==null&&this.showOrbit,this.orbitFuture.visible=t!==null&&this.showOrbit,this.footLine.visible=t!==null&&this.showFoot,this.lastOrbitSim=-1e15,t===null&&(this.pastGeo.setDrawRange(0,0),this.futureGeo.setDrawRange(0,0),this.footGeo.setDrawRange(0,0),this.controls.target.set(0,0,0))}markDead(t){for(const n of this.groups){const s=n.points.geometry.getAttribute("aSize");let o=!1;for(const c of t)c>=n.offset&&c<n.offset+n.count&&(s.setX(c-n.offset,0),n.sizes[c-n.offset]=0,o=!0);o&&(s.needsUpdate=!0)}}eciPosition(t,n){const s=this.cb.getSimTime()/1e3,o=Math.max(this.t1-this.t0,.001),c=Math.min(Math.max((s-this.t0)/o,0),1),u=c*c,h=u*c,m=2*h-3*u+1,d=h-2*u+c,g=-2*h+3*u,v=h-u;for(const _ of this.groups)if(t>=_.offset&&t<_.offset+_.count){const S=(t-_.offset)*3;return n.set(m*_.p0[S]+d*o*_.v0[S]+g*_.p1[S]+v*o*_.v1[S],m*_.p0[S+1]+d*o*_.v0[S+1]+g*_.p1[S+1]+v*o*_.v1[S+1],m*_.p0[S+2]+d*o*_.v0[S+2]+g*_.p1[S+2]+v*o*_.v1[S+2]),n}return null}isOccluded(t){const n=this.camera.position;t.dot(this.tmpV2.copy(n).normalize())<-.05;const s=t.x-n.x,o=t.y-n.y,c=t.z-n.z,u=Math.sqrt(s*s+o*o+c*c);if(u<1e-6)return!1;const h=(n.x*s+n.y*o+n.z*c)/u,m=n.x*n.x+n.y*n.y+n.z*n.z-$x*$x,d=h*h-m;if(d<=0)return!1;const g=-h-Math.sqrt(d);return g>0&&g<u-.001}pick(t,n,s){if(this.replacement)return null;const o=this.renderer.domElement.getBoundingClientRect(),c=t-o.left,u=n-o.top,h=this.tmpV;let m=null,d=s;for(const g of this.groups)if(g.points.visible)for(let v=0;v<g.count;v++){if(g.sizes[v]===0||!this.eciPosition(g.offset+v,h)||h.lengthSq()<1||(h.project(this.camera),h.z>1))continue;const S=(h.x*.5+.5)*o.width,b=(-h.y*.5+.5)*o.height;if(S<-20||S>o.width+20||b<-20||b>o.height+20)continue;const R=Math.hypot(S-c,b-u);if(R<d){if(this.eciPosition(g.offset+v,h),this.isOccluded(h))continue;d=R,m=g.offset+v}}return m}onPointerDown=t=>{this.downPos={x:t.clientX,y:t.clientY},this.controls.autoRotate=!1};onPointerUp=t=>{if(Math.hypot(t.clientX-this.downPos.x,t.clientY-this.downPos.y)>5)return;const s=this.pick(t.clientX,t.clientY,12);this.cb.onSelect(s)};onPointerMove=t=>{const n=performance.now();if(n-this.lastHoverCheck<120)return;this.lastHoverCheck=n;const s=this.pick(t.clientX,t.clientY,8);s!==this.hoverIdx&&(this.hoverIdx=s,this.renderer.domElement.style.cursor=s!==null?"pointer":"grab"),this.cb.onHover(s,t.clientX,t.clientY)};onContextLost=t=>{t.preventDefault(),this.contextLost=!0,cancelAnimationFrame(this.raf),this.cb.onContextLost()};onContextRestored=()=>{this.contextLost=!1,this.cb.onContextRestored(),this.loop()};onVisibility=()=>{this.hidden=document.hidden,!this.hidden&&!this.contextLost&&!this.disposed&&(cancelAnimationFrame(this.raf),this.loop())};updateSun(t){const n=df(new Date(t)),s=yE(n).rsun,o=Math.sqrt(s.x*s.x+s.y*s.y+s.z*s.z)||1;this.earthMat.uniforms.uSunDir.value.set(s.x/o,s.y/o,s.z/o)}monitorPerf(t){this.fpsCount++,this.fpsWindowStart===0&&(this.fpsWindowStart=t);const n=t-this.fpsWindowStart;if(n>=1e3&&(this.cb.onFps?.(Math.round(this.fpsCount*1e3/n)),this.fpsCount=0,this.fpsWindowStart=t),!this.dprReduced){if(this.lastFrameT&&this.frameTimes.push(t-this.lastFrameT),this.frameTimes.length>=120){const s=this.frameTimes.reduce((o,c)=>o+c,0)/this.frameTimes.length;this.frameTimes.length=0,s>40&&this.qualityCap>1&&(this.dprReduced=!0,this.qualityCap=1,this.applySize())}this.lastFrameT=t}}loop=()=>{if(this.disposed||this.contextLost||this.hidden)return;this.raf=requestAnimationFrame(this.loop);const t=this.cb.getSimTime(),n=t/1e3;this.earth.rotation.z=pf(new Date(t)),this.updateSun(t);const s=Math.min(Math.max(n-this.t0,0),Math.max(this.t1-this.t0,.001));for(const o of this.groups)o.mat.uniforms.uS.value=s;if(this.selected!==null){const o=this.eciPosition(this.selected,this.tmpV);if(o){this.marker.position.copy(o);const u=.045+.01*Math.sin(performance.now()*.005);this.marker.scale.setScalar(u),this.follow&&this.controls.target.lerp(o,.25)}const c=performance.now();if(this.showOrbit&&c-this.lastOrbitReal>400&&Math.abs(t-this.lastOrbitSim)>6e3){const u=this.pastGeo.getAttribute("position"),h=this.futureGeo.getAttribute("position");this.cb.orbitProvider(this.selected,t,u.array,h.array),this.pastGeo.setDrawRange(0,zu),this.futureGeo.setDrawRange(0,zu),u.needsUpdate=!0,h.needsUpdate=!0,this.lastOrbitReal=c,this.lastOrbitSim=t}if(this.showFoot&&c-this.lastFootReal>250){this.lastFootReal=c;const u=this.cb.footprintProvider(this.selected,t);if(u){const h=this.footGeo.getAttribute("position"),m=h.array,d=new et(u.x,u.y,u.z).normalize(),g=Math.abs(d.z)>.9?new et(1,0,0):new et(0,0,1),v=new et().crossVectors(d,g).normalize(),_=new et().crossVectors(d,v).normalize(),S=1.0028,b=Math.cos(u.ang),R=Math.sin(u.ang);for(let x=0;x<=Fu;x++){const y=x/Fu*Math.PI*2,P=Math.cos(y)*R,z=Math.sin(y)*R;m.set([(d.x*b+v.x*P+_.x*z)*S,(d.y*b+v.y*P+_.y*z)*S,(d.z*b+v.z*P+_.z*z)*S],x*3)}this.footGeo.setDrawRange(0,Fu+1),h.needsUpdate=!0}else this.footGeo.setDrawRange(0,0)}}this.controls.update(),this.composer.render(),this.monitorPerf(performance.now())};dispose(){this.disposed=!0,cancelAnimationFrame(this.raf);const t=this.renderer.domElement;t.removeEventListener("pointerdown",this.onPointerDown),t.removeEventListener("pointerup",this.onPointerUp),t.removeEventListener("pointermove",this.onPointerMove),t.removeEventListener("webglcontextlost",this.onContextLost),t.removeEventListener("webglcontextrestored",this.onContextRestored),this.resizeObserver?.disconnect(),document.removeEventListener("visibilitychange",this.onVisibility),this.controls.dispose(),this.disposeGroups(this.groups),this.replacement&&this.disposeGroups(this.replacement),this.groups=[],this.replacement=null,this.scene.traverse(n=>{if(n instanceof Ui||n instanceof lp||n instanceof Au||n instanceof hx){n.geometry?.dispose();const s=n.material;Array.isArray(s)?s.forEach(o=>o.dispose()):s&&(s.map?.dispose(),s.dispose())}});for(const n of this.composer.passes)n.dispose?.();this.composer.dispose(),this.renderer.dispose(),t.remove()}}const ra=[{key:"stations",label:"Space Stations",color:"#ffd166",size:2.6},{key:"gps",label:"GPS",color:"#4ade80",size:1.5},{key:"glonass",label:"GLONASS",color:"#a3e635",size:1.5},{key:"galileo",label:"Galileo",color:"#2dd4bf",size:1.5},{key:"weather",label:"Weather",color:"#f472b6",size:1.5},{key:"oneweb",label:"OneWeb",color:"#a78bfa",size:1.35},{key:"starlink",label:"Starlink",color:"#38bdf8",size:1.15},{key:"brightest",label:"Brightest",color:"#e8eef7",size:1.7},{key:"debris-cosmos",label:"Debris · Cosmos-2251",color:"#fb7185",size:1},{key:"debris-iridium",label:"Debris · Iridium-33",color:"#fb923c",size:1},{key:"debris-fengyun",label:"Debris · Fengyun-1C",color:"#ef4444",size:1},{key:"other",label:"Other Active",color:"#9aa7bd",size:1}],Xi={Stations:0,Gps:1,Glonass:2,Galileo:3,Weather:4,OneWeb:5,Starlink:6,Brightest:7,DebrisCosmos:8,DebrisIridium:9,DebrisFengyun:10,Other:11},vw=["NOAA","GOES","METEOSAT","METOP","FENGYUN","FY-","HIMAWARI","ELECTRO-L","DMSP","GOMS","INSAT","KALPANA","GEO-KOMPSAT","ARSAT"];function xw(a){const t=a.trim().toUpperCase();if(t.includes("ISS")||t.includes("ZARYA")||t.includes("TIANGONG")||t.startsWith("CSS")||t.includes("TIANHE")||t.includes("WENTIAN")||t.includes("MENGTIAN"))return Xi.Stations;if(t.startsWith("GPS ")||t.startsWith("NAVSTAR"))return Xi.Gps;if(t.includes("GLONASS"))return Xi.Glonass;if(t.includes("GALILEO")||t.startsWith("GSAT"))return Xi.Galileo;if(t.startsWith("STARLINK"))return Xi.Starlink;if(t.startsWith("ONEWEB"))return Xi.OneWeb;for(const n of vw)if(t.startsWith(n))return Xi.Weather;return Xi.Other}function yw(a){const t=parseInt(a.substring(18,20),10),n=parseFloat(a.substring(20,32));if(!isFinite(t)||!isFinite(n))return 0;const s=t<57?2e3+t:1900+t;return Date.UTC(s,0,1)+(n-1)*864e5}function _p(a){const t=a.split(/\r?\n/),n=[];let s="",o="";for(const c of t){const u=c.trimEnd();if(u.startsWith("1 ")&&u.length>=60)o=u;else if(u.startsWith("2 ")&&u.length>=60&&o){const h=parseInt(o.substring(2,7),10);isFinite(h)&&n.push({name:(s.trim()||`NORAD ${h}`).replace(/\s+/g," "),norad:h,l1:o,l2:u,epochMs:yw(o)}),s="",o=""}else u.length>0&&!u.startsWith("#")&&(s=u,o="")}return n}function Sw(a){const t=new Map,n=(o,c,u)=>{!u&&t.has(o.norad)||t.set(o.norad,{...o,group:c})};for(const[o,c]of[[a.cosmos2251,Xi.DebrisCosmos],[a.iridium33,Xi.DebrisIridium],[a.fengyun1c,Xi.DebrisFengyun]])if(o)for(const u of _p(o))n(u,c,!1);for(const o of _p(a.active))n(o,xw(o.name),!1);if(a.visual)for(const o of _p(a.visual))n(o,Xi.Brightest,!0);const s=[...t.values()];return s.sort((o,c)=>o.group-c.group),s}const Mw=1e3;function pS(a){if(!a||a.length<1e3)return!1;const t=a.indexOf(`
1 `),n=a.indexOf(`
2 `);return(a.startsWith("1 ")||t>=0)&&n>=0}function bw(a,t,n){const s=new Array(ra.length).fill(0),o=[];for(const u of a)s[u.group]++,u.epochMs>0&&o.push(u.epochMs);o.sort((u,h)=>u-h);const c=o.length?o[Math.floor(o.length/2)]:0;return{sats:a,counts:s,epochMs:c,source:t,fetchedAt:n,total:a.length}}function mS(a){const t=new Date(a),n=s=>String(s).padStart(2,"0");return`${t.getUTCFullYear()}-${n(t.getUTCMonth()+1)}-${n(t.getUTCDate())} ${n(t.getUTCHours())}:${n(t.getUTCMinutes())}:${n(t.getUTCSeconds())} UTC`}function Ew(a){const t=new Date(a),n=s=>String(s).padStart(2,"0");return`${n(t.getUTCHours())}:${n(t.getUTCMinutes())}:${n(t.getUTCSeconds())}`}function Tw(a){const t=new Date(a),n=s=>String(s).padStart(2,"0");return`${t.getUTCFullYear()}-${n(t.getUTCMonth()+1)}-${n(t.getUTCDate())} UTC`}function Aw(){const a=Z.useRef(0),t=Z.useRef(0),n=Z.useRef(!1),s=Z.useRef(1),o=Z.useRef(!0),[c,u]=Z.useState(1),[h,m]=Z.useState(!0),d=Z.useCallback(()=>{n.current||(a.current=Date.now(),t.current=performance.now(),n.current=!0)},[]),g=Z.useCallback(()=>(d(),o.current?a.current+(performance.now()-t.current)*s.current:a.current),[d]),v=Z.useCallback(()=>{a.current=g(),t.current=performance.now()},[g]),_=Z.useCallback(x=>{v(),s.current=x,u(x),o.current||(o.current=!0,m(!0))},[v]),S=Z.useCallback(()=>{o.current&&(a.current=g(),t.current=performance.now(),o.current=!1,m(!1))},[g]),b=Z.useCallback(()=>{o.current||(d(),t.current=performance.now(),o.current=!0,m(!0))},[d]),R=Z.useCallback(()=>{a.current=Date.now(),t.current=performance.now(),n.current=!0,s.current=1,o.current=!0,u(1),m(!0)},[]);return Z.useMemo(()=>({getTime:g,speed:c,playing:h,setSpeed:_,pause:S,resume:b,goNow:R}),[g,c,h,_,S,b,R])}const Rw="leo-live",To="tle";function gS(){return new Promise(a=>{try{const t=indexedDB.open(Rw,1);t.onupgradeneeded=()=>{t.result.objectStoreNames.contains(To)||t.result.createObjectStore(To)},t.onsuccess=()=>a(t.result),t.onerror=()=>a(null)}catch{a(null)}})}async function Cw(a){const t=await gS();return t?new Promise(n=>{try{const o=t.transaction(To,"readonly").objectStore(To).get(a);o.onsuccess=()=>{const c=o.result;n(c&&c.texts&&typeof c.texts.active=="string"&&isFinite(c.fetchedAt)?c:null)},o.onerror=()=>n(null)}catch{n(null)}}):null}async function ww(a){const t=await gS();if(t)return new Promise(n=>{try{const s=t.transaction(To,"readwrite");s.objectStore(To).put(a,a.key),s.oncomplete=()=>n(),s.onerror=()=>n()}catch{n()}})}const Dl="https://celestrak.org/NORAD/elements/gp.php",Ul="./data",Ll=[{key:"active",liveUrl:`${Dl}?GROUP=active&FORMAT=tle`,snapUrl:`${Ul}/tle-snapshot.txt`,required:!0},{key:"visual",liveUrl:`${Dl}?GROUP=visual&FORMAT=tle`,snapUrl:`${Ul}/tle-visual.txt`,required:!1},{key:"cosmos2251",liveUrl:`${Dl}?GROUP=cosmos-2251-debris&FORMAT=tle`,snapUrl:`${Ul}/tle-cosmos-2251-debris.txt`,required:!1},{key:"iridium33",liveUrl:`${Dl}?GROUP=iridium-33-debris&FORMAT=tle`,snapUrl:`${Ul}/tle-iridium-33-debris.txt`,required:!1},{key:"fengyun1c",liveUrl:`${Dl}?GROUP=fengyun-1c-debris&FORMAT=tle`,snapUrl:`${Ul}/tle-fengyun-1c-debris.txt`,required:!1}],ty=2*3600*1e3,ey="bundle-v2";async function ny(a,t){const n=new AbortController,s=setTimeout(()=>n.abort(),t);try{const o=await fetch(a,{signal:n.signal});if(!o.ok)throw new Error(`HTTP ${o.status}`);return await o.text()}finally{clearTimeout(s)}}function Dw(a){if(!pS(a.active))throw new Error("invalid TLE structure");const t=Sw(a),n=t.filter(s=>s.group!==8&&s.group!==9&&s.group!==10).length;if(n<Mw)throw new Error(`too few satellites (${n})`);return t}function Uw(){const[a,t]=Z.useState({status:"loading",dataset:null,error:null}),n=Z.useRef(0),s=Z.useRef(!1),o=Z.useRef(null),c=Z.useCallback(()=>{n.current+=1},[]),u=Z.useCallback((g,v,_)=>{const S=Dw(g);t({status:"ready",dataset:bw(S,v,_),error:null})},[]),h=Z.useCallback(async()=>{if(o.current)return o.current;const g=await Promise.all(Ll.map(async _=>{try{return await ny(_.snapUrl,3e4)}catch(S){if(_.required)throw S;return null}})),v=Object.fromEntries(Ll.map((_,S)=>[_.key,g[S]]));return o.current=v,v},[]),m=Z.useCallback(async()=>{if(s.current)return;s.current=!0;const g=n.current;try{const v=await Promise.allSettled(Ll.map(y=>ny(y.liveUrl,2e4)));if(n.current!==g)return;const S={...o.current??await h()};let b=0;if(v.forEach((y,P)=>{y.status==="fulfilled"&&pS(y.value)&&(S[Ll[P].key]=y.value,b++)}),!(v[0].status==="fulfilled"))return;const x=Date.now();u(S,"live",x),b===Ll.length&&ww({key:ey,texts:S,fetchedAt:x})}catch{}finally{s.current=!1}},[u,h]),d=Z.useCallback(async()=>{const g=++n.current,v=()=>n.current!==g;try{const _=await h();if(v())return;u(_,"snapshot",Date.now())}catch(_){if(v())return;t({status:"error",dataset:null,error:_ instanceof Error?_.message:String(_)})}try{const _=await Cw(ey);if(_&&Date.now()-_.fetchedAt<ty){if(v())return;u(_.texts,"cached",_.fetchedAt)}}catch{}m()},[u,h,m]);return Z.useEffect(()=>{d();const g=setInterval(()=>{m()},ty);return()=>{c(),clearInterval(g)}},[d,m,c]),a}const Lw=12e3;function Nw(a,t,n){const[s,o]=Z.useState(null),c=Z.useRef(null),u=Z.useRef(0),h=Z.useRef(!1),m=Z.useRef(!1),d=Z.useRef(null),g=Z.useRef(null),v=Z.useRef(n.playing);v.current=n.playing;const _=Z.useRef(null),S=Z.useRef(!1),b=Z.useRef(!1),R=Z.useRef(null),x=Z.useRef(n.speed);x.current=n.speed;const y=Z.useCallback(C=>Math.min(Math.max(C*1.5,2),240),[]),P=Z.useCallback((C,L)=>{const D=c.current;if(!D||m.current)return;m.current=!0;const B={type:"propagate",gen:u.current,t0:C,t1:L};D.postMessage(B)},[]),z=Z.useCallback(C=>{if(t.current?.updateInterval(C.t0,C.t1,C.p0,C.v0,C.p1,C.v1),d.current=C.t0,g.current=C.t1,!S.current){S.current=!0,t.current?.revealReplacement();const{p0:L,p1:D}=C,B=[];for(let T=0;T<L.length;T+=3){const N=L[T]===0&&L[T+1]===0&&L[T+2]===0,G=D[T]===0&&D[T+1]===0&&D[T+2]===0;N&&G&&B.push(T/3)}B.length&&t.current?.markDead(B)}},[t]);return Z.useEffect(()=>{if(!a)return;const C=++u.current;h.current=!1,m.current=!1,d.current=null,g.current=null,_.current=null,S.current=!1,b.current=!1;const L=new Worker(new URL(""+new URL("propagator.worker-3-mRdXyn.js",import.meta.url).href,import.meta.url),{type:"module"});c.current=L;const D=T=>{u.current===C&&(m.current=!1,h.current=!1,R.current&&clearTimeout(R.current),o(T))};R.current=setTimeout(()=>D("Propagation worker did not initialize in time"),Lw),L.onmessage=T=>{const N=T.data;if(!(N.gen!==C||u.current!==C)){if(N.type==="ready"){R.current&&clearTimeout(R.current),h.current=!0,o(null);const G=n.getTime(),H=y(Math.abs(x.current))*1e3;x.current<0?P(G-H,G):P(G,G+H);return}if(N.type==="frame"){m.current=!1;const G={t0:N.t0,t1:N.t1,p0:new Float32Array(N.p0),v0:new Float32Array(N.v0),p1:new Float32Array(N.p1),v1:new Float32Array(N.v1)},H=n.getTime(),W=x.current<0?-1:1;g.current===null||(W>0?H>=G.t0:H<=G.t1)?z(G):_.current=G;return}N.type==="failure"&&D(N.message)}},L.onerror=T=>D(T.message||"worker error"),L.onmessageerror=()=>D("worker messageerror");const B={type:"init",gen:C,l1:a.sats.map(T=>T.l1),l2:a.sats.map(T=>T.l2)};return L.postMessage(B),()=>{R.current&&clearTimeout(R.current),L.terminate(),c.current===L&&(c.current=null)}},[a]),Z.useEffect(()=>{const C=setInterval(()=>{if(!h.current||!v.current)return;const L=n.getTime(),D=x.current<0?-1:1,B=_.current;if(B)if(D>0?L>=B.t0:L<=B.t1)_.current=null,z(B);else return;if(m.current)return;const T=y(Math.abs(x.current))*1e3,N=Math.max(T*.35,Math.abs(x.current)*600);if(D>0){const G=g.current;if(G===null||L>G-N){const H=G!==null&&L<=G?G:L;P(H,H+T)}}else{const G=d.current;if(G===null||L<G+N){const H=G!==null&&L>=G?G:L;P(H-T,H)}}},120);return()=>clearInterval(C)},[n,y,P,z]),{degraded:s}}function Pw({total:a}){return St.jsxs("div",{"code-path":"src/components/hud/IdentityBlock.tsx:7:5",className:"pointer-events-none select-none",children:[St.jsxs("h1",{"code-path":"src/components/hud/IdentityBlock.tsx:8:7",className:"font-mono text-sm font-semibold tracking-[0.3em] text-slate-100 md:text-xl md:tracking-[0.34em]",children:[St.jsx("span",{"code-path":"src/components/hud/IdentityBlock.tsx:9:9",className:"logo-o",children:"O"}),"RBIT VEIL"]}),St.jsxs("p",{"code-path":"src/components/hud/IdentityBlock.tsx:11:7",className:"mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400 md:text-[11px] md:tracking-[0.18em]",children:[St.jsxs("span",{"code-path":"src/components/hud/IdentityBlock.tsx:12:9",className:"md:hidden",children:[a.toLocaleString()," objects tracked"]}),St.jsxs("span",{"code-path":"src/components/hud/IdentityBlock.tsx:13:9",className:"max-md:hidden",children:[a.toLocaleString()," objects tracked · TLE @ CelesTrak"]})]})]})}function Ow({clock:a}){const[t,n]=Z.useState({sim:0,wall:0});Z.useEffect(()=>{const c=setInterval(()=>n({sim:a.getTime(),wall:Date.now()}),200);return()=>clearInterval(c)},[a]);const s=t.sim,o=a.playing&&a.speed===1&&s>0&&Math.abs(s-t.wall)<2500;return St.jsxs("div",{"code-path":"src/components/hud/ClockCard.tsx:22:5",className:"pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0e14]/70 px-2.5 py-2 backdrop-blur-xl md:gap-4 md:px-5 md:py-2.5",children:[St.jsx("div",{"code-path":"src/components/hud/ClockCard.tsx:23:7",className:"font-mono text-base font-medium tabular-nums tracking-wider text-slate-100 md:text-2xl",children:s>0?Ew(s):"--:--:--"}),St.jsxs("div",{"code-path":"src/components/hud/ClockCard.tsx:26:7",className:"text-right",children:[St.jsx("div",{"code-path":"src/components/hud/ClockCard.tsx:27:9",className:"font-mono text-[9px] tracking-wider text-slate-400 md:text-[11px]",children:s>0?Tw(s):""}),a.playing?o?St.jsxs("div",{"code-path":"src/components/hud/ClockCard.tsx:39:11",className:"mt-0.5 flex items-center justify-end gap-1.5 font-mono text-[10px] tracking-wider text-emerald-400",children:[St.jsx("span",{"code-path":"src/components/hud/ClockCard.tsx:40:13",className:"inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"}),"LIVE"]}):St.jsxs("div",{"code-path":"src/components/hud/ClockCard.tsx:44:11",className:"mt-0.5 flex items-center justify-end gap-1.5 font-mono text-[10px] tracking-wider text-amber-400",children:[St.jsx("span",{"code-path":"src/components/hud/ClockCard.tsx:45:13",className:"inline-block h-1.5 w-1.5 rounded-full bg-amber-400"}),a.speed>0?"+":"",a.speed,"× TIME"]}):St.jsxs("div",{"code-path":"src/components/hud/ClockCard.tsx:31:11",className:"mt-0.5 flex items-center justify-end gap-1.5 font-mono text-[10px] tracking-wider text-slate-400",children:[St.jsxs("svg",{"code-path":"src/components/hud/ClockCard.tsx:32:13",viewBox:"0 0 10 10",className:"h-2 w-2 fill-current",children:[St.jsx("rect",{"code-path":"src/components/hud/ClockCard.tsx:33:15",x:"1",y:"1",width:"3",height:"8"}),St.jsx("rect",{"code-path":"src/components/hud/ClockCard.tsx:34:15",x:"6",y:"1",width:"3",height:"8"})]}),"PAUSED"]})]})]})}const zw=[-240,-60,-10,10,60,240];function Fw({clock:a}){const t=a.playing&&a.speed===1;return St.jsxs("div",{"code-path":"src/components/hud/TimeController.tsx:12:5",className:"pointer-events-auto flex items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-[#0a0e14]/75 p-1.5 backdrop-blur-xl",children:[zw.map(n=>{const s=a.playing&&a.speed===n;return St.jsx("button",{"code-path":"src/components/hud/TimeController.tsx:16:11",onClick:()=>a.setSpeed(n),className:`min-w-[44px] rounded-full px-2 py-2 font-mono text-[11px] tabular-nums transition-colors md:py-1.5 ${s?"bg-sky-400/25 text-sky-200":"text-slate-400 hover:bg-white/10 hover:text-slate-200"}`,children:n>0?`+${n}×`:`${n}×`},n)}),St.jsx("button",{"code-path":"src/components/hud/TimeController.tsx:29:7",onClick:()=>a.playing?a.pause():a.resume(),title:a.playing?"Pause":"Resume",className:"ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-white/10",children:a.playing?St.jsxs("svg",{"code-path":"src/components/hud/TimeController.tsx:35:11",viewBox:"0 0 12 12",className:"h-3 w-3 fill-current",children:[St.jsx("rect",{"code-path":"src/components/hud/TimeController.tsx:36:13",x:"1.5",y:"1",width:"3.2",height:"10",rx:"0.6"}),St.jsx("rect",{"code-path":"src/components/hud/TimeController.tsx:37:13",x:"7.3",y:"1",width:"3.2",height:"10",rx:"0.6"})]}):St.jsx("svg",{"code-path":"src/components/hud/TimeController.tsx:40:11",viewBox:"0 0 12 12",className:"h-3 w-3 fill-current",children:St.jsx("path",{"code-path":"src/components/hud/TimeController.tsx:41:13",d:"M3 1.4v9.2c0 .8.9 1.3 1.6.9l7-4.6c.6-.4.6-1.4 0-1.8l-7-4.6c-.7-.4-1.6.1-1.6.9z"})})}),St.jsxs("button",{"code-path":"src/components/hud/TimeController.tsx:45:7",onClick:()=>a.goNow(),className:`ml-1 flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[11px] tracking-wider transition-colors md:py-1.5 ${t?"bg-emerald-400 text-emerald-950":"border border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10"}`,children:[St.jsx("span",{"code-path":"src/components/hud/TimeController.tsx:53:9",className:`inline-block h-1.5 w-1.5 rounded-full ${t?"bg-emerald-900":"bg-emerald-400"}`}),"LIVE"]})]})}function iy({counts:a,visible:t,onToggle:n}){return St.jsxs("div",{"code-path":"src/components/hud/LayerPanel.tsx:11:5",className:"pointer-events-auto w-[248px] rounded-xl border border-white/10 bg-[#0a0e14]/70 px-4 py-3.5 backdrop-blur-xl max-md:w-full",children:[St.jsx("div",{"code-path":"src/components/hud/LayerPanel.tsx:12:7",className:"mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500",children:"Layers"}),St.jsx("div",{"code-path":"src/components/hud/LayerPanel.tsx:15:7",className:"space-y-0.5",children:ra.map((s,o)=>St.jsxs("button",{"code-path":"src/components/hud/LayerPanel.tsx:17:11",onClick:()=>n(o),className:`flex min-h-[32px] w-full items-center gap-2.5 rounded-md px-2 py-1 text-left transition-opacity hover:bg-white/[0.05] ${t[o]?"":"opacity-35"}`,children:[St.jsx("span",{"code-path":"src/components/hud/LayerPanel.tsx:24:13",className:"h-[7px] w-[7px] shrink-0 rounded-full",style:{background:s.color,boxShadow:`0 0 5px ${s.color}66`}}),St.jsx("span",{"code-path":"src/components/hud/LayerPanel.tsx:28:13",className:"flex-1 truncate text-xs text-slate-300",children:s.label}),St.jsx("span",{"code-path":"src/components/hud/LayerPanel.tsx:29:13",className:"font-mono text-[11px] tabular-nums text-slate-500",children:(a[o]??0).toLocaleString()})]},s.key))})]})}function Iw(a,t){let n=0;for(const s of a)if(s===t[n]&&n++,n>=t.length)return!0;return!1}function Bw({sats:a,onSelect:t}){const[n,s]=Z.useState(""),[o,c]=Z.useState(!1),u=Z.useRef(null),h=Z.useMemo(()=>{const d=n.trim().toUpperCase();if(d.length<2)return[];const g=[],v=[],_=[],S=[],b=/^\d+$/.test(d);for(let R=0;R<a.length;R++){const x=a[R];if(b){const P=String(x.norad);P===d?g.push(R):P.startsWith(d)&&v.push(R)}const y=x.name.toUpperCase();if(y.includes(d)?_.push(R):!b&&Iw(y,d)&&S.push(R),g.length+v.length+_.length+S.length>=24)break}return[...g,...v,..._,...S].slice(0,8)},[n,a]),m=d=>{t(d),s(""),c(!1),u.current?.blur()};return St.jsxs("div",{"code-path":"src/components/hud/SearchBox.tsx:55:5",className:"pointer-events-auto relative",children:[St.jsxs("svg",{"code-path":"src/components/hud/SearchBox.tsx:56:7",viewBox:"0 0 16 16",className:"pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-slate-500",fill:"none",strokeWidth:"1.6",children:[St.jsx("circle",{"code-path":"src/components/hud/SearchBox.tsx:62:9",cx:"7",cy:"7",r:"5"}),St.jsx("path",{"code-path":"src/components/hud/SearchBox.tsx:63:9",d:"M11 11l3.5 3.5"})]}),St.jsx("input",{"code-path":"src/components/hud/SearchBox.tsx:65:7",ref:u,value:n,onChange:d=>{s(d.target.value),c(!0)},onFocus:()=>c(!0),onKeyDown:d=>{d.key==="Enter"&&h.length>0&&m(h[0]),d.key==="Escape"&&(n?s(""):u.current?.blur(),c(!1))},placeholder:"Search satellite or NORAD id…",className:"w-full rounded-xl border border-white/10 bg-[#0a0e14]/70 py-2.5 pl-9 pr-3 font-mono text-xs text-slate-200 placeholder-slate-500 outline-none backdrop-blur-xl focus:border-sky-400/40"}),o&&h.length>0&&St.jsx("div",{"code-path":"src/components/hud/SearchBox.tsx:85:9",className:"absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f16]/95 backdrop-blur-xl",children:h.map(d=>St.jsxs("button",{"code-path":"src/components/hud/SearchBox.tsx:87:13",onClick:()=>m(d),className:"flex min-h-[36px] w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-sky-400/10",children:[St.jsx("span",{"code-path":"src/components/hud/SearchBox.tsx:92:15",className:"truncate font-mono text-xs text-slate-200",children:a[d].name}),St.jsxs("span",{"code-path":"src/components/hud/SearchBox.tsx:93:15",className:"shrink-0 font-mono text-[10px] tabular-nums text-slate-500",children:["#",a[d].norad]})]},a[d].norad))})]})}function Hw(a){return`${Math.abs(a).toFixed(2)}° ${a>=0?"N":"S"}`}function Gw(a){return`${Math.abs(a).toFixed(2)}° ${a>=0?"E":"W"}`}function Vw({sat:a,telemetry:t,showOrbit:n,showFoot:s,follow:o,onToggleOrbit:c,onToggleFoot:u,onToggleFollow:h,onClose:m}){const d=ra[a.group],g=t?[["Altitude",`${t.alt.toFixed(1)} km`],["Speed",`${t.speed.toFixed(2)} km/s`],["Latitude",Hw(t.lat)],["Longitude",Gw(t.lon)],["Period",`${t.period.toFixed(1)} min`],["Inclination",`${t.incl.toFixed(2)}°`]]:[];return St.jsxs("div",{"code-path":"src/components/hud/DetailPanel.tsx:56:5",className:`pointer-events-auto absolute z-20 rounded-xl border border-white/10 bg-[#0a0e14]/80 backdrop-blur-xl
        max-md:inset-x-3 max-md:bottom-[92px] max-md:max-h-[46vh] max-md:overflow-y-auto
        md:right-7 md:top-1/2 md:w-[300px] md:-translate-y-1/2`,children:[St.jsxs("div",{"code-path":"src/components/hud/DetailPanel.tsx:61:7",className:"flex items-start justify-between gap-2 px-4 pt-4",children:[St.jsxs("div",{"code-path":"src/components/hud/DetailPanel.tsx:62:9",className:"min-w-0",children:[St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:63:11",className:"font-mono text-[10px] uppercase tracking-[0.25em]",style:{color:d?.color??"#9aa7bd"},children:d?.label??"Unknown"}),St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:69:11",className:"mt-1 truncate font-mono text-base font-semibold tracking-wide text-white",children:a.name}),St.jsxs("div",{"code-path":"src/components/hud/DetailPanel.tsx:72:11",className:"mt-0.5 font-mono text-[11px] text-slate-500",children:["NORAD ",a.norad]})]}),St.jsx("button",{"code-path":"src/components/hud/DetailPanel.tsx:76:9",onClick:m,className:"flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/10 hover:text-slate-200","aria-label":"Close",children:St.jsx("svg",{"code-path":"src/components/hud/DetailPanel.tsx:81:11",viewBox:"0 0 10 10",className:"h-2.5 w-2.5 stroke-current",strokeWidth:"1.4",children:St.jsx("path",{"code-path":"src/components/hud/DetailPanel.tsx:82:13",d:"M1 1l8 8M9 1l-8 8"})})})]}),t?St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:88:9",className:"mt-3 grid grid-cols-2 gap-1.5 px-4",children:g.map(([v,_])=>St.jsxs("div",{"code-path":"src/components/hud/DetailPanel.tsx:90:13",className:"rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2",children:[St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:91:15",className:"font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500",children:v}),St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:94:15",className:"mt-0.5 font-mono text-[13px] tabular-nums text-slate-100",children:_})]},v))}):St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:101:9",className:"mt-3 px-4 text-xs text-slate-500",children:"Propagation unavailable for this object."}),St.jsxs("div",{"code-path":"src/components/hud/DetailPanel.tsx:106:7",className:"mt-2 px-4 font-mono text-[10px] tracking-wider text-slate-600",children:["TLE ",a.epochMs?mS(a.epochMs):"unknown"]}),St.jsx("div",{"code-path":"src/components/hud/DetailPanel.tsx:110:7",className:"mt-3 flex gap-1.5 px-4 pb-4",children:[["Orbit",n,c],["Footprint",s,u],["Follow",o,h]].map(([v,_,S])=>St.jsx("button",{"code-path":"src/components/hud/DetailPanel.tsx:118:11",onClick:S,className:`flex-1 rounded-lg border px-2 py-1.5 font-mono text-[10px] tracking-wider transition-colors ${_?"border-sky-400/40 bg-sky-400/15 text-sky-200":"border-white/10 text-slate-400 hover:bg-white/5"}`,children:v},v))})]})}function kw({dataset:a}){const[t,n]=Z.useState([]),[s,o]=Z.useState(0);return Z.useEffect(()=>{if(!a)return;const u=a.sats.filter(d=>d.group===0).map(d=>{try{return{s:d,rec:Dy(d.l1,d.l2)}}catch{return null}}).filter(d=>d!==null),h=()=>{const d=new Date,g=pf(d),v=[];for(const{s:_,rec:S}of u)try{const R=Hu(S,d)?.position;if(!R||!isFinite(R.x))continue;const x=Py(R,g);v.push({name:_.name,norad:_.norad,lat:`${Ly(x.latitude).toFixed(2)}°`,lon:`${Ny(x.longitude).toFixed(2)}°`,alt:`${x.height.toFixed(0)} km`})}catch{}n(v),o(Date.now())};h();const m=setInterval(h,1e3);return()=>clearInterval(m)},[a]),St.jsxs("div",{"code-path":"src/components/FallbackTable.tsx:62:5",className:"mx-auto max-w-3xl px-6 py-10 text-slate-200",children:[St.jsxs("h1",{"code-path":"src/components/FallbackTable.tsx:63:7",className:"font-mono text-xl font-semibold tracking-[0.34em]",children:[St.jsx("span",{"code-path":"src/components/FallbackTable.tsx:63:73",className:"logo-o",children:"O"}),"RBIT VEIL"]}),St.jsx("p",{"code-path":"src/components/FallbackTable.tsx:64:7",className:"mt-1 text-xs text-slate-400",children:"Real-time orbital satellite visualization · CelesTrak TLE × SGP4 propagation"}),St.jsx("div",{"code-path":"src/components/FallbackTable.tsx:67:7",className:"mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200",children:"WebGL is unavailable in this browser, so the interactive 3D globe cannot be shown. Below is a static summary computed from the same TLE data."}),a&&St.jsxs(St.Fragment,{children:[St.jsxs("div",{"code-path":"src/components/FallbackTable.tsx:73:11",className:"mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4",children:[ra.map((c,u)=>St.jsxs("div",{"code-path":"src/components/FallbackTable.tsx:75:15",className:"rounded-lg border border-white/10 px-3 py-2",children:[St.jsx("div",{"code-path":"src/components/FallbackTable.tsx:76:17",className:"text-[11px] text-slate-500",children:c.label}),St.jsx("div",{"code-path":"src/components/FallbackTable.tsx:77:17",className:"text-lg tabular-nums text-slate-100",children:(a.counts[u]??0).toLocaleString()})]},c.key)),St.jsxs("div",{"code-path":"src/components/FallbackTable.tsx:82:13",className:"rounded-lg border border-white/10 px-3 py-2",children:[St.jsx("div",{"code-path":"src/components/FallbackTable.tsx:83:15",className:"text-[11px] text-slate-500",children:"Total objects"}),St.jsx("div",{"code-path":"src/components/FallbackTable.tsx:84:15",className:"text-lg tabular-nums text-slate-100",children:a.total.toLocaleString()})]})]}),St.jsxs("h2",{"code-path":"src/components/FallbackTable.tsx:89:11",className:"mt-8 text-sm font-semibold text-slate-300",children:["Space stations — live position",s>0?` (${mS(s)})`:""]}),St.jsxs("table",{"code-path":"src/components/FallbackTable.tsx:92:11",className:"mt-2 w-full text-xs",children:[St.jsx("thead",{"code-path":"src/components/FallbackTable.tsx:93:13",children:St.jsxs("tr",{"code-path":"src/components/FallbackTable.tsx:94:15",className:"border-b border-white/10 text-left text-slate-500",children:[St.jsx("th",{"code-path":"src/components/FallbackTable.tsx:95:17",className:"py-1.5 pr-4 font-medium",children:"Name"}),St.jsx("th",{"code-path":"src/components/FallbackTable.tsx:96:17",className:"py-1.5 pr-4 font-medium",children:"NORAD"}),St.jsx("th",{"code-path":"src/components/FallbackTable.tsx:97:17",className:"py-1.5 pr-4 font-medium",children:"Lat"}),St.jsx("th",{"code-path":"src/components/FallbackTable.tsx:98:17",className:"py-1.5 pr-4 font-medium",children:"Lon"}),St.jsx("th",{"code-path":"src/components/FallbackTable.tsx:99:17",className:"py-1.5 font-medium",children:"Alt"})]})}),St.jsx("tbody",{"code-path":"src/components/FallbackTable.tsx:102:13",children:t.map(c=>St.jsxs("tr",{"code-path":"src/components/FallbackTable.tsx:104:17",className:"border-b border-white/5",children:[St.jsx("td",{"code-path":"src/components/FallbackTable.tsx:105:19",className:"py-1.5 pr-4",children:c.name}),St.jsxs("td",{"code-path":"src/components/FallbackTable.tsx:106:19",className:"py-1.5 pr-4 tabular-nums text-slate-400",children:["#",c.norad]}),St.jsx("td",{"code-path":"src/components/FallbackTable.tsx:107:19",className:"py-1.5 pr-4 tabular-nums",children:c.lat}),St.jsx("td",{"code-path":"src/components/FallbackTable.tsx:108:19",className:"py-1.5 pr-4 tabular-nums",children:c.lon}),St.jsx("td",{"code-path":"src/components/FallbackTable.tsx:109:19",className:"py-1.5 tabular-nums",children:c.alt})]},c.norad))})]})]})]})}const Nl=6371,ay=[],Xw=[-240,-60,-10,1,10,60,240];function Ww(){try{const a=document.createElement("canvas");return!!(a.getContext("webgl2")||a.getContext("webgl"))}catch{return!1}}function vp(a){const t=new URL(window.location.href);a===null?t.searchParams.delete("sat"):t.searchParams.set("sat",String(a)),window.history.replaceState(null,"",t)}function qw(){const a=Z.useRef(null),t=Z.useRef(null),n=Aw(),{status:s,dataset:o,error:c}=Uw(),[u]=Z.useState(Ww),[h,m]=Z.useState(!1),[d,g]=Z.useState(null),[v,_]=Z.useState(null),[S,b]=Z.useState(null),[R,x]=Z.useState(null),[y,P]=Z.useState(()=>ra.map(()=>!0)),[z,C]=Z.useState(!0),[L,D]=Z.useState(!0),[B,T]=Z.useState(!1),[N,G]=Z.useState(0),[H,W]=Z.useState(!1),lt=Z.useRef(ay),ct=Z.useRef(new Map),J=Z.useRef(new Map),I=Z.useRef(y);I.current=y;const V=Z.useRef(null);V.current=v;const $=Z.useRef(!1),ft=o?.sats??ay,bt=Z.useCallback(Et=>{const Dt=J.current.get(Et);if(Dt)return Dt;const Ut=lt.current[Et];if(!Ut)return null;try{const Yt=Dy(Ut.l1,Ut.l2);return J.current.set(Et,Yt),Yt}catch{return null}},[]),F=Z.useCallback((Et,Dt,Ut,Yt)=>{const It=bt(Et);if(!It)return;const Ht=2*Math.PI/It.no*60*1e3,Wt=Ut.length/3,ae=(oe,ce,me)=>{let ee=0,le=0,_e=0;for(let X=0;X<Wt;X++){const fe=ce+(me-ce)*X/(Wt-1);try{const O=Hu(It,new Date(fe))?.position;O&&isFinite(O.x)&&(ee=O.x/Nl,le=O.y/Nl,_e=O.z/Nl)}catch{}oe.set([ee,le,_e],X*3)}};ae(Ut,Dt-Ht/2,Dt),ae(Yt,Dt,Dt+Ht/2)},[bt]),q=Z.useCallback((Et,Dt)=>{const Ut=bt(Et);if(!Ut)return null;try{const It=Hu(Ut,new Date(Dt))?.position;if(!It||!isFinite(It.x))return null;const Ht=Math.sqrt(It.x*It.x+It.y*It.y+It.z*It.z);return Ht-Nl<50?null:{x:It.x/Ht,y:It.y/Ht,z:It.z/Ht,ang:Math.acos(Nl/Ht)}}catch{return null}},[bt]),vt=Z.useCallback(Et=>{if(Et===null){g(null),_(null),t.current?.setSelected(null),vp(null);return}const Dt=lt.current[Et];Dt&&(I.current[Dt.group]||(P(Ut=>{const Yt=[...Ut];return Yt[Dt.group]=!0,Yt}),t.current?.setGroupVisible(Dt.group,!0)),g(Et),_(Dt.norad),t.current?.setSelected(Et,ra[Dt.group]?.color),vp(Dt.norad))},[]);Z.useEffect(()=>{if(!u||!a.current)return;const Et=new _w(a.current,{getSimTime:n.getTime,onSelect:Dt=>vt(Dt),onHover:(Dt,Ut,Yt)=>x(Dt!==null?{index:Dt,x:Ut,y:Yt}:null),onContextLost:()=>m(!0),onContextRestored:()=>m(!1),onFps:Dt=>G(Dt),orbitProvider:F,footprintProvider:q});return t.current=Et,()=>{Et.dispose(),t.current=null}},[u]),Z.useEffect(()=>{if(!o)return;lt.current=o.sats,J.current.clear();const Et=new Map;o.sats.forEach((Ut,Yt)=>Et.set(Ut.norad,Yt)),ct.current=Et,t.current?.buildSatellites(ra.map((Ut,Yt)=>({color:Ut.color,size:Ut.size,count:o.counts[Yt]}))),I.current.forEach((Ut,Yt)=>t.current?.setGroupVisible(Yt,Ut));const Dt=V.current;if(Dt!==null){const Ut=Et.get(Dt);Ut===void 0?(g(null),_(null),t.current?.setSelected(null),vp(null)):(g(Ut),t.current?.setSelected(Ut,ra[o.sats[Ut].group]?.color))}if(!$.current){$.current=!0;const Ut=new URLSearchParams(window.location.search),Yt=parseInt(Ut.get("speed")??"",10);Xw.includes(Yt)&&n.setSpeed(Yt);const It=Ut.get("sat");if(It){const Ht=Et.get(parseInt(It,10));Ht!==void 0&&vt(Ht)}}},[o]);const{degraded:Ct}=Nw(o,t,n);Z.useEffect(()=>{if(d===null){b(null);return}const Et=()=>{const Ut=bt(d);if(Ut)try{const Yt=n.getTime(),It=Hu(Ut,new Date(Yt)),Ht=It?.position,Wt=It?.velocity;if(!Ht||!Wt||!isFinite(Ht.x))return;const ae=pf(new Date(Yt)),oe=Py(Ht,ae);b({lat:Ly(oe.latitude),lon:Ny(oe.longitude),alt:oe.height,speed:Math.sqrt(Wt.x*Wt.x+Wt.y*Wt.y+Wt.z*Wt.z),period:2*Math.PI/Ut.no,incl:Ut.inclo*180/Math.PI})}catch{}};Et();const Dt=setInterval(Et,250);return()=>clearInterval(Dt)},[d,bt,n]),Z.useEffect(()=>{t.current?.setShowOrbit(z)},[z]),Z.useEffect(()=>{t.current?.setShowFootprint(L)},[L]),Z.useEffect(()=>{t.current?.setFollow(B)},[B]),Z.useEffect(()=>{const Et=Dt=>{Dt.key==="Escape"&&vt(null)};return window.addEventListener("keydown",Et),()=>window.removeEventListener("keydown",Et)},[vt]);const Mt=Et=>{P(Dt=>{const Ut=Dt.map((Yt,It)=>It===Et?!Yt:Yt);return t.current?.setGroupVisible(Et,Ut[Et]),Ut})},K=d!==null&&d<ft.length?ft[d]:null,yt=R?{left:Math.min(R.x+14,window.innerWidth-190),top:Math.min(R.y+14,window.innerHeight-44)}:null,xt=R?lt.current[R.index]:null;return u?St.jsxs("div",{"code-path":"src/pages/Home.tsx:323:5",className:"relative h-full w-full overflow-hidden bg-[#04060a] font-sans text-slate-200",children:[St.jsx("div",{"code-path":"src/pages/Home.tsx:324:7",ref:a,className:"absolute inset-0"}),R&&yt&&xt&&St.jsxs("div",{"code-path":"src/pages/Home.tsx:328:9",className:"pointer-events-none fixed z-30 flex max-w-[180px] items-center gap-1.5 truncate rounded-md border border-white/10 bg-[#0b0f16]/90 px-2.5 py-1 backdrop-blur-sm",style:yt,children:[St.jsx("span",{"code-path":"src/pages/Home.tsx:332:11",className:"h-[6px] w-[6px] shrink-0 rounded-full",style:{background:ra[xt.group]?.color}}),St.jsx("span",{"code-path":"src/pages/Home.tsx:336:11",className:"truncate font-mono text-[11px] text-slate-200",children:xt.name})]}),St.jsx("div",{"code-path":"src/pages/Home.tsx:343:7",className:"absolute left-4 top-4 z-20 md:left-7 md:top-6",children:St.jsx(Pw,{"code-path":"src/pages/Home.tsx:344:9",total:o?.total??0})}),St.jsx("div",{"code-path":"src/pages/Home.tsx:348:7",className:"absolute right-4 top-4 z-20 md:left-1/2 md:right-auto md:top-6 md:-translate-x-1/2",children:St.jsx(Ow,{"code-path":"src/pages/Home.tsx:349:9",clock:n})}),St.jsx("div",{"code-path":"src/pages/Home.tsx:353:7",className:"absolute left-4 right-4 top-[84px] z-20 md:left-auto md:right-7 md:top-6 md:w-[300px]",children:St.jsx(Bw,{"code-path":"src/pages/Home.tsx:354:9",sats:ft,onSelect:vt})}),St.jsx("div",{"code-path":"src/pages/Home.tsx:358:7",className:"absolute bottom-7 left-7 z-20 max-md:hidden",children:St.jsx(iy,{"code-path":"src/pages/Home.tsx:359:9",counts:o?.counts??ra.map(()=>0),visible:y,onToggle:Mt})}),St.jsx("button",{"code-path":"src/pages/Home.tsx:367:7",onClick:()=>W(Et=>!Et),className:"absolute bottom-[92px] left-4 z-20 rounded-full border border-white/10 bg-[#0a0e14]/75 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 backdrop-blur-xl md:hidden",children:"Layers"}),H&&St.jsx("div",{"code-path":"src/pages/Home.tsx:374:9",className:"absolute inset-x-3 bottom-[140px] z-20 md:hidden",children:St.jsx(iy,{"code-path":"src/pages/Home.tsx:375:11",counts:o?.counts??ra.map(()=>0),visible:y,onToggle:Mt})}),St.jsx("div",{"code-path":"src/pages/Home.tsx:384:7",className:"absolute bottom-5 left-1/2 z-20 max-w-[calc(100vw-16px)] -translate-x-1/2 pb-[env(safe-area-inset-bottom)]",children:St.jsx(Fw,{"code-path":"src/pages/Home.tsx:385:9",clock:n})}),St.jsx("div",{"code-path":"src/pages/Home.tsx:389:7",className:"pointer-events-none absolute bottom-1.5 left-7 z-10 hidden font-mono text-[10px] tracking-wider text-slate-600 md:block",children:"TLE CelesTrak · SGP4 satellite.js · Imagery NASA Blue Marble"}),St.jsxs("div",{"code-path":"src/pages/Home.tsx:392:7",className:"pointer-events-none absolute bottom-1.5 right-7 z-10 hidden font-mono text-[10px] tabular-nums tracking-wider text-slate-600 md:block",children:[N," fps"]}),K&&St.jsx(Vw,{"code-path":"src/pages/Home.tsx:398:9",sat:K,telemetry:S,showOrbit:z,showFoot:L,follow:B,onToggleOrbit:()=>C(Et=>!Et),onToggleFoot:()=>D(Et=>!Et),onToggleFollow:()=>T(Et=>!Et),onClose:()=>vt(null)}),Ct&&St.jsxs("div",{"code-path":"src/pages/Home.tsx:412:9",className:"absolute bottom-[92px] right-4 z-20 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-200",children:["Live propagation degraded: ",Ct]}),h&&St.jsx("div",{"code-path":"src/pages/Home.tsx:418:9",className:"absolute inset-0 z-40 flex items-center justify-center bg-[#04060a]/90",children:St.jsxs("div",{"code-path":"src/pages/Home.tsx:419:11",className:"rounded-2xl border border-white/10 bg-[#0a0e14] px-6 py-5 text-center",children:[St.jsx("div",{"code-path":"src/pages/Home.tsx:420:13",className:"text-sm text-slate-200",children:"Graphics context lost"}),St.jsx("button",{"code-path":"src/pages/Home.tsx:421:13",onClick:()=>window.location.reload(),className:"mt-3 rounded-lg border border-sky-400/40 px-3 py-1 text-xs text-sky-200 hover:bg-sky-400/10",children:"Reload"})]})}),s==="loading"&&St.jsxs("div",{"code-path":"src/pages/Home.tsx:432:9",className:"absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#04060a]",children:[St.jsxs("div",{"code-path":"src/pages/Home.tsx:433:11",className:"font-mono text-xl font-semibold tracking-[0.34em] text-white",children:[St.jsx("span",{"code-path":"src/pages/Home.tsx:434:13",className:"logo-o",children:"O"}),"RBIT VEIL"]}),St.jsx("div",{"code-path":"src/pages/Home.tsx:436:11",className:"mt-6 h-7 w-7 animate-spin rounded-full border-2 border-sky-400/25 border-t-sky-300"}),St.jsx("div",{"code-path":"src/pages/Home.tsx:437:11",className:"mt-4 font-mono text-xs text-slate-500",children:"Loading orbital data…"})]}),s==="error"&&!o&&St.jsxs("div",{"code-path":"src/pages/Home.tsx:442:9",className:"absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#04060a]",children:[St.jsxs("div",{"code-path":"src/pages/Home.tsx:443:11",className:"font-mono text-xl font-semibold tracking-[0.34em] text-white",children:[St.jsx("span",{"code-path":"src/pages/Home.tsx:444:13",className:"logo-o",children:"O"}),"RBIT VEIL"]}),St.jsxs("div",{"code-path":"src/pages/Home.tsx:446:11",className:"mt-6 max-w-sm text-center text-sm text-rose-300",children:["Failed to load orbital data",c?`: ${c}`:"."]}),St.jsx("button",{"code-path":"src/pages/Home.tsx:449:11",onClick:()=>window.location.reload(),className:"mt-4 rounded-lg border border-rose-400/40 px-3 py-1 text-xs text-rose-200 hover:bg-rose-400/10",children:"Retry"})]})]}):St.jsx("div",{"code-path":"src/pages/Home.tsx:316:7",className:"h-full w-full overflow-y-auto bg-[#04060a]",children:St.jsx(kw,{"code-path":"src/pages/Home.tsx:317:9",dataset:o})})}function Yw(){return St.jsx(C1,{"code-path":"src/App.tsx:6:5",children:St.jsx(Ey,{"code-path":"src/App.tsx:7:7",path:"*",element:St.jsx(qw,{"code-path":"src/App.tsx:7:32"})})})}Cb.createRoot(document.getElementById("root")).render(St.jsx(Z.StrictMode,{"code-path":"src/main.tsx:8:3",children:St.jsx(J1,{"code-path":"src/main.tsx:9:5",children:St.jsx(Yw,{"code-path":"src/main.tsx:10:7"})})}));
